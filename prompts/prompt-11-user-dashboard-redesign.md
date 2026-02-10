# PROMPT 11: World-Class User Dashboard — Complete Redesign & Enhancement

## Context

You are working on the VivaExcel monorepo at `/Users/mac/codes/vivaexcel`, a digital content marketplace and blog platform. The stack is: **NestJS 11 backend** (`apps/backend`, TypeORM + PostgreSQL + Redis + Stripe + Socket.io), **Next.js 16 frontend** (`apps/frontend`, React 19 + TypeScript + Tailwind CSS v4 + TanStack Query + Framer Motion + GSAP). The UI uses a custom shadcn-style component library at `packages/ui/src/` (Card, Badge, Button, Tabs, Skeleton, Dialog, Sheet, Table, etc.). Design tokens are defined via CSS variables in `apps/frontend/app/globals.css` with a surface depth system (`--surface-0` through `--surface-4`), primary color `#1E4DB7`, glassmorphism effects, and dark mode support.

The current user dashboard at `apps/frontend/app/[locale]/dashboard/page.tsx` is at **10% completion** — it only shows a welcome header, 3 basic stat cards (articles read, bookmarks, current plan), a simple reading history list, bookmarks grid, subscription card, and quick links. It uses `useAuth()`, `useBookmarks()`, `useReadingHistory()`, `useReadingStats()`, and `useRemoveBookmark()` hooks.

**Layout already fixed:** A shared dashboard layout has been created at `apps/frontend/app/[locale]/dashboard/layout.tsx` that provides:
- `<ProtectedRoute>` wrapper (removed from individual pages — do NOT re-add it)
- **Desktop sidebar** (264px, sticky) with user avatar card + navigation links (Overview, Profile, Billing, Bookmarks, Reading History, Achievements, Settings)
- **Mobile horizontal scrollable nav** (pill-style tabs with active state)
- Proper container with `max-w-7xl` and responsive padding
- All dashboard sub-pages (`page.tsx`, `billing/page.tsx`, `profile/page.tsx`) render inside this layout's `<main>` area — they should NOT include their own container/padding/ProtectedRoute

The global layout at `apps/frontend/app/[locale]/layout.tsx` has been fixed with `pt-16 lg:pt-[72px]` on `<main>` to account for the fixed BlogNavbar (h-16 mobile / h-[72px] desktop). The redundant `<MobileTopBar>` has been removed — BlogNavbar handles both mobile and desktop.

**Your mission: Transform this into a premium, feature-rich, visually stunning user dashboard that rivals platforms like Medium, Substack, Notion, and Spotify Wrapped — taking it from 10% to 100%.**

---

## Existing Backend APIs Available (All Under `/api/v1`)

Use these real endpoints — do NOT invent fake data or mock APIs. Build frontend features that consume these:

### Auth & Profile
- `GET /auth/me` → User object: `{ id, email, firstName, lastName, avatar, bio, website, socialLinks, username, coverImageUrl, isCreator, specialties, plan, stripeCustomerId, subscriptionStatus, subscriptionEndDate, createdAt }`
- `PATCH /auth/profile` → Update profile fields
- `POST /auth/change-password` → Change password
- `POST /auth/setup-2fa` / `POST /auth/verify-2fa` → Two-factor authentication

### Reading History & Stats
- `GET /reading-history` → `{ history: [{ id, postId, readAt, progress, post: { title, slug, category, featuredImage, readingTime } }], total, page, limit }`
- `GET /reading-history/stats` → `{ totalArticlesRead, streak, thisWeek }`

### Bookmarks
- `GET /bookmarks` → `{ bookmarks: [...], total, page, limit }`
- `POST /bookmarks/{postId}` / `DELETE /bookmarks/{postId}`

