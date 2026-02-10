import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { AffiliatesRepository } from '../affiliates.repository';

@Injectable()
export class AffiliateStripeService {
  private readonly logger = new Logger(AffiliateStripeService.name);
  private readonly stripe: Stripe | null;
  private readonly frontendUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly repository: AffiliatesRepository,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured. Affiliate Stripe Connect will not work.');
      this.stripe = null;
    } else {
      this.stripe = new Stripe(secretKey, { apiVersion: '2025-02-24.acacia' });
    }
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  private getStripe(): Stripe {
    if (!this.stripe) {
      throw new InternalServerErrorException('Stripe is not configured');
    }
    return this.stripe;
  }

  async createConnectAccount(affiliateId: string, email: string): Promise<string> {
    try {
      const account = await this.getStripe().accounts.create({
        type: 'express',
        email,
        metadata: { affiliateId, source: 'ktblog' },
        capabilities: {
          transfers: { requested: true },
        },
      });

      await this.repository.updateAffiliateProfile(affiliateId, {
        stripeConnectAccountId: account.id,
      });

      this.logger.log(`Stripe Connect account ${account.id} created for affiliate ${affiliateId}`);
      return account.id;
    } catch (error) {
      this.logger.error(`Failed to create Connect account for affiliate ${affiliateId}`, error);
      throw new InternalServerErrorException('Failed to create Stripe Connect account');
    }
  }

  async createOnboardingLink(affiliateId: string): Promise<string> {
    const affiliate = await this.repository.findAffiliateById(affiliateId);
    if (!affiliate) throw new BadRequestException('Affiliate not found');

    const accountId = affiliate.stripeConnectAccountId;
    if (!accountId) {
      throw new BadRequestException('No Stripe Connect account found. Please create one first.');
    }

    try {
      const link = await this.getStripe().accountLinks.create({
        account: accountId,
        refresh_url: `${this.frontendUrl}/affiliate/settings?stripe_refresh=true`,
        return_url: `${this.frontendUrl}/affiliate/settings?stripe_return=true`,
        type: 'account_onboarding',
      });

      return link.url;
    } catch (error) {
      this.logger.error(`Failed to create onboarding link for affiliate ${affiliateId}`, error);
      throw new InternalServerErrorException('Failed to create onboarding link');
    }
  }

  async checkOnboardingStatus(affiliateId: string): Promise<{
    complete: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
  }> {
    const affiliate = await this.repository.findAffiliateById(affiliateId);
    if (!affiliate?.stripeConnectAccountId) {
      return { complete: false, chargesEnabled: false, payoutsEnabled: false, detailsSubmitted: false };
    }

    try {
      const account = await this.getStripe().accounts.retrieve(affiliate.stripeConnectAccountId);

      const complete = !!(account.charges_enabled && account.payouts_enabled && account.details_submitted);

      if (complete && !affiliate.stripeOnboardingComplete) {
        await this.repository.updateAffiliateProfile(affiliateId, {
          stripeOnboardingComplete: true,
        });
      }

      return {
        complete,
        chargesEnabled: !!account.charges_enabled,
        payoutsEnabled: !!account.payouts_enabled,
        detailsSubmitted: !!account.details_submitted,
      };
    } catch (error) {
      this.logger.error(`Failed to check onboarding status for affiliate ${affiliateId}`, error);
      return { complete: false, chargesEnabled: false, payoutsEnabled: false, detailsSubmitted: false };
    }
  }

  async createTransfer(
    connectedAccountId: string,
    amountInCents: number,
    currency: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Transfer> {
    try {
      const transfer = await this.getStripe().transfers.create({
        amount: amountInCents,
        currency,
        destination: connectedAccountId,
        metadata: { source: 'ktblog', type: 'affiliate_payout', ...metadata },
      });

      this.logger.log(`Transfer ${transfer.id} created to ${connectedAccountId}: ${amountInCents} ${currency}`);
      return transfer;
    } catch (error) {
      this.logger.error(`Failed to create transfer to ${connectedAccountId}`, error);
      throw new InternalServerErrorException('Failed to create transfer');
    }
  }

  async createLoginLink(affiliateId: string): Promise<string> {
    const affiliate = await this.repository.findAffiliateById(affiliateId);
    if (!affiliate?.stripeConnectAccountId) {
      throw new BadRequestException('No Stripe Connect account found');
    }

    try {
      const link = await this.getStripe().accounts.createLoginLink(
        affiliate.stripeConnectAccountId,
      );
      return link.url;
    } catch (error) {
      this.logger.error(`Failed to create login link for affiliate ${affiliateId}`, error);
      throw new InternalServerErrorException('Failed to create Stripe dashboard link');
    }
  }

  async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    const affiliateId = account.metadata?.affiliateId;
    if (!affiliateId) {
      this.logger.warn(`Account updated webhook missing affiliateId in metadata: ${account.id}`);
      return;
    }

    const complete = !!(account.charges_enabled && account.payouts_enabled && account.details_submitted);
    await this.repository.updateAffiliateProfile(affiliateId, {
      stripeOnboardingComplete: complete,
    });

    this.logger.log(`Affiliate ${affiliateId} onboarding status updated: complete=${complete}`);
  }

  async handleTransferFailed(transfer: Stripe.Transfer): Promise<void> {
    const payoutId = transfer.metadata?.payoutId;
    if (!payoutId) return;

    await this.repository.updatePayout(payoutId, {
      status: 'failed' as any,
      failureReason: `Transfer ${transfer.id} failed`,
    });

    this.logger.warn(`Transfer ${transfer.id} failed for affiliate payout ${payoutId}`);
  }
}
