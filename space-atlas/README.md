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

## 🧑‍🚀 Me in space + ảnh thật (bản 6)

- **Me in space** (thẻ lớn đầu tiên trong PLAY): phi hành gia mang **mặt thật của bé**. Bố mẹ **giữ nút 2 giây** → chọn/chụp ảnh → kéo và phóng to cho khuôn mặt vào vòng tròn. Ảnh được thu nhỏ (~384 px, ~10–40 KB) và **chỉ lưu trong iPad (localStorage)**, không gửi đi đâu; có nút xóa ảnh.
- 3 bộ đồ kiểu thật: **đồ đi bộ ngoài không gian** (trắng, ba lô dưỡng sinh, bảng điều khiển ngực, khớp gối/khuỷu), **đồ phóng tàu** (cam), **đồ siêu anh hùng** (màu từ Hero suit, áo choàng). Cờ Việt Nam trên vai, huy hiệu nhiệm vụ, bảng tên, kính mũ vàng (kéo xuống nửa).
- Bé xuất hiện ở: màn hình chào ("Hi, Bin!"), phi công **ME** trong Rocket lab (mặt trong cửa sổ tên lửa), người đứng và **nhảy** trên bề mặt hành tinh, **bưu thiếp**, thẻ tốt nghiệp anh hùng.
- **🌙 Mặt Trăng** là điểm đáp mới (nút **MOON!** khi đang xem Trái Đất): trọng lực 1/6, trời đen, Trái Đất trên trời, dấu chân, miệng hố.
- **📷 REAL PHOTO** khi đứng trên một thế giới: ảnh thật, toàn cảnh lướt chậm, có chú thích song ngữ và nguồn.

### Nguồn ảnh thật (`public/photos/`, từ images.nasa.gov)
| Ảnh | Nguồn / ghi công |
|---|---|
| Sao Hỏa – toàn cảnh 360° (Perseverance, 2021) | NASA/JPL-Caltech/MSSS/ASU – PIA24264 |
| Sao Hỏa – hoàng hôn xanh (Curiosity, 2015) | NASA/JPL-Caltech/MSSS/Texas A&M Univ. – PIA19400 |
| Mặt Trăng – Buzz Aldrin, dấu chân (Apollo 11) | NASA – AS11-40-5903, AS11-40-5878 |
| Trái Đất – "Blue Marble" (Apollo 17) | NASA – AS17-148-22727 |
| Sao Kim – radar Magellan (màu tô thêm) | NASA/JPL – S91-50687 |
| Sao Thủy – MESSENGER | NASA/Johns Hopkins University APL/Carnegie Institution of Washington |
| Sao Mộc – mây (Juno, 2018) | NASA/JPL-Caltech/SwRI/MSSS, xử lý ảnh Kevin M. Gill (**CC BY**) – PIA21984 |
| Sao Thổ (Cassini) | NASA/JPL/Space Science Institute – PIA06193 |
| Sao Thiên Vương, Sao Hải Vương (Voyager 2) | NASA/JPL-Caltech – PIA18182; NASA/JPL – PIA01492 |

Ảnh NASA thuộc phạm vi công cộng (không dùng logo NASA, không ngụ ý NASA xác nhận); ảnh Juno ghi công theo giấy phép CC BY.

## 🌌 Khám phá Hệ Mặt Trời (bản 5)

Dưới thẻ tên trên màn hình chính có hàng nút **khám phá**:

**Ở toàn cảnh Hệ Mặt Trời**
- **⏩ TIME** – cỗ máy thời gian ×1 / ×5 / ×25, kèm bộ đếm "🌍 N years" (1 năm = Trái Đất đi đủ 1 vòng).
- **🎂 MY AGE** – tuổi của bé trên từng hành tinh (theo độ dài năm thật: 5 tuổi = 21 tuổi Sao Thủy, 0,03 tuổi Sao Hải Vương).
- **🛠️ MY PLANET** – tự tạo hành tinh (biển, núi lửa, băng, kẹo, rừng; to/nhỏ; vành đai; 0–3 mặt trăng; đặt tên) rồi "PUT IT IN SPACE" → hành tinh bay trên quỹ đạo thật giữa Sao Thiên Vương và Sao Hải Vương.
- **🔭 TONIGHT** – bầu trời tối nay ở Hà Nội / Đà Nẵng / TP.HCM (20:00 hoặc 05:00): hành tinh nào đang ở trên trời, nhìn hướng nào, cao hay thấp. Tính bằng thư viện thiên văn `astronomy-engine` chạy offline.
- **🌙 BEDTIME** – chuyến tham quan êm dịu qua Mặt Trời và 8 hành tinh với lời kể chậm, màn hình tối bớt; xong thì app tự ngủ.
- **🛂 PASSPORT** – hộ chiếu vũ trụ, mỗi hành tinh đã đáp xuống được đóng dấu.
- Trên toàn cảnh còn có **mặt trăng thật** (Mặt Trăng, Phobos & Deimos, 4 mặt trăng lớn của Sao Mộc, Titan) và **sao chổi** bay theo quỹ đạo elip (định luật Kepler: gần Mặt Trời bay nhanh), đuôi luôn hướng ra xa Mặt Trời và dài ra khi lại gần.

**Ở một hành tinh**
- **🚀 LAND!** – đáp xuống bề mặt: bầu trời đúng màu, Mặt Trời to/nhỏ theo khoảng cách, thời tiết (bụi, mưa, tuyết băng, mưa kim cương…), đồ vật để chạm (miệng hố, núi lửa, xe tự hành, hoàng hôn xanh…), nhiệt kế, độ dài 1 ngày và 1 năm, **🦘 thử nhảy theo trọng lực thật**. Hành tinh khí khổng lồ không có mặt đất → Cosmo đứng trên trạm bay. Có **📺 bản tin thời tiết vũ trụ** của Captain Star và **📮 bưu thiếp** (lưu ảnh hoặc chia sẻ).
- **🥽 MY ROOM** (chỉ hiện trên iPhone/iPad) – mở hành tinh bằng AR Quick Look để đặt nó giữa phòng.

Kỹ thuật: cảnh bề mặt vẽ bằng SVG/CSS và cảnh 3D tạm dừng khi đang ở bề mặt hay màn khám phá; phần 3D mới chỉ là vài khối cầu ít đa giác + 1 đám hạt; mọi màn mới tải theo nhu cầu (gói riêng).

## 🛡️ Captain Star & the Space Guardians (bản 4)

Siêu anh hùng vũ trụ **riêng của app** (mang tinh thần dũng cảm, bảo vệ mọi người, có khiên – nhưng thiết kế riêng, không dùng nhân vật có bản quyền như Captain America vì app đăng công khai). Anh hùng ở đây chỉ **bảo vệ và giúp đỡ**, không đánh nhau. Câu cửa miệng: *"Heroes help! Heroes are kind!"*

Vào từ banner lớn **Captain Star** ở đầu menu PLAY → **Hero HQ** (màn xuất hiện: bay vào, chữ "SUPER!", nhạc anh hùng):

- **🗺️ Missions** – cốt truyện 5 nhiệm vụ, mở lần lượt:
  1. ☄️ *Mưa thiên thạch* – chặn viên to / viên nhỏ bằng khiên ngôi sao (BIG, SMALL), "POW!", rung màn hình.
  2. 🐬 *Cứu Splash* – nhặt rác (BOTTLE, CAN, BAG) bỏ vào thùng tái chế, lưới mờ dần, Splash được tự do; chạm cá thì "Not the fish!".
  3. 🛰️ *Sửa vệ tinh cùng Cosmo* – tìm hình (CIRCLE, SQUARE, TRIANGLE, STAR).
  4. 💡 *Thắp đèn căn cứ Mặt Trăng* – bật đúng màu (BLUE, RED, GREEN, YELLOW, PURPLE).
  5. 🎖️ *Tốt nghiệp trường anh hùng* – thẻ anh hùng kiểu bìa truyện tranh với bộ đồ của bé, 4 huy hiệu, tên bé (bố mẹ chạm vào tên để nhập), "You are a hero!".
