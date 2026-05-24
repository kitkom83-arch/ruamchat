# Sprint 32 FINAL PASS

Broadcast Opt-out + History API Mode Persistence.

## Summary

Customer 360 Broadcast history and opt-out consent now run through backend API mode with tenant-scoped persisted consent/history state, safe DTOs, audit visibility, and no silent mock fallback.

## Root cause / risk addressed

Customer 360 already had a backend path, but broadcast state in API mode was effectively hard-coded/local and the inbox disabled API-mode opt-out as mock-only.

Sprint 32 hardened this by loading broadcast consent/history from backend API state and persisting consent actions safely through backend APIs.

## Final fixes

- Added shared safe broadcast consent/history DTOs.
- Added tenant-scoped contact broadcast consent API.
- Derived Customer 360 broadcast history from existing backend data.
- Persisted broadcast opt-out / opt-in consent through backend API.
- Added safe audit visibility for broadcast consent actions.
- Wired Customer 360 Broadcast history card to API state in API mode.
- Removed API-mode mock/local broadcast fallback text.
- Preserved mock/local mode behavior.
- Added Sprint 32 smoke script.

## Changed files

- packages/shared/src/index.ts
- apps/web/app/api-client.ts
- apps/web/app/api-client.test.ts
- apps/web/app/page.tsx
- apps/api/src/controllers/contacts.controller.ts
- apps/api/src/controllers/contacts.controller.test.ts
- apps/api/src/services/customer.service.ts
- apps/api/src/services/customer.service.test.ts
- scripts/smoke-sprint32-api.mjs
- package.json

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed, 34 test files / 304 tests.
- `npm run build`: passed.
- `npm run smoke:sprint32`: passed, 24/24 checks.
- Smoke hit local API only at `http://localhost:4000`.
- Smoke confirmed `GET /health`.
- Smoke confirmed `GET /rooms`.
- Smoke confirmed safe persisted room/conversation selected.
- Smoke confirmed conversation preserves platform/account/room.
- Smoke confirmed Customer 360 loads from API.
- Smoke confirmed broadcast history summary loads from API.
- Smoke confirmed opt-out status loads from API.
- Smoke confirmed broadcast context preserves platform/account/room.
- Smoke confirmed broadcast response is safe.
- Smoke confirmed `externalCalls: 0`.
- Smoke confirmed safe opt-out/opt-in update persisted via API.
- Smoke confirmed refetch preserves updated opt-out state.
- Smoke confirmed audit log exists for broadcast consent action.
- Smoke confirmed audit log preserves safe context.
- Smoke confirmed audit log is safe.
- Smoke confirmed original opt-out state restored after smoke.
- Smoke confirmed missing Customer 360 returns API error/empty state, not mock fallback.
- Smoke confirmed no provider outbound.

## Manual UI verification

Completed at:

http://localhost:3012

API-on verified:

- Customer 360 loaded from API.
- Broadcast history card loaded from API.
- Opt-out status loaded from API.
- Last campaign loaded from API.
- External calls showed `0`.
- Broadcast history card stated that consent/history are loaded from API for this tenant.
- Provider outbound remained disabled.
- Opt-out broadcast action was available.
- No `mock-only`, `local-only`, `Opt out mock`, `Sprint 14`, or `local/mock` text appeared in API mode.
- No token/secret text visible.

API-off verified:

- API on port 4000 was stopped.
- Web was refreshed.
- UI showed `Failed to fetch`.
- Conversation list showed API error/empty state.
- Canned replies showed expected API-off fetch error.
- Customer 360 did not show fake customer fallback data.
- No mock broadcast history appeared.
- No fake local opt-out mutation appeared.
- No silent mock/local broadcast fallback.

## Safety

- No real LINE / Telegram / Facebook / Instagram outbound observed.
- No external provider calls.
- No OpenAI calls.
- No token/secret exposure.
- externalCalls remained 0.
- Broadcast consent/history preserved platform + channelAccountId + roomId context where relevant.
- Conversation separation preserved by platform + channelAccountId + roomId.

## Prisma

- No Prisma schema change.
- No destructive migration.
- No DB reset.

## Git

- Working tree contains Sprint 32 edits.
- No commit made yet.
- `apps/web/next-env.d.ts` should be restored before commit.

## Remaining issues

- None for Sprint 32.
