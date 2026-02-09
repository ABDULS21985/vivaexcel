# ENTERPRISE WEBSITE UPGRADE — AI AGENT IMPLEMENTATION PROMPT

## PROJECT CONTEXT

You are upgrading the **Global Digitalbit (Digibit)** corporate website from a "high-quality startup" level to a **world-class enterprise consulting powerhouse** on par with EY.com, PwC.com, IBM.com, McKinsey.com, Deloitte.com, and Accenture.com.

### Tech Stack (DO NOT CHANGE)
- **Framework:** Next.js 16.1.4 (App Router) with React 19.2.3
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 via `@tailwindcss/postcss`
- **Monorepo:** Turborepo with npm workspaces
- **Shared UI:** `@digibit/ui` package (Radix UI + CVA + Tailwind)
- **i18n:** next-intl (English, Arabic, French, Spanish, Portuguese)
- **Forms:** React Hook Form + Zod
- **Data fetching:** TanStack React Query
- **Icons:** Lucide React
- **Carousel:** Embla Carousel React
- **Notifications:** Sonner
- **Fonts:** Aptos (local, 8 variants) + Noto Sans Arabic (Google)
- **Backend:** NestJS with PostgreSQL + Redis (separate app, do not modify)

### Codebase Structure
```
/apps/frontend/
├── app/[locale]/
│   ├── layout.tsx              # Root layout (fonts, i18n, providers, navbar, footer)
│   ├── page.tsx                # Homepage
│   ├── about/page.tsx
│   ├── blogs/page.tsx
│   ├── blogs/[slug]/page.tsx
│   ├── contact/page.tsx
│   ├── products/page.tsx
│   ├── products/boacrm/page.tsx
│   ├── products/digigate/page.tsx
│   ├── products/digitrack/page.tsx
│   ├── products/digitrust/page.tsx
│   ├── products/trustmehub/page.tsx
│   ├── products/trustmehub/docs/page.tsx
│   ├── products/trustmehub/pricing/page.tsx
│   ├── products/trustmehub/use-cases/page.tsx
│   ├── products/trustmehub/use-cases/[slug]/page.tsx
│   ├── products-services/page.tsx
│   ├── services/page.tsx
│   ├── services/[slug]/page.tsx
│   ├── training/page.tsx
│   └── websummit-qatar-2026/page.tsx
├── components/
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── language-switcher.tsx
│   ├── error-boundary.tsx
│   ├── home/
│   │   ├── hero-premium.tsx
│   │   ├── hero-section.tsx
│   │   ├── about-us-section.tsx
│   │   ├── blog-section.tsx
│   │   ├── faqs-section.tsx
│   │   ├── partners-section.tsx
│   │   ├── process-section.tsx
│   │   ├── products-section.tsx
│   │   ├── services-section.tsx
│   │   ├── testimonials-section.tsx
│   │   ├── who-we-are-section.tsx
│   │   ├── why-choose-us-section.tsx
│   │   └── section-placeholder.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── command-palette.tsx
│   │   ├── skeleton.tsx
│   │   ├── skeleton-premium.tsx
│   │   ├── animated-background.tsx
│   │   ├── animations/
│   │   │   ├── animated-section.tsx
│   │   │   ├── micro-interactions.tsx
│   │   │   ├── page-transition.tsx
│   │   │   ├── scroll-reveal.tsx
│   │   │   ├── stagger-container.tsx
│   │   │   └── text-reveal.tsx
│   │   └── accessibility/
│   │       ├── focus-trap.tsx
│   │       ├── live-region.tsx
│   │       ├── skip-link.tsx
│   │       └── sr-only.tsx
│   ├── shared/
│   │   ├── comparison-table.tsx
│   │   ├── cta-section.tsx
│   │   ├── feature-grid.tsx
│   │   ├── newsletter-section.tsx
│   │   ├── partners-grid.tsx
│   │   ├── pricing-table.tsx
│   │   ├── section-header.tsx
│   │   ├── stats-section.tsx
│   │   └── trust-indicators.tsx
│   ├── about/
│   │   ├── about-hero.tsx
│   │   ├── about-cta-section.tsx
│   │   ├── core-values-section.tsx
│   │   ├── global-presence-section.tsx
│   │   ├── mission-vision-section.tsx
│   │   ├── our-story-section.tsx
│   │   ├── stats-section.tsx
│   │   └── team-section.tsx
│   ├── contact/
│   │   ├── contact-form.tsx
│   │   ├── contact-hero.tsx
│   │   ├── office-card.tsx
│   │   ├── office-data.ts
│   │   └── trust-indicators.tsx
│   ├── services/
│   │   ├── service-hero.tsx
│   │   ├── service-hero-global.tsx
│   │   ├── service-card.tsx
│   │   ├── service-category.tsx
│   │   ├── service-category-tabs.tsx
│   │   ├── service-tabs.tsx
│   │   ├── service-tower-card.tsx
│   │   ├── service-tower-grid.tsx
│   │   ├── engagement-models.tsx
│   │   ├── industry-practices.tsx
│   │   ├── ai-data-section.tsx
│   │   ├── blockchain-section.tsx
│   │   ├── cybersecurity-section.tsx
│   │   └── governance-section.tsx
│   ├── products/
│   │   ├── product-hero.tsx
│   │   ├── product-card-3d.tsx
│   │   ├── product-data.ts
│   │   ├── product-showcase.tsx
│   │   ├── product-tabs.tsx
│   │   ├── trustmehub-section.tsx
│   │   ├── boacrm-section.tsx
│   │   ├── digigate-section.tsx
│   │   ├── digitrack-section.tsx
│   │   ├── digitrust-section.tsx
│   │   └── trustmehub/
│   │       ├── features-showcase.tsx
│   │       └── use-case-card.tsx
│   ├── blog/
│   │   ├── blog-card.tsx
│   │   ├── blog-card-premium.tsx
│   │   ├── blog-card-simple.tsx
│   │   ├── blog-grid.tsx
│   │   ├── blog-hero.tsx
│   │   ├── copy-link-button.tsx
│   │   ├── reading-progress.tsx
│   │   └── table-of-contents.tsx
│   ├── seo/
│   │   ├── breadcrumb-schema.tsx
│   │   ├── faq-schema.tsx
│   │   ├── organization-schema.tsx
│   │   ├── product-schema.tsx
│   │   └── service-schema.tsx
│   ├── training/
│   │   ├── program-card.tsx
│   │   ├── training-data.ts
│   │   └── training-section.tsx
│   └── websummit/
│       ├── hero-section.tsx
│       ├── contact-section.tsx
│       ├── products-section.tsx
│       ├── services-section.tsx
│       └── why-partner-section.tsx
├── hooks/
│   ├── use-contacts.ts
│   ├── use-posts.ts
│   ├── use-products.ts
│   └── use-services.ts
├── lib/
│   ├── api-client.ts
│   └── metadata.ts
├── providers/
│   └── query-provider.tsx
├── types/
│   ├── blog.ts
│   ├── products.ts
│   ├── services.ts
│   ├── services-global.ts
│   └── trustmehub.ts
├── data/
│   ├── blog.ts
│   ├── products.ts
│   ├── services.ts
│   ├── services-global.ts
│   ├── training.ts
│   └── trustmehub/ (api-docs.ts, features.ts, pricing.ts, use-cases.ts)
├── fonts/              # Aptos font family (20+ variants including Display, Serif, Mono)
├── messages/           # i18n JSON (en.json, ar.json, fr.json, es.json, pt.json)
├── i18n/               # next-intl config (config.js, index.ts, request.ts, routing.ts)
├── public/             # Static assets (logos, partner images, SVGs)
└── globals.css         # 1,358 lines — design tokens, utilities, keyframe animations
```

