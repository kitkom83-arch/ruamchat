# Sprint 20 FINAL PASS

Broadcast Persistence + Safe Queue.

## Summary

Broadcast campaigns, segments, audience preview, send-now/send-test, and send logs now run in backend API mode with persisted data and safe mock-only send behavior.

## Final fixes

- Fixed `BroadcastsController` DI by explicitly injecting `BroadcastService`.
- Fixed web API client tenant scoping by sending `x-tenant-id`.
- Added regression coverage for controller DI and broadcast API preview tenant header/rendered fields.

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed, 26 test files / 220 tests.
- `npm run build`: passed.
- Live API `/broadcasts/campaigns` and `/broadcasts/segments` returned persisted data.
- UI `/broadcasts` loaded API mode with 3 campaigns / 2 segments.
- Audience Preview rendered persisted tenant data.
- Send logs remained mock-only.
- API-off refresh showed Broadcast API error and did not silently fallback to mock data.

## Safety

- No real outbound provider send.
- Send logs remained mock-only.
- No Prisma schema changes.

## Remaining issues

- None for Sprint 20.
