# PROMPT 10: Comprehensive Testing & Quality Assurance Infrastructure

## Context

You are working on the KTBlog monorepo at `/Users/mac/codes/vivaexcel`, a digital product marketplace with three apps: NestJS 11 backend (`apps/backend`, TypeORM + PostgreSQL + Redis + Stripe), Next.js 16 frontend (`apps/frontend`, React 19 + Tailwind 4 + TanStack Query), and Next.js 16 dashboard (`apps/dashboard`). The backend has 55 modules in `apps/backend/src/modules/`, 68 entities in `apps/backend/src/entities/`, and 4 auth guards in `apps/backend/src/common/guards/`. The frontend has 90+ pages under `apps/frontend/app/[locale]/`, 70+ components under `apps/frontend/components/` (including `store/product-card.tsx`, `cart/cart-drawer.tsx`, `store/reviews/review-form.tsx`, `store/store-listing-client.tsx`, `store/comparison/comparison-table.tsx`, `store/promotions/coupon-input.tsx`, `store/product-gallery.tsx`), and 50 hooks in `apps/frontend/hooks/`. Currently only TWO test files exist in the entire codebase: `apps/frontend/__tests__/lib/format.test.ts` and `apps/frontend/__tests__/accessibility/format-and-currency.test.ts`. Backend has zero tests. There are no E2E, visual regression, load, or accessibility tests. Vitest is configured at `apps/frontend/vitest.config.ts` (jsdom environment), a setup file exists at `apps/frontend/vitest.setup.tsx` (mocks next-intl, next/navigation, @/i18n/routing; extends jest-axe matchers). Backend uses Jest (configured inline in `apps/backend/package.json`). CI is CircleCI (`.circleci/config.yml`) with build-and-push jobs only -- no test stage exists. This prompt covers building the entire test infrastructure from near-zero to production-grade.

## 1. BACKEND TESTING (Jest + NestJS + TypeORM)

### 1A. Test Database with TestContainers
Install `@testcontainers/postgresql` as a devDependency in `apps/backend`. Create `apps/backend/test/setup/test-database.ts` that spins up a PostgreSQL container before all tests, creates a TypeORM DataSource pointing at it, synchronizes the schema, and tears down after all tests. Export a `getTestDataSource()` helper. Create `apps/backend/test/jest-global-setup.ts` and `jest-global-teardown.ts` to manage the container lifecycle. Update the jest config in `apps/backend/package.json` to reference these global setup/teardown files and to set `testTimeout: 30000`.

### 1B. Entity Factories
Create `apps/backend/test/factories/index.ts` that exports factory functions for all 68 entities using `@faker-js/faker`. Each factory returns a fully valid entity instance with all required fields populated and accepts `Partial<Entity>` overrides. Prioritize these critical factories first: `createUser()`, `createDigitalProduct()`, `createOrder()`, `createOrderItem()`, `createCart()`, `createCartItem()`, `createReview()`, `createReviewVote()`, `createSellerProfile()`, `createSellerApplication()`, `createLicense()`, `createLicenseActivation()`, `createDownloadToken()`, `createMarketplaceSubscription()`, `createMarketplacePlan()`, `createCreditTransaction()`, `createPost()`, `createAffiliateProfile()`, `createAffiliateCommission()`. Each factory must handle relations correctly (e.g., `createOrder()` auto-creates a user if none provided). Create a `createMany<T>(factory, count, overrides?)` generic helper.

### 1C. Test Utilities
Create `apps/backend/test/utils/test-app.ts`: a `createTestApp()` function that bootstraps a NestJS testing module with the real AppModule but overrides the DataSource with the test container's DataSource. Export helpers: `getAuthToken(app, user)` that calls the JWT service to mint a valid token, `seedDatabase(dataSource, seedFn)` for test data setup, and `cleanDatabase(dataSource)` that truncates all tables between tests preserving the schema.

