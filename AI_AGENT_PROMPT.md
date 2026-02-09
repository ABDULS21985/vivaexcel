# MEGA-PROMPT: Transform Global Digitalbit Website into an Award-Winning Digital Experience

> **Target:** Awwwards / FWA / CSS Design Awards level quality
> **Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Framer Motion 12, GSAP 3.14 + ScrollTrigger, Lottie React, Embla Carousel, Radix UI
> **Brand Colors:** Primary `#1E4DB7`, Secondary `#143A8F`, Yellow `#FFE63B`, Orange `#F59A23`, Red `#E86A1D`
> **Font:** Aptos (custom) + Noto Sans Arabic (RTL)
> **Languages:** EN, AR, FR, ES, PT — all content lives in `apps/frontend/messages/{locale}.json`
> **Codebase:** Monorepo at `apps/frontend/` (Next.js marketing site), `apps/backend/` (NestJS API), `apps/dashboard/` (admin)

---

## TABLE OF CONTENTS

1. [Homepage & Hero Section](#part-1-homepage--hero-section)
2. [Inner Pages, Navigation & Page Transitions](#part-2-inner-pages-navigation--page-transitions)
3. [Animation System, Design System & Premium Polish](#part-3-animation-system-design-system--premium-polish)
4. [Content Strategy, Copywriting & Premium Experience](#part-4-content-strategy-copywriting--premium-experience)

---

# PART 1: HOMEPAGE & HERO SECTION

---

## 0. GLOBAL HOMEPAGE PHILOSOPHY

The homepage of globaldigitalbit.com must function as a single, cinematic narrative scroll — a 60-second "brand film" told through code. Every section is a scene. Every scroll tick is a frame. The user should feel like they are not browsing a website but experiencing a presentation from a company that commands the future of enterprise technology. The emotional arc is: **AWE → TRUST → UNDERSTANDING → DESIRE → CONFIDENCE → ACTION.**

Scroll pacing must feel intentional. No section should appear "just sitting there." Every element enters with purpose, lingers with presence, and yields to the next scene with choreographed grace. Use GSAP ScrollTrigger as the backbone orchestrator. Framer Motion handles component-level entrance animations and hover micro-interactions. Lottie handles illustrative animated icons and ambient loops. Embla Carousel handles any horizontal carousels. Tailwind CSS 4 handles all layout, spacing, and responsive design — zero raw CSS unless absolutely unavoidable.

**Performance mandate:** All animations must run on the compositor thread (transform, opacity only). No layout-triggering animations. Use `will-change: transform` sparingly and remove after animation completes. Lazy-load all images and Lottie files below the fold. Target Lighthouse performance score 90+ on mobile.

---

## 1. HERO SECTION — "THE OPENING SHOT"

### 1.1 Concept & Emotional Target

The hero is the single most important 5 seconds of the entire website. It must evoke the feeling of standing at the control center of a global technology operation — commanding, vast, precise, and alive with data. Think: the opening shot of a Christopher Nolan film meets Apple's product reveal pages meets Bloomberg Terminal aesthetics.

The user must feel three things instantly: (1) this company operates at a global, serious scale, (2) they are technologically elite, (3) they are confidently in control.

### 1.2 Layout & Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Navbar - transparent, blurs on scroll]                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │   [Slide indicator pills — top right, vertical]         │ │
│  │                                                         │ │
│  │   [KICKER — small caps, accent yellow, tracked wide]    │ │
│  │   "ENTERPRISE TECHNOLOGY PARTNERS"                      │ │
│  │                                                         │ │
│  │   [HEADLINE — massive, 2-3 lines]                       │ │
│  │   "We Architect the Digital                             │ │
│  │    Infrastructure of Tomorrow"                          │ │
│  │                                                         │ │
│  │   [SUBTEXT — 1 line, muted white, 18-20px]             │ │
│  │   "Cybersecurity · AI · Blockchain · Digital            │ │
│  │    Transformation — across 50+ countries."              │ │
│  │                                                         │ │
│  │   [CTA CLUSTER]                                         │ │
│  │   [ Get a Consultation ●─→ ]  [ View Our Work ]        │ │
│  │                                                         │ │
│  │   ─────────────────────────────────────────             │ │
│  │   [STATS BAR — bottom, 4 items, horizontal]             │ │
│  │   500+ Projects  │  50+ Countries  │  99%  │  24/7     │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Scroll indicator — animated chevron at bottom center]      │
└─────────────────────────────────────────────────────────────┘
```

Full viewport height (`100dvh`). Content vertically centered with slight upward bias (45% from top). Max content width 1280px, centered.

### 1.3 Background Treatment — "The Living Canvas"

**Replace the current basic carousel background with a layered cinematic system:**

**Layer 0 (Base):** Deep gradient mesh — from `#0A1628` (near-black navy) at top to `#0D2137` at bottom. This ensures text is always readable regardless of image state.

**Layer 1 (Imagery):** Three slides, each a full-bleed background image with these treatments:
- Images must be high-quality, desaturated by 30%, with a multiply blend overlay of `rgba(14, 30, 60, 0.65)` to maintain brand color consistency and text contrast.
- Slide 1: Abstract visualization of a global network — nodes and connections spanning a dark world map. Conveys "global reach."
- Slide 2: Close-up of server infrastructure or a cybersecurity operations center. Conveys "technical depth."
- Slide 3: Aerial view of a modern Middle Eastern cityscape (Doha skyline) blended with African tech hub imagery. Conveys "our markets."

**Layer 2 (Atmospheric Effects):**
- Implement a subtle floating particle field using canvas or CSS pseudo-elements — tiny dots (1-2px, `rgba(255, 230, 59, 0.15)`) drifting slowly upward. 40-60 particles. Speed: 0.2-0.5px per frame. This adds "technological atmosphere" without distraction.
- Add a very subtle radial gradient vignette (`rgba(0,0,0,0.4)`) around the edges to draw focus to center content.

**Layer 3 (Mouse Parallax — Enhanced):**
- Keep the existing mouse-follow parallax but refine it: background image layer should shift by `±15px` on X/Y based on cursor position. Particle layer shifts by `±25px` (faster, creates depth). Content text does NOT move (anchored for readability). Use `gsap.quickTo()` for 60fps-smooth interpolation with `duration: 0.6, ease: "power3.out"`.

### 1.4 Slide Transitions — "The Morph Cut"

**Replace basic fade with a cinematic crossfade-plus-zoom system:**

Each slide transition (auto-advances every 7 seconds, pausable on hover/focus):
1. Current slide's background image begins a slow Ken Burns zoom-in (`scale: 1.0 → 1.08`) over 7 seconds using `gsap.to()` with `ease: "none"` (linear for Ken Burns).
2. On transition trigger: current image fades out (`opacity: 1 → 0`, 1.2s, `ease: "power2.inOut"`) while simultaneously scaling slightly faster (`scale → 1.12`).
3. Next image fades in (`opacity: 0 → 1`, 1.2s, `ease: "power2.inOut"`) starting at `scale: 1.04` and beginning its own Ken Burns zoom to `1.0` then continuing to `1.08`.
4. Text content does NOT change between slides — headlines remain static. Only the background imagery rotates. This is critical: we are NOT a slider with different messages. We are a single powerful message with a living, breathing backdrop.

**Slide indicator pills** (right side, vertical): Three small pills (6px wide, 20px tall, rounded-full). Active pill: `#FFE63B` (accent yellow), height expands to 40px. Inactive: `rgba(255,255,255,0.3)`. Transition between states: `0.4s ease-out`. Clickable to jump to specific slide.

### 1.5 Text Entrance Choreography — "The Reveal"

On initial page load (NOT on scroll — this triggers immediately), execute the following staggered entrance sequence using a GSAP timeline:

```
Timeline: heroEntrance
├── t=0.0s    Kicker text fades up (opacity 0→1, y: 20→0, duration: 0.6s, ease: "power3.out")
├── t=0.15s   Headline Line 1 — word-by-word reveal (each word: opacity 0→1, y: 30→0,
│              duration: 0.5s, ease: "power3.out", stagger: 0.08s between words)
├── t=0.35s   Headline Line 2 — same word-by-word reveal (stagger continues from Line 1)
├── t=0.7s    A gradient highlight sweeps across key words "Digital Infrastructure"
│              — use a CSS `background-size` animation from 0% to 100% on a linear-gradient
│              (`#FFE63B` to `#F59A23`) applied via `background-clip: text` on those words.
│              Duration: 0.8s, ease: "power2.inOut"
├── t=0.8s    Subtext fades up (opacity 0→1, y: 15→0, duration: 0.5s, ease: "power3.out")
├── t=1.0s    CTA buttons scale in (scale: 0.9→1, opacity 0→1, duration: 0.5s,
│              ease: "back.out(1.4)", stagger: 0.1s)
├── t=1.2s    Stats bar rises from bottom (y: 40→0, opacity 0→1, duration: 0.6s,
│              ease: "power3.out")
├── t=1.3s    Stats numbers begin counting up from 0 to final value
│              (use GSAP `snap` modifier to round numbers, duration: 2.0s, ease: "power2.out")
├── t=1.5s    Scroll indicator fades in (opacity 0→1, duration: 0.4s)
│              then begins perpetual bounce animation (y: 0→8→0, duration: 1.5s,
│              ease: "sine.inOut", repeat: -1)
└── t=1.6s    Particle field fades in (opacity 0→0.15, duration: 1.0s)
```

### 1.6 Headline Typography

- Font size: `clamp(2.5rem, 5.5vw, 5rem)` — massive but responsive.
- Font weight: 700 or 800 (Bold/ExtraBold).
- Line height: 1.05-1.1 (tight).
- Letter spacing: `-0.02em` (slight tightening for premium feel).
- Color: `#FFFFFF` for base text. Key phrase "Digital Infrastructure" uses the gradient text treatment described above.
- The kicker above the headline: font-size 13-14px, letter-spacing `0.15em`, text-transform uppercase, color `#FFE63B`.

### 1.7 CTA Buttons

**Primary CTA — "Get a Consultation":**
- Background: `#FFE63B` (accent yellow). Text: `#0A1628` (near-black). Font weight 600. Padding: `16px 32px`. Border-radius: `12px`.
- Contains a right-arrow icon (→) that sits 8px right of text.
- **Hover animation:** Background shifts to `#F59A23` (orange), arrow translates `+4px` right, button gains a `box-shadow: 0 0 30px rgba(255, 230, 59, 0.3)`. All transitions: `0.3s ease-out`.
- **Magnetic hover effect:** When cursor is within 80px of the button, the button subtly shifts toward the cursor by up to 4px (using `gsap.quickTo()` on x/y transforms). On mouse leave, it springs back with `ease: "elastic.out(1, 0.3)"`, `duration: 0.6s`.

**Secondary CTA — "View Our Work":**
- Transparent background, `1px solid rgba(255,255,255,0.3)` border. White text. Same padding and radius.
- **Hover:** Border becomes `rgba(255,255,255,0.8)`, text color stays white, background becomes `rgba(255,255,255,0.05)`. Arrow icon appears from left (opacity 0→1, x: -4→0). Transition: `0.3s ease-out`.

### 1.8 Stats Counter Bar

Four stats arranged horizontally at the bottom of the hero, separated by thin vertical dividers (`1px, rgba(255,255,255,0.15), height: 40px`).

Each stat:
```
[Large Number]  [Label below]
   500+          Projects Delivered
    50+          Countries Served
    99%          Client Satisfaction
   24/7          Global Support
```

- Number: font-size `clamp(1.75rem, 3vw, 2.5rem)`, font-weight 700, color `#FFFFFF`.
- Label: font-size 13-14px, color `rgba(255,255,255,0.6)`, font-weight 400.
- Numbers animate via GSAP counter (count from 0 to target, duration 2s, ease `power2.out`, `snap: {value: 1}` for integers). The "%" and "+" symbols should be static and appended, not animated. "24/7" should type in as a string, not count.
- On hover over any stat, the number scales up to `1.05` and color shifts to `#FFE63B`, with a gentle `0.3s ease-out` transition.

### 1.9 Scroll Indicator

Centered at the bottom of the hero, 32px above the fold:
- A thin line (1px wide, 24px tall, white) with a small dot (4px) that travels down the line repeatedly.
- Or: a small chevron/arrow-down icon that bounces `8px` vertically in an infinite loop (`ease: "sine.inOut"`, `duration: 1.5s`).
- Text "Scroll to explore" in 11px, uppercase, letter-spacing `0.1em`, `rgba(255,255,255,0.4)`, positioned below the icon.
- Fades out when user scrolls past 100px (`ScrollTrigger`, `scrub: true`, opacity `1→0` over first 100px of scroll).

### 1.10 Hero Exit Animation (Scroll-Driven)

As the user scrolls past the hero (using GSAP ScrollTrigger, `scrub: 0.5`):
- Background image: `scale` from `1.08 → 1.2`, `opacity: 1 → 0`. Creates a "zoom-into-the-future" feeling.
- Headline text: `y: 0 → -60px`, `opacity: 1 → 0` (text rises and fades as if ascending).
- Stats bar: `y: 0 → 30px`, `opacity: 1 → 0` (drops away).
- Particle field: `opacity → 0`.
- The overall effect should feel like the hero is a portal that the user is passing through.

### 1.11 Responsive Behavior

- **Desktop (≥1280px):** Full layout as described. Stats bar horizontal, 4 columns.
- **Tablet (768-1279px):** Headline clamps down. Stats bar becomes 2x2 grid. Slide indicators move to bottom-center, horizontal. Mouse parallax disabled (no hover on touch). Particle count reduced to 20.
- **Mobile (<768px):** Headline font drops to `clamp(2rem, 8vw, 2.75rem)`. Stats become a horizontal scrollable strip (Embla Carousel, single row, auto-scroll). CTAs stack vertically, full width. Kicker font: 11px. Particle field disabled entirely. Ken Burns zoom reduced to `1.0 → 1.03` for performance. Scroll indicator hidden.

---

## 2. PARTNERS / TRUST BAR — "THE CREDIBILITY RIBBON"

### 2.1 Concept

Immediately below the hero fold. This section serves as a "social proof speed bump" — before the user reads anything else, they see that serious organizations trust this company.

### 2.2 Layout

- Section height: compact — `py-12` to `py-16`.
- Background: `#FFFFFF` or `#F8FAFC` — a sharp contrast to the dark hero.
- Small heading above logos: "Trusted by industry leaders across 50+ countries" — font-size 14px, uppercase, letter-spacing `0.08em`, color `#64748B`, text-center.

### 2.3 Logo Marquee

- 10-16 partner/client logos in a continuous horizontal marquee (infinite scroll, no pause, no gaps).
- CSS `@keyframes` for the scroll animation (`translateX(0)` to `translateX(-50%)`, duplicated content). Speed: ~40px/second.
- Each logo: grayscale by default (`filter: grayscale(100%) opacity(0.5)`). On hover: full color and full opacity (`0.4s ease-out`). Logo height: 28-36px. Spacing: 60-80px.
- Marquee pauses on hover over the strip.

### 2.4 Entrance Animation

- Heading fades up: `y: 15 → 0`, `opacity: 0 → 1`, `0.5s`.
- Logo strip fades in 0.2s later.
- A thin horizontal line above/below animates from center outward (`scaleX: 0 → 1`, `0.8s`).

---

## 3. WHO WE ARE — "THE ORIGIN STORY"

### 3.1 Concept

Split-panel cinematic layout with purposeful asymmetry, like a Stripe or Linear "about" section.

### 3.2 Layout

- 55% left (text) / 45% right (visual). Section padding: `py-24`. Background: White.
- **Kicker:** "WHO WE ARE" — 13px, uppercase, with 40px accent line left of it.
- **Headline:** "Engineering Digital Confidence for a Connected World" — with gradient text on "Confidence".
- **Body:** 2 paragraphs about the company.
- **Mini stat cards:** Two cards ("15+ Years of Experience", "200+ Certified Experts").
- **CTA:** "Learn More About Us →" with animated underline.

### 3.3 Right Column — Visual

- Composite image(s) or animated Lottie globe with connection nodes.
- Parallax: right column moves at `0.92x` scroll speed.
- Certification badges below.

### 3.4 Entrance Animations

Staggered entrance: kicker → headline (word-by-word) → body → stat cards → CTA → right column images → certification badges → stat counters.

---

## 4. SERVICES SECTION — "THE ARSENAL"

### 4.1 Layout — "Interactive Service Modules"

- Background: subtle gradient `#F8FAFC` → `#FFFFFF`.
- 4-column grid (desktop), 2 (tablet), 1 (mobile). Gap: `24px`.

### 4.2 Service Card Design

- Default: `bg-white`, `border: 1px solid #E2E8F0`, `p-8`, `shadow-sm`, `rounded-2xl`.
- **Hover:** Border becomes `#1E4DB7`, card lifts `translateY(-6px)`, `box-shadow: 0 20px 40px rgba(30,77,183,0.1)`. Lottie icon plays. Accent bar appears at top (`scaleX: 0 → 1`). All `0.35s ease-out`.
- Lottie icons (56x56px) specific to each service, in `64x64` circle with `bg-#EEF2FF`.

### 4.3 Entrance

Cards stagger in grid-aware sequence: `y: 40 → 0`, `opacity: 0 → 1`, `scale: 0.95 → 1`, `stagger: 0.08s`.

---

## 5. PRODUCTS SHOWCASE — "THE PORTFOLIO"

### 5.1 Layout — Horizontal Showcase Carousel

- Background: `#0F172A` (dark navy) — dramatic shift from light sections.
- Embla Carousel with `align: "start"`, `dragFree: true`. 3 cards desktop, 2 tablet, 1 mobile.

### 5.2 Product Card

- `rounded-2xl`, `overflow-hidden`. Top 60%: product visual. Bottom 40%: content.
- Category tag: pill badge (`bg-rgba(255,230,59,0.15)`, `text-#FFE63B`).
- Hover: `translateY(-8px)`, deeper shadow, visual zooms to `scale: 1.05`.

### 5.3 Entrance

Cards stagger from left: `x: 60 → 0`, `opacity: 0 → 1`, `stagger: 0.12s`.

---

## 6. PROCESS / METHODOLOGY — "THE BLUEPRINT"

### 6.1 Layout — Scroll-Activated Step Reveal

- Central vertical line with progress fill (gradient `#1E4DB7` → `#FFE63B`) tied to scroll via GSAP `scrub: true`.
- Step nodes pop when scroll reaches them. Content cards animate in from alternating sides.
- Steps: Discover → Strategize → Build → Deploy & Optimize.

---

## 7. WHY CHOOSE US — "THE DIFFERENTIATOR"

- 2-column grid of "Feature-Proof" cards with left border accent.
- Each card has Lottie icon, title, description with concrete proof points.
- Cards stagger in grid-aware pattern.

---

## 8. TESTIMONIALS — "THE VOICES"

- Dark background (`#0F172A`). Single large cinematic quote card.
- Stars animate sequentially. Quote with decorative quotation mark.
- Auto-advance every 8s. Framer Motion `AnimatePresence` transitions.

---

## 9. BLOG PREVIEW — "THE INTELLIGENCE FEED"

- 60/40 split: featured post (left, tall card) + 2 smaller posts (right, stacked).
- Featured: image with gradient overlay, title overlaid. Secondary: horizontal layout.
- Entrance: featured from left, secondary from right with stagger.

---

## 10. FAQs — "THE CLARITY ENGINE"

- Clean accordion with smooth height animation. Only one open at a time.
- Active item gets left accent border. `+` rotates to `×`.
- Items stagger in from bottom like "terminal printing lines."

---

## 11. OVERALL HOMEPAGE FLOW & SCROLL STORYTELLING

### Section Sequence & Emotional Arc

```
SECTION                   EMOTION              BG COLOR
──────────────────────────────────────────────────────
1. Hero                   Awe, scale           Dark (#0A1628)
2. Partners Trust Bar     Credibility          Light (#F8FAFC)
3. Who We Are             Understanding        White (#FFFFFF)
4. Services               Capability           Light (#F8FAFC)
5. Products               Prestige, premium    Dark (#0F172A)
6. Process                Confidence           White (#FFFFFF)
7. Why Choose Us          Trust, proof         Light (#F8FAFC)
8. Testimonials           Social proof         Dark (#0F172A)
9. Blog Preview           Thought leadership   White (#FFFFFF)
10. FAQs                  Clarity              Light (#F8FAFC)
11. Footer / CTA          Action               Dark (#0A1628)
```

Light/dark alternation creates visual rhythm. Dark sections contain the most emotionally impactful content.

### Scroll Progress Indicator

Thin `2px` progress bar at the top of the viewport. Color: `#1E4DB7` with glowing right edge. Fills with scroll progress.

### Return to Top Button

Appears after 2x viewport scroll. `48px` circle, `bg-#1E4DB7`. Hover: `bg-#FFE63B`. Spring entrance animation.

---

# PART 2: INNER PAGES, NAVIGATION & PAGE TRANSITIONS

---

## 1. NAVIGATION TRANSFORMATION

### 1.1 Sticky Header — Scroll Behavior & Visual States

**State 1 — Full (scroll = 0):**
- Height: 80px desktop / 64px mobile. Fully transparent background.
- Full wordmark logo in white. Nav links in `white/90`.
- Right cluster: Language switcher, Search (Cmd+K), "Get in Touch" CTA button.

**State 2 — Scrolled (after 100px):**
- Height: 64px/56px. `backdrop-blur-xl bg-white/80 saturate-150`.
- Logo transitions to compact logomark via `AnimatePresence`.
- Nav links invert to dark. Shadow: barely-there `0 1px 3px rgba(0,0,0,0.04)`.

**State 3 — Mega Menu Open:**
- Solid background. Full-viewport overlay behind menu.

**Scroll Direction Awareness:**
- Scroll DOWN past 400px: header slides up `translateY(-100%)`.
- Scroll UP: header slides back in.
- `useScrollDirection` hook with 10px threshold.

**RTL (Arabic):** Entire header flips. Use logical properties (`ms-`, `me-`, `ps-`, `pe-`). NEVER hardcode `left`/`right`.

### 1.2 Mega Menu — Desktop

- Full-width dropdown, `max-height: 70vh`.
- Opens: `opacity: 0→1`, `translateY(-8px)→0`, `250ms`. Content staggers with `30ms` between groups.
- Closes: `150ms` (faster). `150ms` hover-off delay (Stripe-style hover bridge).
- Keyboard accessible: `aria-expanded`, `role="menu"`, focus trap, `Escape` to close.

### 1.3 Mobile Navigation — Drawer

- Slides from right (`350ms`). Page content behind shifts left 20%, scales to `0.95`, dims.
- Width: `85vw` on phones, `400px` max.
- Sub-navigation: push-style — parent list slides left, child list slides in from right.
- Close: X button, swipe right, overlay tap, Escape, browser back.
- RTL: Drawer slides from LEFT. Swipe-to-close is swipe-LEFT.

### 1.4 Search Overlay

- Full-screen overlay with `backdrop-blur-2xl`.
- Large search input (`text-2xl md:text-4xl`). Auto-focus. Typing placeholder animation.
- Real-time grouped results. `200ms` debounce. Highlighted search terms.

### 1.5 Language Switcher

- Dropdown with flag icons and language names. `rounded-xl shadow-lg`.
- Page content crossfades on language switch (`150ms` out, `150ms` in).

---

## 2. PAGE TRANSITIONS

### 2.1 Default

Framer Motion `AnimatePresence` with `mode="wait"`:
```
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
exit: { opacity: 0, y: -10 }
```
Exit: `200ms`. Enter: `350ms`. Ease: `[0.16, 1, 0.3, 1]`.

### 2.2 Route-Specific

- **Listing → Detail:** Directional slide (listing exits LEFT, detail enters from RIGHT). Reverse for back.
- **Blog → Article:** Article slides up from below like a card being lifted.
- **Any → Contact:** Special modal-sheet-like entrance.

### 2.3 Shared Element Transitions

Use Framer Motion `layoutId` for product cards → product hero, blog thumbnails → article hero.

### 2.4 Loading States

Thin progress bar at viewport top (NProgress-style). NEVER show blank pages or full-page spinners.

---

## 3. ABOUT PAGE

- **Hero:** Full-viewport, split layout. Overlapping images with parallax depth.
- **Key Metrics Bar:** Brand gradient strip with animated counters.
- **Mission/Vision/Values:** 3 cards with hover glow.
- **Company Timeline:** Interactive vertical timeline with scroll-driven line drawing.
- **Team Section:** Photo grid with grayscale→color on hover. Optional detail modal.
- **Global Presence Map:** Stylized dot-grid map with pulsing office markers.

---

## 4. SERVICES PAGES

- **Hub:** Hero + filterable card grid with cursor-following radial gradient on hover (Stripe-style).
- **Detail:** Sticky sidebar TOC. Rich content with callout boxes. Horizontal stepped process. Technology logo grid. Related case studies. Floating mobile CTA bar.

---

## 5. PRODUCTS PAGES

- **Hub:** Product constellation animation. Alternating full-width and half-width showcase cards.
- **Detail:** Mini-marketing site per product. Bento grid features. Integration showcase. Code sample blocks. Testimonial callout. Pricing tiers (for TrustMeHub).

---

## 6. BLOG / INSIGHTS

- **Listing:** Category filter bar with `layout` animation. Featured article + 3-column grid. Image zoom + accent line on hover.
- **Article:** Parallax hero image. Reading progress bar. Sticky TOC sidebar. Prose typography. Author bio. Related articles. Sticky share bar.

---

## 7. CONTACT PAGE

- **Form:** Progressive disclosure (start with 4 fields, expand for more). Floating labels. Real-time validation with inline icons. Success: confetti + confirmation. Error: button shake.
- **Offices:** Tab-based with maps. Alternative contact methods as cards.

---

## 8. TRAINING PAGE

- Format cards (On-Site, Virtual, Self-Paced). Filterable course catalog. Certification badges. Training testimonial carousel.

---

## 9. CASE STUDIES & INDUSTRIES

- **Case Studies:** Large visual cards with result metrics. 6-part narrative detail pages.
- **Industries:** Mosaic tile grid. Industry-specific product/service/case study pages.

---

## 10. FOOTER

- **Pre-Footer CTA Band:** Dark gradient, "Ready to transform your enterprise?" + 2 CTAs.
- **Main Footer:** 5-column grid. Social icons. Copyright bar with language switcher. "Back to Top" with bounce animation.
- **Mobile:** Accordion columns. Brand column always expanded.

---

# PART 3: ANIMATION SYSTEM, DESIGN SYSTEM & PREMIUM POLISH

---

## 1. GLOBAL ANIMATION PHILOSOPHY

Every animation passes three gates: **PURPOSE** (communicates something), **PERFORMANCE** (60fps on mid-range devices), **ACCESSIBILITY** (respects `prefers-reduced-motion`).

### Core Timing Constants

```css
:root {
  --duration-instant: 100ms;
  --duration-micro: 200ms;
  --duration-fast: 300ms;
  --duration-normal: 500ms;
  --duration-slow: 700ms;
  --duration-dramatic: 1000ms;
  --duration-cinematic: 1400ms;

  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-in-out-quint: cubic-bezier(0.86, 0, 0.07, 1);
  --ease-spring: cubic-bezier(0.22, 1.36, 0.42, 0.99);

  --stagger-tight: 0.03s;
  --stagger-normal: 0.06s;
  --stagger-relaxed: 0.1s;
  --stagger-dramatic: 0.15s;
}
```

### Framer Motion Presets (export from `lib/motion-config.ts`)

```ts
export const transitions = {
  spring: { type: "spring", stiffness: 300, damping: 30, mass: 0.8 },
  springBouncy: { type: "spring", stiffness: 400, damping: 25, mass: 0.6 },
  springGentle: { type: "spring", stiffness: 180, damping: 22, mass: 1 },
  smooth: { type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.7 },
  fast: { type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.3 },
  dramatic: { type: "tween", ease: [0.86, 0, 0.07, 1], duration: 1.0 },
};
```

### Golden Rules

- ONLY animate `transform` and `opacity`. NEVER `width`, `height`, `top`, `left`, `margin`, `padding`.
- NEVER `transition: all`. Specify exact properties.
- Apply `will-change` dynamically (add on start, remove on end).
- All scroll animations via `IntersectionObserver` or GSAP ScrollTrigger.
- All durations >300ms must be interruptible.

---

## 2. SCROLL-DRIVEN STORYTELLING (GSAP ScrollTrigger)

### Scene Types

**Type A — Standard Reveal:** `y: 60→0, opacity: 0→1, scale: 0.97→1`, stagger children by `0.06s`.

**Type B — Parallax Depth:** Background/mid/foreground layers at different scroll speeds. Content reveals on top.

**Type C — Horizontal Scroll:** Pin section, scroll cards horizontally. Snap points.

**Type D — Counter/Stats:** Numbers count up on viewport entry. `snap: { innerText: 1 }`.

**Type E — Pinned Cinematic:** Pin section for 3x viewport height. Clip-path reveals, image scales, orbs appear.

**Type F — Progress Indicator:** Thin bar at page top, `scaleX` tied to document scroll.

**Scroll Velocity Effects:** Read velocity, skew decorative elements in scroll direction.

---

## 3. PAGE TRANSITION SYSTEM

### Transition Variants

```tsx
const pageVariants = {
  initial: { opacity: 0, y: 20, filter: "blur(8px)" },
  enter: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.35 } },
};
```

### Overlay Wipe (for major page changes)

Clip-path circle expansion from click point. `duration: 0.8s`. Brand gradient background.

### Shared Layout Animations

`layoutId` on cards/images that persist between list and detail pages.

---

## 4. MICRO-INTERACTION CATALOG

**Buttons:** Scale spring on hover (`1.03`), press (`0.97`). Ripple effect on click. Glow shadow.

**Cards:** 3D tilt on hover (max 8deg, `perspective: 800px`). Lift `translateY(-8px)`. Elastic spring-back on leave.

**Links:** Underline draws left-to-right on hover, retracts right-to-left on leave.

**Inputs:** Focus ring with blue glow. Label floats up on focus/fill.

**Toggles:** Spring-physics knob movement (`stiffness: 500, damping: 30`).

**Accordion:** Height auto-animation. Chevron rotates 180deg.

**Tooltips:** Scale/fade in with `400ms` delay. Spring physics.

---

## 5. TYPOGRAPHY ANIMATION SYSTEM

**Character Split (heroes):** Each char slides up from behind overflow-hidden wrapper. `y: "110%"`, `rotateX: -45`. RTL: stagger from end.

**Word Reveal (sections):** `y: 40→0, opacity: 0→1, stagger: 0.08`.

**Line Fade (body):** `y: 20→0, opacity: 0→1, stagger: 0.06`.

**Counter:** `innerText` tween with snap. Locale-aware formatting.

**Typewriter:** Character-by-character at `40ms` interval.

**Gradient Shimmer:** `background-size: 300%` animated across highlighted words.

---

## 6. COLOR & GRADIENT ANIMATION

**Dynamic gradients:** CSS `@property` for animatable gradient angles and color stops.

**Scroll color morphing:** Accent color transitions per section via ScrollTrigger.

**Cursor-following card tint:** Radial gradient positioned at `--mouse-x`/`--mouse-y`.

---

## 7. CUSTOM CURSOR (Desktop Only)

- Outer ring: 40px, 1.5px border, follows with 80ms delay via `gsap.quickTo`.
- Inner dot: 6px, instant position.
- States: Default, Link hover (expand + blend mode), Image hover (show "View"), Clicking (shrink).
- Wrapped in `@media (pointer: fine)`. Disabled on touch.

---

## 8. LOADING STATES

**Splash Loader:** Brand gradient + logo pulse + progress bar. Exit: clip-path wipe.

**Skeleton Screens:** Shimmer gradient animation on placeholder shapes. Crossfade to real content.

**Inline Spinners:** 16px rotating circle for button loading states.

---

## 9. DARK MODE TRANSITIONS

Theme switch animation: capture toggle position, expand clip-path circle from that point to cover viewport (`700ms`). Swap `data-theme` at 50%. Use View Transitions API where available.

All color properties transition: `background-color 400ms, color 300ms, border-color 300ms`.

---

## 10. GLASSMORPHISM & DEPTH

**Elevation scale:** xs → sm → md → lg → xl → 2xl shadows.

**Blue glow shadows:** For primary elements (`rgba(30, 77, 183, 0.15-0.3)`).

**Glass classes:** `backdrop-blur-[8-24px] saturate-[150-200%]` with border and inner light reflection.

---

## 11. PARTICLE & BACKGROUND SYSTEM

4 compositing layers:
1. Base gradient (CSS)
2. Animated mesh gradient (slow drifting blobs, `20s` cycle)
3. Floating orbs (GSAP random paths, `blur(60px)`)
4. Canvas particle field (60 particles desktop, 15 mobile, 30fps throttled)

All `position: fixed`, `z-index: -1`, `pointer-events: none`. Disabled on `prefers-reduced-motion`.

---

## 12. SOUND DESIGN (Optional, Opt-In)

OFF by default. Web Audio API. Max 15% volume. Sounds: click (80ms), hover (50ms), switch (120ms), success (300ms), error (250ms). Only initialize `AudioContext` after user gesture.

---

## 13. PERFORMANCE OPTIMIZATION

- `will-change` applied dynamically only.
- GPU-accelerated properties only (transform, opacity).
- Frame budget: <4ms per animation frame.
- `ScrollTrigger.batch()` for repeated elements.
- `viewport: { once: true }` for Framer Motion `whileInView`.
- Lazy-load images, trigger entrance after `onLoad`.
- Import GSAP modules individually. Tree-shake Framer Motion. Dynamic import Lottie.

---

## 14. RESPONSIVE ANIMATION SCALING

| Feature | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Parallax | 100px | 50px | 0 (disabled) |
| Card tilt | 8deg | 4deg | disabled |
| Horizontal scroll | pinned | pinned | vertical stack |
| Particles | 60 | 30 | 15 |
| Custom cursor | yes | no | no |
| Stagger | 0.06s | 0.05s | 0.04s |
| Text split | character | character | word |
| Backdrop blur | 16px | 12px | 8px |

Replace `hover:` with `active:` on touch devices.

---

## 15. LOTTIE INTEGRATION

- Hero illustration: looping, `speed: 0.7x`, `<80KB`.
- Service icons: play once on scroll reveal.
- Empty states: gentle looping illustration.
- Success/error: single-play checkmark/shake.
- Pause when not in viewport. SVG renderer.

---

## 16. 3D EFFECTS

**Tilt Card:** Mouse-follow `rotateX/Y` (max 8deg). Glare effect follows cursor. Elastic spring-back.

**Card Flip:** CSS `perspective: 1000px`, `backface-visibility: hidden`. `600ms` flip.

**Layered Parallax:** 3-4 layers with increasing `translateZ`. Mouse position reacts.

**3D Text:** Layered `text-shadow` for faux extrusion.

**Rules:** `preserve-3d` max 3 nesting levels. `backface-visibility: hidden` on rotating elements. 2D fallbacks on mobile.

---

# PART 4: CONTENT STRATEGY, COPYWRITING & PREMIUM EXPERIENCE

---

## 1. HERO HEADLINE REWRITES

**SLIDE 1 — Cybersecurity:**
- "Your Digital Fortress Starts Here."
- Sub: "Enterprise-grade cybersecurity trusted by governments and financial institutions across 50+ countries."

**SLIDE 2 — AI & Data:**
- "Turn Your Data Into Your Sharpest Competitive Edge."
- Sub: "Custom AI and analytics solutions powering 500+ mission-critical projects across Africa and the Middle East."

**SLIDE 3 — Digital Transformation:**
- "Legacy Systems End Here. The Future Begins Now."
- Sub: "End-to-end digital transformation from Abuja to Doha — and every market in between."

**SLIDE 4 — Company Authority:**
- "500+ Projects. 50+ Countries. One Standard: Excellence."
- Sub: "Where enterprise ambition meets flawless execution."

**Rules:** Max 8 words. Sentence case. No exclamation marks. Must fail the "competitor swap test."

---

## 2. VALUE PROPOSITION

**Tagline:** "Enterprise Technology. Uncompromising Standards."

**Core Value Prop:** "Global Digitalbit delivers cybersecurity, AI, and digital transformation solutions to governments, financial institutions, and enterprises across Africa and the Middle East. Unlike generalist consultancies, we build AND implement — delivering measurable outcomes across 500+ projects with a 99% client satisfaction rate."

**4 Value Pillars:**
1. "Built, Not Just Advised"
2. "Security-First, Always"
3. "Regionally Rooted, Globally Benchmarked"
4. "Outcomes Over Outputs"

---

## 3. SERVICES COPY (Pain → Solution → Outcome)

Every service uses this structure:
1. Opening hook (provocative stat/statement)
2. Pain amplification (what happens if they do nothing)
3. Solution framing (OUTCOMES not features)
4. Proof point (specific metric/client type)
5. CTA (specific next step)

Example — Cybersecurity:
> "Every 39 seconds, an organization faces a cyberattack. In Africa and the Middle East, that number is accelerating. A single breach costs $4.45M... Global Digitalbit deploys zero-trust architectures, 24/7 monitoring, and incident response that have protected 200+ enterprise environments with zero breaches post-deployment. **[Schedule a Security Assessment →]**"

---

## 4. PRODUCT DESCRIPTIONS (Pain → Solution → Outcome)

Template:
- One-line hook (visceral pain point)
- The Problem (2 sentences)
- The Solution (2-3 sentences, benefit-led)
- The Outcome (quantified results)
- Social Proof (who uses it)
- CTA (low-commitment action)

---

## 5. ABOUT PAGE STORYTELLING

Narrative arc: Origin Story → Growth Chapter → What We Believe → Team Bios → Stats.

Values as sharp declarations:
- "We Build What We Recommend."
- "Complexity Is Our Comfort Zone."
- "Africa and the Middle East Deserve World-Class."
- "Security Is Non-Negotiable."

Team bios: 2 sentences with specific expertise + notable achievement + why they're here.

---

## 6. TESTIMONIAL FRAMEWORK

Each testimonial is a micro-story: Situation → Challenge → Solution → Impact → Endorsement.

Always show: KEY METRIC in bold, industry, region. Minimum 6 across different industries.

---

## 7. CTA COPY RULES

- NEVER "Learn More" or "Contact Us" as primary CTAs.
- Primary: "Schedule a Free Security Assessment", "Request a Custom AI Readiness Report", "Get a Live Demo"
- Secondary: "Download Our Threat Report", "Read the Case Study"
- Submit buttons: "Send My Request", not "Submit"
- Below forms: "We respond within 2 business hours. No spam."

---

## 8. BLOG CONTENT STRATEGY

**Pillars:** Threat Intelligence, Data & AI Frontiers, Digital Africa / Digital GCC, Engineering Excellence, Leadership Perspectives.

**Title formulas:**
- "How [Client Type] [Achieved Outcome] with [Approach]"
- "[Number] Lessons from [Specific Context]"
- "Why [Accepted Practice] Is [Counterintuitive] in [Region]"

---

## 9. CASE STUDY FRAMEWORK

6 parts: The Client → The Challenge → Why Us → The Solution → The Results (hard numbers) → The Quote.

---

## 10. STATS PRESENTATION

Every stat has a context line. Animate on scroll. Group in rows of 3-4. Use contextually per page.

| 500+ | Projects Delivered | Across every major industry |
| 50+ | Countries Served | From Lagos to Doha and beyond |
| 99% | Client Satisfaction | Measured. Verified. Maintained. |
| 200+ | Environments Secured | Zero breaches post-deployment |

---

## 11. MICROCOPY

- Form labels: "Your Full Name", "Work Email Address", "Tell Us About Your Project"
- Errors: Never blame the user. "Please check your email format — we want to reach you."
- Empty states: "We couldn't find what you're looking for. Try a broader term."
- Success: "Thank you, [Name]. Expect a response within 2 business hours."

---

## 12. SEO

**Title format:** `[Keyword] | Global Digitalbit — Enterprise Technology Consultancy`

Structured data on all pages: Organization, Service, Product, Article, FAQ, BreadcrumbList schemas.

OG images: 1200x630px branded templates per page.

---

## 13. TRUST SIGNALS

- Header: "Serving 50+ Countries Since [Year]"
- Throughout: Client counts, certification badges, response time guarantees
- Footer: Full registered name, addresses, direct contacts, compliance badges
- Security: SSL badge, "enterprise-grade encryption" notice

---

## 14. TONE OF VOICE

1. **Authoritative, Not Arrogant** — Back claims with numbers.
2. **Precise, Not Jargony** — If a CEO can't understand it, rewrite.
3. **Confident, Not Salesy** — No fake urgency.
4. **Human, Not Corporate** — Like a senior partner speaking over coffee.
5. **Global, Yet Regional** — Reference specific regulations (NITDA, QCB, NIA).

**Banned Words:** synergy, leverage (verb), holistic, utilize, best-in-class, cutting-edge, disruptive, empower, revolutionize, paradigm shift, unprecedented.

**Rules:** Max 25 words per sentence. Active voice only. One idea per sentence.

---

## TRANSLATION NOTES

- **Arabic:** Native Gulf/MSA business prose. Adapt idioms. Reference GCC frameworks.
- **French:** Formal business French. "Vous" only. Reference UEMOA/BCEAO.
- **Spanish:** Neutral Latin American. Enterprise audience.
- **Portuguese:** Brazilian/Lusophone African. Reference CPLP initiatives.

---

*This prompt was generated by analyzing the complete codebase of Global Digitalbit's monorepo including 116+ components, 28 routes, 5 translation files, and the full tech stack configuration.*
