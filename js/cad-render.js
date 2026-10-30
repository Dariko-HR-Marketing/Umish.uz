// ==========================================================================
// REALISTIK ODAM SILUETI — tanlangan mato rangi va to'qimasi bilan chiziladi
// ==========================================================================

const CAD_FABRICS = [
  { id: 'ripstop_navy',  name: "Rip-Stop 65/35",      tone: "To'q ko'k", color: '#1F3354', weave: 'ripstop' },
  { id: 'ripstop_black', name: "Rip-Stop 65/35",      tone: "Qora",      color: '#1B1D22', weave: 'ripstop' },
  { id: 'ripstop_olive', name: "Rip-Stop 65/35",      tone: "Zaytun",    color: '#4B5439', weave: 'ripstop' },
  { id: 'ripstop_khaki', name: "Rip-Stop 65/35",      tone: "Xaki",      color: '#8C7D5A', weave: 'ripstop' },
  { id: 'camo_forest',   name: "Pixel kamuflyaj",     tone: "O'rmon",    color: '#4B5A3A', weave: 'camo', palette: ['#4B5A3A', '#2F3B27', '#7A7F52', '#1E241A'] },
  { id: 'camo_desert',   name: "Pixel kamuflyaj",     tone: "Cho'l",     color: '#B79F73', weave: 'camo', palette: ['#B79F73', '#8C7650', '#D3C197', '#5E4E35'] },
  { id: 'cotton_blue',   name: "Paxta sarja 260g",    tone: "Ko'k",      color: '#2A5CA8', weave: 'twill' },
  { id: 'cotton_orange', name: "Paxta sarja 260g",    tone: "Signal to'q sariq", color: '#E0622B', weave: 'twill' },
  { id: 'cotton_grey',   name: "Paxta sarja 260g",    tone: "Kulrang",   color: '#6B7280', weave: 'twill' },
  { id: 'wool_black',    name: "Yarim jun (kostyum)", tone: "Qora",      color: '#17191D', weave: 'wool' },
  { id: 'wool_grey',     name: "Yarim jun (kostyum)", tone: "Kulrang",   color: '#5C626C', weave: 'wool' },
  { id: 'wool_navy',     name: "Yarim jun (kostyum)", tone: "To'q ko'k", color: '#1B2A48', weave: 'wool' },
  { id: 'med_white',     name: "Tisi / medpaxta",     tone: "Oq",        color: '#F1F4F7', weave: 'plain' },
  { id: 'med_green',     name: "Tisi / medpaxta",     tone: "Zangori-yashil", color: '#2E8B83', weave: 'plain' },
  { id: 'med_blue',      name: "Tisi / medpaxta",     tone: "Moviy",     color: '#4C8DC6', weave: 'plain' }
];

const CAD_DEFAULT_FABRIC = {
  iiv_patrol: 'ripstop_navy',
  harbiy_dala: 'camo_forest',
  sanoat_pro: 'cotton_blue',
  ofis_kostyum: 'wool_black',
  tibbiyot_xalat: 'med_white'
};

// Pogon: bars — ko'ndalang chiziqlar, gap — bo'ylama oraliq chiziqlar, stars — yulduzchalar
const CAD_RANKS = {
  'Oddiy askar / Safdor': { bars: 0, gap: 0, stars: 0 },
  'Kichik serjant': { bars: 1, gap: 0, stars: 0 },
  'Serjant': { bars: 2, gap: 0, stars: 0 },
  'Katta serjant': { bars: 3, gap: 0, stars: 0 },
  'Leytenant': { bars: 0, gap: 1, stars: 2 },
  'Katta leytenant': { bars: 0, gap: 1, stars: 3 },
  'Kapitan': { bars: 0, gap: 1, stars: 4 },
  'Mayor': { bars: 0, gap: 2, stars: 1 },
  'Podpolkovnik': { bars: 0, gap: 2, stars: 2 },
  'Polkovnik': { bars: 0, gap: 2, stars: 3 },
  'Bosh mutaxassis': { bars: 0, gap: 1, stars: 0 }
};

function cadFabric(id) {
  return CAD_FABRICS.find(f => f.id === id) || CAD_FABRICS[0];
}

