# Playwright Test Framework

[![Playwright Tests](https://github.com/kannangk1990/playwrightwithTS/actions/workflows/playwright.yml/badge.svg)](https://github.com/kannangk1990/playwrightwithTS/actions)

A TypeScript Playwright framework for UI and API testing with production-grade patterns: page object modeling, fixture-based dependency injection, cross-browser execution, and automated CI/CD.

Built against [Sauce Demo](https://www.saucedemo.com/) to demonstrate real-world testing architecture and best practices.

## Quick Start

```bash
npm install
npm test                    # Run all tests (Chromium, Firefox, WebKit)
npm run test:chromium       # Fast local feedback
npm run test:headed         # Watch the browser
npm run test:debug          # Playwright Inspector
npm run typecheck           # TypeScript validation
npm run report:allure       # View Allure test report
```

## What's Inside

### Architecture

This framework demonstrates **production-grade patterns**:

- **Page Object Model (POM)**: Encapsulates UI locators and business actions per screen
- **Component Object Model (COM)**: Reusable widget compositions for repeated UI patterns
- **Fixture-based Dependency Injection**: Tests request ready-to-use fixtures rather than managing setup
- **Environment Configuration**: Credentials and URLs managed externally, not hardcoded
- **Cross-browser Testing**: Runs on Chromium, Firefox, and WebKit in parallel
- **Authentication State**: Reuses authenticated session across tests via Playwright's `storageState`
- **Allure Reporting**: Rich visual reports with steps, attachments, and failure diagnostics

### Project Structure

```
src/
  api/        Reusable HTTP client for API testing
  components/ Reusable widget object models (HeaderComponent, etc.)
  data/       Test identities, fixtures, and environment overrides
  fixtures/   Composition root: creates and injects page objects
  pages/      Page object models for screens (LoginPage, InventoryPage, etc.)
  
tests/        Business-readable test scenarios using fixtures

.github/
  workflows/  CI/CD pipeline (playwright.yml)
  agents/     VS Code Copilot agents for test generation and healing
  prompts/    Reusable prompts for test planning and automation
```

### Dependency Injection Pattern

Tests request high-level capabilities; fixtures handle composition:

```text
test
├─ authenticatedInventoryPage (fixture)
│  ├─ loginPage (via page fixture)
│  ├─ inventoryPage (via page fixture)
│  └─ headerComponent (composed inside inventoryPage)
└─ page (Playwright base fixture)
```

A test writes: `test('find product', async ({ authenticatedInventoryPage }) => { ... })`

The fixture orchestrates: navigate → login → verify readiness → return page object.

Each test gets a fresh browser context; no global state.

## Commands

```bash
# Local Testing
npm test                  # All browsers, all tests
npm run test:chromium     # Chromium only (fastest)
npm run test:headed       # Headed mode (see the browser)
npm run test:debug        # Playwright Inspector (step through)
npm run test:api          # API smoke tests only
npm run test:smoke        # @smoke tagged tests
npm run test:ui           # @ui tagged tests
npm run test:regression   # @regression tagged tests

# Code Quality
npm run typecheck         # TypeScript validation
npm run lint              # ESLint
npm run format:check      # Prettier (check only)
npm run format            # Prettier (auto-fix)

# Reporting
npm run report:html       # Open Playwright HTML report
npm run report:allure     # Build and open Allure report
```

## Environment Configuration

Override test environment without changing code:

```bash
# Run against different URL/credentials
BASE_URL=https://staging.example.com \
SAUCE_USERNAME=standard_user \
SAUCE_PASSWORD=secret_sauce \
npm run test:chromium

# API testing
API_BASE_URL=https://api.example.com npm run test:api
```

See `.env.example` for available variables.

## CI/CD Pipeline

Tests run automatically on every push and pull request via GitHub Actions:

- **Trigger**: Push to `main`/`master`, or open a PR
- **Environment**: Ubuntu Linux, Node 22
- **Steps**:
  1. Install dependencies (`npm ci`)
  2. Install Playwright browsers
  3. Run TypeScript type checking
  4. Execute all tests in parallel
  5. Generate Allure report
  6. Upload artifacts (test results, videos, traces) for 30 days
  7. Generate Playwright HTML report

**Artifacts preserved on failure**: Video recordings, test traces, and Allure results help diagnose flaky or failing tests without rerunning.

See `.github/workflows/playwright.yml` for full configuration.

## How to Extend It

### Adding a New Test

```typescript
// 1. Create page object for new screen
// src/pages/CheckoutPage.ts
export class CheckoutPage {
  constructor(private page: Page) {}
  
  async fillShippingAddress(address: string) {
    await this.page.locator('[data-test="shipping-address"]').fill(address);
  }
}

// 2. Inject into fixtures
// src/fixtures/index.ts
export type AppFixtures = {
  loginPage: LoginPage;
  checkoutPage: CheckoutPage;
};

// 3. Write test using fixture
// tests/checkout.spec.ts
test('complete purchase', async ({ authenticatedInventoryPage, checkoutPage }) => {
  await test.step('add to cart', async () => {
    await authenticatedInventoryPage.addProductToCart('Backpack');
  });
  
  await test.step('proceed to checkout', async () => {
    await authenticatedInventoryPage.proceedToCheckout();
  });
  
  await test.step('fill shipping', async () => {
    await checkoutPage.fillShippingAddress('123 Main St');
  });
});
```

### Best Practices

- **Pages contain locators and actions; tests contain assertions and narrative**
- **Use `test.step()` to organize test flow** for better Allure reports
- **Store test data in `src/data/` instead of hardcoding in tests**
- **Reuse fixtures for authenticated flows** rather than repeating login steps
- **Tag tests** with `@smoke`, `@ui`, `@regression` for selective execution

## Playwright MCP Agents

This workspace includes AI-powered VS Code agents under `.github/agents`:

- **Playwright Planner** — Analyzes requirements and existing framework patterns, creates a coverage plan
- **Playwright Generator** — Implements approved plans using fixtures, page objects, and test data
- **Playwright Healer** — Diagnoses failures from Playwright/Allure artifacts, proposes fixes

Reusable prompts in `.github/prompts`:

- `/Analyze Ticket` — Parse ADO/Jira ticket, create test plan
- `/Generate Tests` — Implement acceptance criteria using existing patterns
- `/Heal Failure` — Diagnose and fix failing tests with evidence

**Recommended workflow**: Plan → Generate → Heal → Review before merge.

## Stack

- **Language**: TypeScript (97.9%) + JavaScript (2.1%)
- **Framework**: Playwright Test (v1.62+)
- **Reporting**: Allure + Playwright HTML reporter
- **Code Quality**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Dev Tools**: VS Code with Playwright MCP agents

## License

ISC
