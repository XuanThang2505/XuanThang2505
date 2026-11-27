#!/usr/bin/env python3
"""Kiem fixture van bat dung loi da cai, truoc khi cham eval.

Chay: python3 -I check_fixtures.py /duong/dan/thang-os-kit/skills
Chi kiem phan may cua skill (script). Phan hanh vi (expected_behavior) cham bang tay
o chat moi, theo README.
"""
import subprocess, sys, os, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    return p.returncode, p.stdout + p.stderr


def check(name, ok, detail=""):
    print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f"  ({detail})" if detail and not ok else ""))
    return ok


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    skills = sys.argv[1]
    results = []

    # Q1: qa-audit run_all.py phai bat 7 LOI cai san
    _, out = run([sys.executable, "-I", f"{skills}/qa-audit/scripts/run_all.py",
                  f"{HERE}/fixtures/qa_status_seeded.md"])
    for needle in ["Ngay khong ton tai: 31/11/2026", "04/12/2026 la Thu Sau",
                   "Khoang ngay dao nguoc", "Ghi 10,8 nhung cac dong cong ra 9.8",
                   "Em dash", "Placeholder", "TONG: 7 LOI"]:
        results.append(check(f"Q1 run_all bat '{needle}'", needle in out))

    # R*: build_notice.py phai tu choi seeded_errors.json voi 5 FAIL
    seeded = f"{skills}/ocb-meeting-recap/examples/seeded_errors.json"
    tmp = tempfile.mkdtemp()
    code, out = run([sys.executable, "-I", f"{skills}/ocb-meeting-recap/scripts/build_notice.py", seeded, tmp])
    results.append(check("recap lint tu choi seeded_errors (exit 1)", code == 1, f"exit {code}"))
    results.append(check("recap lint bao 5 FAIL", "5 FAIL" in out))
    results.append(check("recap lint bat lech so VI/EN", "VI và EN không khớp" in out))

    print(f"\n{sum(results)}/{len(results)} PASS")
    sys.exit(0 if all(results) else 1)


if __name__ == "__main__":
    main()
