# CODEX PROMPT — Sprint 0 Project Health Check / Cleanup

คัดลอกข้อความด้านล่างไปให้ Codex ใช้ทำงานรอบแรก

---

คุณคือ senior full-stack engineer ช่วยตรวจและแก้โปรเจกต์ `ai-omnichannel-chat-rooms` รอบ Sprint 0 เท่านั้น

## เป้าหมายรอบนี้

ทำให้โปรเจกต์สะอาดและตรวจพื้นฐานผ่านก่อนเริ่มเพิ่มฟีเจอร์

## Scope ที่ให้ทำ

1. ตรวจ `.gitignore` และ `.dockerignore`
2. ห้าม commit/เก็บไฟล์เหล่านี้ใน repo หรือ zip:
   - `node_modules`
   - `.next`
   - `dist`
   - `coverage`
   - `test-results`
   - `playwright-report`
   - `.env`
   - `.env.local`
   - `.env.production`
   - `*.log`
3. ใช้ `.env.example` แทน `.env` จริง
4. รันคำสั่ง:
   ```bash
   npm install
   npm run typecheck
   npm test
   npm run build
   ```
5. ถ้า `npm run build` ค้างที่ `apps/web` หลัง `Compiled successfully` / `Running TypeScript` ให้ไล่แก้ให้ build จบจริง
6. ห้ามเพิ่มฟีเจอร์ใหม่ในรอบนี้
7. ห้ามแตะ live token / secret / production database

## ข้อมูลจากการตรวจเบื้องต้น

- `npm run typecheck` ผ่านได้หลัง `npm install` สร้าง workspace link ถูก
- `npm test` ผ่าน 3 files / 6 tests หลังย้าย path ไม่ให้มี `#` และ chmod binary บน Linux
- `npm run build` ฝั่ง `apps/web` compile ผ่าน แต่ค้างระหว่างขั้นตอนหลังจากนั้นใน sandbox ต้องตรวจต่อ

## สิ่งที่ต้องส่งกลับ

ตอบกลับเป็นรูปแบบนี้เท่านั้น:

```text
สรุปงานที่ทำ:
- ...

Changed files:
- ...

Test result:
- npm install: pass/fail
- npm run typecheck: pass/fail
- npm test: pass/fail
- npm run build: pass/fail

Error ที่ยังเหลือ:
- ...

วิธีเช็กเร็วสำหรับพี่:
1. ...
2. ...
```
