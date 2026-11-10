#!/bin/bash
# Cài Remote Control chạy nền trên macOS, tự khởi động lại khi bị tắt,
# và giữ máy không ngủ để kết nối được từ bên ngoài (điện thoại, claude.ai).
#
# Dùng:  ./install.sh "/Users/lio/CLAUDE" ["/Users/lio/CLAUDE/Projects/THANG" ...]
# Mặc định (không truyền gì): /Users/$USER/CLAUDE
set -euo pipefail

LABEL_PREFIX="com.thang.claude-rc"
AGENTS_DIR="$HOME/Library/LaunchAgents"
LOG_DIR="$HOME/Library/Logs/claude-rc"
mkdir -p "$AGENTS_DIR" "$LOG_DIR"

[[ "$(uname)" == "Darwin" ]] || { echo "Script này chỉ dành cho macOS."; exit 1; }

# 1) Tìm đường dẫn tuyệt đối của claude (launchd không có PATH của shell).
CLAUDE_BIN="$(command -v claude || true)"
for c in "$HOME/.local/bin/claude" "$HOME/.claude/local/claude" /opt/homebrew/bin/claude /usr/local/bin/claude; do
  [[ -z "$CLAUDE_BIN" && -x "$c" ]] && CLAUDE_BIN="$c"
done
[[ -n "$CLAUDE_BIN" ]] || { echo "Không tìm thấy lệnh 'claude'. Cài Claude Code trước: https://claude.com/claude-code"; exit 1; }
echo "claude: $CLAUDE_BIN ($("$CLAUDE_BIN" --version 2>/dev/null || echo '?'))"

FOLDERS=("$@")
[[ ${#FOLDERS[@]} -gt 0 ]] || FOLDERS=("$HOME/CLAUDE")

slug() { basename "$1" | tr -cs '[:alnum:]' '-' | sed 's/-*$//' | tr '[:upper:]' '[:lower:]'; }

write_agent() { # label, workdir, program args...
  local label="$1" workdir="$2"; shift 2
  local plist="$AGENTS_DIR/$label.plist" args=""
  for a in "$@"; do args+="    <string>$a</string>"$'\n'; done
  cat > "$plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$label</string>
  <key>ProgramArguments</key>
  <array>
$args  </array>
  <key>WorkingDirectory</key><string>$workdir</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>$(dirname "$CLAUDE_BIN"):/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    <key>HOME</key><string>$HOME</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>30</integer>
  <key>StandardOutPath</key><string>$LOG_DIR/$label.log</string>
  <key>StandardErrorPath</key><string>$LOG_DIR/$label.log</string>
</dict>
</plist>
PLIST
  launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
  launchctl bootstrap "gui/$(id -u)" "$plist"
  echo "  ✓ $label"
}

# 2) Một agent Remote Control cho mỗi thư mục.
#    'script -q /dev/null' cấp một terminal giả, vì remote-control là chương trình
#    dạng terminal; chạy thẳng dưới launchd (không có TTY) có thể thoát ngay.
#    'tail -f /dev/null |' giữ stdin mở mãi, để script không nhận EOF rồi tự thoát.
echo "Cài Remote Control cho ${#FOLDERS[@]} thư mục:"
for f in "${FOLDERS[@]}"; do
  [[ -d "$f" ]] || { echo "  ✗ Bỏ qua, không có thư mục: $f"; continue; }
  name="$(basename "$f")"
  write_agent "$LABEL_PREFIX.$(slug "$f")" "$f" \
    /bin/sh -c 'tail -f /dev/null | /usr/bin/script -q /dev/null "$@"' sh \
    "$CLAUDE_BIN" remote-control --name "$name"
done

# 3) Giữ máy thức khi cắm sạc (caffeinate -s). Đóng nắp vẫn ngủ trừ khi có màn hình ngoài.
write_agent "$LABEL_PREFIX.caffeinate" "$HOME" /usr/bin/caffeinate -s -i

cat <<MSG

Xong. Log: $LOG_DIR
Kiểm tra:  ./doctor.sh
Nên chạy thêm (cần mật khẩu máy) để Mac không ngủ khi cắm sạc và tự bật lại sau mất điện:
  sudo pmset -c sleep 0 disksleep 0 womp 1 autorestart 1 tcpkeepalive 1
MSG
