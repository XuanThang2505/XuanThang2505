# 🪐 Kid's 3D Space English Atlas

Ứng dụng web 3D cho bé 3–6 tuổi học tiếng Anh về vũ trụ trên iPad: hành tinh 3D gần giống thật, hiệu ứng chuyển động, giọng đọc tiếng Anh và phụ đề tiếng Việt.

## Chạy thử

```bash
cd space-atlas
npm install
npm run dev        # mở http://<IP-máy-tính>:5173 trên iPad (cùng Wi-Fi)
npm run build      # bản build tĩnh trong dist/ (đưa lên Netlify / Vercel / GitHub Pages)
```

Trên iPad: mở bằng Safari → nút Chia sẻ → **Thêm vào MH chính**. App sẽ chạy toàn màn hình như app thật.

> ⚠️ Tắt công tắc im lặng / bật âm lượng. Giọng đọc dùng giọng có sẵn của iPad. Giọng hay nhất:
> Cài đặt › Trợ năng › Nội dung được đọc › Giọng nói › English › **Samantha (Enhanced)** hoặc **Ava (Premium)**.
> Muốn đọc thêm tiếng Việt thì tải giọng **Linh**.

## Bé dùng thế nào

| Thao tác | Kết quả |
|---|---|
| Chạm hành tinh ở thanh dưới | Tên lửa "bay" tới hành tinh, đọc to tên tiếng Anh |
| Chạm vào hành tinh 3D hoặc tên lớn | Đọc lại tên, chữ nảy lên |
| Chạm 3 thẻ từ bên phải | Đọc từ + hiệu ứng 3D minh hoạ nghĩa |
| SIZE COMPARE | Trái Đất (hoặc Mặt Trăng) bay tới bên cạnh để so kích thước thật |
| Vuốt 1 ngón / chụm 2 ngón | Xoay / phóng to (đã khoá kéo lệch, không thể làm mất hành tinh) |
| Giữ 🔒 2 giây | Cài đặt phụ huynh: tốc độ đọc, tự xoay, nhạc nền, đọc thêm tiếng Việt |

## Từ vựng và hiệu ứng

| Hành tinh | Từ 1 | Từ 2 | Từ 3 |
|---|---|---|---|
| SUN | LIGHT – tia sáng bắn ra | HOT – bề mặt nóng trắng, sôi nhanh | STAR – lấp lánh hình ngôi sao |
| EARTH | OCEAN – biển sáng gợn sóng | CLOUD – mây dày, xoay nhanh | NIGHT – trời tối, đèn thành phố bật sáng |
| MARS | RED – phát sáng đỏ | ROCKET – tên lửa bay vòng quanh | DUST – bão cát xoáy |
| JUPITER | BIG – phình to nảy nảy | STORM – Vết Đỏ Lớn có vòng sóng + quay nhanh | MOON – 4 mặt trăng Galileo hiện ra |
| SATURN | RING – vành nghiêng về phía bé, sáng rực | ICE – hạt băng lấp lánh | SPIN – quay tít |
| NEPTUNE | BLUE – phát sáng xanh | WIND – vệt gió bay quanh | COLD – tuyết, sương giá |

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
  components/IPadHUD.tsx      Giao diện: thẻ từ, dock hành tinh, khoá phụ huynh
public/textures/           Ảnh thật: Trái Đất (three.js, MIT) + Sao Hỏa/Mộc/Thổ/Hải Vương (Solar System Scope, CC BY 4.0)
public/audio/en/           (Tuỳ chọn) file mp3 thu âm sẵn: earth.mp3, ocean.mp3 ...
```

## Nâng cấp

1. **Giọng bố mẹ**: thu âm từng từ thành mp3, đặt vào `public/audio/en/`. App tự dùng.
2. **Thêm hành tinh** (Mercury, Venus, Uranus, Moon): thêm 1 mục trong `planetsData.ts`, texture trong `textures.ts`.

## Kiểm thử

Bộ test tự động (Playwright, giả lập iPad Pro 11 ngang) đã chạy qua: bay vào Trái Đất, chạm hành tinh,
đổi hành tinh liên tục, 18 thẻ từ vựng, SIZE COMPARE cho 6 hành tinh, nút đọc câu, khoá phụ huynh
(chạm ngắn không mở, giữ 2 giây mở), lưu cài đặt, không có lỗi JavaScript.
