"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  ClipboardCheck,
  Lightbulb,
  Rocket,
  TrendingUp,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Hook – scroll-triggered visibility                                        */
/* -------------------------------------------------------------------------- */

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* -------------------------------------------------------------------------- */
/*  Steps data                                                                */
/* -------------------------------------------------------------------------- */

const STEPS = [
  {
    number: 1,
    title: "Discovery",
    icon: Search,
    description:
      "Share your challenges and objectives in a focused 30-minute consultation",
  },
  {
    number: 2,
    title: "Assessment",
    icon: ClipboardCheck,
    description:
      "Our team evaluates your infrastructure, compliance posture, and digital maturity",
  },
  {
    number: 3,
    title: "Solution Design",
    icon: Lightbulb,
    description:
      "We architect a tailored roadmap leveraging AI, blockchain, and cybersecurity expertise",
  },
  {
    number: 4,
    title: "Implementation",
    icon: Rocket,
    description:
      "Agile delivery with bi-weekly sprints, continuous testing, and stakeholder alignment",
  },
  {
    number: 5,
    title: "Optimization",
    icon: TrendingUp,
    description:
      "Ongoing monitoring, training, and iterative refinement to maximize ROI",
  },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function WebSummitDemoJourney() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative overflow-hidden bg-neutral-light py-24 lg:py-32"
    >
      {/* ---------- subtle dot pattern background ---------- */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-neutral-gray) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* ---------- decorative background orbs ---------- */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-orange/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ==================== Header ==================== */}
        <div
          className={`mb-20 text-center transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            Our Process
          </span>

          <h2 className="mt-4 text-3xl font-bold text-secondary sm:text-4xl lg:text-5xl">
            From Vision{" "}
            <span className="bg-gradient-to-r from-primary to-accent-orange bg-clip-text text-transparent">
              to Value
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-gray">
            A proven methodology refined across 500+ enterprise engagements
          </p>
        </div>

        {/* ==================== Desktop Flow (lg+) ==================== */}
        <div className="hidden lg:block">
          <div className="relative flex items-start justify-between">
            {/* connecting line (sits behind the cards) */}
            <div
              className={`absolute left-[10%] right-[10%] top-[52px] h-px bg-gradient-to-r from-primary/30 via-secondary/30 to-accent-orange/30 transition-all duration-1000 ${
                visible
                  ? "scale-x-100 opacity-100"
                  : "scale-x-0 opacity-0"
              }`}
              style={{ transformOrigin: "left center", transitionDelay: "300ms" }}
            />

            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className={`group relative flex w-1/5 flex-col items-center px-2 transition-all duration-700 hover:-translate-y-1 ${
                    visible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-12 opacity-0"
                  }`}
                  style={{ transitionDelay: `${idx * 150 + 200}ms` }}
                >
                  {/* numbered circle */}
                  <div
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-sm font-bold text-white shadow-lg transition-shadow duration-500 ${
                      visible
                        ? "shadow-primary/25"
                        : "shadow-transparent"
                    }`}
                    style={{
                      boxShadow: visible
                        ? "0 0 20px var(--color-primary, rgba(59,130,246,0.25))"
                        : "none",
                      transitionDelay: `${idx * 150 + 400}ms`,
                    }}
                  >
                    {step.number}
                  </div>

                  {/* card */}
                  <div className="mt-6 w-full rounded-2xl border border-neutral-light bg-white p-6 shadow-lg transition-all duration-500 group-hover:shadow-xl">
                    {/* icon */}
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    {/* title */}
                    <h3 className="mb-2 text-base font-bold text-secondary">
                      {step.title}
                    </h3>

                    {/* description */}
                    <p className="text-sm leading-relaxed text-neutral-gray">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== Mobile / Tablet Timeline (< lg) ==================== */}
        <div className="lg:hidden">
          <div className="relative">
            {/* vertical connecting line */}
            <div
              className={`absolute bottom-0 left-5 top-0 w-px bg-gradient-to-b from-primary/30 via-secondary/30 to-accent-orange/30 transition-all duration-1000 ${
                visible
                  ? "scale-y-100 opacity-100"
                  : "scale-y-0 opacity-0"
              }`}
              style={{ transformOrigin: "top center", transitionDelay: "300ms" }}
            />

            <div className="space-y-8">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className={`relative flex gap-5 transition-all duration-700 ${
                      visible
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-8 opacity-0"
                    }`}
                    style={{ transitionDelay: `${idx * 150 + 200}ms` }}
                  >
                    {/* numbered circle */}
                    <div
                      className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-sm font-bold text-white shadow-lg"
                      style={{
                        boxShadow: visible
                          ? "0 0 20px var(--color-primary, rgba(59,130,246,0.25))"
                          : "none",
                      }}
                    >
                      {step.number}
                    </div>

                    {/* card */}
                    <div className="flex-1 rounded-2xl border border-neutral-light bg-white p-6 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
                      {/* icon */}
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>

                      {/* title */}
                      <h3 className="mb-2 text-base font-bold text-secondary">
                        {step.title}
                      </h3>

                      {/* description */}
                      <p className="text-sm leading-relaxed text-neutral-gray">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