### Brand Colors (defined in globals.css)
- Primary: `#1E4DB7` (Digibit Blue)
- Secondary: `#143A8F` (Dark Blue)
- Secondary Yellow: `#F9C623`
- Accent Orange: `#F59A23`
- Accent Red: `#E86A1D`
- TrustMeHub Green: `#10B981`
- BoaCRM Indigo: `#6366F1`

### Current Dependencies to Leverage (already installed)
- `cmdk` — Command palette (installed but UNUSED — activate it)
- `embla-carousel-react` — Already handles carousels
- `framer-motion` — Keep for component animations, supplement with GSAP for scroll
- `sonner` — Toast notifications
- `@tanstack/react-query` — Server state

---

## IMPLEMENTATION INSTRUCTIONS

Execute ALL tasks below in order. Each phase must be FULLY completed before moving to the next. Read every file before modifying it. Follow existing code patterns (TypeScript, Tailwind, Framer Motion conventions). All new components must support i18n via `next-intl` and RTL for Arabic.

---

## PHASE 1: FOUNDATION — DESIGN SYSTEM OVERHAUL

### TASK 1.1: Install New Dependencies

```bash
cd /Users/mac/codes/digiweb
npm install gsap @gsap/react lottie-react --workspace=apps/frontend
```

GSAP is free for standard websites. Register the ScrollTrigger, SplitText, and ScrollSmoother plugins.

### TASK 1.2: Create GSAP Provider

Create `/apps/frontend/providers/gsap-provider.tsx`:
- Register GSAP plugins: `ScrollTrigger`, `ScrollToPlugin`
- Wrap in a client component
- Import and register in the root layout alongside `QueryProvider`
- Ensure GSAP respects `prefers-reduced-motion`

### TASK 1.3: Overhaul Typography System in `globals.css`

**READ** `/apps/frontend/globals.css` fully before editing.

Add a strict typographic scale using CSS custom properties. Replace the existing fluid font sizes with a mathematically consistent system using a **1.25x (Major Third) scale ratio**:

```css
/* TYPOGRAPHIC SCALE — Major Third (1.25) */
:root {
  /* Display — Hero headlines only */
  --font-display: clamp(3rem, 2.4rem + 3vw, 5.5rem);       /* 48–88px */
  --font-display-weight: 600;
  --font-display-tracking: -0.03em;
  --font-display-leading: 1.05;

  /* H1 — Page titles */
  --font-h1: clamp(2.5rem, 2rem + 2.5vw, 4rem);            /* 40–64px */
  --font-h1-weight: 600;
  --font-h1-tracking: -0.02em;
  --font-h1-leading: 1.1;

  /* H2 — Section titles */
  --font-h2: clamp(1.875rem, 1.5rem + 1.875vw, 3rem);      /* 30–48px */
  --font-h2-weight: 600;
  --font-h2-tracking: -0.015em;
  --font-h2-leading: 1.15;

  /* H3 — Subsection / Card titles */
  --font-h3: clamp(1.5rem, 1.25rem + 1.25vw, 2rem);        /* 24–32px */
  --font-h3-weight: 600;
  --font-h3-tracking: -0.01em;
  --font-h3-leading: 1.2;

  /* H4 — Component headings */
  --font-h4: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);      /* 20–24px */
  --font-h4-weight: 600;
  --font-h4-tracking: 0;
  --font-h4-leading: 1.3;

  /* Lead — Intro paragraphs */
  --font-lead: clamp(1.125rem, 1rem + 0.625vw, 1.375rem);   /* 18–22px */
  --font-lead-weight: 400;
  --font-lead-leading: 1.6;

  /* Body — Default text */
  --font-body: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);     /* 16–18px */
  --font-body-weight: 400;
  --font-body-leading: 1.7;

  /* Caption — Labels, metadata */
  --font-caption: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem); /* 12–14px */
  --font-caption-weight: 500;
  --font-caption-tracking: 0.08em;
  --font-caption-leading: 1.4;

  /* Overline — Section labels, categories */
  --font-overline: clamp(0.6875rem, 0.65rem + 0.1875vw, 0.8125rem); /* 11–13px */
  --font-overline-weight: 600;
  --font-overline-tracking: 0.12em;
  --font-overline-leading: 1.4;
}
```

Add base heading rules:

```css
h1, h2, h3, h4, h5, h6 {
  text-wrap: balance;
  font-family: var(--font-aptos), system-ui, sans-serif;
}

h1 {
  font-size: var(--font-h1);
  font-weight: var(--font-h1-weight);
  letter-spacing: var(--font-h1-tracking);
  line-height: var(--font-h1-leading);
}

h2 {
  font-size: var(--font-h2);
  font-weight: var(--font-h2-weight);
  letter-spacing: var(--font-h2-tracking);
  line-height: var(--font-h2-leading);
}

h3 {
  font-size: var(--font-h3);
  font-weight: var(--font-h3-weight);
  letter-spacing: var(--font-h3-tracking);
  line-height: var(--font-h3-leading);
}

h4 {
  font-size: var(--font-h4);
  font-weight: var(--font-h4-weight);
  letter-spacing: var(--font-h4-tracking);
  line-height: var(--font-h4-leading);
}

/* Constrain prose line length */
p, li, blockquote {
  max-width: 65ch;
}

/* Overline utility */
.overline {
  font-size: var(--font-overline);
  font-weight: var(--font-overline-weight);
  letter-spacing: var(--font-overline-tracking);
  line-height: var(--font-overline-leading);
  text-transform: uppercase;
}
```

**THEN:** Go through EVERY component in `components/home/`, `components/about/`, `components/services/`, `components/products/`, `components/shared/`, `components/contact/`, and `components/blog/`. Replace arbitrary Tailwind font sizes (`text-4xl`, `text-5xl`, `text-6xl`, `text-7xl`, `text-8xl`, `font-black`, `font-extrabold`) with the new typographic scale classes. Specifically:
- Replace `font-black` (weight 900) and `font-extrabold` (weight 800) with `font-semibold` (weight 600) everywhere
- Hero headlines should use `text-[length:var(--font-display)]` with `tracking-[var(--font-display-tracking)]`
- Section titles use the `h2` defaults
- Card titles use `h3` defaults
- All section labels/overlines use the `.overline` class
- Add `text-wrap: balance` to ALL h1 and h2 elements that don't already have it

### TASK 1.4: Enforce Color Restraint

**READ** `globals.css` fully.

Implement a **"color budget"** system. The design rule is: **Primary Blue + ONE accent (Orange) only.** Yellow and Red become secondary/emergency-only colors.

