"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mail,
  Globe,
  Linkedin,
  MessageCircle,
  MapPin,
  Calendar,
  Hash,
  ArrowUpRight,
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

const QUICK_LINKS = [
  { label: "Our Mission", href: "#why-here" },
  { label: "Solutions", href: "#solutions" },
  { label: "Process", href: "#how-it-works" },
  { label: "Agenda", href: "#agenda" },
  { label: "Team", href: "#team" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

// ============================================
// SMOOTH SCROLL HANDLER
// ============================================

function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute("href");
  if (!href || !href.startsWith("#")) return;

  e.preventDefault();
  const target = document.querySelector(href);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ============================================
// COMPONENT
// ============================================

export function WebSummitFooter() {
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <footer id="ws-footer" className="bg-secondary">
      <div
        ref={ref}
        className={`mx-auto max-w-7xl px-6 py-16 lg:py-20 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
      >
        {/* ---- Grid ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1 — Company */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent-orange/80 mb-4">
              Company
            </h3>
            <p className="text-white font-bold text-lg mb-1">
              Digibit Global Solutions
            </p>
            <p className="text-white/70 text-sm italic mb-3">
              Transforming Ideas into Digital Reality
            </p>
            <p className="text-white/50 text-sm leading-relaxed">
              AI, Blockchain, and Cybersecurity solutions for governments,
              enterprises, and visionary investors worldwide.
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent-orange/80 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={handleAnchorClick}
                    className="text-white/60 hover:text-accent-orange transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent-orange/80 mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:connect@globaldigibit.com"
                  className="flex items-center gap-2 text-white/60 hover:text-accent-orange transition-colors duration-300 text-sm"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  connect@globaldigibit.com
                </a>
              </li>
              <li>
                <a
                  href="https://globaldigibit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-accent-orange transition-colors duration-300 text-sm"
                >
                  <Globe className="h-4 w-4 shrink-0" />
                  globaldigibit.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/digibit-global-solutions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-accent-orange transition-colors duration-300 text-sm"
                >
                  <Linkedin className="h-4 w-4 shrink-0" />
                  Digibit Global Solutions
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-accent-orange transition-colors duration-300 text-sm"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  Message us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 — Event Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-accent-orange/80 mb-4">
              Event Info
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="text-white font-semibold">
                Web Summit Qatar 2026
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <Calendar className="h-4 w-4 shrink-0 text-white/50" />
                Feb 1–4, 2026
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <MapPin className="h-4 w-4 shrink-0 text-white/50" />
                Doha Exhibition &amp; Convention Center
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <Hash className="h-4 w-4 shrink-0 text-white/50" />
                Booth A5-35
              </li>
            </ul>
            <a
              href="#contact"
              onClick={handleAnchorClick}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium bg-accent-orange hover:bg-accent-orange/90 text-white transition-colors duration-300"
            >
              Book a Meeting
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* ---- Bottom Bar ---- */}
        <div className="mt-14 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>&copy; 2026 Global Digitalbit Limited. All rights reserved.</p>
          <p>
            Web Summit Qatar is a registered trademark of Web Summit.
          </p>
        </div>
      </div>
    </footer>
  );
}
