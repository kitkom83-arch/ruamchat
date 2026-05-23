# AI Omnichannel Chat Rooms MVP

ระบบรวมแชทแบบศูนย์ควบคุมเดียว แต่แยกห้องตามแพลตฟอร์ม/บัญชี สำหรับ MVP ชุดนี้รองรับ `Webchat`, `Telegram`, และ `LINE` พร้อมโครง AI Assistant, Customer 360, API, Worker, PostgreSQL และ Redis

## โครงสร้างโปรเจกต์

- `apps/web`: หน้า Dashboard ด้วย Next.js เปิดที่ `http://localhost:3012`
- `apps/api`: NestJS API และ webhook เปิดที่ `http://localhost:4000`
- `apps/worker`: Worker สำหรับ queue, outbound message และ AI job
- `packages/shared`: type/schema กลางด้วย Zod
- `apps/api/prisma/schema.prisma`: schema ฐานข้อมูลหลัก
- `docker-compose.dev.yml`: PostgreSQL/Redis สำหรับรันบนเครื่อง dev

## สิ่งที่ต้องมีในเครื่อง

- Node.js 22 ขึ้นไป
- npm 10 ขึ้นไป
- Docker Desktop เปิดอยู่
- PowerShell

ตรวจเวอร์ชัน:

```bash
node --version
npm --version
docker ps
```

## วิธีติดตั้งและรันแบบแนะนำ

ใช้ชุดคำสั่งนี้ในโฟลเดอร์โปรเจกต์:

```bash
npm install
npm run local:start
```

ระบบจะทำงานต่อไปนี้ให้:

- เปิด PostgreSQL/Redis ผ่าน Docker Compose project ชื่อ `aiomni-dev`
- Generate Prisma client
- สร้าง schema ฐานข้อมูลผ่าน Docker `psql`
- Seed ข้อมูลตัวอย่าง
- Build ทุก package
- เปิด API, Worker และ Web dashboard

หลังรันเสร็จ เปิด:

```text
http://localhost:3012
```

API ตรวจได้ที่:

```text
http://localhost:4000/rooms
```

## วิธีรันแบบแยก Terminal

ถ้าต้องการเปิดเองทีละส่วน:

```bash
npm run local:infra
npm run prisma:generate
npm run db:push:docker
npm run db:seed
npm run build
```

จากนั้นเปิด 3 terminal:

```bash
npm run local:api
```

```bash
npm run local:worker
```

```bash
npm run local:web
```

## วิธีหยุดระบบ

หยุด API/Web/Worker ที่โปรเจกต์นี้เปิดไว้:

```bash
npm run local:stop
```

ถ้าจะหยุด Docker dev database ด้วย:

```bash
docker compose -p aiomni-dev -f docker-compose.dev.yml down
```

## Deploy ขึ้น VPS

ชุด production แยกจาก local dev แล้ว ใช้ไฟล์เหล่านี้:

- `docker-compose.prod.yml`
- `Caddyfile.prod`
- `.env.production.example`
- `scripts/deploy-vps.sh`
- `DEPLOY_TH.md`

อ่านขั้นตอนเต็มได้ที่ [DEPLOY_TH.md](./DEPLOY_TH.md)

สรุปคำสั่งบน VPS:

```bash
cp .env.production.example .env.production
nano .env.production
sh scripts/deploy-vps.sh
```

ถ้ารันคำสั่ง Docker Compose เอง ให้ใส่ project name เสมอ:

```bash
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml ps
```

หลัง deploy สำเร็จ เปิด:

```text
https://โดเมนของพี่
```

## Port ที่ใช้

โปรเจกต์นี้ตั้ง port ให้เลี่ยงการชนกับ service อื่นบนเครื่อง Windows:

| Service | URL / Port |
| --- | --- |
| Web dashboard | `http://localhost:3012` |
| API | `http://localhost:4000` |
| PostgreSQL | `127.0.0.1:55432` |
| Redis | `127.0.0.1:56379` |

ค่าเหล่านี้อยู่ใน `.env` และ `.env.example`

## คำสั่งตรวจสอบ

```bash
npm run typecheck
npm test
npm run build
```

ตรวจ API:

```bash
curl http://localhost:4000/rooms
```

ทดสอบ Webchat webhook:

```powershell
$body = @{
  visitorId = "visitor-demo-1"
  sessionId = "session-demo-1"
  messageId = "web-msg-demo-1"
  text = "สนใจแพ็กเกจ A ราคาเท่าไรครับ"
  timestamp = (Get-Date).ToUniversalTime().ToString("o")
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri http://localhost:4000/webhooks/webchat/demo-webchat `
  -ContentType "application/json" `
  -Body $body
```

## ปัญหาที่เจอจากภาพและวิธีแก้

### 1. `project name must not be empty`

เกิดจากรัน:

```bash
docker compose up -d postgres redis minio
```

ใน path ภาษาไทย ทำให้ Docker Compose หา project name ไม่ได้

ให้ใช้:

```bash
npm run local:infra
```

หรือ:

```bash
docker compose -p aiomni-dev -f docker-compose.dev.yml up -d postgres redis
```

### 2. `P1000 Authentication failed ... credentials for omni are not valid`

เกิดจาก `.env` เก่าชี้ไป:

```text
postgresql://omni:omni@localhost:5432/omni_chat
```

แต่ database dev ที่ใช้งานจริงคือ:

```text
postgresql://postgres:postgres@127.0.0.1:55432/aiomni
```

ตอนนี้ `.env` และ `.env.example` ถูกแก้ให้ตรงกันแล้ว

### 3. `EPERM operation not permitted ... query_engine-windows.dll.node`

มักเกิดตอนมี Node/API/Prisma process ยังจับไฟล์ Prisma engine อยู่ แล้วรัน `prisma generate` ซ้ำ

ให้ทำ:

```bash
npm run local:stop
npm run prisma:generate
```

ถ้ายังไม่หาย ให้ปิด terminal ที่รัน API/Worker ค้างไว้ แล้วลองใหม่

### 4. `spawn EPERM` ตอนรัน `next dev` หรือ `tsx`

บน Windows บางครั้ง dev mode ต้อง spawn child process แล้วโดน permission/process lock

ทางที่เสถียรกว่าสำหรับโปรเจกต์นี้คือใช้ production-local mode:

```bash
npm run local:start
```

หรือแยก:

```bash
npm run build
npm run local:api
npm run local:worker
npm run local:web
```

## วิธีทำงานร่วมกับ Codex

ให้ถือว่า Codex เป็นคนดูแลโปรเจกต์นี้ร่วมกับพี่ วิธีทำงานที่แนะนำ:

1. บอกเป้าหมายเป็นงานสั้น ๆ เช่น “เพิ่มหน้า Contacts”, “เชื่อม Telegram จริง”, “แก้ error ตอน seed”
2. แนบ error หรือ screenshot ทุกครั้งที่มีปัญหา
3. อย่าแก้หลายส่วนพร้อมกันใน VS Code ระหว่างที่ Codex กำลังแก้ไฟล์เดียวกัน
4. ถ้าพี่รันคำสั่งเองแล้ว error ให้ส่งข้อความ error เต็ม ๆ มาก่อน ไม่ต้องเดาเอง
5. ถ้าจะให้ Codex รันให้จบ ให้บอกว่า “เหมาจนจบ” แล้ว Codex จะเช็ก build/test/runtime ให้
6. ก่อนเริ่มงานใหญ่ ควรบอกว่าอยากได้ “แผนก่อน” หรือ “ทำเลย”

คำสั่งที่พี่ใช้บ่อย:

```bash
npm run local:start
npm run local:stop
npm run typecheck
npm test
npm run build
```

## หมายเหตุเรื่อง AI

ถ้ายังไม่ใส่ `OPENAI_API_KEY` ระบบจะใช้ fallback policy ภายในแทน เพื่อให้ทดสอบ flow ได้โดยไม่เรียก OpenAI จริง

เมื่อพร้อมใช้งานจริง ค่อยใส่ค่าใน `.env`:

```text
OPENAI_API_KEY=...
```

## MVP Guardrails

- ห้องแชทแยกตาม platform/account
- ลูกค้าคนเดียวมีหลาย identity ได้ แต่ไม่รวม conversation ข้าม platform อัตโนมัติ
- webhook message ป้องกันซ้ำด้วย `platformMessageId`
- AI default เป็น `suggest`
- auto-send ต้องผ่าน policy: confidence สูง, risk ต่ำ, และมี source/citation ตามที่ห้องกำหนด
