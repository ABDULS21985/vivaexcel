"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Briefcase,
  Rocket,
  Brain,
  ShieldCheck,
  Cloud,
  Blocks,
  Heart,
  Building2,
  ChevronDown,
  Clock,
  Landmark,
  Stethoscope,
  Radio,
  Zap,
} from "lucide-react";

/* ========================================================================== */
/*  HOOK - Scroll-triggered visibility                                        */
/* ========================================================================== */

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

/* ========================================================================== */
/*  TYPES                                                                     */
/* ========================================================================== */

interface ServiceTower {
  icon: React.ReactNode;
  name: string;
  services: string[];
  detail: string;
  accent: string;
  iconColor: string;
  bgColor: string;
}

interface EngagementModel {
  label: string;
  duration: string;
  description: string;
}

interface IndustryCard {
  icon: React.ReactNode;
  name: string;
  focuses: string[];
  accentBorder: string;
  accentText: string;
  accentBg: string;
}

/* ========================================================================== */
/*  CONSTANTS - Service Towers                                                */
/* ========================================================================== */

const SERVICE_TOWERS: ServiceTower[] = [
  {
    icon: <Briefcase className="h-6 w-6" />,
    name: "Business Strategy",
    services: ["Corporate Strategy", "Digital Strategy", "Growth & Monetization"],
    detail:
      "We partner with C-suite leaders to define corporate direction, identify digital revenue streams, and build monetization frameworks that deliver measurable ROI across every business unit.",
    accent: "border-primary/30",
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    name: "Digital Transformation",
    services: ["Roadmaps", "Intelligent Automation", "Agile Delivery"],
    detail:
      "End-to-end transformation programs that combine strategic roadmapping, RPA/IPA automation, and scaled agile methodologies to modernize legacy operations and accelerate time-to-value.",
    accent: "border-accent-orange/30",
    iconColor: "text-accent-orange",
    bgColor: "bg-accent-orange/10",
  },
  {
    icon: <Brain className="h-6 w-6" />,
    name: "AI & Data",
    services: ["AI Strategy", "Data Governance (ISO 42001)", "ML/AI Solutions", "MLOps"],
    detail:
      "From AI readiness assessments to production-grade MLOps pipelines, we help organizations harness data responsibly with ISO 42001-aligned governance and scalable machine learning platforms.",
    accent: "border-secondary-yellow/30",
    iconColor: "text-secondary-yellow",
    bgColor: "bg-secondary-yellow/10",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    name: "Cybersecurity",
    services: ["Security Strategy", "Zero Trust", "SOC", "Incident Response"],
    detail:
      "Comprehensive security services spanning zero-trust architecture design, 24/7 SOC operations, threat hunting, and rapid incident response to protect critical digital assets.",
    accent: "border-accent-red/30",
    iconColor: "text-accent-red",
    bgColor: "bg-accent-red/10",
  },
  {
    icon: <Cloud className="h-6 w-6" />,
    name: "Cloud & Platform",
    services: ["Cloud Strategy", "Migration", "Platform Engineering", "FinOps"],
    detail:
      "Cloud-native strategy and migration services paired with platform engineering excellence and FinOps discipline to optimize cost, performance, and developer productivity.",
    accent: "border-primary/30",
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: <Blocks className="h-6 w-6" />,
    name: "Blockchain & DLT",
    services: ["DLT Feasibility", "Smart Contracts", "CBDC Advisory"],
    detail:
      "Distributed ledger feasibility studies, smart contract development and auditing, tokenization strategies, and central bank digital currency advisory for sovereign institutions.",
    accent: "border-accent-orange/30",
    iconColor: "text-accent-orange",
    bgColor: "bg-accent-orange/10",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    name: "Customer Experience",
    services: ["Journey Mapping", "Omnichannel", "CRM Implementation"],
    detail:
      "Design and implement seamless customer journeys across every touchpoint with omnichannel orchestration, CRM platform rollouts, and data-driven personalization engines.",
    accent: "border-secondary-yellow/30",
    iconColor: "text-secondary-yellow",
    bgColor: "bg-secondary-yellow/10",
  },
  {
    icon: <Building2 className="h-6 w-6" />,
    name: "Public Sector Modernization",
    services: ["e-Government", "National ID", "Digital Services"],
    detail:
      "National-scale e-government platforms, digital identity ecosystems, and citizen-centric service portals that streamline public administration and enhance transparency.",
    accent: "border-secondary/30",
    iconColor: "text-secondary",
    bgColor: "bg-secondary/10",
  },
];

