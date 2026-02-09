# Enterprise Website Upgrade — Progress Checklist

Use this checklist to track implementation progress. Check off each task as completed.

---

## PHASE 1: Foundation — Design System Overhaul
- [ ] **1.1** Install GSAP + ScrollTrigger + lottie-react
- [ ] **1.2** Create GSAP Provider (`providers/gsap-provider.tsx`)
- [ ] **1.3** Overhaul Typography System in `globals.css` (Major Third scale)
- [ ] **1.4** Enforce Color Restraint (Primary Blue + ONE accent only)
- [ ] **1.5** Standardize Interactive States (card-interactive, btn-press, link-animated)
- [ ] **1.6** Remove Shine Sweep Overuse (keep only on 3 elements)

---

## PHASE 2: Navigation Overhaul
- [ ] **2.1** Restructure to 5 nav items: Services | Products | Insights | About | Contact
- [ ] **2.2** Implement Mega Menu for Services & Products
- [ ] **2.3** Implement Full-Overlay Search (using cmdk)
- [ ] **2.4** Condense Header on Scroll (80px → 56px)
- [ ] **2.5** Redesign Mobile Navigation (full-screen accordion)

---

## PHASE 3: Hero Section Transformation
- [ ] **3.1** Redesign Homepage Hero (70vh, editorial headlines, scroll-driven fade)
- [ ] **3.2** Fix About Hero (reduce height, remove orbs, fix parallax)
- [ ] **3.3** Fix Contact Hero
- [ ] **3.4** Fix Service Heroes
- [ ] **3.5** Fix Product Hero
- [ ] **3.6** Fix Blog Hero

---

## PHASE 4: Animation & Motion System
- [ ] **4.1** Create GSAP ScrollTrigger Utilities (ScrollFadeIn, ScrollParallax, ScrollPin, etc.)
- [ ] **4.2** Implement Page Transitions (Framer Motion AnimatePresence)
- [ ] **4.3** Implement Scroll Progress Bar
- [ ] **4.4** Fix Counter Animations (smooth easing, no Math.floor jumps)
- [ ] **4.5** Add Custom Cursor (desktop only, contextual labels)
- [ ] **4.6** Fix Parallax Performance (replace scroll listeners with GSAP/CSS)

---

## PHASE 5: Component Refinement
- [ ] **5.1.1** Refine partners-section (1 row, grayscale logos)
- [ ] **5.1.2** Refine services-section (remove 3D, card-interactive)
- [ ] **5.1.3** Refine products-section (remove 3D, clean cards)
- [ ] **5.1.4** Refine testimonials-section (simple carousel)
- [ ] **5.1.5** Refine why-choose-us-section (remove orbs)
- [ ] **5.1.6** Refine who-we-are-section (remove floating shapes)
- [ ] **5.1.7** Refine faqs-section (light background, clean accordions)
- [ ] **5.1.8** Refine blog-section (card-interactive, no 3D)
- [ ] **5.1.9** Refine process-section (horizontal timeline)
- [ ] **5.2** Refine About Page Sections (mission, values, stats, team, global, story)
- [ ] **5.3** Refine Contact Page (floating labels, multi-step form)
- [ ] **5.4** Refine Services Pages (tower cards, heroes)
- [ ] **5.5** Refine Footer (4-column, trust bar, newsletter above)

---

## PHASE 6: New Pages & Content Sections
- [ ] **6.1** Create Case Studies Infrastructure (data, listing page, detail page)
- [ ] **6.2** Create Insights Hub (upgrade blog to thought leadership)
- [ ] **6.3** Create Industry Pages (5 industries with dedicated pages)
- [ ] **6.4** Add Certifications & Trust Section (ISO, SOC2, GDPR badges)
- [ ] **6.5** Create Careers Page Placeholder

---

## PHASE 7: Skeleton Loading & Performance
- [ ] **7.1** Create Skeleton Components (card, hero, grid, stats)
- [ ] **7.2** Add `sizes` Prop to ALL Images
- [ ] **7.3** Lazy Load Heavy Components (dynamic imports)
- [ ] **7.4** Remove Excessive DOM Elements (max 1 decorative per section)

