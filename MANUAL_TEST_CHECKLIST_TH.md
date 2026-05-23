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
