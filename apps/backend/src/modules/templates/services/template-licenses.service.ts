import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TemplatesRepository } from '../templates.repository';
import { CreateTemplateLicenseDto } from '../dto/create-template-license.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class TemplateLicensesService {
  private readonly logger = new Logger(TemplateLicensesService.name);

  constructor(private readonly repository: TemplatesRepository) {}

  generateLicenseKey(): string {
    const segments = [];
    for (let i = 0; i < 4; i++) {
      segments.push(randomBytes(4).toString('hex').toUpperCase());
    }
    return `KTB-${segments.join('-')}`;
  }

  async findByTemplate(templateId: string) {
    const licenses = await this.repository.findLicensesByTemplate(templateId);
    return {
      status: 'success',
      message: 'Licenses retrieved successfully',
      data: licenses,
    };
  }

  async findByUser(userId: string) {
    const licenses = await this.repository.findLicensesByUser(userId);
    return {
      status: 'success',
      message: 'User licenses retrieved successfully',
      data: licenses,
    };
  }

  async create(dto: CreateTemplateLicenseDto) {
    const licenseKey = this.generateLicenseKey();
    const maxActivations = dto.maxActivations || this.getDefaultMaxActivations(dto.licenseType);

    const license = await this.repository.createLicense({
      ...dto,
      licenseKey,
      maxActivations,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });

    this.logger.log(`License created: ${licenseKey} for template ${dto.templateId}`);

    return {
      status: 'success',
      message: 'License created successfully',
      data: license,
    };
  }

  async validate(licenseKey: string) {
    const license = await this.repository.findLicenseByKey(licenseKey);
    if (!license) {
      throw new NotFoundException('License not found');
    }

    const isValid =
      license.isActive &&
      license.activationCount < license.maxActivations &&
      (!license.expiresAt || new Date(license.expiresAt) > new Date());

    return {
      status: 'success',
      message: isValid ? 'License is valid' : 'License is not valid',
      data: {
        isValid,
        license,
        reason: !license.isActive
          ? 'License is deactivated'
          : license.activationCount >= license.maxActivations
            ? 'Maximum activations reached'
            : license.expiresAt && new Date(license.expiresAt) <= new Date()
              ? 'License has expired'
              : null,
      },
    };
  }

  async activate(licenseKey: string) {
    const license = await this.repository.findLicenseByKey(licenseKey);
    if (!license) {
      throw new NotFoundException('License not found');
    }

    if (!license.isActive) {
      throw new BadRequestException('License is deactivated');
    }

    if (license.activationCount >= license.maxActivations) {
      throw new BadRequestException('Maximum activations reached');
    }

    if (license.expiresAt && new Date(license.expiresAt) <= new Date()) {
      throw new BadRequestException('License has expired');
    }

    const updated = await this.repository.updateLicense(license.id, {
      activationCount: license.activationCount + 1,
    } as any);

    return {
      status: 'success',
      message: 'License activated successfully',
      data: updated,
    };
  }

  async deactivate(id: string) {
    const updated = await this.repository.updateLicense(id, { isActive: false } as any);
    if (!updated) {
      throw new NotFoundException('License not found');
    }

    return {
      status: 'success',
      message: 'License deactivated successfully',
      data: updated,
    };
  }

  private getDefaultMaxActivations(licenseType: string): number {
    switch (licenseType) {
      case 'SINGLE_USE':
        return 1;
      case 'MULTI_USE':
        return 5;
      case 'EXTENDED':
        return 25;
      case 'UNLIMITED':
        return 999;
      default:
        return 1;
    }
  }
}
