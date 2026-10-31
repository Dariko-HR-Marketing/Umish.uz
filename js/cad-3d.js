// ==========================================================================
// 3D PARAMETRIK MANEKEN VA FORMA (three.js, kerak bo'lganda yuklanadi)
// Maneken tanasi va kiyim o'lchamlardan (sm) qurilgan: bo'y, yelka, ko'krak, bel, son,
// yeng, bilak, shim, tizza va boshqalar o'zgarsa, forma shakli ham o'zgaradi.
// ==========================================================================
import * as THREE from './vendor/three.module.min.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const host = document.getElementById('cad3dHost');
const canvasBox = host.querySelector('.cad3d-canvas');
const overlay = host.querySelector('svg.cad3d-guides');

// ---------------------------------------------------------------- sahna
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
canvasBox.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;

const camera = new THREE.PerspectiveCamera(26, 1, 20, 2000);
const TARGET = new THREE.Vector3(0, 98, 0);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(TARGET);
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.09;
controls.minDistance = 170;
controls.maxDistance = 520;
controls.minPolarAngle = 0.55;
controls.maxPolarAngle = Math.PI / 2 + 0.12;

const key = new THREE.DirectionalLight(0xffffff, 2.1);
key.position.set(90, 300, 250);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -150, right: 150, top: 260, bottom: -40, near: 50, far: 800 });
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.6;
scene.add(key);
const fill = new THREE.DirectionalLight(0xdfeaff, 0.7);
fill.position.set(-220, 140, 120);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 0.8);
rim.position.set(-60, 180, -260);
scene.add(rim);

