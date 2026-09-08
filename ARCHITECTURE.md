# Architecture & Design Decisions

This document explains the framework's structure, why architectural choices were made, and how to extend it while maintaining consistency.

## Design Philosophy

This framework prioritizes:

1. **Testability** — Tests describe business scenarios, not implementation details
2. **Maintainability** — Changes to the application require minimal test updates
3. **Reusability** — Common patterns (page objects, fixtures) avoid duplication
4. **Clarity** — Code reads like requirements, not technical noise
5. **CI/CD Integration** — Built to run reliably in automated environments

---

## Core Patterns

### 1. Page Object Model (POM)

**What it is**: A class that represents a screen/route and encapsulates:
- UI locators (selectors for buttons, inputs, etc.)
- User actions (click, fill, navigate)
- Business-level methods (addToCart, checkout)

**Why we use it**:
- **Locator changes stay local** — If a button selector changes, update it in one place, not 50 tests
- **Tests become narrative** — `await cartPage.proceedToCheckout()` reads like a business step
- **Reusability** — Multiple tests use the same page object without duplication
- **Separation of concerns** — Tests don't know *how* to find elements, only *what* to do

**Example**:

```typescript
// ✅ Good: Page object encapsulates locators
export class LoginPage {
  constructor(private page: Page) {}
  
  async login(username: string, password: string) {
    await this.page.locator('[data-test="username"]').fill(username);
    await this.page.locator('[data-test="password"]').fill(password);
    await this.page.locator('[data-test="login-btn"]').click();
    await this.page.waitForURL('**/inventory');
  }
}

// ✅ Good: Test uses business-level method
test('user can log in', async ({ loginPage }) => {
  await loginPage.login('standard_user', 'secret_sauce');
});
```

**Anti-pattern**:

```typescript
// ❌ Bad: Locators leak into tests
test('user can log in', async ({ page }) => {
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-btn"]').click();
});
```

### 2. Component Object Model (COM)

**What it is**: A lightweight object for **reusable UI widgets** (header, product card, sidebar).

**Why separate from POM**:
- Pages are **singular screens** (LoginPage, InventoryPage)
- Components are **repeated patterns** (any ProductCard, HeaderComponent)
- Components are **composed into pages** — InventoryPage creates ProductCard instances as needed

**Example**:

```typescript
// Component: reusable widget
export class ProductCard {
  constructor(private page: Page, private productName: string) {}
  
  async addToCart() {
    await this.page
      .locator(`[data-test="product-${this.productName}"] >> [data-test="add-to-cart"]`)
      .click();
  }
}

// Page: composes components
export class InventoryPage {
  private headerComponent: HeaderComponent;
  
  constructor(private page: Page) {
    this.headerComponent = new HeaderComponent(page);
  }
  
  getProductCard(productName: string) {
    return new ProductCard(this.page, productName);
  }
  
  async addProductToCart(productName: string) {
    const card = this.getProductCard(productName);
    await card.addToCart();
  }
}

// Test: uses composed objects
test('add product', async ({ inventoryPage }) => {
  await inventoryPage.addProductToCart('Backpack');
});
```

### 3. Fixture-Based Dependency Injection

**What it is**: Playwright's built-in mechanism for:
- Creating test prerequisites (login, navigate, setup data)
- Injecting them into tests
- Running teardown/cleanup after each test

**Why we use it**:
- **Eliminates repetition** — Don't repeat login/setup in every test
- **Scopes state clearly** — Each test gets a fresh fixture instance
- **Setup is declarative** — Tests request what they need: `({ loginPage, cartPage })`
- **Cleanup is guaranteed** — Even if test fails, fixtures clean up

**Example**:

```typescript
// Define fixture
type AppFixtures = {
  loginPage: LoginPage;
  authenticatedInventoryPage: InventoryPage; // Pre-logged-in
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
    // Cleanup after test (if needed)
  },
  
  authenticatedInventoryPage: async ({ page, loginPage }, use) => {
    // This fixture DEPENDS on loginPage
    await loginPage.login('standard_user', 'secret_sauce');
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.waitForReady();
    await use(inventoryPage);
  },
});

// Test requests what it needs
test('add to cart', async ({ authenticatedInventoryPage }) => {
  // No setup needed — fixture handles login
  await authenticatedInventoryPage.addProductToCart('Backpack');
});
```

**Why this matters**:
- Test only focuses on the scenario
- Setup logic is reusable across tests
- If setup changes, update the fixture once

---

## Directory Structure & Responsibilities

```
src/
├── api/           HTTP client for API testing
├── components/    Reusable widget object models (HeaderComponent, ProductCard)
├── data/          Test identities, fixtures, environment overrides
├── fixtures/      Composition root: instantiates pages, components, and injects them
├── pages/         Page object models for screens (LoginPage, InventoryPage, CartPage)
└── config/        Environment and configuration management

tests/
├── ui/            UI scenario tests (tagged with @ui)
├── api/           API contract/integration tests (tagged with @api)
└── auth.setup.ts  Authentication state setup (runs before all tests)

.github/
├── workflows/
│   └── playwright.yml  CI/CD pipeline (GitHub Actions)
└── agents/        VS Code Copilot agents for test generation and healing
```

### `src/fixtures/index.ts` — The Composition Root

This is where pages and components are instantiated and injected into tests.

```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

type AppFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  authenticatedInventoryPage: InventoryPage;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  
  // Compound fixture: depends on loginPage
  authenticatedInventoryPage: async ({ page, loginPage }, use) => {
    await loginPage.login('standard_user', 'secret_sauce');
    const inventoryPage = new InventoryPage(page);
    await use(inventoryPage);
  },
});
```

**Why separate composition**:
- Tests don't instantiate objects themselves
- Changing how a page is created (e.g., adding a wait) happens in one place
- Dependencies are explicit

### `src/data/` — Test Data, Not Hardcoded

```typescript
// src/data/users.ts
export const testUsers = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  locked: { username: 'locked_out_user', password: 'secret_sauce' },
};

// tests/checkout.spec.ts
test('locked user cannot login', async ({ loginPage }) => {
  await loginPage.login(testUsers.locked.username, testUsers.locked.password);
  await expect(loginPage.errorMessage).toBeVisible();
});
```

**Why**:
- Credentials stay in one place, not scattered across tests
- Easy to override for different environments without editing code
- Test intent is clear (use `testUsers.locked`, not hardcoded strings)

---

## CI/CD Pipeline & Reliability

### Why a CI Pipeline Matters

**CI (Continuous Integration)** automatically runs tests on every code change to catch bugs early.

**In this project**: `.github/workflows/playwright.yml` runs:
1. **On every push to `main`/`master`**
2. **On every pull request**
3. **In a clean Ubuntu environment** (no local dependencies)

### Pipeline Stages (Why Each Exists)

```yaml
name: Playwright Tests
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # Stage 1: Get code
      - uses: actions/checkout@v4
      
      # Stage 2: Setup environment
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      
      # Stage 3: Install dependencies
      - name: Install dependencies
        run: npm ci
      
      # Stage 4: Install browsers (Chromium, Firefox, WebKit)
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      # Stage 5: Type checking (catch errors before tests run)
      - name: Run typecheck
        run: npm run typecheck
      
      # Stage 6: Execute tests
      - name: Run Playwright tests
        run: npx playwright test
      
      # Stage 7: Generate reports (even if tests fail)
      - name: Generate Allure report
        if: ${{ !cancelled() }}
        run: npx allure generate allure-results --clean -o allure-report
      
      # Stage 8: Preserve artifacts for debugging
      - name: Upload test diagnostics
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-diagnostics
          path: |
            test-results/
            allure-results/
            allure-report/
            playwright-report/
          retention-days: 30
```