1. In `globals.css`, add:
```css
:root {
  /* COLOR BUDGET — Primary + 1 Accent */
  --color-brand: #1E4DB7;
  --color-brand-dark: #143A8F;
  --color-brand-light: #3B6DE0;
  --color-accent: #F59A23;       /* Orange — the ONE accent */
  --color-accent-light: #FDB95B;
  --color-accent-dark: #D4800A;

  /* Neutrals — the backbone */
  --color-neutral-50: #FAFAFA;
  --color-neutral-100: #F5F5F5;
  --color-neutral-200: #E5E5E5;
  --color-neutral-300: #D4D4D4;
  --color-neutral-400: #A3A3A3;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;
  --color-neutral-950: #0A0A0A;
}
```

2. **Go through EVERY component** and apply these rules:
   - Remove `from-accent-orange to-accent-red` gradients from headings — use solid `text-primary` or `text-neutral-900` instead. Gradient text is allowed ONLY on the homepage hero headline and ONE CTA per page
   - Replace `bg-gradient-to-r/br/bl` decorative backgrounds with solid colors or very subtle single-tone gradients (e.g., `from-primary/5 to-transparent`)
   - Remove ALL `animate-pulse` on decorative orbs/blobs. Replace with static blurred gradients at 10-15% opacity
   - Reduce floating orbs/blobs to MAXIMUM 1 per section. Delete the rest
   - Background overlays on images: reduce opacity from 90-95% to 65-75% so images are actually visible
   - Sections should alternate: white → neutral-50 → white → dark (primary-900/950). NOT every section should have gradient backgrounds
   - Keep `bg-gradient-to-r from-primary to-secondary` ONLY for: (1) primary CTA buttons, (2) the hero accent element, (3) one section divider

### TASK 1.5: Standardize Interactive States

Add to `globals.css` a unified interaction system:

