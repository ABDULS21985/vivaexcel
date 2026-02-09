"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Landmark, Globe, Shield, Cpu, Blocks } from "lucide-react";

const PARTNER_LOGOS = [
  { name: "Central Bank of Nigeria", icon: Landmark, category: "Government" },
  { name: "Qatar Central Bank", icon: Landmark, category: "Government" },
  { name: "Federal Inland Revenue", icon: Building2, category: "Public Sector" },
  { name: "Galaxy Backbone", icon: Globe, category: "Enterprise" },
  { name: "Sterling Bank", icon: Building2, category: "Financial" },
  { name: "Wema Bank", icon: Building2, category: "Financial" },
  { name: "NITDA", icon: Shield, category: "Regulator" },
  { name: "Ministry of Digital Economy", icon: Landmark, category: "Government" },
  { name: "Interswitch Group", icon: Cpu, category: "Fintech" },
  { name: "VFD Microfinance", icon: Building2, category: "Financial" },
  { name: "NIMC", icon: Shield, category: "Identity" },
  { name: "National Blockchain Center", icon: Blocks, category: "Innovation" },
];

export function WebSummitSocialProof() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="social-proof"
      ref={sectionRef}
      className="relative py-16 lg:py-20 bg-white overflow-hidden"
      aria-label="Trusted partners"
    >
      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-neutral-gray mb-2">
            Trusted by Governments, Banks & Enterprises
          </p>
          <div className="w-12 h-0.5 mx-auto bg-gradient-to-r from-primary to-accent-orange rounded-full" />
        </div>

        {/* Logo marquee - first row */}
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div
            className={`flex gap-6 transition-opacity duration-1000 motion-reduce:!animate-none ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
            style={{
              animation: "scroll-left 40s linear infinite",
            }}
          >
            {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((partner, idx) => {
              const Icon = partner.icon;
              return (
                <div
                  key={`${partner.name}-${idx}`}
                  className="flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-xl border border-neutral-light bg-neutral-light/50 hover:border-primary/20 hover:bg-white hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300">
                    <Icon className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary whitespace-nowrap">
                      {partner.name}
                    </p>
                    <p className="text-[10px] text-neutral-gray uppercase tracking-wider">
                      {partner.category}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats strip */}
        <div
          className={`flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-12 pt-8 border-t border-neutral-light transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {[
            { value: "50+", label: "Countries Served" },
            { value: "500+", label: "Enterprise Deployments" },
            { value: "2M+", label: "Credentials Verified" },
            { value: "99%", label: "Client Satisfaction" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-secondary">{stat.value}</p>
              <p className="text-xs text-neutral-gray uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
