# STEP 6 — Media Deploy Checklist

Prepares the media (image/file) send/receive feature for a controlled production/pilot rollout while keeping real provider outbound **disabled by default**.

## Safety posture (unchanged from earlier sprints)
- Outbound media obeys the SAME gate as outbound text: `assertProviderOutboundAllowed` + recipient allowlist. With the allowlist empty, media send is blocked (`provider_outbound_disabled` / `recipient_not_allowlisted`).
- No provider credentials in code, tests, docs, seed data, logs, or committed env files. Configure everything via environment variables outside git.
- Worker only transmits attachments with absolute `http(s)` URLs; relative `/media/...` and raw `telegram:<file_id>` refs are skipped.

## Environment variables

### API (`apps/api`)
| Variable | Dev default | Production |
| --- | --- | --- |
| `MEDIA_STORAGE` | `local` | `s3` (or `local` on a persistent disk) |
| `MEDIA_STORAGE_DIR` | temp/local dir | absolute path to a **persistent** volume (if `local`) |
| `MEDIA_PUBLIC_BASE_URL` | `/media` | public URL prefix that serves uploaded files (must be reachable by providers for outbound) |
| `API_JSON_BODY_LIMIT` | `40mb` | keep ≥ largest upload (base64 inflates ~33%) |
| `MEDIA_STORAGE=s3` extras | — | bucket name, region, and credentials (via env/secret manager) — **S3 backend is stubbed and must be wired before enabling** |

### Web (`apps/web`)
| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | e.g. `http://localhost:4000` in dev; the public API origin in prod (used by `resolveAttachmentUrl` to build absolute media URLs) |
| `NEXT_PUBLIC_DATA_MODE` | `api` in production |

### Provider media permissions/tokens (required for real inbound/outbound)
- **Telegram:** bot token with file access (`getFile` + `sendPhoto`/`sendDocument`).
- **LINE:** channel access token with message content + push image permissions.
- **Meta (Messenger/Instagram):** page/app token with attachment upload + send permissions.

## Upload limits (enforced in `packages/shared`)
- Image ≤ **10 MB** (`MEDIA_IMAGE_MAX_BYTES`)
- File/audio ≤ **25 MB** (`MEDIA_FILE_MAX_BYTES`)

## Migrations
- **None required.** Prisma models already carry `messageType` + attachment fields; the new schema fields are additive with backward-compatible defaults.

## Go-live steps
1. Provision persistent storage (S3 bucket or durable disk) and set `MEDIA_STORAGE*` + `MEDIA_PUBLIC_BASE_URL`.
2. If using S3, wire the S3 backend in `MediaStorageService` (currently `local` only; `s3` throws until implemented).
3. Set provider media tokens/permissions in the environment (never in git).
4. Verify inbound: send a photo to a connected Telegram bot → confirm attachment URL renders in Inbox.
5. Verify upload: attach a file in the composer → confirm it stores and renders.
6. **Only when ready:** add pilot recipients to the outbound allowlist and enable outbound flags to allow real media send. Start with a tiny allowlist.

## What the user must approve/prepare before real outbound
1. Production storage (S3/blob or persistent disk) + public base URL.
2. Media permissions/tokens for LINE / Telegram / Meta.
3. Explicitly open the outbound allowlist (kept empty in this PR for safety).