const ENGAGEMENT_MODELS: EngagementModel[] = [
  {
    label: "Advisory Sprints",
    duration: "2 - 6 weeks",
    description: "Rapid assessments, audits, and strategic recommendations",
  },
  {
    label: "Implementation Programs",
    duration: "6 weeks - 12 months",
    description: "Full-cycle delivery from design through deployment",
  },
  {
    label: "Managed Services",
    duration: "Ongoing",
    description: "Continuous operations, monitoring, and optimization",
  },
  {
    label: "Training Academies",
    duration: "1 day - 12 weeks",
    description: "Upskilling workshops, certifications, and boot camps",
  },
];

/* ========================================================================== */
/*  CONSTANTS - Industry Cards                                                */
/* ========================================================================== */

const INDUSTRIES: IndustryCard[] = [
  {
    icon: <Landmark className="h-7 w-7" />,
    name: "Financial Services",
    focuses: ["Banks", "Fintechs", "Regulators", "Insurance"],
    accentBorder: "border-primary",
    accentText: "text-primary",
    accentBg: "bg-primary/10",
  },
  {
    icon: <Building2 className="h-7 w-7" />,
    name: "Public Sector",
    focuses: ["Government Digitization", "Smart Cities"],
    accentBorder: "border-accent-orange",
    accentText: "text-accent-orange",
    accentBg: "bg-accent-orange/10",
  },
  {
    icon: <Stethoscope className="h-7 w-7" />,
    name: "Healthcare",
    focuses: ["EHR Systems", "Medical Credentials"],
    accentBorder: "border-accent-red",
    accentText: "text-accent-red",
    accentBg: "bg-accent-red/10",
  },
  {
    icon: <Radio className="h-7 w-7" />,
    name: "Telecommunications",
    focuses: ["Network Security", "Digital Channels"],
    accentBorder: "border-primary",
    accentText: "text-primary",
    accentBg: "bg-primary/10",
  },
  {
    icon: <Zap className="h-7 w-7" />,
    name: "Energy & Infrastructure",
    focuses: ["OT/IT Security", "SCADA", "Asset Tracking"],
    accentBorder: "border-accent-orange",
    accentText: "text-accent-orange",
    accentBg: "bg-accent-orange/10",
  },
];

/* ========================================================================== */
/*  SUBCOMPONENT - Expandable Service Card                                    */
/* ========================================================================== */