### Why Each Stage is Critical

| Stage | Why It Matters | What Happens on Failure |
|-------|---|---|
| **Checkout** | Need the code to test | Workflow stops immediately |
| **Setup Node** | Playwright needs Node.js | Can't install dependencies |
| **Dependencies** | Tests depend on libraries | Tests can't run |
| **Browsers** | Playwright needs chromium/firefox/webkit binaries | Tests fail immediately |
| **Type Checking** | Catch TypeScript errors before runtime | Workflow stops (fast feedback) |
| **Tests** | Execute business scenarios | Artifacts are uploaded for investigation |
| **Reports** | Generate Allure/HTML reports for visualization | Even if tests fail, reports show what broke |
| **Artifacts** | Preserve videos/traces/logs | Debugging failures doesn't require rerun |

### Failure Handling Strategy

**The framework handles failures at three levels**:

#### 1. **Test-Level Retries** (Playwright config)

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,  // Retry only in CI
  timeout: 30_000,                   // Individual test timeout
  expect: { timeout: 5_000 },        // Assertion timeout
});
```

**Why**: Network hiccups or timing issues shouldn't fail the build.

#### 2. **Diagnostic Capture** (Video, Trace, Screenshot)

```typescript
// playwright.config.ts
use: {
  screenshot: 'only-on-failure',     // Save screenshot if test fails
  video: 'retain-on-failure',        // Save video for debugging
  trace: 'retain-on-failure',        // Full browser trace (DOM, network, etc.)
},
```

**Why**: When a test fails, artifacts let you replay the failure without reruns.

#### 3. **Artifact Upload & Retention**

```yaml
# .github/workflows/playwright.yml
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}  # Run even if tests fail
  with:
    name: playwright-diagnostics
    path: |
      test-results/
      allure-results/
      allure-report/
      playwright-report/
    retention-days: 30
```

**Why**: Artifacts stay in GitHub for 30 days, so you can investigate without reproducing locally.

### CI Reliability Best Practices Used Here

| Practice | Implementation |
|----------|---|
| **Fail fast on type errors** | `npm run typecheck` before tests run |
| **Deterministic setup** | `npm ci` (exact versions) instead of `npm install` |
| **Isolated browser installs** | `npx playwright install --with-deps` ensures OS dependencies |
| **Single-worker on CI** | `workers: 1` when CI=true; avoids race conditions |
| **Retry on transient failures** | Retries=2 for network-related flakes |
| **Preserve failure evidence** | Video, trace, screenshot on every failure |
| **Report generation always runs** | `if: ${{ !cancelled() }}` generates reports even on failure |
| **Long artifact retention** | 30 days to investigate without rerun |

---

## Data Flow & Test Execution

### Happy Path: Test Runs Successfully

```
1. Test requests fixture: async ({ authenticatedInventoryPage }) =>
   ↓
2. Fixture composition starts:
   - loginPage fixture runs (if not already created)
   - loginPage.login() executes (navigates, fills form, submits)
   - authenticatedInventoryPage fixture receives logged-in page
   ↓
3. Test executes:
   - All business steps use injected fixture
   - No setup code in test itself
   ↓
4. Cleanup runs automatically:
   - Page closes (if needed)
   - Browser context cleaned
   ↓
5. Pass ✅
```

### Failure Path: Test Encounters an Issue

```
1. Test starts
   ↓
2. Assertion fails (e.g., expected button not visible)
   ↓
3. Before cleanup:
   - Screenshot captured: test-results/failure.png
   - Video recorded: test-results/failure.webm
   - Trace captured: test-results/trace.zip (full browser state)
   ↓
4. Fixture cleanup runs anyway
   ↓
5. Artifacts uploaded to GitHub
   ↓
6. Developer opens GitHub Actions > Artifacts
   - Replays video/trace to see what went wrong
   - No need to rerun locally
