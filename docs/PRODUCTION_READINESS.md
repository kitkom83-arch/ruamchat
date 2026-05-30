# Sprint 52 Production Readiness

This checklist prepares Ruamchat for a controlled production or pilot deployment while keeping real provider outbound disabled.

## Safety Posture

- `PROVIDER_OUTBOUND_MODE=disabled`, `CHANNEL_MODE=mock`, and `META_CHANNEL_MODE=mock` are required for Sprint 52.
- `AI_MODE=mock` is required for this pilot readiness pass so external calls remain `0`.
- `NEXT_PUBLIC_DATA_MODE=api` is required in production so the web app calls the API and does not silently fall back to mock data.
- Mock/local mode remains available through `.env.example` with `NEXT_PUBLIC_DATA_MODE=mock`.
- Do not place real provider credentials in code, tests, docs, seed data, logs, or committed env files.

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
- Signature verification is tested in mock/local mode.
- Credential fields can be configured in the environment or channel account store, but outbound remains disabled.

Telegram:

- Webhook URL is planned and points at `/webhooks/telegram/CHANNEL_ACCOUNT_ID`.
- Webhook header verification is tested in mock/local mode.
- Bot credential is not used for real outbound in Sprint 52.

Facebook:

- Webhook URL and verify challenge are planned for the page account.
- Meta app signing is tested in mock/local mode.
- Page credential is not used for real outbound in Sprint 52.

Instagram:

- Webhook URL and verify challenge are planned for the Instagram business account.
- Meta app signing is tested in mock/local mode.
- Instagram credential is not used for real outbound in Sprint 52.

## Health And Readiness

- API liveness: `GET /health`
- API readiness: `GET /health/readiness`

Readiness responses expose only boolean/configuration state and safe mode names. They must not expose provider credentials, database credentials, raw provider payloads, or bearer/API values.

## Smoke And Regression

Run the Sprint 52 readiness smoke with the API running:

```bash
npm run smoke:sprint52
```

Then run the regression smokes required for this sprint:

```bash
npm run smoke:sprint51
npm run smoke:sprint50
npm run smoke:sprint49
npm run smoke:sprint48
```

`smoke:sprint52` verifies the readiness docs/env posture, health endpoints, provider outbound safety, `externalCalls=0`, and that `/broadcasts/campaigns` still responds in API mode.

## Backup And Rollback

Before pilot deploy:

- Export PostgreSQL with `pg_dump` from the production database container or managed database.
- Save the current image tag, commit SHA, and `.env.production` checksum outside git.
- Confirm the restore command on a non-production database.
- Keep rollback simple: restore the previous image/tag, restore the previous env file, restart `api`, `worker`, `web`, and `caddy`, then recheck `/health` and `/health/readiness`.
