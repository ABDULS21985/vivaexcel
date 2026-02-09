export enum ReviewStatus {
  PENDING_MODERATION = 'pending_moderation',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

export enum VoteType {
  HELPFUL = 'helpful',
  NOT_HELPFUL = 'not_helpful',
}

export enum ReportReason {
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  FAKE = 'fake',
  OFF_TOPIC = 'off_topic',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}
