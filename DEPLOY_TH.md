# คู่มือ Deploy ขึ้น VPS ด้วย Docker

คู่มือนี้ใช้สำหรับติดตั้งระบบ AI Omnichannel Chat Rooms บน VPS จริง โดยใช้ Docker Compose, PostgreSQL, Redis, MinIO, API, Worker, Web dashboard และ Caddy สำหรับ HTTPS อัตโนมัติ

## 1. สิ่งที่ต้องเตรียม

- VPS Ubuntu 22.04 หรือ 24.04
- Domain หรือ subdomain เช่น `chat.example.com`
- DNS `A record` ของโดเมนชี้มาที่ IP ของ VPS แล้ว
- Port `80` และ `443` เปิดจาก firewall/security group
- Docker และ Docker Compose plugin ติดตั้งบน VPS

เช็กบน VPS:

```bash
docker --version
docker compose version
```

## 2. ส่งโปรเจกต์ขึ้น VPS

ตัวอย่างใช้ `scp` จากเครื่องเราไป VPS:

```bash
scp -r ./รวมแชท root@YOUR_VPS_IP:/opt/aiomni
```

จากนั้น ssh เข้า VPS:

```bash
ssh root@YOUR_VPS_IP
cd /opt/aiomni
```

ถ้าใช้ Git อยู่แล้ว ให้ clone repo ลง `/opt/aiomni` แทนได้

## 3. สร้างไฟล์ env production

```bash
cp .env.production.example .env.production
```

แก้ไฟล์:

```bash
nano .env.production
```

ค่าที่ต้องเปลี่ยนก่อนรันจริง:

```text
APP_DOMAIN=chat.example.com
APP_URL=https://chat.example.com
API_URL=https://chat.example.com/api
POSTGRES_PASSWORD=รหัสผ่านยาวๆ
S3_ACCESS_KEY=ชื่อผู้ใช้ MinIO
S3_SECRET_KEY=รหัสผ่าน MinIO ยาวๆ
APP_ENCRYPTION_KEY=base64 32 bytes
JWT_SECRET=รหัสลับยาวๆ
AI_MODE=mock
PROVIDER_OUTBOUND_MODE=disabled
PROVIDER_OUTBOUND_ENABLED=false
PROVIDER_SANDBOX_MODE=disabled
CHANNEL_MODE=mock
META_CHANNEL_MODE=mock
```

สร้าง `APP_ENCRYPTION_KEY`:

```bash
openssl rand -base64 32
```

สร้าง `JWT_SECRET`:

```bash
openssl rand -hex 32
```

สำหรับ Sprint 54 pilot readiness ให้คง `AI_MODE=mock` และ `OPENAI_API_KEY=` ว่างไว้ก่อน เพื่อไม่ให้มี external API call และให้ `externalCalls=0`

ค่า provider sandbox ในไฟล์ที่ commit ต้องเป็นค่า safe default:

```text
PROVIDER_OUTBOUND_MODE=disabled
PROVIDER_OUTBOUND_ENABLED=false
PROVIDER_SANDBOX_MODE=disabled
PROVIDER_SANDBOX_ALLOWLIST=
LINE_SANDBOX_ALLOWLIST=
TELEGRAM_SANDBOX_ALLOWLIST=
FACEBOOK_SANDBOX_ALLOWLIST=
INSTAGRAM_SANDBOX_ALLOWLIST=
```

ถ้าจะทดสอบ sandbox นอก git ให้ตั้ง `PROVIDER_OUTBOUND_MODE=sandbox`, `PROVIDER_OUTBOUND_ENABLED=true`, `PROVIDER_SANDBOX_MODE=enabled` และใส่ recipient allowlist ผ่าน secret/env ของเครื่อง deploy เท่านั้น เช่น `<line-test-recipient-id>` หรือ `<telegram-test-chat-id>` ห้าม commit token, secret, page access token, channel secret, webhook secret, หรือ recipient จริงลง repo

## 4. Build และเปิดระบบ

ตรวจ env ก่อน deploy:

```bash
npm run validate:production-env -- .env.production
```

ใช้สคริปต์ที่เตรียมไว้:

```bash
sh scripts/deploy-vps.sh
```

สคริปต์นี้จะทำ:

- build image ของ API, Worker, Web
- push schema เข้า PostgreSQL
- seed ข้อมูลเริ่มต้น
- เปิด service ทั้งหมด
- แสดงสถานะ container

ถ้าต้องการรันเองทีละคำสั่ง:

```bash
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml build
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml run --rm migrate
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml up -d postgres redis minio api worker web caddy
```

## 5. เปิดใช้งาน

หลัง Caddy ออก certificate สำเร็จ เปิด:

```text
https://chat.example.com
```

API ผ่าน reverse proxy:

```text
https://chat.example.com/api/rooms
```

Health/readiness:

```text
https://chat.example.com/api/health
https://chat.example.com/api/health/readiness
```

หน้า Settings > Channels จะแสดง Provider sandbox readiness โดยอ่านจาก API readiness ใน `NEXT_PUBLIC_DATA_MODE=api` เท่านั้น ถ้า API ล่มหรือปิดอยู่ หน้าเว็บต้องแสดง Provider Readiness API error / Failed to fetch และห้าม fallback เป็น mock provider readiness อัตโนมัติ

Webhook URL สำหรับ Webchat demo:

```text
https://chat.example.com/webhooks/webchat/demo-webchat
```

Webhook URL สำหรับ Telegram:

```text
https://chat.example.com/webhooks/telegram/CHANNEL_ACCOUNT_ID
```

Webhook URL สำหรับ LINE:

```text
https://chat.example.com/webhooks/line/CHANNEL_ACCOUNT_ID
```

Webhook URL สำหรับ Facebook Messenger:

```text
https://chat.example.com/webhooks/facebook/CHANNEL_ACCOUNT_ID
```

Webhook URL สำหรับ Instagram Messaging:

```text
https://chat.example.com/webhooks/instagram/CHANNEL_ACCOUNT_ID
```

## 6. คำสั่งดูแลระบบ

ดู container:

```bash
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml ps
```

ดู log:

```bash
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml logs -f api
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml logs -f worker
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml logs -f caddy
```

restart:

```bash
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml restart api worker web
```

update หลังแก้โค้ด:

```bash
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml build
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml run --rm migrate
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml up -d
```

หยุดระบบ:

```bash
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml down
```

หยุดและลบข้อมูล database/storage ทั้งหมด:

```bash
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml down -v
```

ใช้คำสั่ง `down -v` เฉพาะตอนต้องการล้างข้อมูลจริงเท่านั้น

## 7. จุดที่ต้องเช็กถ้าเว็บไม่ขึ้น

เช็ก DNS:

```bash
dig +short chat.example.com
```

ผลลัพธ์ต้องเป็น IP ของ VPS

เช็ก firewall:

```bash
ufw status
```

ถ้าใช้ UFW:

```bash
ufw allow 80/tcp
ufw allow 443/tcp
```

ดู log Caddy:

```bash
docker compose -p aiomni-prod --env-file .env.production -f docker-compose.prod.yml logs -f caddy
```

ถ้า Caddy ขอ certificate ไม่ได้ ส่วนใหญ่เกิดจาก DNS ยังไม่ชี้มาที่ VPS หรือ port `80/443` ยังไม่เปิด

## 8. ขั้นต่อไปหลัง deploy ติด

1. ตั้งค่า Telegram Bot webhook มาที่ URL production โดยยังไม่เปิด real outbound
2. ตั้งค่า LINE webhook และ verify signature โดยยังไม่เปิด real outbound
3. ตั้งค่า Facebook Messenger และ Instagram Messaging webhook challenge/signature โดยยังไม่เปิด real outbound
4. ตรวจ `GET /api/health/readiness` ว่า provider readiness แสดงเฉพาะ configured/not_configured และ allowlist counts
5. ยืนยันว่า `PROVIDER_OUTBOUND_ENABLED=false`, provider outbound disabled, และ `externalCalls=0`
6. เพิ่มหน้า Settings สำหรับกรอก credential/channel account ผ่าน UI
7. ทำ backup PostgreSQL รายวันและทดสอบ rollback

