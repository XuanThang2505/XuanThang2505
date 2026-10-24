#!/usr/bin/env python3
"""
clean_samsung_tv.py  —  Chạy TRÊN MÁY MAC CỦA ANH (cùng WiFi với TV).

Việc nó làm:
  1. Tự tìm dải mạng nội bộ của anh.
  2. Quét tìm TV Samsung (hỏi thẳng REST API của TV ở cổng 8001 -> lấy model, tên).
  3. In ra IP + model để anh xác nhận đúng cái Q70A.
  4. Sinh ra các file blocklist (hosts / AdGuard Home / Pi-hole) chặn
     telemetry + quảng cáo của Samsung.

KHÔNG root, KHÔNG đổi gì trên TV. Chỉ đọc mạng + tạo file. An toàn.

Cách chạy:
    python3 clean_samsung_tv.py
"""

import concurrent.futures
import ipaddress
import json
import socket
import subprocess
import sys
import urllib.request

# Các domain Samsung TV "gọi về nhà" (ACR theo dõi nội dung + quảng cáo + telemetry)
SAMSUNG_BLOCK = [
    "samsungacr.com",             # ACR - theo dõi anh xem gì (quan trọng nhất)
    "samsungads.com",             # quảng cáo
    "samsungotn.net",
    "samsungrm.net",
    "samsungcloudsolution.com",
    "samsungcloudsolution.net",
    "samsunglm.net",
    "gpm.samsungqbe.com",
    "log-ingestion.samsungacr.com",
    "lcprd1.samsungcloudsolution.net",
]


def local_subnet():
    """Đoán dải mạng /24 của máy Mac (vd 192.168.1.0/24)."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    finally:
        s.close()
    return ip, ipaddress.ip_network(ip + "/24", strict=False)


def probe_samsung(ip):
    """Hỏi REST API của TV Samsung. Trả về dict thông tin nếu đúng là Samsung."""
    url = f"http://{ip}:8001/api/v2/"
    try:
        with urllib.request.urlopen(url, timeout=1.5) as r:
            data = json.loads(r.read().decode("utf-8", "ignore"))
        dev = data.get("device", {})
        name = (dev.get("name") or "") + (dev.get("modelName") or "")
        if "samsung" in json.dumps(data).lower() or "tizen" in name.lower() or dev:
            return {
                "ip": ip,
                "model": dev.get("modelName", "?"),
                "name": dev.get("name", "?"),
                "wifiMac": dev.get("wifiMac", "?"),
                "os": dev.get("OS", "?"),
            }
    except Exception:
        return None
    return None


def scan(network):
    print(f"[*] Đang quét {network} tìm TV Samsung (cổng 8001)...")
    hosts = [str(h) for h in network.hosts()]
    found = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=128) as ex:
        for res in ex.map(probe_samsung, hosts):
            if res:
                found.append(res)
                print(f"    -> TÌM THẤY: {res['ip']}  model={res['model']}  "
                      f"tên={res['name']}  mac={res['wifiMac']}")
    return found


def write_blocklists():
    # 1) hosts-style (dùng cho /etc/hosts hoặc AdGuard Home custom rules)
    with open("samsung_block_hosts.txt", "w") as f:
        for d in SAMSUNG_BLOCK:
            f.write(f"0.0.0.0 {d}\n")
            f.write(f"0.0.0.0 *.{d}\n")

    # 2) AdGuard Home / AdBlock syntax
    with open("samsung_block_adguard.txt", "w") as f:
        for d in SAMSUNG_BLOCK:
            f.write(f"||{d}^\n")

    # 3) Pi-hole regex
    with open("samsung_block_pihole.txt", "w") as f:
        for d in SAMSUNG_BLOCK:
            f.write(f"(\\.|^){d.replace('.', '\\\\.')}$\n")

    print("\n[*] Đã tạo 3 file blocklist trong thư mục hiện tại:")
    print("    - samsung_block_hosts.txt     (AdGuard Home 'custom filtering rules' / /etc/hosts)")
    print("    - samsung_block_adguard.txt   (AdGuard / AdBlock)")
    print("    - samsung_block_pihole.txt    (Pi-hole regex blacklist)")


def main():
    try:
        my_ip, net = local_subnet()
    except Exception as e:
        print(f"[!] Không xác định được mạng nội bộ: {e}")
        sys.exit(1)

    print(f"[*] IP máy Mac của anh: {my_ip}")
    found = scan(net)

    if not found:
        print("\n[!] Không thấy TV Samsung. Kiểm tra: TV có bật không, có cùng WiFi không,")
        print("    hoặc firewall chặn cổng 8001. Thử bật TV lên rồi chạy lại.")
    else:
        print(f"\n[*] Xong. Tìm thấy {len(found)} TV Samsung ở trên.")
        print("    Ghi lại IP để đổi DNS hoặc theo dõi.")

    write_blocklists()
    print("\n[*] HOÀN TẤT. Giờ anh: (1) tắt 'Dịch vụ thông tin xem' trong Settings TV,")
    print("    (2) nạp blocklist vào AdGuard Home/router, hoặc đổi DNS TV sang 94.140.14.14")


if __name__ == "__main__":
    main()