### Gamification (FULLY BUILT — currently unused on dashboard)
- `GET /gamification/profile` → `{ totalXP, level, currentLevelXP, nextLevelXP, levelTitle, streak: { current, longest, streakFreezeAvailable }, achievements: [...] }`
- `GET /gamification/achievements` → All achievements with categories (BUYER, SELLER, REVIEWER, COMMUNITY, EXPLORER, COLLECTOR), tiers (BRONZE→DIAMOND), progress tracking
- `GET /gamification/achievements/:slug` → Single achievement with user progress
- `GET /gamification/leaderboard` → `{ rankings: [{ rank, score, userName, avatar }], period, category }`
- `GET /gamification/activity` → XP transaction feed with source, description, timestamps
- `POST /gamification/streak/freeze` → Use streak freeze item

### Membership & Billing
- Subscription info available via `user.plan` (free|basic|pro|premium), `user.subscriptionStatus`, `user.subscriptionEndDate`

### Notifications (via Socket.io)
- Events: `gamification.achievement_unlocked`, `gamification.level_up`, `xp_earned`
- Already handled by `<GamificationListener>` component in the global layout

### Blog Posts
- `GET /blog/posts` → All posts with cursor pagination, filtering by category, tags, search

---

## Existing Hooks Available (in `apps/frontend/hooks/`)

- `use-bookmarks.ts` → `useBookmarks()`, `useRemoveBookmark()`, `useToggleBookmark()`, `useBookmarkStatus()`
- `use-reading-history.ts` → `useReadingHistory()`, `useReadingStats()`
- `use-gamification.ts` → `useGamificationProfile()`, `useAchievements()`, `useAchievementDetail()`, `useLeaderboard()`, `useGamificationActivity()`, `useStreakFreeze()`

---

## Existing UI Components Available (in `packages/ui/src/`)

Badge, Breadcrumb, Button (with loading state), Card, Checkbox, Dialog, DropdownMenu, Input, Label, Loader, OTPInput, Select, Sheet, Skeleton, Spinner, Switch, Table, Tabs, Textarea

---

## What To Build — Section by Section

### 1. WELCOME HERO SECTION (Replace Current Basic Header)

Replace the plain text welcome with a rich, personalized hero:
- **Greeting with time-awareness**: "Good morning, Aminu" / "Good evening, Aminu" based on local time
- **User avatar** (large, circular) with fallback to initials if no avatar uploaded. Click to go to profile settings.
- **Member since** badge: "Member since Jan 2024"
- **Quick-action buttons** in the hero: "Browse Articles", "View Bookmarks", "Manage Profile"
- **Daily motivational element**: Show the user's reading streak ("You're on a 7-day streak!") or a motivational nudge if streak is 0 ("Start your reading streak today!")
- Subtle animated background gradient or pattern using Framer Motion

### 2. ENHANCED STATS ROW (Replace Current 3 Cards)

Expand from 3 basic stat cards to **5-6 rich stat cards** in a horizontally scrollable row (mobile) / grid (desktop):

| Card | Data Source | Visual |
|------|------------|--------|
| Articles Read | `GET /reading-history/stats` → `totalArticlesRead` | Animated counter, book icon, "+X this week" subtitle using `thisWeek` |
| Reading Streak | `GET /gamification/profile` → `streak.current` | Fire/flame icon, streak number with animation, "longest: X days" subtitle |
| XP & Level | `GET /gamification/profile` → `totalXP`, `level`, `levelTitle` | Circular progress ring showing XP progress to next level, level badge |
| Bookmarks | `GET /bookmarks` → `total` | Bookmark icon, count, "X new this week" if trackable |
| Achievements | `GET /gamification/profile` → `achievements.length` | Trophy icon, unlocked count / total, latest achievement badge |
| Leaderboard Rank | `GET /gamification/leaderboard` → find current user's rank | Rank number with medal icon (gold/silver/bronze for top 3), "Top X%" |

Each card should:
- Have a subtle hover animation (lift + shadow)
- Use the existing design token colors (blue, amber, purple, green, etc.)
- Show skeleton loading states using `<Skeleton>` from the UI library
- Be clickable — navigating to the relevant detail section/page

### 3. GAMIFICATION HUB (Brand New Section)

This is the biggest missing piece. The entire gamification backend is built but the dashboard doesn't use it. Create a **tabbed gamification section** using `<Tabs>` from the UI library:

#### Tab 1: "Overview"
- **XP Progress Bar**: Large, animated horizontal bar showing progress from current level to next level. Show `currentLevelXP / nextLevelXP` with percentage. Label: "Level {level} — {levelTitle}"
- **Streak Widget**: Visual streak calendar (last 14 days) — green dots for active days, gray for missed, with streak freeze indicator. Show current streak prominently. If `streakFreezeAvailable > 0`, show a "Streak Freeze Available" badge with tooltip explaining it.
- **Recent XP Activity**: Last 5 XP transactions from `GET /gamification/activity` — show source, description, XP amount (+50 XP), and timestamp in a compact feed. Each entry has a small icon based on source type.

#### Tab 2: "Achievements"
- **Achievement Grid**: Show all achievements from `GET /gamification/achievements` in a visually rich grid
- Each achievement card shows: icon/emoji, name, description, tier badge (Bronze→Diamond with color coding), category tag, progress bar (X/Y), and locked/unlocked state
- Unlocked achievements are vivid and colorful; locked ones are grayed out with a lock icon overlay
- Filter by category (BUYER, SELLER, REVIEWER, COMMUNITY, EXPLORER, COLLECTOR) using filter chips
- Filter by status: All / Unlocked / In Progress / Locked
- Click an achievement to open a `<Dialog>` or `<Sheet>` with full detail from `GET /gamification/achievements/:slug`

#### Tab 3: "Leaderboard"
- Fetch from `GET /gamification/leaderboard`
- **Top 3 Podium**: Show top 3 users with large avatars, rank badges (gold/silver/bronze), and XP scores — styled like a podium
- **Full Rankings Table**: Use `<Table>` component for remaining rankings. Columns: Rank, User (avatar + name), Level, XP Score
- Highlight the current user's row with a distinct background color
- Period filter tabs: Daily / Weekly / Monthly / All Time

### 4. READING ACTIVITY & ANALYTICS (Enhance Current Reading History)

Replace the basic list with a rich reading analytics section:

#### Reading Stats Dashboard
- **Weekly Reading Chart**: A simple bar chart or visual showing articles read per day this week (Mon–Sun). Use CSS-only bars or a lightweight approach — no need for a chart library. Data from reading history timestamps.
- **Reading Time Estimate**: Calculate total estimated reading time from `readingTime` fields of read articles
- **Completion Rate**: Percentage of articles read to 100% vs. started but not finished
- **Top Categories**: Show the user's most-read categories as colored tags with counts

#### Reading History (Enhanced)
- Keep the existing list but add:
  - **Article thumbnail** (use `featuredImage` from the post)
  - **Reading time** display
  - **"Continue Reading"** button for articles with progress < 100%
  - **Completed badge** (checkmark) for articles at 100%
- Add **search/filter**: Filter reading history by category, date range, or completion status
- Add **pagination** or infinite scroll (the API supports `page` and `limit` params)

### 5. BOOKMARKS SECTION (Enhance Current)

Upgrade the current basic bookmarks grid:
- **View toggle**: Grid view (current) vs. List view — let user switch
- **Sort options**: Recently bookmarked, alphabetical, by category
- **Category filter chips**: Quick-filter bookmarks by post category
- **Bulk actions**: Select multiple → remove selected (with confirmation dialog)
- **Empty state animation**: Use Lottie for a nice empty bookmarks animation instead of a static icon
- Show **reading progress** on each bookmarked article if it exists in reading history

### 6. SUBSCRIPTION & PLAN CARD (Enhance Current Sidebar)

Transform the basic subscription card into a rich widget:
- **Plan comparison indicator**: Show what features the user is missing on their current plan with a "See what you're missing" expandable section
- **Usage meters** (if applicable): "X of Y premium articles this month", reading limits, etc.
- **Subscription timeline**: If subscribed, show "Renews on {date}" with a visual countdown or "X days remaining"
- **Upgrade CTA**: For free users, show a premium feature teaser with an animated gradient border card: "Unlock {X} premium articles, ad-free reading, exclusive content..."
- **Billing quick-view**: Last payment amount and date (if available)