```css
/* STANDARDIZED INTERACTIVE STATES */

/* Card hover — consistent across ALL cards */
.card-interactive {
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.card-interactive:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.1),
              0 8px 16px -8px rgba(0, 0, 0, 0.06);
}

.card-interactive:active {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px -8px rgba(0, 0, 0, 0.08);
}

/* Button press effect */
.btn-press {
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.btn-press:active {
  transform: scale(0.98) translateY(1px);
}

/* Link underline animation — left to right */
.link-animated {
  position: relative;
  text-decoration: none;
}

.link-animated::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-brand);
  transition: width 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.link-animated:hover::after {
  width: 100%;
}

/* Focus visible — accessible and prominent */
:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 3px;
  border-radius: 4px;
}

/* Magnetic button base (enhance with JS) */
.btn-magnetic {
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* Skeleton shimmer */
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--color-neutral-100) 0%,
    var(--color-neutral-200) 40%,
    var(--color-neutral-100) 80%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

**THEN:** Apply `card-interactive` class to ALL card components across the codebase. Remove individual, inconsistent hover transforms (`-translate-y-1`, `-translate-y-2`, `hover:shadow-lg`, `hover:shadow-2xl`) and replace with the unified class. Apply `btn-press` to all buttons. Apply `link-animated` to all text links in nav and content.

### TASK 1.6: Remove Shine Sweep Overuse

Search across ALL components for this pattern (or similar):
```tsx
<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
```

This "shine sweep" effect exists in **15+ components**. Remove it from ALL cards. Keep it ONLY on:
1. The primary CTA button on the homepage hero
2. The "Contact Us" CTA button in the footer
3. Maximum ONE featured/promoted card per page (e.g., "Most Popular" product)

For all other cards, the `card-interactive` hover (lift + shadow) is sufficient.

---

## PHASE 2: NAVIGATION OVERHAUL

### TASK 2.1: Restructure Navigation Architecture

**READ** `components/navbar.tsx` fully before editing.

Reduce top-level navigation items from the current count to exactly **5**:

```
Services | Products | Insights | About | Contact
```

### TASK 2.2: Implement Mega Menu for Services & Products

Create `/apps/frontend/components/navigation/mega-menu.tsx`:

**Services Mega Menu Structure:**
```
┌──────────────────────────────────────────────────────────────────────┐
│  SERVICES                                                            │
│                                                                      │
│  Consulting          Technology          Managed Services   Featured │
│  ─────────           ──────────          ────────────────   ──────── │
│  Digital Strategy    Cloud & Infra       24/7 Monitoring    [Image] │
│  Business Process    Cybersecurity       Managed Detection  Latest  │
│  Risk & Compliance   Data & AI           DevOps as Service  Case    │
│  Change Management   Blockchain          IT Outsourcing     Study   │
│                      Software Dev                           →Read   │
│                                                                      │
│  [View All Services →]                                               │
└──────────────────────────────────────────────────────────────────────┘
```

**Products Mega Menu Structure:**
```
┌──────────────────────────────────────────────────────────────────────┐
│  PRODUCTS                                                            │
│                                                                      │
│  [Icon] TrustMeHub    [Icon] BoaCRM       [Icon] DigiTrack  Featured│
│  Trust & compliance   Customer relations  Asset tracking     ────── │
│  management platform  management suite    & logistics       [Image] │
│  → Learn More         → Learn More        → Learn More      New     │
│                                                             Product │
│  [Icon] DigiTrust     [Icon] DigiGate                       Launch  │
│  Digital identity     Access & gate                         →Read   │
│  verification         management                                    │
│  → Learn More         → Learn More                                  │
│                                                                      │
│  [View All Products →]                                               │
└──────────────────────────────────────────────────────────────────────┘
```

Technical requirements:
- Full viewport width, max-height 600px
- Animate in with `opacity 0→1` + `translateY(-8px) → 0` over 200ms with `cubic-bezier(0.22, 1, 0.36, 1)`
- Close on mouse leave with 150ms delay (prevent accidental close)
- Close on `Escape` key press
- Trap focus within mega menu when open (use existing `focus-trap.tsx`)
- Each link has text + 1-line description in muted color
- "Featured" column shows a card with image, title, and "Read →" link
- Full keyboard navigation (arrow keys between items, Tab through columns)
- Mobile: transforms into full-screen accordion (NOT a shrunken desktop version)
- Support RTL layout for Arabic locale

### TASK 2.3: Implement Full-Overlay Search

Create `/apps/frontend/components/navigation/search-overlay.tsx`:

- Triggered by: (1) Search icon in navbar, (2) `Cmd+K` / `Ctrl+K` keyboard shortcut
- Opens as a full-screen overlay with backdrop blur (`backdrop-blur-xl bg-white/95`)
- Uses the already-installed `cmdk` package for the command palette interface
- Animate open: fade in + scale from 0.95 → 1.0 over 200ms
- Large search input at top (48px height, 24px font size)
- Below input, show:
  - **Recent searches** (persisted in localStorage)
  - **Trending topics** (hardcoded initially: "Cybersecurity", "TrustMeHub", "Digital Transformation", "Cloud Services")
  - **Quick links**: Services, Products, Contact, About
- As user types, filter results grouped by type:
  - **Services** — match against service names/descriptions from `data/services-global.ts`
  - **Products** — match against product names from `data/products.ts`
  - **Pages** — match against page titles
  - **Blog Posts** — match against blog titles from `data/blog.ts`
- Each result shows: icon (type indicator) + title + breadcrumb path + description snippet
- Navigate results with arrow keys, select with Enter
- Close with `Escape` or clicking outside
- Announce results to screen readers via `aria-live="polite"`

Integrate the search trigger into `navbar.tsx` — add a search icon button between the nav links and the CTA button.

### TASK 2.4: Condense Header on Scroll

**EDIT** `components/navbar.tsx`:

- Default state: 80px height, full logo, full navigation text
- Scrolled state (after 50px scroll): 56px height, smaller logo (scale 0.85), slightly smaller nav text
- Transition smoothly over 200ms
- Add a subtle `border-bottom: 1px solid` in neutral-200/10% opacity when scrolled
- The background should go from `transparent` to `bg-white/90 backdrop-blur-xl` on scroll

### TASK 2.5: Redesign Mobile Navigation

**EDIT** `components/navbar.tsx` mobile section:

- Replace side drawer with **full-screen overlay** navigation
- Background: `bg-white` (not translucent — full opaque for readability)
- Animate: slide up from bottom with `translateY(100%) → 0` over 300ms
- Navigation items are large: `text-2xl` (24px), `py-4` each (min 48px touch target)
- Services and Products expand as **accordions** showing sub-items
- Language switcher prominently placed at bottom
- "Contact Us" as full-width CTA button at the very bottom
- Close button: large X icon, top-right, min 48x48px touch target
- Trap focus within mobile nav when open

---

## PHASE 3: HERO SECTION TRANSFORMATION

### TASK 3.1: Redesign Homepage Hero

**READ then REWRITE** `components/home/hero-premium.tsx`:

The new hero must be dramatically different from the current approach. Follow these enterprise principles:

**Layout:**
- Height: `min-h-[70vh]` on desktop, `min-h-[60vh]` on mobile (NOT 90vh)
- Split layout: 60% text left, 40% visual right on desktop. Full-width stacked on mobile
- Background: subtle dark gradient (`from-neutral-950 via-primary-950 to-neutral-950`) — NO floating orbs, NO pulsing blobs
- ONE subtle ambient gradient element (large, blurred, static, 10% opacity max)

**Content — Left Side:**
- Overline label: `.overline` class, uppercase, brand color, e.g. "DIGITAL TRANSFORMATION"
- Headline: Display size typography, weight 600, white text. Use thought-leadership language:
  - Implement a headline rotator that cycles through 3-4 headlines every 5 seconds with a smooth crossfade/slide transition
  - Headlines: "Powering Africa's Digital Future", "Trust Through Technology", "Enterprise Solutions That Scale", "Securing Tomorrow's Infrastructure"
- Subtitle: Lead paragraph size, `text-neutral-300`, max 2 lines, max-width 45ch
- Two CTAs: Primary ("Explore Services" → `/services`) and Secondary ghost/outline ("View Case Studies" → `/case-studies`)
- Trust bar below CTAs: Small row showing "Trusted by 100+ organizations" with 3-4 partner logos in grayscale, 32px height

**Content — Right Side (Desktop only):**
- Option A (recommended): Abstract geometric animation — use GSAP to animate a subtle grid/mesh pattern that responds slowly to mouse movement. Think IBM's design language aesthetic — geometric, precise, corporate
- Option B: A single high-quality product screenshot or dashboard mockup with subtle float animation (translateY ±10px over 6s)

**Scroll Transition:**
- As user scrolls past 30% of hero, hero content fades out (`opacity 0`) and scales slightly (`scale 0.97`)
- Use GSAP ScrollTrigger with `scrub: true` so the fade is tied to scroll position, not triggered

**Animation:**
- Headline reveals line-by-line using clip-path (`inset(0 0 100% 0)` → `inset(0 0 0 0)`) with 150ms stagger per line — NOT character-by-character (too busy)
- Overline fades in first (200ms), then headline (staggered), then subtitle (300ms after headline), then CTAs (400ms after)
- Total entrance sequence: ~1.2 seconds
- Respect `prefers-reduced-motion`: if enabled, show all content immediately with a simple fade

### TASK 3.2: Fix All Other Hero Sections

Apply the same principles to:
- `components/about/about-hero.tsx`
- `components/contact/contact-hero.tsx`
- `components/services/service-hero.tsx` and `service-hero-global.tsx`
- `components/products/product-hero.tsx`
- `components/blog/blog-hero.tsx`

For each:
1. Reduce height from 85-90vh to **65-70vh**
2. Remove ALL floating orbs and pulsing blobs (keep max 1 static blurred gradient at 10-15% opacity)
3. Fix parallax: Replace `window.addEventListener("scroll")` with GSAP ScrollTrigger or CSS `scroll-timeline`
4. Fix text animation stagger from 80ms to **120-150ms** per word/line
5. Reduce background overlay opacity from 90-95% to **65-75%** so background images are visible
6. Ensure all heroes use the typographic scale (Display for headline, Lead for subtitle)
7. Add `text-wrap: balance` to all hero headlines

---

## PHASE 4: ANIMATION & MOTION SYSTEM

### TASK 4.1: Create GSAP ScrollTrigger Utilities

Create `/apps/frontend/components/ui/animations/gsap-scroll.tsx`:

Build a set of reusable GSAP scroll animation components:

```tsx
// 1. ScrollFadeIn — replaces basic Framer Motion scroll-reveal
// Fades + slides up content when it enters viewport
// Props: delay, duration, y (start offset), once (boolean)

// 2. ScrollParallax — performant parallax with GSAP
// Props: speed (0.1 to 1.0), direction ('up' | 'down')

// 3. ScrollPin — pins a section while content scrolls
// Props: trigger (ref), start, end, pinSpacing

// 4. ScrollProgress — returns scroll progress 0-1 for a section
// Props: trigger (ref), onProgress callback

// 5. ScrollRevealText — line-by-line text reveal
// Uses clip-path animation, splits text into lines
// Props: stagger (ms between lines), delay
```

All components must:
- Check `prefers-reduced-motion` and skip animations if enabled
- Clean up ScrollTrigger instances on unmount
- Use `"use client"` directive
- Accept `className` prop for styling

### TASK 4.2: Implement Page Transitions

Create `/apps/frontend/components/ui/animations/page-transition-wrapper.tsx`:

Use Framer Motion `AnimatePresence` with the Next.js App Router:

- Wrap page content in the root layout
- On route change: current page fades out (opacity 1→0, 200ms) → new page fades in (opacity 0→1, 300ms)
- Add a subtle `translateY(8px) → 0` on enter for depth
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`
- Keep transitions fast: total 400-500ms max (enterprise sites feel FAST, not cinematic)
- Ensure navigation and footer DON'T animate — only `<main>` content transitions

Modify `app/[locale]/layout.tsx` to incorporate the page transition wrapper around `{children}`.

### TASK 4.3: Implement Scroll Progress Bar

Create `/apps/frontend/components/ui/scroll-progress-bar.tsx`:

- Thin bar (3px) at the very top of the viewport, fixed position, z-50
- Color: `var(--color-brand)`
- Width: 0% at top of page, 100% at bottom
- Use CSS `scroll-timeline` for zero-jank performance (fallback to scroll event with rAF for unsupported browsers)
- Only show on pages with significant scroll depth (blog posts, case studies, about page)
- Integrate into root layout — conditionally render based on route

### TASK 4.4: Fix Counter Animations

**EDIT** `components/about/stats-section.tsx` and `components/shared/stats-section.tsx`:

Replace `Math.floor()` with `Math.round()` for smoother number transitions. Also:
- Use GSAP's `CountUp` approach or implement with `requestAnimationFrame`
- Numbers should count up over 2 seconds with easeOutExpo
- Use Intersection Observer to trigger only when in viewport
- Format numbers with locale-appropriate separators (e.g., "1,200+" not "1200+")
- Add a subtle `translateY(20px) → 0` on the stat card as the counter starts

### TASK 4.5: Add Custom Cursor (Desktop Only)

Create `/apps/frontend/components/ui/custom-cursor.tsx`:

- Only render on `pointer: fine` devices (desktop with mouse)
- Default: small dot (8px) with primary color, slight trail/lag using spring physics
- On hovering interactive elements (links, buttons, cards): expand to 40px ring with label:
  - Cards/case studies: "View" label
  - External links: "Open" label
  - Carousels: directional arrow
  - Buttons: expand ring only, no label
- Hide native cursor with `cursor: none` on `<body>` (desktop only)
- Smooth movement using GSAP's `quickTo` for 60fps performance
- Integrate into root layout
- Add `data-cursor="view"`, `data-cursor="open"`, `data-cursor="drag"` attributes to relevant elements across the site

### TASK 4.6: Fix Parallax Performance

Search ALL components for this pattern:
```tsx
window.addEventListener("scroll", handleScroll)
```

