export interface EmailSequenceStep {
  stepNumber: number;
  subject: string;
  templateName: string;
  delayMinutes: number;
  condition?: string; // e.g., 'has_not_purchased', 'has_not_reviewed'
}
