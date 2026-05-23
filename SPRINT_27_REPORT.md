# Sprint 27 FINAL PASS

Conversation Audit Timeline + Status History UI API Mode.

## Summary

Selected conversation audit logs and status history now render in the inbox UI using backend API mode with tenant-scoped safe data.

## Final fixes

- Tightened audit/status history API responses.
- Split audit/status loading from other workflow panel data so failures do not wipe unrelated state.
- Rendered Audit log and Status history in the selected conversation sidebar.
- Preserved API-mode no silent mock fallback.
- Kept mock/local mode behavior available.

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed, 32 test files / 272 tests.
- `npm run build`: passed.
- `npm run smoke:sprint27`: passed.
- Smoke confirmed `externalCalls: 0`.
- Smoke confirmed audit log exists.
- Smoke confirmed status history exists or safe empty state.
- Smoke confirmed platform/account/room metadata is preserved.
- Manual UI showed Audit log section.
- Manual UI showed Status history section.
- Manual UI action updates appeared in audit/status history.
- API-off refresh showed Failed to fetch / empty API state.
- No silent local/mock audit or status fallback.

## Safety

- No real LINE / Telegram / Facebook / Instagram outbound observed.
- No external provider calls.
- No OpenAI calls from audit/status timeline.
- No real token/secret exposure.
- Conversation separation preserved by platform/account/room.

## Prisma

- No Prisma schema change.
- No destructive migration.
- No DB reset.

## Remaining issues

- None for Sprint 27.
- `C:\Users\ADMIN\ruamchat` is still not a git repository, so no commit was attempted.
