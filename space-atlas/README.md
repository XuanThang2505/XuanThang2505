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
| **FUN FACTS 🔍** (dưới thẻ tên) | 4 câu fact của thiên thể đang xem; chạm từng câu để nghe, hoặc **READ ALL** |
| **PLAY 🎮** (thanh dưới) | Menu 5 trò chơi + sổ hình dán, có đếm sao ⭐ (lưu trên máy) |
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

## Tương thích thiết bị

App tự co giãn theo mọi màn hình, nằm ngang hay dọc, không cần cài đặt gì:

| Kiểu màn hình | Ví dụ | Bố cục |
|---|---|---|
| **Nằm ngang, rộng** | iPad, iPad Pro, Mac, máy tính, TV | Thẻ tên góc trái, thẻ từ vựng bên phải, thanh hành tinh ở dưới |
| **Nằm ngang, gọn** (cạnh ngắn < 520px) | iPhone 12 Pro Max / 17 / 17 Pro nằm ngang, Android nhỏ | Như trên nhưng thu gọn; FUN FACTS mở thành khung giữa màn hình |
| **Dọc** | iPhone dọc, iPad dọc | Thẻ tên ở trên, hàng thẻ từ vựng + thanh hành tinh (cuộn ngang) xếp ở dưới |

- **Cỡ chữ và nút tự tỉ lệ:** cả giao diện dùng đơn vị rem, cỡ gốc co theo màn hình (16px trên iPad 1024×768, 12–26px tuỳ máy).
- **Nút chạm không nhỏ hơn 44px** trên điện thoại (theo khuyến nghị của Apple).
- **Tránh tai thỏ / Dynamic Island / thanh Home** ở cả 4 cạnh (`env(safe-area-inset-*)`).
- **Camera 3D tự lùi** để hành tinh luôn lọt khung ở mọi tỉ lệ màn hình; xoay máy thì tự căn lại.
- **Hệ Mặt Trời trên màn hình dọc:** nhìn từ trên xuống, hành tinh to hơn và quỹ đạo gần lại một chút để không quá bé.
- **Các trò chơi** tự đổi bố cục: kéo thả dọc quỹ đạo xuống dưới, ghép hình xếp bảng trên – mảnh dưới, lật thẻ chọn số cột cho thẻ to nhất.
- Điện thoại bắt đầu ở chất lượng đồ hoạ thấp hơn một nấc; app tự hạ/nâng độ nét theo tốc độ khung hình.

Mã nguồn: `src/utils/useLayout.ts` (nhận diện kiểu màn hình), `src/index.css` (cỡ gốc), `IPadHUD.tsx`, `src/games/*`.

## Cốt truyện, Trạm vũ trụ, Sự kiện (mới)

Trong nút PLAY 🎮 có ba mục mới:

- **🚀 Cosmo's mission** – cốt truyện 8 chương. Robot Cosmo làm rơi 8 viên pha lê trên 8 hành tinh. Mỗi chương: Cosmo giới thiệu hành tinh, bé nghe và chạm 2 từ vựng, trả lời 1 câu hỏi, nhận 1 viên pha lê (+2 ⭐). Đủ 8 viên thì tên lửa bay về nhà. Tiến độ lưu trên máy (`space-atlas-story`).
- **🛰️ My space station** – chơi tự do, không thắng thua: đặt Cosmo, pha lê, các hành tinh đã cứu và hình dán vào trạm, kéo để di chuyển, chạm để nghe tên. Lưu trên máy (`space-atlas-station`).
- **🌠 Shooting stars** – sự kiện bắt sao băng (tuần Geminids 10–17/12 đổi tên thành "Geminids night!").

Thỉnh thoảng một ngôi sao băng cũng bay ngang bầu trời 3D.

## Pin và âm thanh iOS

- Cảnh 3D vẽ **30 hình/giây** khi bé chơi, **12 hình/giây** sau 45 giây không chạm, và **dừng hẳn** khi app bị ẩn hoặc đang mở trò chơi. Không dùng MSAA; Bloom chỉ bật ở mức chất lượng cao nhất; số sao nền giảm một nửa.
- Nhạc nền tắt khi app xuống nền.
- Âm thanh: `navigator.audioSession.type = 'playback'` + thẻ `<audio>` im lặng để tiếng vẫn phát khi gạt công tắc im lặng. Khi iOS đặt bộ âm thanh vào trạng thái `interrupted` (khóa màn hình, cuộc gọi), app tự đánh thức hoặc dựng lại. Phụ huynh có nút **🔊 Kiểm tra âm thanh** trong Cài đặt.

## Giọng Việt của nhà mình

Cài đặt phụ huynh › **🎙 Giọng Việt của nhà mình**: bố mẹ thu âm từng câu tiếng Việt (khoảng 170 câu, thu dần cũng được). Bản thu lưu trong IndexedDB trên máy; câu nào chưa thu sẽ dùng giọng hệ thống.

## Trò chơi (nút PLAY 🎮)

Quy tắc chung cho bé: không thua, không đếm giờ, mọi hướng dẫn bằng giọng nói, chọn sai chỉ nghe "Try again!",
sai 2 lần thì đáp án đúng tự sáng lên để bé không bị kẹt.

