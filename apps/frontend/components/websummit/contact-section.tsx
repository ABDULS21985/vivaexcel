"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  GraduationCap,
  Code,
  ShieldCheck,
  Mail,
  Globe,
  Linkedin,
  MessageCircle,
  CalendarClock,
  Send,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

// ============================================
// HOOKS
// ============================================

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// ============================================
// CONSTANTS
// ============================================

const ROLE_OPTIONS = ["Investor", "Enterprise", "Government", "Startup", "Other"];

const EXECUTIVE_PROGRAMS = [
  "AI for Executives",
  "Cybersecurity Leadership",
  "Blockchain Business Strategy",
  "Digital Transformation Masterclass",
];

const TECHNICAL_PROGRAMS = [
  "Applied Machine Learning",
  "Cyber Incident Response",
  "Smart Contract Development",
  "IT Audit Techniques",
];

const COMPLIANCE_PROGRAMS = [
  "QCB Standards Implementation",
  "Qatar Data Protection Law",
  "ISO 27001 Awareness",
  "NIA Policy Alignment",
];

// ============================================
// SECTION 1: MEET US
// ============================================

export function WebSummitMeetUs() {
  const t = useTranslations("websummit");
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className="relative py-24 px-6 bg-neutral-light overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-accent-orange/5 blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20 mb-4">
            {t("meetUs.label")}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-secondary">
            {t("meetUs.title1")}{" "}
            <span className="bg-gradient-to-r from-accent-yellow to-primary bg-clip-text text-transparent">
              {t("meetUs.title2")}
            </span>
          </h2>
        </div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Event details */}
          <div
            className={`space-y-8 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              }`}
          >
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-accent-yellow mt-1 shrink-0" />
                <p className="text-neutral-gray leading-relaxed">
                  {t("meetUs.venue")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-accent-yellow shrink-0" />
                <p className="text-neutral-gray">{t("event.fullDates")}</p>
              </div>
              <div className="flex items-center gap-4">
                <Users className="w-5 h-5 text-accent-yellow shrink-0" />
                <p className="text-neutral-gray">{t("meetUs.booth")}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary mb-4">{t("meetUs.whatToExpect")}</h3>
              <ul className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <li
                    key={i}
                    className={`flex items-center gap-3 transition-all duration-500 ${isVisible
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-6"
                      }`}
                    style={{ transitionDelay: `${400 + i * 100}ms` }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-accent-orange shrink-0" />
                    <span className="text-neutral-gray">{t(`meetUs.expectations.${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right - Decorative card */}
          <div
            className={`relative flex items-center justify-center transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
              }`}
          >
            {/* Animated gradient background */}
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-accent-yellow/10 via-primary/10 to-accent-orange/10 blur-3xl animate-pulse" />

            {/* Floating elements */}
            <div className="absolute top-4 right-8 w-16 h-16 rounded-xl bg-accent-yellow/10 border border-accent-yellow/20 animate-bounce" style={{ animationDuration: "3s" }} />
            <div className="absolute bottom-8 left-4 w-12 h-12 rounded-full bg-primary/10 border border-primary/20 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }} />
            <div className="absolute top-1/2 right-0 w-8 h-8 rounded-lg bg-accent-orange/10 border border-accent-orange/20 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }} />

            {/* Event card */}
            <div className="relative rounded-2xl bg-white shadow-xl border border-primary/20 p-10 text-center w-80">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-accent-yellow to-primary" />
              <p className="text-sm uppercase tracking-widest text-accent-yellow mb-2">
                {t("event.name").replace(" 2026", "")}
              </p>
              <p className="text-6xl font-bold text-secondary mb-1">2026</p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-accent-yellow to-primary mx-auto my-4" />
              <p className="text-3xl font-light text-primary mb-2">{t("event.dates")}</p>
              <p className="text-neutral-gray">{t("event.location")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 2: TRAINING & CAPABILITY BUILDING
// ============================================

interface TrainingColumnProps {
  icon: React.ReactNode;
  title: string;
  programs: string[];
  accent: string;
  borderAccent: string;
  iconBg: string;
  isVisible: boolean;
  delay: number;
}

function TrainingColumn({
  icon,
  title,
  programs,
  accent,
  borderAccent,
  iconBg,
  isVisible,
  delay,
}: TrainingColumnProps) {
  return (
    <div
      className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className={`relative h-full rounded-2xl border ${borderAccent} bg-white shadow-lg border-neutral-light p-8 hover:shadow-xl transition-all duration-300`}
      >
        {/* Top accent bar */}
        <div className={`absolute top-0 left-8 right-8 h-0.5 ${accent}`} />

        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${iconBg} mb-5`}>
          {icon}
        </div>

        <h3 className="text-xl font-semibold text-secondary mb-6">{title}</h3>

        <ul className="space-y-3">
          {programs.map((program, i) => (
            <li
              key={program}
              className={`flex items-center gap-3 text-neutral-gray transition-all duration-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
              style={{ transitionDelay: `${delay + 150 + i * 80}ms` }}
            >
              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-neutral-gray" />
              <span className="text-sm">{program}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function WebSummitTraining() {
  const t = useTranslations("websummit");
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className="relative py-24 px-6 bg-white overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-accent-orange/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full bg-secondary-yellow/10 text-secondary-yellow border border-secondary-yellow/20 mb-4">
            {t("training.label")}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-secondary">
            {t("training.title1")}{" "}
            <span className="bg-gradient-to-r from-secondary-yellow to-accent-orange bg-clip-text text-transparent">
              {t("training.title2")}
            </span>
          </h2>
        </div>

        {/* Three columns */}
        <div className="grid md:grid-cols-3 gap-8">
          <TrainingColumn
            icon={<GraduationCap className="w-6 h-6 text-primary" />}
            title="Executive Programs"
            programs={EXECUTIVE_PROGRAMS}
            accent="bg-gradient-to-r from-primary to-primary"
            borderAccent="border-primary/20"
            iconBg="bg-primary/10"
            isVisible={isVisible}
            delay={200}
          />
          <TrainingColumn
            icon={<Code className="w-6 h-6 text-accent-orange" />}
            title="Technical Programs"
            programs={TECHNICAL_PROGRAMS}
            accent="bg-gradient-to-r from-accent-orange to-accent-orange"
            borderAccent="border-accent-orange/20"
            iconBg="bg-accent-orange/10"
            isVisible={isVisible}
            delay={350}
          />
          <TrainingColumn
            icon={<ShieldCheck className="w-6 h-6 text-secondary-yellow" />}
            title="Compliance Training"
            programs={COMPLIANCE_PROGRAMS}
            accent="bg-gradient-to-r from-secondary-yellow to-secondary-yellow"
            borderAccent="border-secondary-yellow/20"
            iconBg="bg-secondary-yellow/10"
            isVisible={isVisible}
            delay={500}
          />
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 3: CONTACT & SCHEDULE MEETING
// ============================================

interface FormState {
  name: string;
  company: string;
  email: string;
  role: string;
  interest: string;
  message: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  company: "",
  email: "",
  role: "",
  interest: "",
  message: "",
};

const INTEREST_OPTIONS = [
  "Product Demo",
  "Partnership Opportunity",
  "Investment Discussion",
  "Training Programs",
  "Consulting Services",
  "General Inquiry",
];

function ContactInfoCard({
  icon,
  label,
  value,
  href,
  isVisible,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  isVisible: boolean;
  delay: number;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-4 p-4 rounded-xl bg-white shadow-md border border-neutral-light hover:border-primary/30 hover:shadow-lg transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-orange/10">
        {icon}
      </div>
      <div>
        <p className="text-xs text-neutral-gray uppercase tracking-wider">{label}</p>
        <p className="text-sm text-secondary">{value}</p>
      </div>
    </a>
  );
}

export function WebSummitContact() {
  const t = useTranslations("websummit");
  const { ref, isVisible } = useScrollReveal();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [interestOpen, setInterestOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setForm(INITIAL_FORM);
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-24 px-6 bg-neutral-light overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-accent-orange/5 blur-3xl" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
            {t("contactSection.label")}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-secondary">
            {t("contactSection.title1")}{" "}
            <span className="bg-gradient-to-r from-primary to-accent-orange bg-clip-text text-transparent">
              {t("contactSection.title2")}
            </span>
          </h2>
        </div>

        {/* Two columns */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Contact form */}
          <div
            className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              }`}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-12 rounded-2xl border border-accent-orange/20 bg-white shadow-lg">
                <CheckCircle2 className="w-16 h-16 text-accent-orange mb-4" />
                <h3 className="text-2xl font-semibold text-secondary mb-2">
                  {t("contactSection.form.successTitle")}
                </h3>
                <p className="text-neutral-gray">
                  {t("contactSection.form.successMessage")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder={t("contactSection.form.name")}
                    className="w-full px-4 py-3 bg-white border border-neutral-light rounded-xl text-secondary placeholder:text-neutral-gray focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                {/* Company */}
                <div className="relative">
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    required
                    placeholder={t("contactSection.form.company")}
                    className="w-full px-4 py-3 bg-white border border-neutral-light rounded-xl text-secondary placeholder:text-neutral-gray focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder={t("contactSection.form.email")}
                    className="w-full px-4 py-3 bg-white border border-neutral-light rounded-xl text-secondary placeholder:text-neutral-gray focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                {/* Role dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-neutral-light rounded-xl text-left focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                  >
                    <span className={form.role ? "text-secondary" : "text-neutral-gray"}>
                      {form.role || t("contactSection.form.selectRole")}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-gray transition-transform duration-200 ${roleOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  {roleOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-light rounded-xl overflow-hidden shadow-xl">
                      {ROLE_OPTIONS.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, role }));
                            setRoleOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-neutral-gray hover:bg-primary/5 hover:text-secondary transition-colors duration-150"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interest Area dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setInterestOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-neutral-light rounded-xl text-left focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                  >
                    <span className={form.interest ? "text-secondary" : "text-neutral-gray"}>
                      {form.interest || "Select Interest Area"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-gray transition-transform duration-200 ${interestOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  {interestOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-light rounded-xl overflow-hidden shadow-xl">
                      {INTEREST_OPTIONS.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, interest }));
                            setInterestOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-neutral-gray hover:bg-primary/5 hover:text-secondary transition-colors duration-150"
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="relative">
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder={t("contactSection.form.message")}
                    className="w-full px-4 py-3 bg-white border border-neutral-light rounded-xl text-secondary placeholder:text-neutral-gray focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300 resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="relative w-full group overflow-hidden px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-accent-orange to-accent-red hover:from-accent-orange/90 hover:to-accent-red/90 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    {t("contactSection.form.submit")}
                  </span>
                  {/* Shine effect */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </form>
            )}
          </div>

          {/* Right - Contact info */}
          <div
            className={`space-y-4 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
              }`}
          >
            <ContactInfoCard
              icon={<Mail className="w-5 h-5 text-accent-orange" />}
              label="Email"
              value="connect@drkatangablog.com"
              href="mailto:connect@drkatangablog.com"
              isVisible={isVisible}
              delay={400}
            />
            <ContactInfoCard
              icon={<Globe className="w-5 h-5 text-accent-orange" />}
              label="Website"
              value="www.drkatangablog.com"
              href="https://www.drkatangablog.com"
              isVisible={isVisible}
              delay={500}
            />
            <ContactInfoCard
              icon={<Linkedin className="w-5 h-5 text-primary" />}
              label="LinkedIn"
              value="KTBlog"
              href="https://linkedin.com/company/drkatangablog"
              isVisible={isVisible}
              delay={600}
            />
            <ContactInfoCard
              icon={<MessageCircle className="w-5 h-5 text-primary" />}
              label="WhatsApp"
              value="Contact us on WhatsApp"
              href="https://wa.me/message"
              isVisible={isVisible}
              delay={700}
            />

            {/* Schedule a Meeting card */}
            <div
              className={`mt-6 p-6 rounded-2xl bg-white shadow-lg border border-neutral-light transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              style={{ transitionDelay: "800ms" }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                  <CalendarClock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-secondary">
                    {t("contactSection.scheduleMeeting.title")}
                  </h4>
                  <p className="text-sm text-neutral-gray">
                    {t("contactSection.scheduleMeeting.subtitle")}
                  </p>
                </div>
              </div>
              <button className="w-full mt-3 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-accent-orange to-accent-red hover:from-accent-orange/90 hover:to-accent-red/90 transition-colors duration-300 flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                {t("contactSection.scheduleMeeting.button")}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`mt-20 pt-10 border-t border-secondary/10 text-center transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          <div className="inline-block rounded-2xl bg-secondary px-12 py-8">
            <p className="text-lg font-semibold text-white mb-1">
              {t("contactSection.footer.company")}
            </p>
            <p className="text-sm text-white/70 mb-1">
              {t("contactSection.footer.copyright")}
            </p>
            <p className="text-sm text-white/60">
              {t("contactSection.footer.eventInfo")}
            </p>
            <p className="text-xs text-white/50 mt-3">
              {t("contactSection.footer.tagline")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
