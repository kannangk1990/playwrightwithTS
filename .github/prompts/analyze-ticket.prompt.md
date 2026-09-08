---
name: Analyze Ticket
description: Analyze an Azure DevOps or Jira ticket and create a Playwright implementation plan without editing files.
agent: Playwright Planner
---

Analyze the ticket identified by the user.

Ticket source: ${input:source:ADO or Jira}
Ticket ID or URL: ${input:ticket:ticket ID or URL}

Use the connected ticket-system MCP tools when available to retrieve the ticket title,
description, acceptance criteria, comments, linked requirements, and relevant
status information. If the MCP connection is unavailable, ask the user to paste
the ticket details instead of inventing requirements.

Inspect this repository's README, Playwright configuration, relevant fixtures,
page objects, component objects, API clients, test data, and nearby tests.

Do not edit files or run tests. Return:

- Ticket summary and assumptions
- Acceptance criteria extracted from the ticket
- Coverage matrix with proposed test names and tags
- Existing framework objects and fixtures to reuse
- Missing objects, data, or environment dependencies
- Validation commands
- Open questions or ambiguities that block reliable automation

Treat the ticket as the source of truth. Do not invent selectors, API contracts,
credentials, or acceptance criteria.