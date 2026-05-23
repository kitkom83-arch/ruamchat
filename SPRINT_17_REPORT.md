# Sprint 17 Report: AI Center + Knowledge Base Persistence

## Summary

- Added backend API-mode persistence for knowledge bases, documents, chunks, and room AI policy KB links.
- Kept mock/local AI Center behavior intact and isolated from API calls.
- API mode now loads KB/document/chunk data from the backend and surfaces readable API errors without silently falling back to mock data.
- No real OpenAI/vector-store/platform outbound calls were added.

## Changed Files

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/seed.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/controllers/ai.controller.ts`
- `apps/api/src/controllers/rooms.controller.ts`
- `apps/api/src/services/conversation.service.ts`
- `apps/api/src/services/conversation.service.test.ts`
- `apps/api/src/services/knowledge-base.service.ts`
- `apps/api/src/services/knowledge-base.service.test.ts`
- `apps/web/app/api-client.ts`
- `apps/web/app/api-client.test.ts`
- `apps/web/app/ai-center/page.tsx`
- `apps/web/app/ai-center/api-knowledge-list.ts`
- `apps/web/app/ai-center-page.test.ts`
- `apps/web/app/ai-data.ts`
- `apps/web/app/ai-data.test.ts`
- `apps/web/app/globals.css`
- `packages/shared/src/index.ts`

## Prisma

Prisma changed: yes.

Additive models:

- `KnowledgeBase`
- `KnowledgeDocument`
- `KnowledgeChunk`
- `RoomKnowledgeBase`

Existing `KnowledgeDoc` remains for the current safe AI suggestion fallback path.

Commands run:

```powershell
npm run prisma:generate
npx prisma db push --schema apps/api/prisma/schema.prisma
npx prisma db seed --schema apps/api/prisma/schema.prisma
```

Note: `db push` needed `DATABASE_URL` loaded from `.env.local`; the first run without it failed before changing the database.

## Endpoint List

- `GET /ai/knowledge-bases`
- `POST /ai/knowledge-bases`
- `PATCH /ai/knowledge-bases/:knowledgeBaseId`
- `DELETE /ai/knowledge-bases/:knowledgeBaseId`
- `GET /ai/knowledge-bases/:knowledgeBaseId/documents`
- `POST /ai/knowledge-bases/:knowledgeBaseId/documents`
- `PATCH /ai/documents/:documentId`
- `DELETE /ai/documents/:documentId`
- `GET /ai/documents/:documentId/chunks`
- `POST /ai/documents/:documentId/chunks`
- `PATCH /ai/chunks/:chunkId`
- `DELETE /ai/chunks/:chunkId`
- `GET /rooms/:roomId/ai-policy`
- `PATCH /rooms/:roomId/ai-policy`

## Manual API Commands

Use the demo tenant header:

```powershell
$base = "http://localhost:4000"
$tenant = "00000000-0000-4000-8000-000000000001"
```

```powershell
Invoke-RestMethod "$base/ai/knowledge-bases" -Headers @{ "x-tenant-id" = $tenant }
```

```powershell
Invoke-RestMethod "$base/ai/knowledge-bases" -Method Post -ContentType "application/json" -Headers @{ "x-tenant-id" = $tenant } -Body '{"name":"Manual Test KB","description":"Safe demo only","status":"draft"}'
```

```powershell
Invoke-RestMethod "$base/ai/knowledge-bases/00000000-0000-4000-8000-000000000801/documents" -Headers @{ "x-tenant-id" = $tenant }
```

```powershell
Invoke-RestMethod "$base/ai/knowledge-bases/00000000-0000-4000-8000-000000000801/documents" -Method Post -ContentType "application/json" -Headers @{ "x-tenant-id" = $tenant } -Body '{"title":"Manual Test Doc","sourceType":"manual","status":"draft"}'
```

```powershell
Invoke-RestMethod "$base/ai/documents/<documentId>/chunks" -Method Post -ContentType "application/json" -Headers @{ "x-tenant-id" = $tenant } -Body '{"content":"Safe demo chunk only.","metadataJson":{"section":"manual-test"}}'
```

```powershell
Invoke-RestMethod "$base/rooms" -Headers @{ "x-tenant-id" = $tenant }
Invoke-RestMethod "$base/rooms/<roomId>/ai-policy" -Headers @{ "x-tenant-id" = $tenant }
Invoke-RestMethod "$base/rooms/<roomId>/ai-policy" -Method Patch -ContentType "application/json" -Headers @{ "x-tenant-id" = $tenant } -Body '{"aiMode":"human_first","knowledgeBaseIds":["00000000-0000-4000-8000-000000000801"]}'
```

## Manual UI Checks

- Mock mode: set `NEXT_PUBLIC_DATA_MODE=mock`, open `/ai-center`, create/edit/archive a local knowledge item, and confirm browser network shows no `/ai/*` calls.
- API mode: set `NEXT_PUBLIC_DATA_MODE=api`, open `/ai-center`, confirm backend KBs render.
- API mode: create/edit/archive a KB.
- API mode: select a KB, create/edit/archive a document.
- API mode: select a document, create/edit/delete chunks.
- API mode: change room AI policy mode and linked KBs, save, refresh, and confirm persisted values.
- API error: stop the API or point `NEXT_PUBLIC_API_BASE_URL` at an invalid URL and confirm the page shows an error instead of mock KB data.

## Test Results

```text
npm run typecheck
PASS

npm test
20 passed, 190 tests passed

npm run build
PASS
```

## Rollback

Set:

```text
NEXT_PUBLIC_DATA_MODE=mock
```

This returns the UI to the existing local/mock AI Center behavior without API calls.

## Safety Notes

- No real OpenAI calls were added to Sprint 17 tests.
- No vector store or embedding persistence is required or enabled.
- No external platform outbound calls were added.
- No real tokens, secrets, passwords, or private customer data were added.
- The Prisma changes are additive; no destructive migration or DB reset script was used.
