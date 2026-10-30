// ==========================================================================
// SMART TAILOR & JONLI SILUET CAD KALKULYATORI JAVASCRIPT ENGINE
// ==========================================================================

// Global CAD & Batch State
let cadState = {
  view: 'front', // 'front' | 'back'
  guides: true,
  height: 176,
  chest: 104,
  waist: 92,
  shoulder: 48,
  sleeve: 65,
  jacketLen: 72,
  neck: 41,
  trouserLen: 105,
  trouserWaist: 90,
  hips: 102,
  thigh: 56,
  trouserBottom: 42,
  head: 58,
  wrist: 18,
  knee: 40,
  bloodGroup: 'II (A) Rh+',
  rank: 'Mayor',
  uniformType: 'iiv_patrol',
  fabric: 'ripstop_navy' // CAD_FABRICS ichidagi mato id si (js/cad-render.js)
};

// Batch Employees Data (Initialized with user's factory PDF)
let batchEmployees = [
  { id: 1, name: "Jabborov Asilbek", chest: 108, waist: 102, sleeve: 65, shoulder: 50, height: 175, trouserLen: 106, trouserWaist: 94, head: 58, blood: "II Rh+", rank: "Mayor", date: "2026-10-25" },
  { id: 2, name: "Ibragimov Doston", chest: 100, waist: 98, sleeve: 62, shoulder: 48, height: 172, trouserLen: 102, trouserWaist: 88, head: 57, blood: "I Rh+", rank: "Kapitan", date: "2026-10-25" },
  { id: 3, name: "Amonov Umid", chest: 112, waist: 106, sleeve: 66, shoulder: 52, height: 178, trouserLen: 107, trouserWaist: 96, head: 59, blood: "III Rh+", rank: "Leytenant", date: "2026-10-26" },
  { id: 4, name: "Mahmudov Zafar", chest: 120, waist: 114, sleeve: 69, shoulder: 54, height: 182, trouserLen: 108, trouserWaist: 102, head: 60, blood: "II Rh+", rank: "Podpolkovnik", date: "2026-10-26" },
  { id: 5, name: "Abdiyev Nodir", chest: 104, waist: 92, sleeve: 64, shoulder: 48, height: 176, trouserLen: 105, trouserWaist: 90, head: 58, blood: "I Rh+", rank: "Katta serjant", date: "2026-10-27" },
  { id: 6, name: "Sharipov Firdavs", chest: 96, waist: 86, sleeve: 63, shoulder: 46, height: 170, trouserLen: 102, trouserWaist: 84, head: 56, blood: "IV Rh+", rank: "Serjant", date: "2026-10-27" },
  { id: 7, name: "O'. Ro'ziyev", chest: 128, waist: 124, sleeve: 68, shoulder: 55, height: 184, trouserLen: 110, trouserWaist: 112, head: 61, blood: "III Rh+", rank: "Polkovnik", date: "2026-10-28" }
];

// --- Tab Switching ---
function switchCalcTab(tabId) {
  const tabs = ['tailor', 'batch', 'budget'];
  tabs.forEach(t => {
    const btn = document.getElementById('tabBtn' + t.charAt(0).toUpperCase() + t.slice(1));
    const panel = document.getElementById('panel' + t.charAt(0).toUpperCase() + t.slice(1));
    if (btn) btn.classList.toggle('is-active', t === tabId);
    if (panel) panel.style.display = (t === tabId) ? ((t === 'tailor') ? 'grid' : 'flex') : 'none';
  });
  if (tabId === 'tailor') updateTailorCad();
  if (tabId === 'batch') renderBatchTable();
}

function switchCadSub(subId) {
  const subs = ['top', 'bottom', 'special'];
  subs.forEach(s => {
    const btn = document.getElementById('subBtn' + s.charAt(0).toUpperCase() + s.slice(1));
    const grp = document.getElementById('cadSub' + s.charAt(0).toUpperCase() + s.slice(1));
    if (btn) btn.classList.toggle('is-active', s === subId);
    if (grp) grp.style.display = (s === subId) ? 'flex' : 'none';
  });
}

