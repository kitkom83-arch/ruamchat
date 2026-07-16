# MANUAL_TEST_CHECKLIST_TH.md — จุดที่พี่ต้องเทสจริง

เอกสารนี้คือรายการเทสที่ Codex/Unit test ทำแทนไม่ได้เต็ม เพราะต้องใช้บัญชีจริง มือถือจริง หรือความรู้ธุรกิจจริง

---

## 1. Webchat Widget

```text
[ ] เปิดหน้า demo webchat ได้
[ ] พิมพ์ข้อความจาก widget แล้วเข้า Inbox
[ ] แอดมินตอบจาก Dashboard แล้ว widget เห็นข้อความ
[ ] refresh หน้าเว็บแล้ว session ยังอยู่
[ ] ปิด/เปิดกล่องแชทแล้วประวัติยังอยู่
```

ข้อความลองเทส:

```text
สนใจแพ็กเกจเริ่มต้น ราคาเท่าไรครับ
```

---

## 2. LINE OA

```text
[ ] ใช้มือถือทัก LINE OA จริง
[ ] ข้อความเข้า LINE Room ถูกบัญชี
[ ] ชื่อลูกค้าหรือ external user id แสดงถูก
[ ] แอดมินตอบกลับจาก Dashboard แล้วมือถือได้รับ
[ ] AI mode suggest/auto ทำงานตามที่ตั้งค่า
```

---

## 3. Telegram Bot

```text
[ ] ใช้ Telegram ทัก bot จริง
[ ] ข้อความเข้า Telegram Room ถูก bot
[ ] แอดมินตอบกลับจาก Dashboard แล้ว Telegram ได้รับ
[ ] webhook secret ป้องกัน request ปลอมได้
```

---

## 4. Facebook Messenger

```text
[ ] ใช้บัญชีจริงทัก Facebook Page
[ ] ข้อความเข้า Facebook Room ถูก Page
[ ] แอดมินตอบกลับได้
[ ] ถ้า app ยังไม่ผ่าน permission ให้ทดสอบด้วย admin/tester account ก่อน
```

---

## 5. Instagram DM

```text
[ ] ใช้บัญชีจริงทัก IG Professional account
[ ] DM เข้า Instagram Room ถูกบัญชี
[ ] comment/story reply ถ้ามี ต้องเข้าประเภท event ถูก
[ ] แอดมินตอบกลับได้ตาม permission ที่ Meta อนุญาต
```

---

## 6. AI คำตอบจริง

```text
[ ] AI ตอบตรงข้อมูลธุรกิจ
[ ] AI ไม่เดาราคาเองถ้าไม่มีข้อมูล
[ ] AI ส่งต่อคนเมื่อถามเรื่องคืนเงิน/ยกเลิก/จ่ายเงิน/ข้อมูลส่วนตัว
[ ] น้ำเสียงเหมาะกับแบรนด์
[ ] AI Summary ช่วยให้แอดมินเข้าใจแชทเร็ว
```

ข้อความลองเทส:

```text
1. ราคาแพ็กเกจเริ่มต้นเท่าไร
2. ขอคืนเงินได้ไหม
3. มีโปรวันนี้ไหม
4. ผมอยากให้ทีมติดต่อกลับ
5. สินค้านี้เหมาะกับร้านเล็กไหม
```

---

## 7. Human Takeover

```text
[ ] กด Take Over แล้ว AI หยุดตอบอัตโนมัติ
[ ] แอดมินตอบเองได้
[ ] กด Return to AI แล้ว AI กลับมาทำงาน
[ ] มี log ว่าใคร takeover
```

---

## 8. สิทธิ์แอดมิน

```text
[ ] Agent เห็นเฉพาะห้องที่มีสิทธิ์
[ ] Viewer ดูอย่างเดียว ตอบไม่ได้
[ ] Admin เปลี่ยน AI mode ได้
[ ] Owner จัดการ channel/settings ได้
```

---

## 9. เตรียม env ก่อน go-live (outbound จริง + AI จริง)

