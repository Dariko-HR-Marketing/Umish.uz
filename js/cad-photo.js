// ==========================================================================
// FOTO REJIM — haqiqiy model fotosi ustida jonli o'lchovlar
// Rasmlar: images/models/<forma>_front.jpg va <forma>_back.jpg (docs/MODEL-PHOTOS.md)
// ==========================================================================

// Model fotosidagi odamning haqiqiy o'lchamlari (sm). Rasm shu o'lchamdagi odamni ko'rsatadi.
const CAD_PHOTO_REF = { height: 176, chest: 104, waist: 92, hips: 102, shoulder: 48, sleeve: 65, jacketLen: 72, trouserLen: 105, neck: 41, head: 58, wrist: 18, knee: 40 };

// Har bir rasm uchun ixtiyoriy sozlamalar: top, floor, cx (rasm balandligi/kengligiga nisbatan 0..1)
// va lm (kalibrovka natijasi: nuqtalar [x, y] nisbatlarda). Kalibrovka: sahifa manzili oxiriga ?calibrate qo'shing.
const CAD_PHOTOS = {
  // Haqiqiy maneken fotosi (kalibrovka qilingan). Orqa tomon fotosi bo'lmasa, chizma rejimi ko'rsatiladi.
  iiv_patrol:     { front: { src: 'images/iiv_patrol_suit_png_1791916033242.jpg', top: 0.046, floor: 0.956, cx: 0.4997,
                             lm: { shoulderL: [0.3109, 0.2019], shoulderR: [0.6885, 0.2019], chestL: [0.3878, 0.3056], chestR: [0.6116, 0.3056],
                                   waistL: [0.4003, 0.428], waistR: [0.5997, 0.428], wristR: [0.6823, 0.507], hem: [0.5, 0.4565], trHem: [0.5, 0.926] } },
                    back: { src: 'images/models/iiv_patrol_back.jpg' } },
  harbiy_dala:    { front: { src: 'images/models/harbiy_dala_front.jpg' },    back: { src: 'images/models/harbiy_dala_back.jpg' } },
  sanoat_pro:     { front: { src: 'images/models/sanoat_pro_front.jpg' },     back: { src: 'images/models/sanoat_pro_back.jpg' } },
  ofis_kostyum:   { front: { src: 'images/models/ofis_kostyum_front.jpg' },   back: { src: 'images/models/ofis_kostyum_back.jpg' } },
  tibbiyot_xalat: { front: { src: 'images/models/tibbiyot_xalat_front.jpg' }, back: { src: 'images/models/tibbiyot_xalat_back.jpg' } }
};

// Standart kadrlash: bosh tepasi rasmning 5% da, poyabzal tagi 96% da, odam o'rtada
const CAD_PHOTO_DEFAULT = { top: 0.05, floor: 0.96, cx: 0.5 };

const CAD_CALIB_STEPS = [
  ['top', "Bosh tepasi (soch cho'qqisi)"],
  ['floor', "Poyabzal tagi (pol chizig'i)"],
  ['cx', "Tananing o'rta chizig'i (ko'krak markazi)"],
  ['shoulderL', "Rasmdagi CHAP yelka chekkasi"],
  ['shoulderR', "Rasmdagi O'NG yelka chekkasi"],
  ['chestL', "Ko'krak chizig'i, chap chet (qo'ltiq balandligida)"],
  ['chestR', "Ko'krak chizig'i, o'ng chet"],
  ['waistL', "Bel, chap chet"],
  ['waistR', "Bel, o'ng chet"],
  ['wristR', "O'ng yeng manjeti (bilak) markazi"],
  ['hem', "Kurtka etagi (pastki chet)"],
  ['trHem', "Shim etagi (pastki chet)"]
];

const cadPhotoCache = {};

function cadPhotoEntry(type, view) {
  const cfg = (CAD_PHOTOS[type] || {})[view];
  if (!cfg) return null;
  let c = cadPhotoCache[cfg.src];
  if (!c) {
    c = cadPhotoCache[cfg.src] = { state: 'loading' };
    const im = new Image();
    im.onload = () => { c.state = 'ok'; c.w = im.naturalWidth; c.h = im.naturalHeight; updateTailorCad(); };
    im.onerror = () => { c.state = 'missing'; updateTailorCad(); };
    im.src = cfg.src;
  }
  return c.state === 'ok' ? Object.assign({}, CAD_PHOTO_DEFAULT, cfg, { w: c.w, h: c.h }) : null;
}

