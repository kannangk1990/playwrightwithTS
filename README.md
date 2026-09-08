# Playwright Test Framework

A TypeScript Playwright framework for UI and API testing.

Includes page objects, reusable fixtures, API clients, authentication state, cross-browser tests, environment settings, Allure reports, CI checks, linting, and formatting.

This is a small production-style framework built against [Sauce Demo](https://www.saucedemo.com/). It demonstrates page object modeling, fixture-based dependency injection, environment configuration, test isolation, and Allure reporting without hiding the important Playwright concepts.

## Project shape

```text
src/
  components/ Reusable widgets composed inside pages (COM)
  data/       Test identities and environment overrides
  fixtures/   The composition root: creates and injects page objects
  api/        Reusable API request client
  pages/      UI behavior and locators, never test assertions about journeys
tests/        Business-readable scenarios composed from fixtures
```

The dependency flow is:

```text
test -> authenticatedInventoryPage -> loginPage + inventoryPage -> headerComponent -> page
test -> cartPage -> page
test -> checkoutPage -> page
```

`authenticatedInventoryPage` is the DI example. A test asks for a ready-to-use capability; the fixture handles navigation, login, and the page readiness check. Each test still receives a fresh Playwright `page`, so browser state remains isolated.

## POM and COM

Use a **Page Object Model** class for a route or screen, such as `InventoryPage`. Use a **Component Object Model** class for a reusable widget, such as `HeaderComponent` or `ProductCardComponent`. Components accept either the shared `Page` or a scoped `Locator`, which lets the same component be safely reused on multiple screens without leaking selectors into tests.

The fixture creates `HeaderComponent` once per test and injects it into `InventoryPage`. `InventoryPage` creates a scoped `ProductCardComponent` for the selected product. This is composition: pages describe screens, components describe widgets, and tests describe business intent.

## Commands

```bash
npm test                  # Chromium, Firefox, and WebKit
npm run test:chromium     # Fast local feedback
npm run test:headed       # Watch the browser
npm run test:debug        # Playwright Inspector
npm run test:api           # API smoke tests
npm run typecheck          # TypeScript validation
npm run report:html       # Open the Playwright HTML report
npm run report:allure     # Build and open the Allure report
```

The default credentials are the public Sauce Demo credentials. Override them for another environment without changing source code:

```bash
BASE_URL=https://www.saucedemo.com \
SAUCE_USERNAME=standard_user \
SAUCE_PASSWORD=secret_sauce \
npm run test:chromium

API_BASE_URL=https://your-api.example.com npm run test:api
```

## How to extend it

1. Add a page class under `src/pages` with role-first locators and business actions.
2. Add it to `AppFixtures` and initialize it from the shared `page` fixture.
3. Add domain data under `src/data` rather than embedding credentials in tests.
4. Compose the scenario in `tests` with `test.step` and Allure labels.

## Playwright MCP agents

This workspace includes three focused VS Code custom agents under `.github/agents`:

- **Playwright Planner** creates a coverage plan from requirements and existing framework capabilities.
- **Playwright Generator** implements the approved plan using the existing fixtures, page objects, components, and test data.
- **Playwright Healer** diagnoses failures from Playwright and Allure artifacts before making evidence-backed repairs.

The Playwright MCP server is registered in `.vscode/mcp.json`. VS Code downloads `@playwright/mcp` on demand through `npx`; it provides browser inspection and interaction tools to the agents, while the repository's own Playwright CLI remains responsible for test execution and reporting.

Recommended flow: run **Playwright Planner**, hand off to **Playwright Generator**, then hand off to **Playwright Healer** after the focused test run. Review generated or healed code before merging it.
The page classes intentionally keep assertions close to the UI they describe, while the test owns the business narrative. This makes failures local and keeps tests readable as the application grows.
