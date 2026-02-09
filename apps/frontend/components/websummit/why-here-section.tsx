"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Fingerprint,
  ServerCrash,
  Scale,
  UserX,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Globe,
  ShieldCheck,
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
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PROBLEMS = [
  {
    icon: Fingerprint,
    title: "Fragmented Digital Identity",
    description:
      "Billions of credentials remain unverified, costing $600B+ annually in fraud and eroding institutional trust worldwide.",
    stat: "$600B+",
    statLabel: "annual fraud cost",
    accent: "accent-orange",
  },
  {
    icon: ServerCrash,
    title: "Legacy Infrastructure",
    description:
      "80% of enterprises run critical operations on outdated systems vulnerable to disruption, creating systemic risk across industries.",
    stat: "80%",
    statLabel: "on outdated systems",
    accent: "accent-red",
  },
  {
    icon: Scale,
    title: "Regulatory Complexity",
    description:
      "Organizations navigate 100+ compliance frameworks across jurisdictions, consuming resources that should drive innovation.",
    stat: "100+",
    statLabel: "compliance frameworks",
    accent: "secondary-yellow",
  },
  {
    icon: UserX,
    title: "Talent Gap",
    description:
      "3.5M unfilled cybersecurity positions globally threaten digital resilience and leave organizations exposed to evolving threats.",
    stat: "3.5M",
    statLabel: "unfilled positions",
    accent: "primary",
  },
];

const MISSION_BULLETS = [
  {
    label: "AI-Powered Intelligence",
    description: "Predictive analytics and autonomous threat detection",
  },
  {
    label: "Blockchain-Anchored Trust",
    description: "Immutable verification and decentralized identity",
  },
  {
    label: "Zero-Trust Cybersecurity",
    description: "Continuous authentication and adaptive access control",
  },
  {
    label: "Sovereign Digital Governance",
    description: "Regulatory-compliant frameworks for national scale",
  },
  {
    label: "Measurable Outcomes Guaranteed",
    description: "ROI-driven engagements with transparent KPIs",
  },
];

const BOTTOM_STATS = [
  {
    icon: TrendingUp,
    value: "$2.1T",
    label: "Digital trust market by 2030",
  },
  {
    icon: Globe,
    value: "50+",
    label: "Countries served across 4 continents",
  },
  {
    icon: ShieldCheck,
    value: "99.9%",
    label: "Platform uptime across deployments",
  },
];

/* -------------------------------------------------------------------------- */
/*  Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function WebSummitWhyHere() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      id="why-here"
      ref={ref}
      className="relative overflow-hidden bg-white py-24 lg:py-32"
      aria-label="Why We're Here"
    >
      {/* ===== Decorative background orbs ===== */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-accent-orange/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-secondary-yellow/[0.03] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ===== Section Header ===== */}
        <div
          className={`mb-16 text-center transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span className="mb-4 inline-block rounded-full border border-accent-orange/30 bg-accent-orange/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-orange">
            Problem &rarr; Opportunity
          </span>
          <h2 className="mt-4 text-3xl font-bold text-secondary sm:text-4xl lg:text-5xl">
            Why We&apos;re Here
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-gray">
            The digital landscape faces systemic challenges that demand a new
            class of solutions. We see each challenge as an opportunity to
            build lasting trust.
          </p>
        </div>

        {/* ===== Two-Column Layout ===== */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* --- Left Column: Problems --- */}
          <div className="space-y-6">
            <h3
              className={`mb-8 text-sm font-bold uppercase tracking-wider text-accent-red transition-all duration-700 delay-100 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              The Challenges We Solve
            </h3>

            {PROBLEMS.map((problem, idx) => {
              const Icon = problem.icon;
              return (
                <div
                  key={problem.title}
                  className={`group relative rounded-2xl border border-neutral-light bg-white p-6 shadow-md transition-all duration-700 hover:shadow-lg hover:border-${problem.accent}/30 ${
                    visible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-12 opacity-0"
                  }`}
                  style={{ transitionDelay: `${idx * 120 + 200}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-${problem.accent}/10 transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`h-6 w-6 text-${problem.accent}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <h4 className="text-base font-bold text-secondary">
                          {problem.title}
                        </h4>
                        <span
                          className={`rounded-full bg-${problem.accent}/10 px-3 py-0.5 text-xs font-bold text-${problem.accent}`}
                        >
                          {problem.stat}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-neutral-gray">
                        {problem.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom accent line on hover */}
                  <div
                    className={`absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-${problem.accent}/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />
                </div>
              );
            })}
          </div>

          {/* --- Right Column: Mission --- */}
          <div>
            <h3
              className={`mb-8 text-sm font-bold uppercase tracking-wider text-primary transition-all duration-700 delay-100 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              Our Mission at Web Summit Qatar
            </h3>

            {/* Mission statement card */}
            <div
              className={`relative mb-8 rounded-2xl border border-neutral-light bg-gradient-to-br from-primary/[0.03] to-accent-orange/[0.03] p-8 shadow-lg transition-all duration-700 delay-300 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-12 opacity-0"
              }`}
            >
              {/* Decorative sparkle */}
              <Sparkles className="absolute right-6 top-6 h-5 w-5 text-secondary-yellow/40" />

              <p className="mb-8 text-xl font-semibold leading-relaxed text-secondary lg:text-2xl">
                We bridge the gap between{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-accent-red">
                  emerging technology
                </span>{" "}
                and{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  real-world impact
                </span>
              </p>

              {/* Mission bullets */}
              <ul className="space-y-4">
                {MISSION_BULLETS.map((bullet, idx) => (
                  <li
                    key={bullet.label}
                    className={`flex items-start gap-3 transition-all duration-500 ${
                      visible
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-4 opacity-0"
                    }`}
                    style={{
                      transitionDelay: `${idx * 100 + 500}ms`,
                    }}
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <div>
                      <span className="text-sm font-semibold text-secondary">
                        {bullet.label}
                      </span>
                      <p className="text-sm text-neutral-gray">
                        {bullet.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* CTA link */}
              <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-primary transition-colors duration-300 hover:text-accent-orange">
                <a href="#solutions" className="flex items-center gap-2">
                  Explore Our Solutions
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Bottom Stats Row ===== */}
        <div
          className={`mt-20 grid gap-6 sm:grid-cols-3 transition-all duration-700 delay-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {BOTTOM_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`group relative rounded-2xl border border-neutral-light bg-neutral-light/50 p-6 text-center shadow-sm transition-all duration-500 hover:shadow-md hover:border-primary/20 ${
                  visible
                    ? "scale-100 opacity-100"
                    : "scale-95 opacity-0"
                }`}
                style={{ transitionDelay: `${idx * 120 + 800}ms` }}
              >
                <div className="mb-3 flex items-center justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="mb-1 text-3xl font-bold text-secondary lg:text-4xl">
                  {stat.value}
                </div>
                <p className="text-sm text-neutral-gray">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WebSummitWhyHere;
