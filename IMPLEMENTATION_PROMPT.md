# AI Agent Implementation Prompt: High-Impact Website Improvements

## Project Overview

**Monorepo:** Turborepo with npm workspaces
**Frontend:** `apps/frontend/` — Next.js 16.1.4, React 19.2, TypeScript 5, Tailwind CSS 4
**Backend:** `apps/backend/` — NestJS
**UI Library:** `packages/ui/` — Shared components (`@ktblog/ui`)
**i18n:** next-intl 4.7.0 — 5 locales: en (default), ar (RTL), fr, es, pt. Locale prefix: "as-needed"
**State/Data:** TanStack React Query 5, Zod 4, react-hook-form 7
**Animations:** GSAP 3.14 + Framer Motion 12
**Domain:** https://drkatangablog.com
**Company:** KTBlog — IT consultancy (offices in Abuja, Nigeria + Doha, Qatar)

---

## TASK 1: JSON-LD Structured Data (SEO)

### Goal
Add comprehensive JSON-LD schema markup to all pages for rich search results. Google uses structured data for rich snippets, knowledge panels, FAQ dropdowns, breadcrumbs, and product carousels.

### Current State
- Metadata/OG tags are solid (see `apps/frontend/lib/metadata.ts`)
- Sitemap exists at `apps/frontend/app/sitemap.ts`
- robots.txt exists at `apps/frontend/public/robots.txt`
- **Zero JSON-LD schema markup exists anywhere**

### Implementation Requirements

#### 1.1 Create a Schema Utility Library
Create `apps/frontend/lib/schema.ts` with helper functions that return typed JSON-LD objects.

**Organization Schema** (used site-wide in layout):
```
- @type: Organization
- name: "KTBlog"
- url: "https://drkatangablog.com"
- logo: "https://drkatangablog.com/logo/ktblog.png"
- description: (from metadata.ts SITE_NAME description)
- contactPoint: [
    { @type: ContactPoint, telephone: "+234-816-177-8448", contactType: "customer service", areaServed: "NG" },
    { @type: ContactPoint, telephone: "+974-4452-8244", contactType: "customer service", areaServed: "QA" }
  ]
- address: [
    { @type: PostalAddress, streetAddress: "15 D Yalinga Crescent, Wuse 2", addressLocality: "Abuja", addressCountry: "NG" },
    { @type: PostalAddress, addressLocality: "Doha", addressCountry: "QA" }
  ]
- sameAs: [] (will be populated when social links are fixed — Task 5)
```

**WebSite Schema** (used on homepage):
```
- @type: WebSite
- name: "KTBlog"
- url: "https://drkatangablog.com"
- potentialAction: { @type: SearchAction, target: "https://drkatangablog.com/search?q={search_term_string}" }
```

**BreadcrumbList Schema** (used on all inner pages):
```
Function signature: generateBreadcrumbSchema(items: { name: string; url: string }[])
- @type: BreadcrumbList
- itemListElement: items mapped to ListItem with position
```

**FAQPage Schema** (used on homepage FAQs section):
```
- @type: FAQPage
- mainEntity: array of { @type: Question, name: ..., acceptedAnswer: { @type: Answer, text: ... } }
- Source FAQ data from: apps/frontend/components/home/faqs-section.tsx (faqItems array, lines 27-61)
- The FAQ questions/answers are i18n keys — the schema must use the resolved English strings
- Read the actual FAQ content from apps/frontend/messages/en.json under the "faqs" key
```

**Article Schema** (used on blog post pages `/blogs/[slug]`):
```
Function signature: generateArticleSchema(post: BlogPostWithRelations)
- @type: Article
- headline: post.title
- description: post.excerpt
- image: post.featuredImage
- datePublished: post.publishedAt
- dateModified: post.updatedAt
- author: { @type: Person, name: post.author.name, jobTitle: post.author.role }
- publisher: { @type: Organization, name: "KTBlog", logo: ... }
- mainEntityOfPage: canonical URL
```

