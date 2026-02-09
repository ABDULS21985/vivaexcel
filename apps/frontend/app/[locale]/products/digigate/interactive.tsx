'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Calculator,
  Info,
  Layers,
  Shield,
  GitBranch,
  Activity,
  Code2,
  Settings,
} from "lucide-react";
import { Button } from "@digibit/ui/components";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Shield,
  GitBranch,
  Layers,
  Activity,
  Code2,
  Settings,
};

/* ------------------------------------------------------------------ */
/* Performance Estimator                                               */
/* ------------------------------------------------------------------ */

type PerformanceEstimatorProps = { accentColor: string };

const volumeOptions = [
  { key: "low", label: "< 1M/mo", uptimeGain: 15, securityReduction: 60, timeSavings: 40 },
  { key: "mid", label: "1M – 10M", uptimeGain: 35, securityReduction: 80, timeSavings: 65 },
  { key: "high", label: "10M+", uptimeGain: 55, securityReduction: 95, timeSavings: 85 },
] as const;

const setupOptions = [
  { key: "none", label: "No gateway", multiplier: 1.4 },
  { key: "basic", label: "Basic proxy", multiplier: 1.0 },
  { key: "legacy", label: "Legacy gateway", multiplier: 0.8 },
] as const;

const securityOptions = [
  { key: "standard", label: "Standard", multiplier: 0.7 },
  { key: "advanced", label: "Advanced", multiplier: 1.0 },
  { key: "enterprise", label: "Enterprise", multiplier: 1.3 },
] as const;

