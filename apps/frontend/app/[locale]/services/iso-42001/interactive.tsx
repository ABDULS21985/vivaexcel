'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Info,
  Play,
  ShieldCheck,
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
  const progress = ((step + 1) / totalQuestions) * 100;
  const current = quiz.questions[step];

  const totalScore = useMemo(
    () => Object.values(answers).reduce((sum, v) => sum + v, 0),
    [answers]
  );
  const maxScore = useMemo(
    () => quiz.questions.reduce((sum, q) => sum + Math.max(...q.options.map((o) => o.score)), 0),
    [quiz.questions]
  );

  const stage =
    totalScore >= maxScore * 0.75
      ? "Fast-Track Ready"
      : totalScore >= maxScore * 0.45
        ? "Structured Build Needed"
        : "Foundational Work First";

  const handleSelect = (score: number) => {
    setAnswers((prev) => ({ ...prev, [current.id]: score }));
  };

  const handleNext = () => {
    if (step < totalQuestions - 1) setStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const isComplete = Object.keys(answers).length === totalQuestions;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-neutral-100 rounded-2xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}22` }}
          >
            <Play size={18} style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">Readiness Quiz</p>
            <p className="font-semibold text-neutral-900">{quiz.headline ?? "AI Governance Readiness"}</p>
          </div>
        </div>
        <div className="text-sm text-neutral-600">
          Step {step + 1} of {totalQuestions}
        </div>
      </div>

      <div className="px-6">
        <div className="h-2 rounded-full bg-neutral-100 overflow-hidden mb-6">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: accentColor }}
          />
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
                onClick={() => handleSelect(option.score)}
                className={`text-left p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
                  selected
                    ? "shadow-lg"
                    : "shadow-sm"
                }`}
                style={{
                  borderColor: selected ? accentColor : "rgba(0,0,0,0.06)",
                  backgroundColor: selected ? `${accentColor}15` : "white",
                }}
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5"
                    style={{ color: selected ? accentColor : "#9ca3af" }}
                  />
                  <div>
                    <p className="font-semibold text-neutral-900">{option.label}</p>
                    {option.helper && (
                      <p className="text-xs text-neutral-600 mt-1">{option.helper}</p>
                    )}
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
            onClick={handlePrev}
            disabled={step === 0}
            className="text-neutral-600"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {step < totalQuestions - 1 && (
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                disabled={answers[current.id] === undefined}
                style={{ backgroundColor: accentColor, borderColor: accentColor }}
              >
                Next
                <ArrowRight size={16} className="ml-1" />
              </Button>
            )}
            {step === totalQuestions - 1 && (
              <Button
                asChild
                size="sm"
                className="font-semibold"
                disabled={!isComplete}
                style={{
                  backgroundColor: accentColor,
                  borderColor: accentColor,
                }}
              >
                <Link href={`/contact?service=${serviceSlug}&context=ai-readiness`}>
                  {quiz.ctaLabel ?? "Talk to an expert"}
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {isComplete && (
          <div
            className="mt-4 p-4 rounded-xl border"
            style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}10` }}
          >
            <div className="flex items-start gap-3">
              <ShieldCheck size={18} style={{ color: accentColor }} className="mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-900">Result: {stage}</p>
                <p className="text-sm text-neutral-700">
                  Score {totalScore} / {maxScore}. We’ll map this to a tailored 42001 playbook on your call.
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

