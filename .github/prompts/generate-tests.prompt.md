---
name: Generate Tests
description: Implement an approved Playwright test plan from ADO, Jira, or user-provided acceptance criteria.
agent: Playwright Generator
---

Implement the approved Playwright test plan provided by the user.

Ticket source: ${input:source:ADO, Jira, or none}
Ticket ID or URL: ${input:ticket:ticket ID, URL, or none}
Approved plan or acceptance criteria: ${input:plan:paste the approved plan or acceptance criteria}

If a ticket-system MCP connection is available, use it to verify the ticket
details and acceptance criteria. If the plan or acceptance criteria is missing,
stop and ask the user to provide it. Do not invent requirements.

Inspect the nearest existing tests, fixtures, page objects, component objects,
API clients, and test data before editing. Follow the dependency flow
test -> fixture -> page/component -> Playwright page.

Implement the smallest focused change. Keep business scenarios in tests and UI
behavior in page or component objects. Reuse existing Allure and test-step
conventions.

Run the narrowest relevant test first, then run:

```bash
npm run typecheck
npm run lint
```

Report the requirements covered, files changed, validation commands and results,
and any remaining environmental limitation. Do not weaken assertions, add blind
retries, or use waitForTimeout.