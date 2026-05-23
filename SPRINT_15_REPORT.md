# Sprint 15 Report: Internal Notes, Tasks, and Assignment Persistence

## Summary
- Added backend API-mode persistence for conversation internal notes, workflow tasks, task completion, assignment, takeover, and follow-up state.
- Kept mock mode intact; existing local admin store behavior still powers mock workflows.
- Preserved room/platform/account separation by routing all conversation workflow writes through tenant-scoped conversation lookup.
- No real outbound delivery was added. Agent replies still enqueue mock/safe outbound state only.

## Changed Files
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/seed.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/controllers/conversations.controller.ts`
- `apps/api/src/services/conversation.service.ts`
- `apps/api/src/services/conversation.service.test.ts`
- `apps/api/src/services/customer.service.ts`
- `apps/api/src/services/customer.service.test.ts`
- `apps/web/app/api-client.ts`
- `apps/web/app/api-client.test.ts`
- `apps/web/app/page.tsx`
- `packages/shared/src/index.ts`
- `SPRINT_15_REPORT.md`

## Prisma
- Prisma schema changed.
- Added persisted task model and expanded note/assignment persistence fields.
- Ran `npm run prisma:generate`: passed before `db push`.
- Ran non-destructive `npx prisma db push --schema apps/api/prisma/schema.prisma`: database synced successfully.
- A post-`db push` Prisma generate retry hit a Windows `EPERM` file-lock on `query_engine-windows.dll.node`; the earlier generate had already completed successfully.

## Test Results
- `npm run typecheck`: passed.
- `npm test`: passed, 17 files / 156 tests.
- `npm run build`: passed.

## Manual API Test Commands
Set `CONV_ID` to a seeded or live conversation id first.

```bash
curl http://localhost:4000/conversations/$CONV_ID/notes
curl -X POST http://localhost:4000/conversations/$CONV_ID/notes -H "content-type: application/json" -d '{"body":"Manual note","visibility":"team"}'
curl http://localhost:4000/conversations/$CONV_ID/tasks
curl -X POST http://localhost:4000/conversations/$CONV_ID/tasks -H "content-type: application/json" -d '{"title":"Manual follow-up task"}'
curl -X PATCH http://localhost:4000/tasks/$TASK_ID/complete
curl -X POST http://localhost:4000/conversations/$CONV_ID/assign -H "content-type: application/json" -d '{"userId":"00000000-0000-4000-8000-000000000011"}'
curl -X POST http://localhost:4000/conversations/$CONV_ID/takeover
curl -X POST http://localhost:4000/conversations/$CONV_ID/follow-up -H "content-type: application/json" -d '{"followUpAt":"2026-05-22T04:00:00.000Z"}'
```

## Manual UI Verification
- In API mode, open Inbox and select a conversation.
- Add Note persists through `/conversations/:id/notes` and appears in Internal notes.
- Create Task persists through `/conversations/:id/tasks` and appears in Open tasks.
- Mark first task done persists through `/tasks/:id/complete`.
- Assign to Me, Assign, Transfer, Unassign, Take Over, and Follow Up call backend APIs and update the selected conversation state.
- API loading/error messages are shown instead of silently falling back to mock data.
- In mock mode, local notes/tasks/assignment behavior remains unchanged.
- Local mock UI smoke: started Next.js on `http://localhost:3012`, loaded Inbox, and captured the page successfully with Playwright.

## Remaining Issues
- API note edit/delete/pin and Return to AI are intentionally not persisted in Sprint 15 because they were outside the requested endpoint list.
- The final Prisma generate retry after `db push` was blocked by a Windows file lock, but the initial generate passed and the database sync completed.
