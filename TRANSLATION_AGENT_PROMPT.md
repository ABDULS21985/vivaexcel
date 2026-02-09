# COMPREHENSIVE I18N TRANSLATION TASK — MULTI-AGENT COORDINATION PROMPT

## PROJECT OVERVIEW

This prompt coordinates multiple AI agents to ensure **complete and accurate internationalization (i18n)** across the Global Digitalbit (Digibit) corporate website. The codebase uses **next-intl** for translations with 5 supported languages.

### Supported Languages
| Code | Language | Direction | Flag |
|------|----------|-----------|------|
| `en` | English | LTR | GB |
| `ar` | Arabic (العربية) | RTL | SA |
| `fr` | French (Français) | LTR | FR |
| `es` | Spanish (Español) | LTR | ES |
| `pt` | Portuguese (Português) | LTR | PT |

### Translation Files Location
```
/apps/frontend/messages/
├── en.json   # English (source of truth)
├── ar.json   # Arabic
├── fr.json   # French
├── es.json   # Spanish
└── pt.json   # Portuguese
```

### i18n Configuration
- **Library:** next-intl
- **Client hook:** `useTranslations(namespace)`
- **Server function:** `getTranslations(namespace)`
- **Routing:** `/apps/frontend/i18n/routing.ts`
- **Config:** `/apps/frontend/i18n.ts` and `/apps/frontend/i18n/config.js`

---

## AGENT COORDINATION STRATEGY

Spawn the following specialized agents to work in parallel:

### AGENT 1: Translation Key Auditor
**Responsibility:** Audit ALL components to identify hardcoded text

### AGENT 2: Message File Synchronizer
**Responsibility:** Ensure all 5 language files have identical key structures

### AGENT 3: Component i18n Integrator
**Responsibility:** Update components to use translation hooks instead of hardcoded text

### AGENT 4: Translation Content Generator
**Responsibility:** Generate accurate translations for all languages

### AGENT 5: RTL & Accessibility Validator
**Responsibility:** Ensure Arabic RTL support and accessibility compliance

---

## AGENT 1: TRANSLATION KEY AUDITOR

### Task Description
Scan ALL component files in `/apps/frontend/components/` and ALL page files in `/apps/frontend/app/[locale]/` to identify hardcoded English text that should be translated.

### Files to Scan
```
/apps/frontend/components/
├── navbar.tsx
├── footer.tsx
├── language-switcher.tsx
├── error-boundary.tsx
├── home/
│   ├── hero-premium.tsx
│   ├── hero-section.tsx
│   ├── about-us-section.tsx
│   ├── blog-section.tsx
│   ├── faqs-section.tsx ⚠️ CRITICAL - Entire FAQ content hardcoded
│   ├── partners-section.tsx
│   ├── process-section.tsx
│   ├── products-section.tsx
│   ├── services-section.tsx
│   ├── testimonials-section.tsx
│   ├── who-we-are-section.tsx
│   └── why-choose-us-section.tsx
├── about/
│   ├── about-hero.tsx
│   ├── about-cta-section.tsx
│   ├── core-values-section.tsx
│   ├── global-presence-section.tsx
│   ├── mission-vision-section.tsx
│   ├── our-story-section.tsx
│   ├── stats-section.tsx
│   └── team-section.tsx
├── services/
│   ├── service-hero.tsx
│   ├── service-hero-global.tsx
│   ├── service-card.tsx
│   ├── service-category.tsx
│   ├── service-category-tabs.tsx
│   ├── service-tabs.tsx
│   ├── service-tower-card.tsx
│   ├── service-tower-grid.tsx
│   ├── engagement-models.tsx
│   ├── industry-practices.tsx
│   ├── ai-data-section.tsx
│   ├── blockchain-section.tsx
│   ├── cybersecurity-section.tsx
│   └── governance-section.tsx
├── products/
│   ├── product-hero.tsx
│   ├── product-card-3d.tsx
│   ├── product-showcase.tsx
│   ├── product-tabs.tsx
│   ├── trustmehub-section.tsx
│   ├── boacrm-section.tsx
│   ├── digigate-section.tsx
│   ├── digitrack-section.tsx
│   ├── digitrust-section.tsx
│   └── trustmehub/
│       ├── features-showcase.tsx
│       └── use-case-card.tsx
├── blog/
│   ├── blog-card.tsx
│   ├── blog-card-premium.tsx
│   ├── blog-card-simple.tsx
│   ├── blog-grid.tsx
│   ├── blog-hero.tsx
│   ├── copy-link-button.tsx
│   ├── reading-progress.tsx
│   └── table-of-contents.tsx
├── contact/
│   ├── contact-form.tsx
│   ├── contact-hero.tsx
│   ├── office-card.tsx
│   └── trust-indicators.tsx
├── shared/
│   ├── comparison-table.tsx
│   ├── cta-section.tsx
│   ├── feature-grid.tsx
│   ├── newsletter-section.tsx
│   ├── partners-grid.tsx
│   ├── pricing-table.tsx
│   ├── section-header.tsx
│   ├── stats-section.tsx
│   └── trust-indicators.tsx
├── training/
│   ├── program-card.tsx
│   └── training-section.tsx
├── websummit/
│   ├── hero-section.tsx
│   ├── contact-section.tsx
│   ├── products-section.tsx
│   ├── services-section.tsx
│   └── why-partner-section.tsx
├── navigation/
│   ├── mega-menu.tsx
│   └── search-overlay.tsx
├── ui/
│   ├── breadcrumbs.tsx
│   ├── button.tsx
│   ├── command-palette.tsx
│   ├── cookie-consent.tsx
│   ├── back-to-top.tsx
│   └── animations/*.tsx
└── seo/*.tsx
```

