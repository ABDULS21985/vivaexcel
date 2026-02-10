export enum ContributorApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface ContributorApplication {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  portfolioUrls?: string[];
  experienceDescription?: string;
  contentCategories?: string[];
  sampleWorkUrls?: string[];
  specialties?: string[];
  applicationNote?: string;
  status: ContributorApplicationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
}
