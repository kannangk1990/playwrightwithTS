---
name: Heal Failure
description: Diagnose and repair an evidence-backed Playwright test failure using its artifacts and source code.
agent: Playwright Healer
---

Diagnose and repair the Playwright failure described by the user.

Test file or command: ${input:test:narrowest failing test file or command}
Failure summary: ${input:failure:error message or failure summary}
Artifacts: ${input:artifacts:trace, screenshot, video, HTML report, or Allure path if available}

Reproduce the failure with the narrowest command and project possible. Inspect
the error, call log, trace, screenshot or video, relevant source, and artifacts
under test-results, playwright-report, and allure-results when present.

Classify the failure as product, environment, test data, framework, or locator
drift before editing. Fix only the smallest evidence-backed root cause at the
owning abstraction. Do not remove assertions, add blind retries, broaden a
locator without justification, or use waitForTimeout.

Rerun the focused test after the repair, then run:

```bash
npm run typecheck
npm run lint
```

Report the root cause, evidence inspected, files changed, validation commands
and results, and any residual risk. If the failure is environmental or
product-owned, make no speculative code change.