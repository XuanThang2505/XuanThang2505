#!/bin/bash
# Gỡ toàn bộ agent Remote Control do install.sh cài.
set -u
for p in "$HOME"/Library/LaunchAgents/com.thang.claude-rc.*.plist; do
  [[ -e "$p" ]] || continue
  label="$(basename "$p" .plist)"
  launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
  rm -f "$p" && echo "Đã gỡ $label"
done
