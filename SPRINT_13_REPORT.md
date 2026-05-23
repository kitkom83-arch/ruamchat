# Sprint 13 Report: Platform Webhooks Persistence + Inbox API Mode

## Implemented

- Persisted inbound webhook messages for Telegram, LINE, Facebook, and Instagram through the existing `ConversationService.ingest` path.
- Each inbound webhook resolves the platform from the route and the channel account from `:channelAccountId`.
- Inbound persistence creates or reuses the platform/account room, contact identity, open conversation, and inbound message.
- Dedupe remains scoped to `(channelAccountId, platformMessageId)` so conversations do not merge across platforms or accounts.
- Webhook responses now include `messageId` with `conversationId` and `duplicate`.
- Telegram normalizer supports lightweight demo payloads that omit `update_id` and use `message.message_id` as `platformMessageId`.
- Inbox API mode remains room-scoped and does not fall back to mock conversations for empty API rooms.
- Agent replies on platform-created conversations remain outbound mock messages with `deliveryStatus = sent_mock`.

## Demo Channel Account IDs

- Webchat / Main Website: `demo-webchat` for `/webhooks/webchat/:accountKey`; seeded UUID `00000000-0000-4000-8000-000000000020`
- Telegram / Bot 007237: `00000000-0000-4000-8000-000000000021`
- LINE / LINE OA Main: `00000000-0000-4000-8000-000000000022`
- Facebook / Page หลัก: `00000000-0000-4000-8000-000000000023`
- Instagram / IG ร้านค้า: `00000000-0000-4000-8000-000000000024`

## Webhook Test Payloads

Telegram:

```json
{
  "message": {
    "message_id": "tg-msg-001",
    "chat": { "id": "tg-user-1", "first_name": "Krit" },
    "text": "telegram test message"
  }
}
```

LINE:

```json
{
  "events": [
    {
      "type": "message",
      "replyToken": "line-reply-token-demo",
      "message": { "id": "line-msg-001", "type": "text", "text": "line test message" },
      "source": { "type": "user", "userId": "line-user-1" },
      "timestamp": 1710000000000
    }
  ]
}
```

Facebook:

```json
{
  "entry": [
    {
      "messaging": [
        {
          "sender": { "id": "fb-user-1" },
          "recipient": { "id": "fb-page-1" },
          "timestamp": 1710000000000,
          "message": { "mid": "fb-msg-001", "text": "facebook test message" }
        }
      ]
    }
  ]
}
```

Instagram:

```json
{
  "entry": [
    {
      "messaging": [
        {
          "sender": { "id": "ig-user-1" },
          "recipient": { "id": "ig-account-1" },
          "timestamp": 1710000000000,
          "message": { "mid": "ig-msg-001", "text": "instagram test message" }
        }
      ]
    }
  ]
}
```

## Manual API Test Steps

Use API mode and mock channel mode:

```powershell
$env:NEXT_PUBLIC_DATA_MODE = "api"
$env:CHANNEL_MODE = "mock"
$env:META_CHANNEL_MODE = "mock"
```

Create platform messages:

```powershell
Invoke-RestMethod -Method Post -ContentType "application/json" -Headers @{ "x-telegram-bot-api-secret-token" = "mock-telegram-secret" } -Uri "http://localhost:4000/webhooks/telegram/00000000-0000-4000-8000-000000000021" -Body '{"message":{"message_id":"tg-msg-001","chat":{"id":"tg-user-1","first_name":"Krit"},"text":"telegram test message"}}'
Invoke-RestMethod -Method Post -ContentType "application/json" -Headers @{ "x-line-signature" = "mock-line-signature" } -Uri "http://localhost:4000/webhooks/line/00000000-0000-4000-8000-000000000022" -Body '{"events":[{"type":"message","replyToken":"line-reply-token-demo","message":{"id":"line-msg-001","type":"text","text":"line test message"},"source":{"type":"user","userId":"line-user-1"},"timestamp":1710000000000}]}'
Invoke-RestMethod -Method Post -ContentType "application/json" -Headers @{ "x-hub-signature-256" = "mock-meta-signature" } -Uri "http://localhost:4000/webhooks/facebook/00000000-0000-4000-8000-000000000023" -Body '{"entry":[{"messaging":[{"sender":{"id":"fb-user-1"},"recipient":{"id":"fb-page-1"},"timestamp":1710000000000,"message":{"mid":"fb-msg-001","text":"facebook test message"}}]}]}'
Invoke-RestMethod -Method Post -ContentType "application/json" -Headers @{ "x-hub-signature-256" = "mock-meta-signature" } -Uri "http://localhost:4000/webhooks/instagram/00000000-0000-4000-8000-000000000024" -Body '{"entry":[{"messaging":[{"sender":{"id":"ig-user-1"},"recipient":{"id":"ig-account-1"},"timestamp":1710000000000,"message":{"mid":"ig-msg-001","text":"instagram test message"}}]}]}'
```

Verify rooms and messages:

```powershell
Invoke-RestMethod "http://localhost:4000/rooms"
Invoke-RestMethod "http://localhost:4000/rooms/<telegram-room-id>/conversations?tab=human&filter=all"
Invoke-RestMethod "http://localhost:4000/conversations/<conversation-id>/messages"
Invoke-RestMethod -Method Post -ContentType "application/json" -Uri "http://localhost:4000/conversations/<conversation-id>/messages" -Body '{"text":"แอดมินรับเรื่องแล้วครับ","senderType":"agent"}'
```

Expected agent reply status: `sent_mock`.

## Manual UI Test

- Set `NEXT_PUBLIC_DATA_MODE=api`.
- Open Inbox.
- Select each seeded room.
- Telegram, LINE, Facebook, and Instagram rooms should show only conversations created through their own webhook.
- Webchat should not show platform conversations.
- Empty rooms should render the empty state instead of mock cards.

## Rollback

Set:

```powershell
$env:NEXT_PUBLIC_DATA_MODE = "mock"
```

Mock mode remains available and unchanged.

## Safety

- No real LINE, Telegram, Facebook, or Instagram outbound API calls are made.
- Agent replies are persisted locally and exposed as `deliveryStatus = sent_mock`.
- No real tokens or secrets were added.
- No destructive migrations or reset scripts were added.
