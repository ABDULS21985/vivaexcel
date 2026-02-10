export enum EmailSequenceTrigger {
  SIGNUP = 'signup',
  FIRST_PURCHASE = 'first_purchase',
  CART_ABANDONED = 'cart_abandoned',
  REVIEW_REQUEST = 'review_request',
  REENGAGEMENT = 'reengagement',
  SUBSCRIPTION_TRIAL_ENDING = 'subscription_trial_ending',
  SUBSCRIPTION_CANCELED = 'subscription_canceled',
  SELLER_ONBOARDING = 'seller_onboarding',
  AFFILIATE_WELCOME = 'affiliate_welcome',
  PRICE_DROP = 'price_drop',
  PRODUCT_UPDATE = 'product_update',
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  PAUSED = 'paused',
}
