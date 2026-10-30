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

## Logotiplar (`assets/`)
- `umish-logo-transparent.svg` — to'q fon (sarlavha, footer); `umish-logo-light.svg` — och fon; `umish-logo-compact*.svg` — tagline'siz, kichik o'lchamlar uchun (≤540px sarlavha); `umish-icon*.svg`, `favicon.svg`, PNG ikonkalar va `og-image.png`.

## Qoidalar
1. **Dizayn:** asosiy ko'k `#1773D6`, to'q `#0B2238`, fon `#F8FAFC`. Logotip (`assets/umish-logo-transparent.svg`) nisbati va joyi buzilmasin.
2. **CAD:** o'lchovlar GOST 23134-78 asosida, slayderlar sm da, SVG koordinatalari proporsional.
3. **Kod:** mavjud funksiyalarni o'chirma; kichik, aniq o'zgarish kirit; butun faylni qayta yozma.
4. **Til:** barcha matn va xabarlar toza adabiy o'zbek tilida.
5. Har o'zgarishdan keyin sahifani brauzerda ochib, konsolda xato yo'qligini tekshir.