const floor = new THREE.Mesh(new THREE.CircleGeometry(400, 64), new THREE.ShadowMaterial({ opacity: 0.2 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.05;
floor.receiveShadow = true;
scene.add(floor);

let figure = null;           // joriy maneken+forma guruhi
let anchors = [];            // o'lchov belgilari uchun 3D nuqtalar
let needBuild = true, needRender = true, anim = null;

// ------------------------------------------------------------ yordamchilar
const catmull = (p0, p1, p2, p3, t) => 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
const SQ = k => Math.sqrt((1 + k * k) / 2);
// aylana uzunligi (C) va chuqurlik nisbati (k) bo'yicha ellips yarim o'qlari
const ell = (C, k) => { const rx = C / (2 * Math.PI) / SQ(k); return [rx, rx * k]; };

function sampleSections(secs, n) {
  const m = secs.length - 1, out = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1) * m, k = Math.min(m - 1, Math.floor(t)), f = t - k, r = {};
    for (const ch of ['y', 'rx', 'rz', 'cx', 'cz']) {
      const a = secs.map(s => s[ch] || 0);
      r[ch] = catmull(a[Math.max(0, k - 1)], a[k], a[k + 1], a[Math.min(m, k + 2)], f);
    }
    out.push(r);
  }
  return out;
}

function loftGeometry(rings, seg = 56, caps = false) {
  const pos = [], uv = [], idx = [];
  const yTop = rings[0].y, yBot = rings[rings.length - 1].y;
  rings.forEach(r => {
    const v = (r.y - yBot) / ((yTop - yBot) || 1);
    for (let i = 0; i <= seg; i++) {
      const u = i / seg, a = 2 * Math.PI * (u - 0.5);
      pos.push(r.cx + r.rx * Math.sin(a), r.y, r.cz + r.rz * Math.cos(a));
      uv.push(u, v);
    }
  });
  const W = seg + 1;
  for (let j = 0; j < rings.length - 1; j++) {
    for (let i = 0; i < seg; i++) {
      const a = j * W + i, b = a + W;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  if (caps) {
    [[0, false], [rings.length - 1, true]].forEach(([j, bottom]) => {
      const r = rings[j], c = pos.length / 3;
      pos.push(r.cx, r.y, r.cz); uv.push(0.5, bottom ? 0 : 1);
      for (let i = 0; i < seg; i++) {
        const a = j * W + i;
        bottom ? idx.push(c, a + 1, a) : idx.push(c, a, a + 1);
      }
    });
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  // chok joyidagi (orqa) normallarni tenglashtirish
  const n = g.attributes.normal;
  for (let j = 0; j < rings.length; j++) {
    const a = j * W, b = a + seg;
    const x = n.getX(a) + n.getX(b), y = n.getY(a) + n.getY(b), z = n.getZ(a) + n.getZ(b), l = Math.hypot(x, y, z) || 1;
    n.setXYZ(a, x / l, y / l, z / l); n.setXYZ(b, x / l, y / l, z / l);
  }
  return g;
}

// ------------------------------------------------------------ mato teksturasi
const tileCache = {};
function rngMaker(seed) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }

function weaveTile(f) {
  if (tileCache[f.id]) return tileCache[f.id];
  const size = f.weave === 'camo' ? 512 : 64;
  const col = document.createElement('canvas'), bmp = document.createElement('canvas');
  col.width = col.height = bmp.width = bmp.height = size;
  const c = col.getContext('2d'), b = bmp.getContext('2d'), rnd = rngMaker(11);
  const dk = cadShade(f.color, -0.3), lt = cadShade(f.color, 0.25);
  b.fillStyle = '#808080'; b.fillRect(0, 0, size, size);
  if (f.weave === 'camo') {
    c.fillStyle = f.palette[0]; c.fillRect(0, 0, size, size);
    for (let i = 0; i < 90; i++) {
      const w = (1 + Math.floor(rnd() * 4)) * 16, h = (1 + Math.floor(rnd() * 3)) * 16;
      c.fillStyle = f.palette[1 + Math.floor(rnd() * 3)];
      c.fillRect(Math.floor(rnd() * 32) * 16, Math.floor(rnd() * 32) * 16, w, h);
    }
  } else {
    c.fillStyle = f.color; c.fillRect(0, 0, size, size);
  }
  // to'qima (ip) chiziqlari
  const step = f.weave === 'ripstop' ? 8 : 4;
  for (let i = 0; i < size; i += step) {
    if (f.weave === 'ripstop') {
      c.fillStyle = 'rgba(255,255,255,.10)'; c.fillRect(i, 0, 1, size); c.fillRect(0, i, size, 1);
      b.fillStyle = 'rgba(255,255,255,.35)'; b.fillRect(i, 0, 1, size); b.fillRect(0, i, size, 1);
    }
  }
  for (let y = 0; y < size; y += 2) for (let x = 0; x < size; x += 2) {
    const v = rnd();
    if (f.weave === 'twill' || f.weave === 'wool') {
      const d = ((x + y) >> 2) & 1;
      c.fillStyle = d ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.05)'; c.fillRect(x, y, 2, 2);
      b.fillStyle = d ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.2)'; b.fillRect(x, y, 2, 2);
    }
    if (v > 0.55) { c.fillStyle = v > 0.8 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; c.fillRect(x, y, 2, 2); }
    b.fillStyle = `rgba(${v > 0.5 ? 255 : 0},${v > 0.5 ? 255 : 0},${v > 0.5 ? 255 : 0},.10)`; b.fillRect(x, y, 2, 2);
  }
  return (tileCache[f.id] = { col, bmp });
}

function makeCanvases(W, H, fabric) {
  const tile = weaveTile(fabric);
  const col = document.createElement('canvas'), bmp = document.createElement('canvas');
  col.width = bmp.width = W; col.height = bmp.height = H;
  const c = col.getContext('2d'), b = bmp.getContext('2d');
  c.fillStyle = c.createPattern(tile.col, 'repeat'); c.fillRect(0, 0, W, H);
  b.fillStyle = b.createPattern(tile.bmp, 'repeat'); b.fillRect(0, 0, W, H);
  return { col, bmp, c, b };
}

function toTexture(cv, srgb) {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

function fabricMaterial(cv, fabric, mirror) {
  let map = toTexture(cv.col, true), bump = toTexture(cv.bmp, false);
  if (mirror) {
    map = map.clone(); bump = bump.clone();
    [map, bump].forEach(t => { t.repeat.x = -1; t.offset.x = 1; t.needsUpdate = true; });
  }
  const wool = fabric.weave === 'wool';
  return new THREE.MeshPhysicalMaterial({
    map, bumpMap: bump, bumpScale: 1.6, roughness: wool ? 0.92 : 0.8, metalness: 0,
    sheen: 0.6, sheenRoughness: 0.55, sheenColor: new THREE.Color(cadShade(fabric.color, 0.35)),
    side: THREE.DoubleSide
  });
}

// ----------------------------------------------- tekstura ustiga chizish yordamchilari
function mapper(rings, W, Hpx) {
  const yTop = rings[0].y, yBot = rings[rings.length - 1].y;
  const at = y => {
    for (let j = 0; j < rings.length - 1; j++) {
      if (y <= rings[j].y && y >= rings[j + 1].y) {
        const t = (rings[j].y - y) / ((rings[j].y - rings[j + 1].y) || 1);
        return { rx: rings[j].rx + (rings[j + 1].rx - rings[j].rx) * t, rz: rings[j].rz + (rings[j + 1].rz - rings[j].rz) * t };
      }
    }
    return y > yTop ? rings[0] : rings[rings.length - 1];
  };
  return {
    at,
    px: (x, y) => { const r = at(y); return (0.5 + Math.asin(Math.max(-1, Math.min(1, x / r.rx))) / (2 * Math.PI)) * W; },
    py: y => (yTop - y) / ((yTop - yBot) || 1) * Hpx,
    W, H: Hpx
  };
}

function poly(ctx, m, pts, fill, stroke, lw = 2) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => { const X = m.px(x, y), Y = m.py(y); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function line(ctx, m, pts, stroke, lw = 1.4, dash) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => { const X = m.px(x, y), Y = m.py(y); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
  ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
}
function band(ctx, m, y0, y1, fill) { ctx.fillStyle = fill; ctx.fillRect(0, m.py(y0), m.W, m.py(y1) - m.py(y0)); }
function dot(ctx, m, x, y, r, fill) { ctx.beginPath(); ctx.arc(m.px(x, y), m.py(y), r, 0, 7); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 1; ctx.stroke(); }

// rasm ikkala kanalga: rang (c) va relyef (b)
function pocket(cv, m, x0, y0, w, h, flapH, opt) {
  const { c, b } = cv, base = opt.base;
  const quad = [[x0, y0], [x0 + w, y0], [x0 + w, y0 - h], [x0, y0 - h]];
  poly(c, m, quad, 'rgba(0,0,0,.10)', opt.outline, 2.2);
  poly(b, m, quad, null, '#303030', 4);
  const flap = flapH > 0 ? [[x0, y0], [x0 + w, y0], [x0 + w, y0 - flapH], [x0 + w / 2, y0 - flapH - (opt.point ? 2 : 0)], [x0, y0 - flapH]] : null;
  if (flap) {
    poly(c, m, flap, cadShade(base, -0.12), opt.outline, 2.2);
    poly(b, m, flap, '#9a9a9a', '#e0e0e0', 3);
    dot(c, m, x0 + w / 2, y0 - flapH + 0.3, 5, opt.metal);
  }
  line(c, m, [[x0 + 0.7, y0 - h + 1], [x0 + w - 0.7, y0 - h + 1]], opt.stitch, 1.3, [5, 4]);
}

// ============================================================ qurilish
const RANK_STARS = (name) => (typeof CAD_RANKS !== 'undefined' && CAD_RANKS[name]) || { bars: 0, gap: 0, stars: 0 };

function build() {
  const s = cadState, H = s.height, type = s.uniformType, fabric = cadFabric(s.fabric);
  const base = fabric.color, outline = cadShade(base, -0.55);
  const stitch = cadLum(base) > 0.55 ? cadShade(base, -0.28) : cadShade(base, 0.38);
  const gold = type === 'iiv_patrol' || type === 'ofis_kostyum' ? '#D4AF37' : type === 'harbiy_dala' ? '#3a3f34' : '#c7ccd3';
  const military = type === 'iiv_patrol' || type === 'harbiy_dala';
  const Y = f => f * H;
  const g = new THREE.Group();
  anchors = [];

  const matMq = new THREE.MeshStandardMaterial({ color: 0xc6cbd2, roughness: 0.42, metalness: 0.0 });
  const add = (mesh, parent = g, shadow = true) => { mesh.castShadow = shadow; mesh.receiveShadow = true; parent.add(mesh); return mesh; };

  // ---------- o'lchamlar
  const chest = s.chest, waist = s.waist, hips = s.hips, sh = s.shoulder / 2;
  const shY = Y(0.818), neckB = Y(0.838), pitY = Y(0.725), waistY = Y(0.618), hipY = Y(0.53), crotchY = Y(0.478);
  const [bChX, bChZ] = ell(chest, 0.74), [bWaX, bWaZ] = ell(waist, 0.78), [bHiX, bHiZ] = ell(hips, 0.80);
  const legOff = bHiX * 0.50;

  // ---------- maneken tanasi
  const nB = s.neck - 3;
  const torsoSecs = [
    { y: Y(0.872), ...(([rx, rz]) => ({ rx, rz }))(ell(nB, 1.05)) },
    { y: Y(0.848), ...(([rx, rz]) => ({ rx, rz }))(ell(nB + 5, 1.0)) },
    { y: Y(0.832), rx: sh * 0.58, rz: 6.2 },
    { y: Y(0.816), rx: sh - 1.6, rz: 7.2 },
    { y: Y(0.775), rx: (sh - 1.6 + bChX) / 2 + 1, rz: (bChZ + 7.4) / 2 },
    { y: pitY, rx: bChX, rz: bChZ },
    { y: Y(0.672), rx: bChX * 0.985, rz: bChZ * 0.98 },
    { y: waistY, rx: bWaX, rz: bWaZ },
    { y: Y(0.572), rx: (bWaX + bHiX) / 2, rz: (bWaZ + bHiZ) / 2 },
    { y: hipY, rx: bHiX, rz: bHiZ },
    { y: crotchY + 2, rx: bHiX * 0.97, rz: bHiZ * 0.97 }
  ];
  add(new THREE.Mesh(loftGeometry(sampleSections(torsoSecs, 56), 56, true), matMq));

  // bosh (yuzsiz maneken boshi)
  const hs = s.head / 58, hr = [7.7 * hs, 11.6 * hs, 9.4 * hs];
  const headGeo = new THREE.SphereGeometry(1, 48, 32);
  const hp = headGeo.attributes.position;
  for (let i = 0; i < hp.count; i++) {
    const y = hp.getY(i);
    const taper = y < 0 ? 1 + 0.26 * y : 1;           // iyak tomon torayadi
    hp.setX(i, hp.getX(i) * taper); hp.setZ(i, hp.getZ(i) * (y < -0.4 ? taper : 1) + 0.04);
  }
  headGeo.computeVertexNormals();
  const head = add(new THREE.Mesh(headGeo, matMq));
  head.scale.set(...hr);
  const headCY = H - hr[1] + 0.2;
  head.position.set(0, headCY, 0.8);

  // oyoqlar (maneken)
  const legSecs = (c0, k0) => [
    { y: crotchY + 4, C: s.thigh * 1.03 }, { y: Y(0.40), C: s.thigh * 0.95 }, { y: Y(0.285), C: s.knee - 2 },
    { y: Y(0.17), C: (s.knee - 2) * 0.9 }, { y: Y(0.045), C: 23 }
  ];
  [-1, 1].forEach(sg => {
    const secs = legSecs().map((q, i, a) => {
      const t = i / (a.length - 1), [rx, rz] = ell(q.C, 1.0);
      return { y: q.y, rx, rz, cx: sg * (legOff * (1 - 0.1 * t)), cz: 0 };
    });
    add(new THREE.Mesh(loftGeometry(sampleSections(secs, 36), 32, true), matMq));
  });

  // qo'llar (maneken) — yeng bilan bir o'qda
  const th = 0.12, armL = s.sleeve + 2;
  const armFrame = sg => {
    const grp = new THREE.Group();
    grp.position.set(sg * (sh - 5.5), Y(0.80), 0);
    grp.rotation.z = sg * th;                    // tashqariga biroz og'ma
    grp.rotation.x = -0.05;
    g.add(grp);
    return grp;
  };
  const armGroups = {};
  [-1, 1].forEach(sg => {
    const grp = armFrame(sg); armGroups[sg] = grp;
    const wristC = Math.max(s.wrist, 13);
    const defs = [[0, chest * 0.31, 1.0], [armL * 0.18, chest * 0.30, 1.0], [armL * 0.5, chest * 0.255, 0.96], [armL * 0.82, wristC * 1.45, 0.9], [armL, wristC, 0.85]];
    const secs = defs.map(([t, C, k]) => { const [rx, rz] = ell(C, k); return { y: -t, rx, rz }; });
    add(new THREE.Mesh(loftGeometry(sampleSections(secs, 30), 28, true), matMq), grp);
    // kaft
    const hand = add(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), matMq), grp);
    hand.scale.set(3.9, 9.2, 1.9); hand.position.set(0, -armL - 8.5, 0.4);
    const thumb = add(new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), matMq), grp);
    thumb.scale.set(1.3, 4.2, 1.2); thumb.position.set(-sg * 3.6, -armL - 4.5, 1.4); thumb.rotation.z = sg * 0.35;
  });

  // maneken tagligi
  add(new THREE.Mesh(new THREE.BoxGeometry(46, 1.4, 34), new THREE.MeshStandardMaterial({ color: 0xaeb3ba, roughness: 0.5, metalness: 0.35 })), g).position.set(0, -0.7, 2);

  // ---------- poyabzal (maneken oyoqlarida)
  const shoeCol = type === 'tibbiyot_xalat' ? 0xf2f4f6 : type === 'ofis_kostyum' ? 0x17120f : type === 'sanoat_pro' ? 0x4a3426 : 0x0f1012;
  const shoeMat = new THREE.MeshPhysicalMaterial({ color: shoeCol, roughness: 0.36, metalness: 0.05, clearcoat: 0.5, clearcoatRoughness: 0.35 });
  const sole = new THREE.MeshStandardMaterial({ color: 0x08080a, roughness: 0.8 });
  const boot = type === 'iiv_patrol' || type === 'harbiy_dala' || type === 'sanoat_pro';
  [-1, 1].forEach(sg => {
    const gr = new THREE.Group();
    gr.position.set(sg * legOff * 0.9, 0, 3.5); gr.rotation.y = -sg * 0.13;
    const up = add(new THREE.Mesh(new THREE.CapsuleGeometry(4.9, 16.5, 10, 18), shoeMat), gr);
    up.rotation.x = Math.PI / 2; up.scale.set(1, 1, 0.78); up.position.set(0, 5.4, 3.5);
    add(new THREE.Mesh(new THREE.BoxGeometry(10.6, 1.8, 27), sole), gr).position.set(0, 0.9, 3.2);
    if (boot) add(new THREE.Mesh(new THREE.CylinderGeometry(5.1, 5.6, 14, 24), shoeMat), gr).position.set(0, 12, -1.8);
    else add(new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 8, 20), shoeMat), gr).position.set(0, 9, -1.8);
    g.add(gr);
  });

  // ================== KIYIM ==================
  const trHem = Math.max(waistY - s.trouserLen, 3);
  const jacketHem = Math.max(neckB - s.jacketLen, trHem + 22);
  const easeC = type === 'sanoat_pro' ? 15 : type === 'tibbiyot_xalat' ? 13 : type === 'ofis_kostyum' ? 8 : 10;

  // --- shim
  {
    const W = 512, Hh = 1024;
    const tw = s.trouserWaist, hemC = s.trouserBottom;
    const pelvis = [
      { y: waistY + 3, ...(([rx, rz]) => ({ rx, rz }))(ell(tw + 2, 0.80)) },
      { y: Y(0.575), ...(([rx, rz]) => ({ rx, rz }))(ell((tw + hips + 8) / 2, 0.82)) },
      { y: hipY, ...(([rx, rz]) => ({ rx, rz }))(ell(hips + 8, 0.82)) },
      { y: crotchY + 1, ...(([rx, rz]) => ({ rx, rz }))(ell(hips + 7, 0.84)) },
      { y: crotchY - 7, ...(([rx, rz]) => ({ rx, rz }))(ell(hips + 3, 0.86)) }
    ];
    const pcv = makeCanvases(512, 512, fabric);
    const pMat = fabricMaterial(pcv, fabric);
    add(new THREE.Mesh(loftGeometry(sampleSections(pelvis, 30), 48, false), pMat));

    const legTop = crotchY - 4;
    const secs = [
      { y: legTop, C: s.thigh + 11, c: 1 }, { y: Y(0.40), C: s.thigh + 9, c: 0.97 }, { y: Y(0.285), C: s.knee + 8, c: 0.93 },
      { y: Y(0.17), C: s.knee + 6, c: 0.91 }, { y: trHem, C: hemC + 2, c: 0.9 }
    ].map(q => { const [rx, rz] = ell(q.C, 0.96); return { y: q.y, rx, rz, cx: 0, cz: 0, c: q.c }; });
    const rings0 = sampleSections(secs, 40);
    const m = mapper(rings0, W, Hh);
    const cv = makeCanvases(W, Hh, fabric);
    const opt = { base, outline, stitch, metal: gold };
    // oyoq o'rta burmasi / sovuq shim chizig'i
    if (type === 'ofis_kostyum') {
      line(cv.c, m, [[0, legTop - 2], [0, trHem]], 'rgba(0,0,0,.28)', 3);
      line(cv.b, m, [[0, legTop - 2], [0, trHem]], '#e8e8e8', 3);
    }
    // yon chok (tashqi tomon: x>0 -> u=.75)
    line(cv.c, m, [[rings0[0].rx, legTop], [rings0[rings0.length - 1].rx, trHem]], stitch, 1.2, [6, 4]);
    // kargo cho'ntak (tashqi tomon)
    if (military || type === 'sanoat_pro') {
      const py = Y(0.40) + 8, pr = m.at(py).rx;
      pocket(cv, m, pr * 0.30, py, pr * 0.62, 18, 6.5, { ...opt, point: true });
    }
    // etak manjeti
    band(cv.c, m, trHem + 3.2, trHem + 3.9, 'rgba(0,0,0,.35)'); band(cv.b, m, trHem + 3.2, trHem + 4.6, '#303030');
    // aks etuvchi tasma (sanoat)
    if (type === 'sanoat_pro') {
      const y1 = trHem + 26;
      band(cv.c, m, y1, y1 + 5.5, '#d7dbe0'); band(cv.c, m, y1 + 1.8, y1 + 2.2, '#7b828c'); band(cv.c, m, y1 + 3.6, y1 + 4.0, '#7b828c');
      band(cv.b, m, y1, y1 + 5.5, '#b0b0b0');
    }
    const legMatR = fabricMaterial(cv, fabric, false), legMatL = fabricMaterial(cv, fabric, true);
    [-1, 1].forEach(sg => {
      const rs = rings0.map((r, i) => { const t = i / (rings0.length - 1); return { ...r, cx: sg * legOff * (1 - 0.1 * t) * 1.02 }; });
      add(new THREE.Mesh(loftGeometry(rs, 40, false), sg > 0 ? legMatR : legMatL));
    });
    anchors.push({ id: 'knee', p: new THREE.Vector3(-(legOff * 0.94 + rings0[2].rx), Y(0.285), 0), side: 'L', text: `Tizza ${s.knee} sm` });
    anchors.push({ id: 'trouser', p: new THREE.Vector3(legOff * 0.9 + rings0[4].rx, (trHem + Y(0.3)) / 2, 0), side: 'R', text: `Shim ${s.trouserLen} sm` });
  }

  // --- kurtka / xalat
  {
    const W = 1024, Hh = 1024;
    const [cjx, cjz] = ell(chest + easeC, 0.77), [wjx, wjz] = ell(waist + easeC + 2, 0.80), [hjx, hjz] = ell(hips + easeC + 2, 0.83);
    const flare = type === 'tibbiyot_xalat' ? 8 : 3;
    const [hmx, hmz] = ell(hips + easeC + flare, 0.85);
    const standing = type === 'sanoat_pro' ? 5 : 3;
    const secs = [
      { y: Y(0.857), ...(([rx, rz]) => ({ rx, rz }))(ell(s.neck + standing, 1.0)) },
      { y: Y(0.842), ...(([rx, rz]) => ({ rx, rz }))(ell(s.neck + 8, 1.0)) },
      { y: Y(0.829), rx: sh * 0.56 + 2, rz: 7.6 },
      { y: Y(0.815), rx: sh + 0.7, rz: 8.4 },
      { y: Y(0.775), rx: (sh + cjx) / 2 + 0.5, rz: (cjz + 8.4) / 2 },
      { y: pitY, rx: cjx, rz: cjz },
      { y: waistY, rx: wjx, rz: wjz },
      { y: hipY, rx: hjx, rz: hjz },
      { y: jacketHem, rx: hmx, rz: hmz }
    ];
    const rings = sampleSections(secs, 56);
    const m = mapper(rings, W, Hh);
    const cv = makeCanvases(W, Hh, fabric);
    const opt = { base, outline, stitch, metal: gold };
    const { c, b } = cv, rk = RANK_STARS(s.rank);
    const cX = cjx, hemI = jacketHem;

    // yelka ustidagi chok va qo'ltiq chizig'i
    // old/orqa umumiy: o'rta chok
    if (military) {
      const shirt = type === 'iiv_patrol' ? '#A9BCD3' : '#6B7355', nR = s.neck / 6.283 * 0.95;
      const vBot = neckB - 21;
      poly(c, m, [[-nR - 1, neckB + 1], [nR + 1, neckB + 1], [0, vBot]], shirt, 'rgba(0,0,0,.45)', 2);
      poly(c, m, [[-nR - 1, neckB + 1], [-nR - 12, neckB - 8], [-2, vBot - 2]], cadShade(base, -0.12), outline, 2.2);
      poly(c, m, [[nR + 1, neckB + 1], [nR + 12, neckB - 8], [2, vBot - 2]], cadShade(base, -0.12), outline, 2.2);
      poly(b, m, [[-nR - 1, neckB + 1], [-nR - 12, neckB - 8], [-2, vBot - 2]], null, '#d0d0d0', 3);
      poly(b, m, [[nR + 1, neckB + 1], [nR + 12, neckB - 8], [2, vBot - 2]], null, '#d0d0d0', 3);
      line(c, m, [[0, vBot], [0, hemI]], outline, 2.2);
      line(c, m, [[-2.8, vBot - 2], [-2.8, hemI]], stitch, 1.2, [6, 4]); line(c, m, [[2.8, vBot - 2], [2.8, hemI]], stitch, 1.2, [6, 4]);
      for (let i = 0; i < 5; i++) { const y = vBot - 8 - i * ((vBot - hemI - 14) / 4); if (Math.abs(y - waistY) > 6) dot(c, m, 0, y, 6, gold); }
      // ko'krak cho'ntaklari
      const cpY = pitY + 1;
      [[-cX * 0.88, 1], [cX * 0.88 - 13.5, 1]].forEach(([x0]) => pocket(cv, m, x0, cpY, 13.5, 15, 6, { ...opt, point: true }));
      // qon guruhi va UMISH yozuvi
      const bx = -cX * 0.84, ty = cpY + 6.8, blood = s.bloodGroup.split(' ')[0];
      poly(c, m, [[bx, ty], [bx + 12, ty], [bx + 12, ty - 4.2], [bx, ty - 4.2]], '#B91C1C', 'rgba(0,0,0,.5)', 1.5);
      poly(c, m, [[cX * 0.84 - 12, ty], [cX * 0.84, ty], [cX * 0.84, ty - 4.2], [cX * 0.84 - 12, ty - 4.2]], '#1773D6', 'rgba(0,0,0,.5)', 1.5);
      c.fillStyle = '#fff'; c.font = 'bold 14px monospace'; c.textAlign = 'center';
      c.fillText(blood, m.px(bx + 6, ty), m.py(ty - 3.4)); c.fillText('UMISH', m.px(cX * 0.84 - 6, ty), m.py(ty - 3.4));
      // pastki cho'ntaklar
      const lpY = hemI + 27;
      [[-hjx * 0.86, 1], [hjx * 0.86 - 15, 1]].forEach(([x0]) => pocket(cv, m, x0, lpY, 15, 21, 6, opt));
      // kamar
      band(c, m, waistY - 3.2, waistY + 3.2, '#121316'); band(c, m, waistY - 2.2, waistY - 1.6, 'rgba(255,255,255,.18)');
      poly(c, m, [[-3.6, waistY + 3.8], [3.6, waistY + 3.8], [3.6, waistY - 3.8], [-3.6, waistY - 3.8]], gold, '#7a5d10', 2);
      poly(c, m, [[-1.8, waistY + 1.8], [1.8, waistY + 1.8], [1.8, waistY - 1.8], [-1.8, waistY - 1.8]], '#1b1608');
      band(b, m, waistY - 3.2, waistY + 3.2, '#bdbdbd');
    }
    if (type === 'sanoat_pro') {
      // kontrast yoka
      poly(c, m, [[-sh - 1, Y(0.829)], [sh + 1, Y(0.829)], [sh * 0.7, pitY + 4], [0, pitY - 3], [-sh * 0.7, pitY + 4]], 'rgba(0,0,0,.22)', outline, 2);
      line(c, m, [[0, neckB + 2], [0, hemI]], '#c7ccd3', 4, [2, 2]); line(c, m, [[0, neckB + 2], [0, hemI]], 'rgba(0,0,0,.55)', 1);
      [[-cX * 0.86, 1], [cX * 0.86 - 12, 1]].forEach(([x0]) => {
        poly(c, m, [[x0, pitY], [x0 + 12, pitY], [x0 + 12, pitY - 9], [x0, pitY - 9]], 'rgba(0,0,0,.10)', outline, 2);
        line(c, m, [[x0 + 1.5, pitY - 1.8], [x0 + 10.5, pitY - 1.8]], '#c7ccd3', 3, [2, 2]);
      });
      [hemI + 17, waistY + 6].forEach(y => {
        band(c, m, y, y + 5.5, '#d7dbe0'); band(c, m, y + 1.8, y + 2.2, '#7b828c'); band(c, m, y + 3.6, y + 4.0, '#7b828c'); band(b, m, y, y + 5.5, '#b0b0b0');
      });
      c.fillStyle = 'rgba(235,238,242,.95)'; c.font = 'bold 54px Arial'; c.textAlign = 'center';
      c.fillText('UMISH', 0, m.py(pitY - 6)); c.fillText('UMISH', W, m.py(pitY - 6));
    }
    if (type === 'ofis_kostyum') {
      const nR = s.neck / 6.283, vBot = neckB - 27, tie = cadLum(base) > 0.4 ? '#1D3557' : '#7B1E2B';
      poly(c, m, [[-nR - 1, neckB + 1], [nR + 1, neckB + 1], [0, vBot]], '#F4F6F8', 'rgba(0,0,0,.35)', 2);
      poly(c, m, [[-3, neckB], [3, neckB], [2.2, neckB - 5], [-2.2, neckB - 5]], tie);
      poly(c, m, [[-2.4, neckB - 5], [2.4, neckB - 5], [3.8, vBot - 4], [0, vBot - 7], [-3.8, vBot - 4]], tie);
      poly(c, m, [[-nR - 1, neckB + 1], [-3, neckB - 3], [-nR - 6, neckB - 3]], '#fff', 'rgba(0,0,0,.3)', 1.5);
      poly(c, m, [[nR + 1, neckB + 1], [3, neckB - 3], [nR + 6, neckB - 3]], '#fff', 'rgba(0,0,0,.3)', 1.5);
      poly(c, m, [[-nR - 2, neckB + 2], [-nR - 13, neckB - 7], [-nR - 10, neckB - 11], [-14, neckB - 24], [0, vBot - 2], [-1, vBot + 2], [-5, neckB - 10]], cadShade(base, 0.05), outline, 2.2);
      poly(c, m, [[nR + 2, neckB + 2], [nR + 13, neckB - 7], [nR + 10, neckB - 11], [14, neckB - 24], [0, vBot - 2], [1, vBot + 2], [5, neckB - 10]], cadShade(base, 0.05), outline, 2.2);
      line(c, m, [[0, vBot - 2], [0, hemI]], outline, 2.2);
      dot(c, m, 0, vBot - 6, 6, '#2a2a2a'); dot(c, m, 0, vBot - 22, 6, '#2a2a2a');
      line(c, m, [[-cX * 0.86, pitY - 2], [-cX * 0.86 + 12, pitY - 1]], outline, 3.5);
      poly(c, m, [[-cX * 0.86 + 2, pitY - 2], [-cX * 0.86 + 5, pitY + 1.4], [-cX * 0.86 + 8, pitY - 1.4]], '#fff', 'rgba(0,0,0,.3)', 1);
      [[-hjx * 0.86, 1], [hjx * 0.86 - 15, 1]].forEach(([x0]) => {
        poly(c, m, [[x0, hemI + 25], [x0 + 15, hemI + 25], [x0 + 15, hemI + 22.5], [x0, hemI + 22.5]], 'rgba(0,0,0,.5)', outline, 1.5);
        poly(c, m, [[x0 - 0.5, hemI + 28], [x0 + 15.5, hemI + 28], [x0 + 15.5, hemI + 24.5], [x0 - 0.5, hemI + 24.5]], cadShade(base, -0.08), outline, 1.5);
      });
    }
    if (type === 'tibbiyot_xalat') {
      const nR = s.neck / 6.283, vBot = neckB - 24;
      poly(c, m, [[-nR - 1, neckB + 1], [nR + 1, neckB + 1], [0, vBot]], '#2E8B83', 'rgba(0,0,0,.3)', 2);
      poly(c, m, [[-nR - 1, neckB + 1], [-nR - 11, neckB - 6], [-3, vBot - 2], [0, vBot - 1]], cadShade(base, -0.04), outline, 2);
      poly(c, m, [[nR + 1, neckB + 1], [nR + 11, neckB - 6], [3, vBot - 2], [0, vBot - 1]], cadShade(base, -0.04), outline, 2);
      line(c, m, [[0, vBot - 1], [0, hemI]], outline, 2);
      for (let i = 0; i < 5; i++) dot(c, m, 0, vBot - 8 - i * ((vBot - hemI - 16) / 4), 6, '#b6bec8');
      pocket(cv, m, -cX * 0.88, pitY + 2, 13, 14, 0, opt);
      line(c, m, [[-cX * 0.88 + 4, pitY + 8], [-cX * 0.88 + 4, pitY + 2]], '#1D4ED8', 3); line(c, m, [[-cX * 0.88 + 7.5, pitY + 7], [-cX * 0.88 + 7.5, pitY + 2]], '#DC2626', 3);
      poly(c, m, [[cX * 0.8 - 11, pitY + 2], [cX * 0.8, pitY + 2], [cX * 0.8, pitY - 3], [cX * 0.8 - 11, pitY - 3]], '#fff', '#6B7280', 1.5);
      [[-hjx * 0.84, 1], [hjx * 0.84 - 16, 1]].forEach(([x0]) => pocket(cv, m, x0, hemI + 40, 16, 22, 0, opt));
    }
    // orqa tomon tafsilotlari (u = 0 / 1 chegarasi)
    line(c, m, [[0, neckB], [0, hemI]], outline, 2, [10, 5]);
    c.beginPath(); c.moveTo(0, m.py(neckB)); c.lineTo(0, m.py(hemI)); c.strokeStyle = outline; c.lineWidth = 3; c.stroke();
    if (type !== 'tibbiyot_xalat') {
      c.beginPath(); c.strokeStyle = stitch; c.lineWidth = 1.3; c.setLineDash([6, 4]);
      for (const x0 of [0, W]) { c.moveTo(x0 - 40, m.py(Y(0.795))); c.quadraticCurveTo(x0, m.py(Y(0.785)), x0 + 40, m.py(Y(0.795))); }
      c.stroke(); c.setLineDash([]);
    }
    const jacketMat = fabricMaterial(cv, fabric, false);
    add(new THREE.Mesh(loftGeometry(rings, 64, false), jacketMat));

    // yoqa halqasi (turgan yoqa)
    const collarMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(cadShade(base, -0.1)), roughness: 0.85, side: THREE.DoubleSide });
    const [cox, coz] = ell(s.neck + standing + 2, 1.0);
    const collar = add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 3.4, 44, 1, true), collarMat));
    collar.scale.set(cox, 1, coz); collar.position.set(0, Y(0.857) - 0.4, 0.5);

    // yelka pogonlari
    if (military) {
      const epMat = new THREE.MeshStandardMaterial({ color: 0x0f1824, roughness: 0.7 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.35, metalness: 0.7 });
      [-1, 1].forEach(sg => {
        const gp = new THREE.Group();
        gp.position.set(sg * (sh * 0.62 + 2), Y(0.8215) + 0.5, 0.2);
        gp.rotation.z = -sg * 0.2;
        const ep = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.7, 11.5), epMat); ep.castShadow = true; gp.add(ep);
        const edge = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.5, 0.35), goldMat); edge.position.z = -5.7; gp.add(edge);
        for (let i = 0; i < rk.bars; i++) { const bar = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.2, 0.7), new THREE.MeshStandardMaterial({ color: 0xe5e7eb })); bar.position.set(0, 0.42, -2.6 + i * 2.1); gp.add(bar); }
        for (let i = 0; i < rk.gap; i++) { const gl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 10.6), goldMat); gl.position.set(rk.gap === 1 ? 0 : (i ? 0.9 : -0.9), 0.42, 0); gp.add(gl); }
        for (let i = 0; i < rk.stars; i++) {
          const star = new THREE.Mesh(new THREE.CylinderGeometry(rk.stars === 1 ? 1.1 : 0.7, rk.stars === 1 ? 1.1 : 0.7, 0.25, 5), goldMat);
          star.position.set(0, 0.5, rk.stars === 1 ? 0 : -3.6 + i * (7.2 / Math.max(1, rk.stars - 1)));
          gp.add(star);
        }
        g.add(gp);
      });
    }

    // stetoskop
    if (type === 'tibbiyot_xalat') {
      const steth = new THREE.Mesh(new THREE.TorusGeometry(10.5, 0.55, 10, 40, Math.PI * 1.05), new THREE.MeshStandardMaterial({ color: 0x23272e, roughness: 0.5 }));
      steth.rotation.set(Math.PI / 2 + 0.22, 0, Math.PI * 0.975); steth.scale.set(1, 1.25, 1); steth.position.set(0, Y(0.832) - 3.5, 4.6);
      steth.castShadow = true; g.add(steth);
    }

    anchors.push({ id: 'chest', p: new THREE.Vector3(-cjx, pitY, 0), side: 'L', text: `Ko'krak ${s.chest} sm` });
    anchors.push({ id: 'waist', p: new THREE.Vector3(-wjx, waistY, 0), side: 'L', text: `Bel ${s.waist} sm` });
    anchors.push({ id: 'hips', p: new THREE.Vector3(-hjx, hipY, 0), side: 'L', text: `Son ${s.hips} sm` });
    anchors.push({ id: 'jacket', p: new THREE.Vector3(-hmx, jacketHem, 0), side: 'L', text: `Kurtka ${s.jacketLen} sm` });
    anchors.push({ id: 'shoulder', p: new THREE.Vector3(-(sh + 0.7), Y(0.815), 0), side: 'L', text: `Yelka ${s.shoulder} sm` });
    anchors.push({ id: 'neck', p: new THREE.Vector3(cox, Y(0.85), 0), side: 'R', text: `Bo'yin ${s.neck} sm` });
  }

  // --- yenglar
  {
    const W = 512, Hh = 512, wristC = Math.max(s.wrist, 13);
    const [tx, tz] = ell(chest * 0.30 + 10, 1.0), [ex, ez] = ell(chest * 0.255 + 8, 0.97), [wx, wz] = ell(wristC + 5.5, 0.9);
    const sleeveEnd = s.sleeve - 3;
    const secs = [
      { y: 3, rx: tx, rz: tz }, { y: -sleeveEnd * 0.12, rx: tx * 0.98, rz: tz * 0.98 }, { y: -sleeveEnd * 0.5, rx: ex, rz: ez },
      { y: -sleeveEnd * 0.88, rx: (ex + wx) / 2, rz: (ez + wz) / 2 }, { y: -sleeveEnd, rx: wx, rz: wz }
    ];
    const rings = sampleSections(secs, 30), m = mapper(rings, W, Hh), cv = makeCanvases(W, Hh, fabric), { c, b } = cv;
    // manjet va tikuvlar
    if (type !== 'ofis_kostyum' && type !== 'tibbiyot_xalat') {
      band(c, m, -sleeveEnd, -sleeveEnd + 5, cadShade(base, -0.18)); band(b, m, -sleeveEnd, -sleeveEnd + 5, '#b0b0b0');
      band(c, m, -sleeveEnd + 5, -sleeveEnd + 5.5, outline);
      dot(c, m, 0, -sleeveEnd + 2.5, 5, gold);
    } else line(c, m, [[-8, -sleeveEnd + 2], [8, -sleeveEnd + 2]], stitch, 1.2, [4, 3]);
    c.fillStyle = 'transparent';
    if (military) { // yeng nishoni (tashqi tomon: x>0 -> u=.75)
      const y0 = -sleeveEnd * 0.2;
      poly(c, m, [[2.5, y0 + 5], [9, y0 + 5], [9, y0 - 5.5], [2.5, y0 - 5.5]], '#102a4a', gold, 2.2);
      poly(c, m, [[4, y0 + 2], [5.75, y0 + 3.8], [7.5, y0 + 2], [7.5, y0 - 2], [5.75, y0 - 4], [4, y0 - 2]], gold);
    }
    if (type === 'sanoat_pro') {
      const y1 = -sleeveEnd * 0.62;
      band(c, m, y1, y1 + 5.5, '#d7dbe0'); band(c, m, y1 + 1.8, y1 + 2.2, '#7b828c'); band(c, m, y1 + 3.6, y1 + 4, '#7b828c'); band(b, m, y1, y1 + 5.5, '#b0b0b0');
    }
    const matR = fabricMaterial(cv, fabric, false), matL = fabricMaterial(cv, fabric, true);
    [-1, 1].forEach(sg => add(new THREE.Mesh(loftGeometry(rings, 32, false), sg > 0 ? matR : matL), armGroups[sg]));
    // yeng teshigi (ichki qorong'u halqa)
    [-1, 1].forEach(sg => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 8, 28), new THREE.MeshStandardMaterial({ color: new THREE.Color(cadShade(base, -0.35)) }));
      ring.rotation.x = Math.PI / 2; ring.scale.set(wx, wz, 1); ring.position.set(0, -sleeveEnd, 0); armGroups[sg].add(ring);
    });
    const wp = new THREE.Vector3(sh - 5.5 + (armL * 0.9) * Math.sin(th), Y(0.80) - (armL * 0.9) * Math.cos(th), 0);
    const mp = new THREE.Vector3(sh - 5.5 + (sleeveEnd * 0.5) * Math.sin(th) + ex, Y(0.80) - (sleeveEnd * 0.5) * Math.cos(th), 0);
    anchors.push({ id: 'sleeve', p: mp, side: 'R', text: `Yeng ${s.sleeve} sm` });
    anchors.push({ id: 'wrist', p: wp.setX(wp.x + wx), side: 'R', text: `Bilak ${s.wrist} sm` });
  }

  // --- bosh kiyim
  {
    const capMat = new THREE.MeshPhysicalMaterial({ map: toTexture(makeCanvases(256, 256, fabric).col, true), roughness: 0.85, sheen: 0.5, side: THREE.DoubleSide });
    const blk = new THREE.MeshPhysicalMaterial({ color: 0x0b0c0e, roughness: 0.25, clearcoat: 0.8 });
    const hwx = hr[0], hwz = hr[2];
    if (military) {
      const band0 = headCY + hr[1] * 0.18;
      const crown = add(new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.0, 1, 40, 1, true), capMat));
      crown.scale.set(hwx * 1.18, 8.5, hwz * 1.12); crown.position.set(0, band0 + 4.5, 1);
      const top = add(new THREE.Mesh(new THREE.CircleGeometry(1.2, 40), capMat)); top.rotation.x = -Math.PI / 2; top.scale.set(hwx * 1.18, hwz * 1.12, 1); top.position.set(0, band0 + 9, 1);
      const bandM = add(new THREE.Mesh(new THREE.CylinderGeometry(1.01, 1.01, 1, 40, 1, true), new THREE.MeshStandardMaterial({ color: new THREE.Color(cadShade(base, -0.45)), roughness: 0.8, side: THREE.DoubleSide })));
      bandM.scale.set(hwx * 1.0 + 0.9, 3, hwz * 0.95 + 0.9); bandM.position.set(0, band0 + 0.2, 1);
      const visor = add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.5, 36, 1, false, -Math.PI * 0.5, Math.PI), blk));
      visor.scale.set(hwx * 1.15, 1, 10.5); visor.position.set(0, band0 - 0.4, hwz * 0.55 + 2.6); visor.rotation.x = 0.16;
      const badge = add(new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.3, 20), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.3 })));
      badge.rotation.x = Math.PI / 2; badge.position.set(0, band0 + 4, hwz * 1.0 + 1.9);
    } else if (type === 'sanoat_pro') {
      const hat = new THREE.MeshPhysicalMaterial({ color: 0xf2c318, roughness: 0.3, clearcoat: 0.7 });
      const dome = add(new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), hat));
      dome.scale.set(hwx * 1.3, hr[1] * 0.78, hwz * 1.28); dome.position.set(0, headCY + hr[1] * 0.22, 0.8);
      const brim = add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.7, 40), hat));
      brim.scale.set(hwx * 1.42, 1, hwz * 1.5); brim.position.set(0, headCY + hr[1] * 0.2, 2.2);
      const ridge = add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, hwz * 2.4), hat));
      ridge.position.set(0, headCY + hr[1] * 0.22 + hr[1] * 0.74, 0.8);
    }
    anchors.push({ id: 'head', p: new THREE.Vector3(hwx, headCY + 1, 0.8), side: 'R', text: `Bosh ${s.head} sm` });
    anchors.push({ id: 'height', p: new THREE.Vector3(0, H + (military ? 10 : type === 'sanoat_pro' ? 11 : 0), 0.8), side: 'R', text: `Bo'y ${s.height} sm`, green: true });
  }

  return g;
}