### What to Look For
1. **String literals in JSX:** Any text directly in components like `<h1>Welcome</h1>`
2. **Placeholder attributes:** `placeholder="Enter your name"`
3. **Alt text:** `alt="Company logo"`
4. **Aria labels:** `aria-label="Close menu"`
5. **Title attributes:** `title="Click to expand"`
6. **Button text:** `<button>Submit</button>`
7. **Error messages:** Hardcoded validation/error strings
8. **Success messages:** Hardcoded confirmation strings
9. **Tooltips:** Any tooltip content
10. **Modal content:** Dialog titles, descriptions, buttons

### Output Format
Generate a JSON report:
```json
{
  "file": "components/home/faqs-section.tsx",
  "hardcodedStrings": [
    {
      "line": 45,
      "text": "What services does Global Digitalbit offer?",
      "context": "FAQ question",
      "suggestedKey": "faqs.questions.services.question"
    }
  ]
}
```

---

## AGENT 2: MESSAGE FILE SYNCHRONIZER

### Task Description
Ensure all 5 translation files have **identical key structures**. The English file (`en.json`) is the source of truth.

### Current Message File Structure (en.json)
```json
{
  "metadata": { ... },
  "navigation": { ... },
  "common": { ... },
  "hero": { ... },
  "about": { ... },
  "services": { ... },
  "products": { ... },
  "training": { ... },
  "blog": { ... },
  "contact": { ... },
  "footer": { ... },
  "errors": { ... },
  "accessibility": { ... },
  "dates": { ... },
  "numbers": { ... }
}
```

### Known Missing Namespaces
The following namespaces are **USED in code but MISSING from message files**:

1. **`notFound`** - Used in `/app/[locale]/not-found.tsx`
   ```json
   "notFound": {
     "title": "Page Not Found",
     "description": "The page you're looking for doesn't exist.",
     "backHome": "Go Back Home"
   }
   ```

2. **`error`** - Used in `/app/[locale]/error.tsx`
   ```json
   "error": {
     "title": "Something Went Wrong",
     "description": "We're sorry, an unexpected error occurred.",
     "tryAgain": "Try Again"
   }
   ```

### Tasks
1. Read `/apps/frontend/messages/en.json` completely
2. Compare with ar.json, fr.json, es.json, pt.json
3. Identify any missing keys in non-English files
4. Add missing namespaces (`notFound`, `error`) to ALL files
5. Ensure key structure is 100% identical across all files

### Validation Script to Create
Create `/apps/frontend/scripts/validate-translations.js`:
```javascript
// Script to validate translation file consistency
// Run: node scripts/validate-translations.js
// Should output any missing keys or structural differences
```

---

## AGENT 3: COMPONENT I18N INTEGRATOR

### Task Description
Update ALL components to use `useTranslations()` hook instead of hardcoded strings.

### Pattern to Follow