**Product Schema** (used on individual product pages `/products/[id]`):
```
Function signature: generateProductSchema(product: Product)
- @type: Product
- name: product.name
- description: product.description
- brand: { @type: Organization, name: "KTBlog" }
- image: product.image
- offers: { @type: Offer, availability: "https://schema.org/OnlineOnly", price: "0", priceCurrency: "USD" } (or use AggregateOffer if no price)
```

**LocalBusiness Schema** (used on contact page):
```
- @type: LocalBusiness (2 entries, one per office)
- Nigeria office: name, address, telephone, openingHours
- Qatar office: name, address, telephone, openingHours
```

**Service Schema** (used on services page):
```
Function signature: generateServiceSchema(category: ServiceCategory)
- @type: Service
- name: category.name
- description: category.description
- provider: { @type: Organization, name: "KTBlog" }
- areaServed: ["NG", "QA", "GH", "AE"]
```

#### 1.2 Inject Schemas Into Pages

Use Next.js `<script type="application/ld+json">` approach. Add a reusable component:

```tsx
// apps/frontend/components/shared/json-ld.tsx
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

**Injection points:**

| Page | File | Schemas to inject |
|------|------|-------------------|
| Layout (all pages) | `app/[locale]/layout.tsx` | Organization |
| Homepage | `app/[locale]/page.tsx` | WebSite, FAQPage |
| About | `app/[locale]/about/page.tsx` | BreadcrumbList |
| Contact | `app/[locale]/contact/page.tsx` | LocalBusiness (x2), BreadcrumbList |
| Products listing | `app/[locale]/products/page.tsx` | BreadcrumbList |
| Individual product | `app/[locale]/products/[id]/page.tsx` (and similar) | Product, BreadcrumbList |
| Services listing | `app/[locale]/services/page.tsx` | BreadcrumbList |
| Blog listing | `app/[locale]/blogs/page.tsx` | BreadcrumbList |
| Blog post | `app/[locale]/blogs/[slug]/page.tsx` | Article, BreadcrumbList |

### Testing (Task 1)
1. Run `npm run build` in `apps/frontend/` — must succeed with zero errors
2. Run the dev server and visit each page type listed above
3. View page source and verify `<script type="application/ld+json">` exists with valid JSON
4. Validate the JSON-LD output against https://validator.schema.org/ expectations:
   - Each schema must have `@context: "https://schema.org"`
   - No missing required fields
   - URLs must be absolute (start with https://drkatangablog.com)
5. Check that no TypeScript errors are introduced

---

## TASK 2: Analytics & Tracking

### Goal
Add Google Analytics 4 (GA4) with Web Vitals reporting and custom event tracking infrastructure.

### Current State
- Zero analytics or tracking of any kind
- No third-party scripts loaded
- No Web Vitals reporting
- API client exists at `apps/frontend/lib/api-client.ts`

### Implementation Requirements

#### 2.1 Google Analytics 4 Setup

Create `apps/frontend/components/analytics/google-analytics.tsx`:
```tsx
// Client component that loads GA4 script
// Use next/script with strategy="afterInteractive"
// Read GA_MEASUREMENT_ID from process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
// If no measurement ID, render nothing (graceful degradation)
// Include gtag('config', GA_ID) initialization
// Send page_view on route changes using usePathname() from next-intl
```

Create `apps/frontend/lib/analytics.ts`:
```tsx
// Type-safe event tracking utility
// export function trackEvent(eventName: string, parameters?: Record<string, string | number | boolean>)
// Calls window.gtag('event', eventName, parameters) if available
// Silently no-op if gtag not loaded (no errors)

