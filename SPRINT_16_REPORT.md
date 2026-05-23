# Sprint 16 Report: SLA + Status Workflow + Audit Log Persistence

## Summary

- Added persisted API-mode workflow updates for conversation status, priority, read/unreplied state, SLA fields, status history, and tenant-scoped audit logs.
- Kept mock mode local and intact; API mode continues to fail visibly on API errors instead of falling back to mock data.
- No real outbound social-platform calls, OpenAI calls, real secrets, destructive migrations, or reset scripts were added.

## Changed Files

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/seed.ts`
- `apps/api/src/controllers/conversations.controller.ts`
- `apps/api/src/services/audit.service.ts`
- `apps/api/src/services/conversation.service.ts`
- `apps/api/src/services/conversation.service.test.ts`
- `apps/api/src/services/customer.service.ts`
- `apps/web/app/api-client.ts`
- `apps/web/app/api-client.test.ts`
- `apps/web/app/inbox-data.ts`
- `apps/web/app/inbox-data.test.ts`
- `apps/web/app/page.tsx`
- `packages/shared/src/index.ts`
- `SPRINT_16_REPORT.md`

## Prisma

Prisma changed: yes, additive only.

- Added `ConversationSlaStatus`.
- Added nullable SLA fields on `Conversation`.
- Added `ConversationStatusHistory`.
- Added nullable Sprint 16 audit fields on `AuditLog`: `conversationId`, `beforeJson`, `afterJson`, `metadataJson`.
- Preserved existing audit fields for compatibility.

## Endpoints

- `PATCH /conversations/:conversationId/status`
- `PATCH /conversations/:conversationId/priority`
- `PATCH /conversations/:conversationId/read-state`
- `PATCH /conversations/:conversationId/sla`
- `GET /conversations/:conversationId/audit-logs`
- `GET /conversations/:conversationId/status-history`
- Existing workflow endpoints now write tenant-scoped audit logs: assign, takeover, follow-up, close, notes, tasks, and task completion.

## Manual API Commands

Use the demo tenant header: `x-tenant-id: 00000000-0000-4000-8000-000000000001`.

```bash
curl -X PATCH http://localhost:4000/conversations/00000000-0000-4000-8000-000000000201/status \
  -H "content-type: application/json" \
  -H "x-tenant-id: 00000000-0000-4000-8000-000000000001" \
  -H "x-user-id: 00000000-0000-4000-8000-000000000011" \
  -d '{"status":"closed"}'

curl -X PATCH http://localhost:4000/conversations/00000000-0000-4000-8000-000000000201/status \
  -H "content-type: application/json" \
  -H "x-tenant-id: 00000000-0000-4000-8000-000000000001" \
  -d '{"status":"open"}'

curl -X PATCH http://localhost:4000/conversations/00000000-0000-4000-8000-000000000201/priority \
  -H "content-type: application/json" \
  -H "x-tenant-id: 00000000-0000-4000-8000-000000000001" \
  -d '{"priority":"urgent"}'

curl -X PATCH http://localhost:4000/conversations/00000000-0000-4000-8000-000000000201/read-state \
  -H "content-type: application/json" \
  -H "x-tenant-id: 00000000-0000-4000-8000-000000000001" \
  -d '{"unread":false,"unreplied":false}'

curl -X PATCH http://localhost:4000/conversations/00000000-0000-4000-8000-000000000201/sla \
  -H "content-type: application/json" \
  -H "x-tenant-id: 00000000-0000-4000-8000-000000000001" \
  -d '{"slaStatus":"warning","slaDueAt":"2026-05-21T04:30:00.000Z","firstResponseDueAt":"2026-05-21T04:30:00.000Z","resolutionDueAt":"2026-05-21T08:00:00.000Z"}'

curl http://localhost:4000/conversations/00000000-0000-4000-8000-000000000201/audit-logs \
  -H "x-tenant-id: 00000000-0000-4000-8000-000000000001"

curl http://localhost:4000/conversations/00000000-0000-4000-8000-000000000201/status-history \
  -H "x-tenant-id: 00000000-0000-4000-8000-000000000001"
```

## Manual UI Checks

- Set `NEXT_PUBLIC_DATA_MODE=api`, open the Inbox, select a seeded room, and use status, priority, read/replied, and SLA controls.
- Verify closed conversations move to the Closed filter and spam conversations move to the Spam filter without crossing rooms.
- Verify the Customer 360 panel shows SLA state, audit log rows, and API status history after updates.
- Set `NEXT_PUBLIC_DATA_MODE=mock` to rollback to local/mock behavior.

## Safety Notes

- No real LINE, Telegram, Facebook, Instagram, or OpenAI calls were added.
- No real tokens or secrets were added.
- No destructive migration or database reset was added.
