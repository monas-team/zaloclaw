# ZaloClaw — 151 Actions Reference

Plugin expose **một tool duy nhất** tên `zaloclaw` với 151 actions.  
Tên người dùng và tên nhóm **tự động resolve** thành Zalo numeric ID.

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
| `forward-message` | `msgId`, `threadIds` (array), `message` (**required**) | Gửi nội dung `message` đến nhiều hội thoại. Lưu ý: không tự lookup nội dung theo msgId, phải truyền `message` |
| `delete-message` | `msgId`, `threadId`, `isGroup` | Xóa tin nhắn (chỉ phía mình: `onlyMe: true`) |
| `undo-message` | `msgId`, `threadId`, `isGroup` | Thu hồi tin nhắn |
| `add-reaction` | `msgId`, `threadId`, `isGroup`, `icon` | React: `heart` `like` `haha` `wow` `cry` `angry` `none` |

---

## 🤝 Bạn bè — 16 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `friends` | `query` (optional) | Danh sách bạn bè |
| `find-user` | `phoneNumber` | Tìm theo SĐT |
| `find-user-by-username` | `username` | Tìm theo username Zalo |
| `get-multi-users-by-phones` | `phoneNumbers` (array) | Tìm hàng loạt |
| `send-friend-request` | `userId`, `requestMessage` | Gửi lời mời kết bạn |
| `accept-friend-request` | `userId` | Chấp nhận |
| `reject-friend-request` | `userId` | Từ chối |
| `get-friend-requests` | — | Lời mời đang chờ |
| `get-sent-requests` | — | Lời mời đã gửi |
| `undo-friend-request` | `userId` | Hủy lời mời |
| `unfriend` | `userId` | Xóa bạn |
| `check-friend-status` | `userId` | Trạng thái kết bạn |
| `set-friend-nickname` | `userId`, `nickname` | Đặt biệt danh |
| `remove-friend-nickname` | `userId` | Xóa biệt danh |
| `get-online-friends` | — | Bạn đang online ⚠️ API Zalo 404 — endpoint deprecated |
| `get-close-friends` | — | Bạn thân ⚠️ API Zalo 404 — endpoint deprecated |
| `get-friend-recommendations` | — | Gợi ý kết bạn |
| `get-alias-list` | — | Danh sách biệt danh |
| `get-related-friend-groups` | `userId` (optional, mặc định = tài khoản hiện tại) | Nhóm bạn bè liên quan |

---

## 👥 Nhóm — 26 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `groups` | `query` (optional) | Danh sách nhóm |
| `get-group-info` | `groupId` | Chi tiết nhóm |
| `create-group` | `groupName`, `memberIds` | Tạo nhóm mới |
| `add-to-group` | `groupId`, `memberIds` | Thêm thành viên |
| `remove-from-group` | `groupId`, `memberIds` | Xóa thành viên |
| `leave-group` | `groupId` | Rời nhóm |
| `rename-group` | `groupId`, `groupName` | Đổi tên |
| `change-group-avatar` | `groupId`, `url`/`filePath` | Đổi avatar |
| `add-group-admin` | `groupId`, `userId` | Thêm admin |
| `remove-group-admin` | `groupId`, `userId` | Xóa admin |
| `change-group-owner` | `groupId`, `userId` | Chuyển trưởng nhóm |
| `disperse-group` | `groupId` | Giải tán nhóm |
| `update-group-settings` | `groupId`, `groupSettings` | Cài đặt (joinAppr, lockSendMsg, lockViewMember…) |
| `enable-group-link` | `groupId` | Bật link mời |
| `disable-group-link` | `groupId` | Tắt link mời |
| `get-group-link` | `groupId` | Lấy link mời |
| `join-group-link` | `link` | Tham gia qua link |
| `get-pending-members` | `groupId` | Danh sách chờ duyệt |
| `review-pending-members` | `groupId`, `memberIds`, `isApprove` | Duyệt / từ chối |
| `get-group-blocked` | `groupId` | Danh sách bị chặn |
| `block-group-member` | `groupId`, `userId` | Chặn thành viên |
| `unblock-group-member` | `groupId`, `userId` | Bỏ chặn |
| `get-group-members-info` | `groupId`, `memberIds` | Chi tiết thành viên |
| `get-group-chat-history` | `groupId` | Lịch sử tin nhắn ⚠️ API Zalo 404 — endpoint deprecated, dùng `recall-group-history` thay thế |
| `upgrade-group-to-community` | `groupId` | Nâng cấp thành cộng đồng |
| `group-mention` | `groupId`, `requireMention` (boolean) | **Cấu hình** xem bot có yêu cầu @mention trong nhóm hay không. Để **gửi tin nhắn** có @mention, dùng `send-styled` hoặc `send` |