// Pre-defined event helpers:
// trackContactFormSubmit(subject: string)
// trackNewsletterSignup()
// trackProductView(productName: string)
// trackServiceView(serviceName: string)
// trackBlogPostView(slug: string, category: string)
// trackCTAClick(location: string, destination: string)
// trackSearchQuery(query: string)
// trackLanguageSwitch(fromLocale: string, toLocale: string)
// trackDemoRequest(product: string)
```

#### 2.2 Web Vitals Reporting

Create `apps/frontend/components/analytics/web-vitals.tsx`:
```tsx
// Client component using useReportWebVitals from 'next/web-vitals' (Next.js built-in)
// Report CLS, FID, FCP, LCP, TTFB, INP to GA4 via gtag events
// Event name: 'web_vitals'
// Parameters: { metric_name, metric_value, metric_id, metric_delta }
```

#### 2.3 Integration Points

**Layout** (`app/[locale]/layout.tsx`):
- Add `<GoogleAnalytics />` component inside `<head>` or after `<body>` opening
- Add `<WebVitals />` component inside the body

**Contact Form** (`components/contact/contact-form.tsx`):
- Call `trackContactFormSubmit(formData.subject)` on successful submission

**Newsletter** (`components/footer.tsx`):
- Call `trackNewsletterSignup()` on successful subscribe

**Blog Post** (`app/[locale]/blogs/[slug]/page.tsx`):
- Call `trackBlogPostView(post.slug, post.category.name)` on page load

**Language Switcher** (`components/language-switcher.tsx`):
- Call `trackLanguageSwitch(currentLocale, newLocale)` on language change

**Search Overlay** (`components/navigation/search-overlay.tsx`):
- Call `trackSearchQuery(query)` when user performs a search

**CTA Buttons** (various):
- Track clicks on major CTAs throughout the site

#### 2.4 Environment Variable

Add to `.env.example`:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Testing (Task 2)
1. Build must succeed
2. With no `NEXT_PUBLIC_GA_MEASUREMENT_ID` set: verify no GA scripts are loaded (graceful degradation)
3. With a dummy GA ID set: verify `<script>` tags appear in page source with correct ID
4. Verify `trackEvent` calls don't throw errors when GA is not loaded
5. Verify no console errors on any page
6. Check that the analytics components are client-side only ("use client") and don't break SSR/SSG

---

## TASK 3: Performance — Static Generation

### Goal
Remove `force-dynamic` from the layout and enable static generation / ISR for pages that don't need dynamic rendering.

### Current State
- `apps/frontend/app/[locale]/layout.tsx` line 48: `export const dynamic = 'force-dynamic';`
- This forces ALL pages to be server-rendered on every request
- `generateStaticParams()` exists on layout (line 43) and blog detail pages (line 35-38) but is nullified by force-dynamic
- Blog posts, product pages, about, services, etc. are all static content from TypeScript data files

### Implementation Requirements

#### 3.1 Remove force-dynamic from Layout

In `apps/frontend/app/[locale]/layout.tsx`:
- **Delete** line 48: `export const dynamic = 'force-dynamic';`
- The `generateStaticParams()` on line 43 already generates params for all locales — this will now take effect

#### 3.2 Ensure Static Params on All Pages

Verify or add `generateStaticParams()` to these pages that need it:

| Page | File | Static Params |
|------|------|---------------|
| Home | `app/[locale]/page.tsx` | Locale only (from layout) |
| About | `app/[locale]/about/page.tsx` | Has it (line 15-17) ✓ |
| Contact | `app/[locale]/contact/page.tsx` | **Add it** — locales only |
| Products | `app/[locale]/products/page.tsx` | **Add it** — locales only |
| Services | `app/[locale]/services/page.tsx` | **Add it** — locales only |
| Blogs | `app/[locale]/blogs/page.tsx` | **Add it** — locales only |
| Blog detail | `app/[locale]/blogs/[slug]/page.tsx` | Has it (line 35-38) ✓ — but add locale cross-product |

For pages with dynamic segments (blog slugs, product IDs), generate the cross-product of locales × slugs:
```tsx
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    blogPosts.map((post) => ({ locale, slug: post.slug }))
  );
}
```

#### 3.3 Handle Dynamic Client Components

Some components use `useTranslations()` which is client-side. This is fine — Next.js will statically render the server part and hydrate client components. No changes needed to client components.

#### 3.4 Contact Form — Keep Dynamic Route Option

The contact page has a form that POSTs to an API. The page itself can still be statically generated — the form submission is client-side via React Query. No special handling needed.

### Testing (Task 3)
1. Run `npm run build` in `apps/frontend/`
2. **Critical check:** The build output should show pages as `○` (static) or `●` (SSG) rather than `λ` (server-rendered) for:
   - `/` (home)
   - `/about`
   - `/contact`
   - `/products`
   - `/services`
   - `/blogs`
   - `/blogs/[slug]` (each blog post)
3. Run `npm run start` and verify all pages load correctly
4. Verify no hydration mismatch warnings in browser console
5. Verify i18n still works (navigate between /en/about, /ar/about, /fr/about etc.)
6. Verify the blog detail pages render correctly with all content
7. If any build errors occur related to dynamic APIs (cookies, headers, searchParams), mark those specific pages with `export const dynamic = 'force-dynamic'` individually rather than on the layout

---

## TASK 4: Security Headers

### Goal
Add comprehensive security headers via Next.js middleware and next.config.ts. Also add honeypot fields to the contact form.

### Current State
- `apps/frontend/middleware.ts` only handles i18n locale routing (4 lines)
- `apps/frontend/next.config.ts` has no headers configuration
- Contact form at `apps/frontend/components/contact/contact-form.tsx` has no spam protection
- No CSP, X-Frame-Options, or other security headers

### Implementation Requirements

#### 4.1 Security Headers in next.config.ts

Add a `headers()` function to `apps/frontend/next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https://images.unsplash.com https://www.google-analytics.com",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://www.google-analytics.com https://analytics.google.com",
            "frame-ancestors 'none'",
          ].join("; "),
        },
      ],
    },
  ];
}
```

**Important:** The CSP must allow:
- `unsafe-inline` for styles (Tailwind/styled-jsx)
- `unsafe-eval` for GSAP animations
- Google Analytics domains (from Task 2)
- Unsplash images (used throughout)
- Google Fonts (used for Noto Sans Arabic)

#### 4.2 Honeypot Field on Contact Form

In `apps/frontend/components/contact/contact-form.tsx`:

Add a hidden honeypot field that bots will fill out but humans won't:
```tsx
// Add to FormData interface:
honeypot?: string;

