'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Code2,
  Info,
  Timer,
} from "lucide-react";
import { Button } from "@ktblog/ui/components";
import type {
  DiagramLayer,
  ReadinessQuizConfig,
  TimeToCertEstimator,
} from "@/types/services-global";

type QuizProps = {
  quiz: ReadinessQuizConfig;
  accentColor: string;
  serviceSlug: string;
};

export function ReadinessQuiz({ quiz, accentColor, serviceSlug }: QuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const totalQuestions = quiz.questions.length;
  const current = quiz.questions[step];
  const progress = ((step + 1) / totalQuestions) * 100;

  const totalScore = useMemo(
    () => Object.values(answers).reduce((sum, v) => sum + v, 0),
    [answers]
  );
  const maxScore = useMemo(
    () => quiz.questions.reduce((sum, q) => sum + Math.max(...q.options.map((o) => o.score)), 0),
    [quiz.questions]
  );

  const stage =
    totalScore >= maxScore * 0.7
      ? "Ready to accelerate"
      : totalScore >= maxScore * 0.45
        ? "Structured build needed"
        : "Start with foundations";

  const select = (score: number) => setAnswers((prev) => ({ ...prev, [current.id]: score }));

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accentColor}18` }}>
            <ClipboardCheck size={18} style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">Readiness Quiz</p>
            <p className="font-semibold text-neutral-900">{quiz.headline ?? "Engineering Readiness"}</p>
          </div>
        </div>
        <span className="text-sm text-neutral-600">Step {step + 1}/{totalQuestions}</span>
      </div>

      <div className="px-6">
        <div className="h-2 rounded-full bg-neutral-100 overflow-hidden mb-6">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: accentColor }} />
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        <p className="text-lg font-semibold text-neutral-900">{current.prompt}</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {current.options.map((option) => {
            const selected = answers[current.id] === option.score;
            return (
              <button
                key={option.value}
                onClick={() => select(option.score)}
                className={`p-3 text-left rounded-xl border transition-all ${selected ? "shadow-md" : "shadow-sm"}`}
                style={{
                  borderColor: selected ? accentColor : "rgba(0,0,0,0.08)",
                  backgroundColor: selected ? `${accentColor}15` : "white",
                }}
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="mt-0.5" style={{ color: selected ? accentColor : "#a3a3a3" }} />
                  <div>
                    <p className="font-semibold text-neutral-900">{option.label}</p>
                    {option.helper && <p className="text-xs text-neutral-600 mt-1">{option.helper}</p>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-neutral-600"
          >
            <ArrowLeft size={16} className="mr-1" /> Back
          </Button>
          {step < totalQuestions - 1 ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setStep((s) => Math.min(totalQuestions - 1, s + 1))}
              disabled={answers[current.id] === undefined}
              style={{ backgroundColor: accentColor, borderColor: accentColor }}
            >
              Next <ArrowRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="font-semibold"
              disabled={Object.keys(answers).length !== totalQuestions}
              style={{ backgroundColor: accentColor, borderColor: accentColor }}
            >
              <Link href={`/contact?service=${serviceSlug}&context=engineering-readiness`}>
                {quiz.ctaLabel ?? "Talk to an architect"} <ArrowRight size={16} className="ml-1" />
              </Link>
            </Button>
          )}
        </div>

        {Object.keys(answers).length === totalQuestions && (
          <div className="mt-4 p-4 rounded-xl border" style={{ borderColor: `${accentColor}35`, backgroundColor: `${accentColor}10` }}>
            <div className="flex items-start gap-3">
              <Code2 size={18} style={{ color: accentColor }} className="mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-900">Result: {stage}</p>
                <p className="text-sm text-neutral-700">
                  Score {totalScore} / {maxScore}. We&apos;ll map this to a tailored engineering plan on your call.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type EstimatorProps = {
  estimator: TimeToCertEstimator;
  accentColor: string;
};

export function TimeToDeliveryEstimator({ estimator, accentColor }: EstimatorProps) {
  const [size, setSize] = useState<keyof typeof estimator.baseMonthsBySize>("mid");
  const [maturity, setMaturity] = useState<keyof typeof estimator.maturityAdjustments>("developing");
  const [accels, setAccels] = useState<Record<number, boolean>>({});

  const months = useMemo(() => {
    const base = estimator.baseMonthsBySize[size] ?? 0;
    const maturityAdj = estimator.maturityAdjustments[maturity] ?? 0;
    const accel = (estimator.accelerators ?? []).reduce((sum, item, idx) => sum + (accels[idx] ? item.deltaMonths : 0), 0);
    const total = Math.max(estimator.floorMonths ?? 0, Math.round((base + maturityAdj + accel) * 10) / 10);
    return total;
  }, [accels, estimator, maturity, size]);

  const sprints = Math.max(1, Math.round(months * 2));

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accentColor}18` }}>
          <Timer size={18} style={{ color: accentColor }} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Estimator</p>
          <p className="font-semibold text-neutral-900">Time to first release</p>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        <SelectorRow
          title="Project complexity"
          options={estimator.baseMonthsBySize}
          selected={size}
          onSelect={(k) => setSize(k)}
          accentColor={accentColor}
          labels={{ small: "MVP / Small", mid: "Mid-size app", enterprise: "Enterprise platform" }}
          suffix="mo."
        />

        <SelectorRow
          title="Engineering maturity"
          options={estimator.maturityAdjustments}
          selected={maturity}
          onSelect={(k) => setMaturity(k)}
          accentColor={accentColor}
          labels={{ "ad-hoc": "Ad-hoc", developing: "Developing", managed: "Managed" }}
          formatValue={(v) => (v >= 0 ? `+${v}` : v)}
          suffix="mo."
        />

        {estimator.accelerators && estimator.accelerators.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-neutral-800">Accelerators</p>
            <div className="grid sm:grid-cols-3 gap-2">
              {estimator.accelerators.map((acc, idx) => {
                const selected = accels[idx] ?? false;
                return (
                  <button
                    key={acc.label}
                    onClick={() => setAccels((prev) => ({ ...prev, [idx]: !selected }))}
                    className={`p-3 rounded-xl border text-left text-sm transition-all ${selected ? "shadow-md" : "shadow-sm"}`}
                    style={{
                      borderColor: selected ? accentColor : "rgba(0,0,0,0.08)",
                      backgroundColor: selected ? `${accentColor}12` : "white",
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5" style={{ color: selected ? accentColor : "#a3a3a3" }} />
                      <div>
                        <p className="font-semibold text-neutral-900">{acc.label}</p>
                        <p className="text-xs text-neutral-600">{acc.deltaMonths > 0 ? "+" : ""}{acc.deltaMonths} mo.</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-2 p-4 rounded-2xl border flex items-center justify-between" style={{ borderColor: `${accentColor}35`, backgroundColor: `${accentColor}08` }}>
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-600">Projected timeline</p>
            <p className="text-3xl font-bold text-neutral-900">{months} months</p>
            <p className="text-sm text-neutral-700">~{sprints} sprints to first production release.</p>
          </div>
          <Button
            asChild
            className="font-semibold"
            style={{ backgroundColor: accentColor, borderColor: accentColor }}
          >
            <Link href="/contact?service=software-development&context=estimator">
              Scope my project <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SelectorRow({
  title,
  options,
  selected,
  onSelect,
  accentColor,
  labels,
  formatValue,
  suffix,
}: {
  title: string;
  options: Record<string, number>;
  selected: string;
  onSelect: (key: keyof typeof options) => void;
  accentColor: string;
  labels?: Record<string, string>;
  formatValue?: (v: number) => string | number;
  suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-neutral-800">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(options).map(([key, val]) => {
          const sel = key === selected;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`p-3 rounded-xl border text-left text-sm transition-all ${sel ? "shadow-md" : "shadow-sm"}`}
              style={{
                borderColor: sel ? accentColor : "rgba(0,0,0,0.08)",
                backgroundColor: sel ? `${accentColor}12` : "white",
              }}
            >
              <p className="font-semibold text-neutral-900">{labels?.[key] ?? key}</p>
              <p className="text-xs text-neutral-600">{formatValue ? formatValue(val) : val} {suffix ?? ""}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type DiagramProps = {
  layers: DiagramLayer[];
  accentColor: string;
};

export function EngineeringStackDiagram({ layers, accentColor }: DiagramProps) {
  const [active, setActive] = useState(layers[layers.length - 1]?.id ?? "");
  const activeLayer = layers.find((l) => l.id === active) ?? layers[layers.length - 1];

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accentColor}18` }}>
          <Circle size={18} style={{ color: accentColor }} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Architecture</p>
          <p className="font-semibold text-neutral-900">Engineering Stack</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_1fr] gap-6 items-center">
        <div className="relative w-full aspect-square max-w-md mx-auto">
          {layers.map((layer, idx) => {
            const size = 100 - idx * 18;
            const isInnermost = idx === layers.length - 1;
            return (
              <div
                key={layer.id}
                className="absolute inset-0 m-auto rounded-full cursor-pointer transition-all duration-300"
                style={{
                  width: `${size}%`,
                  height: `${size}%`,
                  background: `radial-gradient(circle at 30% 30%, ${(layer.accent ?? accentColor)}33, ${(layer.accent ?? accentColor)}0c)`,
                  border: `2px solid ${(layer.accent ?? accentColor)}55`,
                  transform: active === layer.id ? "translateY(-4px)" : "translateY(0px)",
                  zIndex: layers.length - idx,
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
              backgroundColor: `${activeLayer?.accent ?? accentColor}18`,
              color: activeLayer?.accent ?? accentColor,
            }}
          >
            <Info size={14} />
            {activeLayer?.label}
          </div>
          <p className="text-base text-neutral-700">{activeLayer?.description}</p>
          <p className="text-sm text-neutral-600">
            Each layer is independently scalable and testable. Infrastructure as code ensures parity across environments,
            while automated quality gates prevent defects from reaching production.
          </p>
        </div>
      </div>
    </div>
  );
}
