# Architecture & Design

This repository is a TypeScript Playwright framework for authenticated
SauceDemo browser tests. It currently runs UI scenarios in Chromium; it does
not contain an API test client or API test suite.

## Test flow

Playwright uses two projects defined in `playwright.config.ts`:

1. The `setup` project runs `tests/auth.setup.ts`. It signs in with the
   configured SauceDemo credentials and saves browser storage state to
   `playwright/.auth/user.json`.
2. The `chromium` project depends on `setup`, loads that storage state, and
   runs `*.spec.ts` scenarios using a fresh browser context per test.

The configured base URL and credentials come from `src/config/env.ts`. They
can be overridden with `BASE_URL`, `SAUCE_USERNAME`, and `SAUCE_PASSWORD`.
Defaults target the public SauceDemo site and standard demo user.

## Repository structure

```text
src/
├── components/   Reusable UI objects such as the header and product card
├── config/       Environment configuration
├── data/         User credentials and checkout form data
├── fixtures/     Shared Playwright test export and Allure failure attachments
└── pages/        Page objects for login, inventory, cart, and checkout

tests/
├── auth.setup.ts                 Creates the authenticated storage state
├── saucedemo.spec.ts             Authenticated inventory/cart smoke scenarios
└── inventory-checkout.spec.ts    Sort, cart verification, and checkout scenario

playwright.config.ts              Projects, browser settings, and reporters
.github/workflows/                GitHub Actions test and report workflow
```

## Page and component objects

Page objects in `src/pages/` encapsulate selectors and user actions for
individual SauceDemo screens. Reusable controls shared across screens live in
`src/components/`. Test scenarios use these objects where available and keep
assertions close to the behavior being verified.

The inventory checkout scenario sorts products by ascending price, captures
the first three products' names and descriptions, adds those products, checks
the cart badge and ordered cart contents, and completes checkout using data
from `src/data/checkout.ts`.

## Shared test fixture

Application test files import `test` and `expect` from
`src/fixtures/test.ts`. The shared fixture captures browser console messages
and, when a test fails, attaches available screenshots, page source, console
messages, and Playwright attachments to the Allure result. The authentication
setup imports Playwright's `test` and `expect` directly because it creates the
saved browser state used by the Chromium project.

## Configuration and commands

Run commands from the repository root:

```bash
npm test
npm run test:chromium
npm run test:ui
npm run test:smoke
npx playwright test tests/inventory-checkout.spec.ts --project=chromium
npm run typecheck
npm run lint
npm run format:check
```

The configured reporters are Playwright's list reporter, HTML reporter, and
Allure. Playwright writes HTML output to `playwright-report`; Allure writes raw
results to `allure-results`.

```bash
npm run report:html
npm run report:allure
```

Allure's report generation cleans the generated `allure-report`, but retains
raw results from previous runs. To view only the most recent run, remove
`allure-results` before executing the tests:

```bash
rm -rf allure-results
npx playwright test --project=chromium
npm run report:allure
```

## Continuous integration

The GitHub Actions workflow in `.github/workflows/playwright.yml` runs on
pushes and pull requests targeting `main` or `master`. It installs Node 22,
dependencies, and Playwright browsers; runs typecheck and Playwright tests;
then uploads Playwright and Allure reports and diagnostics as workflow
artifacts.