// --- Sync range and number input ---
function syncTailorInput(param, val) {
  val = parseFloat(val);
  if (isNaN(val)) return;

  const rangeEl = document.getElementById('t' + param);
  const numEl = document.getElementById('num' + param);
  const valLbl = document.getElementById('val' + param);

  if (rangeEl) rangeEl.value = val;
  if (numEl) numEl.value = val;
  if (valLbl) valLbl.textContent = val + ' sm';

  // Update state key (camelCase)
  const key = param.charAt(0).toLowerCase() + param.slice(1);
  if (cadState.hasOwnProperty(key)) {
    cadState[key] = val;
  }
  updateTailorCad();
}

// --- Quick Presets ---
function applySizePreset(size, rost) {
  const presets = {
    '46_3': { height: 168, chest: 92, waist: 80, shoulder: 44, sleeve: 62, jacketLen: 68, neck: 39, trouserLen: 100, trouserWaist: 78, hips: 94, thigh: 52, trouserBottom: 40, head: 56, wrist: 16, knee: 36 },
    '48_3': { height: 170, chest: 96, waist: 84, shoulder: 46, sleeve: 63, jacketLen: 70, neck: 40, trouserLen: 102, trouserWaist: 82, hips: 98, thigh: 54, trouserBottom: 40, head: 57, wrist: 16, knee: 37 },
    '50_4': { height: 174, chest: 100, waist: 88, shoulder: 47, sleeve: 64, jacketLen: 71, neck: 40, trouserLen: 104, trouserWaist: 86, hips: 100, thigh: 55, trouserBottom: 42, head: 57, wrist: 17, knee: 38 },
    '52_4': { height: 176, chest: 104, waist: 92, shoulder: 48, sleeve: 65, jacketLen: 72, neck: 41, trouserLen: 105, trouserWaist: 90, hips: 104, thigh: 56, trouserBottom: 42, head: 58, wrist: 18, knee: 40 },
    '54_4': { height: 176, chest: 108, waist: 98, shoulder: 50, sleeve: 65, jacketLen: 73, neck: 42, trouserLen: 106, trouserWaist: 94, hips: 108, thigh: 58, trouserBottom: 42, head: 58, wrist: 18, knee: 41 },
    '56_5': { height: 182, chest: 112, waist: 104, shoulder: 51, sleeve: 67, jacketLen: 75, neck: 43, trouserLen: 108, trouserWaist: 100, hips: 112, thigh: 60, trouserBottom: 44, head: 59, wrist: 19, knee: 42 },
    '58_5': { height: 182, chest: 116, waist: 110, shoulder: 52, sleeve: 67, jacketLen: 76, neck: 44, trouserLen: 109, trouserWaist: 106, hips: 116, thigh: 62, trouserBottom: 44, head: 60, wrist: 19, knee: 43 },
    '60_5': { height: 182, chest: 120, waist: 116, shoulder: 54, sleeve: 68, jacketLen: 77, neck: 45, trouserLen: 110, trouserWaist: 112, hips: 122, thigh: 64, trouserBottom: 44, head: 60, wrist: 20, knee: 44 },
    '62_6': { height: 188, chest: 124, waist: 122, shoulder: 55, sleeve: 69, jacketLen: 78, neck: 46, trouserLen: 112, trouserWaist: 118, hips: 126, thigh: 66, trouserBottom: 46, head: 61, wrist: 20, knee: 46 }
  };

  const key = `${size}_${rost}`;
  const p = presets[key];
  if (!p) return;

  Object.keys(p).forEach(k => {
    cadState[k] = p[k];
    const paramCap = k.charAt(0).toUpperCase() + k.slice(1);
    const rangeEl = document.getElementById('t' + paramCap);
    const numEl = document.getElementById('num' + paramCap);
    const valLbl = document.getElementById('val' + paramCap);
    if (rangeEl) rangeEl.value = p[k];
    if (numEl) numEl.value = p[k];
    if (valLbl) valLbl.textContent = p[k] + ' sm';
  });

  // Highlight pill
  document.querySelectorAll('.cad-size-pill').forEach(btn => {
    btn.classList.toggle('is-active', btn.textContent.trim() === `${size}/${rost}`);
  });

  updateTailorCad();
}

function setCadView(v) {
  cadState.view = v;
  document.getElementById('vbtnFront').classList.toggle('is-active', v === 'front');
  document.getElementById('vbtnBack').classList.toggle('is-active', v === 'back');
  updateTailorCad();
}

