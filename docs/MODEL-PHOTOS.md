# Model fotosuratlari (foto rejim) — tayyorlash qo'llanmasi

Kalkulyatordagi **Foto** rejimi `images/models/` papkasidagi model suratlarini ishlatadi va ustiga jonli o'lchovlarni (bo'y, yelka, ko'krak, bel, son, yeng, kurtka, shim, bo'yin, bosh) qo'yadi. Rasm topilmasa, kalkulyator o'zi chizma rejimiga qaytadi.

## Kerakli fayllar (jami 10 ta)

| Forma turi | Old | Orqa |
|---|---|---|
| IIV patrul | `iiv_patrol_front.jpg` | `iiv_patrol_back.jpg` |
| Harbiy dala | `harbiy_dala_front.jpg` | `harbiy_dala_back.jpg` |
| Sanoat | `sanoat_pro_front.jpg` | `sanoat_pro_back.jpg` |
| Ofis kostyum | `ofis_kostyum_front.jpg` | `ofis_kostyum_back.jpg` |
| Tibbiyot xalat | `tibbiyot_xalat_front.jpg` | `tibbiyot_xalat_back.jpg` |

## Rasmga qo'yiladigan talablar

- Nisbat **2:3** (portret), kamida **1024×1536**, JPG, ~300 KB dan oshmasin (saytni sekinlashtirmaslik uchun siqing).
- Odam **bo'yi to'liq**: bosh tepasi rasm balandligining ~**5%** da, poyabzal tagi ~**96%** da, odam gorizontal **markazda**.
- Maneken tik turadi, qo'llar tanadan sal uzoqda, kamera ko'krak balandligida, 85 mm obyektiv (buzilishsiz).
- Fon sodda och kulrang, yorug'lik yumshoq va tekis. Barcha 10 rasmda **bir xil odam, bir xil fon va yorug'lik**.
- Odamning haqiqiy o'lchami `js/cad-photo.js` dagi `CAD_PHOTO_REF` ga mos bo'lishi kerak (hozir 176 sm, ko'krak 104, bel 92, son 102, yelka 48, yeng 65, kurtka 72, shim 105). Model boshqa o'lchamda bo'lsa, shu qiymatlarni o'zgartiring.

## Maneken fotosini yaratish (poyabzal ham manekenda)

Fotosurat: och kulrang yuzsiz maneken (studiya manekeni), forma kiygan, **poyabzal manekenning oyog'ida**. Hozir faqat IIV uchun haqiqiy maneken fotosi bor (`images/iiv_patrol_suit_png_1791916033242.jpg`); boshqa formalar uchun quyidagi shablon bilan yarating (Canva Magic Media, Adobe Firefly yoki boshqa vosita).

Umumiy shablon (`<FORMA>` o'rniga quyidagidan birini qo'ying):

> Photorealistic full-length studio photograph of a matte light-grey faceless fashion mannequin (176 cm, male, neutral standing pose, arms slightly away from the body) wearing `<FORMA>`. The shoes are worn on the mannequin's feet, standing on a small grey base. Entire mannequin from head to base visible with ~5% margin above the head and ~4% below the base, centered, plain light grey seamless studio wall and floor, soft even studio lighting, 85 mm lens at chest height, sharp focus, realistic fabric texture and stitching, not a cartoon, not an illustration, 2:3 portrait.

Orqa tomon uchun: «…**seen from behind**, same pose and framing…».

`<FORMA>`:
- **iiv_patrol**: dark navy police patrol uniform: peaked cap, jacket with epaulets, two chest pockets with flaps, black leather belt with brass buckle, matching trousers, black leather boots.
- **harbiy_dala**: military field uniform in green pixel camouflage, field cap, jacket with chest pockets, belt, cargo trousers, black combat boots.
- **sanoat_pro**: orange-and-grey industrial workwear: yellow hard hat, zip-front jacket with reflective silver stripes on chest, sleeves and trouser legs, cargo trousers, brown safety boots.
- **ofis_kostyum**: classic charcoal wool business suit, white shirt, dark tie, matching trousers, black leather shoes, no hat.
- **tibbiyot_xalat**: white medical coat over teal scrubs, stethoscope around the neck, name badge, white clogs, no hat.

Barcha rasmlarda bir xil maneken, fon va yorug'lik bo'lsin.

## Nuqtalarni moslash (kalibrovka)

Standart kadrlashda o'lchov chiziqlari taxminan to'g'ri tushadi. Aniqlash uchun:

1. Rasmni `images/models/` ga qo'ying va sahifani `index.html?calibrate` manzili bilan oching.
2. Kalkulyatorda forma turi va ko'rinishni (old/orqa) tanlang, **Kalibrovka** tugmasini bosing.
3. Ko'rsatmalar bo'yicha rasmda 12 ta nuqtani ketma-ket bosing.
4. Chiqqan JSON ni `js/cad-photo.js` dagi `CAD_PHOTOS` ning shu forma/ko'rinish yozuviga qo'shing, masalan:
   `iiv_patrol: { front: { src: '…', top: 0.05, floor: 0.96, cx: 0.5, lm: { … } }, … }`

## Cheklovlar

- Foto o'lchamga qarab cho'ziladi (bo'y bo'yicha vertikal, ko'krak/bel bo'yicha gorizontal). Bu taxminiy ko'rinish, haqiqiy 3D andoza emas.
- Mato rangi fotoga bog'liq. Boshqa rangni ko'rsatish uchun shu rangdagi alohida rasm kerak yoki chizma rejimidan foydalaning.
