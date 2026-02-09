# Enterprise Website Upgrade — Implementation Plan

## Overview

This plan transforms the Digibit website from "high-quality startup" to "enterprise consulting powerhouse" level, benchmarking against EY, PwC, IBM, McKinsey, Deloitte, and Accenture.

**Approach:** All 11 phases sequentially, GSAP alongside Framer Motion, sample content generated.

---

## Phase 1: Foundation — Design System Overhaul

### 1.1 Install Dependencies
```bash
npm install gsap @gsap/react lottie-react --workspace=apps/frontend
```

### 1.2 Create GSAP Provider
- Create `/providers/gsap-provider.tsx`
- Register ScrollTrigger, ScrollToPlugin
- Respect `prefers-reduced-motion`
- Add to root layout

### 1.3 Typography System Overhaul
**File:** `globals.css`

Add Major Third (1.25x) scale:
- `--font-display`: 48-88px (hero headlines)
- `--font-h1`: 40-64px (page titles)
- `--font-h2`: 30-48px (section titles)
- `--font-h3`: 24-32px (card titles)
- `--font-h4`: 20-24px (component headings)
- `--font-lead`: 18-22px (intro paragraphs)
- `--font-body`: 16-18px (default)
- `--font-caption`: 12-14px (labels)
- `--font-overline`: 11-13px (section labels)

Add base rules for h1-h6 with `text-wrap: balance`

**Components to update (replace font-black/extrabold with semibold):**
- `about-hero.tsx` - h1 uses font-black
- `about-cta-section.tsx` - h2 uses font-bold
- `core-values-section.tsx` - h2, h3 use font-bold
- `global-presence-section.tsx` - h2, h3 use font-bold
- `mission-vision-section.tsx` - h2, h3 use font-bold
- `our-story-section.tsx` - h2 uses font-bold
- `stats-section.tsx` - h2 uses font-bold
- `team-section.tsx` - h2, h3 use font-bold
- All home section components
- All service/product components

