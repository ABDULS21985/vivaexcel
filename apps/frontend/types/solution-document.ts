// =============================================================================
// Solution Document Types
// =============================================================================
// Frontend types for the SDD Marketplace module,
// based on backend entities.

// -----------------------------------------------------------------------------
// Enums (as const objects + derived types)
// -----------------------------------------------------------------------------

export const DocumentType = {
  SOLUTION_DESIGN: "solution_design",
  ARCHITECTURE_BLUEPRINT: "architecture_blueprint",
  TECHNICAL_SPEC: "technical_spec",
  BUSINESS_CASE: "business_case",
  FEASIBILITY_STUDY: "feasibility_study",
  MIGRATION_PLAN: "migration_plan",
  SECURITY_ASSESSMENT: "security_assessment",
  INTEGRATION_DESIGN: "integration_design",
  DATA_MODEL: "data_model",
  API_SPECIFICATION: "api_specification",
  RUNBOOK: "runbook",
  PLAYBOOK: "playbook",
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const Domain = {
  CLOUD_INFRASTRUCTURE: "cloud_infrastructure",
  APPLICATION_MODERNIZATION: "application_modernization",
  DATA_ANALYTICS: "data_analytics",
  CYBERSECURITY: "cybersecurity",
  DEVOPS_CICD: "devops_cicd",
  AI_ML: "ai_ml",
  IOT: "iot",
  NETWORKING: "networking",
  IDENTITY_ACCESS: "identity_access",
  DISASTER_RECOVERY: "disaster_recovery",
  COST_OPTIMIZATION: "cost_optimization",
  COMPLIANCE_GOVERNANCE: "compliance_governance",
  MICROSERVICES: "microservices",
} as const;
export type Domain = (typeof Domain)[keyof typeof Domain];

export const MaturityLevel = {
  STARTER: "starter",
  INTERMEDIATE: "intermediate",
  ENTERPRISE: "enterprise",
} as const;
export type MaturityLevel = (typeof MaturityLevel)[keyof typeof MaturityLevel];

export const DiagramTool = {
  VISIO: "visio",
  LUCIDCHART: "lucidchart",
  DRAWIO: "drawio",
  MERMAID: "mermaid",
  PLANTUML: "plantuml",
  NONE: "none",
} as const;
export type DiagramTool = (typeof DiagramTool)[keyof typeof DiagramTool];

export const TemplateFormat = {
  DOCX: "docx",
  PDF: "pdf",
  MARKDOWN: "markdown",
  CONFLUENCE: "confluence",
  NOTION: "notion",
  GOOGLE_DOCS: "google_docs",
} as const;
export type TemplateFormat =
  (typeof TemplateFormat)[keyof typeof TemplateFormat];

export const DocumentStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;
export type DocumentStatus =
  (typeof DocumentStatus)[keyof typeof DocumentStatus];

// -----------------------------------------------------------------------------
// Core Interfaces
// -----------------------------------------------------------------------------

export interface TOCItem {
  level: number;
  title: string;
  pageNumber?: number;
  children?: TOCItem[];
}

export interface DocumentIncludes {
  editableTemplates: boolean;
  diagramFiles: boolean;
  implementationChecklist: boolean;
  costEstimator: boolean;
}

export interface DocumentUpdate {
  id: string;
  documentId: string;
  version: string;
  releaseNotes: string;
  fileId?: string;
  publishedAt: string;
  createdAt: string;
}

export interface SolutionDocument {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  documentType: DocumentType;
  domain: Domain;
  cloudPlatform?: string;
  technologyStack: string[];
  pageCount: number;
  wordCount: number;
  diagramCount: number;
  hasEditableDiagrams: boolean;
  diagramTool: DiagramTool;
  templateFormat: TemplateFormat[];
  complianceFrameworks: string[];
  maturityLevel: MaturityLevel;
  lastUpdated: string;
  version: string;
  changelog?: string;
  tableOfContents: TOCItem[];
  price: number;
  compareAtPrice?: number | null;
  status: DocumentStatus;
  featuredImage?: string | null;
  metadata?: Record<string, unknown>;
  includes: DocumentIncludes;
  seoTitle?: string | null;
  seoDescription?: string | null;
  organizationId?: string;
  createdBy?: string;
  aiGeneratedDescription?: string;
  aiSuggestedTags?: string[];
  freshnessScore: number;
  digitalProduct?: {
    id: string;
    name: string;
  };
  updates?: DocumentUpdate[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentBundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  bundlePrice: number;
  savingsPercentage: number;
  status: DocumentStatus;
  featuredImage?: string | null;
  documents: SolutionDocument[];
  createdAt?: string;
}

// -----------------------------------------------------------------------------
// Query / Filter Types
// -----------------------------------------------------------------------------

export interface SolutionDocumentQueryParams {
  search?: string;
  documentType?: DocumentType;
  domain?: Domain;
  cloudPlatform?: string;
  complianceFramework?: string;
  maturityLevel?: MaturityLevel;
  templateFormat?: TemplateFormat;
  minPrice?: number;
  maxPrice?: number;
  technology?: string;
  hasEditableDiagrams?: boolean;
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface SolutionDocumentCursorMeta {
  total?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface SolutionDocumentsResponse {
  items: SolutionDocument[];
  meta: SolutionDocumentCursorMeta;
}

export interface SolutionDocumentLandingData {
  featured: SolutionDocument[];
  newArrivals: SolutionDocument[];
  popular: SolutionDocument[];
  byDomain: Record<Domain, SolutionDocument[]>;
  byType: Record<DocumentType, SolutionDocument[]>;
  stats: {
    totalDocuments: number;
    totalDomains: number;
    totalTypes: number;
    averagePageCount: number;
  };
  domainCounts: Record<Domain, number>;
  typeCounts: Record<DocumentType, number>;
}

export interface SolutionDocumentStatsData {
  totalDocuments: number;
  totalDomains: number;
  totalTypes: number;
  averagePageCount: number;
  averageWordCount: number;
}

// -----------------------------------------------------------------------------
// Display Helper Maps
// -----------------------------------------------------------------------------

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.SOLUTION_DESIGN]: "Solution Design",
  [DocumentType.ARCHITECTURE_BLUEPRINT]: "Architecture Blueprint",
  [DocumentType.TECHNICAL_SPEC]: "Technical Spec",
  [DocumentType.BUSINESS_CASE]: "Business Case",
  [DocumentType.FEASIBILITY_STUDY]: "Feasibility Study",
  [DocumentType.MIGRATION_PLAN]: "Migration Plan",
  [DocumentType.SECURITY_ASSESSMENT]: "Security Assessment",
  [DocumentType.INTEGRATION_DESIGN]: "Integration Design",
  [DocumentType.DATA_MODEL]: "Data Model",
  [DocumentType.API_SPECIFICATION]: "API Specification",
  [DocumentType.RUNBOOK]: "Runbook",
  [DocumentType.PLAYBOOK]: "Playbook",
};

export const DOCUMENT_TYPE_ICONS: Record<DocumentType, string> = {
  [DocumentType.SOLUTION_DESIGN]: "📐",
  [DocumentType.ARCHITECTURE_BLUEPRINT]: "🏗️",
  [DocumentType.TECHNICAL_SPEC]: "📋",
  [DocumentType.BUSINESS_CASE]: "💼",
  [DocumentType.FEASIBILITY_STUDY]: "🔍",
  [DocumentType.MIGRATION_PLAN]: "🚀",
  [DocumentType.SECURITY_ASSESSMENT]: "🔒",
  [DocumentType.INTEGRATION_DESIGN]: "🔗",
  [DocumentType.DATA_MODEL]: "🗄️",
  [DocumentType.API_SPECIFICATION]: "🔌",
  [DocumentType.RUNBOOK]: "📖",
  [DocumentType.PLAYBOOK]: "📘",
};

export const DOMAIN_LABELS: Record<Domain, string> = {
  [Domain.CLOUD_INFRASTRUCTURE]: "Cloud Infrastructure",
  [Domain.APPLICATION_MODERNIZATION]: "Application Modernization",
  [Domain.DATA_ANALYTICS]: "Data & Analytics",
  [Domain.CYBERSECURITY]: "Cybersecurity",
  [Domain.DEVOPS_CICD]: "DevOps & CI/CD",
  [Domain.AI_ML]: "AI & Machine Learning",
  [Domain.IOT]: "Internet of Things",
  [Domain.NETWORKING]: "Networking",
  [Domain.IDENTITY_ACCESS]: "Identity & Access",
  [Domain.DISASTER_RECOVERY]: "Disaster Recovery",
  [Domain.COST_OPTIMIZATION]: "Cost Optimization",
  [Domain.COMPLIANCE_GOVERNANCE]: "Compliance & Governance",
  [Domain.MICROSERVICES]: "Microservices",
};

export const DOMAIN_ICONS: Record<Domain, string> = {
  [Domain.CLOUD_INFRASTRUCTURE]: "☁️",
  [Domain.APPLICATION_MODERNIZATION]: "🔄",
  [Domain.DATA_ANALYTICS]: "📊",
  [Domain.CYBERSECURITY]: "🛡️",
  [Domain.DEVOPS_CICD]: "⚙️",
  [Domain.AI_ML]: "🤖",
  [Domain.IOT]: "📡",
  [Domain.NETWORKING]: "🌐",
  [Domain.IDENTITY_ACCESS]: "🔑",
  [Domain.DISASTER_RECOVERY]: "🔁",
  [Domain.COST_OPTIMIZATION]: "💰",
  [Domain.COMPLIANCE_GOVERNANCE]: "📜",
  [Domain.MICROSERVICES]: "🧩",
};

export const DOMAIN_COLORS: Record<Domain, string> = {
  [Domain.CLOUD_INFRASTRUCTURE]: "bg-sky-500",
  [Domain.APPLICATION_MODERNIZATION]: "bg-violet-500",
  [Domain.DATA_ANALYTICS]: "bg-emerald-500",
  [Domain.CYBERSECURITY]: "bg-red-500",
  [Domain.DEVOPS_CICD]: "bg-orange-500",
  [Domain.AI_ML]: "bg-fuchsia-500",
  [Domain.IOT]: "bg-teal-500",
  [Domain.NETWORKING]: "bg-blue-500",
  [Domain.IDENTITY_ACCESS]: "bg-amber-500",
  [Domain.DISASTER_RECOVERY]: "bg-rose-500",
  [Domain.COST_OPTIMIZATION]: "bg-lime-500",
  [Domain.COMPLIANCE_GOVERNANCE]: "bg-indigo-500",
  [Domain.MICROSERVICES]: "bg-cyan-500",
};

export const DOMAIN_HEX_COLORS: Record<Domain, string> = {
  [Domain.CLOUD_INFRASTRUCTURE]: "#0EA5E9",
  [Domain.APPLICATION_MODERNIZATION]: "#8B5CF6",
  [Domain.DATA_ANALYTICS]: "#10B981",
  [Domain.CYBERSECURITY]: "#EF4444",
  [Domain.DEVOPS_CICD]: "#F97316",
  [Domain.AI_ML]: "#D946EF",
  [Domain.IOT]: "#14B8A6",
  [Domain.NETWORKING]: "#3B82F6",
  [Domain.IDENTITY_ACCESS]: "#F59E0B",
  [Domain.DISASTER_RECOVERY]: "#F43F5E",
  [Domain.COST_OPTIMIZATION]: "#84CC16",
  [Domain.COMPLIANCE_GOVERNANCE]: "#6366F1",
  [Domain.MICROSERVICES]: "#06B6D4",
};

export const MATURITY_LEVEL_LABELS: Record<MaturityLevel, string> = {
  [MaturityLevel.STARTER]: "Starter",
  [MaturityLevel.INTERMEDIATE]: "Intermediate",
  [MaturityLevel.ENTERPRISE]: "Enterprise",
};

export const MATURITY_LEVEL_COLORS: Record<MaturityLevel, string> = {
  [MaturityLevel.STARTER]: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  [MaturityLevel.INTERMEDIATE]: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  [MaturityLevel.ENTERPRISE]: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export const COMPLIANCE_LABELS: Record<
  string,
  { label: string; color: string; description: string }
> = {
  soc2: {
    label: "SOC 2",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    description: "Service Organization Control 2 compliance framework",
  },
  hipaa: {
    label: "HIPAA",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    description: "Health Insurance Portability and Accountability Act",
  },
  gdpr: {
    label: "GDPR",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    description: "General Data Protection Regulation",
  },
  iso27001: {
    label: "ISO 27001",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    description: "International standard for information security management",
  },
  "pci-dss": {
    label: "PCI DSS",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    description: "Payment Card Industry Data Security Standard",
  },
  nist: {
    label: "NIST",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
    description: "National Institute of Standards and Technology framework",
  },
  fedramp: {
    label: "FedRAMP",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
    description: "Federal Risk and Authorization Management Program",
  },
  cis: {
    label: "CIS",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    description: "Center for Internet Security benchmarks",
  },
};

export const DIAGRAM_TOOL_LABELS: Record<DiagramTool, string> = {
  [DiagramTool.VISIO]: "Microsoft Visio",
  [DiagramTool.LUCIDCHART]: "Lucidchart",
  [DiagramTool.DRAWIO]: "Draw.io",
  [DiagramTool.MERMAID]: "Mermaid",
  [DiagramTool.PLANTUML]: "PlantUML",
  [DiagramTool.NONE]: "None",
};

export const TEMPLATE_FORMAT_LABELS: Record<TemplateFormat, string> = {
  [TemplateFormat.DOCX]: "Word (DOCX)",
  [TemplateFormat.PDF]: "PDF",
  [TemplateFormat.MARKDOWN]: "Markdown",
  [TemplateFormat.CONFLUENCE]: "Confluence",
  [TemplateFormat.NOTION]: "Notion",
  [TemplateFormat.GOOGLE_DOCS]: "Google Docs",
};