```

---

## Testing Tiers

This framework supports multiple testing levels:

### UI Tests (High-level scenarios)

```typescript
// tests/ui/checkout.spec.ts
test('user completes purchase', async ({ authenticatedInventoryPage, cartPage, checkoutPage }) => {
  await test.step('add product to cart', async () => {
    await authenticatedInventoryPage.addProductToCart('Backpack');
  });
  
  await test.step('verify cart', async () => {
    await expect(cartPage.itemCount).toContainText('1');
  });
  
  await test.step('complete checkout', async () => {
    await checkoutPage.fillShippingDetails('John', 'Doe', '123 Main St');
    await checkoutPage.submitOrder();
  });
  
  await test.step('confirm success', async () => {
    await expect(checkoutPage.successMessage).toBeVisible();
  });
});
```

**What it tests**: Full user journeys across screens.

### API Tests (Contract/contract testing)

```typescript
// tests/api/products.spec.ts
test('fetch product details', async ({ apiClient }) => {
  const response = await apiClient.get('/products/1');
  
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('name');
  expect(response.body).toHaveProperty('price');
});
```

**What it tests**: API contracts and responses (no browser).

### Component Tests (Isolated widget testing)

```typescript
// tests/ui/components.spec.ts
test('product card displays correctly', async ({ page }) => {
  const card = new ProductCard(page, 'Backpack');
  
  await expect(card.nameLabel).toContainText('Backpack');
  await expect(card.priceLabel).toContainText('$');
  await expect(card.addToCartButton).toBeEnabled();
});
```

**What it tests**: Individual components in isolation.

---

## Extending the Framework

### Adding a New Screen / Page

1. **Create page object** under `src/pages/`

```typescript
// src/pages/CheckoutPage.ts
import { Page, expect } from '@playwright/test';

export class CheckoutPage {
  constructor(private page: Page) {}
  
  async fillShippingDetails(firstName: string, lastName: string, address: string) {
    await this.page.locator('[data-test="first-name"]').fill(firstName);
    await this.page.locator('[data-test="last-name"]').fill(lastName);
    await this.page.locator('[data-test="address"]').fill(address);
  }
  
  async submitOrder() {
    await this.page.locator('[data-test="finish-btn"]').click();
  }
  
  get successMessage() {
    return this.page.locator('[data-test="success-message"]');
  }
}
```

2. **Add to fixtures** in `src/fixtures/index.ts`

```typescript
export const test = base.extend<AppFixtures>({
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});
```

3. **Use in test**

```typescript
// tests/checkout.spec.ts
test('complete purchase', async ({ authenticatedInventoryPage, checkoutPage }) => {
  await authenticatedInventoryPage.proceedToCheckout();
  await checkoutPage.fillShippingDetails('John', 'Doe', '123 Main St');
  await checkoutPage.submitOrder();
});
```

### Adding Test Data

Store in `src/data/` instead of hardcoding:

```typescript
// src/data/products.ts
export const testProducts = {
  backpack: { name: 'Backpack', price: 29.99, sku: 'BACK-001' },
  shirt: { name: 'T-Shirt', price: 15.99, sku: 'TSHIRT-001' },
};

// tests/shopping.spec.ts
test('add backpack to cart', async ({ inventoryPage }) => {
  await inventoryPage.addProductToCart(testProducts.backpack.name);
});
```

---

## Key Takeaways

| Concept | Benefit |
|---------|---------|
| **POM** | Tests read like business requirements, not technical noise |
| **COM** | Reuse repeated widgets without duplication |
| **Fixtures** | Setup/teardown is automatic and scoped |
| **Data separation** | Credentials/URLs managed externally; tests stay clean |
| **CI/CD** | Automated testing on every change catches bugs early |
| **Failure capture** | Videos/traces preserve evidence without rerunning |
| **Multi-tier testing** | UI + API testing in one framework |

This architecture prioritizes **maintainability** and **clarity** — the most valuable traits in test automation.