---

## 📨 Lời mời nhóm — 4 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `invite-to-groups` | `userId`, `groupIds` | Mời user vào nhiều nhóm |
| `get-group-invites` | — | Lời mời nhóm đang chờ |
| `join-group-invite` | `groupId` | Chấp nhận lời mời |
| `delete-group-invite` | `groupId` | Xóa lời mời |

---

## 📊 Bình chọn — 6 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `create-poll` | `threadId`, `title`, `options`, `isGroup` | Tạo poll (hỗ trợ `allowMultiChoices`, `expiredTime`, `isAnonymous`) |
| `vote-poll` | `pollId`, `optionId`, `threadId` | Bỏ phiếu |
| `lock-poll` | `pollId`, `threadId` | Khóa poll |
| `get-poll-detail` | `pollId` | Chi tiết poll |
| `add-poll-options` | `pollId`, `options` | Thêm tùy chọn |
| `share-poll` | `pollId`, `threadId` | Chia sẻ poll |

---

## 🔔 Nhắc nhở — 6 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `create-reminder` | `threadId`, `title`, `startTime`, `repeat` | Tạo nhắc nhở |
| `edit-reminder` | `reminderId`, `title`, `startTime` | Sửa |
| `remove-reminder` | `reminderId` | Xóa |
| `list-reminders` | `threadId` | Danh sách |
| `get-reminder` | `reminderId` | Chi tiết |
| `get-reminder-responses` | `reminderId` | Phản hồi thành viên |

---

## 💼 Hội thoại — 16 actions

| Action | Mô tả |
|--------|-------|
| `mute-conversation` / `unmute-conversation` | Tắt / bật thông báo |
| `pin-conversation` / `unpin-conversation` | Ghim / bỏ ghim |
| `hide-conversation` / `unhide-conversation` | Ẩn / hiện |
| `get-hidden-conversations` | Danh sách hội thoại ẩn |
| `delete-chat` | Xóa lịch sử chat |
| `mark-unread` / `unmark-unread` | Đánh dấu chưa đọc |
| `get-unread-marks` | Danh sách chưa đọc |
| `set-auto-delete-chat` | Tự xóa sau `ttl` ms (0 = tắt) |
| `get-auto-delete-chats` | Danh sách có auto-delete |
| `get-archived-chats` | Lưu trữ |
| `update-archived-chat` | Cập nhật trạng thái lưu trữ |
| `get-mute-status` | Trạng thái thông báo |
| `get-pinned-conversations` | Danh sách đã ghim |

---

## ⚡ Tin nhắn nhanh & Auto-reply — 8 actions

| Action | Mô tả |
|--------|-------|
| `list-quick-messages` | Danh sách tin nhắn nhanh |
| `add-quick-message` | Thêm (`keyword`, `message`) |
| `remove-quick-message` | Xóa (`itemId`) |
| `update-quick-message` | Cập nhật |
| `list-auto-replies` | Danh sách rule auto-reply |
| `create-auto-reply` | Tạo rule (`message` **required**, `startTime` **required** ms, `endTime` **required** ms, `scope`: 0=all/1=dm/2=group, `isEnable`: true/false, `memberIds`: uid[]) |
| `update-auto-reply` | Cập nhật rule (`replyId`) |
| `delete-auto-reply` | Xóa rule |

---

## 👤 Hồ sơ & Tài khoản — 12 actions

| Action | Mô tả |
|--------|-------|
| `me` | Thông tin tài khoản hiện tại |
| `status` | Trạng thái kết nối |
| `get-user-info` | Chi tiết user (`userId`) |
| `last-online` | Lần cuối online (`userId`) |
| `get-qr` | QR code tài khoản |
| `update-profile` | Cập nhật (`name`, `dob`, `gender`) |
| `update-profile-bio` | Cập nhật bio |
| `change-avatar` | Đổi avatar |
| `delete-avatar` | Xóa avatar |
| `get-avatar-list` | Danh sách avatar lưu trữ |
| `reuse-avatar` | Dùng lại avatar cũ (`photoId`) |
| `get-full-avatar` | Lấy URL avatar full size |
| `get-friend-board` | `threadId` (**required** — conversationId của DM với người đó) | Board bạn bè |

