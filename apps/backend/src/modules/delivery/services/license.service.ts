import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DeliveryRepository } from '../delivery.repository';
import { CacheService } from '../../../common/cache/cache.service';
import { License, LicenseType, LicenseStatus } from '../../../entities/license.entity';
import { LicenseActivation } from '../../../entities/license-activation.entity';
import { ApiResponse } from '../../../common/interfaces/response.interface';

// Cache constants
const CACHE_TTL_LICENSE = 600; // 10 minutes
const CACHE_TAG = 'delivery-licenses';

// Max activations by license type
const MAX_ACTIVATIONS_MAP: Record<LicenseType, number> = {
  [LicenseType.PERSONAL]: 1,
  [LicenseType.COMMERCIAL]: 3,
  [LicenseType.EXTENDED]: 10,
  [LicenseType.ENTERPRISE]: 25,
  [LicenseType.UNLIMITED]: 999,
};

@Injectable()
export class LicenseService {
  private readonly logger = new Logger(LicenseService.name);

  constructor(
    private readonly repository: DeliveryRepository,
    private readonly cacheService: CacheService,
  ) {}

  // ──────────────────────────────────────────────
  //  Generate license for a purchased product
  // ──────────────────────────────────────────────

  async generateLicense(
    userId: string,
    productId: string,
    orderId: string,
    licenseType: LicenseType,
  ): Promise<ApiResponse<License>> {
    this.logger.log(
      `Generating ${licenseType} license for user ${userId}, product ${productId}, order ${orderId}`,
    );

    // Check if user already has a license for this product
    const existing = await this.repository.findLicenseByUserAndProduct(userId, productId);
    if (existing) {
      this.logger.warn(
        `User ${userId} already has a license for product ${productId}: ${existing.licenseKey}`,
      );
      return {
        status: 'success',
        message: 'User already has a license for this product',
        data: existing,
      };
    }

    // Verify product exists
    const product = await this.repository.findDigitalProductById(productId);
    if (!product) {
      throw new NotFoundException(`Digital product with ID "${productId}" not found`);
    }

    // Determine maxActivations based on licenseType
    const maxActivations = MAX_ACTIVATIONS_MAP[licenseType];

    const license = await this.repository.createLicense({
      userId,
      digitalProductId: productId,
      orderId,
      licenseType,
      status: LicenseStatus.ACTIVE,
      maxActivations,
      activationCount: 0,
      activatedDomains: [],
    });

    // Invalidate cache
    await this.cacheService.invalidateByTags([CACHE_TAG, `${CACHE_TAG}:user:${userId}`]);
    this.logger.log(`License generated: ${license.licenseKey} (type: ${licenseType})`);

    return {
      status: 'success',
      message: 'License generated successfully',
      data: license,
    };
  }

  // ──────────────────────────────────────────────
  //  Validate license (public API)
  // ──────────────────────────────────────────────

  async validateLicense(
    licenseKey: string,
    domain?: string,
  ): Promise<{ valid: boolean; product?: string; type?: string; features?: string[] }> {
    this.logger.debug(`Validating license: ${licenseKey}, domain: ${domain ?? 'none'}`);

    const cacheKey = this.cacheService.generateKey('license', 'validate', licenseKey, domain ?? 'no-domain');

    return this.cacheService.wrap(
      cacheKey,
      async () => {
        const license = await this.repository.findLicenseByKey(licenseKey);

        if (!license) {
          return { valid: false };
        }

        // Check status is ACTIVE
        if (license.status !== LicenseStatus.ACTIVE) {
          return {
            valid: false,
            product: license.digitalProduct?.title,
            type: license.licenseType,
          };
        }

        // Check not expired
        if (license.expiresAt && new Date() > license.expiresAt) {
          return {
            valid: false,
            product: license.digitalProduct?.title,
            type: license.licenseType,
          };
        }

        // If domain provided, check if domain is in activatedDomains
        if (domain) {
          const isDomainActivated =
            license.activatedDomains && license.activatedDomains.includes(domain);
          if (!isDomainActivated) {
            return {
              valid: false,
              product: license.digitalProduct?.title,
              type: license.licenseType,
            };
          }
        }

        // Derive features based on license type
        const features = this.getLicenseFeatures(license.licenseType);

        return {
          valid: true,
          product: license.digitalProduct?.title,
          type: license.licenseType,
          features,
        };
      },
      { ttl: 60, tags: [CACHE_TAG, `${CACHE_TAG}:key:${licenseKey}`] },
    );
  }

