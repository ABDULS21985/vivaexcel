"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  TrendingUp,
  Building2,
  Landmark,
  Rocket,
  Shield,
  CheckCircle2,
  ArrowRight,
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
/*  SECTION 1 – Why Partner With Digibit                                      */
/* -------------------------------------------------------------------------- */

const AUDIENCES_CONFIG = [
  {
    key: "investors",
    icon: TrendingUp,
    accent: "accent-orange",
    border: "border-accent-orange",
    text: "text-accent-orange",
    bg: "bg-accent-orange/10",
    bulletCount: 5,
  },
  {
    key: "enterprises",
    icon: Building2,
    accent: "primary",
    border: "border-primary",
    text: "text-primary",
    bg: "bg-primary/10",
    bulletCount: 5,
  },
  {
    key: "governments",
    icon: Landmark,
    accent: "secondary-yellow",
    border: "border-secondary-yellow",
    text: "text-secondary-yellow",
    bg: "bg-secondary-yellow/10",
    bulletCount: 5,
  },
  {
    key: "startups",
    icon: Rocket,
    accent: "accent-red",
    border: "border-accent-red",
    text: "text-accent-red",
    bg: "bg-accent-red/10",
    bulletCount: 5,
  },
];

export function WebSummitWhyPartner() {
  const t = useTranslations("websummit");
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-white py-24 lg:py-32"
    >
      {/* decorative background orbs */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-accent-orange/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* header */}
        <div
          className={`mb-16 text-center transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            {t("whyPartner.label")}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-secondary sm:text-4xl lg:text-5xl">
            {t("whyPartner.title")}
          </h2>
        </div>

        {/* audience grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES_CONFIG.map((a, idx) => {
            const Icon = a.icon;
            const bullets = Array.from({ length: a.bulletCount }, (_, i) =>
              t(`whyPartner.audiences.${a.key}.bullets.${i + 1}`)
            );
            return (
              <div
                key={a.key}
                className={`group relative rounded-2xl border-t-4 ${a.border} border border-neutral-light bg-white p-6 shadow-lg transition-all duration-700 hover:shadow-xl ${
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: `${idx * 120 + 200}ms` }}
              >
                {/* icon */}
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${a.bg}`}
                >
                  <Icon className={`h-6 w-6 ${a.text}`} />
                </div>

                {/* title */}
                <h3
                  className={`mb-5 text-sm font-bold uppercase tracking-wider ${a.text}`}
                >
                  {t(`whyPartner.audiences.${a.key}.label`)}
                </h3>

                {/* bullet list */}
                <ul className="space-y-3">
                  {bullets.map((b, bIdx) => (
                    <li
                      key={bIdx}
                      className={`flex items-start gap-2.5 text-sm text-neutral-gray transition-all duration-500 ${
                        visible
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-4 opacity-0"
                      }`}
                      style={{
                        transitionDelay: `${idx * 120 + bIdx * 100 + 400}ms`,
                      }}
                    >
                      <CheckCircle2
                        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${a.text}`}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  SECTION 2 – Compliance & Certifications                                   */
/* -------------------------------------------------------------------------- */

const certifications = [
  "ISO 27001 Lead Implementer",
  "NIST Cybersecurity Framework",
  "Qatar Central Bank (QCB) Standards",
  "Qatar National Information Assurance (NIA)",
  "Qatar Data Protection Law",
  "GDPR Compliant",
  "NDPR/NDPA (Nigeria)",
  "PCI-DSS",
];

