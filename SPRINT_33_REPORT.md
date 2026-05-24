# Sprint 33 FINAL PASS

Notes + Tasks API Mode Persistence.

## Summary

Inbox and Customer 360 Notes + Tasks now run through backend API mode with tenant-scoped persisted records, safe DTOs, audit visibility, refresh persistence, visible editors, green click feedback, and no silent mock fallback.

## Root cause / risk addressed

Note/task persistence already existed, but the returned DTOs and audit metadata did not fully carry platform/account/room context or explicit externalCalls: 0.

Customer 360 right-side Add Note/Create Task were also wired to CRM-local helpers instead of the conversation workflow handlers used by the toolbar.

Add Note initially only prefilled noteDraft and did not open a visible editor. Create Task initially created immediately instead of opening a clear task-entry flow.

Sprint 33 hardened the note/task API and UI flow so operators can clearly create persisted notes and tasks from toolbar, Customer 360, and quick actions.

## Final fixes

- Added safer shared DTO/context for notes and tasks.
- Enriched note/task response context with:
  - conversationId
  - platform
  - channelAccountId
  - roomId
- Added safe note/task audit metadata with externalCalls: 0.
- Preserved tenant-scoped note/task creation.
- Wired Add Note actions to a visible internal note editor.
- Wired Create Task actions to a visible task editor.
- Customer 360 Add Note uses the same note workflow as toolbar Add Note.
- Customer 360 Create Task uses the same task workflow as toolbar Create Task.
- Quick actions Create Task uses the same task workflow.
- Added green click/action feedback.
- Green success feedback does not replace actual editor visibility.
- API-mode failure does not create fake local note/task.
- Mock/local mode behavior remains available.
- Added Sprint 33 smoke script.

## Changed files

- packages/shared/src/index.ts
- packages/shared/src/index.test.ts
- apps/api/src/services/conversation.service.ts
- apps/api/src/services/conversation.service.test.ts
- apps/api/src/controllers/conversations.controller.test.ts
- apps/web/app/page.tsx
- apps/web/app/globals.css
- apps/web/app/admin-data.ts
- apps/web/app/api-client.test.ts
- apps/web/app/inbox-action-feedback.ts
- apps/web/app/inbox-action-feedback.test.ts
- scripts/smoke-sprint33-api.mjs
- package.json

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed, 35 test files / 318 tests.
- `npm run build`: passed.
- `npm run smoke:sprint33`: passed, 31/31 checks.
- Smoke confirmed local API only at `http://localhost:4000`.
- Smoke confirmed `GET /health`.
- Smoke confirmed `GET /rooms`.
- Smoke confirmed safe persisted room/conversation selected.
- Smoke confirmed conversation preserves platform/account/room.
- Smoke confirmed Customer 360 loads from API.
- Smoke confirmed Customer 360 context preserves platform/account.
- Smoke confirmed created note through backend API.
- Smoke confirmed note response preserves context.
- Smoke confirmed note response is safe.
- Smoke confirmed refetch confirms persisted note.
- Smoke confirmed created task through backend API.
- Smoke confirmed task response preserves context.
- Smoke confirmed task response is safe.
- Smoke confirmed refetch confirms persisted task.
- Smoke confirmed audit log exists for note action.
- Smoke confirmed audit log exists for task action.
- Smoke confirmed note/task audit preserves safe context.
- Smoke confirmed audit logs are safe.
- Smoke confirmed audit externalCalls = 0.
- Smoke confirmed Customer 360 refetch preserves note/task.
- Smoke confirmed missing notes/tasks return API error/empty state, not mock fallback.
- Smoke confirmed no provider outbound.

## Manual UI verification

Completed at:

http://localhost:3012

API-on verified:

- Add Note editor opened visibly.
- Add Note showed `Add internal note`.
- Note editor included a note text area and Save/Cancel controls.
- `Sprint 33 UI safe note` was saved.
- Saved note persisted and appeared in Internal notes after refresh.
- Create Task editor opened visibly.
- Task editor included title input, details, priority, Create, and Cancel controls.
- `Sprint 33 UI safe task` was created.
- Created task persisted and appeared in Open tasks after refresh.
- Customer 360 Add Note opened the same note flow.
- Customer 360 Create Task opened the same task flow.
- Quick actions Create Task opened the same task flow.
- Audit log showed `note.created`.
- Audit log showed `task.created`.
- Action feedback appeared briefly in green.
- No token/secret text visible.
- No provider outbound observed.

API-off verified:

- API on port 4000 was stopped.
- Web was refreshed.
- UI showed `Failed to fetch`.
- Conversation list showed API error/empty state.
- Customer 360 showed no selected customer state.
- Canned replies showed expected API-off error.
- No fake local note appeared.
- No fake local task appeared.
- No silent mock/local note or task fallback.

## Safety

- No real LINE / Telegram / Facebook / Instagram outbound observed.
- No external provider calls.
- No OpenAI calls from note/task actions.
- No token/secret exposure.
- externalCalls remained 0.
- Notes/tasks preserve platform + channelAccountId + roomId context.
- Conversation separation preserved by platform + channelAccountId + roomId.

## Prisma

- No Prisma schema change.
- No destructive migration.
- No DB reset.

## Local infra note

Manual validation used local PostgreSQL on port 55433 because port 55432 was blocked locally. This is a local runtime workaround and should not be committed unless the project intentionally changes the default dev DB port.

## Git

- Sprint 33 closeout is scoped to the listed Sprint 33 source, test, smoke, package, and report files.
- Local-only/generated runtime files must remain uncommitted.

## Remaining issues

- None for Sprint 33.
- API was intentionally stopped for API-off verification.
