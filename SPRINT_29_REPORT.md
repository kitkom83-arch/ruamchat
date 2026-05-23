# Sprint 29 FINAL PASS

AI Suggested Reply + Feedback API Mode Persistence.

## Summary

AI Summary, Suggested Reply, Use AI Draft, Regenerate Draft, and Mark as Wrong now run through backend API mode with tenant-scoped persisted AI suggestion records, feedback persistence, audit logs, and safe no-real-OpenAI behavior by default.

## Root cause

OpenAiOrchestratorService relied on reflected constructor metadata, so Nest created it with ConversationService undefined at runtime.

The runtime failure was:

Cannot read properties of undefined (reading 'ensureConversation')

## Final fixes

- Added explicit @Inject(...) for OpenAiOrchestratorService dependencies:
  - PrismaService
  - ConversationService
  - AuditService
- Added/updated Nest DI regression coverage for OpenAiOrchestratorService.
- Added/updated controller-level coverage for AiController.suggest.
- Wired AI summary/suggested reply flow through backend API mode.
- Added persisted suggestion record using AiRun.
- Added feedback persistence using AiAction and AuditLog.
- Kept AI suggestion path safe/mock-backed by default.
- Prevented API mode from silently falling back to mock AI when API is offline.
- Preserved mock/local mode behavior.

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed, 33 test files / 284 tests.
- `npm run build`: passed.
- `npm run smoke:sprint29`: passed.
- Smoke confirmed AI suggest endpoint passed.
- Smoke confirmed feedback endpoint passed.
- Smoke confirmed audit persistence.
- Smoke confirmed `externalCalls: 0`.
- Smoke confirmed safe response checks.
- Smoke confirmed platform/account/room preservation.

## Manual UI verification

Completed at:

http://localhost:3012

Verified:

- AI Summary/Suggested Reply loaded from API.
- Use AI Draft filled composer only.
- No outbound/send indicators appeared.
- Regenerate Draft returned safe API result with `externalCalls=0`.
- Mark as Wrong persisted feedback.
- AI feedback/suggestion audit entries appeared.
- After stopping API and refreshing, no mock AI fallback appeared.
- UI showed API/empty state behavior instead.

## Safety

- No real OpenAI call observed.
- No real LINE / Telegram / Facebook / Instagram outbound observed.
- No provider outbound from suggested replies.
- Use AI Draft only filled the composer.
- No token/secret exposure.
- externalCalls remained 0.
- Conversation separation preserved by platform + channelAccountId + roomId.

## Prisma

- No Prisma schema change.
- No destructive migration.
- No DB reset.

## Git

- Working tree contains Sprint 29 edits.
- No commit made yet.

## Remaining issues

- None for Sprint 29.
- API was intentionally stopped for API-off verification.
- Web is still listening on port 3012.
