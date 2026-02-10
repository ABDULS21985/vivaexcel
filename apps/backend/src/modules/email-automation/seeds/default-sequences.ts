import { EmailSequenceTrigger } from '../enums/email-automation.enums';
import { EmailSequenceStep } from '../interfaces/email-sequence-step.interface';

export interface DefaultSequenceSeed {
  name: string;
  description: string;
  trigger: EmailSequenceTrigger;
  steps: EmailSequenceStep[];
  isActive: boolean;
}

/**
 * Pre-built email sequences for common automation scenarios.
 * These can be used to seed the database with initial sequences.
 */
export const defaultSequences: DefaultSequenceSeed[] = [
  // ─── Welcome Series (SIGNUP) ───────────────────
  {
    name: 'Welcome Series',
    description:
      'Onboarding email sequence for new users. Guides them through the platform over 14 days.',
    trigger: EmailSequenceTrigger.SIGNUP,
    isActive: true,
    steps: [
      {
        stepNumber: 1,
        subject: 'Welcome to the platform! Here is how to get started',
        templateName: 'welcome-day-0',
        delayMinutes: 0, // Immediately
      },
      {
        stepNumber: 2,
        subject: 'Did you know? 5 features to explore today',
        templateName: 'welcome-day-1',
        delayMinutes: 1440, // 1 day
      },
      {
        stepNumber: 3,
        subject: 'Pro tips to make the most of your account',
        templateName: 'welcome-day-3',
        delayMinutes: 4320, // 3 days
      },
      {
        stepNumber: 4,
        subject: 'Your first week recap and what is next',
        templateName: 'welcome-day-7',
        delayMinutes: 10080, // 7 days
      },
      {
        stepNumber: 5,
        subject: 'You have been with us for 2 weeks! Here is a special offer',
        templateName: 'welcome-day-14',
        delayMinutes: 20160, // 14 days
      },
    ],
  },

  // ─── Abandoned Cart ────────────────────────────
  {
    name: 'Abandoned Cart Recovery',
    description:
      'Reminds users who left items in their cart. Sends 3 follow-ups over 72 hours.',
    trigger: EmailSequenceTrigger.CART_ABANDONED,
    isActive: true,
    steps: [
      {
        stepNumber: 1,
        subject: 'You left something behind! Complete your purchase',
        templateName: 'cart-abandoned-1h',
        delayMinutes: 60, // 1 hour
        condition: 'cart_still_abandoned',
      },
      {
        stepNumber: 2,
        subject: 'Still thinking it over? Your cart is waiting',
        templateName: 'cart-abandoned-24h',
        delayMinutes: 1440, // 24 hours
        condition: 'cart_still_abandoned',
      },
      {
        stepNumber: 3,
        subject: 'Last chance! Your cart items are selling fast',
        templateName: 'cart-abandoned-72h',
        delayMinutes: 4320, // 72 hours
        condition: 'cart_still_abandoned',
      },
    ],
  },

  // ─── Post-Purchase ─────────────────────────────
  {
    name: 'Post-Purchase Follow-Up',
    description:
      'Thank the buyer, provide usage tips, and request a review.',
    trigger: EmailSequenceTrigger.FIRST_PURCHASE,
    isActive: true,
    steps: [
      {
        stepNumber: 1,
        subject: 'Thank you for your purchase! Here is what is next',
        templateName: 'post-purchase-immediate',
        delayMinutes: 0, // Immediately
      },
      {
        stepNumber: 2,
        subject: 'Getting the most out of your new purchase',
        templateName: 'post-purchase-day-3',
        delayMinutes: 4320, // 3 days
      },
      {
        stepNumber: 3,
        subject: 'How was your experience? Leave a review',
        templateName: 'post-purchase-review-day-7',
        delayMinutes: 10080, // 7 days
        condition: 'has_not_reviewed',
      },
    ],
  },

  // ─── Re-engagement ─────────────────────────────
  {
    name: 'Re-engagement Campaign',
    description:
      'Win back inactive users with a series of emails over 60 days.',
    trigger: EmailSequenceTrigger.REENGAGEMENT,
    isActive: true,
    steps: [
      {
        stepNumber: 1,
        subject: 'We miss you! See what is new on the platform',
        templateName: 'reengagement-30d',
        delayMinutes: 43200, // 30 days
        condition: 'has_not_logged_in',
      },
      {
        stepNumber: 2,
        subject: 'A special offer just for you — come back and save',
        templateName: 'reengagement-45d',
        delayMinutes: 64800, // 45 days
        condition: 'has_not_logged_in',
      },
      {
        stepNumber: 3,
        subject: 'Last call: Your exclusive discount expires soon',
        templateName: 'reengagement-60d',
        delayMinutes: 86400, // 60 days
        condition: 'has_not_logged_in',
      },
    ],
  },

  // ─── Price Drop ────────────────────────────────
  {
    name: 'Price Drop Alert',
    description:
      'Instant notification when a product the user is watching drops in price.',
    trigger: EmailSequenceTrigger.PRICE_DROP,
    isActive: true,
    steps: [
      {
        stepNumber: 1,
        subject: 'Price drop alert! A product you watched is now on sale',
        templateName: 'price-drop-instant',
        delayMinutes: 0, // Immediately
      },
    ],
  },

  // ─── Product Update ────────────────────────────
  {
    name: 'Product Update Notification',
    description:
      'Notifies users when a product they purchased or follow receives an update.',
    trigger: EmailSequenceTrigger.PRODUCT_UPDATE,
    isActive: true,
    steps: [
      {
        stepNumber: 1,
        subject: 'A product you own just got an update!',
        templateName: 'product-update-instant',
        delayMinutes: 0, // Immediately
      },
    ],
  },
];
