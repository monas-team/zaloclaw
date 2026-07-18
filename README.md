<div align="center">

# 🦞 zaloclaw

**Unofficial OpenClaw plugin — Zalo Personal Account Channel**

Connect your personal Zalo account to an AI agent with **153 actions**.

[![npm](https://img.shields.io/npm/v/zaloclaw?color=CB3837&logo=npm)](https://www.npmjs.com/package/zaloclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-%E2%89%A52026.5.7-7C3AED)](https://openclaw.ai)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522-339933?logo=nodedotjs)](https://nodejs.org/)

[Tham gia Zalo Group hỗ trợ](https://zalo.me/g/3ntfyv7urr1c2ngipp96) · [Xem đầy đủ 153 actions](docs/actions.md) · [Hướng dẫn cài đặt](docs/guide.md)

</div>

---

> **⚠️ Disclaimer:** Dự án này **không có liên kết với Zalo / VNG Corporation**. Zalo không cung cấp API cho tài khoản cá nhân và không cho phép tự động hóa ([ToS](https://zalo.vn/dieukhoan)). Plugin dùng thư viện reverse-engineered [`zca-js`](https://zca-js.tdung.com/) — **có thể vi phạm ToS, dẫn đến khóa tài khoản. Dùng có trách nhiệm.**

---

## Yêu cầu

- OpenClaw ≥ 2026.5.7
- Node.js ≥ 22
- Tài khoản Zalo cá nhân (không phải OA)

---

## Cài đặt

### ClawHub _(khuyến nghị)_

```bash
openclaw plugins install clawhub:zaloclaw
openclaw gateway restart
openclaw channels login --channel zaloclaw
```

### npm

```bash
openclaw plugins install zaloclaw
openclaw gateway restart
openclaw channels login --channel zaloclaw
```

### Clone thủ công

```bash
git clone https://github.com/monas-team/zaloclaw.git ~/zaloclaw
cd ~/zaloclaw && npm install && npm run build
openclaw plugins install --link ~/zaloclaw
openclaw gateway restart
openclaw channels login --channel zaloclaw
```

**QR login:** Terminal hiện mã QR → mở Zalo app → Trang cá nhân → icon QR → quét.

> **Sau lần cài đầu tiên:** Restart OpenClaw **và** mở session chat mới. Tool `zaloclaw` được đăng ký lúc gateway khởi động — session cũ sẽ không thấy cho đến khi refresh.

> **Session hết hạn?** Chạy lại `openclaw channels login --channel zaloclaw`.

---

## Cấu hình

`~/.openclaw/openclaw.json` → `channels.zaloclaw`:

```jsonc
{
  "channels": {
    "zaloclaw": {
      "dmPolicy": "open",          // open | pairing | allowlist | disabled
      "allowFrom": ["*"],
      "groupPolicy": "open",       // open | allowlist | disabled
      "groups": {
        "*":          { "requireMention": true },
        "<group_id>": { "requireMention": false }
      }
    }
  }
}
```

### Passive Collector — lưu lịch sử nhóm

Ghi toàn bộ tin nhắn nhóm vào file JSONL local (không tốn AI token, không cần external service):

```jsonc
{
  "plugins": {
    "entries": {
      "zaloclaw": {
        "config": {
          "passiveCollector": { "enabled": true }
        }
      }
    }
  }
}
```

Log lưu tại: `~/.openclaw/workspace/zaloclaw/passive/{groupId}.jsonl`

Recall lịch sử qua tool: `zaloclaw` action `recall-group-history` (hỗ trợ `query`, `count`, `groupId`).

---

## Tính năng

| Nhóm | Highlights |
|------|------------|
| 💬 **Nhắn tin** | Text, rich text, ảnh, **file (PDF/PPTX/DOCX/...download tự động)**, video, voice, sticker, link preview, recall |
| 🖼️ **Ảnh & Media** | Ảnh gửi trực tiếp, **ảnh trong quoted message**, auto-download về local, forward đến agent |
| 👥 **Nhóm** | Tạo/quản lý nhóm, admin, bình chọn, nhắc nhở, link mời, community |
| 🤝 **Bạn bè** | Tìm user, kết bạn, biệt danh, trạng thái online |
| 🤖 **AI-native** | Mention gating, image buffering, **quote context với media**, typing indicator |
| 🔐 **Kiểm soát** | DM policy, group policy, allow/deny per-user, injection guard |
| 📝 **Passive log** | Lưu toàn bộ chat nhóm vào JSONL, recall qua tool |
| ⚙️ **Tự động hóa** | Auto-reply, quick messages, auto-unsend, read receipt |
| 🌉 **Bridge Service** | Sibling plugins gọi ZaloClaw actions trực tiếp (zero AI turn) |
| 🔌 **Channel Control** | stop/start/restart kênh, self-update từ xa |

**Xem đầy đủ 153 actions:** [`docs/actions.md`](docs/actions.md)

---

## Xử lý Media

### File attachments (PDF, PPTX, DOCX, CSV, ...)

Khi user gửi file qua Zalo DM, plugin tự động:
1. Extract `fileUrl` từ `share.file` event payload
2. Download file về `~/.openclaw/media/inbound/` (tối đa 50 MB)
3. Forward đến agent kèm context:
   ```
   [File: document.pptx (512 KB)]
   [Downloaded file attachment(s) — use file path(s) below to read/analyze:
     - /home/user/.openclaw/media/inbound/2026-07-18-zalo-file-abc123.pptx]
   ```
4. Agent có thể dùng `read`, `pdf`, `exec` tools để xử lý file ngay lập tức

### Ảnh gửi trực tiếp

Download từ Zalo CDN (kèm session cookies), xác minh magic bytes, resize nếu cần. Chỉ forward đến agent khi ở DM hoặc khi được @mention trong nhóm.

### Ảnh trong quoted message

Khi user quote một ảnh rồi gửi thêm text, plugin extract URL ảnh từ `quote.attach`, download cùng message chính. Agent nhận được cả text lẫn ảnh được quote.

---

## Kiến trúc

```
index.ts                    ← Entry point & tool registration
src/
  channel/
    channel.ts              ← Plugin lifecycle
    monitor.ts              ← Inbound router & access control
    send.ts                 ← Outbound & markdown converter
    image-downloader.ts     ← Zalo CDN image fetch (with session cookies)
    file-downloader.ts      ← Generic file fetch (PDF, PPTX, DOCX...)
    onboarding.ts           ← QR login flow
  client/
    zalo-client.ts          ← zca-js wrapper
    credentials.ts          ← Session persistence
    accounts.ts             ← Multi-account resolver
  config/                   ← Schema validation
  features/
    passive-collector.ts    ← JSONL group history log
    injection-guard.ts      ← Prompt injection detection
    group-event.ts          ← Welcome/leave/admin alerts
    sticker.ts / quote-reply.ts / reaction-ack.ts
  tools/tool.ts             ← 153 action handlers
docs/
  actions.md                ← Full action reference
  guide.md                  ← Installation & configuration guide
```

**Message flow:**
```
Zalo WS → zca-js → monitor.ts
                      ├─ Access control (block/allow/policy)
                      ├─ Passive collector (JSONL log, fire-and-forget)
                      ├─ Injection guard
                      ├─ Quote media extraction (images/files in replies)
                      ├─ Mention gate → image/file buffer
                      ├─ Media download (images + files → local paths)
                      └─ OpenClaw agent → send.ts → Zalo
```

---

## Bridge Service

Sibling OpenClaw plugins có thể gọi ZaloClaw actions trực tiếp mà không cần AI model turn:

```ts
const bridge = globalThis.__zaloclawBridgeService;

// Kiểm tra phân quyền
const status = await bridge.getStatus();          // trạng thái kết nối
const actions = await bridge.listActions();       // danh sách actions

// Thực thi action
await bridge.executeAction("default", {
  action: "send",
  threadId: "...",
  message: "Hello from sibling plugin!",
  isGroup: false,
});
```

API:
- `getStatus(accountId?)` — trạng thái kết nối
- `listActions(accountId?)` — danh sách tất cả actions khả dụng
- `executeAction(accountId, { action, ...params })` — thực thi action bất kỳ
- `version` — phiên bản bridge service

---

## Channel Control

Điều khiển kênh ZaloClaw từ xa qua agent tool:

| Action | Mô tả |
|--------|--------|
| `stop-channel` | Tắt kênh ZaloClaw (ghi config + hot-reload gateway) |
| `start-channel` | Bật lại kênh ZaloClaw |
| `restart-channel` | Hot-reload gateway mà không cần SSH vào server |
| `self-update` | Tự pull code mới nhất từ GitHub, rebuild và hot-reload tự động |

```
# Ví dụ dùng qua agent
zaloclaw { action: "restart-channel" }
zaloclaw { action: "self-update" }
```

---

## Hạn chế

| | Vấn đề |
|-|--------|
| 🔴 | **Unofficial API** — có thể break khi Zalo cập nhật protocol |
| 🟡 | **Session** — cookie hết hạn cần quét lại QR |
| 🟡 | **Rate limit** — gửi quá nhiều có thể bị throttle |
| 🟡 | **Đa tài khoản** — hỗ trợ về kiến trúc, chưa kiểm thử đầy đủ |
| 🟡 | **File URL auth** — một số CDN URL Zalo có thể hết hạn trước khi download xong; nếu download fail, agent nhận được metadata (tên file, size) nhưng không có nội dung |

---

## Phát triển

```bash
npm run build          # esbuild → dist/index.js  ← PHẢI chạy sau khi sửa source
npm run typecheck      # TypeScript check (không output dist)
npm run test           # Vitest

# Dev workflow
openclaw plugins install --link .
openclaw gateway restart
```

> ⚠️ **Quan trọng:** Luôn chạy `npm run build` sau khi sửa TypeScript source. `npm run typecheck` chỉ kiểm tra types, **không** tạo ra `dist/index.js`.

Xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết thêm.

---

## Giấy phép

[MIT](LICENSE) © [monas-team](https://github.com/monas-team)

<sub>Dự án này không có liên kết với Zalo hay VNG Corporation. "Zalo" là thương hiệu của VNG Corporation.</sub>
