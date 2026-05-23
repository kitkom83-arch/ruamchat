# TASK_LIST.md — ระบบรวมแชท AI-first

เอกสารนี้คือรายการงานสำหรับให้ Codex / Dev ทำต่อแบบเป็นรอบเล็ก ๆ ตรวจง่าย และลดความเสี่ยงพังทั้งโปรเจกต์

## หลักการทำงาน

```text
1. แก้ทีละ Sprint ย่อย
2. ทุก Sprint ต้องมี test หรือวิธีเช็กเร็ว
3. ห้ามใส่ token / secret จริงในโค้ด
4. ห้ามลบ database จริง
5. ห้าม deploy production โดยไม่ได้สั่ง
6. ทุกครั้งต้องสรุป changed files + test result
```

---

## Sprint 0 — Project Health Check / Cleanup

### เป้าหมาย

ทำให้โปรเจกต์สะอาด รันคำสั่งตรวจพื้นฐานได้ และรู้ error จริงก่อนเริ่มเพิ่มฟีเจอร์

### งาน

| ID | Priority | Task | จุดที่แก้ | เสร็จจริงเมื่อ |
|---|---:|---|---|---|
| S0-01 | P0 | ลบไฟล์ build/dependency ออกจาก repo/zip | `node_modules`, `.next`, `dist`, `coverage`, `.env` | zip/repo ไม่มีไฟล์หนักและไม่มี secret |
| S0-02 | P0 | ตรวจ `.gitignore` และ `.dockerignore` | root | กัน `node_modules`, `.next`, `dist`, `.env`, logs ได้ครบ |
| S0-03 | P0 | รัน `npm install` แล้วให้ workspace link ถูก | root | `node_modules/@ai-omni/shared` link ไป `packages/shared` |
| S0-04 | P0 | รัน `npm run typecheck` | root | ผ่านทุก workspace |
| S0-05 | P0 | รัน `npm test` | root | unit tests ผ่านทั้งหมด |
| S0-06 | P0 | แก้ `npm run build` ที่ค้างหลัง Next compile | `apps/web`, config Next/TS | build จบได้จริง |
| S0-07 | P1 | เพิ่มรายงานการตรวจโปรเจกต์ | `RUN_REPORT.md` | มีผล typecheck/test/build ล่าสุด |

### เช็กเร็ว

```bash
npm install
npm run typecheck
npm test
npm run build
```

---

## Sprint 1 — Inbox Rooms MVP

### เป้าหมาย

หน้า Inbox ต้องแยกห้องตามแพลตฟอร์ม/บัญชี ไม่รวมทุกแพลตฟอร์มเป็นแชทเดียว

### งาน

| ID | Priority | Task | จุดที่แก้ | เสร็จจริงเมื่อ |
|---|---:|---|---|---|
| S1-01 | P0 | ทำ Sidebar แยก platform/account | `apps/web/app/page.tsx` | เห็น Webchat / Telegram / LINE แยกบัญชี |
| S1-02 | P0 | เพิ่มจำนวนเคสต่อห้อง | API rooms + UI | แต่ละ room มี count |
| S1-03 | P0 | Filter ต่อห้อง | UI + API query | All/My/Unassigned/AI Active/Need Human/Unread/Unreplied/Follow Up/Closed/Spam ใช้ได้ |
| S1-04 | P0 | เพิ่มแท็บ Human / Bot | UI + filter logic | กด Human เห็นเคสคน, Bot เห็นเคส AI |
| S1-05 | P0 | แสดง AI State Badge | conversation list + chat header | เห็น `AI Active`, `Need Human`, `Human Taken`, `Closed` |
| S1-06 | P1 | เพิ่ม Search box ใน queue | UI + API | ค้นชื่อลูกค้า/ข้อความล่าสุดได้ |
| S1-07 | P1 | เพิ่ม empty/error/loading state | UI | เวลาไม่มีแชทหรือ API error มีข้อความชัดเจน |

### เช็กเร็ว

```text
1. เปิด Dashboard
2. กดห้อง Webchat / Telegram / LINE
3. กด filter แต่ละอัน
4. กด Human / Bot
5. รายการแชทต้องเปลี่ยนตามที่เลือก
```

---

## Sprint 2 — Webchat จริง

### เป้าหมาย

ทำ Webchat widget ให้ฝังเว็บได้ รับข้อความเข้า Inbox และตอบกลับลูกค้าได้

### งาน

