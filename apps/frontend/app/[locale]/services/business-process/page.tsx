import type { Metadata } from "next";
import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle,
  Rocket,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@digibit/ui/components";
import { CTASection } from "@/components/shared";
import { getServiceTowerBySlug } from "@/data/services-global";
import type { ServiceTower } from "@/types/services-global";
import {
  BPMStackDiagram,
  ReadinessQuiz,
  TimeToValueEstimator,
} from "./interactive";

const slug = "business-process";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await params;
  const tower = getServiceTowerBySlug(slug);
  if (!tower) {
    return { title: "Business Process Services | Global Digitalbit" };
  }
  return {
    title: `${tower.name} | Global Digitalbit`,
    description: tower.description,
    keywords: [
      "business process",
      "BPM",
      "process automation",
      "process mining",
      "operational excellence",
      "continuous improvement",
    ],
    openGraph: {
      title: `${tower.name} - Process Excellence`,
      description: tower.description,
      url: `https://globaldigibit.com/services/${slug}`,
    },
  };
}

export default async function BusinessProcessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tower = getServiceTowerBySlug(slug) as ServiceTower | undefined;
  if (!tower) notFound();

  const rc = tower.richContent;
  const accent = tower.accentColor;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8fb] via-white to-white">
      {/* Hero + Quiz */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `radial-gradient(circle at 15% 20%, ${accent}15, transparent 30%), radial-gradient(circle at 80% 10%, ${accent}12, transparent 25%), linear-gradient(135deg, ${accent}10 0%, #ffffff 60%)`,
          }}
        />
        <div className="container mx-auto px-4 md:px-6 lg:px-10 py-16 md:py-22 relative z-10">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
            <div className="space-y-6">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{ backgroundColor: `${accent}18`, color: accent }}
              >
                <Sparkles size={16} />
                Process Excellence Control Center
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight">
                Business Process & Automation
                <span className="text-neutral-700"> — build resilient, efficient operations fast</span>
              </h1>
              <p className="text-lg text-neutral-700 max-w-3xl">
                Design, automate, and continuously improve your critical processes with measurable value in weeks, not quarters.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full font-semibold"
                  style={{ backgroundColor: accent, borderColor: accent }}
                >
                  <Link href={`/contact?service=${slug}`}>
                    Book a process diagnostic
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full border-2"
                  style={{ borderColor: accent, color: accent }}
                >
                  <Link href="#quiz">Run readiness check</Link>
                </Button>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 max-w-3xl">
                <StatPill icon={<Rocket size={18} />} label="Time-to-impact" value="First wins in 6-10 weeks" accent={accent} />
                <StatPill icon={<Target size={18} />} label="Precision" value="APQC + mining led" accent={accent} />
                <StatPill icon={<Sparkles size={18} />} label="Automation ROI" value="Value-prioritized backlog" accent={accent} />
              </div>
            </div>
            <div id="quiz">
              {rc?.readinessQuiz && (
                <ReadinessQuiz quiz={rc.readinessQuiz} accentColor={accent} serviceSlug={slug} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Exec + Diagram */}
      <section className="container mx-auto px-4 md:px-6 lg:px-10 py-14">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-start">
          <div className="space-y-6">
            <SectionHeader title="Why Boards Care" accent={accent} />
            <div className="space-y-3">
              {rc?.executiveSummary?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white border border-neutral-100 rounded-xl shadow-sm">
                  <CheckCircle className="h-5 w-5 mt-1" style={{ color: accent }} />
                  <p className="text-neutral-800">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            {rc?.diagramLayers && (
              <BPMStackDiagram layers={rc.diagramLayers} accentColor={accent} />
            )}
          </div>
        </div>
      </section>

      {/* PDCA */}
      {rc?.pdca && rc.pdca.length > 0 && (
        <section className="bg-neutral-50 py-14">
          <div className="container mx-auto px-4 md:px-6 lg:px-10">
            <SectionHeader title="Plan → Do → Check → Act" accent={accent} subtitle="A closed-loop engine for throughput, quality, and compliance." />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rc.pdca.map((stage, idx) => (
                <div key={stage.stage} className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
                      {stage.stage}
                    </div>
                    <div className="text-xs text-neutral-500">Step {idx + 1}</div>
                  </div>
                  <p className="font-semibold text-neutral-900 mb-2">{stage.headline}</p>
                  <p className="text-sm text-neutral-700 mb-3">{stage.description}</p>
                  {stage.activities && (
                    <ul className="space-y-1.5 text-sm text-neutral-700">
                      {stage.activities.map((a) => (
                        <li key={a} className="flex gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5" style={{ color: accent }} />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Roadmap + Estimator */}
      <section className="container mx-auto px-4 md:px-6 lg:px-10 py-14">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10">
          {rc?.complianceRoadmap && (
            <div className="bg-white border border-neutral-100 rounded-2xl shadow-xl p-6">
              <SectionHeader title="Execution Roadmap" accent={accent} />
              <div className="space-y-4">
                {rc.complianceRoadmap.map((step, idx) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-white"
                        style={{ backgroundColor: accent }}
                      >
                        {idx + 1}
                      </div>
                      {idx < rc.complianceRoadmap!.length - 1 && (
                        <div className="w-px flex-1 bg-gradient-to-b from-neutral-200 to-neutral-100" />
                      )}
                    </div>
                    <div className="flex-1 border border-neutral-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="font-semibold text-neutral-900">{step.title}</p>
                        {step.duration && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: `${accent}15`, color: accent }}>
                            {step.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-700 mt-1">{step.description}</p>
                      {step.outcome && <p className="text-xs text-neutral-600 mt-2">Outcome: {step.outcome}</p>}
                      {step.deliverables && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {step.deliverables.map((d) => (
                            <span key={d} className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-50 border border-neutral-200">
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rc?.estimator && <TimeToValueEstimator estimator={rc.estimator} accentColor={accent} />}
        </div>
      </section>

      {/* FAQ */}
      {rc?.faqs && rc.faqs.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 lg:px-10 py-14">
          <SectionHeader title="FAQ" accent={accent} subtitle="What ops leaders, finance, and IT usually ask." />
          <div className="grid md:grid-cols-2 gap-4">
            {rc.faqs.map((faq) => (
              <div key={faq.question} className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm">
                <p className="font-semibold text-neutral-900 mb-2">{faq.question}</p>
                <p className="text-sm text-neutral-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services */}
      <section className="bg-neutral-50 py-14">
        <div className="container mx-auto px-4 md:px-6 lg:px-10">
          <SectionHeader title="What We Deliver" accent={accent} subtitle="Design, automation, and control for durable operations." />
          <div className="grid md:grid-cols-3 gap-4">
            {tower.services.slice(0, 3).map((service) => (
              <div key={service.slug} className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">{tower.shortName}</p>
                <p className="font-semibold text-neutral-900 text-lg mb-2">{service.name}</p>
                <p className="text-sm text-neutral-700 mb-3">{service.description}</p>
                {service.typicalDeliverables && (
                  <div className="flex flex-wrap gap-2">
                    {service.typicalDeliverables.slice(0, 4).map((d) => (
                      <span key={d} className="px-2.5 py-1 rounded-md text-xs bg-neutral-50 border border-neutral-200">
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to unlock throughput and reduce defects?"
        description="Schedule a working session to build your first 90-day process + automation wave."
        primaryCTA={{ label: "Schedule diagnostic", href: `/contact?service=${slug}` }}
        secondaryCTA={{ label: "See a sample dashboard", href: "/contact?type=asset&name=process-dashboard" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function SectionHeader({ title, subtitle, accent }: { title: string; subtitle?: string; accent: string }) {
  return (
    <div className="mb-6">
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
        style={{ backgroundColor: `${accent}15`, color: accent }}
      >
        {title}
      </div>
      {subtitle && <p className="text-neutral-700 mt-2">{subtitle}</p>}
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="bg-white border border-neutral-100 rounded-xl px-3 py-3 shadow-sm flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${accent}15`, color: accent }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
        <p className="font-semibold text-neutral-900">{value}</p>
      </div>
    </div>
  );
}