### 7. PERSONALIZED RECOMMENDATIONS (New Section)

- **"Recommended For You"** section with 4-6 article cards
- Fetch from `GET /blog/posts` with relevant category filters based on user's reading history
- Each card: featured image, title, category badge, reading time, bookmark toggle button
- Horizontal scrollable carousel on mobile using the existing Embla Carousel dependency

### 8. QUICK ACTIONS & NAVIGATION (Enhance Current Quick Links)

Replace the plain quick links with a **visual quick-actions grid**:
- Each action as an icon card (not just text links):
  - Profile Settings (User icon)
  - Security & 2FA (Shield icon)
  - Billing & Invoices (CreditCard icon)
  - Reading History (Clock icon)
  - Browse Articles (Compass icon)
  - Membership Plans (Crown icon)
  - Achievements (Trophy icon)
  - Leaderboard (BarChart icon)
- 2x4 grid on desktop, 2x2 scrollable on mobile
- Subtle hover animation on each card

### 9. ACTIVITY FEED / NOTIFICATION CENTER (New Section)

- **Recent Activity Timeline**: A compact vertical timeline showing the user's recent actions:
  - "You read 'Article Title'" — with timestamp
  - "You earned +50 XP for completing an article"
  - "Achievement Unlocked: Bookworm"
  - "You bookmarked 'Article Title'"
- Pull from combination of reading history, gamification activity, and bookmarks data
- Show last 10 items with a "View all activity" link
- Each entry has a small icon, description, and time-ago timestamp

---

## Design & UX Requirements

### Visual Design
- Use the **existing design token system** (`--primary`, `--surface-0` through `--surface-4`, `--card`, `--border`, `--foreground`, `--muted-foreground`, etc.)
- Follow the **glassmorphism** pattern already established in globals.css where appropriate (e.g., for the hero section)
- Maintain **dark mode compatibility** — all colors must work in both light and dark themes
- Use **Framer Motion** for section enter animations (fade-up on scroll), hover states, and micro-interactions
- Use **Lucide React** icons exclusively (already installed)
- Cards should have the existing `rounded-xl` border radius pattern
- Responsive: **mobile-first** — single column on mobile, expanding to multi-column grid on desktop

### Loading States
- Every section must have **skeleton loading states** using `<Skeleton>` from the UI library
- Use the existing `<Loader2>` spinner for action buttons
- Data fetching uses `TanStack Query` (already configured) — leverage `isLoading`, `isError`, `data` states

### Error States
- Each section should gracefully handle API errors with a friendly message and "Retry" button
- Use `toast` from `sonner` (already imported) for action feedback (bookmark removed, streak freeze used, etc.)

### Empty States
- Every section with dynamic data needs a meaningful empty state with:
  - Relevant illustration or icon
  - Descriptive text explaining what would appear here
  - CTA button to take action (e.g., "Browse Articles" for empty reading history)

### Performance
- Use `React.lazy` or dynamic imports for below-the-fold sections
- Implement **staggered data fetching** — load critical sections first (stats, reading history), then secondary (gamification, recommendations)
- Images should use `next/image` for optimization (with `sizes` and `priority` attributes)

