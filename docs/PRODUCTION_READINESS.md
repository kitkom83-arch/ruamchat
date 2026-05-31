# Sprint 54 Provider Sandbox UI And Webhook Readiness

This checklist prepares Ruamchat for a controlled production or pilot deployment while keeping real provider outbound disabled.

## Safety Posture

- `PROVIDER_OUTBOUND_MODE=disabled`, `PROVIDER_OUTBOUND_ENABLED=false`, `PROVIDER_SANDBOX_MODE=disabled`, `CHANNEL_MODE=mock`, and `META_CHANNEL_MODE=mock` are required for Sprint 54.
- `AI_MODE=mock` is required for this pilot readiness pass so external calls remain `0`.
- `NEXT_PUBLIC_DATA_MODE=api` is required in production so the web app calls the API and does not silently fall back to mock data.
- Mock/local mode remains available through `.env.example` with `NEXT_PUBLIC_DATA_MODE=mock`.
- Do not place real provider credentials in code, tests, docs, seed data, logs, or committed env files.
- Provider sandbox allowlists may be configured only outside git. Readiness responses summarize counts and never return recipient values.
- Any future real outbound-like action must pass all sandbox gates: `PROVIDER_OUTBOUND_ENABLED=true`, `PROVIDER_SANDBOX_MODE=enabled`, provider channel mode enabled, an allowlisted recipient, and tenant-owned channel account context.

## Environment Validation

Use the safe validator before deploying:

```bash
npm run validate:production-env -- .env.production
```

The validator checks required names and readiness conditions without printing configured values. It intentionally fails on placeholder values from `.env.production.example`.

Required production posture:

- `NODE_ENV=production`
- `API_MODE=api`
- `DATA_MODE=api`
- `NEXT_PUBLIC_DATA_MODE=api`
- `NEXT_PUBLIC_API_BASE_URL=/api` or the production API base path
- `AI_MODE=mock`
- `PROVIDER_OUTBOUND_MODE=disabled`
- `PROVIDER_OUTBOUND_ENABLED=false`
- `PROVIDER_SANDBOX_MODE=disabled`
- `CHANNEL_MODE=mock`
- `META_CHANNEL_MODE=mock`

## Deployment Checklist

- Domain: DNS `A` record points to the VPS or load balancer.
- SSL: ports `80` and `443` are open and Caddy can issue certificates.
- Database: PostgreSQL volume exists, credentials are replaced, and `DATABASE_URL` points at the production database.
- Redis: Redis is reachable from API and worker containers.
- Env vars: `.env.production` passes `npm run validate:production-env -- .env.production`.
- Migrations: run the existing deploy migration step only after backup; do not run destructive resets.
- Backup: take a PostgreSQL backup and confirm restore instructions before pilot traffic.
- Rollback: record the last known good image/tag and keep the previous `.env.production` available outside git.
- Monitoring: check API, worker, Caddy, Redis, and PostgreSQL logs after deploy.

## Provider Readiness Checklist

LINE:

- Webhook URL is planned and points at `/webhooks/line/CHANNEL_ACCOUNT_ID`.
- Webhook signature readiness uses HMAC SHA-256 over the raw request body with a channel secret configured outside git.
- Sandbox outbound remains disabled unless `PROVIDER_OUTBOUND_ENABLED=true`, `PROVIDER_SANDBOX_MODE=enabled`, `CHANNEL_MODE=real` or `sandbox`, and the LINE test recipient is present in `PROVIDER_SANDBOX_ALLOWLIST` or `LINE_SANDBOX_ALLOWLIST`.
- Readiness output shows `credentialStatus`, `webhookStatus`, and allowlist counts only.

Telegram:

- Webhook URL is planned and points at `/webhooks/telegram/CHANNEL_ACCOUNT_ID`.
- Webhook readiness validates the `x-telegram-bot-api-secret-token` header against a webhook secret configured outside git.
- Sandbox outbound remains disabled unless `PROVIDER_OUTBOUND_ENABLED=true`, `PROVIDER_SANDBOX_MODE=enabled`, `CHANNEL_MODE=real` or `sandbox`, and the Telegram test chat id is present in `PROVIDER_SANDBOX_ALLOWLIST` or `TELEGRAM_SANDBOX_ALLOWLIST`.
- Bot credentials are never used for real outbound in default Sprint 53 readiness.

Facebook Messenger:

- Webhook URL and verify challenge are planned for the page account.
- Meta app signing readiness validates `x-hub-signature-256` with an app secret configured outside git.
- Sandbox outbound remains disabled unless `PROVIDER_OUTBOUND_ENABLED=true`, `PROVIDER_SANDBOX_MODE=enabled`, `META_CHANNEL_MODE=real` or `sandbox`, and the Messenger test recipient is present in `PROVIDER_SANDBOX_ALLOWLIST` or `FACEBOOK_SANDBOX_ALLOWLIST`.
- Page credentials are never used for real outbound in default Sprint 53 readiness.

Instagram Messaging:

- Webhook URL and verify challenge are planned for the Instagram business account.
- Meta app signing readiness validates `x-hub-signature-256` with an app secret configured outside git.
- Sandbox outbound remains disabled unless `PROVIDER_OUTBOUND_ENABLED=true`, `PROVIDER_SANDBOX_MODE=enabled`, `META_CHANNEL_MODE=real` or `sandbox`, and the Instagram test recipient is present in `PROVIDER_SANDBOX_ALLOWLIST` or `INSTAGRAM_SANDBOX_ALLOWLIST`.
- Instagram credentials are never used for real outbound in default Sprint 53 readiness.

## Sandbox Env Placeholders

Committed env examples must keep these empty or disabled:

```bash
PROVIDER_OUTBOUND_MODE=disabled
PROVIDER_OUTBOUND_ENABLED=false
PROVIDER_SANDBOX_MODE=disabled
PROVIDER_SANDBOX_ALLOWLIST=
LINE_SANDBOX_ALLOWLIST=
TELEGRAM_SANDBOX_ALLOWLIST=
FACEBOOK_SANDBOX_ALLOWLIST=
INSTAGRAM_SANDBOX_ALLOWLIST=
```

For an operator-run sandbox outside git, use placeholder-style values until real test recipients are configured in the deployment secret store:

```bash
PROVIDER_OUTBOUND_MODE=sandbox
PROVIDER_OUTBOUND_ENABLED=true
PROVIDER_SANDBOX_MODE=enabled
PROVIDER_SANDBOX_ALLOWLIST=line:<line-test-recipient-id>,telegram:<telegram-test-chat-id>
FACEBOOK_SANDBOX_ALLOWLIST=<messenger-test-recipient-id>
INSTAGRAM_SANDBOX_ALLOWLIST=<instagram-test-recipient-id>
```

Do not commit the resolved recipient ids, tokens, app secrets, verify tokens, page access values, or channel secrets.

## Health And Readiness

- API liveness: `GET /health`
- API readiness: `GET /health/readiness`

Readiness responses expose only boolean/configuration state and safe mode names. They must not expose provider credentials, database credentials, raw provider payloads, or bearer/API values.

Provider readiness exposes `configured` or `not_configured` style status and allowlist counts. It must not return allowlist entries, signatures, raw webhook bodies, tokens, secrets, or provider payloads. `externalCalls=0` remains the readiness baseline.

The web settings channel page includes a provider sandbox readiness panel. In `NEXT_PUBLIC_DATA_MODE=api`, it fetches `GET /health/readiness` through the API client and must show a visible Provider Readiness API error if the backend is unavailable. It must not silently render mock provider rows after an API failure.

## Smoke And Regression

Run the Sprint 52 readiness smoke with the API running:

```bash
npm run smoke:sprint52
npm run smoke:sprint53
npm run smoke:sprint54
```

Then run the regression smokes required for this sprint:

```bash
npm run smoke:sprint51
npm run smoke:sprint50
npm run smoke:sprint49
npm run smoke:sprint48
```

`smoke:sprint52` verifies the readiness docs/env posture, health endpoints, provider outbound safety, `externalCalls=0`, and that `/broadcasts/campaigns` still responds in API mode.

`smoke:sprint54` verifies the provider readiness UI wiring, provider readiness response shape, `realOutboundEnabled=false`, `externalCalls=0`, allowlist count-only summaries, and absence of raw token/secret/provider payload fields.

## Backup And Rollback

Before pilot deploy:

- Export PostgreSQL with `pg_dump` from the production database container or managed database.
- Save the current image tag, commit SHA, and `.env.production` checksum outside git.
- Confirm the restore command on a non-production database.
- Keep rollback simple: restore the previous image/tag, restore the previous env file, restart `api`, `worker`, `web`, and `caddy`, then recheck `/health` and `/health/readiness`.
