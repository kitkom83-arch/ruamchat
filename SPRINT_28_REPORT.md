# Sprint 28 FINAL PASS

Inbox Automation Run API Mode + Dry-run Safe Audit.

## Summary

Inbox Matching Automations now run through backend API mode as safe dry-run operations with persisted run records and audit logs.

## Final fixes

- Wired inbox Matching Automations to API-mode flow data.
- Fixed API-mode matching so demo conversations can show persisted matching flows.
- Run Flow now calls backend `/flows/:flowId/test-run` with conversation context.
- Backend validates tenant-owned conversation and tenant-owned flow.
- Flow dry-run preserves `platform + channelAccountId + roomId`.
- Flow run creates persisted dry-run record.
- Flow run creates safe audit log event.
- Outbound flow actions are skipped as mock/dry-run only.
- API mode no longer falls back to local/mock Run Flow.
- Mock/local mode behavior preserved.

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed, 32 test files / 275 tests.
- `npm run build`: passed.
- `npm run smoke:sprint28`: passed.
- Smoke confirmed dry-run result.
- Smoke confirmed mock/dry-run statuses only.
- Smoke confirmed no real outbound status.
- Smoke confirmed persisted run exists.
- Smoke confirmed flow run audit exists.
- Smoke confirmed audit platform/account/room metadata is preserved.
- Smoke confirmed `externalCalls: 0`.
- Manual UI showed Matching Automations.
- Manual UI showed `Run Flow` and `View Flow`.
- Manual UI Run Flow created dry-run result.
- Recent Flow Runs updated.
- Audit log showed `flow_run_dry_run`.
- API-off refresh showed `Failed to fetch`.
- No silent local/mock Run Flow fallback.

## Safety

- No real LINE / Telegram / Facebook / Instagram outbound observed.
- No external provider calls.
- No OpenAI calls from Run Flow.
- No real token/secret exposure.
- Conversation separation preserved by platform/account/room.
- Flow outbound actions remain dry-run/mock-only.

## Prisma

- No Prisma schema change.
- Seed data changed only.
- No destructive migration.
- No DB reset.

## Remaining issues

- None for Sprint 28.
- Browser screenshot capture timed out, but DOM/interaction verification passed.
- `C:\Users\ADMIN\ruamchat` is still not a git repository, so no commit was attempted.