  // ──────────────────────────────────────────────
  //  Activate license on a domain/machine
  // ──────────────────────────────────────────────

  async activateLicense(
    licenseKey: string,
    domain?: string,
    machineId?: string,
    ipAddress?: string,
  ): Promise<ApiResponse<LicenseActivation>> {
    this.logger.log(
      `Activating license: ${licenseKey}, domain: ${domain ?? 'none'}, machine: ${machineId ?? 'none'}`,
    );

    // Find license, check ACTIVE status
    const license = await this.repository.findLicenseByKey(licenseKey);
    if (!license) {
      throw new NotFoundException('License not found');
    }

    if (license.status !== LicenseStatus.ACTIVE) {
      throw new BadRequestException(`License is not active. Current status: ${license.status}`);
    }

    // Check not expired
    if (license.expiresAt && new Date() > license.expiresAt) {
      throw new BadRequestException('License has expired');
    }

    // Check activationCount < maxActivations
    if (license.activationCount >= license.maxActivations) {
      throw new BadRequestException(
        `Maximum activations reached (${license.maxActivations}). Please deactivate an existing activation first.`,
      );
    }

    // If domain, check not already activated for this domain
    if (domain) {
      const existingActivation = await this.repository.findActivationByDomain(
        license.id,
        domain,
      );
      if (existingActivation) {
        throw new ConflictException(
          `License is already activated for domain: ${domain}`,
        );
      }
    }

    // Create activation record
    const activation = await this.repository.createActivation({
      licenseId: license.id,
      domain,
      machineId,
      ipAddress: ipAddress ?? '0.0.0.0',
      activatedAt: new Date(),
      isActive: true,
    });

    // Increment activationCount
    const newActivationCount = license.activationCount + 1;

    // Add domain to activatedDomains array
    const updatedDomains = [...(license.activatedDomains ?? [])];
    if (domain && !updatedDomains.includes(domain)) {
      updatedDomains.push(domain);
    }

    await this.repository.updateLicense(license.id, {
      activationCount: newActivationCount,
      activatedDomains: updatedDomains,
    });

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `${CACHE_TAG}:key:${licenseKey}`,
      `${CACHE_TAG}:user:${license.userId}`,
    ]);

    this.logger.log(
      `License ${licenseKey} activated on ${domain ?? machineId ?? 'unknown'}. Activations: ${newActivationCount}/${license.maxActivations}`,
    );

    return {
      status: 'success',
      message: 'License activated successfully',
      data: activation,
    };
  }

  // ──────────────────────────────────────────────
  //  Deactivate license activation
  // ──────────────────────────────────────────────

  async deactivateLicense(
    licenseKey: string,
    activationId: string,
    userId: string,
  ): Promise<ApiResponse<void>> {
    this.logger.log(
      `Deactivating activation ${activationId} for license ${licenseKey}, user ${userId}`,
    );

    // Find license, verify userId
    const license = await this.repository.findLicenseByKey(licenseKey);
    if (!license) {
      throw new NotFoundException('License not found');
    }

    if (license.userId !== userId) {
      throw new ForbiddenException('You do not have permission to manage this license');
    }

    // Find activation
    const activation = await this.repository.findActivationById(activationId);
    if (!activation) {
      throw new NotFoundException(`Activation with ID "${activationId}" not found`);
    }

    if (activation.licenseId !== license.id) {
      throw new BadRequestException('Activation does not belong to this license');
    }

    if (!activation.isActive) {
      throw new BadRequestException('Activation is already deactivated');
    }

    // Set isActive=false, deactivatedAt
    await this.repository.deactivateActivation(activationId);

    // Decrement activationCount
    const newActivationCount = Math.max(0, license.activationCount - 1);

    // Remove domain from activatedDomains
    const updatedDomains = (license.activatedDomains ?? []).filter(
      (d) => d !== activation.domain,
    );

    await this.repository.updateLicense(license.id, {
      activationCount: newActivationCount,
      activatedDomains: updatedDomains,
    });

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `${CACHE_TAG}:key:${licenseKey}`,
      `${CACHE_TAG}:user:${userId}`,
    ]);

    this.logger.log(
      `Activation ${activationId} deactivated for license ${licenseKey}. Activations: ${newActivationCount}/${license.maxActivations}`,
    );

    return {
      status: 'success',
      message: 'License activation deactivated successfully',
      data: undefined,
    };
  }

  // ──────────────────────────────────────────────
  //  Revoke license (admin)
  // ──────────────────────────────────────────────

  async revokeLicense(
    licenseKey: string,
    reason: string,
  ): Promise<ApiResponse<void>> {
    this.logger.log(`Revoking license: ${licenseKey}, reason: ${reason}`);

    const license = await this.repository.findLicenseByKey(licenseKey);
    if (!license) {
      throw new NotFoundException('License not found');
    }

    if (license.status === LicenseStatus.REVOKED) {
      throw new BadRequestException('License is already revoked');
    }

    // Update license status to REVOKED with metadata
    await this.repository.updateLicense(license.id, {
      status: LicenseStatus.REVOKED,
      metadata: {
        ...(license.metadata ?? {}),
        revokedAt: new Date().toISOString(),
        revokeReason: reason,
      },
    });

    // Deactivate all active activations
    const activeActivations = await this.repository.findActiveActivations(license.id);
    for (const activation of activeActivations) {
      await this.repository.deactivateActivation(activation.id);
    }

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `${CACHE_TAG}:key:${licenseKey}`,
      `${CACHE_TAG}:user:${license.userId}`,
    ]);

    this.logger.log(
      `License ${licenseKey} revoked. ${activeActivations.length} activations deactivated.`,
    );

    return {
      status: 'success',
      message: 'License revoked successfully',
      data: undefined,
    };
  }

  // ──────────────────────────────────────────────
  //  Get user's licenses
  // ──────────────────────────────────────────────

  async getUserLicenses(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<ApiResponse<any>> {
    const cacheKey = this.cacheService.generateKey(
      'delivery',
      'licenses',
      userId,
      cursor ?? 'initial',
      limit,
    );

    const result = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findLicensesByUser(userId, cursor, limit),
      { ttl: CACHE_TTL_LICENSE, tags: [CACHE_TAG, `${CACHE_TAG}:user:${userId}`] },
    );

    return {
      status: 'success',
      message: 'User licenses retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  // ──────────────────────────────────────────────
  //  Get license details
  // ──────────────────────────────────────────────

  async getLicenseDetails(
    licenseId: string,
    userId: string,
  ): Promise<ApiResponse<any>> {
    const cacheKey = this.cacheService.generateKey('delivery', 'license', licenseId);

    const license = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findLicenseById(licenseId),
      { ttl: CACHE_TTL_LICENSE, tags: [CACHE_TAG, `${CACHE_TAG}:license:${licenseId}`] },
    );

    if (!license) {
      throw new NotFoundException(`License with ID "${licenseId}" not found`);
    }

    // Verify the user owns this license (non-admin users can only view their own)
    if (license.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this license');
    }

    // Get active activations
    const activations = await this.repository.findActiveActivations(license.id);

    return {
      status: 'success',
      message: 'License details retrieved successfully',
      data: {
        ...license,
        activeActivations: activations,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  private getLicenseFeatures(licenseType: LicenseType): string[] {
    switch (licenseType) {
      case LicenseType.PERSONAL:
        return ['Single site/machine use', 'Personal projects only', 'No redistribution'];
      case LicenseType.COMMERCIAL:
        return [
          'Up to 3 sites/machines',
          'Commercial projects allowed',
          'No redistribution',
          'Priority support',
        ];
      case LicenseType.EXTENDED:
        return [
          'Up to 10 sites/machines',
          'Commercial projects allowed',
          'Redistribution in SaaS products allowed',
          'Priority support',
          'Extended warranty',
        ];
      case LicenseType.ENTERPRISE:
        return [
          'Up to 25 sites/machines',
          'Unlimited commercial projects',
          'Full redistribution rights',
          'Priority support',
          'Extended warranty',
          'Custom branding',
        ];
      case LicenseType.UNLIMITED:
        return [
          'Unlimited sites/machines',
          'Unlimited commercial projects',
          'Full redistribution rights',
          'Priority support',
          'Lifetime updates',
          'Custom branding',
          'White-label rights',
        ];
      default:
        return [];
    }
  }
}
