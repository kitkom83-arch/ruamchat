# Sprint 25 FINAL PASS

Manual Reply Outbox + Send Safety API Mode.

## Summary

Manual inbox replies now run through backend API mode with tenant-scoped persisted messages and mock-only outbound/audit logging.

## Final fixes

- Hardened inbox manual send in API mode.
- Manual send now calls backend API instead of local/mock store.
- Send requires `x-tenant-id`, conversation id, and non-empty message body.
- Backend validates tenant-scoped conversation ownership.
- Manual reply preserves `platform + channelAccountId + roomId`.
- Manual reply creates persisted message and safe mock-only audit/outbound log.
- API-mode send failure does not insert fake local messages.
- Mock/local mode behavior preserved.

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed. Exact count was not captured in the pasted output.
- `npm run build`: passed.
- `npm run smoke:sprint25`: passed.
- Smoke confirmed `externalCalls: 0`.
- Smoke confirmed manual reply status is mock-only.
- Smoke confirmed manual reply persisted after refresh.
- Smoke confirmed outbound mock audit log exists.
- Smoke confirmed platform/account/room are preserved.
- Manual UI inbox API-on passed.
- Manual send of `Manual Sprint 25 safe reply` passed.
- Refresh persistence passed.
- API-off refresh showed API error / empty API state.
- No silent local/mock send fallback.

## Safety

- No real LINE / Telegram / Facebook / Instagram outbound observed.
- No external provider calls.
- No real token/secret exposure.
- Allowed mock statuses only.
- Conversation separation preserved by platform/account/room.

## Remaining issues

- None for Sprint 25.
- `C:\Users\ADMIN\ruamchat` is still not a git repository, so no commit was attempted.
