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
- Odam tik turadi, qo'llar tanadan sal uzoqda (A-poza), oyoqlar yelka kengligida, kamera ko'krak balandligida, 85 mm obyektiv (buzilishsiz).
- Fon sodda och kulrang, yorug'lik yumshoq va tekis. Barcha 10 rasmda **bir xil odam, bir xil fon va yorug'lik**.
- Odamning haqiqiy o'lchami `js/cad-photo.js` dagi `CAD_PHOTO_REF` ga mos bo'lishi kerak (hozir 176 sm, ko'krak 104, bel 92, son 102, yelka 48, yeng 65, kurtka 72, shim 105). Model boshqa o'lchamda bo'lsa, shu qiymatlarni o'zgartiring.

## Yuzni saqlab, formani kiydirish

Brend yuzining 3 ta suratini (old, ikki yon profil) generatsiya vositasiga **referens** sifatida bering (Canva Magic Media / Adobe Firefly «Reference» / Photoshop Generative / boshqa image-to-image vositasi). Shu odamning roziligi bor.

Umumiy shablon (`<FORMA>` o'rniga quyidagidan birini qo'ying):

> Photorealistic full-body studio photograph of the same man as in the reference photos (identical face, hair, skin tone and build, 176 cm tall), standing straight facing the camera in a neutral A-pose, arms slightly away from the body, wearing `<FORMA>`. Head to feet fully visible with ~5% margin above the head and ~4% below the shoes, centered, plain light grey seamless studio background, soft even lighting, 85 mm lens at chest height, sharp focus, realistic fabric texture, 2:3 portrait.

Orqa tomon uchun: «…**seen from behind**, back of the head and hair visible, same pose and framing…».

`<FORMA>`:
- **iiv_patrol**: dark navy police patrol uniform: peaked cap, jacket with epaulets, two chest pockets with flaps, black leather belt with brass buckle, matching trousers, black leather boots.
- **harbiy_dala**: military field uniform in green pixel camouflage, field cap, jacket with chest pockets, belt, cargo trousers, black combat boots.
- **sanoat_pro**: orange-and-grey industrial workwear: yellow hard hat, zip-front jacket with reflective silver stripes on chest, sleeves and trouser legs, cargo trousers, brown safety boots.
- **ofis_kostyum**: classic charcoal wool business suit, white shirt, dark tie, matching trousers, black leather shoes, no hat.
- **tibbiyot_xalat**: white medical coat over teal scrubs, stethoscope around the neck, name badge, white clogs, no hat.

Yuz o'xshashligini har rasmda tekshiring (ko'z, qosh, jag' chizig'i, soch chizig'i). O'xshamasa, shu rasmni qayta generatsiya qiling.

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
