'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Calculator,
  Info,
  Layers,
  Users,
  MessageSquare,
  Phone,
  ShieldCheck,
  Bot,
  BarChart3,
} from "lucide-react";
import { Button } from "@ktblog/ui/components";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Users,
  MessageSquare,
  Phone,
  ShieldCheck,
  Bot,
  BarChart3,
};

/* ------------------------------------------------------------------ */
/* Cost Savings Calculator                                             */
/* ------------------------------------------------------------------ */

type CostSavingsCalculatorProps = { accentColor: string };

const bankTypeOptions = [
  { key: "commercial", label: "Commercial", baseSavings: 600000 },
  { key: "microfinance", label: "Microfinance", baseSavings: 150000 },
  { key: "payment", label: "Payment Provider", baseSavings: 300000 },
  { key: "insurance", label: "Insurance", baseSavings: 250000 },
] as const;

const customerBaseOptions = [
  { key: "small", label: "< 50K", multiplier: 0.5 },
  { key: "mid", label: "50K \u2013 500K", multiplier: 1.0 },
  { key: "large", label: "500K+", multiplier: 2.0 },
] as const;

const currentCRMOptions = [
  { key: "salesforce", label: "Salesforce", multiplier: 1.4 },
  { key: "dynamics", label: "Dynamics", multiplier: 1.2 },
  { key: "inhouse", label: "In-house", multiplier: 0.8 },
  { key: "none", label: "None", multiplier: 1.0 },
] as const;

export function CostSavingsCalculator({ accentColor }: CostSavingsCalculatorProps) {
  const [bankType, setBankType] = useState<string>("commercial");
  const [customerBase, setCustomerBase] = useState<string>("mid");
  const [currentCRM, setCurrentCRM] = useState<string>("salesforce");

  const { savings, roi } = useMemo(() => {
    const bank = bankTypeOptions.find((b) => b.key === bankType) ?? bankTypeOptions[0];
    const base = customerBaseOptions.find((c) => c.key === customerBase) ?? customerBaseOptions[1];
    const crm = currentCRMOptions.find((c) => c.key === currentCRM) ?? currentCRMOptions[0];
    const annualSavings = Math.round(bank.baseSavings * base.multiplier * crm.multiplier);
    const estimatedCost = bank.baseSavings * 0.3;
    const roiPercent = Math.round((annualSavings / estimatedCost) * 100);
    return { savings: annualSavings, roi: roiPercent };
  }, [bankType, customerBase, currentCRM]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

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
          <p className="font-semibold text-neutral-900">Cost Savings Calculator</p>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {/* Bank Type */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-neutral-800">Bank type</p>
          <div className="grid grid-cols-2 gap-2">
            {bankTypeOptions.map((opt) => {
              const selected = bankType === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setBankType(opt.key)}
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

        {/* Customer Base */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-neutral-800">Customer base</p>
          <div className="grid grid-cols-3 gap-2">
            {customerBaseOptions.map((opt) => {
              const selected = customerBase === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setCustomerBase(opt.key)}
                  className={`p-3 rounded-xl border text-left text-sm transition-all duration-200 hover:-translate-y-0.5 ${selected ? "shadow-md" : "shadow-sm"}`}
                  style={{
                    borderColor: selected ? accentColor : "rgba(0,0,0,0.07)",
                    backgroundColor: selected ? `${accentColor}12` : "white",
                  }}
                >
                  <p className="font-semibold text-neutral-900">{opt.label}</p>
                  <p className="text-xs text-neutral-600">customers</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current CRM */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-neutral-800">Current CRM</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {currentCRMOptions.map((opt) => {
              const selected = currentCRM === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setCurrentCRM(opt.key)}
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-600">Projected annual savings</p>
              <p className="text-3xl font-bold text-neutral-900 transition-all duration-300" key={savings}
                style={{ animation: 'fade-in-scale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
              >
                {formatCurrency(savings)}
              </p>
              <p className="text-sm text-neutral-700 transition-all duration-300">Estimated ROI: <span className="font-semibold" style={{ color: accentColor }}>{roi}%</span></p>
            </div>
            <Button
              asChild
              className="font-semibold whitespace-nowrap"
              style={{ backgroundColor: accentColor, borderColor: accentColor }}
            >
              <Link href="/contact?product=boacrm&context=savings">
                Get Custom Quote
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Module Layer Diagram                                                */
/* ------------------------------------------------------------------ */

export type ModuleLayer = {
  id: string;
  label: string;
  description: string;
  accent?: string;
};

type ModuleLayerDiagramProps = {
  layers: ModuleLayer[];
  accentColor: string;
};

export function ModuleLayerDiagram({ layers, accentColor }: ModuleLayerDiagramProps) {
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
          <p className="font-semibold text-neutral-900">BoaCRM Module Stack</p>
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
                  transform: active === layer.id ? "translateY(-4px) scale(1.02)" : "translateY(0px) scale(1)",
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
            Each layer builds on the one below \u2014 from core customer data through sales automation,
            regulatory compliance, to AI-powered insights and predictive analytics.
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
        <div
          key={activeFeature.id}
          className="bg-white border border-neutral-100 rounded-2xl shadow-xl p-6 space-y-4"
          style={{ animation: 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
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
                <li
                  key={cap}
                  className="flex items-start gap-2"
                  style={{ animation: `fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 80}ms both` }}
                >
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
            <Link href="/contact?product=boacrm">
              Learn more
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
