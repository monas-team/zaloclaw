# ZaloClaw — 153 Actions Reference

Plugin expose **một tool duy nhất** tên `zaloclaw` với **153 actions**.  
Tên người dùng và tên nhóm **tự động resolve** thành Zalo numeric ID.

> **Legend:**  
> ⛔ = Zalo API deprecated (endpoint 404 — không dùng được)  
> ⚠️ = Giới hạn quan trọng cần biết  
> 🔧 = Chỉ tác động đến config OpenClaw, không gọi Zalo API

---

## Cách dùng

```json
{ "action": "send", "threadId": "...", "message": "Hello", "isGroup": false }
```

**Params chung:**
- `threadId` — Zalo thread ID (DM = user ID, group = group ID)
- `isGroup` — `true` nếu gửi vào nhóm
- `userId` / `groupId` — tên hoặc ID (tự resolve)

---

## 💬 Nhắn tin — 16 actions

| Action | Params bắt buộc | Mô tả |
|--------|-----------------|-------|
| `send` | `threadId`, `message`, `isGroup` | Text. `urgency`: 0=thường · 1=quan trọng · 2=khẩn; `messageTtl`: tự xóa (ms) |
| `send-styled` | `threadId`, `message`, `isGroup` | Rich text: `**bold**` `*italic*` `__underline__` `~~strike~~` `c_HEX` |
| `send-image` | `threadId`, `url`/`filePath`, `isGroup` | Ảnh qua URL hoặc local path |
| `send-file` | `threadId`, `filePath`/`url`, `isGroup` | File bất kỳ |
| `send-video` | `threadId`, `url`, `isGroup` | Video |
| `send-voice` | `threadId`, `voiceUrl`, `isGroup` | Tin nhắn thoại |
| `send-link` | `threadId`, `url`, `isGroup` | URL với link preview |
| `send-sticker` | `threadId`, `isGroup` + (`keyword` hoặc `stickerId`+`stickerCateId`) | Sticker |
| `send-card` | `threadId`, `userId`, `isGroup` | Danh thiếp liên hệ |
| `send-bank-card` | `threadId`, `binBank`, `numAccBank`, `nameAccBank` | Thẻ ngân hàng |
| `send-typing` | `threadId`, `isGroup` | Chỉ báo đang nhập |
| `send-to-stranger` | `threadId`, `message` | Nhắn người chưa kết bạn |
| `forward-message` | `msgId`, `threadIds[]`, `message` | ⚠️ Gửi `message` đến nhiều hội thoại. Plugin **không tự lookup nội dung theo msgId** — bắt buộc truyền `message` |
| `delete-message` | `msgId`, `threadId`, `isGroup` | Xóa tin nhắn. `onlyMe: true` = chỉ xóa phía mình |
| `undo-message` | `msgId` | ⚠️ Thu hồi tin nhắn. Chỉ hoạt động với tin nhắn nhận/gửi **trong session hiện tại** (cần `cliMsgId` trong bộ nhớ) |
| `add-reaction` | `msgId`, `icon` | ⚠️ React tin nhắn. Chỉ hoạt động với tin nhắn trong **session hiện tại**. Icons: `heart` `like` `haha` `wow` `cry` `angry` `none` |

---