> ⚠️ ใส่ secret จริงในไฟล์ `.env` ของเครื่อง/เซิร์ฟเวอร์เท่านั้น (นอก git) ห้าม commit/echo ค่าจริง

```text
[ ] สร้าง APP_ENCRYPTION_KEY: openssl rand -base64 32  (ต้องได้ 32-byte base64)
[ ] ใส่ OPENAI_API_KEY จริง + ตั้ง AI_MODE=real + OPENAI_ALLOW_REAL_CALLS=true
[ ] ตั้ง PROVIDER_OUTBOUND_ENABLED=true, PROVIDER_OUTBOUND_MODE=sandbox
[ ] ตั้ง PROVIDER_SANDBOX_MODE=enabled, CHANNEL_MODE=sandbox (Meta: META_CHANNEL_MODE)
[ ] ใส่ allowlist เฉพาะเบอร์/บัญชีของตัวเองก่อน:
      LINE_SANDBOX_ALLOWLIST=<lineUserId ของคุณ>
      TELEGRAM_SANDBOX_ALLOWLIST=<telegram chatId ของคุณ>
[ ] รัน guard smoke (ไม่ยิงเน็ต): npm run smoke:outbound-golive  → ต้องผ่าน 8/8
```

เก็บ channel access token แบบเข้ารหัสลง DB (ไม่ commit ค่า):

```text
[ ] LINE:
      $env:APP_ENCRYPTION_KEY="<base64-32-byte>"; $env:DATABASE_URL="postgresql://..."
      "<LINE_CHANNEL_ACCESS_TOKEN>" | node scripts/set-channel-token.mjs --channel-account-id=<lineAccountId>
[ ] Telegram:
      "<TELEGRAM_BOT_TOKEN>" | node scripts/set-channel-token.mjs --channel-account-id=<telegramAccountId>
[ ] (ถ้าต้องการ) เก็บ webhook secret: ตั้ง $env:CHANNEL_WEBHOOK_SECRET แล้วเพิ่ม --set-webhook-secret
[ ] สคริปต์ต้องพิมพ์เฉพาะ fingerprint (len/sha256 ย่อ) ไม่โชว์ token จริง
```

---

## 10. Go-live end-to-end (ทดสอบด้วยมือถือจริง)

LINE / Telegram (สลับทำทีละช่องทาง):

```text
[ ] ใช้มือถือทัก LINE OA / Telegram bot จริง (บัญชีที่อยู่ใน allowlist)
[ ] ข้อความเข้า Inbox ถูกห้อง/ถูกบัญชี ภายในไม่กี่วินาที
[ ] ถ้า AI_MODE=real + auto: AI ตอบกลับอัตโนมัติ และมือถือได้รับข้อความจริง
[ ] แอดมินพิมพ์ตอบจาก Dashboard แล้วมือถือได้รับข้อความจริง
[ ] ลองส่งหา recipient ที่ "ไม่อยู่" ใน allowlist → ต้องถูก guard บล็อก (ไม่มีการส่งจริง)
[ ] ดู audit log: ต้องเห็น action "outbound.sent" (จริง) ไม่ใช่ "outbound.mock_queued"
```

Webchat realtime (widget เด้งเรียลไทม์):

```text
[ ] เปิดหน้า /webchat-demo ใน API mode (NEXT_PUBLIC_DATA_MODE=api)
[ ] พิมพ์ข้อความจาก widget → สร้าง conversation ใน Inbox
[ ] แอดมิน/AI ตอบกลับ → ข้อความเด้งเข้า widget แทบจะทันที (ผ่าน SSE)
      (ตรวจ DevTools > Network: มี stream /webchat/stream/<conversationId> ค้างอยู่)
[ ] ถ้า SSE ใช้ไม่ได้ (เช่น proxy บล็อค) widget ยัง fallback เป็น poll ทุก 2.5s
[ ] refresh หน้าเว็บแล้ว conversation/ประวัติยังอยู่ และ stream ต่อใหม่ได้
```
