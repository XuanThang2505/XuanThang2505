# 🪐 Kid's 3D Space English Atlas

Ứng dụng web 3D cho bé 3–6 tuổi học tiếng Anh về vũ trụ trên iPad: hành tinh 3D gần giống thật, hiệu ứng chuyển động, giọng đọc tiếng Anh và phụ đề tiếng Việt.

## Mở app

- **Link cố định (khuyên dùng):** https://xuanthang2505.github.io/XuanThang2505/
  sau khi bật GitHub Pages (xem mục *Đưa lên GitHub Pages*). Không cần đăng nhập, chạy offline, cài được thành icon.
- **iPad / iPhone:** mở link bằng Safari → nút Chia sẻ → **Thêm vào MH chính**.
- **Mac:** Safari → File → **Add to Dock**.
- **TV:** AirPlay từ iPad/Mac sang Apple TV hoặc TV có AirPlay 2 (bé vẫn chạm trên iPad, TV chỉ hiển thị).

## Đưa lên GitHub Pages (làm 1 lần)

1. Merge PR vào nhánh mặc định của repo.
2. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Vào tab **Actions → Deploy Space Atlas to GitHub Pages → Run workflow** (hoặc đợi lần push tiếp theo).
4. Sau ~2 phút link https://xuanthang2505.github.io/XuanThang2505/ hoạt động. Mỗi lần sửa `space-atlas/` sẽ tự cập nhật.

> Link Pages là công khai: ai có link đều mở được (không có dữ liệu cá nhân trong app).

## Chạy trên máy tính

```bash
cd space-atlas
npm install
npm run dev        # mở http://<IP-máy-tính>:5173 trên iPad (cùng Wi-Fi)
npm run build      # bản build tĩnh trong dist/ (đưa lên Netlify / Vercel / GitHub Pages)
```

Trên iPad: mở bằng Safari → nút Chia sẻ → **Thêm vào MH chính**. App sẽ chạy toàn màn hình như app thật.

> ⚠️ Tắt công tắc im lặng / bật âm lượng.
>
> **Giọng đọc tiếng Anh** là giọng Mỹ thu sẵn (Kokoro `af_heart`, giọng được chấm điểm cao nhất của bộ này,
> Apache-2.0) trong `public/audio/en/`, nên mọi thiết bị đều đọc giống nhau. Từ đơn được đọc như một câu ngắn ("Earth.")
> để ngữ điệu tự nhiên; tốc độ gần chuẩn (0,92–0,95) để phụ âm rõ; mọi clip cùng độ to. Chỉ khi thiếu file mới dùng giọng của máy (en-US).
> Muốn đọc thêm tiếng Việt thì bật trong cài đặt phụ huynh và tải giọng **Linh** trên iPad.

## Bé dùng thế nào

| Thao tác | Kết quả |
|---|---|
| Màn hình đầu: **SOLAR SYSTEM** | Mặt Trời ở giữa, 8 hành tinh quay quanh trên quỹ đạo, có vành đai tiểu hành tinh |
| Chạm hành tinh (hoặc nhãn tên) trong Hệ Mặt Trời | Bay vào xem cận cảnh hành tinh đó |
| Chạm hành tinh ở thanh dưới | Tên lửa "bay" tới hành tinh, đọc to tên tiếng Anh. Nút đầu tiên quay về Hệ Mặt Trời |
| Chạm vào hành tinh 3D hoặc tên lớn | Đọc lại tên, chữ nảy lên |
| Chạm 3 thẻ từ bên phải | Đọc từ + hiệu ứng 3D minh hoạ nghĩa |
| SIZE COMPARE | Trái Đất (hoặc Mặt Trăng) bay tới bên cạnh để so kích thước thật |
| Vuốt 1 ngón / chụm 2 ngón | Xoay / phóng to (đã khoá kéo lệch, không thể làm mất hành tinh) |
| **PUZZLE 🧩** (thanh dưới) | Trò *Put planets home*: kéo 8 hành tinh vào đúng "nhà" trên quỹ đạo |
| Giữ 🔒 2 giây | Cài đặt phụ huynh: tốc độ đọc, tự xoay, nhạc nền, đọc thêm tiếng Việt |

## Từ vựng và hiệu ứng

| Hành tinh | Từ 1 | Từ 2 | Từ 3 |
|---|---|---|---|
| SOLAR SYSTEM | ORBIT – quỹ đạo sáng lên | FAST – các hành tinh quay nhanh gấp 8 | PLANETS – đếm 8 hành tinh theo thứ tự, từng hành tinh sáng lên |
| SUN | LIGHT – tia sáng bắn ra | HOT – bề mặt nóng trắng, sôi nhanh | STAR – lấp lánh hình ngôi sao |
| MERCURY | SMALL – co nhỏ lại | FAST – quay tít, vệt tốc độ | ROCK – đá bay quanh |
| VENUS | HOT – phát sáng cam nóng | CLOUD – mây vàng cuộn nhanh | BRIGHT – lấp lánh như sao Hôm |
| EARTH | OCEAN – biển sáng gợn sóng | CLOUD – mây dày, xoay nhanh | NIGHT – trời tối, đèn thành phố bật sáng |
| MARS | RED – phát sáng đỏ | ROCKET – tên lửa bay vòng quanh | DUST – bão cát xoáy |
| JUPITER | BIG – phình to nảy nảy | STORM – Vết Đỏ Lớn có vòng sóng + quay nhanh | MOON – 4 mặt trăng Galileo hiện ra |
| SATURN | RING – vành nghiêng về phía bé, sáng rực | ICE – hạt băng lấp lánh | SPIN – quay tít |
| URANUS | SIDE – lăn tròn trên trục nằm nghiêng | RING – vành mảnh sáng lên | ICE – tuyết băng |
| NEPTUNE | BLUE – phát sáng xanh | WIND – vệt gió bay quanh | COLD – tuyết, sương giá |