### 1D. Service Unit Tests (Mock Repositories)
Create `*.spec.ts` files colocated with each service. For each test, use `Test.createTestingModule` and provide mock repositories via `{ provide: getRepositoryToken(Entity), useValue: mockRepo }`. Test the 10 most critical services:
- **CheckoutService** (`modules/checkout/checkout.service.spec.ts`): test createCheckoutSession (builds Stripe session, creates pending order), handleWebhookPayment (marks order paid, grants access), processRefund (updates order status, revokes access).
- **CartService** (`modules/cart/cart.service.spec.ts`): test addItem (new item, increment existing, idempotency), removeItem, clearCart, mergeGuestCart (merges anonymous cart into user cart on login).
- **ReviewsService** (`modules/reviews/services/*.spec.ts`): test createReview (validates purchase, prevents duplicates), moderateReview (approve/reject transitions), voteOnReview (upvote/downvote toggle, prevents self-vote).
- **PromotionsService**: test validateCoupon (valid, expired, usage-limit-reached, minimum-spend), isFlashSaleActive (timing boundaries), calculateLoyaltyTier.
- **DeliveryService**: test generateDownloadToken (unique token, expiry), validateDownloadToken (valid, expired, already-used), rateLimit (blocks after threshold).
- **SellersService**: test submitApplication (valid, duplicate prevention), approveApplication (creates seller profile), calculatePayout (commission deduction, minimum threshold).
- **DigitalProductsService**: test create (slug generation, category assignment), update (cache invalidation), findBySlug (returns cached or queries DB).
- **RecommendationService**: test calculateSimilarityScore, getTrendingProducts (time-windowed view counts), getPersonalized (based on purchase history).
- **LicenseService**: test generateLicense (unique key format), activateLicense (success, max-activations-reached), deactivateLicense.
- **MarketplaceSubscriptionService**: test grantMonthlyCredits, deductCredits (sufficient balance, insufficient balance error), changePlan (prorates credits).

### 1E. Controller Integration Tests
Create `*.controller.spec.ts` files using `supertest` against the test app from 1C. Test 6 key controllers: DigitalProductsController (GET listing with pagination/filters returns 200, GET by slug returns product or 404, POST requires auth + seller role), CartController (POST /items adds item, DELETE /items/:id removes, GET returns cart with totals), CheckoutController (POST /sessions requires auth, returns Stripe session URL), ReviewsController (POST requires auth + purchase, returns 201), SellersController (POST /applications validates DTO, returns 201), UsersController (GET /me returns profile, PUT /me updates). Verify response shapes match DTOs, auth guards reject unauthenticated requests with 401, role guards reject unauthorized with 403, validation pipes reject malformed bodies with 400.

### 1F. Guard Unit Tests
Create `apps/backend/src/common/guards/__tests__/` with tests for `JwtAuthGuard` (valid token passes, expired token rejects, missing token rejects), `RolesGuard` (correct role passes, incorrect rejects, handles multiple roles), `PermissionsGuard` (granular permission check), `ContentAccessGuard` (subscription-based content gating).

## 2. FRONTEND TESTING (Vitest + React Testing Library)

### 2A. Enhance Vitest Configuration
Update `apps/frontend/vitest.config.ts`: add `coverage: { provider: 'v8', reporter: ['text', 'lcov', 'html'], reportsDirectory: './coverage', thresholds: { statements: 60, branches: 50, functions: 55, lines: 60 } }`. Ensure path aliases include all entries used in the codebase (`@/lib`, `@/hooks`, `@/components`, `@/providers`, `@/types`, `@/app`, `@/i18n`).

### 2B. Enhanced Test Setup
Update `apps/frontend/vitest.setup.tsx`: add a `customRender` wrapper exported from `apps/frontend/__tests__/utils/render.tsx` that wraps components in `QueryClientProvider` (with a fresh `QueryClient({ defaultOptions: { queries: { retry: false } } })`), `ThemeProvider`, and `NextIntlClientProvider`. Add mocks for `next/image` (render as `<img>`), `next/link` (render as `<a>`), `framer-motion` (render children without animation). Export `createMockRouter()` helper.

### 2C. Component Tests
Create test files colocated as `__tests__/*.test.tsx` next to each component:
- **ProductCard**: renders title, formatted price, image, average rating stars; fires onClick/navigation; shows "Free" badge for price 0; shows sale badge when discount active.
- **CartDrawer**: renders empty state; renders items with quantities; coupon input applies valid coupon and shows discount; remove button removes item; total updates correctly.
- **ReviewForm**: star rating interaction (click 4th star sets rating to 4); textarea validation (rejects empty, enforces min length); submission calls API hook; shows success toast.
- **StoreListingClient**: renders product grid; filter by category updates displayed products; sort by price reorders; search filters by title; shows empty state message; pagination controls navigate.
- **ComparisonTable**: renders selected products in columns; highlights best value; shows feature differences; removal button works.
- **CouponInput**: validates coupon format; shows success on valid; shows error on invalid/expired; applies discount to display.

