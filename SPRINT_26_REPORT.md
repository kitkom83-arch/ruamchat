# Sprint 26 FINAL PASS

Inbox Conversation Actions API Mode + Audit Persistence.

## Summary

Inbox conversation action buttons and dropdowns now run through backend API mode with tenant-scoped persisted updates and safe audit logs.

## Final fixes

- Added real API-backed Return to AI action.
- Hardened conversation action endpoints to require `x-tenant-id`.
- Enriched action audit metadata with safe conversation scope:
  - tenantId
  - conversationId
  - platform
  - channelAccountId
  - roomId
  - action type
  - safe previous/next values
  - externalCalls: 0
- Updated smoke script to validate latest action audits instead of being poisoned by old seed/prior logs.
- Kept API-mode actions from silently falling back to local/mock state.
- Mock/local mode behavior preserved.

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed, 32 test files / 266 tests.
- `npm run build`: passed.
- `npm run smoke:sprint26`: passed.
- Smoke confirmed `externalCalls: 0`.
- Smoke confirmed Take Over, Return to AI, status, priority, follow-up, and read/replied actions.
- Smoke confirmed audit logs exist for all Sprint 26 actions.
- Smoke confirmed audit platform/account/room metadata is preserved.
- Smoke confirmed audit logs are safe.
- Manual UI priority change persisted after refresh.
- Manual UI status change persisted after refresh.
- Manual UI Take Over / Return to AI passed.
- API-off refresh showed API error / empty state.
- No silent local/mock action fallback.

## Safety

- No real LINE / Telegram / Facebook / Instagram outbound observed.
- No external provider calls.
- No OpenAI calls from inbox actions.
- No real token/secret exposure.
- Conversation separation preserved by platform/account/room.

## Prisma

- No Prisma schema change.
- No destructive migration.
- No DB reset.

## Remaining issues

- None for Sprint 26.
- `C:\Users\ADMIN\ruamchat` is still not a git repository, so no commit was attempted.