---

## 🔒 Block & Access Control — 12 actions

| Action | Mô tả |
|--------|-------|
| `zalo-block-user` | Chặn ở cấp Zalo |
| `zalo-unblock-user` | Bỏ chặn Zalo |
| `block-user` | Chặn trong OpenClaw |
| `unblock-user` | Bỏ chặn OpenClaw |
| `block-user-in-group` | Chặn user trong nhóm cụ thể |
| `unblock-user-in-group` | Bỏ chặn |
| `allow-user-in-group` | Thêm vào allowlist nhóm |
| `unallow-user-in-group` | Xóa khỏi allowlist |
| `list-blocked` | Danh sách bị chặn (OpenClaw) |
| `list-allowed` | Danh sách allowlist |
| `list-blocked-in-group` | Chặn theo nhóm |
| `list-allowed-in-group` | Allowlist theo nhóm |

---

## 🛍️ Sản phẩm & Catalog — 8 actions

| Action | Mô tả |
|--------|-------|
| `create-catalog` / `update-catalog` / `delete-catalog` | CRUD catalog |
| `get-catalogs` | Danh sách catalog |
| `create-product` / `update-product` / `delete-product` | CRUD sản phẩm |
| `get-products` | Danh sách sản phẩm (`catalogId`) |

---

## 📋 Ghi chú — 2 actions

| Action | Params | Mô tả |
|--------|--------|-------|
| `create-note` | `threadId`, `title`, `message` | Tạo ghi chú |
| `edit-note` | `topicId`, `title`, `message` | Sửa ghi chú |
| `get-boards` | `threadId` | Danh sách board |
| `get-labels` | — | Nhãn |

---

## ⚙️ Cài đặt — 3 actions

| Action | Mô tả |
|--------|-------|
| `get-settings` | Xem cài đặt tài khoản |
| `update-setting` | Cập nhật (`settingKey`, `settingValue`) |
| `update-active-status` | Online/offline (`active: true/false`) |

---

## 🔍 Tiện ích — 6 actions

| Action | Mô tả |
|--------|-------|
| `search-stickers` | Tìm sticker theo `keyword` |
| `search-sticker-detail` | `stickerId` (**required**, lấy từ kết quả `search-stickers`) | Chi tiết sticker |
| `parse-link` | Parse metadata URL |
| `send-report` | Báo cáo user (`reason`: 0=other·1=sensitive·2=annoy·3=fraud) |
| `get-biz-account` | Thông tin tài khoản Business |

---

## 📖 Passive History — 2 actions (mới trong v2.4.0)

> Yêu cầu bật `passiveCollector.enabled: true` trong config.

| Action | Params | Mô tả |
|--------|--------|-------|
| `recall-group-history` | `groupId`/`threadId`, `count` (default 50), `query` (optional) | Đọc lịch sử nhóm từ JSONL log |
| `list-passive-groups` | — | Liệt kê tất cả nhóm có passive log |

---

## Patterns hay dùng

```jsonc
// Gửi text có urgency
{ "action": "send", "threadId": "...", "message": "🚨 Alert!", "isGroup": true, "urgency": 2 }

// Gửi bold trong nhóm
{ "action": "send-styled", "threadId": "...", "message": "**Quan trọng:** Họp lúc 3h", "isGroup": true }

// Tìm user và gửi
{ "action": "find-user", "phoneNumber": "0987654321" }
// → lấy userId từ kết quả → send

// Set requireMention config cho group (group-mention = config, không phải gửi tin)
{ "action": "group-mention", "groupId": "...", "requireMention": true }

// Gửi tin nhắn có @mention → dùng send-styled
{ "action": "send-styled", "threadId": "...", "message": "**@Tên ơi** xem cái này đi", "isGroup": true }

// Recall lịch sử nhóm
{ "action": "recall-group-history", "groupId": "...", "count": 30, "query": "họp" }
```