function cadPhotoSyncUi(available, active) {
  const btn = document.getElementById('vbtnMode');
  if (btn) {
    btn.classList.toggle('is-active', active);
    btn.disabled = !available;
    btn.style.opacity = available ? '' : '.45';
    btn.title = available ? "Foto va chizma rejimini almashtirish" : "Bu forma uchun model fotosi hali yuklanmagan";
  }
  const note = document.getElementById('cadPhotoNote');
  if (note) note.style.display = active ? 'block' : 'none';
  const cal = document.getElementById('vbtnCalib');
  if (cal) cal.style.display = /[?&]calibrate/.test(location.search) ? '' : 'none';
}

function toggleCadMode() {
  cadState.mode = cadState.mode === 'photo' ? 'draw' : 'photo';
  updateTailorCad();
}

function renderCadPhoto(svg) {
  const s = cadState;
  const e = cadPhotoEntry(s.uniformType, s.view);
  const active = s.mode === 'photo' && !!e;
  cadPhotoSyncUi(!!e, active);
  if (!active) return false;

  const ref = CAD_PHOTO_REF, calib = !!s.calib;
  const w = e.w, h = e.h, cx = e.cx * w, topPx = e.top * h, floorPx = e.floor * h;
  const pcm = (floorPx - topPx) / ref.height;
  const Y = f => floorPx - f * (floorPx - topPx);
  const r = n => +n.toFixed(1);

  // Landmarklar (rasm pikselida): standart anatomiya, kalibrovka bo'lsa shu bilan almashadi
  const neckB = Y(0.838), shY = Y(0.818), pitY = Y(0.725), waistY = Y(0.618), hipY = Y(0.53);
  const shHalf = ref.shoulder / 2 * pcm;
  const lm = {
    shoulderL: [cx - shHalf, shY + 3], shoulderR: [cx + shHalf, shY + 3],
    chestL: [cx - ref.chest * 0.152 * pcm, pitY + 14], chestR: [cx + ref.chest * 0.152 * pcm, pitY + 14],
    waistL: [cx - ref.waist * 0.142 * pcm, waistY], waistR: [cx + ref.waist * 0.142 * pcm, waistY],
    wristR: [cx + shHalf + ref.sleeve * pcm * 0.13, shY + ref.sleeve * pcm],
    hem: [cx, neckB + ref.jacketLen * pcm],
    trHem: [cx, Math.min(waistY + ref.trouserLen * pcm, floorPx - 4)]
  };
  Object.keys(e.lm || {}).forEach(k => { lm[k] = [e.lm[k][0] * w, e.lm[k][1] * h]; });

  // Foto o'lchamga qarab moslashadi (pol chizig'i va o'rta chiziq atrofida)
  const sy = calib ? 1 : s.height / ref.height;
  const sx = calib ? 1 : Math.sqrt(sy) * (s.chest / ref.chest * 0.6 + s.waist / ref.waist * 0.4);
  const T = p => [cx + (p[0] - cx) * sx, floorPx + (p[1] - floorPx) * sy];

  const u = 1.6 * w / 500;               // chizma rejimidagi 10px shrift bilan teng birlik
  const vb = [-0.3 * w, -0.2 * h, 1.6 * w, 1.24 * h];
  svg.setAttribute('viewBox', vb.join(' '));

  let g = `
    <defs>
      <radialGradient id="phBg" cx="50%" cy="46%" r="75%"><stop offset="0" stop-color="#16405f"/><stop offset="1" stop-color="#061320"/></radialGradient>
      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38BDF8"/></marker>
    </defs>
    <rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="url(#phBg)"/>
    <image href="${cadPhotoSrc(s)}" x="0" y="0" width="${w}" height="${h}" transform="translate(${r(cx * (1 - sx))} ${r(floorPx * (1 - sy))}) scale(${r(sx * 1000) / 1000} ${r(sy * 1000) / 1000})"/>`;

  if (calib) {
    const done = s.calib.pts;
    Object.keys(done).forEach(k => {
      const p = done[k];
      g += `<circle cx="${r(p[0] * w)}" cy="${r(p[1] * h)}" r="${3 * u}" fill="#F43F5E" stroke="#fff" stroke-width="${u * 0.8}"/>
        <text x="${r(p[0] * w + 6 * u)}" y="${r(p[1] * h - 4 * u)}" font-size="${9 * u}" fill="#fff" font-family="monospace" stroke="#000" stroke-width="${u * 0.3}">${k}</text>`;
    });
    svg.innerHTML = g;
    return true;
  }

  if (s.guides) {
    const fs = 10 * u, bh = 15 * u, sw = 1.4 * u;
    const box = (x, y, text, col = '#38BDF8') => {
      const bw = (text.length * 6.2 + 12) * u;
      return `<rect x="${r(x - bw / 2)}" y="${r(y - bh / 2)}" width="${r(bw)}" height="${r(bh)}" rx="${3 * u}" fill="#061320" stroke="${col}" stroke-width="${0.8 * u}"/>
        <text x="${r(x)}" y="${r(y + fs * 0.35)}" text-anchor="middle" fill="${col}">${text}</text>`;
    };
    const arrow = (a, b, col = '#38BDF8') => `<line x1="${r(a[0])}" y1="${r(a[1])}" x2="${r(b[0])}" y2="${r(b[1])}" stroke="${col}" stroke-width="${sw}" marker-start="url(#arrow)" marker-end="url(#arrow)"/>`;
    const leader = (a, b) => `<line x1="${r(a[0])}" y1="${r(a[1])}" x2="${r(b[0])}" y2="${r(b[1])}" stroke="#38BDF8" stroke-width="${0.8 * u}" stroke-dasharray="${2 * u},${2 * u}"/>`;

    const shL = T(lm.shoulderL), shR = T(lm.shoulderR), chL = T(lm.chestL), chR = T(lm.chestR);
    const waL = T(lm.waistL), waR = T(lm.waistR), wr = T(lm.wristR), hem = T(lm.hem), trh = T(lm.trHem);
    const head = T([cx, topPx]), floorP = T([cx, floorPx]), neckP = T([cx, neckB]), hipP = T([cx, hipY]);
    const midX = cx;
    const hipHalf = ref.hips * 0.148 * pcm * sx;

    g += `<g font-family="monospace" font-size="${fs}" font-weight="bold" fill="#38BDF8">`;
    // Yelka
    const ys = Math.min(shL[1], shR[1]) - 12 * u;
    g += arrow([shL[0], ys], [shR[0], ys]) + leader([shL[0], ys - 4 * u], shL) + leader([shR[0], ys - 4 * u], shR)
      + box(shL[0] - 62 * u, ys, `↔ Yelka: ${s.shoulder}sm`);
    // Ko'krak, bel, son
    g += arrow(chL, chR) + box(midX, chL[1] - 14 * u, `↔ Ko'krak: ${s.chest}sm`);
    g += arrow(waL, waR) + box(midX, waL[1] + 14 * u, `↔ Bel: ${s.waist}sm`);
    g += arrow([midX - hipHalf, hipP[1]], [midX + hipHalf, hipP[1]]) + box(midX, hipP[1] + 14 * u, `↔ Son: ${s.hips}sm`);
    // Yeng
    g += arrow([shR[0] + 30 * u, shR[1]], [wr[0] + 30 * u, wr[1]]) + leader(shR, [shR[0] + 30 * u, shR[1]])
      + box((shR[0] + wr[0]) / 2 + 74 * u, (shR[1] + wr[1]) / 2, `↕ Yeng: ${s.sleeve}sm`);
    // Kurtka uzunligi (chap tomonda)
    const xj = shL[0] - 38 * u;
    g += arrow([xj, neckP[1]], [xj, hem[1]]) + box(xj - 56 * u, (neckP[1] + hem[1]) / 2, `↕ Kurtka: ${s.jacketLen}sm`);
    // Shim uzunligi (o'ng tomonda)
    const xt = midX + hipHalf + 26 * u;
    g += arrow([xt, waR[1]], [xt, trh[1]]) + box(xt + 56 * u, (hipP[1] + trh[1]) / 2, `↕ Shim: ${s.trouserLen}sm`);
    // Bilak va tizza
    const kneeP = T([cx, Y(0.286)]);
    g += box(wr[0] + 70 * u, wr[1] + 18 * u, `○ Bilak: ${s.wrist}sm`) + box(kneeP[0] - hipHalf - 60 * u, kneeP[1], `○ Tizza: ${s.knee}sm`);
    // Bo'yin va bosh
    g += leader([neckP[0] + 14 * u, neckP[1]], [neckP[0] + 60 * u, neckP[1] - 24 * u]) + box(neckP[0] + 112 * u, neckP[1] - 24 * u, `Bo'yin: ${s.neck}sm`);
    g += leader([head[0] + 26 * u, head[1] + 30 * u], [head[0] + 70 * u, head[1] + 12 * u]) + box(head[0] + 124 * u, head[1] + 12 * u, `Bosh: ${s.head}sm`);
    g += `</g>`;
    // Bo'y
    const xr = -0.2 * w;
    g += `<g font-family="monospace" font-size="${fs}" font-weight="bold" fill="#10B981">
      <line x1="${r(xr)}" y1="${r(head[1])}" x2="${r(xr)}" y2="${r(floorP[1])}" stroke="#10B981" stroke-width="${sw}" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
      <line x1="${r(xr - 6 * u)}" y1="${r(head[1])}" x2="${r(xr + 6 * u)}" y2="${r(head[1])}" stroke="#10B981" stroke-width="${sw}"/>
      <line x1="${r(xr - 6 * u)}" y1="${r(floorP[1])}" x2="${r(xr + 6 * u)}" y2="${r(floorP[1])}" stroke="#10B981" stroke-width="${sw}"/>
      ${box(xr + 52 * u, (head[1] + floorP[1]) / 2, `↕ Bo'y: ${s.height}sm`, '#10B981')}
    </g>`;
  }
  svg.innerHTML = g;
  return true;
}

function cadPhotoSrc(s) {
  return ((CAD_PHOTOS[s.uniformType] || {})[s.view] || {}).src || '';
}

// ==========================================================================
// KALIBROVKA: rasmdagi nuqtalarni bosib belgilash va tayyor JSON olish
// ==========================================================================
function cadCalibStart() {
  if (!cadPhotoEntry(cadState.uniformType, cadState.view)) return;
  cadState.mode = 'photo';
  cadState.calib = { i: 0, pts: {} };
  const svg = document.getElementById('cadSvg');
  svg.style.cursor = 'crosshair';
  svg.onclick = ev => {
    const c = cadState.calib;
    if (!c) return;
    const e = cadPhotoEntry(cadState.uniformType, cadState.view);
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    c.pts[CAD_CALIB_STEPS[c.i][0]] = [+(p.x / e.w).toFixed(4), +(p.y / e.h).toFixed(4)];
    c.i++;
    if (c.i >= CAD_CALIB_STEPS.length) cadCalibFinish(); else cadCalibHint();
    updateTailorCad();
  };
  cadCalibHint();
  updateTailorCad();
}

function cadCalibHint() {
  const box = document.getElementById('cadCalibBox');
  if (!box) return;
  const c = cadState.calib;
  box.style.display = 'block';
  box.innerHTML = `<b>Kalibrovka ${c.i + 1}/${CAD_CALIB_STEPS.length}:</b> rasmda bosing, ${CAD_CALIB_STEPS[c.i][1]}`;
}

function cadCalibFinish() {
  const c = cadState.calib, p = c.pts;
  const f = n => +n.toFixed(4);
  const lm = {};
  ['shoulderL', 'shoulderR', 'chestL', 'chestR', 'waistL', 'waistR', 'wristR', 'hem', 'trHem'].forEach(k => { lm[k] = p[k]; });
  const out = { top: f(p.top[1]), floor: f(p.floor[1]), cx: f(p.cx[0]), lm };
  const key = `${cadState.uniformType}.${cadState.view}`;
  const box = document.getElementById('cadCalibBox');
  box.innerHTML = `<b>Tayyor.</b> <code>${key}</code> uchun <code>js/cad-photo.js</code> dagi <code>CAD_PHOTOS</code> yozuviga qo'shing:<textarea readonly rows="6" style="width:100%;margin-top:.4rem;font-size:.72rem;">${JSON.stringify(out)}</textarea>`;
  const svg = document.getElementById('cadSvg');
  svg.style.cursor = ''; svg.onclick = null;
  cadState.calib = null;
  updateTailorCad();
}

cadState.mode = 'photo';
