'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    CheckCircle2,
    Calculator,
    Info,
    Layers,
    Zap,
    Link2,
    Eye,
    Building2,
    Smartphone,
    Globe,
} from "lucide-react";
import { Button } from "@digibit/ui/components";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Zap,
    Link2,
    Eye,
    Building2,
    Smartphone,
    Globe,
};

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type TrustLayer = {
    id: string;
    label: string;
    description: string;
    accent?: string;
};

export type FeatureDetail = {
    id: string;
    iconName: string;
    title: string;
    description: string;
    capabilities: string[];
    highlight: string;
};

/* ------------------------------------------------------------------ */
/* Impact Calculator                                                   */
/* ------------------------------------------------------------------ */

type ImpactCalculatorProps = { accentColor: string };

const volumeOptions = [
    { key: "low", label: "< 10K/mo", baseSavings: 45000, timePerVerification: 96 },
    { key: "mid", label: "10K \u2013 100K/mo", baseSavings: 280000, timePerVerification: 98 },
    { key: "high", label: "100K+/mo", baseSavings: 1400000, timePerVerification: 99.5 },
] as const;

const sectorOptions = [
    { key: "education", label: "Education", multiplier: 1.0 },
    { key: "banking", label: "Banking", multiplier: 1.3 },
    { key: "healthcare", label: "Healthcare", multiplier: 1.2 },
    { key: "government", label: "Government", multiplier: 1.1 },
    { key: "property", label: "Property", multiplier: 0.9 },
    { key: "professional", label: "Professional", multiplier: 1.15 },
] as const;

const methodOptions = [
    { key: "manual", label: "Manual", fraudReduction: 98, multiplier: 1.4 },
    { key: "semi", label: "Semi-digital", fraudReduction: 92, multiplier: 1.0 },
    { key: "legacy", label: "Legacy system", fraudReduction: 85, multiplier: 0.75 },
] as const;

