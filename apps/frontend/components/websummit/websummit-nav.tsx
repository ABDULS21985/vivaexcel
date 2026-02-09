"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Users,
  Lightbulb,
  Boxes,
  Route,
  CalendarDays,
  Megaphone,
  UserCircle,
  HelpCircle,
  Mail,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "hero", label: "Home", icon: Sparkles },
  { id: "social-proof", label: "Partners", icon: Users },
  { id: "why-here", label: "Mission", icon: Lightbulb },
  { id: "solutions", label: "Solutions", icon: Boxes },
  { id: "how-it-works", label: "Process", icon: Route },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "cta-banner", label: "Book", icon: Megaphone },
  { id: "team", label: "Team", icon: UserCircle },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "contact", label: "Contact", icon: Mail },
];

export function WebSummitNav() {
  const [activeSection, setActiveSection] = useState("hero");
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-80px 0px -40% 0px" }
    );

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsExpanded(false);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop: horizontal floating nav */}
      <nav
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-neutral-light shadow-lg shadow-primary/5 transition-all duration-500"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: `translateX(-50%) translateY(${isVisible ? 0 : -20}px)`,
        }}
        aria-label="Page navigation"
      >
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
              activeSection === id
                ? "text-white"
                : "text-neutral-gray hover:text-secondary hover:bg-neutral-light"
            }`}
            aria-current={activeSection === id ? "true" : undefined}
          >
            {activeSection === id && (
              <span
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary"
                style={{ transition: "all 0.3s ease" }}
              />
            )}
            <Icon className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile: floating pill */}
      <div className="fixed bottom-6 right-4 z-50 lg:hidden">
        {isExpanded && (
          <div className="absolute bottom-14 right-0 w-48 bg-white/95 backdrop-blur-xl rounded-2xl border border-neutral-light shadow-xl overflow-hidden mb-2">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-200 cursor-pointer ${
                  activeSection === id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-neutral-gray hover:bg-neutral-light hover:text-secondary"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Route className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}
