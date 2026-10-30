# UMISH.UZ — Claude Ishlash Qoidalari

## Loyiha tavsifi
- Maxsus va harbiy kiyimlar ishlab chiqaruvchi "UMISH" B2B veb-sayti.
- Texnologiyalar: toza HTML5, CSS3 (CSS Variables), Vanilla JavaScript (ES6+), SVG 2D CAD.
- Framework (React, Vue, Tailwind) va build vositalari ishlatilmaydi.

## Tuzilma
- `index.html` — faqat HTML tuzilmasi
- `css/style.css` — asosiy dizayn va responsive; `css/cad-tailor.css` — CAD kalkulyator, vedomost, print
- `js/app.js` — modal, menyu, karusel, chat, forma, til almashtirish
- `js/cad-engine.js` — `cadState`, GOST hisobi (`calculateGost`), slayderlar
- `js/cad-render.js` — realistik odam silueti (`renderCadSvg`), mato ro'yxati `CAD_FABRICS` va mato tanlash
- `js/cad-photo.js` — foto rejim: `images/models/` dagi model suratlari ustiga o'lchovlar, kalibrovka (`?calibrate`); qo'llanma `docs/MODEL-PHOTOS.md`
- `js/batch-vedomost.js` — xodimlar jadvali, CSV eksport, A4 print, buyurtma
- `js/b2b-pricing.js` — partiya narxi (`updateCalc`) va dastlabki ishga tushirish
- Skriptlar klassik (modulsiz) va `index.html` oxirida shu tartibda ulanadi; `onclick` ishlatadigan funksiyalar global bo'lib qolishi shart.

## Qoidalar
1. **Dizayn & Brend:**
   - Asosiy ko'k `#1773D6`, to'q navy `#0B2238`, fon `#F8FAFC`.
   - Logotip original va proporsional (aspect-ratio: 720 / 194):
     - `assets/umish-logo-transparent.svg` / `umish-logo-dark.png`: to'q fonlar (Header, Footer, Modallar) uchun White + Blue shaffof logotip.
     - `assets/umish-logo-light.png` / `umish-logo-light.svg`: oq/och fonlar va A4 chop etish uchun Navy + Blue logotip.
     - `assets/umish-monogram-white.png`: kvadrat monografiya ikonkasi (Favicon, Apple touch icon).
     - `assets/umish-banner-dark.png`: ijtimoiy tarmoqlar (og:image / twitter:image) banneri.
   - Logotip o'lchamlari va proporsiyalari hech qachon buzilmasin va cho'zilmasin (`object-fit: contain`).
2. **CAD:** o'lchovlar GOST 23134-78 asosida, slayderlar sm da, SVG koordinatalari proporsional.
3. **Kod:** mavjud funksiyalarni o'chirma; kichik, aniq o'zgarish kirit; butun faylni qayta yozma.
4. **Til:** barcha matn va xabarlar toza adabiy o'zbek tilida.
5. Har o'zgarishdan keyin sahifani brauzerda ochib, konsolda xato yo'qligini tekshir.