### 1.4 Color Restraint
**Rule:** Primary Blue (#1E4DB7) + ONE accent (Orange #F59A23) only

**Actions:**
- Add color budget variables to globals.css
- Remove `from-accent-orange to-accent-red` gradients from headings
- Replace decorative gradients with solid colors
- Remove `animate-pulse` from orbs/blobs
- Reduce floating orbs to MAX 1 per section
- Reduce background overlay opacity from 90-95% to 65-75%

**Components with gradient headings to fix:**
- `about-hero.tsx` - gradient text on headline
- `our-story-section.tsx` - gradient text animated
- Multiple home sections

### 1.5 Standardize Interactive States
**Add to globals.css:**
- `.card-interactive` - consistent hover (translateY -4px, shadow)
- `.btn-press` - active scale 0.98
- `.link-animated` - underline animation left-to-right
- Enhanced `:focus-visible` states
- `.skeleton-shimmer` standardization

**Apply across all card components**

### 1.6 Remove Shine Sweep Overuse
**Keep shine ONLY on:**
1. Homepage hero primary CTA
2. Footer "Contact Us" CTA
3. ONE featured card per page

**Remove from (found in 7+ components):**
- `core-values-section.tsx`
- `global-presence-section.tsx`
- `mission-vision-section.tsx`
- `stats-section.tsx`
- `team-section.tsx`
- `about-cta-section.tsx`
- Multiple product/service cards

---

## Phase 2: Navigation Overhaul

### 2.1 Restructure Navigation
**Reduce from 6 to 5 items:**
```
Services | Products | Insights | About | Contact
```
- Remove: blogs (rename to Insights), webSummit (temporary)
- Keep: services, products, about, contact
- Add: insights (upgraded blogs)

### 2.2 Mega Menu Implementation
**Create:** `/components/navigation/mega-menu.tsx`

**Services Mega Menu:**
- 3 columns: Consulting, Technology, Managed Services
- Featured sidebar with latest case study
- "View All Services" link

**Products Mega Menu:**
- Product cards with icons
- TrustMeHub, BoaCRM, DigiTrack, DigiTrust, DigiGate
- Featured sidebar with product highlight

**Technical specs:**
- Full viewport width, max-height 600px
- Animate: opacity + translateY(-8px) over 200ms
- Close on mouse leave (150ms delay)
- Focus trap for accessibility
- RTL support for Arabic

### 2.3 Search Overlay
**Create:** `/components/navigation/search-overlay.tsx`
- Trigger: Search icon + Cmd+K/Ctrl+K
- Uses existing `cmdk` package (currently unused)
- Full-screen overlay with backdrop blur
- Search across: Services, Products, Pages, Blog Posts
- Recent searches in localStorage
- Keyboard navigation

### 2.4 Condense Header on Scroll
**Edit:** `navbar.tsx`
- Default: 80px height
- Scrolled (50px+): 56px height, logo scale 0.85
- Background: transparent → white/90 + backdrop-blur-xl
- Add subtle border on scroll

### 2.5 Mobile Navigation Redesign
**Edit:** `navbar.tsx` mobile section
- Full-screen overlay (not side drawer)
- Slide up from bottom (300ms)
- Large touch targets: text-2xl, py-4 (48px+)
- Accordion for Services/Products
- Focus trap when open

---

## Phase 3: Hero Section Transformation

### 3.1 Homepage Hero Redesign
**Rewrite:** `hero-premium.tsx`

**Layout:**
- Height: 70vh desktop, 60vh mobile (not 90vh)
- Split: 60% text left, 40% visual right
- Background: dark gradient, NO floating orbs
- ONE subtle ambient gradient (10% opacity)

**Content - Left:**
- Overline: "DIGITAL TRANSFORMATION"
- Headline rotator (4 headlines, 5s cycle):
  - "Powering Africa's Digital Future"
  - "Trust Through Technology"
  - "Enterprise Solutions That Scale"
  - "Securing Tomorrow's Infrastructure"
- Subtitle: Lead size, neutral-300, max 45ch
- Two CTAs: Primary + Secondary ghost
- Trust bar: partner logos grayscale, 32px

**Content - Right:**
- Abstract geometric animation (GSAP)
- OR product mockup with float animation

**Animation:**
- Line-by-line clip-path reveal (150ms stagger)
- Scroll fade: opacity + scale tied to scroll
- Respect reduced motion

### 3.2 Fix Other Heroes
**Apply to:**
- `about-hero.tsx`
- `contact-hero.tsx`
- `service-hero.tsx`, `service-hero-global.tsx`
- `product-hero.tsx`
- `blog-hero.tsx`

**Changes:**
- Reduce height: 65-70vh
- Remove ALL floating orbs (keep 1 static gradient)
- Fix parallax: GSAP ScrollTrigger (not window.addEventListener)
- Fix stagger: 120-150ms (not 80ms)
- Reduce overlay opacity: 65-75%
- Add `text-wrap: balance`

---

## Phase 4: Animation & Motion System

### 4.1 GSAP ScrollTrigger Utilities
**Create:** `/components/ui/animations/gsap-scroll.tsx`

Components:
- `ScrollFadeIn` - fade + slide on enter
- `ScrollParallax` - performant parallax
- `ScrollPin` - pin section while content scrolls
- `ScrollProgress` - 0-1 progress callback
- `ScrollRevealText` - line-by-line with clip-path

### 4.2 Page Transitions
**Create:** `/components/ui/animations/page-transition-wrapper.tsx`
- Framer Motion AnimatePresence
- Fade out 200ms → Fade in 300ms
- translateY(8px) on enter
- Only main content transitions (not nav/footer)

### 4.3 Scroll Progress Bar
**Create:** `/components/ui/scroll-progress-bar.tsx`
- 3px bar at top, fixed, z-50
- CSS scroll-timeline (with rAF fallback)
- Show on: blog posts, case studies, about page

### 4.4 Fix Counter Animations
**Edit:** `stats-section.tsx` (both about and shared)
- Replace Math.floor with Math.round
- GSAP or rAF-based counting
- 2s duration with easeOutExpo
- Intersection Observer trigger
- Locale-formatted numbers (1,200+ not 1200+)

### 4.5 Custom Cursor (Desktop)
**Create:** `/components/ui/custom-cursor.tsx`
- Only on `pointer: fine` devices
- Default: 8px dot, primary color
- Hover interactive: 40px ring with label
- Labels: "View", "Open", "Drag"
- GSAP quickTo for 60fps
- Add data-cursor attributes across site

### 4.6 Fix Parallax Performance
**Replace all `window.addEventListener("scroll")` with:**
- GSAP ScrollTrigger (preferred)
- OR CSS scroll-timeline
- OR rAF throttling

**Files to fix:**
- `about-hero.tsx` - uses useScroll
- `hero-premium.tsx`
- `our-story-section.tsx` - uses useScroll
- `testimonials-section.tsx`

---

## Phase 5: Component Refinement

### 5.1 Home Page Sections

**partners-section.tsx:**
- 1 row marquee (not 2)
- Grayscale → color on hover
- Background: neutral-50 (remove dark + orbs)
- Add `.overline` label

**services-section.tsx:**
- Remove 3D tilt
- Use `card-interactive` hover
- Remove animated gradient borders
- 3-column grid (not 4)

**products-section.tsx:**
- Remove ALL 3D transforms
- Clean card grid with `card-interactive`
- Remove "Most Popular" badge animation

**testimonials-section.tsx:**
- Remove 3D carousel
- Simple Embla carousel, one at a time
- Quote in Lead size
- 6s auto-play, pause on hover

**why-choose-us-section.tsx:**
- Remove animated orbs
- Clean dark OR white section
- 2x2 feature grid
- Remove gradient border animations

**who-we-are-section.tsx:**
- Keep split layout
- Remove floating shapes
- Remove parallax on image
- Add specific metrics

**faqs-section.tsx:**
- Background: neutral-50 (remove dark + orbs)
- Simplify accordion (remove gradient borders)
- Clean typography

**blog-section.tsx:**
- Remove 3D transforms
- Use `card-interactive`
- Featured post: full-width split layout

**process-section.tsx:**
- Horizontal stepped timeline
- Connecting lines between steps
- Remove ping animation

### 5.2 About Page Sections

**about-hero.tsx:** Apply Phase 3.2 rules

**mission-vision-section.tsx:**
- Single `card-interactive` hover
- Remove gradient text
- Two cards side by side

**core-values-section.tsx:**
- Remove shine sweep
- Use `card-interactive`
- 4-column grid

**stats-section.tsx:**
- Apply counter fixes (Phase 4.4)
- Single row, 4 stats
- Background: bg-primary with white text

**team-section.tsx:**
- Remove shine sweep
- Hover: scale 1.03 + shadow

**global-presence-section.tsx:**
- Clean map or location list
- Each: City → Country → Address

**our-story-section.tsx:**
- Timeline with alternating entries
- Vertical connecting line
- GSAP scroll-reveal per entry

### 5.3 Contact Page
**contact-form.tsx:**
- Floating labels
- Multi-step form (3 steps)
- Clean success state
- Skeleton loading

### 5.4 Services Pages
**service-tower-card.tsx:**
- Remove gradient border on hover
- Use `card-interactive`
- Remove shine sweep

### 5.5 Footer
**footer.tsx:**
- 4-column layout
- Add certifications bar above
- Bottom bar: Copyright + legal links
- Remove animated gradients
- Newsletter band above footer

---

## Phase 6: New Pages & Content

### 6.1 Case Studies
**Create:**
- `/data/case-studies.ts` - 6 case studies
- `/app/[locale]/case-studies/page.tsx` - listing
- `/app/[locale]/case-studies/[slug]/page.tsx` - detail
- `/components/case-studies/` - card, hero, results, filter

**Sample case studies:**
1. AfriBank Digital (Financial Services)
2. HealthFirst Network (Healthcare)
3. Ministry of Digital Economy (Government)
4. TechVentures Africa (Technology)
5. PetroGreen Solutions (Energy)
6. EduConnect Platform (Education)

### 6.2 Insights Hub
**Upgrade blogs to Insights:**
- Rename navigation, footer, page
- Hero: "Insights & Thought Leadership"
- Filter: Articles | Case Studies | Whitepapers
- Industry/Topic dropdowns
- Sidebar: Most Read, Newsletter, Topics

### 6.3 Industry Pages
**Create:**
- `/data/industries.ts` - 5 industries
- `/app/[locale]/industries/page.tsx`
- `/app/[locale]/industries/[slug]/page.tsx`

**Industries:**
1. Financial Services
2. Healthcare
3. Government
4. Technology
5. Energy & Utilities

### 6.4 Certifications Bar
**Create:** `/components/shared/certifications-bar.tsx`
- ISO 27001, SOC 2 Type II, GDPR
- Microsoft Partner, Google Cloud Partner
- Use on: Homepage, Contact, Footer

### 6.5 Careers Page
**Create:** `/app/[locale]/careers/page.tsx`
- Hero: "Join Our Team"
- Why Digibit section
- Open Positions list (placeholder)

---

## Phase 7: Performance

### 7.1 Skeleton Components
**Create:** `/components/ui/skeletons/`
- `card-skeleton.tsx`
- `hero-skeleton.tsx`
- `grid-skeleton.tsx`
- `stats-skeleton.tsx`

### 7.2 Image Optimization
Add `sizes` prop to ALL `<Image>` components:
- Full-width: `sizes="100vw"`
- Half-width: `sizes="(max-width: 768px) 100vw, 50vw"`
- Third-width: `sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"`

### 7.3 Lazy Loading
Use `next/dynamic` for below-fold sections:
- TestimonialsSection
- FAQsSection
- BlogSection
- ProcessSection

### 7.4 DOM Cleanup
- Max 1 decorative element per section
- Remove `animate-pulse` from decorations
- Reduce marquee duplicates

---

## Phase 8: Mobile Experience

### 8.1 Touch Targets
- All interactive: min 44x44px
- Icon buttons: `min-w-[44px] min-h-[44px]`
- Nav links: `py-3` minimum

### 8.2 Mobile Spacing
- Container padding: `px-5 sm:px-6`
- Hero mobile: `min-h-[60vh]`
- Section padding: `py-16`

### 8.3 Swipe Gestures
- Enable touch drag on all Embla carousels
- Hide arrow buttons on mobile
- Add "Swipe" hint

### 8.4 Mobile CTA Bar
**Create:** `/components/ui/mobile-cta-bar.tsx`
- Fixed bottom, md:hidden
- "Contact Us" button, 56px height
- Appears after hero scroll
- Not on contact page

---

## Phase 9: Enterprise Patterns

### 9.1 Dark Mode
- Complete dark tokens in globals.css
- Create `/components/ui/theme-toggle.tsx`
- localStorage + system preference
- Add toggle to navbar

### 9.2 Breadcrumbs
**Create:** `/components/ui/breadcrumb.tsx`
- All pages except homepage
- Semantic with aria-current
- Uses breadcrumb-schema.tsx

### 9.3 Cookie Consent
**Create:** `/components/ui/cookie-consent.tsx`
- Bottom banner, first visit
- Accept All + Cookie Settings
- Settings modal with toggles
- localStorage persistence

### 9.4 Accessibility Page
**Create:** `/app/[locale]/accessibility/page.tsx`
- WCAG 2.1 AA commitment
- How to report issues

### 9.5 Back-to-Top
**Create:** `/components/ui/back-to-top.tsx`
- 44x44px, primary color
- Appears after first viewport
- Smooth scroll

---

## Phase 10: SEO & Meta

### 10.1 Structured Data
- Verify Organization schema
- Add Article schema for blogs
- Ensure all schemas used

### 10.2 Open Graph
- Update `lib/metadata.ts`
- Add og:image, twitter:card
- Create default OG image

---

## Phase 11: Final Polish

### 11.1 Lottie Component
**Create:** `/components/ui/lottie-icon.tsx`
- Wrapper for future Lottie icons
- playOnHover, playOnView props

### 11.2 Newsletter Band
**Create:** `/components/shared/newsletter-band.tsx`
- Full-width above footer
- bg-primary, white text
- Email input + subscribe

### 11.3 Homepage Section Order
**Reorder to:**
1. Hero
2. Certifications Bar (new)
3. Services
4. Products
5. Case Studies Preview (new)
6. Stats
7. Who We Are
8. Testimonials
9. Insights Preview
10. Process
11. FAQs

**Remove:**
- partners-section (logos in hero)
- why-choose-us (absorbed)
- about-us (redundant)

### 11.4 i18n Keys
Add translation keys to all 5 locales:
- en.json, ar.json, fr.json, es.json, pt.json
- Placeholder translations for non-English

### 11.5 Quality Checks
- `npm run build` - fix TypeScript errors
- `npm run lint` - fix linting errors
- Test breakpoints: 375px, 768px, 1024px, 1440px, 1920px
- Keyboard navigation test
- Reduced motion test
- Lighthouse: Performance 90+, Accessibility 95+

---

## Estimated File Changes

**New Files (~35):**
- providers/gsap-provider.tsx
- components/navigation/mega-menu.tsx
- components/navigation/search-overlay.tsx
- components/ui/animations/gsap-scroll.tsx
- components/ui/animations/page-transition-wrapper.tsx
- components/ui/scroll-progress-bar.tsx
- components/ui/custom-cursor.tsx
- components/ui/skeletons/*.tsx (4 files)
- components/ui/mobile-cta-bar.tsx
- components/ui/theme-toggle.tsx
- components/ui/breadcrumb.tsx
- components/ui/cookie-consent.tsx
- components/ui/back-to-top.tsx
- components/ui/lottie-icon.tsx
- components/shared/certifications-bar.tsx
- components/shared/newsletter-band.tsx
- components/case-studies/*.tsx (4 files)
- data/case-studies.ts
- data/industries.ts
- app/[locale]/case-studies/page.tsx
- app/[locale]/case-studies/[slug]/page.tsx
- app/[locale]/industries/page.tsx
- app/[locale]/industries/[slug]/page.tsx
- app/[locale]/careers/page.tsx
- app/[locale]/accessibility/page.tsx

**Modified Files (~50+):**
- globals.css (typography, colors, interactions)
- navbar.tsx (mega menu, search, mobile, scroll)
- footer.tsx (structure, newsletter removal)
- All about/*.tsx components
- All home/*.tsx components
- All service/*.tsx components
- Multiple product/*.tsx components
- app/[locale]/layout.tsx (providers, transitions)
- app/[locale]/page.tsx (section order)
- messages/*.json (all 5 locales)
- lib/metadata.ts

---

## Critical Rules

1. Read every file before modifying
2. Never change tech stack
3. Always support i18n (useTranslations/getTranslations)
4. Always support RTL for Arabic
5. Always use TypeScript (no `any`)
6. Follow existing patterns
7. Keep animations subtle and purposeful
8. Color: Primary Blue + Orange only
9. Every interactive element needs all states
10. Clean up event listeners on unmount