| ID | Priority | Task | จุดที่แก้ | เสร็จจริงเมื่อ |
|---|---:|---|---|---|
| S2-01 | P0 | สร้าง Webchat widget | `apps/widget` หรือ `apps/web/public/widget.js` | ฝัง `<script>` แล้วเปิดกล่องแชทได้ |
| S2-02 | P0 | สร้าง demo page | `apps/web/app/widget-demo` | เปิดหน้า demo แล้วลองคุยได้ |
| S2-03 | P0 | ส่งข้อความจาก widget เข้า webhook | widget + API webhook | ข้อความเข้า Inbox |
| S2-04 | P0 | ทำ outbound กลับ widget | WebSocket/SSE + worker/API | แอดมินตอบแล้วลูกค้าเห็นทันที |
| S2-05 | P1 | เก็บ visitor/session id | widget + API | refresh แล้วแชทเดิมยังอยู่ |
| S2-06 | P1 | เพิ่ม smoke test webchat | test script | ส่ง mock message แล้วตรวจ DB/API |

### เช็กเร็ว

```text
1. เปิด widget demo
2. พิมพ์ “สนใจราคา”
3. Dashboard ต้องมี conversation ใหม่
4. แอดมินพิมพ์ตอบ
5. Widget ต้องเห็นข้อความตอบกลับ
```

---

## Sprint 3 — AI Worker ใช้ OpenAI จริง

### เป้าหมาย

Worker ต้องไม่ใช้ local fallback เป็นหลัก แต่เรียก OpenAI แล้วคืนผลแบบ JSON ที่ระบบใช้ต่อได้

### งาน

| ID | Priority | Task | จุดที่แก้ | เสร็จจริงเมื่อ |
|---|---:|---|---|---|
| S3-01 | P0 | แยก AI Engine ให้ worker ใช้ได้ | `apps/api/src/services/openai-orchestrator.service.ts` หรือ shared service | worker เรียก AI service เดียวกับ API ได้ |
| S3-02 | P0 | ใช้ OpenAI Responses API | AI service | มี request/response จริงเมื่อมี `OPENAI_API_KEY` |
| S3-03 | P0 | ใช้ Structured Output | AI service + schema | ผลลัพธ์มี `intent`, `confidence`, `requiresHuman`, `replyDraft` ครบ |
| S3-04 | P0 | เก็บ AI Run | Prisma `AiRun` | ดู decision ย้อนหลังได้ |
| S3-05 | P0 | ทำ threshold policy | AI service/worker | confidence สูงตอบเอง, กลาง draft, ต่ำ handoff |
| S3-06 | P0 | Human Takeover หยุด AI | API + worker | กด Takeover แล้ว AI ไม่ตอบ auto |
| S3-07 | P1 | AI Summary Panel | UI | ด้านขวาแสดงสรุป, intent, confidence, nextAction |
| S3-08 | P1 | AI Test Lab เบื้องต้น | `apps/web/app/ai-center` | ลองถาม AI ก่อนเปิดจริงได้ |

### AI Output ที่ต้องได้

```json
{
  "intent": "pricing",
  "sentiment": "neutral",
  "priority": "normal",
  "confidence": 0.91,
  "riskLevel": "low",
  "nextAction": "draft_reply",
  "replyDraft": "แพ็กเกจเริ่มต้น...",
  "requiresHuman": false,
  "tags": ["pricing", "lead"],
  "citations": []
}
```

---

## Sprint 4 — AI Center / Knowledge Base

### เป้าหมาย

แอดมินต้องเพิ่มข้อมูลธุรกิจให้ AI อ่านได้ และ AI ต้องตอบจากข้อมูลจริง ไม่เดา

### งาน

| ID | Priority | Task | จุดที่แก้ | เสร็จจริงเมื่อ |
|---|---:|---|---|---|
| S4-01 | P0 | สร้างหน้า AI Center | `apps/web/app/ai-center` | มีเมนู Business Info, FAQ, Product, Price Rules |
| S4-02 | P0 | CRUD KnowledgeDoc | API + UI | เพิ่ม/แก้/ลบ FAQ ได้ |
| S4-03 | P0 | ให้ AI ดึง KnowledgeDoc ก่อนตอบ | AI service | ถาม FAQ แล้วตอบตรงข้อมูล |
| S4-04 | P1 | เพิ่ม source/citation | AI service + UI | เห็นว่า AI ใช้ข้อมูลจากเอกสารไหน |
| S4-05 | P1 | Upload file | API + UI | อัปโหลดเอกสารได้ |
| S4-06 | P1 | ต่อ OpenAI File Search / Vector Store | AI service | AI ค้นจากไฟล์ได้ |

