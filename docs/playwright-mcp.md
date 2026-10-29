# Playwright MCP: điều khiển trình duyệt từ Claude Code

File `.mcp.json` ở gốc repo khai báo server MCP `playwright`. Khi mở repo này bằng Claude Code, Claude có thêm các công cụ `browser_*` để mở trang, bấm, gõ, chụp màn hình và đọc nội dung trang.

## Cách dùng

1. Mở repo bằng Claude Code (web hoặc CLI). Lần đầu, Claude Code sẽ hỏi có tin cậy server trong `.mcp.json` không: chọn đồng ý.
2. Kiểm tra server đã chạy bằng lệnh `/mcp` (thấy `playwright` ở trạng thái connected).
3. Nhờ Claude bằng lời thường, ví dụ:
   - "Mở http://localhost:5173 và chụp màn hình trang danh sách dự án."
   - "Vào trang dashboard, bấm nút Thêm dự án và kiểm tra form có hiện không."
   - "Đọc tiêu đề và các cột của bảng trên trang này."

Để thử app trong repo: chạy `npm install` rồi `npm run dev`, sau đó nhờ Claude mở `http://localhost:5173`.

## Cấu hình hiện tại

Server chạy bằng `npx -y @playwright/mcp@latest` với các tham số:

| Tham số | Ý nghĩa |
|---|---|
| `--headless` | Chạy trình duyệt không có cửa sổ (phù hợp môi trường cloud). |
| `--no-sandbox` | Cần khi chạy Chromium bằng quyền root trong container. |
| `--executable-path /opt/pw-browsers/chromium` | Dùng Chromium cài sẵn trong môi trường cloud của Claude Code, không phải tải thêm. |

Kết quả phụ (snapshot, log console, ảnh chụp) được ghi vào thư mục `.playwright-mcp/`, đã đưa vào `.gitignore`.

## Dùng trên máy cá nhân

Đường dẫn `/opt/pw-browsers/chromium` chỉ có trong môi trường cloud. Trên máy Windows hoặc Mac:

1. Xoá hai dòng `--executable-path` và `/opt/pw-browsers/chromium` trong `.mcp.json` (có thể bỏ cả `--no-sandbox`, `--headless` nếu muốn thấy cửa sổ trình duyệt).
2. Cài trình duyệt cho Playwright một lần: `npx playwright install chromium`.

Hoặc giữ nguyên `.mcp.json` và thêm server riêng cho máy mình bằng lệnh:

```bash
claude mcp add playwright --scope local -- npx -y @playwright/mcp@latest
```

## Lưu ý

- Môi trường cloud có chính sách mạng riêng: trang nội bộ (`localhost`, `127.0.0.1`) luôn mở được, còn trang ngoài internet chỉ mở được nếu tên miền nằm trong danh sách cho phép của môi trường. Lỗi `ERR_TUNNEL_CONNECTION_FAILED` nghĩa là tên miền bị chặn, không phải lỗi cấu hình.
- `@latest` luôn lấy bản mới nhất. Nếu cần ổn định, thay bằng số phiên bản cụ thể, ví dụ `@playwright/mcp@0.0.83`.