export function PerformanceEstimator({ accentColor }: PerformanceEstimatorProps) {
  const [volume, setVolume] = useState<string>("mid");
  const [setup, setSetup] = useState<string>("basic");
  const [security, setSecurity] = useState<string>("advanced");

  const results = useMemo(() => {
    const vol = volumeOptions.find((v) => v.key === volume) ?? volumeOptions[1];
    const set = setupOptions.find((s) => s.key === setup) ?? setupOptions[1];
    const sec = securityOptions.find((s) => s.key === security) ?? securityOptions[1];
    const uptime = Math.min(99, Math.round(vol.uptimeGain * set.multiplier * sec.multiplier));
    const secReduction = Math.min(99, Math.round(vol.securityReduction * set.multiplier * sec.multiplier));
    const timeSavings = Math.min(95, Math.round(vol.timeSavings * set.multiplier * sec.multiplier));
    return { uptime: uptime + "%", secReduction: secReduction + "%", timeSavings: timeSavings + "%" };
  }, [volume, setup, security]);

  const ac = accentColor;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-neutral-100 rounded-2xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: ac + "22" }}
        >
          <Calculator size={18} style={{ color: ac }} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Estimator</p>
          <p className="font-semibold text-neutral-900">Performance Estimator</p>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {/* API Volume */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-neutral-800">API Volume</p>
          <div className="grid grid-cols-3 gap-2">
            {volumeOptions.map((opt) => {
              const selected = volume === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setVolume(opt.key)}
                  className={"p-3 rounded-xl border text-left text-sm transition-all duration-200 hover:-translate-y-0.5 " + (selected ? "shadow-md" : "shadow-sm")}
                  style={{
                    borderColor: selected ? ac : "rgba(0,0,0,0.07)",
                    backgroundColor: selected ? ac + "12" : "white",
                  }}
                >
                  <p className="font-semibold text-neutral-900">{opt.label}</p>
                  <p className="text-xs text-neutral-600">requests</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Setup */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-neutral-800">Current Setup</p>
          <div className="grid grid-cols-3 gap-2">
            {setupOptions.map((opt) => {
              const selected = setup === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSetup(opt.key)}
                  className={"p-3 rounded-xl border text-left text-sm transition-all duration-200 hover:-translate-y-0.5 " + (selected ? "shadow-md" : "shadow-sm")}
                  style={{
                    borderColor: selected ? ac : "rgba(0,0,0,0.07)",
                    backgroundColor: selected ? ac + "12" : "white",
                  }}
                >
                  <p className="font-semibold text-neutral-900">{opt.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Needs */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-neutral-800">Security Needs</p>
          <div className="grid grid-cols-3 gap-2">
            {securityOptions.map((opt) => {
              const selected = security === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSecurity(opt.key)}
                  className={"p-3 rounded-xl border text-left text-sm transition-all duration-200 hover:-translate-y-0.5 " + (selected ? "shadow-md" : "shadow-sm")}
                  style={{
                    borderColor: selected ? ac : "rgba(0,0,0,0.07)",
                    backgroundColor: selected ? ac + "12" : "white",
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
          style={{ borderColor: ac + "40", backgroundColor: ac + "08" }}
        >
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-600">Uptime improvement</p>
              <p key={results.uptime} className="text-2xl font-bold text-neutral-900" style={{ animation: 'fade-in-scale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>{results.uptime}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-600">Incident reduction</p>
              <p key={results.secReduction} className="text-2xl font-bold text-neutral-900" style={{ animation: 'fade-in-scale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>{results.secReduction}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-600">Time savings</p>
              <p key={results.timeSavings} className="text-2xl font-bold" style={{ color: ac, animation: 'fade-in-scale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>{results.timeSavings}</p>
            </div>
          </div>
          <Button
            asChild
            className="w-full font-semibold"
            style={{ backgroundColor: ac, borderColor: ac }}
          >
            <Link href="/contact?product=digigate&context=performance">
              Request Architecture Review
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gateway Layer Diagram                                               */
/* ------------------------------------------------------------------ */

export type GatewayLayer = {
  id: string;
  label: string;
  description: string;
  accent?: string;
};

type GatewayLayerDiagramProps = {
  layers: GatewayLayer[];
  accentColor: string;
};

export function GatewayLayerDiagram({ layers, accentColor }: GatewayLayerDiagramProps) {
  const [active, setActive] = useState(layers[layers.length - 1]?.id ?? "");
  const activeLayer = layers.find((l) => l.id === active) ?? layers[layers.length - 1];
  const ac = accentColor;

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: ac + "22" }}
        >
          <Layers size={18} style={{ color: ac }} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Architecture</p>
          <p className="font-semibold text-neutral-900">DigiGate Gateway Stack</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-6 items-center">
        <div className="relative w-full aspect-square max-w-md mx-auto">
          {layers.map((layer, idx) => {
            const size = 100 - idx * 18;
            const layerColor = layer.accent ?? ac;
            const isInnermost = idx === layers.length - 1;
            return (
              <div
                key={layer.id}
                className="absolute inset-0 m-auto rounded-full transition-all duration-500 cursor-pointer"
                style={{
                  width: size + "%",
                  height: size + "%",
                  background: "radial-gradient(circle at 30% 30%, " + layerColor + "33, " + layerColor + "08)",
                  border: "2px solid " + layerColor + "55",
                  transform: active === layer.id ? "translateY(-4px) scale(1.02)" : "translateY(0px)",
                  boxShadow: active === layer.id ? `0 8px 30px -8px ${layerColor}40` : "none",
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
              backgroundColor: (activeLayer?.accent ?? ac) + "15",
              color: activeLayer?.accent ?? ac,
            }}
          >
            <Info size={14} />
            {activeLayer?.label}
          </div>
          <p className="text-base text-neutral-700">{activeLayer?.description}</p>
          <p className="text-sm text-neutral-600">
            Each layer is independently scalable — from client-facing ingress, through security
            enforcement, to intelligent routing and backend service orchestration.
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
  const ac = accentColor;

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
              className={"w-full text-left p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-3 " + (selected ? "shadow-lg" : "shadow-sm")}
              style={{
                borderColor: selected ? ac : "rgba(0,0,0,0.06)",
                backgroundColor: selected ? ac + "10" : "white",
              }}
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: selected ? ac + "22" : "#f5f5f5",
                  color: selected ? ac : "#737373",
                }}
              >
                {Icon && <Icon size={20} />}
              </div>
              <p className={"font-semibold " + (selected ? "text-neutral-900" : "text-neutral-700")}>
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
              style={{ backgroundColor: ac + "22", color: ac }}
            >
              {ActiveIcon && <ActiveIcon size={24} />}
            </div>
            <div>
              <p className="font-bold text-lg text-neutral-900">{activeFeature.title}</p>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: ac + "15", color: ac }}
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
                    style={{ color: ac }}
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
            style={{ borderColor: ac, color: ac }}
          >
            <Link href="/contact?product=digigate">
              Learn more
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