function toggleCadGuides() {
  cadState.guides = !cadState.guides;
  document.getElementById('vbtnGuides').classList.toggle('is-active', cadState.guides);
  updateTailorCad();
}

// --- Tailor GOST Calculation ---
function calculateGost(height, chest, waist) {
  // Razmer: chest / 2 rounded to nearest even
  let size = Math.round(chest / 4) * 2;
  if (size < 44) size = 44;
  if (size > 66) size = 66;

  // Rost:
  let rost = 4;
  let rostRange = "173–179 sm";
  if (height < 161) { rost = 1; rostRange = "155–161 sm"; }
  else if (height < 167) { rost = 2; rostRange = "161–167 sm"; }
  else if (height < 173) { rost = 3; rostRange = "167–173 sm"; }
  else if (height < 179) { rost = 4; rostRange = "173–179 sm"; }
  else if (height < 185) { rost = 5; rostRange = "179–185 sm"; }
  else if (height < 191) { rost = 6; rostRange = "185–191 sm"; }
  else { rost = 7; rostRange = "191–197 sm"; }

  // Polnota:
  const diff = chest - waist;
  let polnota = "2-guruh (Standart)";
  if (diff >= 14) polnota = "1-guruh (Atletik qomat)";
  else if (diff >= 8) polnota = "2-guruh (Standart mutanosib)";
  else if (diff >= 2) polnota = "3-guruh (To'laroq gavdali)";
  else polnota = "4-guruh (Katta qorinli / Og'ir)";

  // Fabric requirement (Jacket + Trousers + Hem/Seam allowances):
  let fabricMeter = 2.80;
  if (size >= 60) fabricMeter = 3.35;
  else if (size >= 56) fabricMeter = 3.10;
  else if (size >= 52) fabricMeter = 2.95;
  else if (size >= 48) fabricMeter = 2.85;

  if (rost >= 5) fabricMeter += 0.15;
  if (rost <= 2) fabricMeter -= 0.10;

  return { size, rost, rostRange, polnota, fabricMeter: fabricMeter.toFixed(2) };
}

// --- Update Tailor CAD & UI ---
function updateTailorCad() {
  const bloodEl = document.getElementById('tBloodGroup');
  if (bloodEl) cadState.bloodGroup = bloodEl.value;

  const rankEl = document.getElementById('tRank');
  if (rankEl) cadState.rank = rankEl.value;

  const uniEl = document.getElementById('tUniformType');
  if (uniEl) cadState.uniformType = uniEl.value;

  const calc = calculateGost(cadState.height, cadState.chest, cadState.waist);

  // Update Right Column Metrics
  const resGostSize = document.getElementById('resGostSize');
  if (resGostSize) resGostSize.textContent = `${calc.size} / ${calc.rost}`;

  const resGostDesc = document.getElementById('resGostDesc');
  if (resGostDesc) resGostDesc.textContent = `${calc.size}-o'lcham, ${calc.rost}-rost (${calc.rostRange})`;

  const resPolnota = document.getElementById('resPolnota');
  if (resPolnota) resPolnota.textContent = calc.polnota;

  const resHeadCap = document.getElementById('resHeadCap');
  if (resHeadCap) resHeadCap.textContent = `${cadState.head}-o'lcham`;

  const resBloodLabel = document.getElementById('resBloodLabel');
  if (resBloodLabel) resBloodLabel.textContent = cadState.bloodGroup;

  const resRankLabel = document.getElementById('resRankLabel');
  if (resRankLabel) resRankLabel.textContent = `${cadState.rank}`;

  const resFabricTotal = document.getElementById('resFabricTotal');
  if (resFabricTotal) resFabricTotal.textContent = `${calc.fabricMeter} metr`;

  const resLiningTotal = document.getElementById('resLiningTotal');
  if (resLiningTotal) resLiningTotal.textContent = (calc.size >= 56 ? '2.00' : '1.80') + ' metr';

  // Tanlangan mato nomi va rangi
  const fb = cadFabric(cadState.fabric);
  const matLbl = document.getElementById('cadMaterialLabel');
  if (matLbl) matLbl.textContent = `Mato: ${fb.name} (${fb.tone})`;
  const fbName = document.getElementById('cadFabricName');
  if (fbName) fbName.textContent = `${fb.name} · ${fb.tone}`;

  // Re-render Dynamic SVG
  renderCadSvg();
}

// --- TAB 2: Batch Table Management ---
