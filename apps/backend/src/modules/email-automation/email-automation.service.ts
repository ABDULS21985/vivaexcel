import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  LessThanOrEqual,
  In,
} from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { EmailSequence } from './entities/email-sequence.entity';
import { EmailSequenceEnrollment } from './entities/email-sequence-enrollment.entity';
import {
  EmailSequenceTrigger,
  EnrollmentStatus,
} from './enums/email-automation.enums';
import { EmailSequenceStep } from './interfaces/email-sequence-step.interface';
import { CreateSequenceDto } from './dto/create-sequence.dto';
import { UpdateSequenceDto } from './dto/update-sequence.dto';
import { EnrollmentQueryDto } from './dto/enrollment-query.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class EmailAutomationService {
  private readonly logger = new Logger(EmailAutomationService.name);

  constructor(
    @InjectRepository(EmailSequence)
    private readonly sequenceRepository: Repository<EmailSequence>,
    @InjectRepository(EmailSequenceEnrollment)
    private readonly enrollmentRepository: Repository<EmailSequenceEnrollment>,
    private readonly emailService: EmailService,
  ) {}

  // ──────────────────────────────────────────────
  //  Enrollment
  // ────────────────────────────────────────────────

  /**
   * Enroll a user in an email sequence matching the given trigger.
   * Returns the enrollment if created, or null if no active sequence exists
   * or the user is already enrolled.
   */
  async enrollInSequence(
    userId: string,
    trigger: EmailSequenceTrigger,
    metadata?: Record<string, unknown>,
  ): Promise<EmailSequenceEnrollment | null> {
    // Find active sequence for this trigger
    const sequence = await this.sequenceRepository.findOne({
      where: { trigger, isActive: true },
    });

    if (!sequence) {
      this.logger.debug(
        `No active sequence found for trigger "${trigger}"`,
      );
      return null;
    }

    // Check if user is already enrolled and active in this sequence
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        sequenceId: sequence.id,
        userId,
        status: In([EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED]),
      },
    });

    if (existingEnrollment) {
      this.logger.debug(
        `User ${userId} already enrolled in sequence "${sequence.name}" (enrollment ${existingEnrollment.id})`,
      );
      return existingEnrollment;
    }

    // Determine the first step delay
    const firstStep = this.getStepByNumber(sequence.steps, 1);
    const now = new Date();
    const nextStepAt = firstStep
      ? this.calculateNextStepAt(now, firstStep)
      : null;

    const enrollment = this.enrollmentRepository.create({
      sequenceId: sequence.id,
      userId,
      currentStep: 0,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: now,
      lastStepSentAt: null,
      nextStepAt,
      completedAt: null,
      metadata: metadata ?? {},
    });

    const saved = await this.enrollmentRepository.save(enrollment);
    this.logger.log(
      `User ${userId} enrolled in sequence "${sequence.name}" (trigger: ${trigger}), enrollment ${saved.id}`,
    );

    return saved;
  }

  // ──────────────────────────────────────────────
  //  CRON: Process sequence steps
  // ──────────────────────────────────────────────

  /**
   * Runs every 5 minutes. Finds active enrollments whose next step is due
   * and processes them: evaluates conditions, sends emails, and advances
   * the enrollment to the next step or marks it completed.
   */
  @Cron('*/5 * * * *')
  async processSequenceSteps(): Promise<void> {
    const now = new Date();

    let enrollments: EmailSequenceEnrollment[];
    try {
      enrollments = await this.enrollmentRepository.find({
        where: {
          status: EnrollmentStatus.ACTIVE,
          nextStepAt: LessThanOrEqual(now),
        },
        relations: ['sequence'],
      });
    } catch (error) {
      this.logger.error(
        'Failed to fetch due enrollments for processing',
        error instanceof Error ? error.stack : String(error),
      );
      return;
    }

    if (enrollments.length === 0) {
      return;
    }

    this.logger.log(
      `Processing ${enrollments.length} due enrollment(s)`,
    );

    for (const enrollment of enrollments) {
      try {
        await this.processOneEnrollment(enrollment, now);
      } catch (error) {
        this.logger.error(
          `Error processing enrollment ${enrollment.id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }

  /**
   * Process a single enrollment step.
   */
  private async processOneEnrollment(
    enrollment: EmailSequenceEnrollment,
    now: Date,
  ): Promise<void> {
    const sequence = enrollment.sequence;
    if (!sequence || !sequence.isActive) {
      this.logger.warn(
        `Sequence for enrollment ${enrollment.id} is missing or inactive, skipping`,
      );
      return;
    }

    const nextStepNumber = enrollment.currentStep + 1;
    const step = this.getStepByNumber(sequence.steps, nextStepNumber);

    if (!step) {
      // No more steps — mark as completed
      await this.enrollmentRepository.update(enrollment.id, {
        status: EnrollmentStatus.COMPLETED,
        completedAt: now,
        nextStepAt: null,
      });
      this.logger.log(
        `Enrollment ${enrollment.id} completed (no step ${nextStepNumber} found)`,
      );
      return;
    }

    // Evaluate condition (if present)
    if (step.condition) {
      const conditionMet = await this.evaluateCondition(
        step.condition,
        enrollment.userId,
        enrollment.metadata,
      );

      if (conditionMet) {
        // Condition IS met, meaning the user did the action we wanted to prevent
        // (e.g., 'has_not_purchased' returns true if user HAS purchased)
        // Skip this step — advance to the next one or complete
        this.logger.debug(
          `Condition "${step.condition}" met for enrollment ${enrollment.id}, skipping step ${nextStepNumber}`,
        );

        const followingStep = this.getStepByNumber(
          sequence.steps,
          nextStepNumber + 1,
        );

        if (followingStep) {
          await this.enrollmentRepository.update(enrollment.id, {
            currentStep: nextStepNumber,
            nextStepAt: this.calculateNextStepAt(now, followingStep),
          });
        } else {
          await this.enrollmentRepository.update(enrollment.id, {
            currentStep: nextStepNumber,
            status: EnrollmentStatus.COMPLETED,
            completedAt: now,
            nextStepAt: null,
          });
          this.logger.log(
            `Enrollment ${enrollment.id} completed after skipping final step`,
          );
        }
        return;
      }
    }

    // Send the email
    const emailSent = await this.emailService.sendNotification(
      enrollment.userId, // This is the user ID; we pass it because sendMail template resolves to user email in real impl
      step.subject,
      `Template: ${step.templateName}`, // Content fallback — in production you'd use template-based sendMail
    );

    if (!emailSent) {
      this.logger.warn(
        `Failed to send email for enrollment ${enrollment.id}, step ${nextStepNumber}. Will retry on next cycle.`,
      );
      return;
    }

    // Advance the enrollment
    const followingStep = this.getStepByNumber(
      sequence.steps,
      nextStepNumber + 1,
    );

    if (followingStep) {
      await this.enrollmentRepository.update(enrollment.id, {
        currentStep: nextStepNumber,
        lastStepSentAt: now,
        nextStepAt: this.calculateNextStepAt(now, followingStep),
      });
      this.logger.debug(
        `Enrollment ${enrollment.id}: sent step ${nextStepNumber}, next step at ${this.calculateNextStepAt(now, followingStep).toISOString()}`,
      );
    } else {
      // Last step — mark completed
      await this.enrollmentRepository.update(enrollment.id, {
        currentStep: nextStepNumber,
        lastStepSentAt: now,
        status: EnrollmentStatus.COMPLETED,
        completedAt: now,
        nextStepAt: null,
      });
      this.logger.log(
        `Enrollment ${enrollment.id} completed after sending final step ${nextStepNumber}`,
      );
    }
  }

  // ──────────────────────────────────────────────
  //  Cancel / Pause / Resume
  // ──────────────────────────────────────────────

  async cancelSequenceEnrollment(
    userId: string,
    sequenceId: string,
  ): Promise<EmailSequenceEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        sequenceId,
        userId,
        status: In([EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED]),
      },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `No active enrollment found for user ${userId} in sequence ${sequenceId}`,
      );
    }

    enrollment.status = EnrollmentStatus.CANCELED;
    enrollment.nextStepAt = null;

    const saved = await this.enrollmentRepository.save(enrollment);
    this.logger.log(
      `Enrollment ${saved.id} canceled for user ${userId}`,
    );
    return saved;
  }

  async cancelSequenceByTrigger(
    userId: string,
    trigger: EmailSequenceTrigger,
  ): Promise<number> {
    // Find all active sequences for this trigger
    const sequences = await this.sequenceRepository.find({
      where: { trigger },
    });

    if (sequences.length === 0) {
      return 0;
    }

    const sequenceIds = sequences.map((s) => s.id);

    const result = await this.enrollmentRepository.update(
      {
        userId,
        sequenceId: In(sequenceIds),
        status: In([EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED]),
      },
      {
        status: EnrollmentStatus.CANCELED,
        nextStepAt: null,
      },
    );

    const affected = result.affected ?? 0;
    if (affected > 0) {
      this.logger.log(
        `Canceled ${affected} enrollment(s) for user ${userId} with trigger "${trigger}"`,
      );
    }
    return affected;
  }

  async pauseSequenceEnrollment(
    enrollmentId: string,
  ): Promise<EmailSequenceEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId, status: EnrollmentStatus.ACTIVE },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Active enrollment ${enrollmentId} not found`,
      );
    }

    enrollment.status = EnrollmentStatus.PAUSED;
    // Keep nextStepAt so we can recalculate on resume

    const saved = await this.enrollmentRepository.save(enrollment);
    this.logger.log(`Enrollment ${saved.id} paused`);
    return saved;
  }

  async resumeSequenceEnrollment(
    enrollmentId: string,
  ): Promise<EmailSequenceEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId, status: EnrollmentStatus.PAUSED },
      relations: ['sequence'],
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Paused enrollment ${enrollmentId} not found`,
      );
    }

    const sequence = enrollment.sequence;
    if (!sequence) {
      throw new NotFoundException(
        `Sequence for enrollment ${enrollmentId} not found`,
      );
    }

    // Recalculate nextStepAt based on the next step's delay
    const nextStepNumber = enrollment.currentStep + 1;
    const nextStep = this.getStepByNumber(sequence.steps, nextStepNumber);
    const now = new Date();

    enrollment.status = EnrollmentStatus.ACTIVE;
    enrollment.nextStepAt = nextStep
      ? this.calculateNextStepAt(now, nextStep)
      : null;

    // If there is no next step, mark completed
    if (!nextStep) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completedAt = now;
    }

    const saved = await this.enrollmentRepository.save(enrollment);
    this.logger.log(
      `Enrollment ${saved.id} resumed (status: ${saved.status})`,
    );
    return saved;
  }

  // ──────────────────────────────────────────────
  //  Sequence CRUD (admin)
  // ──────────────────────────────────────────────

  async getSequences(): Promise<EmailSequence[]> {
    return this.sequenceRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getSequenceById(id: string): Promise<EmailSequence> {
    const sequence = await this.sequenceRepository.findOne({
      where: { id },
      relations: ['enrollments'],
    });

    if (!sequence) {
      throw new NotFoundException(`Sequence with ID "${id}" not found`);
    }

    return sequence;
  }

  async createSequence(dto: CreateSequenceDto): Promise<EmailSequence> {
    // Check for existing active sequence with the same trigger
    const existing = await this.sequenceRepository.findOne({
      where: { trigger: dto.trigger, isActive: true },
    });

    if (existing) {
      throw new ConflictException(
        `An active sequence already exists for trigger "${dto.trigger}". Deactivate it first or update it.`,
      );
    }

    const sequence = this.sequenceRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      trigger: dto.trigger,
      steps: dto.steps,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.sequenceRepository.save(sequence);
    this.logger.log(
      `Sequence "${saved.name}" created (trigger: ${saved.trigger})`,
    );
    return saved;
  }

  async updateSequence(
    id: string,
    dto: UpdateSequenceDto,
  ): Promise<EmailSequence> {
    const sequence = await this.sequenceRepository.findOne({
      where: { id },
    });

    if (!sequence) {
      throw new NotFoundException(`Sequence with ID "${id}" not found`);
    }

    // If changing trigger and activating, check for conflicts
    if (
      dto.trigger &&
      dto.trigger !== sequence.trigger &&
      (dto.isActive ?? sequence.isActive)
    ) {
      const conflicting = await this.sequenceRepository.findOne({
        where: { trigger: dto.trigger, isActive: true },
      });

      if (conflicting && conflicting.id !== id) {
        throw new ConflictException(
          `An active sequence already exists for trigger "${dto.trigger}"`,
        );
      }
    }

    Object.assign(sequence, dto);
    const saved = await this.sequenceRepository.save(sequence);
    this.logger.log(`Sequence "${saved.name}" updated`);
    return saved;
  }

  async deleteSequence(id: string): Promise<void> {
    const sequence = await this.sequenceRepository.findOne({
      where: { id },
    });

    if (!sequence) {
      throw new NotFoundException(`Sequence with ID "${id}" not found`);
    }

    await this.sequenceRepository.softDelete(id);
    this.logger.log(
      `Sequence "${sequence.name}" soft-deleted`,
    );
  }

  // ──────────────────────────────────────────────
  //  Enrollment queries
  // ──────────────────────────────────────────────

  async getEnrollments(
    query: EnrollmentQueryDto,
  ): Promise<{ data: EmailSequenceEnrollment[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.sequenceId) {
      where.sequenceId = query.sequenceId;
    }
    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await this.enrollmentRepository.findAndCount({
      where,
      relations: ['sequence'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total };
  }

  async getUserEnrollments(
    userId: string,
  ): Promise<EmailSequenceEnrollment[]> {
    return this.enrollmentRepository.find({
      where: { userId },
      relations: ['sequence'],
      order: { createdAt: 'DESC' },
    });
  }

  // ──────────────────────────────────────────────
  //  Admin enrollment actions
  // ──────────────────────────────────────────────

  async cancelEnrollmentById(
    enrollmentId: string,
  ): Promise<EmailSequenceEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment ${enrollmentId} not found`,
      );
    }

    if (
      enrollment.status === EnrollmentStatus.COMPLETED ||
      enrollment.status === EnrollmentStatus.CANCELED
    ) {
      throw new ConflictException(
        `Enrollment ${enrollmentId} is already ${enrollment.status}`,
      );
    }

    enrollment.status = EnrollmentStatus.CANCELED;
    enrollment.nextStepAt = null;

    const saved = await this.enrollmentRepository.save(enrollment);
    this.logger.log(`Enrollment ${saved.id} canceled by admin`);
    return saved;
  }

  async cancelUserEnrollmentById(
    userId: string,
    enrollmentId: string,
  ): Promise<EmailSequenceEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId, userId },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment ${enrollmentId} not found for your account`,
      );
    }

    if (
      enrollment.status === EnrollmentStatus.COMPLETED ||
      enrollment.status === EnrollmentStatus.CANCELED
    ) {
      throw new ConflictException(
        `Enrollment is already ${enrollment.status}`,
      );
    }

    enrollment.status = EnrollmentStatus.CANCELED;
    enrollment.nextStepAt = null;

    const saved = await this.enrollmentRepository.save(enrollment);
    this.logger.log(
      `Enrollment ${saved.id} canceled by user ${userId}`,
    );
    return saved;
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  /**
   * Evaluate a condition string. Returns `true` when the skip-condition
   * is satisfied (i.e., the user already performed the action, so the step
   * should be skipped).
   *
   * For example:
   * - 'has_not_purchased' => returns true if user HAS purchased (skip the reminder)
   * - 'has_not_reviewed'  => returns true if user HAS reviewed
   *
   * In a production system these would query real tables; here we provide
   * a pluggable structure that always returns false (never skip) for
   * unknown conditions.
   */
  private async evaluateCondition(
    condition: string,
    _userId: string,
    _metadata: Record<string, unknown>,
  ): Promise<boolean> {
    switch (condition) {
      case 'has_not_purchased':
        // In production: check if user has completed an order since enrollment
        // const orderCount = await this.orderRepository.count({ where: { userId, status: 'completed' } });
        // return orderCount > 0; // true => user purchased => skip the reminder
        return false;

      case 'has_not_reviewed':
        // In production: check if user has submitted a review
        // const reviewCount = await this.reviewRepository.count({ where: { userId } });
        // return reviewCount > 0;
        return false;

      case 'has_not_logged_in':
        // In production: check last login timestamp
        return false;

      case 'cart_still_abandoned':
        // In production: check if the cart still has items
        return false;

      default:
        this.logger.warn(
          `Unknown condition "${condition}", defaulting to false (will not skip)`,
        );
        return false;
    }
  }

  /**
   * Find a step by its stepNumber from an array of steps.
   */
  private getStepByNumber(
    steps: EmailSequenceStep[],
    stepNumber: number,
  ): EmailSequenceStep | undefined {
    return steps.find((s) => s.stepNumber === stepNumber);
  }

  /**
   * Calculate the timestamp at which the next step should fire,
   * based on the step's delayMinutes relative to a reference time.
   */
  private calculateNextStepAt(
    referenceTime: Date,
    step: EmailSequenceStep,
  ): Date {
    return new Date(
      referenceTime.getTime() + step.delayMinutes * 60 * 1000,
    );
  }
}
