#!/usr/bin/env sh
set -eu

if [ ! -f ".env.production" ]; then
  echo "Missing .env.production"
  echo "Copy .env.production.example to .env.production and edit real values first."
  exit 1
fi

node scripts/validate-production-env.mjs .env.production
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml build
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml run --rm migrate
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml up -d postgres redis minio api worker web caddy
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml ps
