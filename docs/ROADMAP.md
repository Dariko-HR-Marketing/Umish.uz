# UMISH.UZ — keyingi ishlar (yo'l xaritasi)

Hozirgi ustuvor yo'nalish: **UX/UI mantig'ini va sayt arxitekturasini professional shakllantirish.**

## Keyinroq (kelishilgan, hozir birinchi o'rinda emas)
- **Arizalarni qabul qilish.** Ariza modali (`handleFormSubmit`) hozir hech qayerga yubormaydi, faqat "qabul qilindi" ko'rsatadi. Kerak: server nuqtasi + yetkazish kanali (Telegram bot / pochta / CRM) + haqiqiy ariza raqami. Kanalni egasi tanlaydi.

## UX topilmalari (arxitektura sxemasidagi 7-bo'lim)
1. Mobilda sahifa juda uzun; natija va "Ariza" tugmasi qotirilgan panelga.
2. Mobilda 3D ko'rinish slayderlardan keyin; 3D ni yuqorida qotirish.
3. Soha kartasidan kalkulyatorga o'tishda sohani oldindan tanlash.
4. Kalkulyator tablari uchun qadam ko'rsatkichi (1 → 2 → 3).
5. Haqiqiy `/ru/` sahifasi yoki `hreflang="ru"` ni olib tashlash.
6. Bosish maydonlari ≥ 44 px, raqam maydonlariga `aria-label`.
7. Rasmlarni WebP/`srcset` ga o'tkazish, `width/height` berish.
8. Narxlarni koddan alohida sozlamaga chiqarish.

## Boshqa
- Boshqa formalar uchun haqiqiy maneken fotolari (`docs/MODEL-PHOTOS.md`).
- Serverda avtomatik yangilash (push dan keyin).
