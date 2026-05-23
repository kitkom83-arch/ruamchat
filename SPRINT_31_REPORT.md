# Sprint 31 FINAL PASS

Conversation Search + Filters API Mode Persistence.

## Summary

Inbox conversation search, filters, sorting, pagination, and platform/account/room scoped conversation listing now run through backend API mode with tenant-scoped persisted data and no silent mock fallback.

## Root cause / risk addressed

The inbox API mode conversation list already existed, but the UI search box was only placeholder-like and API-mode filters were not fully driven by backend persisted query results. Room DTOs also did not expose `channelAccountId`, which made platform/account filter round-tripping incomplete.

Sprint 31 hardened the inbox query path so search/filter/sort state is sent to backend APIs with `x-tenant-id`, and returned conversation rows preserve platform/account/room identity.

## Final fixes

- Added API-mode conversation search query state.
- Added API-mode status, priority, read, SLA, agent, sort, and practical filter wiring.
- Added safe backend query parsing for conversation filters.
- Preserved room context for conversation list queries.
- Added `channelAccountId` to safe `/rooms` DTO output.
- Added frontend empty/error/loading behavior for API-mode search/filter results.
- Prevented API mode from silently falling back to mock/local conversations when API fails.
- Preserved mock/local mode behavior.
- Added Sprint 31 smoke script.

## Changed files

- apps/api/src/controllers/conversations.controller.ts
- apps/api/src/controllers/rooms.controller.ts
- apps/api/src/controllers/rooms.controller.test.ts
- apps/api/src/services/conversation.service.ts
- apps/api/src/services/conversation.service.test.ts
- apps/web/app/api-client.ts
- apps/web/app/api-client.test.ts
- apps/web/app/globals.css
- apps/web/app/inbox-data.ts
- apps/web/app/inbox-data.test.ts
- apps/web/app/page.tsx
- scripts/smoke-sprint31-api.mjs
- package.json

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed, 34 test files / 300 tests.
- `npm run build`: passed.
- `npm run smoke:sprint31`: passed, 24/24 checks.
- Smoke hit local API only at `http://localhost:4000`.
- Smoke confirmed `GET /health`.
- Smoke confirmed `GET /rooms`.
- Smoke confirmed conversation list with no filters.
- Smoke confirmed search keyword query.
- Smoke confirmed platform filter.
- Smoke confirmed status filter.
- Smoke confirmed priority filter.
- Smoke confirmed pagination limit.
- Smoke confirmed impossible filter returns empty API state.
- Smoke confirmed impossible filter does not return mock fallback.
- Smoke confirmed required separated conversation fields:
  - conversation id
  - platform
  - channelAccountId
  - roomId
- Smoke confirmed conversations were not collapsed across platform/account/room.
- Smoke confirmed no token/secret fields.
- Smoke confirmed `externalCalls: 0`.
- Smoke confirmed no provider outbound.

## Manual UI verification

Completed at:

http://localhost:3012

API-on verified:

- Inbox loaded persisted conversations from API.
- API mode badge showed connected API mode.
- Search `visitor-smoke` returned the matching persisted conversation only.
- Impossible search `zzzz-sprint31-no-match` showed empty API result.
- Impossible search did not fall back to mock/local conversations.
- Status `follow_up` and priority `high` filters returned the matching persisted conversation.
- Switching to `LINE / LINE OA Main` preserved platform/account/room separation and did not mix Webchat conversations.
- Customer 360 did not crash.
- No token/secret text visible.
- No provider outbound observed.

API-off verified:

- API on port 4000 was stopped.
- Web was refreshed.
- Inbox showed `Failed to fetch`.
- Conversation list showed empty/API error state.
- No mock/local conversations appeared as silent fallback.
- Canned replies also showed expected API-off fetch error.
- Customer 360 showed no selected customer state instead of fake fallback data.

## Safety

- No real LINE / Telegram / Facebook / Instagram outbound observed.
- No external provider calls.
- No OpenAI calls.
- No token/secret exposure.
- externalCalls remained 0.
- Conversation separation preserved by platform + channelAccountId + roomId.
- Search/filter results did not collapse conversations into one cross-platform thread.

## Prisma

- No Prisma schema change.
- No destructive migration.
- No DB reset.

## Git

- Working tree contains Sprint 31 edits.
- No commit made yet.
- `apps/web/next-env.d.ts` was restored and should not be committed.

## Remaining issues

- None for Sprint 31.
- API was intentionally stopped for API-off verification.