- **🛡️ Shield throw** – ném khiên boomerang trúng bong bóng số ("Hit number three!"), POW/BAM/ZOOM.
- **🦸 Hero suit** – chọn màu bộ đồ, áo choàng, mặt nạ, khiên (7 màu) và biểu tượng ngực (⭐ 🐬 🚀 ⚡ 💙), nút HERO POSE. Captain Star mặc bộ đồ này ở mọi nơi.
- **💙 What would a hero do?** – 6 tình huống (bạn ngã, bạn buồn, chia bánh, nhặt rác, cho em chơi cùng, xin lỗi); chọn hành động tốt → "That's what heroes do!".

Nhân vật vẽ bằng SVG + CSS (nhẹ, không cần ảnh). 67 câu giọng Mỹ mới.

## Khám phá mới (bản 3)

- **🤿 Deep sea dive** – vuốt lên để tàu ngầm của Cosmo lặn qua 4 tầng biển (Sunlight, Twilight, Midnight, đáy biển, tới 4000 m). 14 con vật: chạm để nghe tên tiếng Anh và đọc điều thú vị bằng tiếng Việt; con mới tìm thấy vào "sổ biển" (+1 ⭐). Đáy biển có rương kho báu (+3 ⭐). Đèn tàu ngầm sáng dần khi xuống sâu.
- **🔧 Robot shop** – trang trí Cosmo: 6 màu, 4 kiểu mắt (tròn, cười, ngôi sao, trái tim), 5 kiểu mũ (không, mũ lưỡi trai, vương miện, nơ, tai nghe), nút DANCE cho Cosmo nhảy. Cosmo mặc đồ này ở mọi nơi trong app.
- **🐬 Splash's ocean** có 3 cấp độ: 1 · bắt tự do, 2 · nghe và bắt đúng vật ("Catch the fish!"), 3 · bắt và đếm (3, 4, 5 vật: "One! Two! Three!…").
- **🕹️ Lái tên lửa** (trong Rocket lab): kéo ngón tay để lái tên lửa của bé, bắt 12 ngôi sao, né thiên thạch (đụng chỉ bị lắc), rồi đáp xuống hành tinh. Nhanh dần theo số sao bắt được.

## Điều hướng

- Mọi trò chơi có nút **← BACK** lớn ở góc trên bên trái: về màn hình trước (trò chơi → menu PLAY → không gian 3D, menu có nút **← SPACE**).
- Trong không gian 3D, sau khi bay sang hành tinh khác có nút **← BACK** (góc trên bên phải) để bay về hành tinh vừa xem.

## Nhẹ hơn, mở nhanh hơn

- Màn hình chào hiện ngay (mã 3D ~1 MB tải ngầm phía sau, trò chơi tải khi cần).
- Toàn cảnh Hệ Mặt Trời dùng ảnh 512 px (`public/textures/sm/`), cận cảnh trên điện thoại dùng 1024 px (`md/`), iPad/máy tính 2048 px. Trước đây toàn cảnh nạp 12 ảnh 2048 px cùng lúc (~130 MB bộ nhớ đồ họa) làm máy đơ khi mở.
- Bản đồ hành tinh vẽ bằng thuật toán chỉ được vẽ khi ảnh thật lỗi (trước đây vẽ cả 6 bản đồ lúc mở app).
- Giọng đọc: chỉ giải mã trước tên hành tinh khi máy rảnh; câu khác giải mã khi cần.
- **Ngủ**: 2 phút không chạm → app ngủ (dừng 3D, nhạc, mọi hiệu ứng), chạm để đánh thức.
- **🔋 Tiết kiệm pin** (cài đặt phụ huynh): độ phân giải 1×, bỏ hiệu ứng phát sáng, 24 hình/giây, tắt sao băng nền.
- Thẻ âm thanh im lặng chạy nền chỉ dùng trên iOS cũ (iOS 17+ không cần).

