<div align="center">

# 🦞 zaloclaw

**Unofficial OpenClaw plugin — Zalo Personal Account Channel**

Connect your personal Zalo account to an AI agent with **147 full-featured actions**.

[![CI](https://github.com/monas-team/zaloclaw/actions/workflows/ci.yml/badge.svg)](https://github.com/monas-team/zaloclaw/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![ClawHub](https://img.shields.io/badge/ClawHub-zaloclaw-FF6B35)](https://clawhub.ai)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-%E2%89%A52026.2.0-7C3AED)](https://github.com/nicholasxuu/openclaw)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)

[Cài đặt](#cài-đặt) · [Tính năng](#tính-năng) · [Cấu hình](#cấu-hình) · [147 Actions](#147-actions) · [Cộng đồng](https://zalo.me/g/gigr4cnahvidpewxk74z)

</div>

---

> ### ⚠️ Disclaimer — Dự án không chính thức
>
> Dự án này **không có liên kết, không được phê duyệt và không được tài trợ** bởi **Zalo** hoặc **VNG Corporation**.
>
> Zalo không cung cấp API chính thức cho tài khoản cá nhân và **không cho phép tự động hóa tài khoản cá nhân** theo [Điều khoản dịch vụ](https://zalo.vn/dieukhoan). Plugin hoạt động thông qua thư viện reverse-engineered [`zca-js`](https://github.com/nicholasxuu/zca-js) và **có thể vi phạm ToS Zalo, dẫn đến tài khoản bị khóa hoặc đình chỉ**.
>
> Được cung cấp **"as-is"** cho mục đích nghiên cứu và tự động hóa cá nhân. **Người dùng tự chịu toàn bộ rủi ro.**

---

## Tại sao zaloclaw?

Zalo (~75 triệu người dùng tại Việt Nam) **không có API bot cho tài khoản cá nhân** — chỉ có [Zalo OA](https://oa.zalo.me) dành cho doanh nghiệp với nhiều hạn chế. ZaloClaw lấp khoảng trống đó bằng cách bridge tài khoản Zalo cá nhân với [OpenClaw](https://github.com/nicholasxuu/openclaw), cho phép hội thoại AI và tự động hóa toàn diện qua Zalo.

---

## Cài đặt

### Cách 1 — ClawHub _(khuyến nghị)_

```bash
openclaw plugins install clawhub:zaloclaw
openclaw gateway restart
openclaw channels login --channel zaloclaw
# → Quét QR code bằng app Zalo
```

### Cách 2 — Clone thủ công

```bash
git clone https://github.com/monas-team/zaloclaw.git /path/to/zaloclaw
cd /path/to/zaloclaw && npm install
openclaw plugins install --link /path/to/zaloclaw
openclaw gateway restart
openclaw channels login --channel zaloclaw
```

### Kiểm tra

```bash
openclaw status
# ✓ zaloclaw → ON
```

**Yêu cầu:** OpenClaw ≥ 2026.2.0 · Node.js ≥ 22 · Tài khoản Zalo cá nhân

---

## Tính năng

| Danh mục | Highlights |
|----------|------------|
| 💬 **Nhắn tin** | Text, rich text, ảnh, file, video, voice, sticker, link preview |
| 👥 **Nhóm** | Tạo/quản lý nhóm, admin, bình chọn, nhắc nhở, link mời |
| 🤝 **Bạn bè** | Tìm, kết bạn, chặn, biệt danh, trạng thái online |
| 🤖 **AI-native** | Mention gating, image buffering, quote context, typing indicator |
| 🔐 **Kiểm soát** | DM policy, group policy, allowlist/blocklist theo user/nhóm |
| ⚙️ **Cài đặt** | Auto-reply, quick messages, auto-unsend, read receipt |

### Chi tiết nổi bật

- **Mention gating** — Bot chỉ phản hồi khi được `@mention` trong nhóm; có thể tắt per-group
- **Image buffering** — Nhớ ảnh từ tin nhắn không mention, dùng làm context khi được @tag sau
- **Rich text** — Markdown tự chuyển sang bold/italic/gạch chân/màu sắc Zalo
- **Urgency levels** — `1` = quan trọng 🔶, `2` = khẩn cấp 🔴
- **Quote reply** — AI nhận đầy đủ context tin nhắn được trích dẫn + người gửi

---

## Cấu hình

File: `~/.openclaw/openclaw.json` → key `channels.zaloclaw`

```jsonc
{
  "channels": {
    "zaloclaw": {
      "accounts": {
        "default": {
          "enabled": true,

          // Chính sách DM: open | pairing | allowlist | disabled
          "dmPolicy": "open",
          "allowFrom": ["*"],
          "denyFrom": [],

          // Chính sách nhóm: open | allowlist | disabled
          "groupPolicy": "open",

          // Override theo từng nhóm (dùng group ID hoặc "*" cho mặc định)
          "groups": {
            "*":          { "requireMention": true },
            "<group_id>": { "allow": true, "requireMention": false }
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
| `pairing` | Yêu cầu trao đổi mã với người dùng lạ |
| `allowlist` | Chỉ user trong `allowFrom` |
| `disabled` | Chặn tất cả DM |

---

## 147 Actions

> Plugin expose một tool `zaloclaw` duy nhất với 147 actions. Tên người dùng và tên nhóm tự động resolve thành Zalo numeric ID.
> Xem đầy đủ tại [docs/agent-help.md](docs/agent-help.md).

<details>
<summary><b>💬 Nhắn tin — 16 actions</b></summary>
<br>

| Action | Mô tả |
|--------|-------|
| `send` | Gửi text (`urgency` 0/1/2, `messageTtl`) |
| `send-styled` | Rich text: **bold**, *italic*, gạch chân, gạch ngang, màu |
| `send-image` | Ảnh qua URL hoặc local path |
| `send-file` | File bất kỳ (PDF, doc, zip…) qua URL hoặc local path |
| `send-video` | Video |
| `send-voice` | Tin nhắn thoại |
| `send-link` | URL kèm preview tự động |
| `send-sticker` | Sticker theo ID hoặc keyword |
| `send-card` | Danh thiếp liên hệ |
| `send-bank-card` | Thông tin thẻ ngân hàng |
| `send-typing` | Chỉ báo đang nhập |
| `send-to-stranger` | Nhắn người chưa kết bạn |
| `forward-message` | Chuyển tiếp đến nhiều hội thoại (hỗ trợ TTL) |
| `delete-message` | Xóa tin nhắn |
| `undo-message` | Thu hồi tin nhắn đã gửi |
| `add-reaction` | React: heart · like · haha · wow · cry · angry |

</details>

<details>
<summary><b>🤝 Bạn bè — 16 actions</b></summary>
<br>

| Action | Mô tả |
|--------|-------|
| `friends` | Danh sách bạn bè (filter/search) |
| `find-user` | Tìm theo số điện thoại |
| `find-user-by-username` | Tìm theo username Zalo |
| `send-friend-request` | Gửi lời mời kết bạn |
| `accept-friend-request` | Chấp nhận lời mời |
| `reject-friend-request` | Từ chối lời mời |
| `get-friend-requests` | Lời mời đang chờ |
| `get-sent-requests` | Lời mời đã gửi |
| `undo-friend-request` | Hủy lời mời đã gửi |
| `unfriend` | Xóa bạn |
| `check-friend-status` | Trạng thái kết bạn / lời mời |
| `set-friend-nickname` | Đặt biệt danh |
| `remove-friend-nickname` | Xóa biệt danh |
| `get-online-friends` | Bạn bè đang online |
| `get-close-friends` | Bạn thân |
| `get-friend-recommendations` | Gợi ý kết bạn |

</details>

<details>
<summary><b>👥 Nhóm — 22 actions</b></summary>
<br>

| Action | Mô tả |
|--------|-------|
| `groups` | Danh sách nhóm (có search) |
| `get-group-info` | Chi tiết nhóm |
| `create-group` | Tạo nhóm mới |
| `add-to-group` | Thêm thành viên |
| `remove-from-group` | Xóa thành viên |
| `leave-group` | Rời nhóm |
| `rename-group` | Đổi tên nhóm |
| `add-group-admin` / `remove-group-admin` | Quản lý admin |
| `change-group-owner` | Chuyển quyền trưởng nhóm |
| `disperse-group` | Giải tán nhóm |
| `update-group-settings` | Cài đặt (lịch sử, duyệt tham gia, khóa tên…) |
| `enable/disable/get-group-link` | Quản lý link mời nhóm |
| `get/review-pending-members` | Duyệt yêu cầu tham gia |
| `block/unblock-group-member` | Chặn thành viên |
| `get-group-members-info` | Chi tiết thành viên |
| `change-group-avatar` | Đổi avatar nhóm |
| `upgrade-group-to-community` | Nâng cấp thành cộng đồng |
| `get-group-chat-history` | Lịch sử tin nhắn |

</details>

<details>
<summary><b>📊 Bình chọn — 6 actions</b></summary>
<br>

`create-poll` · `vote-poll` · `lock-poll` · `get-poll-detail` · `add-poll-options` · `share-poll`

Hỗ trợ: đa lựa chọn, thêm tùy chọn mới, ẩn danh, thời hạn tùy chỉnh.

</details>

<details>
<summary><b>🔔 Nhắc nhở — 6 actions</b></summary>
<br>

`create-reminder` · `edit-reminder` · `remove-reminder` · `list-reminders` · `get-reminder` · `get-reminder-responses`

</details>

<details>
<summary><b>💼 Hội thoại, Tự động trả lời, Hồ sơ, Sản phẩm — 51 actions</b></summary>
<br>

**Quản lý hội thoại (16):** Mute/unmute, pin/unpin, ẩn/hiện, tự xóa (1/7/14 ngày), lưu trữ, đánh dấu chưa đọc.

**Tin nhắn nhanh & Auto-reply (8):** CRUD quick messages + auto-reply rules (phạm vi: tất cả / người lạ / bạn bè cụ thể).

**Hồ sơ & Tài khoản (14):** `me`, `update-profile`, `change-avatar`, `get-qr`, `last-online`, `get-biz-account`, quản lý lịch sử avatar, v.v.

**Danh mục & Sản phẩm (8):** CRUD catalog và product — dành cho tài khoản shop/doanh nghiệp.

**Tiện ích & Cài đặt (5):** `get/update-settings`, `update-active-status`, `parse-link`, `search-stickers`, tra cứu hàng loạt SĐT.

</details>

<details>
<summary><b>🔧 Quản lý Bot — OpenClaw layer — 13 actions</b></summary>
<br>

Block/unblock user toàn cục và theo nhóm, allowlist, require-mention config per-group, trust management.

</details>

---

## Kiến trúc

```
zaloclaw/
├── index.ts                    ← Entry point & tool registration
├── src/
│   ├── channel/
│   │   ├── channel.ts          ← Plugin lifecycle (start / stop / dock)
│   │   ├── monitor.ts          ← Inbound router & access control
│   │   ├── send.ts             ← Outbound dispatcher & markdown converter
│   │   ├── onboarding.ts       ← QR login flow
│   │   └── image-downloader.ts ← Media handler
│   ├── client/
│   │   ├── zalo-client.ts      ← zca-js wrapper (login, getApi, reconnect)
│   │   ├── credentials.ts      ← Credential persistence
│   │   └── accounts.ts         ← Multi-account resolver
│   ├── config/                 ← Schema validation & runtime config
│   ├── tools/tool.ts           ← 147 action handlers
│   └── features/               ← sticker · quote-reply · reaction-ack · …
└── docs/
    ├── agent-help.md           ← Full 147-action reference
    └── agent-install.md        ← Install guide
```

**Message flow:**

```
Zalo WS → zca-js → monitor.ts
                       │
                       ├─ Access control (block/allow/policy)
                       ├─ Mention gate  (skip → buffer image)
                       ├─ Media download
                       ├─ Context build (sender · quote · media)
                       └─ OpenClaw agent → send.ts → Zalo
```

---

## Phát triển

```bash
npm run typecheck          # TypeScript check
npm run test               # Vitest test suite
npm run build              # esbuild → dist/index.js

# Dev — link trực tiếp, không cần build lại
openclaw plugins install --link .
openclaw gateway restart
```

**Thêm action mới:** Handler trong `src/tools/tool.ts` → wire vào `monitor.ts` / `send.ts` nếu cần → `typecheck` → restart.

---

## Hạn chế đã biết

| Mức độ | Vấn đề | Chi tiết |
|:------:|--------|---------|
| 🔴 | **Unofficial API** | Reverse-engineered client — có thể break khi Zalo cập nhật protocol |
| 🟡 | **Session** | Cookie có thể hết hạn — cần quét lại QR để khôi phục |
| 🟡 | **Rate limit** | Gửi quá nhiều có thể bị Zalo throttle hoặc block tài khoản |
| 🟡 | **Đa tài khoản** | Hỗ trợ về kiến trúc nhưng chưa kiểm thử đầy đủ |
| 🟢 | **Streaming** | Tắt theo thiết kế (`blockStreaming: true`) |
| 🟢 | **Message TTL** | Server Zalo có thể không áp dụng — dùng `set-auto-delete-chat` thay thế |

---

## Ủng hộ đồng bào 🇻🇳

Nếu ZaloClaw có ích với bạn, hãy cân nhắc đóng góp cho **Quỹ Cứu trợ Trung ương — Ủy ban MTTQ Việt Nam** để hỗ trợ đồng bào bị thiên tai, lũ lụt.

| Ngân hàng | Số tài khoản | Tên tài khoản | Chi nhánh | QR |
|:---------:|:------------:|---------------|:---------:|:--:|
| **Vietcombank** | `666.666.1010` | Ủy ban TW MTTQ Việt Nam | Hà Nội | [![QR](https://img.vietqr.io/image/970436-6666661010-compact2.png?accountName=UBTW+MTTQ+Viet+Nam&addInfo=Ung+ho+dong+bao)](https://img.vietqr.io/image/970436-6666661010-compact2.png?accountName=UBTW+MTTQ+Viet+Nam&addInfo=Ung+ho+dong+bao) |
| **VietinBank** | `55102025` | Ban Vận động Cứu trợ TW | — | [![QR](https://img.vietqr.io/image/970415-55102025-compact2.png?accountName=Ban+Van+dong+Cuu+tro+TW&addInfo=Ung+ho+dong+bao)](https://img.vietqr.io/image/970415-55102025-compact2.png?accountName=Ban+Van+dong+Cuu+tro+TW&addInfo=Ung+ho+dong+bao) |
| **BIDV** | `1200979797` | Ủy ban TW MTTQ Việt Nam | Sở Giao dịch 1 | [![QR](https://img.vietqr.io/image/970418-1200979797-compact2.png?accountName=UBTW+MTTQ+Viet+Nam&addInfo=Ung+ho+dong+bao)](https://img.vietqr.io/image/970418-1200979797-compact2.png?accountName=UBTW+MTTQ+Viet+Nam&addInfo=Ung+ho+dong+bao) |

> ⚠️ MTTQ đã cảnh báo về nhiều tài khoản giả mạo — chỉ chuyển vào 3 STK trên. Nguồn chính thức: [mattran.org.vn](https://mattran.org.vn)

---

<div align="center">

## Giấy phép

[MIT](LICENSE) © [monas-team](https://github.com/monas-team)


</div>

---

<div align="center">
<sub>Dự án này không có liên kết với Zalo hay VNG Corporation. "Zalo" là thương hiệu thuộc sở hữu của VNG Corporation.</sub>
</div>
