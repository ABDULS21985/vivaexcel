"use client";

import { Facebook, Twitter, Linkedin, Github, Rss } from "lucide-react";
import { Link } from "@/i18n/routing";
import { NewsletterSignup } from "@/components/shared/newsletter-signup";

// ============================================
// DATA
// ============================================

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Write for Us", href: "/write-for-us" },
];

const categoryLinks = [
  { name: "Technology", href: "/categories/technology" },
  { name: "Design", href: "/categories/design" },
  { name: "Productivity", href: "/categories/productivity" },
  { name: "AI & ML", href: "/categories/ai-machine-learning" },
  { name: "Web Development", href: "/categories/web-development" },
  { name: "Career Growth", href: "/categories/career-growth" },
];

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/ktblog", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/company/ktblog", label: "LinkedIn" },
  { icon: Facebook, href: "https://facebook.com/ktblog", label: "Facebook" },
  { icon: Github, href: "https://github.com/ktblog", label: "GitHub" },
  { icon: Rss, href: "/rss.xml", label: "RSS Feed" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms of Service", href: "/terms-of-service" },
  { name: "Cookie Policy", href: "/cookie-policy" },
];

// ============================================
// FOOTER LINK COMPONENT
// ============================================

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 block py-1.5 lg:py-1"
      >
        {children}
      </Link>
    </li>
  );
}

// ============================================
// BLOG FOOTER COMPONENT
// ============================================

export function BlogFooter() {
  return (
    <footer className="w-full bg-neutral-950 text-neutral-400 pt-16 pb-8">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* Column 1: About */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center mb-4">
              <span className="text-xl font-bold text-primary">KT</span>
              <span className="text-xl font-bold text-white">Blog</span>
            </Link>

            <p className="text-sm text-neutral-400 leading-relaxed mb-6 max-w-xs">
              Delivering expert insights, in-depth tutorials, and thought
              leadership for developers, designers, and tech professionals.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-1">
              {quickLinks.map((link) => (
                <FooterLink key={link.name} href={link.href}>
                  {link.name}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="space-y-1">
              {categoryLinks.map((link) => (
                <FooterLink key={link.name} href={link.href}>
                  {link.name}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Newsletter
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed mb-4">
              Get the latest articles delivered straight to your inbox. No spam, unsubscribe anytime.
            </p>
            <NewsletterSignup
              variant="stacked"
              placeholder="your@email.com"
              buttonText="Subscribe"
            />
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-xs text-neutral-500 order-2 md:order-1">
            &copy; {new Date().getFullYear()} KTBlog. All rights reserved.
          </p>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center gap-4 order-1 md:order-2">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs text-neutral-500 hover:text-white transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
