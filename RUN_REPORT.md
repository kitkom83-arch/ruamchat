# RUN_REPORT.md — ผลตรวจล่าสุดใน sandbox

วันที่ตรวจ: 2026-05-20

## สรุป

โปรเจกต์รันตรวจพื้นฐานได้บางส่วนแล้ว แต่ยังต้องให้ Codex แก้ Sprint 0 ต่อ โดยเฉพาะ `npm run build` ของฝั่ง Web

## ผลตรวจ

| คำสั่ง | ผลลัพธ์ | หมายเหตุ |
|---|---|---|
| `npm install --ignore-scripts --prefer-offline` | ผ่าน | workspace link ถูกสร้างขึ้น |
| `npm run typecheck` | ผ่าน | shared/api/web/worker ผ่านทั้งหมด |
| `npm test` | ผ่าน | 3 test files / 6 tests |
| `npm run build` | ยังไม่ผ่านครบ | shared/api/worker build ได้, web compile สำเร็จแต่ค้างหลัง `Running TypeScript` ใน sandbox |

## จุดที่เจอและแก้ชั่วคราวใน sandbox

1. path ที่มากับ zip เป็นชื่อแบบ `#U0e23...` และมีเครื่องหมาย `#` ทำให้ Vitest resolve path ผิด
2. ย้ายโฟลเดอร์ทำงานเป็น `ruamchat` แล้ว `npm test` ผ่าน
3. binary บางตัวไม่มี execute permission บน Linux เช่น `next`, `vitest`, `cross-env`
4. หลัง `npm install` workspace symlink ถูกสร้าง เช่น `node_modules/@ai-omni/shared -> ../../packages/shared`

## งานที่ Codex ต้องทำต่อทันที

```text
1. ทำความสะอาด zip/repo ไม่ให้มี node_modules, .next, dist, .env
2. ตรวจ build ฝั่ง apps/web ที่ค้างหลัง compile
3. สรุปสาเหตุ build ค้างและแก้ให้ npm run build ผ่านจริง
4. เพิ่มผลตรวจลง RUN_REPORT.md ทุกครั้งหลังแก้
```

## คำสั่งเช็กเร็ว

```bash
npm install
npm run typecheck
npm test
npm run build
```

---

# Sprint 20-24 Retrospective Summary

## Sprint 20 FINAL PASS
Broadcast campaigns, segments, audience preview, send-now/send-test, and send logs moved to backend API mode with persisted data and safe mock-only send behavior.

## Sprint 21 FINAL PASS
Tenant header guardrails were expanded across API-mode clients. API-mode pages no longer silently fallback to mock data on API failure.

## Sprint 22 FINAL PASS
Contacts page moved to backend API mode with persisted contacts, identities, and related conversations. Conversation separation by platform + channelAccountId + roomId was verified.

## Sprint 23 FINAL PASS
Settings Channels and Settings Team moved to backend API mode. Channel credentials are redacted and no raw token/secret values are returned.

## Sprint 24 FINAL PASS
SLA policies and canned replies moved to backend API mode. Inbox canned replies now come from persisted API data in API mode. Local Thai quick replies no longer appear as fallback when the canned replies API fails.

## Cross-sprint safety
- No real provider outbound.
- No external API calls in smoke tests.
- No silent mock fallback in API mode.
- Mock/local mode preserved.
- Project folder is still not a git repository, so no commits were attempted.

---

# Sprint 25 FINAL PASS

Manual inbox replies now run through backend API mode with tenant-scoped persisted messages and safe mock-only outbound/audit logging.

Validation:
- typecheck passed
- test passed
- build passed
- smoke:sprint25 passed
- externalCalls: 0
- manual reply persisted after refresh
- outbound mock audit log exists
- platform/account/room preserved
- manual UI send passed
- API-off no silent mock fallback passed
- no real provider outbound observed

Remaining:
- Project folder is not a git repository; no commit attempted.

---

# Sprint 26 FINAL PASS

Inbox conversation actions now run through backend API mode with tenant-scoped persisted updates and safe audit logs.

Validation:
- typecheck passed
- tests passed: 32 files / 266 tests
- build passed
- smoke:sprint26 passed
- externalCalls: 0
- Take Over passed
- Return to AI passed
- priority/status/follow-up/read-replied actions passed
- audit logs exist
- audit platform/account/room metadata preserved
- API-off no silent mock fallback passed
- no real provider outbound observed

Remaining:
- Project folder is not a git repository; no commit attempted.

---

# Sprint 27 FINAL PASS

Conversation audit timeline and status history now render in inbox API mode with tenant-scoped persisted data.

Validation:
- typecheck passed
- tests passed: 32 files / 272 tests
- build passed
- smoke:sprint27 passed
- externalCalls: 0
- audit log visible in UI
- status history visible in UI
- platform/account/room metadata preserved
- API-off no silent mock fallback passed
- no real provider outbound observed

Remaining:
- Project folder is not a git repository; no commit attempted.

---

# Sprint 28 FINAL PASS

Inbox Matching Automations now run through backend API mode as safe dry-run operations with persisted run records and audit logs.

Validation:
- typecheck passed
- tests passed: 32 files / 275 tests
- build passed
- smoke:sprint28 passed
- externalCalls: 0
- Matching Automations visible
- Run Flow visible
- Run Flow dry-run passed
- Recent Flow Runs updated
- flow_run_dry_run audit event visible
- API-off no silent mock fallback passed
- no real provider outbound observed

Remaining:
- Project folder is not a git repository; no commit attempted.

---

# Sprint 29 FINAL PASS

AI Suggested Reply + Feedback now runs through backend API mode with tenant-scoped persisted suggestion records, feedback persistence, safe audit logs, and no-real-OpenAI behavior by default.

Validation:
- typecheck passed
- tests passed: 33 files / 284 tests
- build passed
- smoke:sprint29 passed
- externalCalls: 0
- AI suggest passed
- AI feedback passed
- audit persistence verified
- safe response checks passed
- platform/account/room preserved
- Use AI Draft filled composer only
- Regenerate Draft returned safe API result
- Mark as Wrong persisted feedback and audit
- API-off no silent mock AI fallback passed
- no real provider outbound observed
- no real OpenAI call observed

Remaining:
- None for Sprint 29.