| Trò | Tuổi | Cách chơi | Sao |
|---|---|---|---|
| **Put planets home** 🧩 | 3+ | Kéo 8 hành tinh vào đúng "nhà" trên quỹ đạo | 3 khi xong |
| **Which planet?** 🎯 | 4+ | Nghe câu hỏi ("Which planet is red?"), chạm 1 trong 3 hành tinh. 13 câu, mỗi lượt 5 câu | 1 mỗi câu đúng ngay lần đầu |
| **Line up!** 🔢 | 4+ | Chạm 8 hành tinh theo thứ tự từ Mặt Trời ra xa | 2 khi xong |
| **Planet jigsaw** 🖼️ | 4+ | Ghép ảnh hành tinh: 2 → 4 → 6 mảnh (có hình mờ gợi ý trên bảng). Xong thì nghe tên + 1 câu fact | 1 / 2 / 3 theo cấp |
| **Memory pairs** 🃏 | 5+ | Lật thẻ tìm cặp hành tinh giống nhau (4 cặp → 6 cặp). Mỗi lần lật đều nghe tên | 2 / 3 theo cấp |

**Sổ hình dán (MY STICKERS 🌟):** cứ 3 ⭐ mở 1 hình dán vũ trụ (12 hình: rocket, astronaut, moon, star, comet,
satellite, telescope, alien, UFO, planet, galaxy, Earth). Khi mở được hình mới có màn chúc mừng "New sticker!".
Chạm vào hình dán để nghe tên tiếng Anh, nên phần thưởng cũng là thêm từ mới để học.

### Put planets home

- Mặt Trời bên trái, 8 quỹ đạo, mỗi quỹ đạo có "bóng" (nhà) của một hành tinh. Bé kéo hành tinh từ khay dưới vào đúng bóng.
- Nhấc hành tinh lên → app đọc tên ("Mars!") và bóng đúng sáng lên gợi ý.
- Thả gần đúng chỗ → tự hút vào, khen "Great job!". Thả nhầm bóng → "Try again!" và hành tinh tự bay về khay. Không có thua, không đếm giờ.
- Ngồi yên 8 giây → một hành tinh nhún nhảy và bóng của nó sáng lên để gợi ý.
- Xong cả 8 → "You did it! All the planets are home!", pháo giấy, các hành tinh đung đưa trên quỹ đạo; nút **AGAIN** (xáo lại) và **SEE IN 3D**.

## Cấu trúc

```
src/
  data/planetsData.ts      Nội dung: bài học, từ vựng, FUN FACTS, câu đố, câu nói trong trò chơi
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
  games/GamesHub.tsx          Menu PLAY + trò "Which planet?" và "Line up!", đếm sao, chúc mừng hình dán mới
  games/PlanetJigsaw.tsx      Trò ghép ảnh hành tinh 2 → 4 → 6 mảnh
  games/MemoryPairs.tsx       Trò lật thẻ tìm cặp
  games/StickerBook.tsx       Sổ hình dán + màn "New sticker!"
  games/ui.tsx                Khung màn hình, thanh trên, nút câu hỏi dùng chung
  games/PlanetsHome.tsx       Trò kéo thả "Put planets home"
  games/PlanetBall2D.tsx      Hành tinh 2D vẽ từ ảnh thật (dùng chung cho các trò)
public/sw.js               Service worker: chạy offline sau lần dùng đầu tiên
scripts/phrases.ts         In ra mọi câu tiếng Anh app sẽ đọc
scripts/make_voice.py      Thu giọng Mỹ (Kokoro af_heart) thành mp3 + manifest.json
public/textures/           Ảnh thật: Trái Đất (three.js, MIT) + các hành tinh khác và Mặt Trăng (Solar System Scope, CC BY 4.0)
public/audio/en/           130 file giọng đọc mp3 + manifest.json
```

## Nâng cấp

1. **Đổi chữ / thêm từ**: sửa `src/data/planetsData.ts`, rồi thu lại giọng:
   `npx tsx scripts/phrases.ts > phrases.json && python scripts/make_voice.py phrases.json public/audio/en --model kokoro-v1.0.int8.onnx --voices voices-v1.0.bin`
   (script giữ lại các clip đã có trong manifest, nên có thể chỉ đưa vào những câu mới)
2. **Giọng bố mẹ**: ghi đè file mp3 cùng tên trong `public/audio/en/`.
3. **Thêm thiên thể** (Mặt Trăng, Sao Diêm Vương…): thêm 1 mục trong `planetsData.ts` (+ `ORBITS` nếu muốn nó quay trong Hệ Mặt Trời).

## Kiểm thử

Bộ test tự động (Playwright; chạy ở nhiều cỡ màn hình: iPhone, iPad, Android nhỏ, laptop, màn 1080p — ngang và dọc) chạy qua: Hệ Mặt Trời (ORBIT, FAST, đếm PLANETS đúng thứ tự,
chạm nhãn để bay vào hành tinh), đổi hành tinh liên tục, 27 thẻ từ vựng của 9 thiên thể, SIZE COMPARE, nút đọc câu,
khoá phụ huynh, lưu cài đặt, mọi câu tiếng Anh phát bằng giọng thu sẵn, không có lỗi JavaScript.
Test trò chơi (iPad 1024×768, 1180×820, 1366×1024): nhấc lên đọc tên, thả nhầm "Try again!" và bay về khay,
thả ra chỗ trống tự về khay, cả 8 hành tinh tự hút vào nhà, "You did it!", nút AGAIN / SEE IN 3D. Chạy offline: ngắt mạng, tải lại vẫn đủ ảnh và giọng.
Test các trò mới: Which planet? (đúng/sai, cộng sao), Line up!, Planet jigsaw cấp 1–3 (thả sai ô "Try again!",
xong đọc tên + fact), Memory pairs cấp 1–2 (lật sai tự úp lại), hình dán mở khi đủ 3 ⭐ và chỉ chúc mừng sau khi
đọc xong câu fact, chạm hình dán đọc tên, sao được lưu sau khi tải lại trang.
