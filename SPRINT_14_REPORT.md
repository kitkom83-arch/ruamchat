# Sprint 14 Report: Customer 360 Persistence + Contact Identity API Mode

## Implemented

- Added `GET /conversations/:conversationId/customer-360` for persisted Customer 360 data in API mode.
- Added contact identity APIs:
  - `POST /contacts`
  - `PATCH /contacts/:contactId`
  - `POST /contacts/:contactId/identities/link`
  - `POST /contacts/:contactId/identities/unlink`
  - `PATCH /contacts/:contactId/primary-identity`
- Added `ContactIdentity.isPrimary` so the backend can persist primary identity state.
- Linked identities update contact aggregation while preserving each conversation record and its original room/platform/account.
- Unlinking an identity moves it to a standalone contact instead of deleting it, so existing conversation threads are preserved.
- Inbox API mode now fetches Customer 360 data for the selected conversation and shows explicit loading/error states.
- Mock mode keeps the existing local CRM/Customer 360 behavior.
- API-mode unsupported CRM actions are labeled local/mock-only where they remain out of Sprint 14 scope.

## Prisma

Prisma changed minimally:

- `ContactIdentity.isPrimary Boolean @default(false)`

`npm run prisma:generate` was run. No destructive migration or reset script was added.

## Endpoint List

```text
GET   /conversations/:conversationId/customer-360
POST  /contacts
PATCH /contacts/:contactId
POST  /contacts/:contactId/identities/link
POST  /contacts/:contactId/identities/unlink
PATCH /contacts/:contactId/primary-identity
```

## Manual API Test Commands

Fetch Customer 360:

```powershell
Invoke-RestMethod "http://localhost:4000/conversations/<conversation-id>/customer-360"
```

Create contact:

```powershell
Invoke-RestMethod -Method Post -ContentType "application/json" -Uri "http://localhost:4000/contacts" -Body '{"displayName":"Demo API Contact","leadStatus":"new","tags":["demo"],"identity":{"platform":"telegram","channelAccountId":"00000000-0000-4000-8000-000000000021","externalUserId":"tg-api-demo","displayName":"TG API Demo","isPrimary":true}}'
```

Link an identity:

```powershell
Invoke-RestMethod -Method Post -ContentType "application/json" -Uri "http://localhost:4000/contacts/<contact-id>/identities/link" -Body '{"platform":"webchat","channelAccountId":"00000000-0000-4000-8000-000000000020","externalUserId":"visitor-api-demo","displayName":"Visitor API Demo"}'
```

Unlink an identity:

```powershell
Invoke-RestMethod -Method Post -ContentType "application/json" -Uri "http://localhost:4000/contacts/<contact-id>/identities/unlink" -Body '{"identityId":"<identity-id>"}'
```

Set primary identity:

```powershell
Invoke-RestMethod -Method Patch -ContentType "application/json" -Uri "http://localhost:4000/contacts/<contact-id>/primary-identity" -Body '{"identityId":"<identity-id>"}'
```

Patch contact:

```powershell
Invoke-RestMethod -Method Patch -ContentType "application/json" -Uri "http://localhost:4000/contacts/<contact-id>" -Body '{"leadStatus":"follow_up","tags":["vip"]}'
```

## Manual UI Check

- Set `NEXT_PUBLIC_DATA_MODE=api`.
- Open Inbox.
- Select a conversation.
- Customer 360 should show a loading state, then persisted contact identity data from `/customer-360`.
- Switching conversations should refetch Customer 360 for the new conversation.
- API failure should show a readable Customer 360 error instead of mock CRM data.
- Empty selected conversation should keep the existing empty state.

## Rollback

Set:

```powershell
$env:NEXT_PUBLIC_DATA_MODE = "mock"
```

Mock mode remains available.

## Safety

- No real LINE, Telegram, Facebook, or Instagram outbound API calls were added.
- No real secrets or tokens were added.
- No WebSocket work was added.
- No destructive migration or database reset script was added.