// Add hidden field in the form JSX (visually hidden, no label):
<input
  type="text"
  name="website"
  value={formData.honeypot || ""}
  onChange={(e) => setFormData(prev => ({ ...prev, honeypot: e.target.value }))}
  tabIndex={-1}
  autoComplete="off"
  style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
  aria-hidden="true"
/>

// In form submission handler, reject if honeypot is filled:
if (formData.honeypot) {
  // Silently "succeed" to fool bots
  setSubmitStatus("success");
  return;
}
```

#### 4.3 Rate Limiting Note

Client-side rate limiting provides minimal protection. Add a simple submission timestamp check:
```tsx
// Track last submission time
const lastSubmitRef = useRef<number>(0);

// In submit handler:
const now = Date.now();
if (now - lastSubmitRef.current < 10000) { // 10 second cooldown
  return; // Silently ignore rapid submissions
}
lastSubmitRef.current = now;
```

### Testing (Task 4)
1. Build must succeed
2. Run dev server and check response headers using browser DevTools (Network tab):
   - Verify X-Frame-Options: DENY
   - Verify X-Content-Type-Options: nosniff
   - Verify Referrer-Policy header
   - Verify Content-Security-Policy header
   - Verify Strict-Transport-Security header
3. Verify the site still functions (no CSP violations blocking legitimate resources):
   - Images from Unsplash load
   - Google Fonts load
   - GSAP animations work
   - Framer Motion works
   - All pages render without console CSP errors
4. Test honeypot: fill out the hidden field (via dev tools) and submit — should silently "succeed" without actual submission
5. Test rate limiting: submit the contact form twice rapidly — second should be silently ignored
6. Run `npm run build` — must succeed

---

## TASK 5: Fix Broken Social Links

### Goal
Replace all `href="#"` social links in the footer with actual URLs or remove dead links.

### Current State
- `apps/frontend/components/footer.tsx` lines 38-75: All 6 social links (Facebook, Twitter, Instagram, LinkedIn, YouTube, GitHub) have `href: "#"`
- Lines 510-515: Privacy Policy and Terms of Service links also use `href="#"`

### Implementation Requirements

#### 5.1 Update Social Links

In `apps/frontend/components/footer.tsx`, update the `socialLinks` array (lines 38-75):

```typescript
const socialLinks = [
    {
        icon: Facebook,
        href: "https://www.facebook.com/drkatangablog",
        label: "Facebook",
        hoverClass: "hover:bg-[#1877F2] hover:border-[#1877F2]",
    },
    {
        icon: Twitter,
        href: "https://x.com/drkatangablog",
        label: "Twitter",
        hoverClass: "hover:bg-[#1DA1F2] hover:border-[#1DA1F2]",
    },
    {
        icon: Linkedin,
        href: "https://www.linkedin.com/company/drkatangablog",
        label: "LinkedIn",
        hoverClass: "hover:bg-[#0A66C2] hover:border-[#0A66C2]",
    },
];
```

**Key decisions:**
- Remove Instagram, YouTube, and GitHub if the company doesn't have accounts on those platforms. Dead social links hurt credibility more than having fewer links.
- If the actual URLs are unknown, use placeholder format `https://www.linkedin.com/company/drkatangablog` and add a code comment `// TODO: Replace with actual company social URLs`
- Ask the user for actual social media URLs if unsure

