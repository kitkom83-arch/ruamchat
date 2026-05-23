# Sprint 30 FINAL PASS

Customer 360 API Mode + Identity-Safe Conversation Linking.

## Summary

Customer 360 API mode is now hardened with tenant-scoped persisted contact/customer profile data, linked identities, separated related conversations, persisted safe contact updates, and audit-visible customer actions.

## Root cause / risk addressed

Customer 360 API mode already existed, but contact/customer routes still allowed default tenant fallback, Customer 360 contact actions were not audit-visible, and related conversation rows did not visibly carry full platform/account/room identity.

Sprint 30 hardened these paths so API mode stays tenant-scoped, audited, persisted, and conversation-safe.

## Final fixes

- Hardened contact/customer routes to avoid default tenant fallback.
- Hardened Customer 360 API mode tenant scoping.
- Made Customer 360 contact actions audit-visible.
- Preserved and surfaced related conversation identity:
  - conversation id
  - platform
  - channelAccountId
  - roomId
- Confirmed linked identities can be grouped under a Customer 360 profile without merging conversations into one cross-platform thread.
- Added/updated Customer 360 API-mode frontend behavior.
- API mode failure now shows API error/empty state instead of silently falling back to mock/local customer data.
- Mock/local mode behavior remains available.
- Added Sprint 30 smoke script.

## Changed files

- apps/api/src/controllers/contacts.controller.ts
- apps/api/src/controllers/conversations.controller.ts
- apps/api/src/services/customer.service.ts
- apps/api/src/controllers/contacts.controller.test.ts
- apps/api/src/controllers/conversations.controller.test.ts
- apps/api/src/services/customer.service.test.ts
- apps/web/app/inbox-data.ts
- apps/web/app/inbox-data.test.ts
- apps/web/app/page.tsx
- scripts/smoke-sprint30-api.mjs
- package.json

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed, 33 test files / 288 tests.
- `npm run build`: passed for shared, API, web, and worker.
- `npm run smoke:sprint30`: passed, 24/24 checks.
- Smoke hit local API only at `http://localhost:4000`.
- Smoke confirmed Customer 360 profile loaded.
- Smoke confirmed linked identities loaded.
- Smoke confirmed related conversations loaded.
- Smoke confirmed every related conversation preserved:
  - conversation id
  - platform
  - channelAccountId
  - roomId
- Smoke confirmed conversations were not collapsed into one cross-platform thread.
- Smoke confirmed no secret fields.
- Smoke confirmed no provider outbound.
- Smoke confirmed `externalCalls: 0`.
- Smoke confirmed persisted contact update.
- Smoke confirmed audit visibility.

## Manual UI verification

Completed at:

http://localhost:3012

API-on verified:

- Persisted Customer 360 data loaded from API.
- Linked identities were visible.
- Related conversations showed conversation id / room id / channelAccountId.
- Audit timeline included `contact.updated`.
- Refresh preserved persisted Customer 360 data.
- No token/secret text visible.
- Console had no warnings/errors.

API-off verified:

- API on port 4000 was stopped.
- Web was refreshed.
- Customer 360 area showed API error state: `Failed to fetch`.
- No mock customer fallback names appeared.
- API was restarted afterward.
- Customer 360 restored.

Note:

- API-off screenshot capture timed out in the in-app browser, but DOM and console checks passed.

## Safety

- No real LINE / Telegram / Facebook / Instagram outbound observed.
- No external provider calls.
- No OpenAI calls.
- No token/secret exposure.
- externalCalls remained 0.
- Conversation separation preserved by platform + channelAccountId + roomId.
- Customer 360 identity grouping did not merge conversations into one thread.

## Prisma

- No Prisma schema change.
- No destructive migration.
- No DB reset.

## Git

- Working tree contains Sprint 30 edits.
- No commit made yet.

## Remaining issues

- None blocking for Sprint 30.
- Sprint 30 smoke intentionally persisted a safe local tag: `sprint30-smoke`.
