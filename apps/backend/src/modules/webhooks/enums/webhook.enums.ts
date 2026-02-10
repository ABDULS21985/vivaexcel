export enum WebhookEndpointStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  FAILING = 'failing',
}

export enum WebhookDeliveryStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETRIED = 'retried',
}

export enum WebhookEvent {
  ORDER_CREATED = 'order.created',
  ORDER_COMPLETED = 'order.completed',
  ORDER_REFUNDED = 'order.refunded',
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_PUBLISHED = 'product.published',
  REVIEW_CREATED = 'review.created',
  REVIEW_APPROVED = 'review.approved',
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_CANCELED = 'subscription.canceled',
  PAYOUT_COMPLETED = 'payout.completed',
  LICENSE_ACTIVATED = 'license.activated',
}
