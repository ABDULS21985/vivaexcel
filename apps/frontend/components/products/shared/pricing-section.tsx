"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Sparkles, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@digibit/ui/components";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface PricingFeature {
    name: string;
    included: boolean | string;
    tooltip?: string;
}

export interface PricingTier {
    id: string;
    name: string;
    description: string;
    price: string;
    originalPrice?: string;
    billingPeriod: "monthly" | "yearly" | "custom";
    highlighted?: boolean;
    badge?: string;
    features: PricingFeature[];
    ctaLabel: string;
    ctaHref: string;
    metrics?: {
        value: string;
        label: string;
    };
}

interface PricingSectionProps {
    tiers: PricingTier[];
    title?: string;
    subtitle?: string;
    accentColor?: string;
    showBillingToggle?: boolean;
    yearlyDiscount?: number;
    className?: string;
}

/* ------------------------------------------------------------------ */
/* PricingCard Component                                               */
/* ------------------------------------------------------------------ */

function PricingCard({
    tier,
    accentColor,
    isYearly,
    yearlyDiscount,
    index,
}: {
    tier: PricingTier;
    accentColor: string;
    isYearly: boolean;
    yearlyDiscount: number;
    index: number;
}) {
    const isHighlighted = tier.highlighted;

    // Calculate yearly price
    const calculateYearlyPrice = (price: string) => {
        const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ""));
        if (isNaN(numericPrice)) return price;
        const discountedPrice = numericPrice * (1 - yearlyDiscount / 100);
        return `$${Math.round(discountedPrice)}`;
    };

    const displayPrice = isYearly && tier.billingPeriod !== "custom"
        ? calculateYearlyPrice(tier.price)
        : tier.price;

    return (
        <div
            className={`
                relative flex flex-col h-full
                bg-white rounded-2xl
                border-2 transition-all duration-300
                animate-fade-in-up
                ${isHighlighted
                    ? "shadow-2xl scale-[1.02] z-10"
                    : "shadow-lg hover:shadow-xl hover:-translate-y-1"
                }
            `}
            style={{
                borderColor: isHighlighted ? accentColor : "#e5e7eb",
                animationDelay: `${index * 100}ms`,
            }}
        >
            {/* Badge */}
            {tier.badge && (
                <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-white text-sm font-semibold flex items-center gap-1.5 shadow-lg"
                    style={{ backgroundColor: accentColor }}
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    {tier.badge}
                </div>
            )}

            {/* Header */}
            <div className={`p-6 ${tier.badge ? "pt-8" : ""}`}>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">
                    {tier.name}
                </h3>
                <p className="text-sm text-neutral-500 mb-4">
                    {tier.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-neutral-900">
                        {displayPrice}
                    </span>
                    {tier.billingPeriod !== "custom" && (
                        <span className="text-neutral-500">
                            /{isYearly ? "year" : "month"}
                        </span>
                    )}
                </div>

                {/* Original price (for discounts) */}
                {tier.originalPrice && (
                    <p className="text-sm text-neutral-400 line-through mb-2">
                        {tier.originalPrice}
                    </p>
                )}

                {/* Metrics */}
                {tier.metrics && (
                    <div
                        className="mt-4 px-4 py-3 rounded-xl"
                        style={{ backgroundColor: `${accentColor}08` }}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span
                                className="text-lg font-bold"
                                style={{ color: accentColor }}
                            >
                                {tier.metrics.value}
                            </span>
                            <span className="text-sm text-neutral-600">
                                {tier.metrics.label}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Divider */}
            <div
                className="h-px mx-6"
                style={{
                    background: isHighlighted
                        ? `linear-gradient(90deg, transparent, ${accentColor}30, transparent)`
                        : "linear-gradient(90deg, transparent, #e5e7eb, transparent)",
                }}
            />

            {/* Features */}
            <div className="flex-grow p-6">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-4">
                    What&apos;s included
                </p>
                <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            {/* Icon */}
                            <div
                                className={`
                                    flex-shrink-0 w-5 h-5 rounded-full
                                    flex items-center justify-center mt-0.5
                                `}
                                style={{
                                    backgroundColor:
                                        feature.included === false
                                            ? "#f3f4f6"
                                            : `${accentColor}15`,
                                }}
                            >
                                {feature.included === false ? (
                                    <X className="w-3 h-3 text-neutral-400" />
                                ) : (
                                    <Check
                                        className="w-3 h-3"
                                        style={{ color: accentColor }}
                                    />
                                )}
                            </div>

                            {/* Feature text */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                    className={`text-sm ${
                                        feature.included === false
                                            ? "text-neutral-400"
                                            : "text-neutral-700"
                                    }`}
                                >
                                    {feature.name}
                                    {typeof feature.included === "string" && (
                                        <span
                                            className="ml-1 font-medium"
                                            style={{ color: accentColor }}
                                        >
                                            ({feature.included})
                                        </span>
                                    )}
                                </span>

                                {/* Tooltip */}
                                {feature.tooltip && (
                                    <div className="group relative">
                                        <HelpCircle className="h-3.5 w-3.5 text-neutral-400 cursor-help" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            {feature.tooltip}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* CTA */}
            <div className="p-6 pt-0">
                <Button
                    asChild
                    size="lg"
                    className={`
                        w-full rounded-full font-semibold
                        transition-all duration-300
                        ${isHighlighted
                            ? "text-white hover:opacity-90"
                            : "bg-neutral-900 hover:bg-neutral-800 text-white"
                        }
                    `}
                    style={
                        isHighlighted
                            ? { backgroundColor: accentColor }
                            : undefined
                    }
                >
                    <Link href={tier.ctaHref}>
                        {tier.ctaLabel}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* BillingToggle Component                                             */
/* ------------------------------------------------------------------ */

function BillingToggle({
    isYearly,
    onToggle,
    yearlyDiscount,
    accentColor,
}: {
    isYearly: boolean;
    onToggle: () => void;
    yearlyDiscount: number;
    accentColor: string;
}) {
    return (
        <div className="flex items-center justify-center gap-4 mb-10">
            <span
                className={`text-sm font-medium transition-colors ${
                    !isYearly ? "text-neutral-900" : "text-neutral-400"
                }`}
            >
                Monthly
            </span>

            <button
                onClick={onToggle}
                className={`
                    relative w-14 h-7 rounded-full
                    transition-colors duration-200
                `}
                style={{
                    backgroundColor: isYearly ? accentColor : "#e5e7eb",
                }}
            >
                <div
                    className={`
                        absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm
                        transition-transform duration-200
                        ${isYearly ? "translate-x-8" : "translate-x-1"}
                    `}
                />
            </button>

            <span
                className={`text-sm font-medium transition-colors ${
                    isYearly ? "text-neutral-900" : "text-neutral-400"
                }`}
            >
                Yearly
            </span>

            {yearlyDiscount > 0 && (
                <span
                    className="px-2 py-1 rounded-full text-xs font-semibold"
                    style={{
                        backgroundColor: `${accentColor}15`,
                        color: accentColor,
                    }}
                >
                    Save {yearlyDiscount}%
                </span>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* PricingSection Component                                            */
/* ------------------------------------------------------------------ */

export function PricingSection({
    tiers,
    title,
    subtitle,
    accentColor = "#2563EB",
    showBillingToggle = false,
    yearlyDiscount = 20,
    className = "",
}: PricingSectionProps) {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <section className={`py-16 md:py-24 ${className}`}>
            <div className="container mx-auto px-4 md:px-6 lg:px-10">
                {/* Header */}
                {(title || subtitle) && (
                    <div className="text-center mb-10">
                        {title && (
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3"
                                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                            >
                                {title}
                            </div>
                        )}
                        {subtitle && (
                            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                {/* Billing toggle */}
                {showBillingToggle && (
                    <BillingToggle
                        isYearly={isYearly}
                        onToggle={() => setIsYearly(!isYearly)}
                        yearlyDiscount={yearlyDiscount}
                        accentColor={accentColor}
                    />
                )}

                {/* Pricing cards */}
                <div
                    className={`
                        grid gap-6 lg:gap-8 items-stretch
                        ${tiers.length === 1
                            ? "max-w-md mx-auto"
                            : tiers.length === 2
                            ? "md:grid-cols-2 max-w-3xl mx-auto"
                            : "md:grid-cols-2 lg:grid-cols-3"
                        }
                    `}
                >
                    {tiers.map((tier, index) => (
                        <PricingCard
                            key={tier.id}
                            tier={tier}
                            accentColor={accentColor}
                            isYearly={isYearly}
                            yearlyDiscount={yearlyDiscount}
                            index={index}
                        />
                    ))}
                </div>

                {/* Enterprise callout */}
                <div className="mt-12 text-center">
                    <p className="text-neutral-600 mb-4">
                        Need a custom solution for your enterprise?
                    </p>
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="rounded-full border-2"
                        style={{ borderColor: accentColor, color: accentColor }}
                    >
                        <Link href="/contact?type=enterprise">
                            Contact Sales
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* PricingComparisonTable - Feature comparison variant                 */
/* ------------------------------------------------------------------ */

interface PricingComparisonTableProps {
    tiers: PricingTier[];
    features: {
        category: string;
        items: { name: string; tooltip?: string }[];
    }[];
    accentColor?: string;
    className?: string;
}

export function PricingComparisonTable({
    tiers,
    features,
    accentColor = "#2563EB",
    className = "",
}: PricingComparisonTableProps) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full border-collapse">
                {/* Header */}
                <thead>
                    <tr>
                        <th className="text-left p-4 bg-neutral-50 font-semibold text-neutral-900 min-w-[200px]">
                            Features
                        </th>
                        {tiers.map((tier) => (
                            <th
                                key={tier.id}
                                className={`
                                    text-center p-4 min-w-[150px]
                                    ${tier.highlighted ? "bg-opacity-5" : "bg-neutral-50"}
                                `}
                                style={{
                                    backgroundColor: tier.highlighted
                                        ? `${accentColor}08`
                                        : undefined,
                                }}
                            >
                                <div className="font-bold text-neutral-900">
                                    {tier.name}
                                </div>
                                <div className="text-sm text-neutral-500">
                                    {tier.price}
                                    {tier.billingPeriod !== "custom" && "/mo"}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Body */}
                <tbody>
                    {features.map((category, catIdx) => (
                        <>
                            {/* Category header */}
                            <tr key={`cat-${catIdx}`}>
                                <td
                                    colSpan={tiers.length + 1}
                                    className="p-4 pt-6 font-semibold text-sm uppercase tracking-wide"
                                    style={{ color: accentColor }}
                                >
                                    {category.category}
                                </td>
                            </tr>

                            {/* Category items */}
                            {category.items.map((item, itemIdx) => (
                                <tr
                                    key={`item-${catIdx}-${itemIdx}`}
                                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                                >
                                    <td className="p-4 text-neutral-700">
                                        <div className="flex items-center gap-1.5">
                                            {item.name}
                                            {item.tooltip && (
                                                <div className="group relative">
                                                    <HelpCircle className="h-3.5 w-3.5 text-neutral-400 cursor-help" />
                                                    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                        {item.tooltip}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    {tiers.map((tier) => {
                                        const feature = tier.features.find(
                                            (f) => f.name === item.name
                                        );
                                        return (
                                            <td
                                                key={tier.id}
                                                className={`
                                                    text-center p-4
                                                    ${tier.highlighted ? "bg-opacity-5" : ""}
                                                `}
                                                style={{
                                                    backgroundColor: tier.highlighted
                                                        ? `${accentColor}03`
                                                        : undefined,
                                                }}
                                            >
                                                {!feature || feature.included === false ? (
                                                    <X className="h-4 w-4 text-neutral-300 mx-auto" />
                                                ) : typeof feature.included === "string" ? (
                                                    <span className="text-sm font-medium text-neutral-700">
                                                        {feature.included}
                                                    </span>
                                                ) : (
                                                    <Check
                                                        className="h-4 w-4 mx-auto"
                                                        style={{ color: accentColor }}
                                                    />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