Replace EVERY instance with either:
1. **GSAP ScrollTrigger** with `scrub: true` (preferred), OR
2. **CSS `scroll-timeline`** for simple translateY parallax, OR
3. At minimum: throttle with `requestAnimationFrame`:
```tsx
useEffect(() => {
  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

Components to fix: `about-hero.tsx`, `hero-premium.tsx`, `contact-hero.tsx`, `service-hero.tsx`, `blog-hero.tsx`, `testimonials-section.tsx`, and any others found.

---

## PHASE 5: COMPONENT REFINEMENT

### TASK 5.1: Refine ALL Home Page Sections

For EACH component in `components/home/`, apply these rules:

**partners-section.tsx:**
- Keep the marquee but reduce from 2 rows to 1 row
- Logos: grayscale by default, color on hover (100ms transition)
- Remove the dark background with animated orbs — use `bg-neutral-50` or `bg-white` with a subtle top/bottom border
- Logo size: 40px height, consistent
- Add "Trusted by leading organizations" as an `.overline` label

**services-section.tsx:**
- Remove 3D tilt effect (too playful for enterprise)
- Replace with `card-interactive` hover (lift + shadow)
- Remove animated gradient borders — use a subtle `border border-neutral-200` with `hover:border-primary/30` transition
- Remove floating icons with rotation — use static icon in a light-primary-tinted circle
- Each card: Icon → Title → 2-line description → "Learn more →" link
- Grid: 3 columns on desktop (not 4 — gives more breathing room)

**products-section.tsx:**
- Remove ALL 3D transforms, perspective effects, and mouse-tracking shine
- Replace with clean card grid using `card-interactive`
- Each product card: Product icon/logo → Name → 1-line tagline → "Explore →" link
- Remove "Most Popular" badge with spinning star (too playful)
- If you need to highlight one product, use a subtle `ring-2 ring-primary` border

**testimonials-section.tsx:**
- Remove 3D carousel with rotateY transforms
- Replace with a simple, elegant carousel (use existing Embla Carousel):
  - One testimonial visible at a time, centered
  - Quote text in larger Lead size font
  - Author: photo (48px circle) + name + title + company
  - Company logo below
  - Simple dot indicators + prev/next arrow buttons
  - Auto-play at 6-second intervals, pause on hover/focus
- Remove parallax mouse movement on cards
- Remove floating quote marks animation

**why-choose-us-section.tsx:**
- Remove animated orbs from background
- Use a clean dark section (`bg-neutral-900 text-white`) OR clean white section
- 4 feature cards in 2x2 grid
- Each card: Large number ("01", "02", etc.) or icon → Title → Description
- Remove gradient border animations — use solid subtle borders
- Remove pulsing glow rings on icons

**who-we-are-section.tsx:**
- Keep the split layout (text left, image right) — this is enterprise-appropriate
- Remove decorative floating shapes
- Remove parallax on image (use static or subtle GSAP-driven float)
- Simplify value badges to text with subtle borders
- Add specific metrics: "X years", "X countries", "X+ clients"

**faqs-section.tsx:**
- Remove dark background with animated orbs — use `bg-neutral-50`
- Simplify accordion styling — remove gradient borders when open
- Keep the search functionality (good enterprise pattern)
- Remove category color coding (too complex) — use simple tags
- Clean typography: question in weight 600, answer in weight 400

**blog-section.tsx:**
- Remove 3D card transforms and mouse tracking
- Use `card-interactive` hover on cards
- Featured post: large card spanning full width with image left (40%), content right (60%)
- Other posts: 3-column grid of simple cards
- Each card: Image (16:9 aspect) → Category tag → Title → Author + date + read time → "Read →"
- Remove gradient overlays on images — use a subtle darkened overlay only at the bottom for text readability

**process-section.tsx:**
- Clean up to a horizontal stepped timeline on desktop:
  ```
  [01] ——→ [02] ——→ [03] ——→ [04]
  Title     Title     Title     Title
  Desc      Desc      Desc      Desc
  ```
- Remove aspect-square format — use natural height
- Connecting lines between steps (horizontal on desktop, vertical on mobile)
- Active step highlighted with primary color, others in neutral
- Remove ping animation — use a static indicator

### TASK 5.2: Refine About Page Sections

For EACH component in `components/about/`:

**about-hero.tsx:**
- Apply TASK 3.2 rules (reduce height, remove orbs, fix parallax, fix text stagger)

**mission-vision-section.tsx:**
- Reduce from 4 hover effects to 1 (just `card-interactive`)
- Remove text gradient from EVERY heading — use solid `text-neutral-900`
- Remove nested gradient-border icon containers — use a simple `bg-primary/10 text-primary` circle
- Two cards side by side: Mission (left) + Vision (right)

**core-values-section.tsx:**
- Remove shine sweep from ALL value cards
- Use `card-interactive` hover
- Clean icon styling: solid circle background with icon
- 4-column grid on desktop, 2-column on tablet, 1-column on mobile

**stats-section.tsx:**
- Apply TASK 4.4 counter fixes
- 4 stats in a single row on desktop
- Each stat: Large animated number → Label below
- Subtle dividers between stats (vertical lines on desktop)
- Background: `bg-primary` with white text (a strong brand statement)

**team-section.tsx:**
- Remove shine sweep from team cards
- Photo (square, rounded-xl) → Name → Title → LinkedIn icon link
- Grid: 4 columns desktop, 2 tablet, 1 mobile
- Hover: subtle image zoom (scale 1.03) + shadow increase

**global-presence-section.tsx:**
- Use a clean map visualization or list of office locations
- Each location: City → Country → Address → Contact
- Optionally add a simple world map SVG with dots for each office

**our-story-section.tsx:**
- Timeline layout with alternating left/right entries
- Each entry: Year → Title → Description
- Vertical connecting line between entries
- Use GSAP scroll-reveal for each entry to animate in as you scroll

### TASK 5.3: Refine Contact Page

**contact-form.tsx:**
- Implement **floating labels**: label starts as placeholder inside input, animates to small text above input on focus/fill
- Add `active:scale-[0.98]` to the submit button
- Replace pulsing circle success animation with a clean checkmark + "We'll be in touch within 24 hours" message
- Add skeleton loading state while form initializes
- Improve error message spacing: `mt-2` (not `mt-1.5`) and use a subtle red background bar
- Reduce form field count visible at once — show in logical groups:
  - Step 1: Name + Email + Phone
  - Step 2: Company + Subject
  - Step 3: Message
  - Use a subtle progress indicator (Step 1 of 3) at top

**contact-hero.tsx:**
- Apply hero rules from TASK 3.2

### TASK 5.4: Refine Services Pages

**service-tower-card.tsx:**
- Remove gradient border that ONLY appears on hover (jarring transition)
- Use `card-interactive` with `border border-neutral-200 hover:border-primary/30`
- Remove shine sweep
- Clean layout: Icon → Title → Description → Key services list → "Learn More →"

**service-hero-global.tsx / service-hero.tsx:**
- Apply hero rules from TASK 3.2

### TASK 5.5: Refine Footer

**READ then EDIT** `components/footer.tsx`:

- Keep 4-column layout but improve structure:
  - Column 1: Logo + tagline (2 lines) + Social icons row
  - Column 2: Services (links)
  - Column 3: Products (links)
  - Column 4: Company (About, Contact, Careers, Blog)
- Add trust bar above footer columns: certifications/compliance badges (ISO 27001, SOC 2, GDPR) as small logos in a row
- Bottom bar: Copyright + Privacy Policy + Terms of Service + Cookie Settings + Accessibility Statement
- Remove animated gradient effects from footer — use solid dark background (`bg-neutral-950`)
- Newsletter: move to a standalone section ABOVE the footer as a full-width band (`bg-primary text-white`)
- Back-to-top button: simple, appears after first fold, subtle animation

---

## PHASE 6: NEW PAGES & CONTENT SECTIONS

### TASK 6.1: Create Case Studies Infrastructure

Create the following new files:

**`/apps/frontend/data/case-studies.ts`:**
Define 4-6 case studies with this structure:
```typescript
export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  industry: string; // "Financial Services" | "Healthcare" | "Government" | "Technology" | "Energy"
  challenge: string; // 2-3 sentences
  approach: string; // 2-3 sentences
  results: {
    metric: string;
    value: string;
    description: string;
  }[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
    company: string;
  };
  services: string[]; // Which Digibit services were used
  products: string[]; // Which Digibit products were used
  heroImage: string; // URL placeholder
  duration: string; // "6 months", "12 weeks", etc.
  publishedAt: string;
}
```

Create placeholder data for 6 case studies across different industries. Use realistic but fictional company names and data. Each case study should have 3-4 result metrics.

**`/apps/frontend/app/[locale]/case-studies/page.tsx`:**
- Hero: "Client Success Stories" headline, overline "CASE STUDIES"
- Filter bar: All | Financial Services | Healthcare | Government | Technology | Energy
- Grid of case study cards (2 columns on desktop):
  - Each card: Hero image (16:9) → Industry tag → Title → Client → 1-sentence summary → Key metric highlight → "Read Case Study →"
- Use `card-interactive` hover

**`/apps/frontend/app/[locale]/case-studies/[slug]/page.tsx`:**
- Immersive full-page layout:
  - Full-width hero image with overlay → Client name → Title
  - "The Challenge" section with large Lead text
  - "Our Approach" section with methodology steps (numbered)
  - "The Results" section with animated stat counters (use GSAP)
  - Pull quote from client in large serif-style typography (use Aptos Display if available)
  - "Related Case Studies" at bottom
  - CTA: "Start Your Transformation" → Contact page
- Scroll progress bar visible on this page
- Table of contents in sticky sidebar (desktop only)

**`/apps/frontend/components/case-studies/`:**
Create: `case-study-card.tsx`, `case-study-hero.tsx`, `case-study-results.tsx`, `case-study-filter.tsx`

### TASK 6.2: Create Insights Hub (Upgrade Blog)

The current `/blogs` page needs to transform into an "Insights" hub:

**EDIT** `/apps/frontend/app/[locale]/blogs/page.tsx` (or create new `/insights/page.tsx` with redirect):

- Rename from "Blog" to "Insights" throughout the navigation, footer, and page
- Hero: "Insights & Thought Leadership" with overline "INSIGHTS"
- Featured article: full-width card at top with large image + title + author + reading time
- Filter bar: All | Articles | Case Studies | Whitepapers | Industry Reports
- Additional filters: Industry dropdown, Topic dropdown
- Content grid: 3-column card grid
- Each card: Image → Content type tag → Title → Author avatar + name → Date + reading time → "Read →"
- Sidebar (desktop): "Most Read" list (top 5), Newsletter signup, Topic cloud
- Pagination or "Load More" button at bottom

### TASK 6.3: Create Industry Pages

Create `/apps/frontend/data/industries.ts`:
```typescript
export interface Industry {
  slug: string;
  name: string;
  description: string;
  heroImage: string;
  challenges: string[];
  services: string[];
  products: string[];
  caseStudies: string[]; // slugs referencing case-studies.ts
  stats: { label: string; value: string }[];
}
```

Define 5 industries: Financial Services, Healthcare, Government, Technology, Energy & Utilities.

Create `/apps/frontend/app/[locale]/industries/page.tsx`:
- Grid of industry cards with icon + name + description

Create `/apps/frontend/app/[locale]/industries/[slug]/page.tsx`:
- Hero with industry name and description
- "Challenges We Solve" section
- "Our Services for [Industry]" — filtered services relevant to this industry
- "Our Products for [Industry]" — relevant products
- Case studies from this industry
- CTA to contact

### TASK 6.4: Add Certifications & Trust Section

Create `/apps/frontend/components/shared/certifications-bar.tsx`:

- A horizontal bar showing certification/compliance badges:
  - ISO 27001
  - SOC 2 Type II
  - GDPR Compliant
  - Microsoft Partner
  - Google Cloud Partner
- Each badge: small logo (32px) + name text
- Use on: Homepage (after hero, before first content section), Contact page, Footer
- Style: subtle `bg-neutral-50` with `border-y border-neutral-200`, horizontal scrollable on mobile

### TASK 6.5: Create Careers Page Placeholder

Create `/apps/frontend/app/[locale]/careers/page.tsx`:
- Hero: "Join Our Team" with overline "CAREERS"
- "Why Digibit" section: 3-4 value proposition cards (Innovation, Impact, Growth, Culture)
- "Open Positions" section: List of placeholder roles grouped by department
- Each role: Title → Department → Location → Type (Full-time) → "Apply →"
- CTA: "Don't see your role? Send us your CV" → email link

---

## PHASE 7: SKELETON LOADING & PERFORMANCE

### TASK 7.1: Create Skeleton Components

**READ** `components/ui/skeleton.tsx` and `components/ui/skeleton-premium.tsx`.

Create purpose-built skeleton screens for every async content area:

**`/apps/frontend/components/ui/skeletons/`:**

- `card-skeleton.tsx` — matches blog/case-study/service card layout: image block + 2 text lines + meta line
- `hero-skeleton.tsx` — matches hero layout: overline + headline block + subtitle + 2 button blocks
- `grid-skeleton.tsx` — renders 3-6 `card-skeleton` in a grid matching the page layout
- `stats-skeleton.tsx` — 4 number blocks in a row

All skeletons must:
- Use the `.skeleton-shimmer` animation from globals.css
- Match the exact dimensions and spacing of the final content to prevent CLS (Cumulative Layout Shift)
- Use `aria-hidden="true"` and `role="status"` with screen reader text "Loading..."

### TASK 7.2: Add `sizes` Prop to All Images

Search ALL components for `<Image` (Next.js Image component). For every instance that does NOT have a `sizes` prop, add one:

- Full-width images: `sizes="100vw"`
- Half-width images: `sizes="(max-width: 768px) 100vw, 50vw"`
- Third-width (in 3-col grid): `sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"`
- Quarter-width (in 4-col grid): `sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"`
- Thumbnails/logos: `sizes="160px"` (or appropriate fixed size)

