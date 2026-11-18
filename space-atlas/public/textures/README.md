# Textures

Earth textures (`earth_*`) come from the three.js examples (MIT licence).

Muốn hành tinh khác "như thật" hơn: tải bản 2K từ https://www.solarsystemscope.com/textures/
(CC BY 4.0) và đặt đúng tên dưới đây. App tự dùng file nếu có, nếu không sẽ dùng texture vẽ bằng code.

| Hành tinh | Tên file |
|-----------|----------|
| Mars      | `mars.jpg` |
| Jupiter   | `jupiter.jpg` |
| Saturn    | `saturn.jpg` |
| Neptune   | `neptune.jpg` |

Sau đó mở `src/data/planetsData.ts`, điền `textureUrl: './textures/mars.jpg'` cho hành tinh tương ứng.