### Accessibility
- All interactive elements must have proper `aria-labels`
- Keyboard navigable — all cards and actions reachable via Tab
- Screen reader friendly — use semantic HTML (`<section>`, `<nav>`, `<article>`, `<h2>`, `<h3>`)
- Color contrast must meet WCAG AA standards
- Progress bars need `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

---

## File Structure

The dashboard layout is already created. Organize the code as follows:

```
apps/frontend/app/[locale]/dashboard/
├── layout.tsx                        # ALREADY EXISTS — shared layout with sidebar + mobile nav + ProtectedRoute
├── page.tsx                          # Main dashboard overview page (orchestrator)
├── profile/page.tsx                  # ALREADY EXISTS — profile settings
├── billing/page.tsx                  # ALREADY EXISTS — billing & subscription management
├── bookmarks/page.tsx                # NEW — dedicated bookmarks page (linked from sidebar)
├── history/page.tsx                  # NEW — full reading history page (linked from sidebar)
├── achievements/page.tsx             # NEW — full achievements page (linked from sidebar)
├── settings/page.tsx                 # NEW — account settings page (linked from sidebar)
├── _components/
│   ├── dashboard-hero.tsx            # Welcome hero section
│   ├── stats-row.tsx                 # Enhanced stat cards
│   ├── gamification-hub.tsx          # Tabbed gamification section
│   ├── gamification-overview.tsx     # XP progress, streak, recent activity
│   ├── gamification-achievements.tsx # Achievement grid with filters
│   ├── gamification-leaderboard.tsx  # Leaderboard with podium
│   ├── reading-analytics.tsx         # Reading stats & charts
│   ├── reading-history-list.tsx      # Enhanced reading history
│   ├── bookmarks-section.tsx         # Enhanced bookmarks with views
│   ├── subscription-card.tsx         # Rich subscription widget
│   ├── recommendations.tsx           # Personalized article recommendations
│   ├── quick-actions.tsx             # Visual quick-action grid
│   └── activity-feed.tsx             # Activity timeline
```

**IMPORTANT layout rules:**
- `layout.tsx` already wraps all pages in `<ProtectedRoute>` — do NOT add it again in any page
- `layout.tsx` already provides the container, padding, and sidebar — pages should NOT add their own `container mx-auto` or `min-h-screen py-8` wrappers
- Each page renders directly inside the layout's `<main className="flex-1 min-w-0">` element
- The sidebar navigation links are defined in `layout.tsx` — when adding new pages (bookmarks, history, achievements, settings), they will automatically appear in the sidebar
- The main `page.tsx` should import and compose all overview sections, keeping each section in its own `_components/` file for maintainability. Each component manages its own data fetching via the existing hooks.

---

## Implementation Order (Priority)

1. **Dashboard Hero** + **Enhanced Stats Row** (highest visual impact)
2. **Gamification Hub** (biggest feature gap — backend is ready, frontend is missing)
3. **Reading Analytics** + **Enhanced Reading History** (core user value)
4. **Enhanced Bookmarks** (improving existing)
5. **Subscription Card** enhancement
6. **Recommendations Section**
7. **Quick Actions Grid**
8. **Activity Feed**

---

## What NOT To Do

- Do NOT create new backend API endpoints — use only the existing ones listed above
- Do NOT install new npm packages — use the already-installed libraries (Framer Motion, GSAP, Lottie, Embla Carousel, Lucide, TanStack Query, Sonner, etc.)
- Do NOT change the global layout, navbar, or footer
- Do NOT modify the `<ProtectedRoute>` wrapper or auth system
- Do NOT break the existing dark mode / light mode theming
- Do NOT use inline styles — use Tailwind classes and CSS variables
- Do NOT hardcode any text in English only — wrap all user-facing strings for future i18n support (use template literals that can be later replaced with translation keys)
- Do NOT create mock data or fake API responses — all data must come from real API hooks

---

## Quality Checklist

Before considering the dashboard complete, verify:

- [ ] All 9 sections are implemented and rendering correctly
- [ ] Dark mode works perfectly across all sections
- [ ] Mobile responsive — looks great on 375px, 768px, and 1440px widths
- [ ] All API data is loading with proper skeleton states
- [ ] Empty states display correctly when a user has no data
- [ ] Error states display with retry capability
- [ ] All hover animations are smooth (no jank)
- [ ] Page loads fast — no layout shift, critical data loads first
- [ ] All links navigate correctly
- [ ] Gamification data (XP, level, achievements, streak, leaderboard) displays correctly
- [ ] Bookmark removal works with optimistic updates
- [ ] Streak freeze functionality works
- [ ] Achievement detail modal/sheet opens correctly
- [ ] Leaderboard period filters work
- [ ] Reading history pagination works
- [ ] Bookmarks view toggle (grid/list) works
- [ ] All interactive elements are keyboard accessible
- [ ] No TypeScript errors
- [ ] No console errors or warnings