function cadMix(hex, to, t) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const a = p(hex), b = p(to);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
function cadShade(hex, amt) {
  return amt < 0 ? cadMix(hex, '#000000', -amt) : cadMix(hex, '#ffffff', amt);
}
function cadLum(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Catmull-Rom nuqtalar orqali silliq egri chiziq (joriy nuqta = pts[0] deb hisoblanadi)
function cadCurve(pts) {
  const r = n => +n.toFixed(1);
  let d = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C ${r(p1[0] + (p2[0] - p0[0]) / 6)} ${r(p1[1] + (p2[1] - p0[1]) / 6)} ${r(p2[0] - (p3[0] - p1[0]) / 6)} ${r(p2[1] - (p3[1] - p1[1]) / 6)} ${r(p2[0])} ${r(p2[1])}`;
  }
  return d;
}

function cadTextureDefs(fab) {
  const c = fab.color, dk = cadShade(c, -0.35), lt = cadShade(c, 0.3);
  if (fab.weave === 'ripstop') {
    return `<pattern id="fabTex" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${c}"/>
      <path d="M0 .5H8M.5 0V8" stroke="${lt}" stroke-opacity=".16" stroke-width=".7"/>
      <path d="M0 4.5H8M4.5 0V8" stroke="${dk}" stroke-opacity=".14" stroke-width=".5"/></pattern>`;
  }
  if (fab.weave === 'twill') {
    return `<pattern id="fabTex" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="${c}"/>
      <path d="M-1 6L6 -1M-1 3.5L3.5 -1M1.5 6.5L6.5 1.5" stroke="${dk}" stroke-opacity=".34" stroke-width="1"/>
      <path d="M-1 5L5 -1" stroke="${lt}" stroke-opacity=".22" stroke-width=".6"/></pattern>`;
  }
  if (fab.weave === 'wool') {
    return `<pattern id="fabTex" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="${c}"/>
      <path d="M0 0L4 4M4 0L0 4" stroke="${dk}" stroke-opacity=".24" stroke-width=".6"/>
      <circle cx="2" cy="2" r=".5" fill="${lt}" fill-opacity=".28"/></pattern>`;
  }
  if (fab.weave === 'camo') {
    let seed = 7;
    const rnd = n => { seed = (seed * 9301 + 49297) % 233280; return Math.floor(seed / 233280 * n); };
    let blocks = '';
    for (let i = 0; i < 46; i++) {
      const w = (1 + rnd(3)) * 6, h = (1 + rnd(2)) * 6;
      blocks += `<rect x="${rnd(10) * 6}" y="${rnd(10) * 6}" width="${w}" height="${h}" fill="${fab.palette[1 + rnd(3)]}"/>`;
    }
    return `<pattern id="fabTex" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="${fab.palette[0]}"/>${blocks}</pattern>`;
  }
  return `<pattern id="fabTex" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="${c}"/>
    <path d="M0 .5H3" stroke="${dk}" stroke-opacity=".10" stroke-width=".6"/></pattern>`;
}

function renderCadSvg() {
  const svg = document.getElementById('cadSvg');
  if (!svg) return;
  if (typeof renderCadPhoto === 'function' && renderCadPhoto(svg)) return;
  svg.setAttribute('viewBox', '0 0 500 700');

  const s = cadState;
  const back = s.view === 'back';
  const type = s.uniformType;
  const fabric = cadFabric(s.fabric);
  const base = fabric.color;
  const outline = cadShade(base, -0.55);
  const stitch = cadLum(base) > 0.55 ? cadShade(base, -0.28) : cadShade(base, 0.38);
  const gold = '#D4AF37';
  const hairCol = '#2A211C';
  const military = (type === 'iiv_patrol' || type === 'harbiy_dala');
  const r = n => +n.toFixed(1);
  const M = p => `M ${r(p[0])} ${r(p[1])}`;
  const L = p => ` L ${r(p[0])} ${r(p[1])}`;
  const mir = p => [2 * cx - p[0], p[1]];

  // --- Geometriya (px/sm masshtabi) ---
  const k = 3.15, cx = 250, floor = 668, H = s.height;
  const Y = fr => floor - fr * H * k;
  const headTop = Y(1), chin = Y(0.872), neckB = Y(0.838), shY = Y(0.818);
  const pitY = Y(0.725), waistY = Y(0.618), hipY = Y(0.53), crotchY = Y(0.478);

  const shH = s.shoulder / 2 * k;
  const chH = s.chest * 0.152 * k;
  const waH = s.waist * 0.142 * k;
  const hiH = s.hips * 0.148 * k;
  const twH = s.trouserWaist * 0.142 * k;
  const neckH = s.neck / 41 * 15;
  const hw = s.head / 58 * 24;
  const hH = chin - headTop;

  const trHem = Math.min(waistY + s.trouserLen * k, floor - 8);
  const jackHem = Math.min(neckB + s.jacketLen * k, trHem - 24);

  // Tanadagi (jaket) yarim kenglik
  const halfAt = y => y <= pitY ? chH
    : y <= waistY ? chH + (waH - chH) * (y - pitY) / (waistY - pitY)
    : waH + (hiH + 4 - waH) * Math.min(1, (y - waistY) / (jackHem - waistY));

  // --- Shim oyoqlari (stansiyalar bo'yicha interpolyatsiya) ---
  const hiTr = hiH * 1.05;
  const span = trHem - crotchY;
  const hw0 = (hiTr - 1.5) / 2, c0 = (hiTr + 1.5) / 2;
  const thS = s.thigh / 56;
  const hemHW = 19.5 * s.trouserBottom / 42;
  const st = [
    { y: crotchY, c: c0, hw: hw0 },
    { y: crotchY + span * 0.32, c: c0 * 0.97, hw: hw0 * thS * 0.98 },
    { y: crotchY + span * 0.55, c: c0 * 0.92, hw: 20.3 * s.knee / 40 },
    { y: crotchY + span * 0.78, c: c0 * 0.90, hw: hemHW + 1.5 },
    { y: trHem, c: c0 * 0.89, hw: hemHW }
  ];
  const legAt = y => {
    y = Math.max(st[0].y, Math.min(trHem, y));
    for (let i = 0; i < st.length - 1; i++) {
      if (y <= st[i + 1].y) {
        const t = (y - st[i].y) / ((st[i + 1].y - st[i].y) || 1);
        return { c: st[i].c + (st[i + 1].c - st[i].c) * t, hw: st[i].hw + (st[i + 1].hw - st[i].hw) * t };
      }
    }
    return st[st.length - 1];
  };

  // --- Qo'l (yeng) geometriyasi ---
  const th = 0.13;
  const armL = s.sleeve * k - 14;
  const arm = sg => {
    const J = [cx + sg * (shH - 21), shY + 14];
    const d = [sg * Math.sin(th), Math.cos(th)];
    const n = [sg * Math.cos(th), -Math.sin(th)];
    const hws = t => (t < 0.5 ? 20 + (17.5 - 20) * t / 0.5 : 17.5 + (14.5 * s.wrist / 18 - 17.5) * (t - 0.5) / 0.5) + (s.chest - 104) * 0.05;
    const pt = (t, side) => [J[0] + d[0] * t * armL + n[0] * hws(t) * side, J[1] + d[1] * t * armL + n[1] * hws(t) * side];
    return { J, d, n, hws, o: t => pt(t, 1), i: t => pt(t, -1), c: t => pt(t, 0) };
  };
  const arms = { '-1': arm(-1), '1': arm(1) };

  // ------------------------------------------------------------------
  // Chizish yordamchilari
  // ------------------------------------------------------------------
  const fab = (d, o = {}) => {
    let out = `<path d="${d}" fill="${base}"/><path d="${d}" fill="url(#fabTex)"/>`;
    if (o.tone) out += `<path d="${d}" fill="${o.tone < 0 ? '#000' : '#fff'}" fill-opacity="${Math.abs(o.tone)}"/>`;
    if (!o.flat) out += `<path d="${d}" fill="url(#shadeH)"/><path d="${d}" fill="url(#vol)"/>`;
    out += `<path d="${d}" fill="none" stroke="${outline}" stroke-width="${o.sw || 1.3}" stroke-linejoin="round"/>`;
    return out;
  };
  const seam = (d, o = {}) => `<path d="${d}" fill="none" stroke="${stitch}" stroke-width="${o.w || 0.9}" stroke-dasharray="${o.dash || '3 2.2'}" stroke-opacity=".85" stroke-linecap="round"/>`;
  const crease = (d, a = 0.22) => `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${a}" stroke-width="1.7" stroke-linecap="round"/>`;
  const shine = (d, a = 0.14) => `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${a}" stroke-width="1.6" stroke-linecap="round"/>`;
  const star = (x, y, rr, fill) => {
    let pts = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? rr * 0.42 : rr;
      pts += `${r(x + q * Math.cos(a))},${r(y + q * Math.sin(a))} `;
    }
    return `<polygon points="${pts}" fill="${fill}"/>`;
  };
  const button = (x, y, col = gold) => `<circle cx="${r(x)}" cy="${r(y)}" r="2.8" fill="${col}" stroke="#000" stroke-opacity=".45" stroke-width=".7"/><circle cx="${r(x - 0.8)}" cy="${r(y - 0.8)}" r="0.9" fill="#fff" fill-opacity=".5"/>`;
  const metal = military ? gold : '#C7CCD3';

  // ------------------------------------------------------------------
  // Fon, gradientlar
  // ------------------------------------------------------------------
  let g = `
    <defs>
      <radialGradient id="bgGlow" cx="50%" cy="46%" r="70%"><stop offset="0" stop-color="#F4F7FA"/><stop offset="1" stop-color="#C5D0DC"/></radialGradient>
      <pattern id="cadGridPat" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(11,34,56,.05)" stroke-width="1"/></pattern>
      <radialGradient id="floorSh" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity=".38"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      <linearGradient id="shadeH" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".42"/><stop offset=".22" stop-color="#000" stop-opacity=".07"/><stop offset=".5" stop-color="#fff" stop-opacity=".11"/><stop offset=".78" stop-color="#000" stop-opacity=".07"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></linearGradient>
      <linearGradient id="mqH" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#7F858E"/><stop offset=".3" stop-color="#C3C8CF"/><stop offset=".5" stop-color="#E4E7EB"/><stop offset=".72" stop-color="#BDC2C9"/><stop offset="1" stop-color="#7A808A"/></linearGradient>
      <radialGradient id="mqHead" cx="42%" cy="34%" r="70%"><stop offset="0" stop-color="#F1F3F5"/><stop offset=".55" stop-color="#C9CED5"/><stop offset="1" stop-color="#868C96"/></radialGradient>
      <linearGradient id="skinH" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#B58260"/><stop offset=".28" stop-color="#DDB08C"/><stop offset=".5" stop-color="#EBC4A3"/><stop offset=".72" stop-color="#DDB08C"/><stop offset="1" stop-color="#B58260"/></linearGradient>
      <radialGradient id="faceGlow" cx="50%" cy="42%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#7a4a2c" stop-opacity=".22"/></radialGradient>
      <linearGradient id="leather" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#050506"/><stop offset=".4" stop-color="#2b2d33"/><stop offset=".6" stop-color="#16171a"/><stop offset="1" stop-color="#050506"/></linearGradient>
      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#1773D6"/></marker>
      <radialGradient id="vol" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>
      ${cadTextureDefs(fabric)}
    </defs>
    <rect width="100%" height="100%" fill="url(#bgGlow)"/>
    <rect width="100%" height="100%" fill="url(#cadGridPat)"/>
    <line x1="${cx}" y1="14" x2="${cx}" y2="${floor}" stroke="rgba(11,34,56,.10)" stroke-dasharray="6,4" stroke-width="1"/>
    <ellipse cx="${cx}" cy="${floor + 1}" rx="${r(hiTr * 2.6)}" ry="11" fill="url(#floorSh)"/>
    <line x1="30" y1="${floor + 1}" x2="470" y2="${floor + 1}" stroke="rgba(11,34,56,.20)" stroke-width="1"/>
  `;

  // ------------------------------------------------------------------
  // Poyabzal
  // ------------------------------------------------------------------
  const shoeFill = type === 'tibbiyot_xalat' ? '#F4F6F8' : type === 'ofis_kostyum' ? '#15100D' : type === 'sanoat_pro' ? '#4A3426' : 'url(#leather)';
  const shoeLine = type === 'tibbiyot_xalat' ? '#9AA4AF' : '#000';
  [-1, 1].forEach(sg => {
    const xc = cx + sg * st[4].c, o = sg * 5, topY = trHem - 6, h = hemHW;
    const d = `M ${r(xc - h * 0.92)} ${r(topY)} L ${r(xc + h * 0.92)} ${r(topY)} L ${r(xc + o + h + 3)} ${floor - 17} Q ${r(xc + o + h + 11)} ${floor - 12} ${r(xc + o + h + 9)} ${floor - 2} L ${r(xc + o - h - 9)} ${floor - 2} Q ${r(xc + o - h - 11)} ${floor - 12} ${r(xc + o - h - 3)} ${floor - 17} Z`;
    g += `<path d="${d}" fill="${shoeFill}" stroke="${shoeLine}" stroke-opacity=".7" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M ${r(xc + o - h - 9)} ${floor - 4} L ${r(xc + o + h + 9)} ${floor - 4}" stroke="#000" stroke-opacity=".6" stroke-width="3"/>
      <path d="M ${r(xc + o - h * 0.4)} ${floor - 30} Q ${r(xc + o)} ${floor - 24} ${r(xc + o + h * 0.4)} ${floor - 30}" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="2" stroke-linecap="round"/>`;
  });

  // ------------------------------------------------------------------
  // Shim
  // ------------------------------------------------------------------
  const outerL = [[cx - twH, waistY], [cx - (twH + hiTr) / 2 - 1, (waistY + hipY) / 2], [cx - hiTr, hipY], ...st.map(q => [cx - (q.c + q.hw), q.y])];
  const innerLrev = st.slice().reverse().map(q => [cx - (q.c - q.hw), q.y]);
  const innerR = st.map(q => [cx + (q.c - q.hw), q.y]);
  const outerR = outerL.map(mir);
  const trouserD = M(outerL[0]) + cadCurve(outerL) + L(innerLrev[0]) + cadCurve(innerLrev)
    + ` Q ${cx} ${r(crotchY + 9)} ${r(innerR[0][0])} ${r(innerR[0][1])}` + cadCurve(innerR)
    + L(outerR[outerR.length - 1]) + cadCurve(outerR.slice().reverse()) + ' Z';
  const trTone = type === 'tibbiyot_xalat' ? -0.04 : 0;
  g += `<g id="cadTrousers">${fab(trouserD, { tone: trTone })}`;

  // Oyoq o'rta chiziqlari (kamar, tizza va etak)
  [-1, 1].forEach(sg => {
    const yA = Math.max(jackHem - 6, crotchY + 4);
    const a = legAt(yA), b = legAt(trHem);
    g += crease(`M ${r(cx + sg * a.c)} ${r(yA)} Q ${r(cx + sg * st[2].c)} ${r(st[2].y)} ${r(cx + sg * b.c)} ${r(trHem - 4)}`, type === 'ofis_kostyum' ? 0.30 : 0.12);
    if (type === 'ofis_kostyum') {
      g += shine(`M ${r(cx + sg * a.c + 1.5)} ${r(yA)} Q ${r(cx + sg * st[2].c + 1.5)} ${r(st[2].y)} ${r(cx + sg * b.c + 1.5)} ${r(trHem - 4)}`, 0.10);
    }
    // Tizza burmalari
    const kk = legAt(st[2].y);
    g += crease(`M ${r(cx + sg * kk.c - kk.hw * 0.7)} ${r(st[2].y - 6)} Q ${r(cx + sg * kk.c)} ${r(st[2].y - 2)} ${r(cx + sg * kk.c + kk.hw * 0.7)} ${r(st[2].y - 6)}`, 0.16);
    g += crease(`M ${r(cx + sg * kk.c - kk.hw * 0.6)} ${r(st[2].y + 9)} Q ${r(cx + sg * kk.c)} ${r(st[2].y + 12)} ${r(cx + sg * kk.c + kk.hw * 0.6)} ${r(st[2].y + 9)}`, 0.12);
    // Etak (manjet)
    const hb = legAt(trHem - 5);
    g += seam(`M ${r(cx + sg * hb.c - hb.hw)} ${r(trHem - 5)} L ${r(cx + sg * hb.c + hb.hw)} ${r(trHem - 5)}`, { dash: '3 2' });
    // Yon chok
    g += seam(`M ${r(cx + sg * (a.c + a.hw - 2))} ${r(yA)} L ${r(cx + sg * (st[2].c + st[2].hw - 2))} ${r(st[2].y)} L ${r(cx + sg * (b.c + b.hw - 2))} ${r(trHem - 6)}`);

    // Kargo cho'ntaklar (harbiy / sanoat)
    if ((type === 'harbiy_dala' || type === 'sanoat_pro' || type === 'iiv_patrol') && !back) {
      const py = st[1].y + 4, pc = legAt(py);
      const px = cx + sg * (pc.c + pc.hw - 4);
      const w = 26, hgt = 34;
      const x0 = sg > 0 ? px - w : px, x1 = x0 + w;
      if (py + hgt < trHem - 30) {
        g += `<path d="M ${r(x0)} ${r(py)} L ${r(x1)} ${r(py)} L ${r(x1)} ${r(py + hgt)} L ${r(x0)} ${r(py + hgt)} Z" fill="#000" fill-opacity=".10" stroke="${outline}" stroke-width="1"/>`
          + fab(`M ${r(x0)} ${r(py)} L ${r(x1)} ${r(py)} L ${r(x1)} ${r(py + 11)} L ${r((x0 + x1) / 2)} ${r(py + 15)} L ${r(x0)} ${r(py + 11)} Z`, { tone: -0.1, flat: true, sw: 1 })
          + seam(`M ${r(x0 + 2)} ${r(py + hgt - 3)} L ${r(x1 - 2)} ${r(py + hgt - 3)}`)
          + button((x0 + x1) / 2, py + 9, military ? '#2A2A2A' : '#9CA3AF');
      }
    }
    // Orqa cho'ntaklar
    if (back) {
      const py = waistY + 30, pc = legAt(py);
      const x0 = cx + sg * 8 - (sg > 0 ? 0 : 28), w = 28;
      g += fab(`M ${r(x0)} ${r(py)} L ${r(x0 + w)} ${r(py)} L ${r(x0 + w)} ${r(py + 6)} L ${r(x0)} ${r(py + 6)} Z`, { tone: -0.12, flat: true, sw: 1 })
        + seam(`M ${r(x0 + 2)} ${r(py + 9)} L ${r(x0 + w - 2)} ${r(py + 9)}`);
    }

    // Aks etuvchi tasma (sanoat) — boldirda
    if (type === 'sanoat_pro') {
      const by = trHem - 62, bc = legAt(by), bc2 = legAt(by + 9);
      g += `<path d="M ${r(cx + sg * bc.c - bc.hw)} ${r(by)} L ${r(cx + sg * bc.c + bc.hw)} ${r(by)} L ${r(cx + sg * bc2.c + bc2.hw)} ${r(by + 9)} L ${r(cx + sg * bc2.c - bc2.hw)} ${r(by + 9)} Z" fill="#D7DBE0"/>
        <path d="M ${r(cx + sg * bc.c - bc.hw)} ${r(by + 3)} L ${r(cx + sg * bc.c + bc.hw)} ${r(by + 3)} M ${r(cx + sg * bc2.c - bc2.hw)} ${r(by + 6)} L ${r(cx + sg * bc2.c + bc2.hw)} ${r(by + 6)}" stroke="#7B828C" stroke-width=".9"/>
        <path d="M ${r(cx + sg * bc.c - bc.hw)} ${r(by)} L ${r(cx + sg * bc.c + bc.hw)} ${r(by)} L ${r(cx + sg * bc2.c + bc2.hw)} ${r(by + 9)} L ${r(cx + sg * bc2.c - bc2.hw)} ${r(by + 9)} Z" fill="url(#shadeH)"/>`;
    }
  });
  // Oldingi yoki orqa o'rta chok
  if (back) g += seam(`M ${cx} ${r(jackHem)} L ${cx} ${r(crotchY + 8)}`);
  g += `</g>`;

  // ------------------------------------------------------------------
  // Bo'yin, bosh
  // ------------------------------------------------------------------
  // Studiya manekeni: yuzsiz mat kulrang bosh va bo'yin
  const headD = `M ${cx} ${r(headTop)} C ${r(cx + hw * 0.92)} ${r(headTop)} ${r(cx + hw)} ${r(headTop + hH * 0.16)} ${r(cx + hw)} ${r(headTop + hH * 0.42)} C ${r(cx + hw)} ${r(headTop + hH * 0.66)} ${r(cx + hw * 0.66)} ${r(headTop + hH * 0.88)} ${r(cx + hw * 0.30)} ${r(chin - 1)} Q ${cx} ${r(chin + 2)} ${r(cx - hw * 0.30)} ${r(chin - 1)} C ${r(cx - hw * 0.66)} ${r(headTop + hH * 0.88)} ${r(cx - hw)} ${r(headTop + hH * 0.66)} ${r(cx - hw)} ${r(headTop + hH * 0.42)} C ${r(cx - hw)} ${r(headTop + hH * 0.16)} ${r(cx - hw * 0.92)} ${r(headTop)} ${cx} ${r(headTop)} Z`;
  g += `<g id="cadHead">
    <path d="M ${r(cx - neckH * 0.92)} ${r(chin - 8)} L ${r(cx - neckH)} ${r(neckB + 12)} L ${r(cx + neckH)} ${r(neckB + 12)} L ${r(cx + neckH * 0.92)} ${r(chin - 8)} Z" fill="url(#mqH)"/>
    <ellipse cx="${cx}" cy="${r(chin + 6)}" rx="${r(neckH * 0.95)}" ry="8" fill="#000" fill-opacity=".18"/>
    <path d="${headD}" fill="url(#mqHead)" stroke="#6F757F" stroke-opacity=".5" stroke-width="1"/>
    <ellipse cx="${r(cx - hw * 0.25)}" cy="${r(headTop + hH * 0.22)}" rx="${r(hw * 0.35)}" ry="${r(hH * 0.12)}" fill="#fff" fill-opacity=".35"/>`;

  // Bosh kiyim
  const bandY = headTop + hH * 0.30, capHW = hw * 1.12;
  if (military) {
    g += fab(`M ${r(cx - capHW)} ${r(bandY)} L ${r(cx - capHW * 1.16)} ${r(headTop - 4)} Q ${cx} ${r(headTop - 27)} ${r(cx + capHW * 1.16)} ${r(headTop - 4)} L ${r(cx + capHW)} ${r(bandY)} Z`)
      + fab(`M ${r(cx - capHW - 0.5)} ${r(bandY - 3)} L ${r(cx + capHW + 0.5)} ${r(bandY - 3)} L ${r(cx + capHW + 0.5)} ${r(bandY + 6)} L ${r(cx - capHW - 0.5)} ${r(bandY + 6)} Z`, { tone: -0.45, sw: 1 });
    if (!back) {
      g += `<path d="M ${r(cx - capHW * 0.98)} ${r(bandY + 6)} Q ${cx} ${r(bandY + 25)} ${r(cx + capHW * 0.98)} ${r(bandY + 6)} Q ${cx} ${r(bandY + 11)} ${r(cx - capHW * 0.98)} ${r(bandY + 6)} Z" fill="#0A0B0D" stroke="#000"/>
        <path d="M ${r(cx - capHW * 0.55)} ${r(bandY + 12)} Q ${cx} ${r(bandY + 19)} ${r(cx + capHW * 0.55)} ${r(bandY + 12)}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1.4" stroke-linecap="round"/>`
        + `<circle cx="${cx}" cy="${r(bandY + 1.5)}" r="4" fill="${gold}" stroke="#7a5d10" stroke-width=".8"/>` + star(cx, bandY + 1.5, 2.6, '#7a1c1c');
    }
  } else if (type === 'sanoat_pro') {
    const hh = '#F2C318';
    const dome = `M ${r(cx - hw * 1.18)} ${r(headTop + hH * 0.30)} C ${r(cx - hw * 1.22)} ${r(headTop - 26)} ${r(cx + hw * 1.22)} ${r(headTop - 26)} ${r(cx + hw * 1.18)} ${r(headTop + hH * 0.30)} Z`;
    g += `<path d="${dome}" fill="${hh}" stroke="#8A6A00" stroke-width="1.3"/><path d="${dome}" fill="url(#shadeH)"/>
      <path d="M ${r(cx - 5)} ${r(headTop - 20)} L ${r(cx + 5)} ${r(headTop - 20)} L ${r(cx + 6)} ${r(headTop + hH * 0.30)} L ${r(cx - 6)} ${r(headTop + hH * 0.30)} Z" fill="#fff" fill-opacity=".22"/>
      <path d="M ${r(cx - hw * 1.3)} ${r(headTop + hH * 0.30)} Q ${cx} ${r(headTop + hH * (back ? 0.30 : 0.42))} ${r(cx + hw * 1.3)} ${r(headTop + hH * 0.30)} Q ${cx} ${r(headTop + hH * 0.26)} ${r(cx - hw * 1.3)} ${r(headTop + hH * 0.30)} Z" fill="${hh}" stroke="#8A6A00" stroke-width="1.2"/>`;
  }
  g += `</g>`;

  // Maneken qo'llari (mat kulrang)
  [-1, 1].forEach(sg => {
    const a = arms[sg], W = a.c(1), ang = -sg * th * 180 / Math.PI;
    const hc = [W[0] + a.d[0] * 24, W[1] + a.d[1] * 24];
    g += `<g transform="rotate(${r(ang)} ${r(hc[0])} ${r(hc[1])})">
      <ellipse cx="${r(hc[0])}" cy="${r(hc[1])}" rx="12" ry="27" fill="url(#mqH)" stroke="#6F757F" stroke-opacity=".55" stroke-width="1"/>
      <ellipse cx="${r(hc[0] - sg * 11)}" cy="${r(hc[1] - 5)}" rx="3.4" ry="12" fill="url(#mqH)" stroke="#6F757F" stroke-opacity=".5" stroke-width=".8" transform="rotate(${r(sg * 14)} ${r(hc[0] - sg * 11)} ${r(hc[1] - 5)})"/>
    </g>`;
  });

  // ------------------------------------------------------------------
  // Yenglar
  // ------------------------------------------------------------------
  [-1, 1].forEach(sg => {
    const a = arms[sg];
    const S = [cx + sg * shH, shY + 3];
    const A = [cx + sg * chH * 0.96, pitY];
    const sleeveD = M(S) + cadCurve([S, a.o(0.3), a.o(0.65), a.o(1)]) + L(a.i(1)) + cadCurve([a.i(1), a.i(0.65), a.i(0.3), A]) + ' Z';
    g += `<g class="cadSleeve">${fab(sleeveD)}`;
    // Tirsak burmalari
    const e = a.c(0.5);
    g += crease(`M ${r(e[0] - 14)} ${r(e[1] + 2)} Q ${r(e[0])} ${r(e[1] + 7)} ${r(e[0] + 14)} ${r(e[1] + 2)}`, 0.14)
      + crease(`M ${r(e[0] - 12)} ${r(e[1] - 10)} Q ${r(e[0])} ${r(e[1] - 6)} ${r(e[0] + 12)} ${r(e[1] - 10)}`, 0.10);
    // Manjet
    const o9 = a.o(0.92), i9 = a.i(0.92), o1 = a.o(1), i1 = a.i(1);
    if (type === 'tibbiyot_xalat' || type === 'ofis_kostyum') {
      g += seam(M(o9) + L(i9), { dash: '2.5 2' });
    } else {
      g += fab(`${M(o9)}${L(o1)}${L(i1)}${L(i9)} Z`, { tone: -0.18, sw: 1 }) + button(...(() => { const c = a.c(0.96); return [c[0], c[1]]; })(), military ? gold : '#B8BEC6');
    }
    // Manjet teshigi (ichki qism ko'rinadi)
    {
      const c1 = a.c(1), ang = Math.atan2(o1[1] - i1[1], o1[0] - i1[0]) * 180 / Math.PI;
      g += `<ellipse cx="${r(c1[0])}" cy="${r(c1[1])}" rx="${r(Math.hypot(o1[0] - i1[0], o1[1] - i1[1]) / 2)}" ry="3.4" fill="${cadShade(base, -0.62)}" stroke="${outline}" stroke-width="1" transform="rotate(${r(ang)} ${r(c1[0])} ${r(c1[1])})"/>`;
    }
    // Chok chiziqlari
    g += seam(M(a.o(0.05)) + cadCurve([a.o(0.05), a.o(0.5), a.o(0.9)]));
    g += seam(M(a.i(0.3)) + cadCurve([a.i(0.3), a.i(0.65), a.i(0.9)]));

    // Yeng nishoni (harbiy / IIV)
    if (military && !back) {
      const c = a.c(0.26);
      g += `<rect x="${r(c[0] - 8)}" y="${r(c[1] - 9)}" width="16" height="19" rx="3" fill="#102a4a" stroke="${gold}" stroke-width="1.2"/>
        <path d="M ${r(c[0] - 5)} ${r(c[1] - 3)} L ${r(c[0])} ${r(c[1] - 6)} L ${r(c[0] + 5)} ${r(c[1] - 3)} L ${r(c[0] + 5)} ${r(c[1] + 3)} L ${r(c[0])} ${r(c[1] + 7)} L ${r(c[0] - 5)} ${r(c[1] + 3)} Z" fill="${gold}" fill-opacity=".9"/>`;
    }
    // Aks etuvchi tasma (sanoat) — yengda
    if (type === 'sanoat_pro') {
      const p1o = a.o(0.62), p1i = a.i(0.62), p2o = a.o(0.7), p2i = a.i(0.7);
      g += `<path d="${M(p1o)}${L(p2o)}${L(p2i)}${L(p1i)} Z" fill="#D7DBE0"/><path d="${M(p1o)}${L(p2o)}${L(p2i)}${L(p1i)} Z" fill="url(#shadeH)"/>`;
    }
    g += `</g>`;
  });

  // ------------------------------------------------------------------
  // Tana (kurtka / xalat)
  // ------------------------------------------------------------------
  const nL = [cx - neckH - 8, neckB - 4], nR = mir(nL);
  const SL = [cx - shH + 2, shY + 2], SR = mir(SL);
  const AL = [cx - chH, pitY], AR = mir(AL);
  const sideL = [AL, [cx - (chH + waH) / 2 - 1, (pitY + waistY) / 2], [cx - waH, waistY], [cx - (waH + hiH) / 2 - 3, (waistY + jackHem) / 2], [cx - hiH - 4, jackHem]];
  const sideR = sideL.map(mir);
  const hemSag = type === 'tibbiyot_xalat' ? 3 : 8;
  const torsoD = M(nL) + ` C ${r(cx - shH * 0.55)} ${r(neckB - 6)} ${r(cx - shH * 0.85)} ${r(shY - 3)} ${r(SL[0])} ${r(SL[1])}`
    + ` Q ${r(SL[0] + 10)} ${r((SL[1] + AL[1]) / 2)} ${r(AL[0])} ${r(AL[1])}`
    + cadCurve(sideL)
    + ` Q ${cx} ${r(jackHem + hemSag)} ${r(sideR[4][0])} ${r(sideR[4][1])}`
    + cadCurve(sideR.slice().reverse())
    + ` Q ${r(SR[0] - 10)} ${r((SR[1] + AR[1]) / 2)} ${r(SR[0])} ${r(SR[1])}`
    + ` C ${r(cx + shH * 0.85)} ${r(shY - 3)} ${r(cx + shH * 0.55)} ${r(neckB - 6)} ${r(nR[0])} ${r(nR[1])} Q ${cx} ${r(neckB + 6)} ${r(nL[0])} ${r(nL[1])} Z`;

  g += `<g id="cadJacket">${fab(torsoD, { tone: type === 'tibbiyot_xalat' ? 0 : 0 })}`;
  // Yoqaning ichki tomoni (bo'yin teshigi)
  g += `<ellipse cx="${cx}" cy="${r(neckB - 5)}" rx="${r(neckH + 7)}" ry="9" fill="url(#mqH)" stroke="${outline}" stroke-width="1"/>`;
  // Tana burmalari
  g += crease(`M ${r(cx - chH + 4)} ${r(pitY + 28)} Q ${r(cx - chH * 0.5)} ${r(pitY + 40)} ${r(cx - 6)} ${r(pitY + 34)}`, 0.10)
    + crease(`M ${r(cx + chH - 4)} ${r(pitY + 28)} Q ${r(cx + chH * 0.5)} ${r(pitY + 40)} ${r(cx + 6)} ${r(pitY + 34)}`, 0.10)
    + crease(`M ${r(cx - waH + 4)} ${r(waistY + 8)} Q ${r(cx - waH * 0.5)} ${r(waistY + 16)} ${r(cx - 8)} ${r(waistY + 12)}`, 0.10)
    + crease(`M ${r(cx + waH - 4)} ${r(waistY + 8)} Q ${r(cx + waH * 0.5)} ${r(waistY + 16)} ${r(cx + 8)} ${r(waistY + 12)}`, 0.10);
  // Yenglik chokining tikuvi
  g += seam(`M ${r(SL[0] + 2)} ${r(SL[1] + 3)} Q ${r(SL[0] + 12)} ${r((SL[1] + AL[1]) / 2)} ${r(AL[0] + 1)} ${r(AL[1])}`)
    + seam(`M ${r(SR[0] - 2)} ${r(SR[1] + 3)} Q ${r(SR[0] - 12)} ${r((SR[1] + AR[1]) / 2)} ${r(AR[0] - 1)} ${r(AR[1])}`);

  const hemY = jackHem;
  const inTorso = (x0, x1, y) => Math.abs(x0 - cx) < halfAt(y) - 2 && Math.abs(x1 - cx) < halfAt(y) - 2;

  if (!back) {
    // =================== OLD TOMON ===================
    if (military) {
      const vTop = neckB - 8, vBot = neckB + 38;
      const shirt = type === 'iiv_patrol' ? '#A9BCD3' : '#6B7355';
      g += `<path d="M ${r(cx - neckH - 2)} ${r(vTop)} L ${r(cx + neckH + 2)} ${r(vTop)} L ${cx} ${r(vBot)} Z" fill="${shirt}" stroke="#000" stroke-opacity=".4" stroke-width="1"/>`
        + fab(`M ${r(cx - neckH - 2)} ${r(vTop)} L ${r(cx - neckH - 26)} ${r(neckB + 14)} L ${r(cx - 6)} ${r(vBot + 4)} L ${r(cx - 1)} ${r(vBot)} Z`, { tone: -0.12, sw: 1.2 })
        + fab(`M ${r(cx + neckH + 2)} ${r(vTop)} L ${r(cx + neckH + 26)} ${r(neckB + 14)} L ${r(cx + 6)} ${r(vBot + 4)} L ${r(cx + 1)} ${r(vBot)} Z`, { tone: -0.12, sw: 1.2 });
      // Planka va tugmalar
      g += `<path d="M ${cx} ${r(vBot)} L ${cx} ${r(hemY)}" stroke="${outline}" stroke-width="1.4"/>`
        + seam(`M ${cx - 6} ${r(vBot + 3)} L ${cx - 6} ${r(hemY)}`) + seam(`M ${cx + 6} ${r(vBot + 3)} L ${cx + 6} ${r(hemY)}`);
      const nb = 5;
      for (let i = 0; i < nb; i++) {
        const by = vBot + 16 + i * ((hemY - vBot - 30) / (nb - 1));
        if (Math.abs(by - waistY) > 12) g += button(cx, by, type === 'iiv_patrol' ? gold : '#3A3F34');
      }
      // Ko'krak cho'ntaklari
      [-1, 1].forEach(sg => {
        const w = 36, x0 = sg < 0 ? cx - chH + 7 : cx + chH - 7 - w, py = pitY + 9;
        g += `<path d="M ${r(x0)} ${r(py)} L ${r(x0 + w)} ${r(py)} L ${r(x0 + w)} ${r(py + 34)} L ${r(x0)} ${r(py + 34)} Z" fill="#000" fill-opacity=".12" stroke="${outline}" stroke-width="1"/>`
          + fab(`M ${r(x0)} ${r(py)} L ${r(x0 + w)} ${r(py)} L ${r(x0 + w)} ${r(py + 12)} L ${r(x0 + w / 2)} ${r(py + 17)} L ${r(x0)} ${r(py + 12)} Z`, { tone: -0.1, flat: true, sw: 1 })
          + seam(`M ${r(x0 + 2)} ${r(py + 31)} L ${r(x0 + w - 2)} ${r(py + 31)}`)
          + button(x0 + w / 2, py + 11, military ? (type === 'iiv_patrol' ? gold : '#3A3F34') : '#9CA3AF');
      });
      // Qon guruhi va nom tasmasi
      const blood = s.bloodGroup.split(' ')[0];
      g += `<rect x="${r(cx - chH + 9)}" y="${r(pitY - 10)}" width="30" height="10" rx="2" fill="#B91C1C" stroke="#000" stroke-opacity=".4" stroke-width=".8"/>
        <text x="${r(cx - chH + 24)}" y="${r(pitY - 2.2)}" fill="#fff" font-size="7" font-weight="bold" text-anchor="middle" font-family="monospace">${blood}</text>
        <rect x="${r(cx + chH - 39)}" y="${r(pitY - 10)}" width="30" height="10" rx="2" fill="#1773D6" stroke="#000" stroke-opacity=".4" stroke-width=".8"/>
        <text x="${r(cx + chH - 24)}" y="${r(pitY - 2.2)}" fill="#fff" font-size="7" font-weight="bold" text-anchor="middle" font-family="monospace">UMISH</text>`;
      // Pastki cho'ntaklar
      [-1, 1].forEach(sg => {
        const w = 34, hy = hemY - 46;
        const hx = halfAt(hy) - 8;
        const x0 = sg < 0 ? cx - hx : cx + hx - w;
        g += `<path d="M ${r(x0)} ${r(hy)} L ${r(x0 + w)} ${r(hy)} L ${r(x0 + w)} ${r(hy + 32)} L ${r(x0)} ${r(hy + 32)} Z" fill="#000" fill-opacity=".12" stroke="${outline}" stroke-width="1"/>`
          + fab(`M ${r(x0)} ${r(hy)} L ${r(x0 + w)} ${r(hy)} L ${r(x0 + w)} ${r(hy + 10)} L ${r(x0)} ${r(hy + 10)} Z`, { tone: -0.1, flat: true, sw: 1 })
          + button(x0 + w / 2, hy + 6, type === 'iiv_patrol' ? gold : '#3A3F34');
      });
      // Kamar
      const bw = halfAt(waistY) - 1;
      g += `<path d="M ${r(cx - bw)} ${r(waistY - 6)} L ${r(cx + bw)} ${r(waistY - 6)} L ${r(cx + bw)} ${r(waistY + 6)} L ${r(cx - bw)} ${r(waistY + 6)} Z" fill="url(#leather)" stroke="#000" stroke-width="1"/>
        <path d="M ${r(cx - bw + 2)} ${r(waistY - 3)} L ${r(cx + bw - 2)} ${r(waistY - 3)}" stroke="#fff" stroke-opacity=".14" stroke-width="1.2"/>
        <rect x="${cx - 11}" y="${r(waistY - 8)}" width="22" height="16" rx="3" fill="${gold}" stroke="#7a5d10" stroke-width="1.2"/><rect x="${cx - 6}" y="${r(waistY - 4)}" width="12" height="8" rx="1.5" fill="#1b1608"/>`;
    }

    if (type === 'sanoat_pro') {
      // Yoka (kontrast) va zamok
      g += fab(`${M(nL)} C ${r(cx - shH * 0.55)} ${r(neckB - 6)} ${r(cx - shH * 0.85)} ${r(shY - 3)} ${r(SL[0])} ${r(SL[1])} Q ${r(SL[0] + 10)} ${r(SL[1] + 22)} ${r(AL[0] + 6)} ${r(pitY - 6)} L ${cx} ${r(pitY + 8)} L ${r(AR[0] - 6)} ${r(pitY - 6)} Q ${r(SR[0] - 10)} ${r(SR[1] + 22)} ${r(SR[0])} ${r(SR[1])} C ${r(cx + shH * 0.85)} ${r(shY - 3)} ${r(cx + shH * 0.55)} ${r(neckB - 6)} ${r(nR[0])} ${r(nR[1])} Z`, { tone: -0.22, sw: 1 });
      g += fab(`M ${r(cx - neckH - 6)} ${r(neckB - 12)} L ${r(cx + neckH + 6)} ${r(neckB - 12)} L ${r(cx + neckH + 9)} ${r(neckB + 4)} L ${r(cx - neckH - 9)} ${r(neckB + 4)} Z`, { tone: -0.15, sw: 1.1 });
      g += `<path d="M ${cx} ${r(neckB + 4)} L ${cx} ${r(hemY)}" stroke="#C7CCD3" stroke-width="2.4" stroke-dasharray="1.2 1.2"/><path d="M ${cx} ${r(neckB + 4)} L ${cx} ${r(hemY)}" stroke="#000" stroke-opacity=".5" stroke-width=".7"/>
        <rect x="${cx - 2.5}" y="${r(neckB + 2)}" width="5" height="12" rx="1.5" fill="#C7CCD3" stroke="#000" stroke-opacity=".5" stroke-width=".7"/>`;
      [-1, 1].forEach(sg => {
        const w = 32, x0 = sg < 0 ? cx - chH + 8 : cx + chH - 8 - w, py = pitY + 12;
        g += `<path d="M ${r(x0)} ${r(py)} L ${r(x0 + w)} ${r(py)} L ${r(x0 + w)} ${r(py + 24)} L ${r(x0)} ${r(py + 24)} Z" fill="#000" fill-opacity=".10" stroke="${outline}" stroke-width="1"/>`
          + `<path d="M ${r(x0 + 3)} ${r(py + 4)} L ${r(x0 + w - 3)} ${r(py + 4)}" stroke="#C7CCD3" stroke-width="2" stroke-dasharray="1.2 1.2"/>`;
      });
      // Aks etuvchi tasmalar (3M)
      [hemY - 44, waistY - 30].forEach(by => {
        const hx = halfAt(by) - 1;
        g += `<path d="M ${r(cx - hx)} ${r(by)} L ${r(cx + hx)} ${r(by)} L ${r(cx + hx)} ${r(by + 10)} L ${r(cx - hx)} ${r(by + 10)} Z" fill="#D7DBE0"/>
          <path d="M ${r(cx - hx)} ${r(by + 3.3)} L ${r(cx + hx)} ${r(by + 3.3)} M ${r(cx - hx)} ${r(by + 6.6)} L ${r(cx + hx)} ${r(by + 6.6)}" stroke="#7B828C" stroke-width=".9"/>
          <path d="M ${r(cx - hx)} ${r(by)} L ${r(cx + hx)} ${r(by)} L ${r(cx + hx)} ${r(by + 10)} L ${r(cx - hx)} ${r(by + 10)} Z" fill="url(#shadeH)"/>`;
      });
    }

    if (type === 'ofis_kostyum') {
      const vTop = neckB - 8, vBot = neckB + 68;
      const tie = cadLum(base) > 0.45 ? '#1D3557' : '#7B1E2B';
      g += `<clipPath id="vClip"><path d="M ${r(cx - neckH - 2)} ${r(vTop)} L ${r(cx + neckH + 2)} ${r(vTop)} L ${cx} ${r(vBot)} Z"/></clipPath>
        <path d="M ${r(cx - neckH - 2)} ${r(vTop)} L ${r(cx + neckH + 2)} ${r(vTop)} L ${cx} ${r(vBot)} Z" fill="#F4F6F8" stroke="#000" stroke-opacity=".35"/>
        <g clip-path="url(#vClip)">
          <path d="M ${cx - 6} ${r(neckB - 2)} L ${cx + 6} ${r(neckB - 2)} L ${cx + 4} ${r(neckB + 10)} L ${cx - 4} ${r(neckB + 10)} Z" fill="${tie}"/>
          <path d="M ${cx - 4.5} ${r(neckB + 10)} L ${cx + 4.5} ${r(neckB + 10)} L ${cx + 8} ${r(vBot + 4)} L ${cx} ${r(vBot + 10)} L ${cx - 8} ${r(vBot + 4)} Z" fill="${tie}"/>
          <path d="M ${cx - 4.5} ${r(neckB + 10)} L ${cx + 4.5} ${r(neckB + 10)} L ${cx + 8} ${r(vBot + 4)} L ${cx} ${r(vBot + 10)} L ${cx - 8} ${r(vBot + 4)} Z" fill="url(#shadeH)"/>
        </g>
        <path d="M ${r(cx - neckH - 2)} ${r(vTop)} L ${r(cx - 4)} ${r(neckB + 6)} L ${r(cx - neckH - 8)} ${r(neckB + 6)} Z" fill="#fff" stroke="#000" stroke-opacity=".35" stroke-width=".9"/>
        <path d="M ${r(cx + neckH + 2)} ${r(vTop)} L ${r(cx + 4)} ${r(neckB + 6)} L ${r(cx + neckH + 8)} ${r(neckB + 6)} Z" fill="#fff" stroke="#000" stroke-opacity=".35" stroke-width=".9"/>`;
      // Revers
      g += fab(`M ${r(cx - neckH - 3)} ${r(neckB - 7)} L ${r(cx - neckH - 28)} ${r(neckB + 17)} L ${r(cx - neckH - 22)} ${r(neckB + 26)} L ${r(cx - 31)} ${r(neckB + 54)} L ${cx} ${r(vBot + 4)} L ${r(cx - 1)} ${r(vBot - 4)} L ${r(cx - 9)} ${r(neckB + 24)} Z`, { tone: 0.06, sw: 1.2 })
        + fab(`M ${r(cx + neckH + 3)} ${r(neckB - 7)} L ${r(cx + neckH + 28)} ${r(neckB + 17)} L ${r(cx + neckH + 22)} ${r(neckB + 26)} L ${r(cx + 31)} ${r(neckB + 54)} L ${cx} ${r(vBot + 4)} L ${r(cx + 1)} ${r(vBot - 4)} L ${r(cx + 9)} ${r(neckB + 24)} Z`, { tone: 0.06, sw: 1.2 });
      g += `<path d="M ${cx} ${r(vBot + 4)} L ${cx} ${r(hemY)}" stroke="${outline}" stroke-width="1.3"/>` + button(cx, vBot + 12, '#2a2a2a') + button(cx, vBot + 44, '#2a2a2a');
      // Cho'ntaklar
      const pw = 34, py = pitY + 24;
      g += `<path d="M ${r(cx - chH + 8)} ${r(py)} L ${r(cx - chH + 8 + pw)} ${r(py - 3)}" stroke="${outline}" stroke-width="2.2"/>
        <path d="M ${r(cx - chH + 12)} ${r(py - 1)} L ${r(cx - chH + 18)} ${r(py - 8)} L ${r(cx - chH + 27)} ${r(py - 3)} Z" fill="#fff" stroke="#000" stroke-opacity=".3" stroke-width=".8"/>`;
      [-1, 1].forEach(sg => {
        const w = 36, hy = hemY - 52, hx = halfAt(hy) - 6, x0 = sg < 0 ? cx - hx : cx + hx - w;
        g += `<path d="M ${r(x0)} ${r(hy)} L ${r(x0 + w)} ${r(hy)} L ${r(x0 + w)} ${r(hy + 4)} L ${r(x0)} ${r(hy + 4)} Z" fill="#000" fill-opacity=".45" stroke="${outline}" stroke-width=".8"/>`
          + fab(`M ${r(x0 - 1)} ${r(hy - 5)} L ${r(x0 + w + 1)} ${r(hy - 5)} L ${r(x0 + w + 1)} ${r(hy + 2)} L ${r(x0 - 1)} ${r(hy + 2)} Z`, { tone: -0.08, flat: true, sw: 1 });
      });
    }

    if (type === 'tibbiyot_xalat') {
      const vTop = neckB - 8, vBot = neckB + 46;
      const scrub = '#2E8B83';
      g += `<path d="M ${r(cx - neckH - 2)} ${r(vTop)} L ${r(cx + neckH + 2)} ${r(vTop)} L ${cx} ${r(vBot)} Z" fill="${scrub}" stroke="#000" stroke-opacity=".3" stroke-width=".9"/>`
        + fab(`M ${r(cx - neckH - 3)} ${r(neckB - 8)} L ${r(cx - neckH - 22)} ${r(neckB + 12)} L ${r(cx - 8)} ${r(vBot + 2)} L ${cx} ${r(vBot - 2)} Z`, { tone: -0.04, sw: 1.2 })
        + fab(`M ${r(cx + neckH + 3)} ${r(neckB - 8)} L ${r(cx + neckH + 22)} ${r(neckB + 12)} L ${r(cx + 8)} ${r(vBot + 2)} L ${cx} ${r(vBot - 2)} Z`, { tone: -0.04, sw: 1.2 });
      g += `<path d="M ${cx} ${r(vBot - 2)} L ${cx} ${r(hemY)}" stroke="${outline}" stroke-width="1.3"/>`;
      for (let i = 0; i < 5; i++) g += button(cx, vBot + 12 + i * ((hemY - vBot - 26) / 4), '#B6BEC8');
      // Ko'krak cho'ntagi (qalamlar) va nom tasmasi
      const x0 = cx - chH + 8, py = pitY + 8;
      g += `<path d="M ${r(x0)} ${r(py)} L ${r(x0 + 34)} ${r(py)} L ${r(x0 + 34)} ${r(py + 30)} L ${r(x0)} ${r(py + 30)} Z" fill="#000" fill-opacity=".06" stroke="${outline}" stroke-width="1"/>`
        + seam(`M ${r(x0 + 2)} ${r(py + 3)} L ${r(x0 + 32)} ${r(py + 3)}`)
        + `<path d="M ${r(x0 + 8)} ${r(py - 7)} L ${r(x0 + 8)} ${r(py + 6)}" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round"/><path d="M ${r(x0 + 14)} ${r(py - 5)} L ${r(x0 + 14)} ${r(py + 6)}" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>`;
      g += `<rect x="${r(cx + chH - 40)}" y="${r(pitY + 6)}" width="32" height="14" rx="2" fill="#fff" stroke="#6B7280" stroke-width=".9"/>
        <rect x="${r(cx + chH - 37)}" y="${r(pitY + 9)}" width="14" height="3" fill="#1773D6"/><rect x="${r(cx + chH - 37)}" y="${r(pitY + 14)}" width="24" height="2" fill="#9CA3AF"/>`;
      // Belgi cho'ntaklari
      [-1, 1].forEach(sg => {
        const w = 40, hy = hemY - 64, hx = halfAt(hy) - 6, x0b = sg < 0 ? cx - hx : cx + hx - w;
        g += `<path d="M ${r(x0b)} ${r(hy)} L ${r(x0b + w)} ${r(hy)} L ${r(x0b + w)} ${r(hy + 42)} L ${r(x0b)} ${r(hy + 42)} Z" fill="#000" fill-opacity=".05" stroke="${outline}" stroke-width="1"/>`
          + seam(`M ${r(x0b + 2)} ${r(hy + 3)} L ${r(x0b + w - 2)} ${r(hy + 3)}`);
      });
      // Stetoskop
      g += `<path d="M ${r(cx - neckH - 1)} ${r(neckB - 2)} C ${r(cx - neckH - 6)} ${r(neckB + 40)} ${r(cx - 22)} ${r(pitY + 38)} ${r(cx + 8)} ${r(pitY + 40)}" fill="none" stroke="#262A31" stroke-width="3" stroke-linecap="round"/>
        <path d="M ${r(cx + neckH + 1)} ${r(neckB - 2)} C ${r(cx + neckH + 6)} ${r(neckB + 40)} ${r(cx + 26)} ${r(pitY + 38)} ${r(cx + 12)} ${r(pitY + 42)}" fill="none" stroke="#262A31" stroke-width="3" stroke-linecap="round"/>
        <circle cx="${r(cx + 10)}" cy="${r(pitY + 46)}" r="7" fill="#C7CCD3" stroke="#262A31" stroke-width="2"/><circle cx="${r(cx + 10)}" cy="${r(pitY + 46)}" r="3" fill="#7B828C"/>`;
    }

    // Pogonlar (faqat harbiy / IIV)
    if (military) {
      const rk = CAD_RANKS[s.rank] || CAD_RANKS['Oddiy askar / Safdor'];
      [-1, 1].forEach(sg => {
        const Nn = [cx + sg * (neckH + 8), neckB - 3], Ss = [cx + sg * (shH - 3), shY + 4];
        const pa = [Nn[0] + (Ss[0] - Nn[0]) * 0.30, Nn[1] + (Ss[1] - Nn[1]) * 0.30], pb = [Nn[0] + (Ss[0] - Nn[0]) * 0.97, Nn[1] + (Ss[1] - Nn[1]) * 0.97];
        const dx = pb[0] - pa[0], dy = pb[1] - pa[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
        let vx = -uy, vy = ux; if (vy < 0) { vx = -vx; vy = -vy; }
        const wd = 15;
        g += `<path d="M ${r(pa[0])} ${r(pa[1])} L ${r(pb[0])} ${r(pb[1])} L ${r(pb[0] + vx * wd)} ${r(pb[1] + vy * wd)} L ${r(pa[0] + vx * wd)} ${r(pa[1] + vy * wd)} Z" fill="#0F1824" stroke="${gold}" stroke-width="1.3"/>`;
        const at = (t, off) => [pa[0] + ux * len * t + vx * wd * off, pa[1] + uy * len * t + vy * wd * off];
        for (let i = 0; i < rk.bars; i++) { const a = at(0.30 + i * 0.17, 0.08), b = at(0.30 + i * 0.17, 0.92); g += `<path d="M ${r(a[0])} ${r(a[1])} L ${r(b[0])} ${r(b[1])}" stroke="#E5E7EB" stroke-width="2.4"/>`; }
        for (let i = 0; i < rk.gap; i++) { const off = rk.gap === 1 ? 0.5 : (i ? 0.62 : 0.38); const a = at(0.04, off), b = at(0.96, off); g += `<path d="M ${r(a[0])} ${r(a[1])} L ${r(b[0])} ${r(b[1])}" stroke="${gold}" stroke-width="1.5"/>`; }
        for (let i = 0; i < rk.stars; i++) {
          const cnt = rk.stars, t = cnt === 1 ? 0.5 : 0.22 + i * (0.56 / (cnt - 1));
          const c = at(t, rk.gap === 2 ? 0.5 : 0.5);
          g += star(c[0], c[1], rk.stars === 1 ? 4.6 : 3.2, gold);
        }
        g += button(pb[0] - ux * 3 + vx * 3, pb[1] - uy * 3 + vy * 3, gold);
      });
    }
  } else {
    // =================== ORQA TOMON ===================
    const collarTone = -0.12;
    g += fab(`M ${r(cx - neckH - 7)} ${r(neckB - 10)} L ${r(cx + neckH + 7)} ${r(neckB - 10)} L ${r(cx + neckH + 12)} ${r(neckB + 6)} Q ${cx} ${r(neckB + 12)} ${r(cx - neckH - 12)} ${r(neckB + 6)} Z`, { tone: collarTone, sw: 1.1 });
    g += seam(`M ${r(SL[0] + 6)} ${r(shY + 26)} Q ${cx} ${r(shY + 40)} ${r(SR[0] - 6)} ${r(shY + 26)}`)
      + `<path d="M ${cx} ${r(neckB + 10)} L ${cx} ${r(hemY)}" stroke="${outline}" stroke-width="1.2" stroke-dasharray="6 3"/>`;
    if (military || type === 'ofis_kostyum' || type === 'tibbiyot_xalat') {
      const vy = type === 'tibbiyot_xalat' ? 0 : 30;
      g += `<path d="M ${r(cx - 26)} ${r(hemY - vy - 4)} L ${r(cx - 26)} ${r(hemY)} M ${r(cx + 26)} ${r(hemY - vy - 4)} L ${r(cx + 26)} ${r(hemY)}" stroke="${outline}" stroke-width="1.4"/>`;
    }
    if (military) {
      const bw = halfAt(waistY) - 1;
      g += `<path d="M ${r(cx - bw)} ${r(waistY - 6)} L ${r(cx + bw)} ${r(waistY - 6)} L ${r(cx + bw)} ${r(waistY + 6)} L ${r(cx - bw)} ${r(waistY + 6)} Z" fill="url(#leather)" stroke="#000" stroke-width="1"/>`;
      const rk = CAD_RANKS[s.rank] || CAD_RANKS['Oddiy askar / Safdor'];
      [-1, 1].forEach(sg => {
        const Nn = [cx + sg * (neckH + 8), neckB - 3], Ss = [cx + sg * (shH - 3), shY + 4];
        const pa = [Nn[0] + (Ss[0] - Nn[0]) * 0.30, Nn[1] + (Ss[1] - Nn[1]) * 0.30], pb = [Nn[0] + (Ss[0] - Nn[0]) * 0.97, Nn[1] + (Ss[1] - Nn[1]) * 0.97];
        const dx = pb[0] - pa[0], dy = pb[1] - pa[1], len = Math.hypot(dx, dy);
        let vx = -dy / len, vy = dx / len; if (vy < 0) { vx = -vx; vy = -vy; }
        g += `<path d="M ${r(pa[0])} ${r(pa[1])} L ${r(pb[0])} ${r(pb[1])} L ${r(pb[0] + vx * 15)} ${r(pb[1] + vy * 15)} L ${r(pa[0] + vx * 15)} ${r(pa[1] + vy * 15)} Z" fill="#0F1824" stroke="${gold}" stroke-width="1.3"/>`;
      });
    }
    if (type === 'sanoat_pro') {
      [hemY - 44, waistY - 30].forEach(by => {
        const hx = halfAt(by) - 1;
        g += `<path d="M ${r(cx - hx)} ${r(by)} L ${r(cx + hx)} ${r(by)} L ${r(cx + hx)} ${r(by + 10)} L ${r(cx - hx)} ${r(by + 10)} Z" fill="#D7DBE0"/>
          <path d="M ${r(cx - hx)} ${r(by + 3.3)} L ${r(cx + hx)} ${r(by + 3.3)} M ${r(cx - hx)} ${r(by + 6.6)} L ${r(cx + hx)} ${r(by + 6.6)}" stroke="#7B828C" stroke-width=".9"/>
          <path d="M ${r(cx - hx)} ${r(by)} L ${r(cx + hx)} ${r(by)} L ${r(cx + hx)} ${r(by + 10)} L ${r(cx - hx)} ${r(by + 10)} Z" fill="url(#shadeH)"/>`;
      });
      g += `<text x="${cx}" y="${r(pitY + 12)}" text-anchor="middle" font-size="17" font-weight="800" letter-spacing="2" fill="#E5E7EB" fill-opacity=".92" font-family="Arial, Helvetica, sans-serif">UMISH</text>`;
    }
  }
  g += `</g>`;

  // ------------------------------------------------------------------
  // O'lchov belgilari
  // ------------------------------------------------------------------
  if (cadState.guides) {
    const sl = arms['1'];
    const so = sl.o(0.5), sw = sl.o(1);
    const lg = legAt((crotchY + trHem) / 2);
    g += `
      <g id="cadGuides" font-family="monospace" font-size="10" font-weight="bold" fill="#1773D6">
        <g>
          <line x1="${r(cx - shH)}" y1="${r(shY - 12)}" x2="${r(cx + shH)}" y2="${r(shY - 12)}" stroke="#1773D6" stroke-width="1.4" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
          <line x1="${r(cx - shH)}" y1="${r(shY - 16)}" x2="${r(cx - shH)}" y2="${r(shY)}" stroke="#1773D6" stroke-width=".8" stroke-dasharray="2,2"/>
          <line x1="${r(cx + shH)}" y1="${r(shY - 16)}" x2="${r(cx + shH)}" y2="${r(shY)}" stroke="#1773D6" stroke-width=".8" stroke-dasharray="2,2"/>
          <rect x="${r(cx - shH - 100)}" y="${r(shY - 20)}" width="92" height="15" rx="3" fill="#FFFFFF" stroke="#1773D6" stroke-width=".8"/>
          <text x="${r(cx - shH - 54)}" y="${r(shY - 9)}" text-anchor="middle">↔ Yelka: ${s.shoulder}sm</text>
        </g>
        <g>
          <line x1="${r(cx - chH)}" y1="${r(pitY + 56)}" x2="${r(cx + chH)}" y2="${r(pitY + 56)}" stroke="#1773D6" stroke-width="1.4" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
          <rect x="${cx - 48}" y="${r(pitY + 48)}" width="96" height="15" rx="3" fill="#FFFFFF" stroke="#1773D6" stroke-width=".8"/>
          <text x="${cx}" y="${r(pitY + 59)}" text-anchor="middle">↔ Ko'krak: ${s.chest}sm</text>
        </g>
        <g>
          <line x1="${r(cx - waH)}" y1="${r(waistY + 24)}" x2="${r(cx + waH)}" y2="${r(waistY + 24)}" stroke="#1773D6" stroke-width="1.4" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
          <rect x="${cx - 40}" y="${r(waistY + 16)}" width="80" height="15" rx="3" fill="#FFFFFF" stroke="#1773D6" stroke-width=".8"/>
          <text x="${cx}" y="${r(waistY + 27)}" text-anchor="middle">↔ Bel: ${s.waist}sm</text>
        </g>
        <g>
          <line x1="${r(so[0] + 30)}" y1="${r(sl.o(0)[1])}" x2="${r(sw[0] + 30)}" y2="${r(sw[1])}" stroke="#1773D6" stroke-width="1.4" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
          <rect x="${r(so[0] + 36)}" y="${r(so[1] - 8)}" width="80" height="15" rx="3" fill="#FFFFFF" stroke="#1773D6" stroke-width=".8"/>
          <text x="${r(so[0] + 76)}" y="${r(so[1] + 3)}" text-anchor="middle">↕ Yeng: ${s.sleeve}sm</text>
        </g>
        <g>
          <rect x="${r(sw[0] + 36)}" y="${r(sw[1] + 4)}" width="84" height="15" rx="3" fill="#FFFFFF" stroke="#1773D6" stroke-width=".8"/>
          <text x="${r(sw[0] + 78)}" y="${r(sw[1] + 15)}" text-anchor="middle">○ Bilak: ${s.wrist}sm</text>
        </g>
        <g>
          <rect x="${r(cx - st[2].c - st[2].hw - 96)}" y="${r(st[2].y - 8)}" width="84" height="15" rx="3" fill="#FFFFFF" stroke="#1773D6" stroke-width=".8"/>
          <text x="${r(cx - st[2].c - st[2].hw - 54)}" y="${r(st[2].y + 3)}" text-anchor="middle">○ Tizza: ${s.knee}sm</text>
        </g>
        <g>
          <line x1="${r(cx + lg.c + lg.hw + 26)}" y1="${r(waistY)}" x2="${r(cx + st[4].c + st[4].hw + 26)}" y2="${r(trHem)}" stroke="#1773D6" stroke-width="1.4" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
          <rect x="${r(cx + lg.c + lg.hw + 32)}" y="${r((crotchY + trHem) / 2 + 40)}" width="80" height="15" rx="3" fill="#FFFFFF" stroke="#1773D6" stroke-width=".8"/>
          <text x="${r(cx + lg.c + lg.hw + 72)}" y="${r((crotchY + trHem) / 2 + 51)}" text-anchor="middle">↕ Shim: ${s.trouserLen}sm</text>
        </g>
        <g>
          <line x1="28" y1="${r(headTop)}" x2="28" y2="${floor}" stroke="#047857" stroke-width="1.4" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
          <line x1="22" y1="${r(headTop)}" x2="34" y2="${r(headTop)}" stroke="#047857" stroke-width="1.4"/>
          <line x1="22" y1="${floor}" x2="34" y2="${floor}" stroke="#047857" stroke-width="1.4"/>
          <rect x="10" y="${r((headTop + floor) / 2 - 9)}" width="90" height="18" rx="3" fill="#FFFFFF" stroke="#047857" stroke-width="1"/>
          <text x="55" y="${r((headTop + floor) / 2 + 4)}" text-anchor="middle" fill="#047857">↕ Bo'y: ${s.height}sm</text>
        </g>
      </g>`;
  }

  svg.innerHTML = g;
}

// ==========================================================================
// MATO TANLASH (rang paneli)
// ==========================================================================
function cadSwatchStyle(fb) {
  if (fb.weave === 'camo') {
    const p = fb.palette;
    return `background:linear-gradient(135deg, ${p[0]} 0 32%, ${p[2]} 32% 52%, ${p[1]} 52% 74%, ${p[3]} 74%)`;
  }
  return `background:${fb.color}`;
}

function buildFabricSwatches() {
  const box = document.getElementById('cadFabricSwatches');
  if (!box) return;
  box.innerHTML = CAD_FABRICS.map(fb =>
    `<button type="button" class="cad-swatch${fb.id === cadState.fabric ? ' is-active' : ''}" style="${cadSwatchStyle(fb)}" title="${fb.name} — ${fb.tone}" aria-label="${fb.name}, ${fb.tone}" aria-pressed="${fb.id === cadState.fabric}" onclick="selectFabric('${fb.id}')"></button>`
  ).join('');
  const nameEl = document.getElementById('cadFabricName');
  if (nameEl) {
    const fb = cadFabric(cadState.fabric);
    nameEl.textContent = `${fb.name} · ${fb.tone}`;
  }
}

function selectFabric(id) {
  cadState.fabric = id;
  buildFabricSwatches();
  updateTailorCad();
}

function onUniformTypeChange() {
  const uniEl = document.getElementById('tUniformType');
  if (uniEl) cadState.uniformType = uniEl.value;
  cadState.fabric = CAD_DEFAULT_FABRIC[cadState.uniformType] || 'ripstop_navy';
  buildFabricSwatches();
  updateTailorCad();
}

buildFabricSwatches();