// ============================================================ chiqarish
function disposeGroup(grp) {
  grp.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(mt => { ['map', 'bumpMap'].forEach(k => mt[k] && mt[k].dispose()); mt.dispose(); });
  });
}

function doBuild() {
  if (figure) { scene.remove(figure); disposeGroup(figure); }
  figure = build();
  scene.add(figure);
  needBuild = false;
}

function fitSize() {
  const w = canvasBox.clientWidth || 400, h = canvasBox.clientHeight || 520;
  renderer.setSize(w, h, false);
  renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
  camera.aspect = w / h; camera.updateProjectionMatrix();
  overlay.setAttribute('viewBox', `0 0 ${w} ${h}`);
  needRender = true;
}

function baseDistance() {
  const vf = camera.fov * Math.PI / 180, ar = camera.aspect;
  const needV = (215 * 1.1 / 2) / Math.tan(vf / 2);
  const needH = (150 / 2) / (Math.tan(vf / 2) * ar);
  return Math.max(needV, needH);
}

let framed = false;
function frame() {
  if (framed) return;
  const d = baseDistance();
  camera.position.set(0, TARGET.y + 6, d);
  controls.update();
  framed = true;
}

function updateGuides() {
  if (!cadState.guides || !anchors.length) { overlay.innerHTML = ''; return; }
  const w = canvasBox.clientWidth, h = canvasBox.clientHeight;
  const pts = anchors.map(a => {
    const v = a.p.clone().project(camera);
    return { ...a, x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h };
  });
  const lay = side => {
    const list = pts.filter(p => p.side === side).sort((a, b) => a.y - b.y);
    let prev = -1e9;
    list.forEach(p => { p.ly = Math.max(p.y, prev + 22); prev = p.ly; });
    let next = h - 12;
    for (let i = list.length - 1; i >= 0; i--) { list[i].ly = Math.min(list[i].ly, next); next = list[i].ly - 22; }
    return list;
  };
  let out = '';
  [...lay('L'), ...lay('R')].forEach(p => {
    const col = p.green ? '#047857' : '#1773D6', tw = p.text.length * 6.4 + 14;
    const bx = p.side === 'L' ? 6 : w - 6 - tw, ex = p.side === 'L' ? bx + tw : bx;
    out += `<line x1="${ex.toFixed(1)}" y1="${p.ly.toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="${col}" stroke-width="1" opacity=".85"/>
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${col}" stroke="#fff" stroke-width="1"/>
      <rect x="${bx.toFixed(1)}" y="${(p.ly - 9).toFixed(1)}" width="${tw.toFixed(1)}" height="18" rx="3" fill="#fff" stroke="${col}" stroke-width=".9"/>
      <text x="${(bx + tw / 2).toFixed(1)}" y="${(p.ly + 3.6).toFixed(1)}" text-anchor="middle" font-family="monospace" font-size="10.5" font-weight="700" fill="${col}">${p.text}</text>`;
  });
  overlay.innerHTML = out;
}