**Mô phỏng Hệ Mặt Trời:** đúng thứ tự hành tinh, tất cả quay cùng chiều (ngược chiều kim đồng hồ nhìn từ trên xuống),
hành tinh càng xa quay càng chậm (dùng chu kỳ thật, phát ở tốc độ căn bậc hai để Sao Hải Vương vẫn thấy chuyển động),
mặt sáng của từng hành tinh luôn hướng về Mặt Trời. Kích thước và khoảng cách được thu gọn cho vừa màn hình iPad.

## Trò chơi: Put planets home (3+ tuổi)

- Mặt Trời bên trái, 8 quỹ đạo, mỗi quỹ đạo có "bóng" (nhà) của một hành tinh. Bé kéo hành tinh từ khay dưới vào đúng bóng.
- Nhấc hành tinh lên → app đọc tên ("Mars!") và bóng đúng sáng lên gợi ý.
- Thả gần đúng chỗ → tự hút vào, khen "Great job!". Thả nhầm bóng → "Try again!" và hành tinh tự bay về khay. Không có thua, không đếm giờ.
- Ngồi yên 8 giây → một hành tinh nhún nhảy và bóng của nó sáng lên để gợi ý.
- Xong cả 8 → "You did it! All the planets are home!", pháo giấy, các hành tinh đung đưa trên quỹ đạo; nút **AGAIN** (xáo lại) và **SEE IN 3D**.
- Cấp tiếp theo dự kiến: *Planet jigsaw* (2 → 4 → 6 mảnh, 4–5 tuổi), *Big jigsaw / Memory pairs* (5–6 tuổi).

## Cấu trúc

```
src/
  data/planetsData.ts      Nội dung bài học (sửa chữ, thêm từ ở đây)
  utils/speech.ts          Giọng đọc: file mp3 trước, Web Speech API sau
  utils/soundEffects.ts    Âm thanh hiệu ứng + nhạc nền tạo bằng Web Audio (không cần file)
  utils/proceduralPixels.ts Texture dự phòng vẽ bằng code (chạy trong Web Worker, không làm khựng hình)
  utils/textureWorker.ts   Worker vẽ texture nền
  utils/textures.ts        Vành đai Sao Thổ, sprite phát sáng, kho texture dự phòng
  components/SolarScene.tsx   Canvas, bầu trời, camera bay (GSAP), so sánh kích thước, Bloom
  components/PlanetMesh.tsx   Mặt Trời (shader), Trái Đất (ngày/đêm/đèn), các hành tinh khác
  components/SpaceEffects.tsx Hạt bụi/băng/gió/tuyết, tên lửa, mặt trăng, vòng bão
  components/Starfield.tsx    Sao lấp lánh + dải Ngân Hà + tinh vân
  components/SolarSystem.tsx  Hệ Mặt Trời: quỹ đạo, vành đai tiểu hành tinh, 8 hành tinh quay quanh
  components/IPadHUD.tsx      Giao diện: thẻ từ, dock hành tinh, khoá phụ huynh
  puzzle/PlanetsHome.tsx      Trò chơi kéo thả "Put planets home"
public/sw.js               Service worker: chạy offline sau lần dùng đầu tiên
scripts/phrases.ts         In ra mọi câu tiếng Anh app sẽ đọc
scripts/make_voice.py      Thu giọng Mỹ (Kokoro af_heart) thành mp3 + manifest.json
public/textures/           Ảnh thật: Trái Đất (three.js, MIT) + các hành tinh khác và Mặt Trăng (Solar System Scope, CC BY 4.0)
public/audio/en/           60 file giọng đọc mp3 + manifest.json
```

## Nâng cấp

1. **Đổi chữ / thêm từ**: sửa `src/data/planetsData.ts`, rồi thu lại giọng:
   `npx tsx scripts/phrases.ts > phrases.json && python scripts/make_voice.py phrases.json public/audio/en --model kokoro-v1.0.int8.onnx --voices voices-v1.0.bin`
2. **Giọng bố mẹ**: ghi đè file mp3 cùng tên trong `public/audio/en/`.
3. **Thêm thiên thể** (Mặt Trăng, Sao Diêm Vương…): thêm 1 mục trong `planetsData.ts` (+ `ORBITS` nếu muốn nó quay trong Hệ Mặt Trời).

## Kiểm thử

Bộ test tự động (Playwright, giả lập iPad Pro 11 ngang) chạy qua: Hệ Mặt Trời (ORBIT, FAST, đếm PLANETS đúng thứ tự,
chạm nhãn để bay vào hành tinh), đổi hành tinh liên tục, 27 thẻ từ vựng của 9 thiên thể, SIZE COMPARE, nút đọc câu,
khoá phụ huynh, lưu cài đặt, mọi câu tiếng Anh phát bằng giọng thu sẵn, không có lỗi JavaScript.
Test trò chơi (iPad 1024×768, 1180×820, 1366×1024): nhấc lên đọc tên, thả nhầm "Try again!" và bay về khay,
thả ra chỗ trống tự về khay, cả 8 hành tinh tự hút vào nhà, "You did it!", nút AGAIN / SEE IN 3D. Chạy offline: ngắt mạng, tải lại vẫn đủ ảnh và giọng.
