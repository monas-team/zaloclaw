# ZaloClaw — Hướng dẫn cài đặt & cấu hình

> Hướng dẫn này dành cho người lần đầu cài đặt ZaloClaw. Bạn sẽ đi từ zero đến bot Zalo AI hoàn chỉnh trong ~10 phút.

---

## Mục lục

1. [Yêu cầu](#1-yêu-cầu)
2. [Cài OpenClaw](#2-cài-openclaw)
3. [Cài ZaloClaw](#3-cài-zaloclaw)
4. [Đăng nhập Zalo bằng QR](#4-đăng-nhập-zalo-bằng-qr)
5. [Cấu hình cơ bản](#5-cấu-hình-cơ-bản)
6. [Kiểm tra hoạt động](#6-kiểm-tra-hoạt-động)
7. [Tính năng nâng cao](#7-tính-năng-nâng-cao)
8. [Xử lý sự cố](#8-xử-lý-sự-cố)

---

## 1. Yêu cầu

| Yêu cầu | Phiên bản |
|---------|-----------|
| [OpenClaw](https://openclaw.ai) | ≥ 2026.5.7 |
| Node.js | ≥ 22 |
| Tài khoản Zalo | Cá nhân (không phải OA) |
| OS | Linux / macOS / Windows (WSL2) |

> **Lưu ý:** ZaloClaw hoạt động trên tài khoản Zalo **cá nhân**, không phải Zalo Official Account (OA). Tài khoản OA cần dùng Zalo API riêng.

---

## 2. Cài OpenClaw

Nếu chưa có OpenClaw:

```bash
npm install -g openclaw
openclaw setup
```

`openclaw setup` sẽ hướng dẫn cài đặt AI model (cần API key của Anthropic, OpenAI, hoặc provider khác) và khởi động gateway.

Kiểm tra:
```bash
openclaw status
# Gateway: running ✔
```

---

## 3. Cài ZaloClaw

### Cách A — ClawHub _(nhanh nhất)_

```bash
openclaw plugins install clawhub:zaloclaw
openclaw gateway restart
```

### Cách B — npm

```bash
openclaw plugins install zaloclaw
openclaw gateway restart
```

### Cách C — Clone thủ công _(dành cho dev / tùy chỉnh)_

```bash
git clone https://github.com/monas-team/zaloclaw.git ~/zaloclaw
cd ~/zaloclaw
npm install
openclaw plugins install --link ~/zaloclaw
openclaw gateway restart
```

> Dùng `--link` để plugin load trực tiếp từ thư mục — tiện cho việc phát triển vì không cần reinstall sau khi sửa code.

**Sau khi cài xong, mở session chat mới với agent.** Tool `zaloclaw` được đăng ký lúc gateway khởi động — session cũ sẽ không thấy cho đến khi refresh.

---

## 4. Đăng nhập Zalo bằng QR

```bash
openclaw channels login --channel zaloclaw
```

Terminal hiện mã QR:

```
█████████████████████████
██ ▄▄▄▄▄ █▄▀ █▄ ▄▄▄▄▄ ██
██ █   █ █▀▄▀▀█ █   █ ██
...
```

**Các bước quét QR trên điện thoại:**

1. Mở **Zalo app**
2. Vào **Trang cá nhân** (icon người dùng góc dưới phải)
3. Bấm **icon QR** góc trên phải
4. Chọn **Quét mã QR**
5. Hướng camera vào QR trên terminal

Sau khi quét thành công, terminal sẽ hiện:
```
✔ Logged in as [Tên Zalo của bạn]
```

> **QR hết hạn?** Chạy lại lệnh `openclaw channels login --channel zaloclaw` để lấy QR mới.

> **Lỗi `Unsupported channel "zaloclaw"`?** Chạy `openclaw setup` thay thế — cùng luồng QR, tương thích mọi phiên bản.

---

## 5. Cấu hình cơ bản

File config: `~/.openclaw/openclaw.json`

### Cấu hình tối thiểu

```json
{
  "channels": {
    "zaloclaw": {
      "enabled": true,
      "dmPolicy": "open",
      "groupPolicy": "open"
    }
  }
}
```

### Cấu hình đầy đủ

```jsonc
{
  "channels": {
    "zaloclaw": {
      "enabled": true,

      // DM policy: open | pairing | allowlist | disabled
      // - open: chấp nhận tất cả DM
      // - pairing: yêu cầu trao đổi mã (an toàn hơn)
      // - allowlist: chỉ user trong allowFrom
      // - disabled: tắt hoàn toàn DM
      "dmPolicy": "open",

      // Whitelist user ID (dùng "*" để cho phép tất cả)
      "allowFrom": ["*"],

      // Blacklist user ID
      "denyFrom": [],

      // Group policy: open | allowlist | disabled
      "groupPolicy": "open",

      // Override theo từng nhóm
      "groups": {
        // Mặc định: yêu cầu @mention trong tất cả nhóm
        "*": { "requireMention": true },

        // Nhóm cụ thể: không cần @mention, bot tự phản hồi
        "GROUP_ID_HERE": {
          "requireMention": false
        }
      }
    }
  }
}
```

Sau khi sửa config, **không cần restart** — OpenClaw tự reload config.

### Lấy Group ID

Cách lấy ID của nhóm Zalo:

```bash
# Hỏi agent qua chat:
# "dùng tool zaloclaw action groups để liệt kê nhóm"
```

hoặc agent dùng tool:
```json
{ "action": "groups" }
```

---

## 6. Kiểm tra hoạt động

```bash
openclaw channels status
```

Kết quả mong đợi:
```
- ZaloClaw default: enabled, configured, running, connected
```

**Test nhanh từ Zalo:**

1. Nhắn DM cho chính tài khoản bot đang dùng
2. hoặc vào nhóm có bot, @mention tên bot
3. Bot sẽ phản hồi

**Kiểm tra từ terminal:**

```bash
# Xem trạng thái kết nối
openclaw status

# Xem log gần đây (nếu dùng systemd)
journalctl --user -u openclaw -f
```

---

## 7. Tính năng nâng cao

### File Attachments — nhận và xử lý file

Khi user gửi file (PDF, PPTX, DOCX, CSV, ZIP...) qua Zalo DM, plugin tự động xử lý:

1. **Extract URL** từ `share.file` event payload (field `fileUrl`)
2. **Download** về `~/.openclaw/media/inbound/` (giới hạn 50 MB)
3. **Inject context** vào agent message:
   ```
   [File: document.pptx (512 KB)]
   [Downloaded file attachment(s) — use file path(s) below to read/analyze:
     - /home/user/.openclaw/media/inbound/2026-07-18-zalo-file-abc123.pptx]
   ```
4. Agent có thể dùng tool `read`, `pdf`, hoặc `exec` để phân tích ngay

> **Lưu ý:** File URL từ Zalo CDN có thể hết hạn. Nếu download fail, agent vẫn nhận được metadata (tên file, size) và có thể yêu cầu user gửi lại hoặc dùng link cloud.

---

### Ảnh & Quoted Media

**Ảnh gửi trực tiếp:** Plugin download từ Zalo CDN (kèm session cookies) và forward đến agent. Chỉ xử lý trong DM hoặc khi được @mention trong nhóm.

**Ảnh trong quoted message:** Khi user quote một tin nhắn ảnh rồi gửi thêm câu hỏi, bot nhận được cả câu hỏi lẫn ảnh được quote:
```
[Replying to Nguyễn Văn A: "[with media]"]
Phân tích ảnh này giúp mình
[Downloaded file attachment(s)...]
```

---

### Passive Collector — lưu lịch sử nhóm

Ghi **tất cả tin nhắn nhóm** vào file JSONL local, không tốn AI token.  
Dùng để bot có thể recall lịch sử khi được hỏi.

**Bật trong config:**

```json
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

File lưu tại: `~/.openclaw/workspace/zaloclaw/passive/{groupId}.jsonl`

**Recall lịch sử qua tool:**

```json
{ "action": "recall-group-history", "groupId": "GROUP_ID", "count": 30 }
{ "action": "recall-group-history", "groupId": "GROUP_ID", "query": "họp" }
{ "action": "list-passive-groups" }
```

---

### Group Events — chào mừng thành viên mới

Bot tự động chào khi có người vào/ra nhóm:

```json
{
  "channels": {
    "zaloclaw": {
      "groupEvents": {
        "enabled": true,
        "welcome": true,
        "leaveAlert": false,
        "welcomeTemplate": "👋 Chào mừng {name} đã gia nhập {groupName}!\n\nMình là bot AI, @mention mình nếu cần giúp đỡ nhé."
      }
    }
  }
}
```

Template variables: `{name}`, `{groupName}`

---

### Injection Guard — chống prompt injection

Phát hiện và cảnh báo khi thành viên cố tình can thiệp vào bot:

```json
{
  "plugins": {
    "entries": {
      "zaloclaw": {
        "config": {
          "injectionGuard": {
            "autoRemove": false
          }
        }
      }
    }
  }
}
```

- `autoRemove: false` _(mặc định)_ — chỉ cảnh báo, không tự kick
- `autoRemove: true` — tự kick sau 3 lần vi phạm

---

### Auto-Reply

Tự động trả lời theo keyword:

```json
// Dùng tool:
{ "action": "create-auto-reply", "scope": 0, "keyword": "giờ làm việc", "message": "Giờ làm việc: 8h-17h T2-T6" }
```

Scope: `0` = tất cả · `1` = người lạ · `2` = bạn bè cụ thể

---

## 8. Xử lý sự cố

### Bot không phản hồi trong nhóm

```bash
# Kiểm tra requireMention
# Nếu requireMention: true → phải @mention tên bot
# Nếu muốn bot tự reply → đặt requireMention: false cho nhóm đó
```

### Session hết hạn (`dm:pairing` hoặc `disconnected`)

```bash
openclaw channels login --channel zaloclaw
# Quét QR mới
```

### Lỗi sau khi cài plugin lần đầu

```bash
# Tool zaloclaw chưa hiện trong agent → mở session chat mới
# Không cần reinstall — chỉ cần refresh session
```

### Kiểm tra plugin đã load đúng chưa

```bash
openclaw plugins inspect zaloclaw --runtime
# Xem: status: loaded, diagnostics: []
```

### Gateway event loop degraded

Thường gặp khi load CPU cao. Không ảnh hưởng chức năng, chỉ là cảnh báo.

```bash
openclaw gateway restart
```

---

## Tham khảo thêm

- [151 Actions Reference](actions.md) — tất cả actions, params, ví dụ
- [ClawHub](https://clawhub.ai/plugins/zaloclaw) — trang plugin chính thức
- [OpenClaw Docs](https://docs.openclaw.ai) — tài liệu OpenClaw
- [Issues](https://github.com/monas-team/zaloclaw/issues) — báo lỗi / đề xuất
