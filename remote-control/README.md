# Remote Control: dùng Claude trên Mac từ bất cứ đâu

Mục tiêu: từ điện thoại hoặc claude.ai ở bất kỳ đâu, anh vẫn ra lệnh được cho Claude chạy trên MacBook (thư mục `CLAUDE`, `THANG`, `Reqwise Figma`).

## Vì sao đang "offline"

Remote Control **không phải là server trên internet**. Nó là một chương trình chạy *trên chính chiếc Mac*, tự gọi ra ngoài tới Anthropic. Không cần mở port, không cần IP tĩnh, không cần VPN. Nhưng claude.ai sẽ báo **offline** ngay khi một trong các điều sau xảy ra:

| Nguyên nhân | Dấu hiệu | Cách sửa |
|---|---|---|
| Mac ngủ / gập nắp | Offline sau vài phút không dùng | `sudo pmset -c sleep 0` + cắm sạc; gập nắp thì cần màn hình ngoài, hoặc để mở nắp |
| Đã tắt cửa sổ Terminal chạy `claude remote-control`, hoặc thoát Claude Desktop | Offline ngay khi đóng | `./install.sh` để chạy nền, tự bật lại |
| Mac khởi động lại / mất điện | Offline sau khi restart | Agent của `install.sh` tự chạy khi đăng nhập; `sudo pmset autorestart 1` |
| Mất mạng, Wi‑Fi công ty chặn, VPN chặn | `doctor.sh` báo ✗ ở mục 2 | Đổi mạng / tắt VPN / xin IT mở `api.anthropic.com`, `claude.ai` |
| Hết phiên đăng nhập Claude Code | Log có `login`/`401`/`unauthorized` | Mở Terminal, chạy `claude` rồi `/login` |

## Cài đặt (1 lần, ~2 phút)

Mở **Terminal** trên Mac:

```bash
cd ~
git clone https://github.com/XuanThang2505/XuanThang2505.git
cd XuanThang2505/remote-control

# Lần đầu chạy tay 1 lần để đăng nhập và tin cậy thư mục, xong bấm Ctrl+C
cd ~/CLAUDE && claude remote-control; cd -

# Cài chạy nền cho các thư mục cần dùng
./install.sh "$HOME/CLAUDE" "$HOME/CLAUDE/Projects/THANG" "$HOME/Documents/Reqwise Figma"

# Không cho Mac ngủ khi cắm sạc, tự bật lại sau mất điện (nhập mật khẩu máy)
sudo pmset -c sleep 0 disksleep 0 womp 1 autorestart 1 tcpkeepalive 1

# Kiểm tra
./doctor.sh
```

Sau đó mở claude.ai/code hoặc app Claude trên điện thoại: các môi trường của "Kim-Diens-Macbook-Air" phải chuyển sang online.

`install.sh` làm gì:
- Tạo LaunchAgent `com.thang.claude-rc.<thư-mục>` cho mỗi thư mục, chạy `claude remote-control`, **tự khởi động lại** nếu bị tắt và tự chạy khi đăng nhập.
- Tạo `com.thang.claude-rc.caffeinate` giữ máy thức khi cắm sạc.
- Log ở `~/Library/Logs/claude-rc/`.

## Gỡ lỗi

```bash
./doctor.sh                                  # chẩn đoán đủ 6 mục
tail -f ~/Library/Logs/claude-rc/*.log       # xem log trực tiếp
launchctl kickstart -k gui/$(id -u)/com.thang.claude-rc.claude   # khởi động lại 1 agent
./uninstall.sh                               # gỡ hết
```

Chạy `./doctor.sh` rồi gửi kết quả cho Claude nếu vẫn offline.

## Lưu ý

- **Gập nắp MacBook Air không cắm màn hình ngoài thì máy vẫn ngủ**, không phần mềm nào giữ được một cách an toàn. Muốn dùng 24/7, để mở nắp và cắm sạc, hoặc dùng một máy luôn bật (Mac mini).
- Mỗi thư mục là một môi trường riêng trên claude.ai. Chỉ cài những thư mục anh thực sự cần dùng từ xa.
- Ai đăng nhập được tài khoản Claude của anh thì điều khiển được máy này. Bật xác thực 2 lớp cho tài khoản.
