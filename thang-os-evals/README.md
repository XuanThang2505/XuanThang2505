# thang-os evals (draft, chờ Thang duyệt)

9 case cho 3 skill: `ocb-write` (W1-W3), `qa-audit` (Q1-Q3), `ocb-meeting-recap` (R1-R3). Mỗi case gồm câu Thang gõ, file đầu vào và danh sách hành vi phải thấy. Có tổng cộng 60 hành vi, mỗi hành vi chấm PASS hoặc FAIL. Format lấy theo `evaluations.json` của AgenticOS. Đây là phần bổ sung cho `router-tests.md`, không thay nó: router test chỉ chấm tầng và skill chính, eval này chấm skill làm có đúng không.

## Cách chạy

1. Kiểm phần máy trước. Bước này chứng minh fixture vẫn bắt được đúng các lỗi đã cài:

   ```bash
   python3 -I check_fixtures.py <thư mục thang-os-kit/skills>
   ```

   Lần chạy 27/11/2026: 10/10 PASS.

2. Mỗi case chạy trong một chat mới, để context trước đó không dẫn dắt kết quả. Dán `query` và đính kèm `files`. Q2 cần một tờ trình .docx thật.
3. Chấm từng dòng `expected_behavior`. Điểm của case là số dòng PASS trên tổng số dòng. Dòng nào lệch thì ghi một câu lý do.
4. Theo `governance.md` mục 5: chạy trước và sau mỗi lần sửa skill, mỗi lần chỉ sửa một thứ, kiểm luôn các case không liên quan đến chỗ sửa.

## Fixture

| File | Case | Lỗi cài sẵn |
|---|---|---|
| `fixtures/qa_status_seeded.md` | Q1 | Ngày 31/11 không tồn tại, thứ sai với ngày, khoảng ngày đảo ngược, dòng tổng sai, tỷ lệ % sai, em-dash, `[TBD]`, gọi CEO là General Director, người nhận lệch với người duyệt, owner không cụ thể |
| `fixtures/run_dashboard_cdn.html` | Q3 | Lỗi JS `countStatus`, có 16 KP trong khi tiêu đề ghi 17, tải Chart.js qua CDN |
| `fixtures/recap_notes_traps.md` | R1 | Câu "TGĐ yêu cầu...", phê bình cá nhân có tên, việc thiếu deadline, việc thiếu chủ trì, deadline rơi vào Chủ nhật |
| `fixtures/recap_notes_transition.md` | R2 | Họp khi anh Chris còn là Quyền TGĐ, ký sau 26/10/2026 |
| `fixtures/recap_notes_bilingual.md` | R3 | Dấu thập phân khi sang bản EN, viết tắt, calque "điểm sáng", việc gồm 2 phần |

## Điểm cần Thang quyết

- **Chỗ để bộ eval.** Có hai lựa chọn: để trong repo này, hoặc chuyển vào kit (`thang-os/references/evals/`). Chuyển vào kit là sửa skill, nên phải đi theo `governance.md`.
- **Script báo nhầm.** Q1 cho thấy `run_all.py` cộng cả cột %, nên báo nhầm dòng Tổng ở cột Tỷ lệ là 242. Case này đang chấm việc Claude tự nhận ra đó là báo nhầm. Sửa script thì để một thay đổi riêng.
- **Expectation W1.** W1 đang kỳ vọng trạng thái Delay. Nếu anh vẫn quen gọi trường hợp này là At Risk thì sửa lại dòng đó.
