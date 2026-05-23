# Sprint 24 FINAL PASS

SLA Policies + Canned Replies API Mode Persistence.

## Summary

SLA policies and canned replies now run in backend API mode with tenant-scoped persisted data.

## Final fixes

- Added persisted SLA policies and canned replies API flow.
- Wired `/settings/team` to load agents, SLA policies, and canned replies from backend API mode.
- Wired inbox composer canned reply shortcuts/search to persisted API canned replies.
- Fixed API-mode quick reply fallback: hardcoded Thai quick reply buttons no longer render when canned replies API fails.
- Preserved mock/local mode behavior.
- Kept provider outbound at 0 during canned reply selection.

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed, 30 test files / 253 tests.
- `npm run build`: passed for shared, API, web, worker.
- `npm run smoke:sprint24`: passed.
- Smoke confirmed `externalCalls: 0`.
- `/settings/team` API-on showed agents, SLA policies, and canned replies.
- Inbox API-on showed API canned reply shortcuts.
- Clicking `/hello` filled composer from persisted API body.
- API-off `/settings/team` showed API error.
- API-off inbox showed canned replies API error.
- No local/mock Thai quick reply buttons appeared in API mode after API failure.
- No silent mock fallback.

## Prisma

- Sprint 24 added persisted SLA policy and canned reply storage.
- Prisma client generated successfully.
- Local additive DB sync completed with `db push`.
- Seed completed.
- No destructive DB reset.
- No destructive migration.

## Safety

- No external provider calls.
- No real LINE / Telegram / Facebook / Instagram outbound.
- No OpenAI calls from settings/canned reply pages.
- No real token/secret exposure.
- Canned reply selection only fills composer; it does not send a message.

## Remaining issues

- None for Sprint 24.
- Project folder is still not a git repository, so no commit was attempted.
