import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Link from "next/link";
import {
  BookOpen,
  Users,
  FolderOpen,
  Mail,
  Award,
  Heart,
  Lightbulb,
  MessageSquare,
  Twitter,
  Linkedin,
  Github,
  ArrowRight,
  Sparkles,
  Target,
  Rocket,
} from "lucide-react";
import { SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: `About | ${SITE_NAME}`,
  description:
    "Learn about VivaExcel Blog — our mission to deliver world-class content, expert insights, and in-depth tutorials to empower your growth.",
  openGraph: {
    title: `About | ${SITE_NAME}`,
    description:
      "Our mission to deliver world-class content, expert insights, and in-depth tutorials.",
    url: "https://vivaexcel.com/about",
  },
};

/* ------------------------------------------------------------------
   DATA
   ------------------------------------------------------------------ */

const stats = [
  { label: "Articles Published", value: "500+", icon: BookOpen },
  { label: "Monthly Readers", value: "100K+", icon: Users },
  { label: "Categories", value: "20+", icon: FolderOpen },
  { label: "Newsletter Subscribers", value: "10K+", icon: Mail },
];

const team = [
  {
    name: "Sarah Chen",
    role: "Editor-in-Chief",
    bio: "Award-winning journalist with 12 years of experience in tech media. Passionate about making complex topics accessible to everyone.",
    avatar: "/images/team/sarah.jpg",
    social: { twitter: "#", linkedin: "#", github: "#" },
  },
  {
    name: "Marcus Johnson",
    role: "Head of Content",
    bio: "Former software engineer turned content strategist. Bridges the gap between technical depth and reader-friendly storytelling.",
    avatar: "/images/team/marcus.jpg",
    social: { twitter: "#", linkedin: "#", github: "#" },
  },
  {
    name: "Aisha Patel",
    role: "Senior Editor",
    bio: "Specializes in AI, machine learning, and emerging tech. Has a knack for spotting trends before they become mainstream.",
    avatar: "/images/team/aisha.jpg",
    social: { twitter: "#", linkedin: "#" },
  },
  {
    name: "David Kim",
    role: "Community Lead",
    bio: "Builds bridges between readers and creators. Manages our contributor program and newsletter with a reader-first philosophy.",
    avatar: "/images/team/david.jpg",
    social: { twitter: "#", linkedin: "#", github: "#" },
  },
];

const values = [
  {
    title: "Quality Content",
    description:
      "Every article is meticulously researched, peer-reviewed, and crafted to provide genuine value. We never compromise on depth or accuracy.",
    icon: Award,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    title: "Reader First",
    description:
      "Our readers are at the heart of everything we do. We listen, adapt, and continuously improve based on your feedback and needs.",
    icon: Heart,
    color: "text-error",
    bgColor: "bg-error/10",
  },
  {
    title: "Innovation",
    description:
      "We explore cutting-edge ideas and emerging technologies, bringing you fresh perspectives that keep you ahead of the curve.",
    icon: Lightbulb,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    title: "Community",
    description:
      "We foster a vibrant community of learners, creators, and thought leaders who inspire each other to grow and excel.",
    icon: MessageSquare,
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

/* ------------------------------------------------------------------
   PAGE COMPONENT
   ------------------------------------------------------------------ */

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-background">
      {/* =============================================
          HERO SECTION
          ============================================= */}
      <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-accent-orange/5 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Our Story
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
              About{" "}
              <span className="text-gradient-primary">VivaExcel Blog</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              We are on a mission to deliver world-class content that empowers
              professionals, developers, and creators to reach their full
              potential.
            </p>
          </div>
        </div>
      </section>

      {/* =============================================
          MISSION SECTION
          ============================================= */}
      <section className="py-16 md:py-24 bg-surface-1 dark:bg-surface-1">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left — Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                <Target className="w-3.5 h-3.5" />
                Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                What We Stand For
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  At VivaExcel Blog, we believe knowledge should be accessible,
                  actionable, and inspiring. Our content philosophy centers on
                  three pillars: depth, clarity, and relevance.
                </p>
                <p>
                  Every article we publish goes through a rigorous editorial
                  process. We partner with industry experts, seasoned
                  practitioners, and thought leaders to bring you perspectives
                  that go beyond the surface.
                </p>
                <p>
                  Whether you are a seasoned professional looking for advanced
                  insights or a beginner exploring new territories, VivaExcel
                  Blog has something for you.
                </p>
              </div>
            </div>

            {/* Right — Visual card */}
            <div className="relative">
              <div className="bg-background dark:bg-surface-2 rounded-2xl p-8 border border-border shadow-sm">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Our Content Philosophy
                </h3>
                <ul className="space-y-4">
                  {[
                    {
                      icon: Rocket,
                      title: "Depth Over Fluff",
                      desc: "In-depth research and analysis, not clickbait.",
                    },
                    {
                      icon: Target,
                      title: "Actionable Takeaways",
                      desc: "Every article leaves you with something you can apply immediately.",
                    },
                    {
                      icon: Users,
                      title: "Expert Voices",
                      desc: "Written by practitioners who live and breathe their craft.",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Decorative accent */}
              <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
            </div>
          </div>
        </div>
      </section>

      {/* =============================================
          STATS SECTION
          ============================================= */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-6 rounded-2xl bg-surface-1 dark:bg-surface-1 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =============================================
          TEAM SECTION
          ============================================= */}
      <section className="py-16 md:py-24 bg-surface-1 dark:bg-surface-1">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              <Users className="w-3.5 h-3.5" />
              The Team
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet the People Behind the Words
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A dedicated team of writers, editors, and technologists committed
              to delivering exceptional content every single day.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {team.map((member) => (
              <div
                key={member.name}
                className="group bg-background dark:bg-surface-2 rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                {/* Avatar placeholder */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent-orange/20 flex items-center justify-center mb-4 mx-auto group-hover:scale-105 transition-transform duration-300">
                  <span className="text-2xl font-bold text-primary">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-foreground text-lg">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {member.bio}
                  </p>
                  {/* Social links */}
                  <div className="flex items-center justify-center gap-3">
                    {member.social.twitter && (
                      <a
                        href={member.social.twitter}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label={`${member.name} on Twitter`}
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {member.social.linkedin && (
                      <a
                        href={member.social.linkedin}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label={`${member.name} on LinkedIn`}
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {member.social.github && (
                      <a
                        href={member.social.github}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label={`${member.name} on GitHub`}
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          VALUES SECTION
          ============================================= */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              <Award className="w-3.5 h-3.5" />
              Our Values
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Drives Us
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              These core values guide every decision we make, every article we
              publish, and every interaction we have with our community.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-surface-1 dark:bg-surface-1 rounded-2xl p-6 border border-border hover:border-primary/20 hover:shadow-md transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${value.bgColor} mb-4`}
                >
                  <value.icon className={`w-6 h-6 ${value.color}`} />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          CTA SECTION
          ============================================= */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-secondary to-primary relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-orange/15 rounded-full blur-[100px]" />

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Join Our Growing Community
            </h2>
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
              Whether you want to share your expertise as an author or stay
              updated with our latest content, we would love to have you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contribute"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-foreground rounded-xl font-semibold hover:bg-neutral-light transition-colors btn-press"
              >
                Become an Author
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/newsletter"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
              >
                Subscribe to Newsletter
                <Mail className="w-4 h-4" />
              </Link>
            </div>

            {/* Social links */}
            <div className="flex items-center justify-center gap-4 mt-10">
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Follow us on GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