## 🤝 Bạn bè — 19 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `friends` | `query` (optional) | Danh sách bạn bè |
| `find-user` | `phoneNumber` | Tìm theo SĐT |
| `find-user-by-username` | `username` | Tìm theo username Zalo |
| `get-multi-users-by-phones` | `phoneNumbers[]` | Tìm hàng loạt theo SĐT |
| `send-friend-request` | `userId`, `requestMessage` | Gửi lời mời kết bạn |
| `accept-friend-request` | `userId` | Chấp nhận lời mời |
| `reject-friend-request` | `userId` | Từ chối lời mời |
| `get-friend-requests` | — | Lời mời đang chờ |
| `get-sent-requests` | — | Lời mời đã gửi |
| `undo-friend-request` | `userId` | Hủy lời mời |
| `unfriend` | `userId` | Xóa bạn |
| `check-friend-status` | `userId` | Trạng thái kết bạn |
| `set-friend-nickname` | `userId`, `nickname` | Đặt biệt danh |
| `remove-friend-nickname` | `userId` | Xóa biệt danh |
| `get-online-friends` | — | ⛔ DEPRECATED — Zalo API 404 |
| `get-close-friends` | — | ⛔ DEPRECATED — Zalo API 404 |
| `get-friend-recommendations` | — | Gợi ý kết bạn |
| `get-alias-list` | — | Danh sách biệt danh đã đặt |
| `get-related-friend-groups` | `userId` (optional, mặc định = tài khoản đang login) | Nhóm bạn bè liên quan |

---

## 👥 Nhóm — 26 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `groups` | `query` (optional) | Danh sách nhóm |
| `get-group-info` | `groupId` | Chi tiết nhóm |
| `create-group` | `groupName`, `memberIds[]` | Tạo nhóm mới |
| `add-to-group` | `groupId`, `memberIds[]` | Thêm thành viên |
| `remove-from-group` | `groupId`, `memberIds[]` | Xóa thành viên |
| `leave-group` | `groupId` | Rời nhóm |
| `rename-group` | `groupId`, `groupName` | Đổi tên nhóm |
| `change-group-avatar` | `groupId`, `url`/`filePath` | Đổi avatar nhóm |
| `add-group-admin` | `groupId`, `userId` | Thêm admin |
| `remove-group-admin` | `groupId`, `userId` | Xóa quyền admin |
| `change-group-owner` | `groupId`, `userId` | Chuyển trưởng nhóm |
| `disperse-group` | `groupId` | Giải tán nhóm |
| `update-group-settings` | `groupId`, `groupSettings` | Cài đặt nhóm (`joinAppr`, `lockSendMsg`, `lockViewMember`…) |
| `enable-group-link` | `groupId` | Bật link mời |
| `disable-group-link` | `groupId` | Tắt link mời |
| `get-group-link` | `groupId` | Lấy link mời |
| `join-group-link` | `link` | Tham gia qua link |
| `get-pending-members` | `groupId` | Danh sách chờ duyệt |
| `review-pending-members` | `groupId`, `memberIds[]`, `isApprove` | Duyệt / từ chối thành viên |
| `get-group-blocked` | `groupId` | Danh sách bị chặn trong nhóm |
| `block-group-member` | `groupId`, `userId` | Chặn thành viên |
| `unblock-group-member` | `groupId`, `userId` | Bỏ chặn thành viên |
| `get-group-members-info` | `groupId`, `memberIds[]` | Chi tiết thành viên |
| `get-group-chat-history` | `groupId` | ⛔ DEPRECATED — Zalo API 404. Dùng `recall-group-history` thay thế |
| `upgrade-group-to-community` | `groupId` | Nâng cấp nhóm thành cộng đồng |
| `group-mention` | `groupId`, `requireMention` (boolean) | 🔧 **Config bot** có yêu cầu @mention trong nhóm này không. Để **gửi tin có @mention**, dùng `send-styled` |

---

## 📨 Lời mời nhóm — 4 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `invite-to-groups` | `userId`, `groupIds[]` | Mời user vào nhiều nhóm |
| `get-group-invites` | — | Lời mời nhóm đang chờ |
| `join-group-invite` | `groupId` | Chấp nhận lời mời nhóm |
| `delete-group-invite` | `groupId` | Xóa lời mời nhóm |

---

