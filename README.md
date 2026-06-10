# zaloclaw

[![CI](https://github.com/monas-team/zaloclaw/actions/workflows/ci.yml/badge.svg)](https://github.com/monas-team/zaloclaw/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![ClawHub](https://img.shields.io/badge/ClawHub-zaloclaw-orange)](https://clawhub.ai)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-%E2%89%A52026.2.0-purple)](https://github.com/nicholasxuu/openclaw)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522-green)](https://nodejs.org/)

**Unofficial OpenClaw channel plugin** — kết nối tài khoản Zalo cá nhân với AI agent, hỗ trợ **147 actions**: nhắn tin, quản lý nhóm, bạn bè, bình chọn, nhắc nhở, tự động hóa, và nhiều hơn nữa.

---

> ## ⚠️ Tuyên bố miễn trừ trách nhiệm (Disclaimer)
>
> **Dự án này KHÔNG có liên kết, KHÔNG được phê duyệt, và KHÔNG được tài trợ bởi Zalo hay công ty VNG Corporation.**
>
> Zalo **không cung cấp API chính thức** cho tài khoản cá nhân và **không cho phép** tự động hóa tài khoản cá nhân theo [Điều khoản sử dụng](https://zalo.vn/dieukhoan) của họ. Plugin này hoạt động bằng cách mô phỏng hành vi client thông qua thư viện không chính thức [`zca-js`](https://github.com/nicholasxuu/zca-js).
>
> **Việc sử dụng plugin này có thể vi phạm Điều khoản dịch vụ của Zalo và có thể dẫn đến việc tài khoản bị khóa hoặc đình chỉ.**
>
> Dự án được cung cấp **"nguyên trạng" (as-is)** cho mục đích nghiên cứu, học tập và tự động hóa cá nhân. Người dùng tự chịu hoàn toàn trách nhiệm khi sử dụng.

---

📖 **Dành cho AI Agent:** Xem [docs/agent-help.md](docs/agent-help.md) — đầy đủ 147 actions, params, ví dụ, và hướng dẫn cập nhật.
💬 **Cộng đồng:** [zalo.me/g/gigr4cnahvidpewxk74z](https://zalo.me/g/gigr4cnahvidpewxk74z) — hỗ trợ cài đặt và use case thực tế.

---

## Tại sao zaloclaw tồn tại?

Zalo (~75 triệu người dùng tại Việt Nam) không cung cấp API bot chính thức cho tài khoản cá nhân — chỉ có [Zalo OA (Official Account)](https://oa.zalo.me) dành cho doanh nghiệp với nhiều hạn chế. Plugin này lấp khoảng trống đó bằng cách bridge tài khoản Zalo cá nhân với framework [OpenClaw](https://github.com/nicholasxuu/openclaw), cho phép hội thoại AI, thực thi tool, và tự động hóa trực tiếp qua Zalo.

---

## Cài đặt

### Cách 1 — ClawHub (khuyến nghị)

```bash
openclaw plugins install clawhub:zaloclaw
openclaw gateway restart
openclaw channels login --channel zaloclaw   # quét QR bằng app Zalo
```

### Cách 2 — Clone thủ công

```bash
git clone https://github.com/monas-team/zaloclaw.git /path/to/zaloclaw
cd /path/to/zaloclaw && npm install
openclaw plugins install --link /path/to/zaloclaw
openclaw gateway restart
openclaw channels login --channel zaloclaw
```

### Xác minh

```bash
openclaw status   # zaloclaw phải hiện trạng thái ON
```

---

## Yêu cầu

| Phụ thuộc | Phiên bản |
|-----------|-----------|
| [OpenClaw](https://github.com/nicholasxuu/openclaw) | ≥ 2026.2.0 |
| Node.js | ≥ 22 |
| Tài khoản Zalo cá nhân | — |

---

## Tính năng

### Messaging
- **147 Zalo API actions** — nhắn tin, nhóm, bạn bè, bình chọn, nhắc nhở, sản phẩm, cài đặt, v.v.
- **Rich text** — bold, italic, gạch chân, gạch ngang, màu sắc (tự chuyển từ markdown)
- **Urgency levels** — `1` = quan trọng, `2` = khẩn cấp
- **Quote reply** — AI nhận được nội dung và context tin nhắn được trích dẫn
- **Gửi file** — PDF, doc, ảnh, video, voice qua local path hoặc URL
- **Sticker** — tìm và gửi sticker Zalo gốc
- **Typing indicator** — hiển thị trạng thái đang nhập khi xử lý
- **Auto-unsend** — thu hồi tin nhắn đã gửi
- **Read receipt** — đánh dấu đã đọc

### Nhóm & Kiểm soát truy cập
- **Mention gating** — bot chỉ reply khi được @mention (config theo từng nhóm)
- **Image buffering** — nhớ ảnh trước mention để dùng làm context khi được @tag sau
- **DM policy** — `open` / `pairing` / `allowlist` / `disabled`
- **Group policy** — per-group override, allowlist, requireMention
- **Access control** — allowlist/blocklist theo user, toàn cục và theo nhóm

---

## Cấu hình

`~/.openclaw/openclaw.json` → `channels.zaloclaw`

```jsonc
{
  "channels": {
    "zaloclaw": {
      "accounts": {
        "default": {
          "enabled": true,
          "dmPolicy": "open",           // open | pairing | allowlist | disabled
          "allowFrom": ["*"],
          "denyFrom": [],
          "groupPolicy": "open",        // open | allowlist | disabled
          "groups": {
            "*": { "requireMention": true },
            "<group_id>": {
              "allow": true,
              "requireMention": false,
              "allowUsers": [],
              "denyUsers": []
            }
          }
        }
      }
    }
  }
}
```

### DM Policy

| Policy | Hành vi |
|--------|---------|
| `open` | Chấp nhận tất cả DM |
| `pairing` | Yêu cầu trao đổi mã với người dùng chưa biết |
| `allowlist` | Chỉ user trong `allowFrom` |
| `disabled` | Chặn tất cả DM |

---

## 147 Actions

<details>
<summary><b>Nhắn tin (16)</b></summary>

| Action | Mô tả |
|--------|-------|
| `send` | Gửi text (hỗ trợ `urgency`, `messageTtl`) |
| `send-styled` | Rich text (bold, italic, underline, strike, màu) |
| `send-image` | Gửi ảnh qua URL |
| `send-file` | Gửi file bất kỳ (local path / URL) |
| `send-video` | Gửi video |
| `send-voice` | Gửi tin nhắn thoại |
| `send-link` | URL kèm preview |
| `send-sticker` | Sticker theo ID hoặc keyword |
| `send-card` | Danh thiếp liên hệ |
| `send-bank-card` | Thông tin thẻ ngân hàng |
| `send-typing` | Chỉ báo đang nhập |
| `send-to-stranger` | Nhắn người lạ |
| `forward-message` | Chuyển tiếp (hỗ trợ TTL) |
| `delete-message` | Xóa tin nhắn |
| `undo-message` | Thu hồi tin nhắn |
| `add-reaction` | React (heart, like, haha, wow, cry, angry) |

</details>

<details>
<summary><b>Bạn bè (16)</b></summary>

| Action | Mô tả |
|--------|-------|
| `friends` | Danh sách bạn bè |
| `find-user` | Tìm theo SĐT |
| `find-user-by-username` | Tìm theo username |
| `send-friend-request` | Gửi lời mời kết bạn |
| `accept-friend-request` | Chấp nhận lời mời |
| `reject-friend-request` | Từ chối lời mời |
| `get-friend-requests` | Lời mời đến |
| `get-sent-requests` | Lời mời đã gửi |
| `undo-friend-request` | Hủy lời mời đã gửi |
| `unfriend` | Xóa bạn |
| `check-friend-status` | Kiểm tra trạng thái |
| `set-friend-nickname` | Đặt biệt danh |
| `remove-friend-nickname` | Xóa biệt danh |
| `get-online-friends` | Bạn bè đang online |
| `get-close-friends` | Bạn thân |
| `get-friend-recommendations` | Gợi ý kết bạn |

</details>

<details>
<summary><b>Nhóm (22)</b></summary>

| Action | Mô tả |
|--------|-------|
| `groups` | Danh sách nhóm |
| `get-group-info` | Chi tiết nhóm |
| `create-group` | Tạo nhóm mới |
| `add-to-group` | Thêm thành viên |
| `remove-from-group` | Xóa thành viên |
| `leave-group` | Rời nhóm |
| `rename-group` | Đổi tên |
| `add-group-admin` / `remove-group-admin` | Quản lý admin |
| `change-group-owner` | Chuyển trưởng nhóm |
| `disperse-group` | Giải tán nhóm |
| `update-group-settings` | Cập nhật cài đặt nhóm |
| `enable-group-link` / `disable-group-link` / `get-group-link` | Link mời nhóm |
| `get-pending-members` / `review-pending-members` | Duyệt yêu cầu tham gia |
| `block-group-member` / `unblock-group-member` | Chặn thành viên |
| `get-group-members-info` | Chi tiết thành viên |
| `change-group-avatar` | Đổi avatar nhóm |
| `upgrade-group-to-community` | Nâng cấp thành cộng đồng |
| `get-group-chat-history` | Lịch sử tin nhắn |

</details>

<details>
<summary><b>Bình chọn (6)</b></summary>

`create-poll`, `vote-poll`, `lock-poll`, `get-poll-detail`, `add-poll-options`, `share-poll`

Hỗ trợ: nhiều lựa chọn, thêm tùy chọn mới, ẩn danh, thời hạn tùy chỉnh.

</details>

<details>
<summary><b>Nhắc nhở (6)</b></summary>

`create-reminder`, `edit-reminder`, `remove-reminder`, `list-reminders`, `get-reminder`, `get-reminder-responses`

</details>

<details>
<summary><b>Quản lý hội thoại (16)</b></summary>

Mute/unmute, pin/unpin, xóa chat, ẩn/hiện, đánh dấu chưa đọc, tự xóa chat (1/7/14 ngày), lưu trữ.

</details>

<details>
<summary><b>Tin nhắn nhanh & Tự động trả lời (8)</b></summary>

Quản lý mẫu trả lời nhanh + quy tắc auto-reply (phạm vi: tất cả / người lạ / bạn bè cụ thể).

</details>

<details>
<summary><b>Hồ sơ & Tài khoản (14)</b></summary>

`me`, `get-user-info`, `update-profile`, `change-avatar`, `get-qr`, `last-online`, `get-biz-account`, v.v.

</details>

<details>
<summary><b>Danh mục & Sản phẩm (8)</b></summary>

CRUD đầy đủ cho catalog và product — dành cho tài khoản shop/doanh nghiệp.

</details>

<details>
<summary><b>Cài đặt & Tiện ích (13)</b></summary>

`get-settings`, `update-setting`, `update-active-status`, `search-stickers`, `parse-link`, `send-report`, tra cứu hàng loạt SĐT, v.v.

</details>

<details>
<summary><b>Quản lý Bot — OpenClaw layer (13)</b></summary>

Block/unblock user toàn cục và theo nhóm, allowlist, require-mention config theo từng nhóm.

</details>

---

## Kiến trúc

```
zaloclaw/
├── index.ts                    → Entry point & tool registration
├── src/
│   ├── channel/                → Channel lifecycle & message flow
│   │   ├── channel.ts          → Plugin definition, account start/stop
│   │   ├── monitor.ts          → Inbound message handler & router
│   │   ├── send.ts             → Outbound send & markdown conversion
│   │   ├── onboarding.ts       → QR login flow
│   │   └── image-downloader.ts → Media download handler
│   ├── client/                 → Zalo API wrapper & account management
│   │   ├── zalo-client.ts      → zca-js lifecycle (login, getApi)
│   │   ├── credentials.ts      → Credential storage
│   │   └── accounts.ts         → Multi-account resolution
│   ├── config/                 → Config schema & runtime management
│   ├── tools/
│   │   └── tool.ts             → 147 action handlers
│   └── features/               → Isolated feature modules
│       ├── sticker.ts
│       ├── quote-reply.ts
│       ├── reaction-ack.ts
│       ├── read-receipt.ts
│       └── auto-unsend.ts
└── docs/
    ├── agent-help.md           → Full agent usage guide (147 actions)
    └── agent-install.md        → Install guide
```

**Message flow:**
```
Zalo WS → zca-js event → monitor.ts
  ├── Access control (block/allow, DM policy, group policy)
  ├── Mention gating (skip if not @mentioned → buffer image)
  ├── Image handling (download on mention/DM)
  ├── Context assembly (sender info, buffered media, quote)
  ├── Envelope → OpenClaw agent runtime
  └── Agent response → send.ts → Zalo
```

---

## Phát triển

```bash
npm run typecheck   # kiểm tra TypeScript
npm run test        # chạy test suite
npm run build       # build dist/index.js

# Dev mode — link trực tiếp, không cần build
openclaw plugins install --link .
openclaw gateway restart
```

**Thêm action mới:**
1. Thêm handler trong `src/tools/tool.ts`
2. Kết nối vào `monitor.ts` (inbound) hoặc `send.ts` (outbound) nếu cần
3. `npm run typecheck` → `openclaw gateway restart`

---

## Hạn chế đã biết

| Vấn đề | Chi tiết |
|--------|---------|
| Unofficial API | Hoạt động dựa trên reverse-engineered client — có thể break khi Zalo cập nhật |
| Streaming | Không hỗ trợ (`blockStreaming: true`) |
| Đa tài khoản | Có về kiến trúc, chưa kiểm thử đầy đủ |
| Rate limit | Zalo có thể throttle/block nếu gửi quá nhiều |
| Session | Cookie có thể hết hạn — cần quét lại QR |
| Message TTL | Server Zalo có thể không áp dụng — dùng `set-auto-delete-chat` thay thế |

---

## Ủng hộ đồng bào 🇻🇳

Nếu ZaloClaw có ích với bạn, hãy cân nhắc đóng góp cho **Quỹ Cứu trợ Trung ương — Ủy ban MTTQ Việt Nam** để hỗ trợ đồng bào bị thiên tai, lũ lụt.

| Ngân hàng | STK | Tên tài khoản | Chi nhánh | QR |
|-----------|-----|--------------|-----------|:--:|
| **Vietcombank** | `666.666.1010` | Ủy ban TW MTTQ Việt Nam | Hà Nội | [![QR VCB](https://img.vietqr.io/image/970436-6666661010-compact2.png?accountName=UBTW+MTTQ+Viet+Nam&addInfo=Ung+ho+dong+bao)](https://img.vietqr.io/image/970436-6666661010-compact2.png?accountName=UBTW+MTTQ+Viet+Nam&addInfo=Ung+ho+dong+bao) |
| **VietinBank** | `55102025` | Ban Vận động Cứu trợ TW | — | [![QR VTB](https://img.vietqr.io/image/970415-55102025-compact2.png?accountName=Ban+Van+dong+Cuu+tro+TW&addInfo=Ung+ho+dong+bao)](https://img.vietqr.io/image/970415-55102025-compact2.png?accountName=Ban+Van+dong+Cuu+tro+TW&addInfo=Ung+ho+dong+bao) |
| **BIDV** | `1200979797` | Ủy ban TW MTTQ Việt Nam | Sở Giao dịch 1 | [![QR BIDV](https://img.vietqr.io/image/970418-1200979797-compact2.png?accountName=UBTW+MTTQ+Viet+Nam&addInfo=Ung+ho+dong+bao)](https://img.vietqr.io/image/970418-1200979797-compact2.png?accountName=UBTW+MTTQ+Viet+Nam&addInfo=Ung+ho+dong+bao) |

> ⚠️ MTTQ đã cảnh báo có nhiều tài khoản giả mạo trên mạng xã hội. Chỉ chuyển vào **3 STK trên** — nguồn chính thức: [mattran.org.vn](https://mattran.org.vn)

---

## Giấy phép

[MIT](LICENSE) © [monas-team](https://github.com/monas-team)

---

*Dự án này không có liên kết với Zalo hay VNG Corporation. "Zalo" là thương hiệu thuộc sở hữu của VNG Corporation.*
