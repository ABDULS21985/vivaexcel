'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Calculator,
  Info,
  Layers,
} from "lucide-react";
import {
  FileCheck,
  QrCode,
  ClipboardCheck,
  Plug,
  XCircle,
  Building2,
} from "lucide-react";
import { Button } from "@ktblog/ui/components";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FileCheck,
  QrCode,
  ClipboardCheck,
  Plug,
  XCircle,
  Building2,
};

/* ------------------------------------------------------------------ */
/* Verification Estimator                                              */
/* ------------------------------------------------------------------ */

type VerificationEstimatorProps = { accentColor: string };

const volumeOptions = [
  { key: "small", label: "< 10K/mo", baseHours: 120, baseCost: 8 },
  { key: "mid", label: "10K \u2013 100K", baseHours: 480, baseCost: 5 },
  { key: "large", label: "100K+", baseHours: 1600, baseCost: 3 },
] as const;

const industryOptions = [
  { key: "education", label: "Education", multiplier: 1.1 },
  { key: "government", label: "Government", multiplier: 1.2 },
  { key: "insurance", label: "Insurance", multiplier: 0.9 },
  { key: "professional", label: "Professional", multiplier: 1.0 },
] as const;

const processOptions = [
  { key: "manual", label: "Manual", fraudRate: 12, timeMult: 1.5 },
  { key: "semi", label: "Semi-automated", fraudRate: 7, timeMult: 1.0 },
  { key: "none", label: "None", fraudRate: 25, timeMult: 2.0 },
] as const;

export function VerificationEstimator({ accentColor }: VerificationEstimatorProps) {
  const [volume, setVolume] = useState<string>("mid");
  const [industry, setIndustry] = useState<string>("education");
  const [process, setProcess] = useState<string>("manual");

  const { timeSaved, fraudReduction, costSavings } = useMemo(() => {
    const vol = volumeOptions.find((v) => v.key === volume) ?? volumeOptions[1];
    const ind = industryOptions.find((i) => i.key === industry) ?? industryOptions[0];
    const proc = processOptions.find((p) => p.key === process) ?? processOptions[0];
    const monthlyTimeSaved = Math.round(vol.baseHours * proc.timeMult * ind.multiplier * 0.85);
    const fraudPct = Math.min(99, Math.round(proc.fraudRate * ind.multiplier * 8.2));
    const savings = (vol.baseCost * ind.multiplier * proc.timeMult * 0.72).toFixed(2);
    return { timeSaved: monthlyTimeSaved, fraudReduction: fraudPct, costSavings: savings };
  }, [volume, industry, process]);

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
          <p className="font-semibold text-neutral-900">Verification Impact Calculator</p>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {/* Credential Volume */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-neutral-800">Credential volume</p>
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
                  <p className="text-xs text-neutral-600">credentials</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-neutral-800">Industry</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {industryOptions.map((opt) => {
              const selected = industry === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setIndustry(opt.key)}
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

        {/* Current Process */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-neutral-800">Current process</p>
          <div className="grid grid-cols-3 gap-2">
            {processOptions.map((opt) => {
              const selected = process === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setProcess(opt.key)}
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
              <p className="text-xs uppercase tracking-wide text-neutral-600">Time saved / mo</p>
              <p key={timeSaved} className="text-2xl font-bold text-neutral-900" style={{ animation: 'fade-in-scale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>{timeSaved}h</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-600">Fraud reduction</p>
              <p className="text-2xl font-bold text-neutral-900">{fraudReduction}%</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-600">Cost / verify</p>
              <p className="text-2xl font-bold text-neutral-900">${costSavings}</p>
            </div>
          </div>
          <Button
            asChild
            className="w-full font-semibold whitespace-nowrap"
            style={{ backgroundColor: accentColor, borderColor: accentColor }}
          >
            <Link href="/contact?product=digitrust&context=verification">
              Start Pilot Program
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Credential Layer Diagram                                            */
/* ------------------------------------------------------------------ */

export type CredentialLayer = {
  id: string;
  label: string;
  description: string;
  accent?: string;
};

type CredentialLayerDiagramProps = {
  layers: CredentialLayer[];
  accentColor: string;
};

export function CredentialLayerDiagram({ layers, accentColor }: CredentialLayerDiagramProps) {
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
          <p className="font-semibold text-neutral-900">DigiTrust Technology Stack</p>
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
            Each layer is independently auditable — from the immutable blockchain ledger storing credential
            hashes, through cryptographic signature verification, to the self-service portal where any third
            party can verify authenticity in seconds.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feature Explorer                                                    */
/* ------------------------------------------------------------------ */

export type FeatureDetail = {
  id: string;
  iconName: string;
  title: string;
  description: string;
  capabilities: string[];
  highlight: string;
};

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
            <Link href="/contact?product=digitrust">
              Learn more
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
