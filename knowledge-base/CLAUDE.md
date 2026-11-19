# CLAUDE.md — Hướng dẫn Claude làm việc với knowledge base

Đây là "bộ não thứ hai" của Thang: nơi lưu ghi chú công việc vận hành, quản lý dự án và brainstorming. Claude dùng thư mục này để **tra cứu trước khi trả lời** và **ghi lại sau khi làm việc**, để kiến thức không mất đi giữa các phiên.

## 1. Cấu trúc thư mục (PARA mở rộng)

| Thư mục | Chứa gì | Khi nào dùng |
|---|---|---|
| `00-inbox/` | Ghi chú thô, chưa phân loại | Mặc định khi chưa biết để đâu. Ghi nhanh, phân loại sau |
| `10-projects/` | Mỗi dự án một thư mục con, có mục tiêu và hạn chót | Việc có điểm kết thúc rõ ràng |
| `20-areas/` | Mảng trách nhiệm dài hạn (vận hành, nhân sự, ngân sách, quan hệ đối tác...) | Việc phải duy trì liên tục, không có ngày kết thúc |
| `30-resources/` | Kiến thức tham khảo: quy trình, framework, thuật ngữ, bài học, tài liệu đọc | Thứ có thể dùng lại cho nhiều dự án |
| `40-archive/` | Dự án đã đóng, mảng không còn phụ trách, tài liệu hết hiệu lực | Không xóa, chỉ chuyển vào đây |
| `50-journal/daily/` | Nhật ký ngày: `YYYY-MM-DD.md` | Mỗi ngày làm việc |
| `50-journal/weekly/` | Tổng kết tuần: `YYYY-Www.md` (vd. `2026-W44.md`) | Cuối tuần |
| `60-reports/` | Báo cáo đã soạn: `YYYY-MM-DD-ten-bao-cao.md` | Báo cáo tiến độ, báo cáo gửi lãnh đạo |
| `70-brainstorm/` | Phiên brainstorm: `YYYY-MM-DD-chu-de.md` | Ý tưởng, phân tích phương án |
| `templates/` | Mẫu ghi chú | Luôn tạo ghi chú mới từ mẫu tương ứng |

Thư mục dự án: `10-projects/<ten-du-an>/` gồm `README.md` (tạo từ `templates/du-an.md`) và các ghi chú con (biên bản họp, quyết định, rủi ro...). Báo cáo hay brainstorm thuộc một dự án thì có thể để trong thư mục dự án đó thay vì `60-reports/` hay `70-brainstorm/`, miễn là có liên kết từ `README.md` của dự án.

## 2. Quy ước chung

- **Ngôn ngữ:** tiếng Việt có dấu. Thuật ngữ chuyên môn tiếng Anh giữ nguyên khi đó là cách gọi quen thuộc (KPI, deadline, steerco...).
- **Tên file:** chữ thường, không dấu, nối bằng gạch ngang. Ví dụ `10-projects/chuyen-doi-so-chi-nhanh/README.md`. Ngày theo định dạng `YYYY-MM-DD`.
- **Frontmatter:** mọi ghi chú bắt đầu bằng khối YAML lấy từ mẫu. Các trường tối thiểu: `title`, `type`, `created`, `updated`, `tags`. Ghi chú dự án có thêm `status`, `owner`, `deadline`.
- **Giá trị `status`:** `y-tuong` · `dang-lam` · `tam-dung` · `hoan-thanh` · `huy`.
- **Giá trị `type`:** `du-an` · `bao-cao` · `brainstorm` · `nhat-ky-ngay` · `tong-ket-tuan` · `bien-ban-hop` · `quyet-dinh` · `ghi-chu`.
- **Liên kết:** dùng link Markdown tương đối, ví dụ `[Dự án X](../10-projects/du-an-x/README.md)`, để đọc được trên GitHub. Mỗi ghi chú mới nên liên kết tới ít nhất một ghi chú liên quan (dự án, mảng, hoặc nhật ký ngày).
- **Tags:** viết thường, không dấu, ví dụ `#van-hanh`, `#rui-ro`, `#nhan-su`. Ưu tiên tái dùng tag đã có (tìm bằng `grep -rh "^tags:" knowledge-base`).

## 3. Cách Claude ĐỌC knowledge base

Trước khi trả lời câu hỏi hoặc làm việc liên quan đến một dự án, một người, hay một chủ đề:

1. Tìm theo từ khóa: `grep -ril "<từ khóa>" knowledge-base/` (thử cả có dấu và không dấu).
2. Nếu là dự án, đọc `10-projects/<ten-du-an>/README.md` trước, rồi đến ghi chú mới nhất trong thư mục đó.
3. Xem nhật ký ngày và tổng kết tuần gần nhất trong `50-journal/` để nắm bối cảnh hiện tại.
4. Khi trả lời, **dẫn nguồn** bằng đường dẫn file. Nếu thông tin trong knowledge base có vẻ cũ (trường `updated` lâu rồi) hoặc mâu thuẫn nhau, nói rõ thay vì tự chọn.
5. Không bịa thông tin không có trong ghi chú. Thiếu thì hỏi Thang.

## 4. Cách Claude GHI vào knowledge base

**Luôn làm:**
- Tạo ghi chú mới **từ mẫu** trong `templates/`, điền frontmatter, cập nhật `updated` khi sửa.
- Khi không chắc để đâu, ghi vào `00-inbox/` với tên `YYYY-MM-DD-chu-de.md`.
- Sau một phiên làm việc có kết quả (quyết định, việc cần làm, bài học), thêm vài dòng tóm tắt vào nhật ký ngày `50-journal/daily/YYYY-MM-DD.md` (tạo từ mẫu nếu chưa có), kèm link tới ghi chú chi tiết.
- Khi có quyết định quan trọng trong dự án, ghi vào mục **Nhật ký quyết định** trong `README.md` của dự án: ngày, quyết định, người quyết, lý do.
- Việc cần làm ghi dạng checkbox `- [ ] Việc — @người phụ trách — hạn YYYY-MM-DD`.

**Không bao giờ:**
- Xóa ghi chú. Hết dùng thì chuyển sang `40-archive/` (giữ nguyên cấu trúc thư mục con) và đặt `status: hoan-thanh` hoặc `huy`.
- Ghi đè nội dung Thang đã viết mà không hỏi. Được phép bổ sung, sửa lỗi chính tả, cập nhật trạng thái.
- Lưu mật khẩu, token, số tài khoản, thông tin khách hàng hay dữ liệu mật của tổ chức. Chỉ ghi tham chiếu (vd. "xem file X trên ổ chung").
- Đổi tên hay di chuyển hàng loạt file khi chưa được đồng ý.

## 5. Các việc thường gặp

| Thang nói | Claude làm |
|---|---|
| "Ghi nhanh: ..." | Tạo file trong `00-inbox/`, frontmatter tối thiểu |
| "Dọn inbox" | Đọc từng file trong `00-inbox/`, đề xuất nơi chuyển đến (dự án/mảng/tài nguyên), chuyển sau khi Thang đồng ý |
| "Tạo dự án mới X" | Tạo `10-projects/x/README.md` từ `templates/du-an.md`, hỏi các thông tin còn thiếu (mục tiêu, owner, deadline) |
| "Tình hình dự án X?" | Đọc README và ghi chú gần nhất của dự án, tóm tắt: tiến độ, rủi ro, việc quá hạn, việc tiếp theo |
| "Viết báo cáo tuần/tháng" | Đọc nhật ký và ghi chú dự án trong kỳ, soạn từ `templates/bao-cao.md`, lưu vào `60-reports/` |
| "Brainstorm về ..." | Tạo ghi chú từ `templates/brainstorm.md` trong `70-brainstorm/`, điền ý tưởng, đánh giá và bước tiếp theo |
| "Ghi nhật ký hôm nay" | Tạo/cập nhật `50-journal/daily/YYYY-MM-DD.md` từ `templates/nhat-ky-ngay.md` |
| "Tổng kết tuần" | Đọc các nhật ký ngày trong tuần, soạn `50-journal/weekly/YYYY-Www.md` từ `templates/tong-ket-tuan.md` |
| "Đóng dự án X" | Điền phần bài học trong README, đặt `status: hoan-thanh`, chuyển thư mục sang `40-archive/`, cập nhật link trong `20-areas/` nếu có |

## 6. Bảo trì định kỳ

Khi Thang yêu cầu "rà soát knowledge base", kiểm tra và báo cáo:
- File trong `00-inbox/` cũ hơn 7 ngày.
- Dự án `dang-lam` mà `updated` cũ hơn 14 ngày.
- Việc cần làm quá hạn (checkbox chưa đánh dấu có hạn đã qua).
- Link Markdown hỏng.

Chỉ báo cáo và đề xuất, không tự sửa hàng loạt.