**BEFORE (hardcoded):**
```tsx
export function FAQSection() {
  return (
    <section>
      <h2>Frequently Asked Questions</h2>
      <p>Find answers to common questions</p>
    </section>
  );
}
```

**AFTER (internationalized):**
```tsx
"use client";

import { useTranslations } from "next-intl";

export function FAQSection() {
  const t = useTranslations("faqs");

  return (
    <section>
      <h2>{t("title")}</h2>
      <p>{t("subtitle")}</p>
    </section>
  );
}
```

### Server Components Pattern
For server components, use `getTranslations`:
```tsx
import { getTranslations } from "next-intl/server";

export async function ServerComponent() {
  const t = await getTranslations("namespace");
  return <h1>{t("key")}</h1>;
}
```

### Critical Components to Update

#### HIGH PRIORITY (Major Hardcoded Content):

1. **`components/home/faqs-section.tsx`**
   - Entire FAQ content is hardcoded
   - Need new namespace: `faqs`
   - Structure needed:
   ```json
   "faqs": {
     "title": "Frequently Asked Questions",
     "subtitle": "Find answers to common questions",
     "searchPlaceholder": "Search FAQs...",
     "categories": {
       "services": "Services",
       "gettingStarted": "Getting Started",
       "international": "International",
       "training": "Training",
       "aboutUs": "About Us"
     },
     "questions": {
       "services": {
         "question": "What services does Global Digitalbit offer?",
         "answer": "We offer comprehensive IT services including..."
       },
       // ... all FAQ items
     }
   }
   ```

2. **`components/home/testimonials-section.tsx`**
   - Testimonial quotes, names, titles
   - Need namespace: `testimonials`

3. **`components/home/process-section.tsx`**
   - Process step titles and descriptions
   - Need namespace: `process`

4. **`components/home/who-we-are-section.tsx`**
   - Section content
   - May use existing `about` namespace

5. **`components/home/why-choose-us-section.tsx`**
   - Feature cards content
   - May use existing `about.whyChooseUs` namespace

6. **`components/about/our-story-section.tsx`**
   - Timeline content, milestones
   - Need namespace: `about.ourStory`

7. **`components/about/team-section.tsx`**
   - Section title, team member info
   - Need namespace: `about.team`

8. **`components/websummit/*.tsx`** (all files)
   - Entire WebSummit landing page content
   - Need namespace: `websummit`

#### MEDIUM PRIORITY (Partial Hardcoding):

9. **`components/navbar.tsx`**
   - Search button text: "Search"
   - Language label in mobile menu
   - Already uses `useTranslations("navigation")` but has gaps

10. **`components/footer.tsx`**
    - Newsletter success/error messages
    - Already uses translations but has hardcoded strings

11. **`components/navigation/mega-menu.tsx`**
    - Menu section headers, descriptions
    - Need namespace: `navigation.megaMenu`

12. **`components/navigation/search-overlay.tsx`**
    - Search placeholder, recent searches label, trending topics
    - Need namespace: `search`

13. **`components/ui/command-palette.tsx`**
    - Command palette placeholder and labels
    - Need namespace: `commandPalette`

14. **`components/ui/cookie-consent.tsx`**
    - Cookie consent text, button labels
    - Need namespace: `cookieConsent`

15. **`components/ui/breadcrumbs.tsx`**
    - "Home" text
    - Use `common.home` or `navigation.home`

### Data Files to Translate

These files contain hardcoded English content that needs translation keys:

1. **`/apps/frontend/data/services-global.ts`**
   - All service names, descriptions, features

2. **`/apps/frontend/data/products.ts`**
   - Product names, descriptions, features (some already in translations)

3. **`/apps/frontend/data/training.ts`**
   - Training program names, descriptions

4. **`/apps/frontend/data/blog.ts`**
   - Blog post titles, excerpts (dynamic content)

5. **`/apps/frontend/data/trustmehub/*.ts`**
   - TrustMeHub features, use cases, pricing

6. **`/apps/frontend/components/contact/office-data.ts`**
   - Office locations, addresses (use existing `contact.locations`)

---

## AGENT 4: TRANSLATION CONTENT GENERATOR

### Task Description
Generate accurate translations for ALL keys in ALL languages.

### Translation Quality Guidelines

1. **Consistency:** Use consistent terminology across all keys
2. **Context:** Consider the UI context (button vs. heading vs. paragraph)
3. **Length:** Translations should be similar length to English to avoid layout issues
4. **Formality:** Maintain professional, enterprise tone
5. **Cultural Sensitivity:** Adapt idioms appropriately for each culture