---

## Sprint 5 — LINE / Telegram เชื่อมใช้งานจริง

### เป้าหมาย

LINE และ Telegram รับส่งข้อความได้จริง และปลอดภัยขึ้น

### งาน

| ID | Priority | Task | จุดที่แก้ | เสร็จจริงเมื่อ |
|---|---:|---|---|---|
| S5-01 | P0 | ตรวจ LINE webhook signature | webhook controller | signature ผิดต้อง reject |
| S5-02 | P0 | ตรวจ LINE inbound/outbound | normalizer + worker | ทัก LINE แล้วเข้า Inbox / ตอบกลับได้ |
| S5-03 | P0 | เพิ่ม Telegram secret verify | webhook controller | ไม่มี `X-Telegram-Bot-Api-Secret-Token` ต้อง reject |
| S5-04 | P0 | ตรวจ Telegram inbound/outbound | normalizer + worker | ทัก bot แล้วเข้า Inbox / ตอบกลับได้ |
| S5-05 | P1 | เพิ่ม channel status page | Settings | เห็น last webhook received / error |

### พี่ต้องเทสจริง

```text
1. ใช้มือถือทัก LINE OA จริง
2. ใช้ Telegram ทัก bot จริง
3. ดูว่าแชทเข้า Inbox ถูกห้องไหม
4. แอดมินตอบกลับ แล้วมือถือได้รับไหม
```

---

## Sprint 6 — Facebook / Instagram

### เป้าหมาย

เพิ่ม Facebook Messenger และ Instagram DM เป็น platform แยกห้อง

### งาน

| ID | Priority | Task | จุดที่แก้ | เสร็จจริงเมื่อ |
|---|---:|---|---|---|
| S6-01 | P0 | เพิ่ม platform enum | `packages/shared`, Prisma | มี `facebook`, `instagram` |
| S6-02 | P0 | เพิ่ม seed room | Prisma seed | มี Facebook/Instagram room ตัวอย่าง |
| S6-03 | P0 | เพิ่ม UI labels/icon | `apps/web` | เห็น Facebook/Instagram ใน Sidebar |
| S6-04 | P0 | เพิ่ม webhook route | API controller | รับ mock payload ได้ |
| S6-05 | P0 | เพิ่ม normalizer | API service | แปลง payload เป็นกลางได้ |
| S6-06 | P1 | เพิ่ม outbound sender mock | worker | log/send mock ได้ก่อนต่อ token จริง |
| S6-07 | P1 | ต่อ Meta App จริง | Settings/API | ใช้ Page/IG จริงได้หลังผ่าน permission |

---

## Sprint 7 — Admin Tools / CRM

### เป้าหมาย

ช่วยแอดมินทำงานเร็วขึ้น และรวมข้อมูลลูกค้าแบบ Customer 360 โดยไม่รวมแชทคนละแพลตฟอร์มเป็นห้องเดียว

### งาน

| ID | Priority | Task | จุดที่แก้ | เสร็จจริงเมื่อ |
|---|---:|---|---|---|
| S7-01 | P0 | Assign agent | API + UI | แชทมีเจ้าของ |
| S7-02 | P0 | Internal note | API + UI | จด note ที่ลูกค้าไม่เห็นได้ |
| S7-03 | P0 | Tags | API + UI | ติด tag/กรอง tag ได้ |
| S7-04 | P1 | Contact 360 เต็ม | UI | เห็น identity หลาย platform แยก conversation |
| S7-05 | P1 | Follow-up task | API + UI | ตั้งเตือนตามเคสได้ |
| S7-06 | P1 | Audit log UI | UI | ดู action ย้อนหลังได้ |

---

## Definition of Done รวม

งานใดจะนับว่าเสร็จ ต้องมีครบ:

```text
[ ] โค้ดทำงานตาม requirement
[ ] ไม่มี secret/token จริงใน commit
[ ] npm run typecheck ผ่าน
[ ] npm test ผ่าน
[ ] ถ้าแก้ frontend ต้องมีวิธีเช็กหน้าจอ
[ ] ถ้าแก้ backend ต้องมี endpoint/mock test
[ ] สรุป changed files
[ ] สรุปวิธีเทสให้พี่ทำตามได้
```