### TASK 7.3: Lazy Load Heavy Components

In the homepage (`app/[locale]/page.tsx`) and other pages with many sections:

- Use `next/dynamic` to lazy-load sections below the fold:
```tsx
import dynamic from 'next/dynamic';

const TestimonialsSection = dynamic(() => import('@/components/home/testimonials-section'), {
  loading: () => <SectionSkeleton />,
});
const FAQsSection = dynamic(() => import('@/components/home/faqs-section'), {
  loading: () => <SectionSkeleton />,
});
// ... etc for sections below the fold
```

- Hero section and first 1-2 sections should be statically imported (above the fold)
- Everything else should be dynamically imported

### TASK 7.4: Remove Excessive DOM Elements

Go through each home page section and COUNT the decorative elements (blurred orbs, gradient overlays, animated shapes, duplicate arrays for marquee). Apply these limits:
- Maximum 1 decorative background element per section (blurred gradient, 10-15% opacity)
- Maximum 1 gradient overlay per section
- Remove ALL `animate-pulse` from decorative elements (only use for loading states)
- Marquee: only duplicate the array once (not 2-3 times)

---

## PHASE 8: MOBILE EXPERIENCE

### TASK 8.1: Fix Touch Targets

Search ALL components for interactive elements (buttons, links, checkboxes, icon buttons). Ensure ALL have minimum 44x44px touch target:

- Checkboxes: wrap in a label with `p-3` minimum
- Icon buttons (close, prev/next): explicit `min-w-[44px] min-h-[44px]`
- Navigation links on mobile: `py-3` minimum
- Footer links: `py-2` minimum

### TASK 8.2: Improve Mobile Spacing

- Change global container padding from `px-4` to `px-5 sm:px-6` for more breathing room on mobile
- Hero sections on mobile: `min-h-[60vh]` (not 90vh)
- Section padding on mobile: `py-16` (not `py-20` or `py-24`)

### TASK 8.3: Add Swipe Gestures to Carousels

The Embla Carousel library already supports swipe. Ensure ALL carousel instances have:
- Touch drag enabled
- Visible drag indicator on mobile (subtle drag handle or "Swipe to see more" hint)
- Momentum-based scrolling
- No arrow buttons on mobile (only swipe + dots)

### TASK 8.4: Add Bottom-Anchored Mobile CTA

Create `/apps/frontend/components/ui/mobile-cta-bar.tsx`:

- Visible only on mobile (`md:hidden`)
- Fixed at bottom of viewport
- Contains: "Contact Us" button (full width, `bg-primary text-white`, 56px height)
- Appears after scrolling past the hero section (use Intersection Observer)
- Has a subtle top shadow for depth
- Does NOT appear on the contact page itself
- Include it in the root layout

---

## PHASE 9: ENTERPRISE PATTERNS

### TASK 9.1: Implement Dark Mode

**READ** `globals.css` — dark mode CSS variables are partially defined but unused.

1. Complete the dark mode token set in `globals.css` under `.dark` class
2. Create a theme toggle component at `/apps/frontend/components/ui/theme-toggle.tsx`:
   - Sun/Moon icon button
   - Persists choice in `localStorage`
   - Defaults to system preference (`prefers-color-scheme`)
   - Smooth transition: apply `transition-colors duration-200` to `<html>` element
3. Add the toggle to the navbar (desktop: next to language switcher, mobile: in mobile nav)
4. Update ALL components to use Tailwind dark mode classes (`dark:bg-neutral-900`, `dark:text-white`, etc.)
5. Ensure adequate contrast in dark mode (WCAG AA: 4.5:1 for body text, 3:1 for large text)

### TASK 9.2: Implement Breadcrumb Navigation

Create `/apps/frontend/components/ui/breadcrumb.tsx`:

- Shows on all pages except homepage
- Format: `Home / Services / Cybersecurity`
- Each segment is a link except the current page
- Use `aria-label="Breadcrumb"` and `aria-current="page"` on the last item
- Style: `.overline` size, `text-neutral-500`, separator uses `/` or `›`
- Positioned below the navbar, inside page content (not in a fixed bar)
- Uses the existing `breadcrumb-schema.tsx` SEO component for structured data