## 📊 Bình chọn — 6 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `create-poll` | `threadId`, `title`, `options[]`, `isGroup` | Tạo poll. Optional: `allowMultiChoices`, `expiredTime`, `isAnonymous` |
| `vote-poll` | `pollId`, `optionId`, `threadId` | Bỏ phiếu |
| `lock-poll` | `pollId`, `threadId` | Khóa poll |
| `get-poll-detail` | `pollId` | Chi tiết poll |
| `add-poll-options` | `pollId`, `options[]` | Thêm tùy chọn vào poll |
| `share-poll` | `pollId`, `threadId` | Chia sẻ poll |

---

## 🔔 Nhắc nhở — 6 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `create-reminder` | `threadId`, `title`, `startTime` (ms), `repeat` | Tạo nhắc nhở. Optional: `emoji`, `isGroup` |
| `edit-reminder` | `reminderId`, `threadId`, `title`, `startTime` | Sửa nhắc nhở |
| `remove-reminder` | `reminderId`, `threadId` | Xóa nhắc nhở |
| `list-reminders` | `threadId` | Danh sách nhắc nhở trong hội thoại |
| `get-reminder` | `reminderId` | Chi tiết nhắc nhở |
| `get-reminder-responses` | `reminderId` | Phản hồi thành viên (accept/reject) |

---

## 💼 Hội thoại — 13 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `mute-conversation` | `threadId`, `isGroup` | Tắt thông báo. `duration`: -1=mãi mãi · 3600=1h · 14400=4h |
| `unmute-conversation` | `threadId`, `isGroup` | Bật thông báo |
| `pin-conversation` | `threadId`, `isGroup` | Ghim hội thoại |
| `unpin-conversation` | `threadId`, `isGroup` | Bỏ ghim |
| `hide-conversation` | `threadId`, `isGroup` | Ẩn hội thoại |
| `unhide-conversation` | `threadId`, `isGroup` | Hiện hội thoại |
| `get-hidden-conversations` | — | Danh sách hội thoại đang ẩn |
| `delete-chat` | `threadId`, `isGroup` | Xóa lịch sử chat |
| `mark-unread` | `threadId`, `isGroup` | Đánh dấu chưa đọc |
| `unmark-unread` | `threadId`, `isGroup` | Bỏ đánh dấu |
| `get-unread-marks` | — | Danh sách hội thoại đánh dấu chưa đọc |
| `set-auto-delete-chat` | `threadId`, `ttl` (ms), `isGroup` | Tự xóa tin nhắn sau `ttl` ms. `ttl=0` để tắt |
| `get-auto-delete-chats` | — | Danh sách hội thoại có auto-delete |
| `get-archived-chats` | — | Danh sách hội thoại đã lưu trữ |
| `update-archived-chat` | `threadId`, `isGroup` | Cập nhật trạng thái lưu trữ |
| `get-mute-status` | `threadId`, `isGroup` | Trạng thái thông báo |
| `get-pinned-conversations` | — | Danh sách hội thoại đã ghim |

---

## ⚡ Tin nhắn nhanh & Auto-reply — 8 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `list-quick-messages` | — | Danh sách tin nhắn nhanh |
| `add-quick-message` | `keyword`, `message` | ⚠️ Thêm tin nhắn nhanh. Có thể bị giới hạn bởi Zalo tùy account tier |
| `remove-quick-message` | `itemId` | Xóa tin nhắn nhanh |
| `update-quick-message` | `itemId`, `keyword`, `message` | Cập nhật tin nhắn nhanh |
| `list-auto-replies` | — | Danh sách rule auto-reply |
| `create-auto-reply` | `message`, `startTime` (ms), `endTime` (ms) | ⚠️ Tạo rule auto-reply. Optional: `scope` (0=all · 1=dm · 2=group), `isEnable`, `memberIds[]`. Zalo giới hạn **tối đa 1 active rule/account** |
| `update-auto-reply` | `replyId`, `message`, `startTime` (ms), `endTime` (ms) | Cập nhật rule. Cần đủ `startTime`, `endTime` |
| `delete-auto-reply` | `replyId` | Xóa rule auto-reply |

---