## Cosmo & Splash (nhân vật)

- **Cosmo**: robot xanh có ba lô tên lửa (lửa phụt, mắt chớp, vẫy tay). **Splash**: cá heo vũ trụ đội mũ bong bóng (bơi, quẫy đuôi). Vẽ bằng SVG, không cần ảnh.
- Nút PLAY trên thanh hành tinh giờ là mặt Cosmo.

## Phiêu lưu lớn (hàng trên của menu PLAY)

- **🚀 Rocket lab** – chọn màu (BLUE, GREEN…), kiểu cánh, phi công (ROBOT / DOLPHIN / ASTRONAUT), mỗi lựa chọn đọc từ tiếng Anh. Bấm LAUNCH: đếm "Three! Two! One! Blast off!", tên lửa rung, khói, lửa, bay lên trời và đáp xuống Mặt Trăng / Sao Hỏa / Sao Thổ / hành tinh đại dương. Tên lửa được lưu và đặt được vào Trạm vũ trụ.
- **🐬 Splash's ocean** – biển dưới bầu trời sao. Chạm đồ vật trên trời, Splash nhảy khỏi mặt nước bắt lấy (bong bóng, cá, vỏ sò, bạch tuộc, cua, cá voi…), mỗi lần bắt đọc một từ. Giọt nước bắn, cá bơi, bong bóng nổi. 8 lần bắt = 8 ⭐.
- Thêm 6 hình dán biển/robot: DOLPHIN, ROBOT, WHALE, FISH, WAVE, OCTOPUS.
- Hình dán mới đạt được trong các phiêu lưu lớn sẽ hiện khi bé quay về menu, không làm ngắt câu chuyện.

## Cốt truyện, Trạm vũ trụ, Sự kiện


- **🚀 Cosmo's mission** – cốt truyện 8 chương. Robot Cosmo làm rơi 8 viên pha lê trên 8 hành tinh. Mỗi chương: Cosmo giới thiệu hành tinh, bé nghe và chạm 2 từ vựng, trả lời 1 câu hỏi, nhận 1 viên pha lê (+2 ⭐). Đủ 8 viên thì tên lửa bay về nhà. Tiến độ lưu trên máy (`space-atlas-story`).
- **🛰️ My space station** – chơi tự do, không thắng thua: đặt Cosmo, pha lê, các hành tinh đã cứu và hình dán vào trạm, kéo để di chuyển, chạm để nghe tên. Lưu trên máy (`space-atlas-station`).
- **🌠 Shooting stars** – sự kiện bắt sao băng (tuần Geminids 10–17/12 đổi tên thành "Geminids night!").

Thỉnh thoảng một ngôi sao băng cũng bay ngang bầu trời 3D.

## Pin và âm thanh iOS

- Cảnh 3D vẽ đều **30 hình/giây** và **dừng hẳn** khi app bị ẩn hoặc đang mở trò chơi; số sao nền giảm một nửa.
- Chất lượng hình chọn **một lần** lúc mở app (độ phân giải tối đa 1.5×, MSAA 4× trên iPad, 2× trên điện thoại) và không đổi khi đang chạy: mỗi lần đổi làm khung hình nháy trắng và khựng. Chỉ máy quá yếu (dưới 18 hình/giây trong 10 giây) mới bị hạ đúng một bậc.
- Không có hiệu ứng nhấp nháy nhanh: sao lấp lánh chậm, hiệu ứng lấp lánh của từ vựng dịu lại; bỏ lớp mờ kính (backdrop-blur) trên khung 3D vì Safari vẽ nó nặng và dễ chớp.
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
