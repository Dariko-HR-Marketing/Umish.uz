# UMISH.UZ — keyingi ishlar (yo'l xaritasi)

Hozirgi ustuvor yo'nalish: **UX/UI mantig'ini va sayt arxitekturasini professional shakllantirish.**

## Keyinroq (kelishilgan, hozir birinchi o'rinda emas)
- **Arizalarni qabul qilish.** Ariza modali (`handleFormSubmit`) hozir hech qayerga yubormaydi, faqat "qabul qilindi" ko'rsatadi. Kerak: server nuqtasi + yetkazish kanali (Telegram bot / pochta / CRM) + haqiqiy ariza raqami. Kanalni egasi tanlaydi.

## UX topilmalari (arxitektura sxemasidagi 7-bo'lim)
1. [bajarildi] Mobilda natija (razmer, mato) va "Buyurtma" tugmasi 3D ostida qotirilgan panelda. Sahifa uzunligi hali qisqartirilmagan.
2. [bajarildi] Mobilda 3D ko'rinish yuqorida qotadi, slayderlar ostida aylanadi.
3. [bajarildi] Soha kartasi: "Narxni hisoblash" kalkulyatorning 3-tabiga sohani tanlab olib boradi; "Ariza qoldirish" ikkinchi havola. Qo'shimcha: mobilda 3-tab ustunlari tuzatildi.
4. [bajarildi] Kalkulyator: "Qadam 1/3" paneli, "Keyingi qadam" / "Orqaga" tugmalari, tab uchun ARIA rollari.
5. [qisman] Mavjud bo'lmagan `/ru/` ga ko'rsatuvchi `hreflang="ru"` olib tashlandi. Haqiqiy `/ru/` sahifasi hali yo'q (rus tili modal oyna).
6. [bajarildi] Sensorli ekranlarda bosish maydonlari 40–44 px, barcha slayder va raqam maydonlariga `aria-label`.
7. Rasmlarni WebP/`srcset` ga o'tkazish, `width/height` berish.
8. Narxlarni koddan alohida sozlamaga chiqarish.

## Boshqa
- Boshqa formalar uchun haqiqiy maneken fotolari (`docs/MODEL-PHOTOS.md`).
- Serverda avtomatik yangilash (push dan keyin).

## Eslatma
- Footerdagi "Maxfiylik siyosati" havolasi hozir `alert()` ko'rsatadi (vaqtinchalik matn). Haqiqiy sahifa yoki bo'lim kerak.
