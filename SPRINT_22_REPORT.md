# Sprint 22 FINAL PASS

Contacts Directory API Mode + CRM Surface Persistence.

## Summary

`/contacts` now runs in backend API mode with tenant-scoped persisted contacts, identities, and related conversations.

## Final fixes

- Added/validated backend Contacts read APIs.
- Added frontend `/contacts` API-mode loader.
- Added `channelAccountId` to the shared conversation card schema.
- Aligned backend/web/shared contract for `/contacts/:contactId/conversations`.
- Kept conversation separation by `platform + channelAccountId + roomId`.
- Prevented detail/conversation load failures from wiping an already-loaded contact list.

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed, 28 test files / 231 tests.
- `npm run build`: passed for shared, API, web, worker.
- `npm run smoke:sprint22`: passed.
- Manual UI `/contacts` API-on showed 14 persisted contacts.
- Demo LINE Member rendered linked identity and related conversation.
- Related conversation displayed `line / channelAccountId / roomId`.
- API-off refresh showed Contacts API error and did not silently load mock contacts.

## Safety

- No external calls.
- No real outbound provider send.
- Conversations remained separated by platform/account/room.

## Remaining issues

- None for Sprint 22.
- Project folder was still not a git repository.