### Language-Specific Guidelines

#### Arabic (ar.json)
- Use Modern Standard Arabic (فصحى)
- Right-to-left text direction
- Numbers should use Western Arabic numerals (1, 2, 3) for consistency
- Professional/formal register
- Example translations:
  - "Learn More" → "اعرف المزيد"
  - "Contact Us" → "تواصل معنا"
  - "Our Services" → "خدماتنا"

#### French (fr.json)
- Use formal French (vous, not tu)
- Include proper accents (é, è, ê, ë, à, ù, ç)
- Example translations:
  - "Learn More" → "En savoir plus"
  - "Contact Us" → "Contactez-nous"
  - "Our Services" → "Nos services"

#### Spanish (es.json)
- Use neutral Latin American Spanish (understood across regions)
- Use formal register (usted, not tú)
- Example translations:
  - "Learn More" → "Más información"
  - "Contact Us" → "Contáctenos"
  - "Our Services" → "Nuestros servicios"

#### Portuguese (pt.json)
- Use Brazilian Portuguese (pt-BR) as primary
- Formal register
- Example translations:
  - "Learn More" → "Saiba mais"
  - "Contact Us" → "Entre em contato"
  - "Our Services" → "Nossos serviços"

### New Namespaces to Create

Generate complete translations for these NEW namespaces:

```json
{
  "notFound": {
    "title": "",
    "subtitle": "",
    "description": "",
    "backHome": "",
    "searchPlaceholder": ""
  },
  "error": {
    "title": "",
    "description": "",
    "tryAgain": "",
    "goHome": "",
    "contactSupport": ""
  },
  "faqs": {
    "title": "",
    "subtitle": "",
    "searchPlaceholder": "",
    "noResults": "",
    "categories": { ... },
    "questions": { ... }
  },
  "testimonials": {
    "title": "",
    "subtitle": "",
    "clientSince": ""
  },
  "process": {
    "title": "",
    "subtitle": "",
    "steps": {
      "step1": { "title": "", "description": "" },
      "step2": { "title": "", "description": "" },
      "step3": { "title": "", "description": "" },
      "step4": { "title": "", "description": "" }
    }
  },
  "search": {
    "placeholder": "",
    "recentSearches": "",
    "trending": "",
    "quickLinks": "",
    "noResults": "",
    "resultsFor": ""
  },
  "cookieConsent": {
    "title": "",
    "description": "",
    "acceptAll": "",
    "rejectAll": "",
    "customize": "",
    "savePreferences": "",
    "categories": {
      "essential": { "title": "", "description": "" },
      "analytics": { "title": "", "description": "" },
      "marketing": { "title": "", "description": "" }
    }
  },
  "websummit": {
    "hero": { ... },
    "whyPartner": { ... },
    "products": { ... },
    "services": { ... },
    "contact": { ... }
  },
  "caseStudies": {
    "title": "",
    "subtitle": "",
    "filters": { ... },
    "card": { ... }
  },
  "industries": {
    "title": "",
    "subtitle": "",
    "items": { ... }
  }
}
```

---

## AGENT 5: RTL & ACCESSIBILITY VALIDATOR

### Task Description
Ensure Arabic (RTL) support works correctly and all translations are accessible.

### RTL Validation Checklist

1. **Direction Attribute:**
   - Verify `dir="rtl"` is set on `<html>` for Arabic locale
   - Check in `/apps/frontend/app/[locale]/layout.tsx`

2. **CSS RTL Classes:**
   - Ensure Tailwind RTL utilities are available (`rtl:`, `ltr:`)
   - Check for hardcoded `left`/`right` that should use logical properties

3. **Icon Mirroring:**
   - Navigation arrows should flip in RTL
   - Chevrons, arrows pointing left/right

4. **Text Alignment:**
   - Use `text-start`/`text-end` instead of `text-left`/`text-right`
   - Check all components for hardcoded alignment

5. **Margin/Padding:**
   - Use `ms-*`/`me-*` (margin-start/end) instead of `ml-*`/`mr-*`
   - Use `ps-*`/`pe-*` (padding-start/end) instead of `pl-*`/`pr-*`

6. **Flex/Grid Direction:**
   - Use `flex-row` with `rtl:flex-row-reverse` where needed
   - Or use logical properties

