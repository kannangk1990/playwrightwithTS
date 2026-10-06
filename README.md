# Playwright Test Framework

[![Playwright Tests](https://github.com/kannangk1990/playwrightwithTS/actions/workflows/playwright.yml/badge.svg)](https://github.com/kannangk1990/playwrightwithTS/actions)

A TypeScript Playwright framework for authenticated SauceDemo UI testing with page and component objects, reusable test data, Allure reporting, and automated CI/CD.

Built against [SauceDemo](https://www.saucedemo.com/) to demonstrate
authenticated browser testing with Playwright `storageState`.

## Quick Start

```bash
npm install
npm test                    # Run SauceDemo UI tests in Chromium
npm run test:chromium       # Run tests in Chromium
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
- **Shared Test Fixture**: Adds failure diagnostics to Allure test results
- **Environment Configuration**: Credentials and URLs managed externally, not hardcoded
- **Browser Testing**: Runs SauceDemo UI scenarios in Chromium
- **Authentication State**: Reuses authenticated session across tests via Playwright's `storageState`
- **Allure Reporting**: Rich visual reports with steps, attachments, and failure diagnostics

### Project Structure

```
src/
  components/ Reusable widget object models (HeaderComponent, etc.)
  data/       Test identities and checkout data
  fixtures/   Shared Playwright test fixture and failure attachments
  pages/      Page object models for screens (LoginPage, InventoryPage, etc.)
  config/     Environment configuration

tests/        Auth setup and SauceDemo UI scenarios

.github/
  workflows/  CI/CD pipeline (playwright.yml)
  agents/     VS Code Copilot agents for test generation and healing
  prompts/    Reusable prompts for test planning and automation
```

### Authentication and test fixture

The setup project signs in once and saves browser storage state. The Chromium
project loads that state for each UI test:

```text
test
├─ setup project logs in and saves playwright/.auth/user.json
└─ chromium project loads that storage state for each UI test
```

Each test gets a fresh browser context; no global browser state is shared.

### Test imports

Application tests must import `test` and `expect` from the shared fixture:

```typescript
import { test, expect } from '../src/fixtures/test';
```

This provides failure attachments to Allure for unsuccessful tests.
`tests/auth.setup.ts` imports directly from `@playwright/test` because it creates
the saved authentication state required by the browser tests.

## Commands

```bash
# Local Testing
npm test                  # SauceDemo UI tests
npm run test:chromium     # Chromium only
npm run test:headed       # Headed mode (see the browser)
npm run test:debug        # Playwright Inspector (step through)
npm run test:ui           # @ui tagged tests
npx playwright test tests/inventory-checkout.spec.ts --project=chromium
                           # Focused sort, cart, and checkout scenario

# Code Quality
npm run typecheck         # TypeScript validation
npm run lint              # ESLint
npm run format:check      # Prettier (check only)
npm run format            # Prettier (auto-fix)

# Reporting
npm run report:html       # Open Playwright HTML report
npm run report:allure     # Build and open Allure report
```

Allure results are written to `allure-results`. To report only the latest run,
remove old results before running tests:

```bash
rm -rf allure-results
npx playwright test --project=chromium
npm run report:allure
```

## Environment Configuration

Override test environment without changing code:

```bash
# SauceDemo UI testing
BASE_URL=https://www.saucedemo.com \
SAUCE_USERNAME=standard_user \
SAUCE_PASSWORD=secret_sauce \
npm test
```

See `.env.example` for available variables.

The authentication setup logs into SauceDemo and saves
`playwright/.auth/user.json`. The Chromium project loads that file as
`storageState`, so each UI test starts with the authenticated session.

## CI/CD Pipeline

Tests run automatically on every push and pull request via GitHub Actions:

- **Trigger**: Push to `main`/`master`, or open a PR
- **Environment**: Ubuntu Linux, Node 22
- **Steps**:
  1. Install dependencies (`npm ci`)
  2. Install Playwright browsers
  3. Run TypeScript type checking
  4. Execute the configured Playwright tests
  5. Generate Allure report
  6. Upload artifacts (test results, videos, traces) for 30 days
  7. Generate Playwright HTML report

**Artifacts preserved on failure**: Video recordings, test traces, and Allure results help diagnose flaky or failing tests without rerunning.

See `.github/workflows/playwright.yml` for full configuration.

## How to Extend It

### Adding a New Test

```typescript
import { expect, test } from '../src/fixtures/test';

test('opens the authenticated inventory', { tag: '@ui' }, async ({ page }) => {
  await page.goto('/inventory.html');
  await expect(page.getByText('Products', { exact: true })).toBeVisible();
});
```

### Best Practices

- **Tests contain assertions and business-readable scenarios**
- **Use `test.step()` to organize test flow** for better Allure reports
- **Tag UI tests** with `@ui` or `@smoke` for selective execution

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
