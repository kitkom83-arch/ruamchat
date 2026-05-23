# Backend Persistence Plan - Sprint 12

## Existing Persistence

| Area | Existing tables/models | Notes |
| --- | --- | --- |
| Tenancy and team | `Tenant`, `User`, `TeamMembership` | Demo tenant and owner are seeded locally. |
| Channels and rooms | `ChannelAccount`, `Room` | Supports separated `webchat`, `telegram`, `line`, `facebook`, `instagram` accounts. |
| Contacts | `Contact`, `ContactIdentity`, `IdentityLinkSuggestion`, `Tag`, `ContactTag` | Enough for Sprint 12 contact identity lookup/create. |
| Core chat | `Conversation`, `Message`, `Attachment`, `Assignment`, `InternalNote` | Enough for room-scoped conversations, inbound messages, and agent replies. |
| AI and KB | `KnowledgeDoc`, `AiRun`, `AiToolCall`, `AiAction`, `SavedReply` | Not moved further in Sprint 12. |
| Audit | `AuditLog` | Used for message ingest and agent reply audit events. |

## Existing Endpoints Before Sprint 12

| Endpoint | Status before Sprint 12 | Gap |
| --- | --- | --- |
| `GET /rooms` | Existing | Returned Prisma-shaped rooms, not frontend-safe core room DTOs. |
| `GET /rooms/:roomId/conversations` | Existing | Missing `tab`, `agentId`, `search`, `my_inbox` alias, and UI card DTO mapping. |
| `GET /conversations/:conversationId/messages` | Existing | Returned Prisma-shaped messages without derived `direction` or `deliveryStatus`. |
| `POST /conversations/:conversationId/messages` | Existing | Used generic send schema and returned Prisma message shape. |
| `POST /webhooks/webchat/:accountKey` | Existing | Already ingested Webchat; response did not expose message id. |
| `POST /webhooks/telegram|line|facebook|instagram/...` | Existing | Mock/real-safe channel webhook normalization already present. |
| `GET /health` | Missing | Added in Sprint 12. |

## Sprint 12 Work

| Work item | Decision |
| --- | --- |
| Data mode switch | Added `NEXT_PUBLIC_DATA_MODE=mock` default and `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`. Mock mode keeps local data and does not call the API. API mode calls the backend and shows readable errors instead of silent fallback. |
| API DTO contracts | Added lightweight shared schemas for health, rooms, conversation cards, core messages, agent replies, and webchat inbound responses. |
| Rooms API | `GET /rooms` now returns five separated platform/account rooms with `platform`, `accountName`, `roomName`, accent, and conversation count. |
| Conversations API | `GET /rooms/:roomId/conversations` supports `tab`, `filter`, `agentId`, and `search`, remains scoped by `roomId`, and maps records to conversation card fields. |
| Messages API | `GET /conversations/:conversationId/messages` returns only messages from that conversation with derived `direction` and `deliveryStatus`. |
| Agent reply | `POST /conversations/:conversationId/messages` stores an outbound agent message and returns `deliveryStatus=sent_mock`. No external sender is called directly by tests. |
| Webchat inbound | `POST /webhooks/webchat/:accountKey` continues to find/create identity and conversation, persists inbound messages, handles duplicate `platformMessageId`, and returns conversation/message ids. |
| Webchat demo API mode | API mode posts visitor messages to backend and polls messages every 2.5 seconds so agent replies can appear. Mock mode stays localStorage-only. |
| Inbox API mode | API mode loads rooms, conversations, selected messages, and sends agent replies through the API client. AI Center, CRM, Admin Tools, Analytics, Flows, and Broadcast remain mock/local. |

## Gaps Left For Later Sprints

| Area | Next step |
| --- | --- |
| Admin actions | Persist assignment, priority/status changes, internal notes, SLA actions, and audit views fully through backend APIs. |
| Customer 360 / CRM | Move contact profile, identity linking, notes, tasks, and lead status from local mock store to backend incrementally. |
| AI Center | Persist knowledge base management and AI run review flows; keep real OpenAI calls opt-in and mocked in tests. |
| Analytics | Aggregate backend conversation/message metrics after core chat write paths stabilize. |
| Flow Builder | Store flows and run history in backend after room/conversation contracts settle. |
| Broadcast | Persist campaigns and recipients, but keep outbound sends mock-safe until channel sender review. |
| Realtime | Replace polling with WebSocket/SSE only after Sprint 12 API mode is stable. |

## Risks

| Risk | Mitigation |
| --- | --- |
| API DTO drift from UI mock shape | Shared schemas validate API client responses and mapper functions fill safe fallback fields. |
| Existing mock panels assume local-only data | Sprint 12 maps API conversations into the existing `ConversationCard` shape and keeps CRM/Admin/AI panels mock-backed. |
| Confusing silent fallback | API mode records readable errors and does not silently switch back to mock data. |
| Channel cross-contamination | All conversation queries include `roomId`; rooms remain separated by `platform` and `channelAccountId`. |
| Accidental external sends | Agent replies are stored as `sent_mock`; tests mock outbound queue and do not call platform APIs. |
| Schema churn | No Prisma schema change was required for Sprint 12. Direction and delivery status are derived API fields. |

## Rollback To Mock Mode

1. Set `NEXT_PUBLIC_DATA_MODE=mock`.
2. Restart the web app so Next.js picks up the public env value.
3. Leave `NEXT_PUBLIC_API_BASE_URL` configured or unset; mock mode does not call it.
4. Use `/webchat-demo` and `/` as before. Webchat demo returns to localStorage, and Inbox uses mock/local data.
5. Backend data remains untouched; no destructive database rollback is needed for this sprint.