function ServiceCard({
  tower,
  index,
  visible,
}: {
  tower: ServiceTower;
  index: number;
  visible: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`group relative cursor-pointer rounded-2xl border ${
        expanded ? tower.accent : "border-neutral-light"
      } bg-white shadow-lg transition-all duration-700 hover:shadow-xl hover:shadow-primary/10 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 90 + 150}ms` }}
      onClick={() => setExpanded((prev) => !prev)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded((prev) => !prev);
        }
      }}
      aria-expanded={expanded}
    >
      <div className="relative p-5 sm:p-6">
        {/* header row */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${tower.bgColor} ${tower.iconColor} transition-transform duration-300 group-hover:scale-110`}
          >
            {tower.icon}
          </div>
          <ChevronDown
            className={`mt-1 h-4 w-4 flex-shrink-0 text-neutral-gray transition-transform duration-300 ${
              expanded ? "rotate-180 text-secondary" : ""
            }`}
          />
        </div>

        {/* tower name */}
        <h3 className="mb-3 text-base font-semibold text-secondary sm:text-lg">
          {tower.name}
        </h3>

        {/* service tags */}
        <div className="flex flex-wrap gap-1.5">
          {tower.services.map((service) => (
            <span
              key={service}
              className="rounded-full border border-neutral-light bg-neutral-light px-2.5 py-1 text-[11px] font-medium text-neutral-gray transition-colors duration-300 group-hover:text-secondary"
            >
              {service}
            </span>
          ))}
        </div>

        {/* expandable detail */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            expanded ? "mt-4 max-h-40 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-neutral-light pt-4">
            <p className="text-sm leading-relaxed text-neutral-gray">
              {tower.detail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*  SECTION 1 - WebSummitServices                                             */
/* ========================================================================== */

export function WebSummitServices() {
  const t = useTranslations("websummit");
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-neutral-light py-24 lg:py-32"
      aria-label="Consulting Services"
    >
      {/* decorative background orbs */}
      <div
        className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-20 h-[450px] w-[450px] rounded-full bg-accent-orange/5 blur-[100px]"
        aria-hidden="true"
      />

      {/* grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-primary) 0.5px, transparent 0.5px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ---- Section Header ---- */}
        <div
          className={`mb-14 text-center transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            {t("services.label")}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-secondary sm:text-4xl lg:text-5xl">
            {t("services.title1")}{" "}
            <span className="bg-gradient-to-r from-accent-orange via-secondary-yellow to-accent-orange bg-clip-text text-transparent">
              {t("services.title2")}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-gray sm:text-lg">
            {t("services.subtitle")}
          </p>
        </div>

        {/* ---- Service Towers Grid ---- */}
        <div className="mb-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_TOWERS.map((tower, idx) => (
            <ServiceCard
              key={tower.name}
              tower={tower}
              index={idx}
              visible={visible}
            />
          ))}
        </div>

        {/* ---- Engagement Models Timeline ---- */}
        <div
          className={`transition-all duration-700 delay-500 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h3 className="mb-8 text-center text-lg font-semibold uppercase tracking-wider text-neutral-gray sm:text-xl">
            {t("services.engagementModels")}
          </h3>

          {/* desktop: horizontal timeline */}
          <div className="hidden md:block">
            <div className="relative mx-auto max-w-5xl">
              {/* connector line */}
              <div className="absolute left-0 right-0 top-6 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

              <div className="grid grid-cols-4 gap-6">
                {ENGAGEMENT_MODELS.map((model, idx) => (
                  <div
                    key={model.label}
                    className={`relative pt-10 text-center transition-all duration-600 ${
                      visible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-6 opacity-0"
                    }`}
                    style={{ transitionDelay: `${idx * 120 + 800}ms` }}
                  >
                    {/* dot on timeline */}
                    <div className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center justify-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-lg shadow-primary/40" />
                      <span className="absolute h-5 w-5 animate-ping rounded-full bg-primary/20" />
                    </div>

                    <div className="rounded-xl border border-neutral-light bg-white p-5 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                      <h4 className="mb-1 text-sm font-bold text-secondary">
                        {model.label}
                      </h4>
                      <div className="mb-2 flex items-center justify-center gap-1.5 text-xs text-primary">
                        <Clock className="h-3 w-3" />
                        {model.duration}
                      </div>
                      <p className="text-xs leading-relaxed text-neutral-gray">
                        {model.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* mobile: vertical stack */}
          <div className="space-y-4 md:hidden">
            {ENGAGEMENT_MODELS.map((model, idx) => (
              <div
                key={model.label}
                className={`flex items-start gap-4 rounded-xl border-l-4 border-primary bg-white p-5 shadow-lg transition-all duration-600 ${
                  visible
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-6 opacity-0"
                }`}
                style={{ transitionDelay: `${idx * 100 + 800}ms` }}
              >
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-secondary">{model.label}</h4>
                  <span className="text-xs text-primary">{model.duration}</span>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-gray">
                    {model.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/*  SECTION 2 - WebSummitIndustries                                           */
/* ========================================================================== */

export function WebSummitIndustries() {
  const t = useTranslations("websummit");
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-white py-24 lg:py-32"
      aria-label="Industry Expertise"
    >
      {/* decorative background orbs */}
      <div
        className="pointer-events-none absolute -right-32 top-10 h-[420px] w-[420px] rounded-full bg-primary/5 blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-32 bottom-10 h-[380px] w-[380px] rounded-full bg-accent-orange/5 blur-[90px]"
        aria-hidden="true"
      />

      {/* dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-primary) 0.5px, transparent 0.5px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ---- Section Header ---- */}
        <div
          className={`mb-14 text-center transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            {t("industries.label")}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-secondary sm:text-4xl lg:text-5xl">
            {t("industries.title1")}{" "}
            <span className="bg-gradient-to-r from-secondary-yellow via-primary to-secondary-yellow bg-clip-text text-transparent">
              {t("industries.title2")}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-gray sm:text-lg">
            {t("industries.subtitle")}
          </p>
        </div>

        {/* ---- Industry Cards Grid ---- */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {INDUSTRIES.map((industry, idx) => (
            <div
              key={industry.name}
              className={`group relative flex flex-col items-center rounded-2xl border border-neutral-light bg-white p-6 text-center shadow-lg transition-all duration-700 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: `${idx * 110 + 200}ms` }}
            >
              {/* icon container */}
              <div
                className={`relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${industry.accentBg} ${industry.accentText} transition-transform duration-300 group-hover:scale-110`}
              >
                {industry.icon}
              </div>

              {/* sector name */}
              <h3 className="relative z-10 mb-4 text-base font-bold text-secondary sm:text-lg">
                {industry.name}
              </h3>

              {/* focus area tags */}
              <div className="relative z-10 flex flex-wrap justify-center gap-1.5">
                {industry.focuses.map((focus) => (
                  <span
                    key={focus}
                    className="rounded-full border border-neutral-light bg-neutral-light px-2.5 py-1 text-[11px] font-medium text-neutral-gray transition-colors duration-300 group-hover:text-secondary"
                  >
                    {focus}
                  </span>
                ))}
              </div>

              {/* bottom accent bar */}
              <div
                className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full ${industry.accentBg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