export function ImpactCalculator({ accentColor }: ImpactCalculatorProps) {
    const [volume, setVolume] = useState<string>("mid");
    const [sector, setSector] = useState<string>("education");
    const [method, setMethod] = useState<string>("manual");

    const { monthlySavings, timeSaved, fraudReduction } = useMemo(() => {
        const vol = volumeOptions.find((v) => v.key === volume) ?? volumeOptions[1];
        const sec = sectorOptions.find((s) => s.key === sector) ?? sectorOptions[0];
        const meth = methodOptions.find((m) => m.key === method) ?? methodOptions[0];
        const savings = Math.round(vol.baseSavings * sec.multiplier * meth.multiplier);
        return {
            monthlySavings: savings,
            timeSaved: vol.timePerVerification,
            fraudReduction: meth.fraudReduction,
        };
    }, [volume, sector, method]);

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(n);

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-neutral-100 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3">
                <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}22` }}
                >
                    <Calculator size={18} style={{ color: accentColor }} />
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">Estimator</p>
                    <p className="font-semibold text-neutral-900">Impact Calculator</p>
                </div>
            </div>

            <div className="px-6 pb-6 space-y-4">
                {/* Verification Volume */}
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-neutral-800">Verification volume</p>
                    <div className="grid grid-cols-3 gap-2">
                        {volumeOptions.map((opt) => {
                            const selected = volume === opt.key;
                            return (
                                <button
                                    key={opt.key}
                                    onClick={() => setVolume(opt.key)}
                                    className={`p-3 rounded-xl border text-left text-sm transition-all duration-200 hover:-translate-y-0.5 ${selected ? "shadow-md" : "shadow-sm"}`}
                                    style={{
                                        borderColor: selected ? accentColor : "rgba(0,0,0,0.07)",
                                        backgroundColor: selected ? `${accentColor}12` : "white",
                                    }}
                                >
                                    <p className="font-semibold text-neutral-900">{opt.label}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Sector */}
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-neutral-800">Sector</p>
                    <div className="grid grid-cols-3 gap-2">
                        {sectorOptions.map((opt) => {
                            const selected = sector === opt.key;
                            return (
                                <button
                                    key={opt.key}
                                    onClick={() => setSector(opt.key)}
                                    className={`p-3 rounded-xl border text-left text-sm transition-all duration-200 hover:-translate-y-0.5 ${selected ? "shadow-md" : "shadow-sm"}`}
                                    style={{
                                        borderColor: selected ? accentColor : "rgba(0,0,0,0.07)",
                                        backgroundColor: selected ? `${accentColor}12` : "white",
                                    }}
                                >
                                    <p className="font-semibold text-neutral-900">{opt.label}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Current Method */}
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-neutral-800">Current method</p>
                    <div className="grid grid-cols-3 gap-2">
                        {methodOptions.map((opt) => {
                            const selected = method === opt.key;
                            return (
                                <button
                                    key={opt.key}
                                    onClick={() => setMethod(opt.key)}
                                    className={`p-3 rounded-xl border text-left text-sm transition-all duration-200 hover:-translate-y-0.5 ${selected ? "shadow-md" : "shadow-sm"}`}
                                    style={{
                                        borderColor: selected ? accentColor : "rgba(0,0,0,0.07)",
                                        backgroundColor: selected ? `${accentColor}12` : "white",
                                    }}
                                >
                                    <p className="font-semibold text-neutral-900">{opt.label}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Result */}
                <div
                    className="mt-2 p-4 rounded-2xl border transition-all duration-500"
                    style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}08` }}
                >
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-neutral-600">Monthly savings</p>
                            <p key={monthlySavings} className="text-xl font-bold text-neutral-900" style={{ animation: 'fade-in-scale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>{formatCurrency(monthlySavings)}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-neutral-600">Time saved</p>
                            <p className="text-xl font-bold text-neutral-900">{timeSaved}%</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-neutral-600">Fraud cut</p>
                            <p className="text-xl font-bold text-neutral-900">{fraudReduction}%</p>
                        </div>
                    </div>
                    <Button
                        asChild
                        className="w-full font-semibold"
                        style={{ backgroundColor: accentColor, borderColor: accentColor }}
                    >
                        <Link href="/contact?product=trustmehub&context=impact">
                            Request Live Demo
                            <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Trust Layer Diagram                                                 */
/* ------------------------------------------------------------------ */

type TrustLayerDiagramProps = {
    layers: TrustLayer[];
    accentColor: string;
};

export function TrustLayerDiagram({ layers, accentColor }: TrustLayerDiagramProps) {
    const [active, setActive] = useState(layers[layers.length - 1]?.id ?? "");
    const activeLayer = layers.find((l) => l.id === active) ?? layers[layers.length - 1];

    return (
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}22` }}
                >
                    <Layers size={18} style={{ color: accentColor }} />
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">Architecture</p>
                    <p className="font-semibold text-neutral-900">TrustMeHub Technology Stack</p>
                </div>
            </div>

            <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-6 items-center">
                <div className="relative w-full aspect-square max-w-md mx-auto">
                    {layers.map((layer, idx) => {
                        const size = 100 - idx * 18;
                        const isInnermost = idx === layers.length - 1;
                        return (
                            <div
                                key={layer.id}
                                className="absolute inset-0 m-auto rounded-full transition-all duration-500 cursor-pointer"
                                style={{
                                    width: `${size}%`,
                                    height: `${size}%`,
                                    background: `radial-gradient(circle at 30% 30%, ${layer.accent ?? accentColor}33, ${layer.accent ?? accentColor}08)`,
                                    border: `2px solid ${(layer.accent ?? accentColor)}55`,
                                    transform: active === layer.id ? "translateY(-4px) scale(1.02)" : "translateY(0px)",
                                    boxShadow: active === layer.id ? `0 8px 30px -8px ${(layer.accent ?? accentColor)}40` : 'none',
                                    zIndex: layers.length - idx,
                                    animation: `fade-in-scale 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 150}ms both`,
                                }}
                                onClick={() => setActive(layer.id)}
                            >
                                {isInnermost ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                                        <p className="font-semibold text-neutral-800 drop-shadow-sm text-xs">
                                            {layer.label}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="absolute left-1/2 -translate-x-1/2 text-center" style={{ top: '6%' }}>
                                        <p className="font-semibold text-neutral-800 drop-shadow-sm text-xs whitespace-nowrap">
                                            {layer.label}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="space-y-3">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                            backgroundColor: `${activeLayer?.accent ?? accentColor}15`,
                            color: activeLayer?.accent ?? accentColor,
                        }}
                    >
                        <Info size={14} />
                        {activeLayer?.label}
                    </div>
                    <p className="text-base text-neutral-700">{activeLayer?.description}</p>
                    <p className="text-sm text-neutral-600">
                        Each layer is independently scalable — from the immutable blockchain core,
                        through privacy-preserving cryptographic proofs, to developer-friendly APIs
                        and intuitive end-user applications.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Feature Explorer                                                    */
/* ------------------------------------------------------------------ */

type FeatureExplorerProps = {
    features: FeatureDetail[];
    accentColor: string;
};

export function FeatureExplorer({ features, accentColor }: FeatureExplorerProps) {
    const [activeId, setActiveId] = useState(features[0]?.id ?? "");
    const activeFeature = features.find((f) => f.id === activeId) ?? features[0];
    const ActiveIcon = activeFeature ? iconMap[activeFeature.iconName] : null;

    return (
        <div className="grid lg:grid-cols-[0.4fr_0.6fr] gap-6">
            {/* Feature selector */}
            <div className="space-y-2">
                {features.map((feature) => {
                    const selected = activeId === feature.id;
                    const Icon = iconMap[feature.iconName];
                    return (
                        <button
                            key={feature.id}
                            onClick={() => setActiveId(feature.id)}
                            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-3 ${
                                selected ? "shadow-lg" : "shadow-sm"
                            }`}
                            style={{
                                borderColor: selected ? accentColor : "rgba(0,0,0,0.06)",
                                backgroundColor: selected ? `${accentColor}10` : "white",
                            }}
                        >
                            <div
                                className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                    backgroundColor: selected ? `${accentColor}22` : "#f5f5f5",
                                    color: selected ? accentColor : "#737373",
                                }}
                            >
                                {Icon && <Icon size={20} />}
                            </div>
                            <p className={`font-semibold ${selected ? "text-neutral-900" : "text-neutral-700"}`}>
                                {feature.title}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Detail panel */}
            {activeFeature && (
                <div key={activeFeature.id} className="bg-white border border-neutral-100 rounded-2xl shadow-xl p-6 space-y-4" style={{ animation: 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                    <div className="flex items-center gap-3">
                        <div
                            className="h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:rotate-3"
                            style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
                        >
                            {ActiveIcon && <ActiveIcon size={24} />}
                        </div>
                        <div>
                            <p className="font-bold text-lg text-neutral-900">{activeFeature.title}</p>
                            <span
                                className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                            >
                                {activeFeature.highlight}
                            </span>
                        </div>
                    </div>

                    <p className="text-neutral-700">{activeFeature.description}</p>

                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-neutral-800">Key capabilities</p>
                        <ul className="space-y-2">
                            {activeFeature.capabilities.map((cap, idx) => (
                                <li key={cap} className="flex items-start gap-2" style={{ animation: `fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 80}ms both` }}>
                                    <CheckCircle2
                                        size={16}
                                        className="mt-0.5 flex-shrink-0"
                                        style={{ color: accentColor }}
                                    />
                                    <span className="text-sm text-neutral-700">{cap}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Button
                        asChild
                        variant="outline"
                        className="rounded-full"
                        style={{ borderColor: accentColor, color: accentColor }}
                    >
                        <Link href="/contact?product=trustmehub">
                            Learn more
                            <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