---

## PHASE 8: Mobile Experience
- [ ] **8.1** Fix Touch Targets (minimum 44x44px)
- [ ] **8.2** Improve Mobile Spacing (px-5 sm:px-6)
- [ ] **8.3** Add Swipe Gestures to Carousels
- [ ] **8.4** Add Bottom-Anchored Mobile CTA

---

## PHASE 9: Enterprise Patterns
- [ ] **9.1** Implement Dark Mode (full token set, toggle, persistence)
- [ ] **9.2** Implement Breadcrumb Navigation (all inner pages)
- [ ] **9.3** Cookie Consent Banner (with settings modal)
- [ ] **9.4** Accessibility Statement Page
- [ ] **9.5** Back-to-Top Button (global, appears after fold)

---

## PHASE 10: SEO & Meta Improvements
- [ ] **10.1** Add/Verify Structured Data (Organization, Breadcrumb, Article, FAQ schemas)
- [ ] **10.2** Add Open Graph & Twitter Meta Tags (all pages)

---

## PHASE 11: Final Polish
- [ ] **11.1** Add Lottie Animation Component Infrastructure
- [ ] **11.2** Add Newsletter Section (above footer band)
- [ ] **11.3** Update Homepage Section Order
- [ ] **11.4** Add i18n Translation Keys (all 5 languages)
- [ ] **11.5** Final Quality Checks (build, lint, Lighthouse, accessibility)

---

## Final Verification

### Performance Targets
- [ ] Lighthouse Performance: 90+
- [ ] Lighthouse Accessibility: 95+
- [ ] Lighthouse Best Practices: 95+
- [ ] Lighthouse SEO: 95+
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] FID < 100ms

### Cross-Browser/Device Testing
- [ ] iPhone SE (375px)
- [ ] iPad (768px)
- [ ] iPad Landscape (1024px)
- [ ] Desktop (1440px)
- [ ] Large Desktop (1920px)
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge

### Accessibility Testing
- [ ] Keyboard navigation works on all pages
- [ ] Focus indicators visible on all interactive elements
- [ ] Screen reader testing (VoiceOver/NVDA)
- [ ] prefers-reduced-motion respected
- [ ] All images have alt text
- [ ] All links have descriptive text

### i18n Testing
- [ ] English (en) - complete
- [ ] Arabic (ar) - RTL layout works
- [ ] French (fr) - translations present
- [ ] Spanish (es) - translations present
- [ ] Portuguese (pt) - translations present

---

## Estimated Impact by Phase

| Phase | Impact on Score | Effort |
|-------|-----------------|--------|
| Phase 1: Foundation | +15% | High |
| Phase 2: Navigation | +10% | Medium |
| Phase 3: Hero | +8% | Medium |
| Phase 4: Animation | +12% | High |
| Phase 5: Components | +10% | High |
| Phase 6: Content | +15% | High |
| Phase 7: Performance | +5% | Medium |
| Phase 8: Mobile | +5% | Low |
| Phase 9: Enterprise | +8% | Medium |
| Phase 10: SEO | +2% | Low |
| Phase 11: Polish | +5% | Medium |

**Starting Point:** ~20%
**Target:** 90%+
**Total Improvement:** +70%

---

## Priority Order (If Time-Constrained)

If you cannot complete all phases, prioritize in this order:

1. **Phase 1** — Foundation (typography, color restraint, interaction states)
2. **Phase 4** — Animation System (GSAP ScrollTrigger transforms everything)
3. **Phase 6** — Content (case studies and insights are what enterprise sites are built on)
4. **Phase 2** — Navigation (mega menus and search are enterprise table stakes)
5. **Phase 3** — Hero (first impression matters)
6. **Phase 5** — Component Refinement (polish the details)
7. **Phase 9** — Enterprise Patterns (dark mode, breadcrumbs, compliance)
8. **Phase 7** — Performance (make it fast)
9. **Phase 8** — Mobile (63% of traffic)
10. **Phase 10 & 11** — Final polish
