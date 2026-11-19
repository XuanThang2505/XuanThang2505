#!/bin/bash
# Chẩn đoán vì sao Remote Control hiện "offline" trên claude.ai / app điện thoại.
set -u
ok()   { echo "  ✓ $*"; }
bad()  { echo "  ✗ $*"; FAIL=1; }
warn() { echo "  ! $*"; }
FAIL=0

echo "1. Claude Code"
CLAUDE_BIN="$(command -v claude || true)"
[[ -z "$CLAUDE_BIN" ]] && for c in "$HOME/.local/bin/claude" /opt/homebrew/bin/claude /usr/local/bin/claude; do [[ -x "$c" ]] && CLAUDE_BIN="$c"; done
if [[ -n "$CLAUDE_BIN" ]]; then ok "$CLAUDE_BIN — $("$CLAUDE_BIN" --version 2>/dev/null)"; else bad "Chưa cài claude"; fi

echo "2. Mạng tới Anthropic"
if curl -fsS -o /dev/null -m 10 https://api.anthropic.com/ 2>/dev/null || curl -sS -o /dev/null -m 10 -w '%{http_code}' https://api.anthropic.com/ 2>/dev/null | grep -qE '^[2-4]'; then
  ok "api.anthropic.com truy cập được"
else
  bad "Không tới được api.anthropic.com (VPN công ty / proxy / firewall?)"
fi
curl -sS -o /dev/null -m 10 https://claude.ai/ 2>/dev/null && ok "claude.ai truy cập được" || bad "Không tới được claude.ai"

echo "3. Agent nền (launchd)"
found=0
for p in "$HOME"/Library/LaunchAgents/com.thang.claude-rc.*.plist; do
  [[ -e "$p" ]] || continue; found=1
  label="$(basename "$p" .plist)"
  info="$(launchctl print "gui/$(id -u)/$label" 2>/dev/null)"
  if [[ -z "$info" ]]; then bad "$label chưa được load (chạy lại install.sh)"; continue; fi
  pid="$(echo "$info" | awk '/^\tpid =/{print $3}')"
  last="$(echo "$info" | awk -F'= ' '/last exit code/{print $2}')"
  if [[ -n "$pid" ]]; then ok "$label đang chạy (pid $pid)"; else bad "$label KHÔNG chạy, last exit: ${last:-?}"; fi
done
[[ $found == 0 ]] && warn "Chưa cài agent nền. Nếu anh chạy tay 'claude remote-control' thì tắt Terminal là offline. Chạy ./install.sh"

echo "4. Tiến trình remote-control"
if pgrep -fl "claude.*remote-control" >/dev/null; then ok "$(pgrep -fl 'claude.*remote-control' | head -3 | tr '\n' ' ')"; else bad "Không có tiến trình 'claude remote-control' nào"; fi
if pgrep -x Claude >/dev/null; then ok "Claude Desktop đang mở"; else warn "Claude Desktop đang đóng (môi trường tạo từ Desktop sẽ offline)"; fi

echo "5. Ngủ / nguồn điện"
pmset -g batt 2>/dev/null | head -1 | sed 's/^/  /'
s="$(pmset -g 2>/dev/null | awk '$1=="sleep"{print $2}')"
[[ "$s" == "0" ]] && ok "System sleep = 0 (không tự ngủ)" || warn "System sleep = ${s:-?} phút: máy ngủ là mất kết nối. Xem README."
pmset -g assertions 2>/dev/null | grep -q caffeinate && ok "caffeinate đang giữ máy thức" || warn "Không có caffeinate"
pmset -g log 2>/dev/null | grep -E "Entering Sleep|Wake from" | tail -3 | sed 's/^/    /'

echo "6. Log gần nhất"
for l in "$HOME"/Library/Logs/claude-rc/*.log; do
  [[ -e "$l" ]] || continue
  echo "  --- $(basename "$l")"; tail -n 8 "$l" | sed 's/\x1b\[[0-9;?]*[a-zA-Z]//g' | sed 's/^/    /'
done

echo
[[ $FAIL == 0 ]] && echo "Không thấy lỗi chặn. Nếu claude.ai vẫn báo offline, mở log ở mục 6 và gửi cho Claude." \
                 || echo "Có lỗi (✗) ở trên. Sửa theo README.md mục 'Lỗi thường gặp'."
