// TrustMeHub-specific type definitions

export type FeatureCategory = "core" | "security" | "developer" | "integration" | "enterprise";

export interface TrustMeHubFeature {
    id: string;
    icon: string;
    title: string;
    description: string;
    category: FeatureCategory;
    highlights?: string[];
}

export interface FeatureCategoryInfo {
    id: FeatureCategory;
    name: string;
    description: string;
}

export interface TrustMeHubUseCase {
    id: string;
    slug: string;
    icon: string;
    title: string;
    shortDescription: string;
    fullDescription: string;
    sector: string;
    economicImpact: {
        annualValue: string;
        numericValue: number;
    };
    roi: {
        timeToValue: string;
        costReduction: string;
        efficiencyGain: string;
    };
    statistics: {
        label: string;
        value: string;
        detail?: string;
    }[];
    challenges: string[];
    solutions: string[];
    benefits: string[];
}

export interface PricingTier {
    id: string;
    name: string;
    price: string;
    priceNumeric: number;
    billingPeriod: "monthly" | "annual" | "custom";
    verifications: string;
    verificationsNumeric: number;
    description: string;
    features: string[];
    highlighted?: boolean;
    ctaLabel: string;
    ctaHref: string;
}

export interface ComparisonMetric {
    metric: string;
    icon: string;
    traditional: {
        value: string;
        detail?: string;
    };
    trustmehub: {
        value: string;
        detail?: string;
    };
    improvement: string;
}

export interface SdkInfo {
    language: string;
    icon: string;
    installCommand: string;
    quickstartCode: string;
    docsUrl?: string;
    githubUrl?: string;
}

export interface ApiFeature {
    icon: string;
    title: string;
    description: string;
}