#### 5.2 Update Legal Links

Lines 510-515 have Privacy Policy and Terms of Service pointing to `"#"`:
- Create placeholder pages or link to actual pages if they exist
- If no legal pages exist, change to `"/privacy-policy"` and `"/terms-of-service"` with a TODO comment
- Alternatively, remove the links until the pages exist

#### 5.3 Update Organization Schema

After fixing social links, update the Organization schema (from Task 1) `sameAs` array with the actual social media URLs.

### Testing (Task 5)
1. Build must succeed
2. Verify no `href="#"` remains in footer.tsx (search for `"#"`)
3. Click each social link — should open in new tab to the correct URL (add `target="_blank" rel="noopener noreferrer"` if not already present)
4. Verify social links have proper `aria-label` attributes
5. Check that removed platforms (if any) don't leave visual gaps in the footer layout

---

## TASK 6: Dark Mode Toggle

### Goal
Expose a dark mode toggle to users. The codebase already has `dark:` variant classes on many components.

### Current State
- Many components already have `dark:` Tailwind classes (footer, forms, etc.)
- No theme context/provider exists
- No toggle UI exists
- The `<html>` tag doesn't have a class-based dark mode setup

### Implementation Requirements

#### 6.1 Theme Provider

Create `apps/frontend/providers/theme-provider.tsx`:
```tsx
"use client";
// Manage theme state: "light" | "dark" | "system"
// Store preference in localStorage key "theme"
// On mount: read from localStorage, default to "system"
// Apply class "dark" to <html> element based on preference
// For "system": use matchMedia("(prefers-color-scheme: dark)")
// Listen for system preference changes
// Provide context: { theme, setTheme, resolvedTheme }
```

#### 6.2 Tailwind Dark Mode Config

Ensure Tailwind uses class-based dark mode. In Tailwind CSS 4 with `@tailwindcss/postcss`, dark mode via class strategy should be the default, but verify in `apps/frontend/app/globals.css` or tailwind config.