function frameLoop() {
  if (anim) {
    const t = Math.min(1, (performance.now() - anim.t0) / anim.dur), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const az = anim.from + (anim.to - anim.from) * e, d = anim.d;
    camera.position.set(Math.sin(az) * d, TARGET.y + 6, Math.cos(az) * d);
    camera.lookAt(TARGET); controls.update();
    needRender = true;
    if (t >= 1) anim = null;
  }
  if (controls.update()) needRender = true;
  if (needBuild) { doBuild(); needRender = true; }
  if (needRender && host.offsetParent !== null) {
    renderer.render(scene, camera); updateGuides(); needRender = false;
  }
  requestAnimationFrame(frameLoop);
}

let userMoved = false;
controls.addEventListener('start', () => { userMoved = true; });
controls.addEventListener('change', () => { needRender = true; });
new ResizeObserver(() => { if (host.offsetParent !== null) { fitSize(); if (!userMoved) { framed = false; frame(); } } }).observe(canvasBox);

function setView(v) {
  const cur = Math.atan2(camera.position.x - TARGET.x, camera.position.z - TARGET.z);
  const to = v === 'back' ? Math.PI : v === 'side' ? Math.PI / 2 : 0;
  let diff = ((to - cur + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  const d = Math.hypot(camera.position.x - TARGET.x, camera.position.z - TARGET.z) || baseDistance();
  anim = { from: cur, to: cur + diff, t0: performance.now(), dur: 650, d };
}

window.cad3d = {
  ok: true,
  update() { needBuild = true; needRender = true; if (host.offsetParent !== null) { fitSize(); frame(); } },
  setView,
  refresh() { needRender = true; }
};
fitSize(); frame();
requestAnimationFrame(frameLoop);
window.dispatchEvent(new Event('cad3d-ready'));