## 👤 Hồ sơ & Tài khoản — 13 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `me` | — | Thông tin tài khoản đang login |
| `status` | — | Trạng thái kết nối Zalo |
| `get-user-info` | `userId` | Chi tiết thông tin user |
| `last-online` | `userId` | Thời điểm online gần nhất |
| `get-qr` | — | QR code tài khoản |
| `update-profile` | `name`, `dob`, `gender` | Cập nhật hồ sơ |
| `update-profile-bio` | `bio` | Cập nhật bio |
| `change-avatar` | `url`/`filePath` | Đổi avatar |
| `delete-avatar` | — | Xóa avatar hiện tại |
| `get-avatar-list` | — | Danh sách avatar đã lưu |
| `reuse-avatar` | `photoId` | Dùng lại avatar cũ |
| `get-full-avatar` | `userId` | URL avatar full size |
| `get-friend-board` | `threadId` | Board của người dùng trong DM. `threadId` = userId của người đó |

---

## 🔒 Block & Access Control — 12 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `zalo-block-user` | `userId` | Chặn ở cấp Zalo (không nhận/gửi tin) |
| `zalo-unblock-user` | `userId` | Bỏ chặn Zalo |
| `block-user` | `userId` | 🔧 Chặn trong OpenClaw (bot bỏ qua tin nhắn) |
| `unblock-user` | `userId` | 🔧 Bỏ chặn OpenClaw |
| `block-user-in-group` | `userId`, `groupId` | 🔧 Chặn user trong nhóm cụ thể |
| `unblock-user-in-group` | `userId`, `groupId` | 🔧 Bỏ chặn trong nhóm |
| `allow-user-in-group` | `userId`, `groupId` | 🔧 Thêm vào allowlist nhóm |
| `unallow-user-in-group` | `userId`, `groupId` | 🔧 Xóa khỏi allowlist nhóm |
| `list-blocked` | — | Danh sách bị chặn (OpenClaw level) |
| `list-allowed` | — | Danh sách allowlist (OpenClaw level) |
| `list-blocked-in-group` | `groupId` | Danh sách bị chặn theo nhóm |
| `list-allowed-in-group` | `groupId` | Allowlist theo nhóm |

---

## 🛍️ Sản phẩm & Catalog — 8 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `create-catalog` | `name`, ... | Tạo catalog |
| `update-catalog` | `catalogId`, ... | Cập nhật catalog |
| `delete-catalog` | `catalogId` | Xóa catalog |
| `get-catalogs` | — | Danh sách catalog |
| `create-product` | `catalogId`, `name`, ... | Tạo sản phẩm |
| `update-product` | `productId`, ... | Cập nhật sản phẩm |
| `delete-product` | `productId` | Xóa sản phẩm |
| `get-products` | `catalogId` | Danh sách sản phẩm |

---

## 📋 Ghi chú & Board — 4 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `create-note` | `threadId`, `title`, `message` | Tạo ghi chú trong hội thoại |
| `edit-note` | `topicId`, `threadId`, `title`, `message` | Sửa ghi chú |
| `get-boards` | `threadId` | Danh sách board trong hội thoại |
| `get-labels` | — | Danh sách nhãn (labels) |

---

## ⚙️ Cài đặt tài khoản — 3 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `get-settings` | — | Xem toàn bộ cài đặt tài khoản |
| `update-setting` | `settingKey`, `settingValue` | Cập nhật một setting cụ thể |
| `update-active-status` | `active` (boolean) | Bật/tắt trạng thái online |

---

## 🔍 Tiện ích — 5 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `search-stickers` | `keyword` | Tìm sticker theo từ khóa, trả về `stickerIds[]` |
| `search-sticker-detail` | `stickerId` | Chi tiết sticker (lấy `stickerId` từ kết quả `search-stickers`) |
| `parse-link` | `url` | Parse metadata của URL (title, description, thumbnail) |
| `send-report` | `threadId`, `isGroup` | Báo cáo user. `reason`: 0=other · 1=sensitive · 2=annoy · 3=fraud |
| `get-biz-account` | — | ⚠️ Thông tin tài khoản Business. Chỉ hoạt động với Zalo Business account |