#### 6.3 Theme Toggle Component

Create `apps/frontend/components/theme-toggle.tsx`:
```tsx
"use client";
// Simple button that cycles through light → dark → system
// Shows Sun icon for light, Moon icon for dark, Monitor icon for system
// Smooth transition between states
// Accessible: aria-label describing current state
```

#### 6.4 Integration

- Add `<ThemeProvider>` wrapping children in `app/[locale]/layout.tsx` (inside body, wrapping everything)
- Add `<ThemeToggle />` next to the language switcher in the navbar (desktop: line ~291, mobile: line ~440 area)
- Add `suppressHydrationWarning` to `<html>` tag (already present on line 66 ✓)

#### 6.5 Prevent Flash of Unstyled Content (FOUC)

Add an inline script in `<head>` that reads localStorage and applies the dark class before React hydrates:
```tsx
<script dangerouslySetInnerHTML={{ __html: `
  (function() {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
` }} />
```

### Testing (Task 6)
1. Build must succeed
2. Default: site uses system preference (light for most users)
3. Click toggle to switch to dark mode — entire site should switch
4. Refresh page — dark mode preference persists (no flash)
5. Check key pages in dark mode: home, about, contact, blog, products, services
6. Verify text remains readable in dark mode (no white-on-white or black-on-black)
7. Verify the toggle is accessible (keyboard navigable, has aria-label)
8. Test "system" mode: should follow OS preference

---

## TASK 7: Error Tracking (Sentry)

### Goal
Add Sentry for error tracking and performance monitoring in production.

### Current State
- No error tracking exists
- Error boundaries exist but don't report anywhere
- No performance monitoring

### Implementation Requirements

#### 7.1 Install Sentry

```bash
npm install @sentry/nextjs --save
```

#### 7.2 Configuration Files

Create `apps/frontend/sentry.client.config.ts`:
```tsx
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
  enabled: process.env.NODE_ENV === "production",
});
```

Create `apps/frontend/sentry.server.config.ts`:
```tsx
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});
```

Create `apps/frontend/sentry.edge.config.ts`:
```tsx
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});
```

#### 7.3 Next.js Config Integration

Wrap the Next.js config with Sentry's `withSentryConfig`:
```tsx
// In next.config.ts
import { withSentryConfig } from "@sentry/nextjs";

// ... existing config ...

export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  org: "global-digitalbit",
  project: "ktblog-website",
});
```

#### 7.4 Global Error Handler

Create `apps/frontend/app/global-error.tsx`:
```tsx
"use client";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Something went wrong</h2>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}
```

#### 7.5 Environment Variable

Add to `.env.example`:
```
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

### Testing (Task 7)
1. Build must succeed
2. With no `NEXT_PUBLIC_SENTRY_DSN` set: verify Sentry is disabled (no errors)
3. With a DSN set: verify Sentry initializes without console errors
4. Verify the global-error.tsx renders a fallback UI
5. No performance degradation in development mode (Sentry disabled in dev)

---

## TASK 8: PWA / Service Worker

### Goal
Make the site installable as a Progressive Web App with offline capability for key pages.

### Implementation Requirements

#### 8.1 Web App Manifest

Create `apps/frontend/public/manifest.json`:
```json
{
  "name": "KTBlog",
  "short_name": "KTBlog",
  "description": "IT Consultancy, AI, Cybersecurity & CBDC Solutions",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1E4DB7",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

#### 8.2 Link Manifest in Layout

Add to `app/[locale]/layout.tsx` `<head>`:
```tsx
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#1E4DB7" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
```

#### 8.3 Service Worker (Optional Basic Caching)

Use `next-pwa` or a simple service worker for caching static assets. If using `next-pwa`:
```bash
npm install next-pwa
```

Configure in `next.config.ts`:
```tsx
import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});
```

**Note:** If `next-pwa` is incompatible with Next.js 16, use `@serwist/next` instead, or skip the service worker and just add the manifest for basic installability.

#### 8.4 Icons

Generate PWA icons from the existing logo at `public/logo/ktblog.png`:
- 192x192 PNG
- 512x512 PNG
- 512x512 maskable PNG

Place in `public/icons/`.

### Testing (Task 8)
1. Build must succeed
2. Verify manifest.json is accessible at /manifest.json
3. Chrome DevTools → Application → Manifest should show the app info
4. On mobile: "Add to Home Screen" prompt should be available (if over HTTPS)
5. Verify theme-color meta tag is present

---

## TASK 9: Fix robots.txt

### Goal
Enhance robots.txt with more comprehensive rules.

### Current State (`public/robots.txt`):
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/
Sitemap: https://drkatangablog.com/sitemap.xml
```

### Implementation
Update to:
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /_next/
Disallow: /private/

User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

Sitemap: https://drkatangablog.com/sitemap.xml
```

### Testing (Task 9)
1. Verify robots.txt is accessible at /robots.txt
2. Validate format (no syntax errors)

---

## TASK 10: Testing Setup

### Goal
Set up a testing framework and add critical path tests.

### Implementation Requirements

#### 10.1 Install Testing Dependencies

```bash
cd apps/frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

#### 10.2 Vitest Config

Create `apps/frontend/vitest.config.ts`:
```tsx
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    globals: true,
    css: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

Create `apps/frontend/test/setup.ts`:
```tsx
import "@testing-library/jest-dom/vitest";
```

#### 10.3 Critical Tests to Write

**Schema validation tests** (`lib/__tests__/schema.test.ts`):
- Test each schema generator returns valid JSON-LD with @context
- Test required fields are present
- Test URLs are absolute

**Metadata tests** (`lib/__tests__/metadata.test.ts`):
- Test generatePageMetadata returns proper structure
- Test canonical URL generation
- Test alternate URL generation for all locales

**Analytics utility tests** (`lib/__tests__/analytics.test.ts`):
- Test trackEvent doesn't throw when gtag is undefined
- Test event helpers call gtag with correct parameters

#### 10.4 Add Test Script

In `apps/frontend/package.json`:
```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run"
}
```

### Testing (Task 10)
1. `npm run test:run` should pass all tests
2. Verify test files follow the naming convention `*.test.ts` or `*.test.tsx`

---

## Execution Order

Implement in this order to minimize conflicts:

1. **Task 1: JSON-LD Structured Data** — Foundation for SEO improvements
2. **Task 5: Fix Social Links** — Quick win, feeds into Task 1 Organization schema
3. **Task 2: Analytics & Tracking** — Needed before Task 4 CSP config
4. **Task 4: Security Headers** — Depends on knowing what scripts/domains to whitelist (GA from Task 2)
5. **Task 3: Performance (Static Generation)** — Test after other changes are stable
6. **Task 9: robots.txt** — Quick standalone fix
7. **Task 6: Dark Mode** — Independent UI feature
8. **Task 7: Sentry** — Independent infrastructure
9. **Task 8: PWA** — Independent enhancement
10. **Task 10: Testing** — Write tests last to cover all new code

## Final Validation Checklist

After all tasks are complete:

- [ ] `npm run build` succeeds with zero errors
- [ ] `npm run lint` passes
- [ ] No TypeScript errors
- [ ] All pages render correctly in dev server
- [ ] View source shows JSON-LD on all page types
- [ ] Security headers present in response
- [ ] No `href="#"` in footer
- [ ] GA4 script loads (with env var) or gracefully degrades (without)
- [ ] Dark mode toggle works and persists
- [ ] Build output shows static pages where expected
- [ ] `npm run test:run` passes all tests
- [ ] No console errors on any page
- [ ] No hydration mismatch warnings
- [ ] i18n works on all 5 locales
- [ ] RTL (Arabic) layout still works