export function WebSummitCompliance() {
  const t = useTranslations("websummit");
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-neutral-light py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-accent-orange/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* header */}
        <div
          className={`mb-16 text-center transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span className="mb-4 inline-block rounded-full border border-accent-orange/30 bg-accent-orange/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-orange">
            {t("compliance.label")}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-secondary sm:text-4xl lg:text-5xl">
            {t("compliance.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-gray">
            {t("compliance.subtitle")}
          </p>
        </div>

        {/* badges grid */}
        <div className="flex flex-wrap items-center justify-center gap-5">
          {certifications.map((cert, idx) => (
            <div
              key={cert}
              className={`group flex items-center gap-3 rounded-2xl border border-neutral-light bg-white px-6 py-4 shadow-md transition-all duration-600 hover:border-accent-orange/30 hover:shadow-lg ${
                visible
                  ? "scale-100 opacity-100"
                  : "scale-90 opacity-0"
              }`}
              style={{ transitionDelay: `${idx * 80 + 200}ms` }}
            >
              <Shield className="h-5 w-5 flex-shrink-0 text-accent-orange transition-transform duration-300 group-hover:scale-110" />
              <span className="text-sm font-medium text-neutral-gray group-hover:text-secondary">
                {cert}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  SECTION 3 – Success Stories                                               */
/* -------------------------------------------------------------------------- */

const caseStudies = [
  {
    category: "Fintech / Gov",
    title: "Central Bank Digital Currency",
    description:
      "Advised a central bank on CBDC implementation strategy, covering technology selection, regulatory alignment, and phased rollout.",
    impact: "National digital currency roadmap",
    accent: "from-secondary to-primary",
    chipBg: "bg-secondary/10 text-secondary border-secondary/20",
    impactColor: "text-secondary",
  },
  {
    category: "Identity / Trust",
    title: "National Credential Verification",
    description:
      "Deployed TrustMeHub nationwide as the primary credential verification platform for educational institutions and employers.",
    impact: "2M+ credentials verified, 98% fraud reduction",
    accent: "from-accent-orange to-accent-red",
    chipBg: "bg-accent-orange/10 text-accent-orange border-accent-orange/20",
    impactColor: "text-accent-orange",
  },
  {
    category: "Security / API",
    title: "Enterprise API Gateway",
    description:
      "Implemented DigiGate for a major financial institution to secure all external and internal API traffic with adaptive threat detection.",
    impact: "95% security incident reduction",
    accent: "from-secondary-yellow to-accent-orange",
    chipBg: "bg-secondary-yellow/10 text-secondary-yellow border-secondary-yellow/20",
    impactColor: "text-secondary-yellow",
  },
  {
    category: "Banking / CRM",
    title: "Banking CRM Transformation",
    description:
      "Rolled out BoaCRM across a commercial bank, unifying customer data, automating workflows, and boosting relationship management.",
    impact: "2M+ customers, 40% efficiency gain",
    accent: "from-accent-red to-primary",
    chipBg: "bg-accent-red/10 text-accent-red border-accent-red/20",
    impactColor: "text-accent-red",
  },
];

export function WebSummitSuccessStories() {
  const t = useTranslations("websummit");
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-white py-24 lg:py-32"
    >
      {/* decorative orbs */}
      <div className="pointer-events-none absolute -top-32 left-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[400px] w-[400px] rounded-full bg-accent-orange/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* header */}
        <div
          className={`mb-16 text-center transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span className="mb-4 inline-block rounded-full border border-accent-red/30 bg-accent-red/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-red">
            {t("successStories.label")}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-secondary sm:text-4xl lg:text-5xl">
            {t("successStories.title")}
          </h2>
        </div>

        {/* cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {caseStudies.map((cs, idx) => (
            <div
              key={cs.title}
              className={`group relative flex flex-col rounded-2xl border border-neutral-light bg-white shadow-lg transition-all duration-700 hover:shadow-xl ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: `${idx * 140 + 200}ms` }}
            >
              {/* gradient top strip */}
              <div
                className={`h-1 w-full rounded-t-2xl bg-gradient-to-r ${cs.accent}`}
              />

              <div className="flex flex-1 flex-col p-6">
                {/* category chip */}
                <span
                  className={`mb-4 inline-block w-fit rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${cs.chipBg}`}
                >
                  {cs.category}
                </span>

                {/* title */}
                <h3 className="mb-3 text-lg font-bold text-secondary">
                  {cs.title}
                </h3>

                {/* description */}
                <p className="mb-6 flex-1 text-sm leading-relaxed text-neutral-gray">
                  {cs.description}
                </p>

                {/* impact metric */}
                <div className="rounded-xl border border-neutral-light bg-neutral-light/50 p-4">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-neutral-gray">
                    Impact
                  </span>
                  <p className={`text-sm font-semibold ${cs.impactColor}`}>
                    {cs.impact}
                  </p>
                </div>

                {/* hover arrow */}
                <div className="mt-5 flex items-center gap-1.5 text-sm text-neutral-gray transition-colors duration-300 group-hover:text-primary">
                  <span>Read more</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