### Accessibility Validation

1. **Screen Reader Text:**
   - Verify all `aria-label` attributes are translated
   - Check `sr-only` text is translated
   - Verify `alt` attributes on images

2. **Live Regions:**
   - Ensure `aria-live` announcements are translated
   - Check form validation messages

3. **Focus Management:**
   - Ensure focus indicators work in RTL
   - Check tab order in RTL layout

### Files to Check for RTL Issues
```
components/navbar.tsx         # Navigation direction
components/footer.tsx         # Layout direction
components/home/*.tsx         # All home sections
components/ui/button.tsx      # Icon positioning
components/ui/breadcrumbs.tsx # Arrow direction
```

### Output
Generate a report of RTL issues found:
```json
{
  "file": "components/navbar.tsx",
  "line": 45,
  "issue": "Hardcoded ml-4 should use ms-4",
  "severity": "medium"
}
```

---

## EXECUTION ORDER

### Phase 1: Audit (Parallel)
1. **Agent 1** audits components for hardcoded text
2. **Agent 2** analyzes message file structure gaps
3. **Agent 5** checks RTL compatibility

### Phase 2: Structure (Sequential)
1. **Agent 2** creates unified message file structure
2. Add all missing namespaces to `en.json`
3. Sync structure to all language files

### Phase 3: Integration (Parallel by Component Group)
1. **Agent 3** updates home components
2. **Agent 3** updates about components
3. **Agent 3** updates services components
4. **Agent 3** updates products components
5. **Agent 3** updates contact/blog components
6. **Agent 3** updates websummit components
7. **Agent 3** updates shared/ui components

### Phase 4: Translation (Parallel by Language)
1. **Agent 4** generates Arabic translations
2. **Agent 4** generates French translations
3. **Agent 4** generates Spanish translations
4. **Agent 4** generates Portuguese translations

### Phase 5: Validation (Parallel)
1. **Agent 5** validates RTL layout
2. **Agent 2** validates key consistency
3. Run automated tests

---

## VALIDATION COMMANDS

After all agents complete:

```bash
# Build to check for TypeScript errors
npm run build --workspace=apps/frontend

# Lint the code
npm run lint --workspace=apps/frontend

# Run the validation script
node apps/frontend/scripts/validate-translations.js

# Start dev server and manually test each locale
npm run dev --workspace=apps/frontend
# Visit: http://localhost:3000/en, /ar, /fr, /es, /pt
```

---

## SUCCESS CRITERIA

1. **100% Key Parity:** All 5 message files have identical key structures
2. **Zero Hardcoded Strings:** No user-facing English text in components
3. **RTL Functional:** Arabic locale displays correctly right-to-left
4. **Build Success:** `npm run build` passes with no errors
5. **Lint Clean:** `npm run lint` passes with no errors
6. **Manual QA:** All pages render correctly in all 5 locales

---

## CRITICAL RULES

1. **NEVER delete existing translations** — only add or update
2. **ALWAYS preserve the source English text** as the reference
3. **ALWAYS use the `useTranslations` hook** for client components
4. **ALWAYS use `getTranslations`** for server components
5. **NEVER hardcode text** that users will see
6. **ALWAYS test Arabic locale** after changes for RTL issues
7. **PRESERVE existing namespace structure** — extend, don't reorganize
8. **USE consistent terminology** across all translations
9. **INCLUDE context comments** for translators where meaning is ambiguous

---

## APPENDIX: CURRENT TRANSLATION KEYS (en.json)

For reference, here are the existing namespaces (351 lines total):

- `metadata` (6 keys) - SEO metadata
- `navigation` (13 keys) - Nav items
- `common` (37 keys) - Generic UI strings
- `hero` (12 keys) - Hero carousel slides
- `about` (20+ keys) - About page content
- `services` (15+ keys) - Services content
- `products` (20+ keys) - Products content
- `training` (10+ keys) - Training content
- `blog` (12 keys) - Blog content
- `contact` (30+ keys) - Contact form & locations
- `footer` (15+ keys) - Footer content
- `errors` (9 keys) - Error messages
- `accessibility` (7 keys) - A11y strings
- `dates` (7 keys) - Date formatting
- `numbers` (3 keys) - Number formatting

**Total estimated keys needed after full implementation:** ~500-600 keys per language file.