### 2D. Hook Tests
Use `renderHook` from `@testing-library/react` with the custom wrapper. Mock `fetch` or TanStack Query's `queryClient`:
- **useCart**: add item increments count, remove item decrements, merge persists to server, localStorage sync works.
- **useDigitalProducts**: returns loading then data, caches results, error state on network failure.
- **useReviews**: fetches paginated reviews, createReview invalidates cache, voteOnReview toggles state.
- **usePromotions**: validateCoupon returns discount, flash sale countdown decrements, expired coupon returns error.

### 2E. Accessibility Tests
Using `jest-axe` (already installed) with the existing `vitest.setup.tsx` `toHaveNoViolations` matcher, add accessibility test blocks to every interactive component test: `it('has no accessibility violations', async () => { const { container } = render(<Component />); expect(await axe(container)).toHaveNoViolations(); })`. Prioritize: ProductCard, CartDrawer, ReviewForm, StoreListingClient, navigation components, all form components.

## 3. E2E TESTING (Playwright)

### 3A. Configuration
Install `@playwright/test` at the monorepo root. Create `apps/frontend/playwright.config.ts`: projects for chromium, firefox, webkit; add mobile viewport project (iPhone 14, 390x844); `use: { baseURL: 'http://localhost:3000', screenshot: 'only-on-failure', video: 'retain-on-failure', trace: 'retain-on-failure' }`; `webServer: { command: 'npm run dev --prefix apps/frontend', port: 3000, reuseExistingServer: true }`.

### 3B. Page Object Model
Create `apps/frontend/e2e/pages/` with classes: `StorePage` (goto, filterByCategory, sortBy, searchFor, getProductCards, getProductByIndex), `ProductPage` (goto by slug, getTitle, getPrice, clickAddToCart, getReviews, submitReview), `CartPage` (open drawer, getItems, getTotal, applyCoupon, removeItem, proceedToCheckout), `CheckoutPage` (fillStripeTestCard, submit, waitForSuccess), `AccountPage` (gotoOrders, getOrderRows, clickDownload), `SellerDashboardPage` (gotoProducts, gotoEarnings, getAnalyticsSummary).

### 3C. Critical User Flows (10 E2E Tests)
Create `apps/frontend/e2e/tests/` with these test files:
1. `purchase-flow.spec.ts` -- Browse store, filter by category, view product detail, add to cart, complete checkout with Stripe test card `4242424242424242`.
2. `auth-and-purchase.spec.ts` -- Register new user, login, browse, purchase, verify order in account, download.
3. `seller-flow.spec.ts` -- Register as seller, submit application, upload product, verify listing appears in store.
4. `review-moderation.spec.ts` -- Submit review on purchased product, admin moderates, verify review appears on product page.
5. `coupon-checkout.spec.ts` -- Apply coupon code in cart, verify discount reflected, complete checkout at discounted price.
6. `mobile-purchase.spec.ts` -- Complete full purchase flow on 390px mobile viewport, verify responsive layout.
7. `search-and-filter.spec.ts` -- Search products by keyword, filter by category, sort by price ascending, verify display order.
8. `free-download.spec.ts` -- Find a free product, download without payment, verify file access.
9. `account-management.spec.ts` -- View order history, download purchased products, view and manage license keys.
10. `seller-dashboard.spec.ts` -- Seller views analytics summary, manages product listings, views earnings breakdown.

### 3D. Test Data Management
Create `apps/frontend/e2e/fixtures/seed.ts` that calls backend API endpoints (or directly seeds via a test-only API route) to create test users (buyer, seller, admin), test products (free, paid, discounted), test coupons, and test orders. Use unique identifiers per test run (append `Date.now()`). Create teardown script that cleans up test data after the suite.

## 4. VISUAL REGRESSION (Playwright Screenshots + Argos CI)