export function TimeToCertEstimatorCard({ estimator, accentColor }: EstimatorProps) {
  const [size, setSize] = useState<keyof typeof estimator.baseMonthsBySize>("mid");
  const [maturity, setMaturity] = useState<keyof typeof estimator.maturityAdjustments>("developing");
  const [accelerators, setAccelerators] = useState<Record<number, boolean>>({});

  const months = useMemo(() => {
    const base = estimator.baseMonthsBySize[size] ?? 0;
    const maturityAdj = estimator.maturityAdjustments[maturity] ?? 0;
    const accelSum = (estimator.accelerators || []).reduce((sum, acc, idx) => {
      return sum + (accelerators[idx] ? acc.deltaMonths : 0);
    }, 0);
    const total = base + maturityAdj + accelSum;
    const floor = estimator.floorMonths ?? 0;
    return Math.max(floor, Math.round(total * 10) / 10);
  }, [accelerators, estimator, maturity, size]);

  const targetDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + Math.round(months));
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [months]);

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}22` }}
        >
          <Timer size={18} style={{ color: accentColor }} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Estimator</p>
          <p className="font-semibold text-neutral-900">Time-to-Certification</p>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-neutral-800">Company size</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(estimator.baseMonthsBySize).map(([key, base]) => {
                const selected = key === size;
                const labels: Record<string, string> = {
                  small: "<200 FTE",
                  mid: "200-1000 FTE",
                  enterprise: "1000+ FTE",
                };
                return (
                  <button
                    key={key}
                    onClick={() => setSize(key as typeof size)}
                    className={`p-3 rounded-xl border text-left text-sm transition-all ${
                      selected ? "shadow-md" : "shadow-sm"
                    }`}
                    style={{
                      borderColor: selected ? accentColor : "rgba(0,0,0,0.07)",
                      backgroundColor: selected ? `${accentColor}12` : "white",
                    }}
                  >
                    <p className="font-semibold text-neutral-900">{labels[key] ?? key}</p>
                    <p className="text-xs text-neutral-600">Base {base} mo.</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-neutral-800">AI maturity</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(estimator.maturityAdjustments).map(([key, adj]) => {
                const selected = key === maturity;
                const labels: Record<string, string> = {
                  "ad-hoc": "Ad-hoc",
                  developing: "Developing",
                  managed: "Managed",
                };
                return (
                  <button
                    key={key}
                    onClick={() => setMaturity(key as typeof maturity)}
                    className={`p-3 rounded-xl border text-left text-sm transition-all ${
                      selected ? "shadow-md" : "shadow-sm"
                    }`}
                    style={{
                      borderColor: selected ? accentColor : "rgba(0,0,0,0.07)",
                      backgroundColor: selected ? `${accentColor}12` : "white",
                    }}
                  >
                    <p className="font-semibold text-neutral-900">{labels[key] ?? key}</p>
                    <p className="text-xs text-neutral-600">{adj >= 0 ? `+${adj}` : adj} mo.</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {estimator.accelerators && estimator.accelerators.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-neutral-800">Accelerators</p>
            <div className="grid sm:grid-cols-3 gap-2">
              {estimator.accelerators.map((acc, idx) => {
                const selected = accelerators[idx] ?? false;
                return (
                  <button
                    key={acc.label}
                    onClick={() =>
                      setAccelerators((prev) => ({ ...prev, [idx]: !selected }))
                    }
                    className={`p-3 rounded-xl border text-left text-sm transition-all ${
                      selected ? "shadow-md" : "shadow-sm"
                    }`}
                    style={{
                      borderColor: selected ? accentColor : "rgba(0,0,0,0.07)",
                      backgroundColor: selected ? `${accentColor}12` : "white",
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5"
                        style={{ color: selected ? accentColor : "#9ca3af" }}
                      />
                      <div>
                        <p className="font-semibold text-neutral-900">{acc.label}</p>
                        <p className="text-xs text-neutral-600">
                          {acc.deltaMonths > 0 ? "+" : ""}
                          {acc.deltaMonths} mo.
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div
          className="mt-2 p-4 rounded-2xl border flex items-center justify-between"
          style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}08` }}
        >
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-600">Projected timeline</p>
            <p className="text-3xl font-bold text-neutral-900">{months} months</p>
            <p className="text-sm text-neutral-700">Target certification window: {targetDate}</p>
          </div>
          <Button
            asChild
            className="font-semibold"
            style={{ backgroundColor: accentColor, borderColor: accentColor }}
          >
            <Link href={`/contact?service=iso-42001&context=estimator`}>
              Request a tailored plan
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

type DiagramProps = {
  layers: DiagramLayer[];
  accentColor: string;
};

export function IsoLayerDiagram({ layers, accentColor }: DiagramProps) {
  const [active, setActive] = useState(layers[layers.length - 1]?.id ?? "");

  const activeLayer = layers.find((l) => l.id === active) ?? layers[layers.length - 1];

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}22` }}
        >
          <Circle size={18} style={{ color: accentColor }} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Standards Stack</p>
          <p className="font-semibold text-neutral-900">How 42001 wraps 27001 & 27701</p>
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
                className="absolute inset-0 m-auto rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  width: `${size}%`,
                  height: `${size}%`,
                  background: `radial-gradient(circle at 30% 30%, ${layer.accent ?? accentColor}33, ${layer.accent ?? accentColor}08)`,
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${activeLayer?.accent ?? accentColor}15`, color: activeLayer?.accent ?? accentColor }}>
            <Info size={14} />
            {activeLayer?.label}
          </div>
          <p className="text-base text-neutral-700">{activeLayer?.description}</p>
          <p className="text-sm text-neutral-600">
            27001 secures infrastructure, 27701 governs personal data, and 42001 layers AI-specific controls for fairness, transparency, and safety—one integrated management system.
          </p>
        </div>
      </div>
    </div>
  );
}
