# Sprint 19 Report

Date: 2026-05-22 (Asia/Bangkok)

## Result

Final PASS.

Sprint 19 Flow Builder API mode was verified end-to-end through rendered UI, manual API smoke, typecheck, test, and production build.

## Rendered UI Verification

Target: `http://localhost:3012/flows` with `.env.local` API mode (`NEXT_PUBLIC_DATA_MODE=api`, `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`).

Browser checks:
- Page identity: PASS, `/flows`, title `AI Omnichannel Chat Rooms`.
- Not blank: PASS, rendered Flow Builder content and API-mode flow list.
- Framework overlay: PASS, no Next.js error overlay.
- Console health: PASS, no relevant `error` or `warn` logs during API-mode checks.
- Screenshot evidence: PASS, Browser visible screenshots captured for API mode and interaction states. One `Page.captureScreenshot` path was intermittently slow, so visible CUA screenshots and DOM snapshots were used as evidence.
- Interaction proof: PASS.

API-mode UI flow checks:
- `/flows` loads API persisted flows: PASS.
- Create flow works: PASS, created `Sprint 19 UI flow 628332`.
- Update flow works: PASS, updated to `Sprint 19 UI flow updated 628332`.
- Duplicate flow works: PASS, duplicated to `Sprint 19 UI flow updated 628332 Copy`.
- Status update `active`: PASS.
- Status update `paused`: PASS.
- Status update `archived`: PASS.
- Test-run returns `dry_run` and `skipped_mock`: PASS. Rendered result showed `Run status dry_run`, `External calls 0`, `send_message / skipped_mock`, and skipped external action `send_message`.
- Refresh keeps persisted data: PASS. Reload kept `Sprint 19 UI flow updated 628332` and archived copy with `runs 1`.
- API error is readable and does not silently fallback to mock: PASS. Temporary API-mode web instance pointed to `http://localhost:4999` rendered `API error` with `Failed to fetch`, kept the API-mode banner, and did not render the mock header or mock data.

Mock-mode check:
- PASS. Temporary mock-mode web instance rendered `Automation rules for separated platform rooms`.
- Browser plugin could not type into the mock form because its virtual clipboard was unavailable, so a headless Playwright fallback was used for the localStorage-specific interaction.
- Created `Sprint 19 mock local flow 371504` in mock mode.
- `localStorage["ai-omni-flow-store-v1"]` contained the new flow after create and after reload.
- API flow count stayed unchanged (`7 -> 7`), confirming mock mode stayed local and did not write through the API.

## Manual API Smoke

Base URL: `http://localhost:4000`

Headers used:

```powershell
@{
  'content-type' = 'application/json'
  'x-user-id' = '00000000-0000-4000-8000-000000000011'
}
```

Commands used:

```powershell
Invoke-RestMethod -Uri "http://localhost:4000/flows" -Method Post -Headers $headers -Body $payload
Invoke-RestMethod -Uri "http://localhost:4000/flows/748bc0aa-3c51-4c9c-8dc5-5a2f4e3bf900" -Method Patch -Headers $headers -Body @{ name = "Sprint 19 manual API flow updated 441270" }
Invoke-RestMethod -Uri "http://localhost:4000/flows/748bc0aa-3c51-4c9c-8dc5-5a2f4e3bf900/duplicate" -Method Post -Headers $headers
Invoke-RestMethod -Uri "http://localhost:4000/flows/7ed41c38-0063-40cf-807d-4229a75173e7/status" -Method Patch -Headers $headers -Body @{ status = "active" }
Invoke-RestMethod -Uri "http://localhost:4000/flows/7ed41c38-0063-40cf-807d-4229a75173e7/status" -Method Patch -Headers $headers -Body @{ status = "paused" }
Invoke-RestMethod -Uri "http://localhost:4000/flows/7ed41c38-0063-40cf-807d-4229a75173e7/test-run" -Method Post -Headers $headers -Body $testRunPayload
Invoke-RestMethod -Uri "http://localhost:4000/flows/7ed41c38-0063-40cf-807d-4229a75173e7/status" -Method Patch -Headers $headers -Body @{ status = "archived" }
Invoke-RestMethod -Uri "http://localhost:4000/flows/7ed41c38-0063-40cf-807d-4229a75173e7/runs" -Method Get -Headers $headers
```

Observed result:

```json
{
  "createdStatus": "draft",
  "updatedName": "Sprint 19 manual API flow updated 441270",
  "duplicateStatus": "draft",
  "activeStatus": "active",
  "pausedStatus": "paused",
  "dryRunStatus": "dry_run",
  "dryRunActions": "send_message:skipped_mock,end:success",
  "externalCalls": 0,
  "skippedExternalActions": "send_message",
  "archivedStatus": "archived",
  "persistedRuns": 1,
  "createdId": "748bc0aa-3c51-4c9c-8dc5-5a2f4e3bf900",
  "copyId": "7ed41c38-0063-40cf-807d-4229a75173e7"
}
```

## Test Results

`npm run typecheck`: PASS.
- `@ai-omni/shared` build passed.
- Workspace typechecks passed for `@ai-omni/shared`, `@ai-omni/api`, `@ai-omni/web`, and `@ai-omni/worker`.
- Next route type generation passed.

`npm test`: PASS.
- Test Files: `24 passed (24)`.
- Tests: `210 passed (210)`.
- Duration: `6.37s`.

`npm run build`: PASS.
- Workspace builds passed for `@ai-omni/shared`, `@ai-omni/api`, `@ai-omni/web`, and `@ai-omni/worker`.
- Next production build compiled successfully.
- Static page generation: `11/11`.
- App routes generated: `/`, `/ai-center`, `/analytics`, `/broadcasts`, `/contacts`, `/flows`, `/_not-found`, `/settings/channels`, `/settings/team`, `/webchat-demo`.

## Changed Files

- `SPRINT_19_REPORT.md`

No source code files were changed for this follow-up. Validation commands may have refreshed generated build artifacts under workspace build output directories.

## Remaining Issues

None blocking.

Notes:
- This workspace is not a Git repository, so changed-file reporting is based on files touched directly during this follow-up rather than `git diff`.
- Verification created demo Flow records and dry-run records in the local API database. Temporary dev-server log and pid files created during verification were removed.