---

## 🔌 Channel Control — 4 actions

| Action | Mô tả |
|--------|-------|
| `stop-channel` | Tắt kênh ZaloClaw (ghi config + hot-reload gateway) |
| `start-channel` | Bật lại kênh ZaloClaw |
| `restart-channel` | Hot-reload gateway không cần SSH |
| `self-update` | Pull code mới từ GitHub → rebuild → hot-reload tự động |

---

## 📖 Passive History — 2 actions

> Yêu cầu bật `passiveCollector.enabled: true` trong config plugin.

| Action | Params | Mô tả |
|--------|--------|-------|
| `recall-group-history` | `groupId`/`threadId`, `count` (default 50), `query` (optional) | Đọc lịch sử nhóm từ JSONL log local |
| `list-passive-groups` | — | Liệt kê tất cả nhóm có passive log |

---

## Patterns hay dùng

```jsonc
// Gửi text urgent
{ "action": "send", "threadId": "...", "message": "🚨 Alert!", "isGroup": true, "urgency": 2 }

// Rich text trong nhóm
{ "action": "send-styled", "threadId": "...", "message": "**Quan trọng:** Họp lúc 3h", "isGroup": true }

// Tìm user theo SĐT rồi gửi tin
{ "action": "find-user", "phoneNumber": "0987654321" }
// → lấy userId từ kết quả → { "action": "send", "threadId": "<userId>", ... }

// Gửi file
{ "action": "send-file", "threadId": "...", "filePath": "/path/to/report.pdf", "isGroup": true }

// Tìm + gửi sticker
{ "action": "search-stickers", "keyword": "hello" }
// → { "action": "send-sticker", "threadId": "...", "stickerId": "...", "stickerCateId": "...", "isGroup": true }

// Set bot có cần @mention trong nhóm không (group-mention = config, không phải gửi tin)
{ "action": "group-mention", "groupId": "...", "requireMention": false }

// Gửi @mention bằng send-styled
{ "action": "send-styled", "threadId": "...", "message": "**@Tên ơi** xem cái này nhé", "isGroup": true }

// Recall lịch sử nhóm (cần passiveCollector enabled)
{ "action": "recall-group-history", "groupId": "...", "count": 50, "query": "họp" }

// Điều khiển bot từ xa
{ "action": "self-update" }
{ "action": "restart-channel" }
```

---

## Giới hạn đã biết

| | Vấn đề | Giải pháp |
|-|--------|-----------|
| ⛔ | `get-online-friends` — Zalo API 404 | Không có giải pháp |
| ⛔ | `get-close-friends` — Zalo API 404 | Không có giải pháp |
| ⛔ | `get-group-chat-history` — Zalo API 404 | Dùng `recall-group-history` |
| ⚠️ | `add-reaction`, `undo-message` — chỉ work với tin nhắn trong session hiện tại | Gửi phản ứng ngay sau khi nhận tin |
| ⚠️ | `forward-message` — không tự lookup nội dung theo msgId | Truyền `message` text thủ công |
| ⚠️ | `add-quick-message` — có thể bị từ chối bởi Zalo tùy account | Lỗi "Item size not support" = giới hạn account |
| ⚠️ | `create-auto-reply` — Zalo giới hạn tối đa 1 rule active | Xóa rule cũ trước khi tạo mới |
| ⚠️ | `get-biz-account` — chỉ dành cho Zalo Business account | N/A với personal account |
| 🔴 | Unofficial API — có thể break khi Zalo cập nhật protocol | Cập nhật zca-js |
| 🟡 | Session cookie hết hạn | Chạy lại `openclaw channels login --channel zaloclaw` |
