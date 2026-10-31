// ==========================================================================
// NARXLAR VA CHEGIRMALAR — faqat shu faylni tahrirlang (so'mda).
// js/b2b-pricing.js shu ma'lumotdan hisoblaydi.
// ==========================================================================
const UMISH_PRICING = {
  // Soha bo'yicha bazaviy narx (1 dona)
  base: { harbiy: 420000, iiv: 380000, sanoat: 250000, tibbiyot: 195000, horeca: 220000, korporativ: 180000 },
  defaultBase: 240000,

  // Komplekt turi: add — bazaga qo'shiladi, fixed — narx qat'iy (soha e'tiborga olinmaydi)
  items: { standard: { add: 0 }, full: { add: 90000 }, kombinezon: { add: 40000 }, polo: { fixed: 160000 } },

  // Qo'shimcha opsiyalar (checkbox id si bo'yicha)
  options: { calcOptEmbroidery: 20000, calcOptReflect: 15000, calcOptFireproof: 35000 },

  // Miqdor bo'yicha chegirma: kattasidan kichigiga tartiblangan
  tiers: [
    { min: 500, pct: 0.18, label: '-18% (Katta zavod partiyasi)' },
    { min: 200, pct: 0.14, label: '-14% (Katta korxona partiyasi)' },
    { min: 50, pct: 0.10, label: '-10% (Ulgurji narx)' }
  ],
  defaultTierLabel: "Chakana / O'rta partiya",

  sectorNames: {
    harbiy: 'Harbiy & Maxsus', iiv: 'IIV & Xavfsizlik', sanoat: 'Sanoat & Spetsodejda',
    tibbiyot: 'Tibbiyot & Klinika', horeca: 'HoReCa & Restoran', korporativ: 'Korporativ & Ofis'
  }
};