Install `@argos-ci/playwright` as a devDependency. Add `argosScreenshot(page, 'name')` calls in a dedicated `apps/frontend/e2e/visual/` directory. Capture 15 states: homepage (light + dark), store listing (empty, populated, filtered), product detail page, cart drawer (empty, with items), checkout success, account orders page, seller dashboard, review form, store on mobile 390px viewport, pricing page. Create `apps/frontend/e2e/visual/visual-regression.spec.ts` that navigates to each state and captures. Configure Argos in CI to compare against the `main` branch baseline on every PR.

## 5. LOAD TESTING (k6)

Create `apps/backend/load-tests/` directory. Install k6 locally or use the Docker image in CI. Create these scripts:
- `browse-store.js`: GET `/api/v1/digital-products?page=1&limit=20` with filters, assert `p(95) < 500ms`.
- `product-detail.js`: GET `/api/v1/digital-products/:slug` for 10 different slugs, assert `p(95) < 300ms`.
- `cart-operations.js`: POST `/api/v1/cart/items`, GET `/api/v1/cart`, DELETE `/api/v1/cart/items/:id`.
- `checkout-flow.js`: POST `/api/v1/checkout/sessions` (authenticated), assert `p(95) < 800ms`.
- `reviews-read.js`: GET `/api/v1/reviews/product/:id?page=1` for high-traffic products.

Each script uses a `ramping-vus` scenario: ramp 0 to 100 VUs over 5 minutes, hold 100 VUs for 10 minutes, ramp down over 2 minutes. Thresholds: `http_req_duration{p(95)}: ['<500']`, `http_req_failed`: `['rate<0.01']`, `http_reqs`: `['rate>50']`. Create `apps/backend/load-tests/run.sh` that executes all scripts sequentially and outputs results to `load-tests/results/`.

## 6. TEST INFRASTRUCTURE & CI INTEGRATION

### 6A. NPM Scripts
Add to root `package.json`: `"test": "turbo run test"`, `"test:e2e": "npx playwright test --config apps/frontend/playwright.config.ts"`, `"test:coverage": "turbo run test:coverage"`, `"test:load": "cd apps/backend/load-tests && ./run.sh"`. Add to `apps/backend/package.json`: `"test:integration": "jest --config test/jest-integration.json --runInBand"`. Add to `apps/frontend/package.json`: `"test:e2e": "playwright test"`, `"test:visual": "playwright test e2e/visual/"`.

### 6B. CircleCI Pipeline Update
Update `.circleci/config.yml`: add a `test` job that runs before `build-and-push`. The test job uses `cimg/node:20.11` image with a PostgreSQL service container (`cimg/postgres:16`), runs `npm ci`, then runs `npm run test -- --filter=backend`, `npm run test -- --filter=frontend`, and `npm run test:e2e` (with Playwright browsers installed). Add the `test` job as a `requires` dependency for all three `build-and-push` jobs. Add a separate `load-test` job triggered by a weekly cron schedule (`triggers: - schedule: cron: "0 6 * * 1"`) that runs the k6 scripts and stores results as artifacts.

### 6C. Coverage Thresholds
Backend: set in `jest` config: `coverageThreshold: { global: { statements: 60, branches: 50, functions: 55, lines: 60 } }`. Frontend: already set in vitest config from step 2A. Increment thresholds by 5% each quarter until reaching 80%.

### 6D. Pre-commit Hook (Recommendation)
Document in the PR description (do NOT auto-install): suggest using `lint-staged` + `husky` to run `vitest run --changed` on staged `.ts`/`.tsx` files and `jest --findRelatedTests` for backend changes before each commit.

## Execution Order

1. Backend factories and test utilities (1B, 1C) -- foundation everything else depends on.
2. Backend service unit tests (1D) -- highest risk, most business logic.
3. Frontend vitest config enhancement and test setup (2A, 2B).
4. Frontend component and hook tests (2C, 2D, 2E).
5. Backend controller integration tests and guard tests (1E, 1F).
6. Backend TestContainers database integration (1A).
7. Playwright E2E setup and critical flows (3A, 3B, 3C, 3D).
8. Visual regression (4).
9. Load testing (5).
10. CI pipeline and npm scripts (6A, 6B, 6C).

Do NOT modify any existing application code or business logic. All work is additive: new test files, new config files, new CI stages. Ensure every test file you create actually passes by running it before moving to the next section.