Add breadcrumbs to: About, Services, Services/[slug], Products, Products/*, Blog, Blog/[slug], Case Studies, Case Studies/[slug], Industries, Industries/[slug], Contact, Training, Careers.

### TASK 9.3: Cookie Consent Banner

Create `/apps/frontend/components/ui/cookie-consent.tsx`:

- Bottom-fixed banner that appears on first visit
- Text: "We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies."
- Two buttons: "Accept All" (primary) and "Cookie Settings" (ghost)
- "Cookie Settings" opens a modal with toggles for: Essential (always on), Analytics, Marketing
- Persist choice in `localStorage` (key: `cookie-consent`)
- Don't show again after choice is made (check on mount)
- Animate in: slide up from bottom, 300ms
- Accessible: focus trap in settings modal, `role="dialog"`

### TASK 9.4: Accessibility Statement Page

Create `/apps/frontend/app/[locale]/accessibility/page.tsx`:

A simple content page with:
- "Accessibility Statement" headline
- Commitment paragraph
- Standards followed (WCAG 2.1 AA)
- How to report issues (email link)
- Last updated date

Link from footer.

### TASK 9.5: Back-to-Top Button (Global)

Create `/apps/frontend/components/ui/back-to-top.tsx`:

- Small circular button (44x44px), `bg-primary text-white`
- Arrow-up icon (Lucide `ChevronUp`)
- Fixed position: bottom-right, `bottom-6 right-6` (adjust on mobile to avoid mobile CTA bar)
- Only visible after scrolling past the first viewport height (use Intersection Observer)
- Animate in: fade + slide up
- On click: smooth scroll to top
- `aria-label="Back to top"`

Add to root layout.

---

## PHASE 10: SEO & META IMPROVEMENTS

### TASK 10.1: Add Structured Data

**READ** the existing SEO components in `components/seo/`.

Ensure the following JSON-LD schemas are present:

1. **Organization schema** (homepage) — already exists in `organization-schema.tsx`, verify it's complete with: name, url, logo, contactPoint, sameAs (social links), address
2. **BreadcrumbList schema** — already exists in `breadcrumb-schema.tsx`, ensure it's used on all inner pages
3. **Service schema** (each service page) — verify `service-schema.tsx` is used
4. **Product schema** (each product page) — verify `product-schema.tsx` is used
5. **Article schema** (blog posts) — create if missing: headline, author, datePublished, image
6. **FAQ schema** (pages with FAQs) — verify `faq-schema.tsx` is used

### TASK 10.2: Add Open Graph & Twitter Meta Tags

**EDIT** `lib/metadata.ts` to include:
- `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`
- `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`
- `canonical` URL

Ensure EVERY page's `metadata` export includes these. Create a default OG image at `/public/og-default.jpg` (1200x630px placeholder — blue gradient with Digibit logo centered).

---

## PHASE 11: FINAL POLISH

### TASK 11.1: Add Lottie Animations for Key Icons

Install is already done (lottie-react from TASK 1.1).

Create `/apps/frontend/components/ui/lottie-icon.tsx`:
- Wrapper component that loads a Lottie JSON file
- Props: `src` (path to JSON), `loop` (boolean), `autoplay` (boolean), `playOnHover` (boolean), `playOnView` (boolean), `size` (number)
- If `playOnView`: uses Intersection Observer to play when visible
- If `playOnHover`: plays on mouseenter, resets on mouseleave

You don't need to create custom Lottie files now — create the component infrastructure so that when Lottie JSON files are added to `/public/lottie/`, they can be used immediately. For now, keep the existing Lucide icons but make the Lottie component available for future use.

### TASK 11.2: Add Newsletter Section (Above Footer)

Create `/apps/frontend/components/shared/newsletter-band.tsx`:

- Full-width section between page content and footer
- Background: `bg-primary` with white text
- Content: "Stay ahead of the curve" headline + "Get the latest insights delivered to your inbox" subtitle + email input + subscribe button
- Single row on desktop: text left, form right
- Stacked on mobile
- Form submits to the existing newsletter API endpoint
- Success state: "Thanks! You're subscribed." with checkmark
- Include in root layout, above `<Footer />`

### TASK 11.3: Update Homepage Section Order

**EDIT** `app/[locale]/page.tsx`:

Reorder sections for optimal enterprise conversion funnel:

```
1. Hero (transformed — TASK 3.1)
2. Certifications Bar (new — TASK 6.4)
3. Services Section (refined — TASK 5.1)
4. Products Section (refined — TASK 5.1)
5. Case Studies Preview (new — show 3 latest, link to full page)
6. Stats Section (bold brand statement — numbers on primary background)
7. Who We Are (refined — TASK 5.1)
8. Testimonials (refined — TASK 5.1)
9. Insights Preview (3 latest articles)
10. Process Section (refined — TASK 5.1)
11. FAQs (refined — TASK 5.1)
```

Remove: `partners-section` as a standalone section (partner logos are now in the hero trust bar). Remove: `why-choose-us-section` (content absorbed into other sections). Remove: `about-us-section` (redundant with who-we-are).

### TASK 11.4: Add i18n Translation Keys

For ALL new components and content, add translation keys to ALL 5 message files:
- `/apps/frontend/messages/en.json`
- `/apps/frontend/messages/ar.json`
- `/apps/frontend/messages/fr.json`
- `/apps/frontend/messages/es.json`
- `/apps/frontend/messages/pt.json`

For non-English languages, you may use placeholder translations (e.g., "[FR] Stay ahead of the curve") that can be professionally translated later. But the keys MUST exist in all files.

### TASK 11.5: Final Quality Checks

After ALL previous tasks are complete:

1. Run `npm run build --workspace=apps/frontend` and fix ALL TypeScript errors
2. Run `npm run lint --workspace=apps/frontend` and fix ALL linting errors
3. Verify no console errors in browser dev tools
4. Test ALL pages at these breakpoints: 375px (iPhone SE), 768px (iPad), 1024px (iPad landscape), 1440px (desktop), 1920px (large desktop)
5. Test keyboard navigation: Tab through every page, verify focus is visible on ALL interactive elements
6. Test with `prefers-reduced-motion: reduce` — verify no animations play
7. Verify ALL images have `alt` text
8. Verify ALL links have descriptive text (no "click here")
9. Run Lighthouse on homepage — target: Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+

---

## CRITICAL RULES (DO NOT VIOLATE)

1. **NEVER write a new file without reading every existing file it relates to first**
2. **NEVER change the tech stack** — no new frameworks, no replacing Next.js, no replacing Tailwind
3. **ALWAYS support i18n** — use `useTranslations()` from `next-intl` in all client components, `getTranslations()` in server components
4. **ALWAYS support RTL** — Arabic locale must work with proper right-to-left layout
5. **ALWAYS use TypeScript** — no `any` types, no `@ts-ignore`
6. **ALWAYS use the existing patterns** — look at how other components in the codebase do things and follow the same approach
7. **PREFER editing existing files** over creating new ones whenever possible
8. **KEEP animations subtle** — the rule is "purposeful motion, not decoration"
9. **KEEP color restrained** — Primary Blue + Orange accent. That's it. No rainbow gradients
10. **EVERY interactive element needs**: hover state, active state, focus-visible state, and disabled state
11. **EVERY new component needs**: proper TypeScript types, displayName, and JSDoc comment
12. **EVERY new page needs**: proper metadata export with title, description, OG tags
13. **NEVER use `font-black` (900) or `font-extrabold` (800)** — maximum weight is `font-bold` (700), prefer `font-semibold` (600)
14. **NEVER add more than 1 decorative background element per section**
15. **ALWAYS clean up event listeners and GSAP instances in useEffect return functions**

---

## SUCCESS CRITERIA

When complete, the website should:

1. **Feel fast** — Page transitions are smooth, no jank, LCP < 2.5s
2. **Feel premium** — Subtle, purposeful animations. Clean typography. Restrained color
3. **Feel authoritative** — Case studies, certifications, thought leadership, industry expertise
4. **Feel accessible** — Full keyboard navigation, screen reader support, WCAG 2.1 AA
5. **Feel enterprise** — Mega menu navigation, search, breadcrumbs, dark mode, cookie consent
6. **Feel global** — 5 languages, RTL support, global office presence, cultural awareness
7. **Score 90%+ on Lighthouse** across all categories
8. **Benchmark at 80%+ against EY/PwC/IBM/McKinsey** on visual quality, content depth, interaction sophistication, and professional polish
