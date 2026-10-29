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
  bloodGroup: 'II (A) Rh+',
  rank: 'Mayor',
  uniformType: 'iiv_patrol'
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
    '46_3': { height: 168, chest: 92, waist: 80, shoulder: 44, sleeve: 62, jacketLen: 68, neck: 39, trouserLen: 100, trouserWaist: 78, hips: 94, thigh: 52, trouserBottom: 40, head: 56 },
    '48_3': { height: 170, chest: 96, waist: 84, shoulder: 46, sleeve: 63, jacketLen: 70, neck: 40, trouserLen: 102, trouserWaist: 82, hips: 98, thigh: 54, trouserBottom: 40, head: 57 },
    '50_4': { height: 174, chest: 100, waist: 88, shoulder: 47, sleeve: 64, jacketLen: 71, neck: 40, trouserLen: 104, trouserWaist: 86, hips: 100, thigh: 55, trouserBottom: 42, head: 57 },
    '52_4': { height: 176, chest: 104, waist: 92, shoulder: 48, sleeve: 65, jacketLen: 72, neck: 41, trouserLen: 105, trouserWaist: 90, hips: 104, thigh: 56, trouserBottom: 42, head: 58 },
    '54_4': { height: 176, chest: 108, waist: 98, shoulder: 50, sleeve: 65, jacketLen: 73, neck: 42, trouserLen: 106, trouserWaist: 94, hips: 108, thigh: 58, trouserBottom: 42, head: 58 },
    '56_5': { height: 182, chest: 112, waist: 104, shoulder: 51, sleeve: 67, jacketLen: 75, neck: 43, trouserLen: 108, trouserWaist: 100, hips: 112, thigh: 60, trouserBottom: 44, head: 59 },
    '58_5': { height: 182, chest: 116, waist: 110, shoulder: 52, sleeve: 67, jacketLen: 76, neck: 44, trouserLen: 109, trouserWaist: 106, hips: 116, thigh: 62, trouserBottom: 44, head: 60 },
    '60_5': { height: 182, chest: 120, waist: 116, shoulder: 54, sleeve: 68, jacketLen: 77, neck: 45, trouserLen: 110, trouserWaist: 112, hips: 122, thigh: 64, trouserBottom: 44, head: 60 },
    '62_6': { height: 188, chest: 124, waist: 122, shoulder: 55, sleeve: 69, jacketLen: 78, neck: 46, trouserLen: 112, trouserWaist: 118, hips: 126, thigh: 66, trouserBottom: 46, head: 61 }
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

  // Uniform theme & label
  const uniNames = {
    iiv_patrol: "Mato: Rip-Stop 65/35 (To'q ko'k IIV)",
    harbiy_dala: "Mato: Rip-stop Kamuflyaj (Harbiy maxsus)",
    sanoat_pro: "Mato: Paxta 100% 260g/m² (Moy-suv qaytaruvchi)",
    ofis_kostyum: "Mato: Yarim jun / Poliviskoza (Prezident klass)",
    tibbiyot_xalat: "Mato: Tisi / Medpaxta (Antiseptik)"
  };
  const matLbl = document.getElementById('cadMaterialLabel');
  if (matLbl) matLbl.textContent = uniNames[cadState.uniformType] || "Mato: Rip-Stop 65/35";

  // Re-render Dynamic SVG
  renderCadSvg();
}

// --- Render Parametric SVG Mannequin & Silhouette ---
function renderCadSvg() {
  const svg = document.getElementById('cadSvg');
  if (!svg) return;

  const s = cadState;
  const isBack = (s.view === 'back');

  // Colors based on uniform type
  let suitMain = "#1E293B";
  let suitAcc = "#0F172A";
  let suitLine = "#38BDF8";
  let stripeColor = "#FACC15";

  if (s.uniformType === 'harbiy_dala') {
    suitMain = "#2D372E";
    suitAcc = "#1E271F";
    suitLine = "#4ADE80";
  } else if (s.uniformType === 'sanoat_pro') {
    suitMain = "#1E3A5F";
    suitAcc = "#0F2338";
    suitLine = "#F59E0B";
  } else if (s.uniformType === 'tibbiyot_xalat') {
    suitMain = "#334155";
    suitAcc = "#1E293B";
    suitLine = "#38BDF8";
  }

  // Parametric geometry scaling (ViewBox: 500x700, center X = 250)
  const cx = 250;
  const shoulderW = (s.shoulder / 48) * 82; // half shoulder in px (~82)
  const chestW = (s.chest / 104) * 68;       // half chest in px (~68)
  const waistW = (s.waist / 92) * 58;        // half waist in px (~58)
  const hipW = (s.hips / 102) * 62;          // half hips in px (~62)
  const legBotW = (s.trouserBottom / 42) * 24; // trouser bottom width in px (~24)
  const jacketH = (s.jacketLen / 72) * 190;  // jacket height in px (~190)
  const sleeveLen = (s.sleeve / 65) * 185;   // sleeve length in px (~185)
  const trouserH = (s.trouserLen / 105) * 290;// trouser height in px (~290)

  const neckY = 110;
  const shoulderY = 135;
  const chestY = shoulderY + 55;
  const waistY = shoulderY + 130;
  const jacketBottomY = shoulderY + jacketH;
  const trouserBottomY = waistY + trouserH;
  const crotchY = waistY + 68;

  // Outer jacket points
  const leftShoulderX = cx - shoulderW;
  const rightShoulderX = cx + shoulderW;
  const leftChestX = cx - chestW;
  const rightChestX = cx + chestW;
  const leftWaistX = cx - waistW;
  const rightWaistX = cx + waistW;
  const leftHipX = cx - hipW;
  const rightHipX = cx + hipW;

  // Sleeve wrist points (arms slightly angled out)
  const leftWristX = leftShoulderX - 26;
  const leftWristY = shoulderY + sleeveLen;
  const rightWristX = rightShoulderX + 26;
  const rightWristY = shoulderY + sleeveLen;

  // Trouser ankles
  const leftAnkleOuterX = cx - hipW - 2;
  const leftAnkleInnerX = cx - 10;
  const rightAnkleInnerX = cx + 10;
  const rightAnkleOuterX = cx + hipW + 2;

  let gHtml = `
    <!-- Blueprint Tech Grid -->
    <defs>
      <pattern id="cadGridPat" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56, 189, 248, 0.08)" stroke-width="1"/>
      </pattern>
      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38BDF8"/>
      </marker>
    </defs>
    <rect width="100%" height="100%" fill="#061320"/>
    <rect width="100%" height="100%" fill="url(#cadGridPat)"/>

    <!-- Center Symmetry Axis -->
    <line x1="${cx}" y1="20" x2="${cx}" y2="680" stroke="rgba(56, 189, 248, 0.25)" stroke-dasharray="6,4" stroke-width="1.2"/>
  `;

  // Head & Peaked Visor Cap (Bosh kiyim)
  const headRadius = (s.head / 58) * 22;
  gHtml += `
    <g id="cadHead">
      <!-- Neck -->
      <path d="M ${cx - 16} ${neckY - 10} L ${cx - 16} ${shoulderY} L ${cx + 16} ${shoulderY} L ${cx + 16} ${neckY - 10} Z" fill="#94A3B8" opacity="0.6"/>
      <!-- Head Contour -->
      <ellipse cx="${cx}" cy="${neckY - 32}" rx="${headRadius}" ry="${headRadius + 6}" fill="#CBD5E1" opacity="0.85"/>
      <!-- Military / Police Peaked Cap (Kepi) -->
      <path d="M ${cx - headRadius - 4} ${neckY - 40} Q ${cx} ${neckY - 65} ${cx + headRadius + 4} ${neckY - 40} L ${cx + headRadius + 2} ${neckY - 32} Q ${cx} ${neckY - 30} ${cx - headRadius - 2} ${neckY - 32} Z" fill="${suitAcc}" stroke="${suitLine}" stroke-width="1.5"/>
      <!-- Cap Visor / Peak -->
      <path d="M ${cx - headRadius} ${neckY - 32} Q ${cx} ${neckY - 24} ${cx + headRadius} ${neckY - 32}" fill="none" stroke="#FACC15" stroke-width="2.5"/>
      <!-- Cap Badge / Emblem -->
      <circle cx="${cx}" cy="${neckY - 48}" r="4" fill="#FACC15"/>
    </g>
  `;

  // Trousers (Shim / Bryuk)
  gHtml += `
    <g id="cadTrousers">
      <!-- Trousers Outer Contour -->
      <path d="
        M ${cx - waistW + 2} ${waistY}
        L ${leftHipX} ${waistY + 50}
        L ${cx - legBotW - 12} ${trouserBottomY}
        L ${cx - 6} ${trouserBottomY}
        L ${cx - 4} ${crotchY}
        L ${cx + 4} ${crotchY}
        L ${cx + 6} ${trouserBottomY}
        L ${cx + legBotW + 12} ${trouserBottomY}
        L ${rightHipX} ${waistY + 50}
        L ${cx + waistW - 2} ${waistY}
        Z"
        fill="${suitAcc}" stroke="${suitLine}" stroke-width="2" stroke-linejoin="round"/>

      <!-- Trousers Crease / Press Lines (Strelkalar) -->
      <line x1="${cx - (waistW/2)}" y1="${waistY + 30}" x2="${cx - (legBotW/2) - 8}" y2="${trouserBottomY}" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" stroke-dasharray="4,2"/>
      <line x1="${cx + (waistW/2)}" y1="${waistY + 30}" x2="${cx + (legBotW/2) + 8}" y2="${trouserBottomY}" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" stroke-dasharray="4,2"/>

      <!-- Boots / Poyabzal -->
      <path d="M ${cx - legBotW - 14} ${trouserBottomY} L ${cx - legBotW - 16} ${trouserBottomY + 18} Q ${cx - 10} ${trouserBottomY + 22} ${cx - 6} ${trouserBottomY + 18} L ${cx - 6} ${trouserBottomY} Z" fill="#020617" stroke="#475569" stroke-width="1.5"/>
      <path d="M ${cx + 6} ${trouserBottomY} L ${cx + 6} ${trouserBottomY + 18} Q ${cx + 10} ${trouserBottomY + 22} ${cx + legBotW + 16} ${trouserBottomY + 18} L ${cx + legBotW + 14} ${trouserBottomY} Z" fill="#020617" stroke="#475569" stroke-width="1.5"/>
    </g>
  `;

  // Jacket (Kurtka / Kostyum)
  gHtml += `
    <g id="cadJacket">
      <!-- Jacket Torso -->
      <path d="
        M ${cx - 24} ${shoulderY - 5}
        L ${leftShoulderX} ${shoulderY}
        Q ${cx - chestW - 8} ${chestY} ${leftWaistX} ${waistY}
        L ${leftHipX} ${jacketBottomY}
        Q ${cx} ${jacketBottomY + 8} ${rightHipX} ${jacketBottomY}
        L ${rightWaistX} ${waistY}
        Q ${cx + chestW + 8} ${chestY} ${rightShoulderX} ${shoulderY}
        L ${cx + 24} ${shoulderY - 5}
        Z"
        fill="${suitMain}" stroke="${suitLine}" stroke-width="2.2" stroke-linejoin="round"/>

      <!-- Sleeves (Left & Right) -->
      <!-- Left Sleeve -->
      <path d="
        M ${leftShoulderX} ${shoulderY}
        L ${leftWristX} ${leftWristY}
        L ${leftWristX + 22} ${leftWristY + 4}
        L ${cx - chestW + 4} ${shoulderY + 65}
        Z"
        fill="${suitMain}" stroke="${suitLine}" stroke-width="2" stroke-linejoin="round"/>
      <!-- Left Cuff / Manget -->
      <line x1="${leftWristX}" y1="${leftWristY}" x2="${leftWristX + 22}" y2="${leftWristY + 4}" stroke="#FACC15" stroke-width="2"/>

      <!-- Right Sleeve -->
      <path d="
        M ${rightShoulderX} ${shoulderY}
        L ${rightWristX} ${rightWristY}
        L ${rightWristX - 22} ${rightWristY + 4}
        L ${cx + chestW - 4} ${shoulderY + 65}
        Z"
        fill="${suitMain}" stroke="${suitLine}" stroke-width="2" stroke-linejoin="round"/>
      <!-- Right Cuff / Manget -->
      <line x1="${rightWristX}" y1="${rightWristY}" x2="${rightWristX - 22}" y2="${rightWristY + 4}" stroke="#FACC15" stroke-width="2"/>

      <!-- Epaulets (Pogoni / Yelkaliklar) -->
      <path d="M ${cx - 28} ${shoulderY - 4} L ${leftShoulderX} ${shoulderY} L ${leftShoulderX + 4} ${shoulderY + 12} L ${cx - 24} ${shoulderY + 6} Z" fill="#0F172A" stroke="#FACC15" stroke-width="1.5"/>
      <path d="M ${cx + 28} ${shoulderY - 4} L ${rightShoulderX} ${shoulderY} L ${rightShoulderX - 4} ${shoulderY + 12} L ${cx + 24} ${shoulderY + 6} Z" fill="#0F172A" stroke="#FACC15" stroke-width="1.5"/>
  `;

  if (!isBack) {
    // Front View Details: Collar, Buttons, Chest Pockets, Belt
    gHtml += `
      <!-- Stand / Turn-down Collar (Yoqa) -->
      <path d="M ${cx - 24} ${shoulderY - 5} L ${cx} ${shoulderY + 28} L ${cx + 24} ${shoulderY - 5} Z" fill="${suitAcc}" stroke="${suitLine}" stroke-width="1.5"/>
      <path d="M ${cx - 26} ${shoulderY - 4} L ${cx - 36} ${shoulderY + 18} L ${cx - 8} ${shoulderY + 28} Z" fill="${suitAcc}" stroke="${suitLine}" stroke-width="1.2"/>
      <path d="M ${cx + 26} ${shoulderY - 4} L ${cx + 36} ${shoulderY + 18} L ${cx + 8} ${shoulderY + 28} Z" fill="${suitAcc}" stroke="${suitLine}" stroke-width="1.2"/>

      <!-- Center Closure & Zipper/Button Fly -->
      <line x1="${cx}" y1="${shoulderY + 28}" x2="${cx}" y2="${jacketBottomY}" stroke="${suitLine}" stroke-width="1.8"/>

      <!-- Front Chest Pockets (Ko'krak cho'ntaklari) -->
      <!-- Left Pocket (with Blood Tag) -->
      <rect x="${cx - 48}" y="${chestY - 14}" width="34" height="30" rx="3" fill="${suitAcc}" stroke="${suitLine}" stroke-width="1.2"/>
      <path d="M ${cx - 48} ${chestY - 14} L ${cx - 31} ${chestY - 8} L ${cx - 14} ${chestY - 14} Z" fill="${suitMain}" stroke="${suitLine}" stroke-width="1.2"/>
      <!-- Blood Group Patch on Chest -->
      <rect x="${cx - 46}" y="${chestY - 24}" width="30" height="8" rx="2" fill="#EF4444"/>
      <text x="${cx - 31}" y="${chestY - 18}" fill="#FFFFFF" font-size="6" font-weight="bold" text-anchor="middle" font-family="monospace">${cadState.bloodGroup.split(' ')[0]}</text>

      <!-- Right Pocket (with Service Crest / Name badge) -->
      <rect x="${cx + 14}" y="${chestY - 14}" width="34" height="30" rx="3" fill="${suitAcc}" stroke="${suitLine}" stroke-width="1.2"/>
      <path d="M ${cx + 14} ${chestY - 14} L ${cx + 31} ${chestY - 8} L ${cx + 48} ${chestY - 14} Z" fill="${suitMain}" stroke="${suitLine}" stroke-width="1.2"/>
      <rect x="${cx + 16}" y="${chestY - 24}" width="30" height="8" rx="2" fill="#1773D6"/>
      <text x="${cx + 31}" y="${chestY - 18}" fill="#FFFFFF" font-size="6" font-weight="bold" text-anchor="middle" font-family="monospace">UMISH</text>

      <!-- Uniform Buttons -->
      <circle cx="${cx}" cy="${shoulderY + 45}" r="3" fill="#FACC15" stroke="#94A3B8" stroke-width="0.8"/>
      <circle cx="${cx}" cy="${shoulderY + 70}" r="3" fill="#FACC15" stroke="#94A3B8" stroke-width="0.8"/>
      <circle cx="${cx}" cy="${shoulderY + 95}" r="3" fill="#FACC15" stroke="#94A3B8" stroke-width="0.8"/>
      <circle cx="${cx}" cy="${shoulderY + 120}" r="3" fill="#FACC15" stroke="#94A3B8" stroke-width="0.8"/>
      <circle cx="${cx}" cy="${shoulderY + 145}" r="3" fill="#FACC15" stroke="#94A3B8" stroke-width="0.8"/>

      <!-- Tactical / Service Belt (Kamar) -->
      <rect x="${leftWaistX + 2}" y="${waistY - 6}" width="${waistW * 2 - 4}" height="14" fill="#020617" stroke="#475569" stroke-width="1.5"/>
      <!-- Brass Belt Buckle (Taqa) -->
      <rect x="${cx - 10}" y="${waistY - 8}" width="20" height="18" rx="3" fill="#FACC15" stroke="#D97706" stroke-width="1.5"/>
      <rect x="${cx - 5}" y="${waistY - 4}" width="10" height="10" fill="#020617"/>
    `;
  } else {
    // Back View Details: Yoke, Back Middle Seam, Side Vents
    gHtml += `
      <!-- Back Yoke Seam (Koketka) -->
      <path d="M ${leftShoulderX + 8} ${shoulderY + 24} Q ${cx} ${shoulderY + 34} ${rightShoulderX - 8} ${shoulderY + 24}" fill="none" stroke="${suitLine}" stroke-width="1.4"/>
      <!-- Back Middle Seam -->
      <line x1="${cx}" y1="${shoulderY}" x2="${cx}" y2="${jacketBottomY}" stroke="${suitLine}" stroke-width="1.5" stroke-dasharray="5,3"/>
      <!-- Side Vents (Shlitsalar) -->
      <line x1="${cx - 28}" y1="${jacketBottomY - 35}" x2="${cx - 28}" y2="${jacketBottomY}" stroke="${suitLine}" stroke-width="1.5"/>
      <line x1="${cx + 28}" y1="${jacketBottomY - 35}" x2="${cx + 28}" y2="${jacketBottomY}" stroke="${suitLine}" stroke-width="1.5"/>
      <!-- Back Trousers Pocket Flaps -->
      <rect x="${cx - 38}" y="${waistY + 24}" width="26" height="5" rx="1" fill="${suitAcc}" stroke="${suitLine}" stroke-width="1"/>
      <rect x="${cx + 12}" y="${waistY + 24}" width="26" height="5" rx="1" fill="${suitAcc}" stroke="${suitLine}" stroke-width="1"/>
    `;
  }

  gHtml += `</g>`; // End cadJacket

  // Dimension Callouts & Guides (Live Measurements)
  if (cadState.guides) {
    gHtml += `
      <g id="cadGuides" font-family="monospace" font-size="10" font-weight="bold" fill="#38BDF8">
        <!-- 1. Shoulder Width Callout (Yelka) -->
        <g>
          <line x1="${leftShoulderX}" y1="${shoulderY - 14}" x2="${rightShoulderX}" y2="${shoulderY - 14}" stroke="#38BDF8" stroke-width="1.4" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
          <line x1="${leftShoulderX}" y1="${shoulderY - 18}" x2="${leftShoulderX}" y2="${shoulderY}" stroke="#38BDF8" stroke-width="0.8" stroke-dasharray="2,2"/>
          <line x1="${rightShoulderX}" y1="${shoulderY - 18}" x2="${rightShoulderX}" y2="${shoulderY}" stroke="#38BDF8" stroke-width="0.8" stroke-dasharray="2,2"/>
          <rect x="${cx - 42}" y="${shoulderY - 24}" width="84" height="15" rx="3" fill="#061320" stroke="#38BDF8" stroke-width="0.8"/>
          <text x="${cx}" y="${shoulderY - 13}" text-anchor="middle">↔ Yelka: ${s.shoulder}sm</text>
        </g>

        <!-- 2. Chest Circumference Callout (Ko'krak) -->
        <g>
          <line x1="${leftChestX}" y1="${chestY + 16}" x2="${rightChestX}" y2="${chestY + 16}" stroke="#38BDF8" stroke-width="1.4" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
          <rect x="${cx - 48}" y="${chestY + 8}" width="96" height="15" rx="3" fill="#061320" stroke="#38BDF8" stroke-width="0.8"/>
          <text x="${cx}" y="${chestY + 19}" text-anchor="middle">↔ Ko'krak: ${s.chest}sm</text>
        </g>

        <!-- 3. Waist Width Callout (Bel) -->
        <g>
          <line x1="${leftWaistX}" y1="${waistY + 22}" x2="${rightWaistX}" y2="${waistY + 22}" stroke="#38BDF8" stroke-width="1.4" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
          <rect x="${cx - 40}" y="${waistY + 14}" width="80" height="15" rx="3" fill="#061320" stroke="#38BDF8" stroke-width="0.8"/>
          <text x="${cx}" y="${waistY + 25}" text-anchor="middle">↔ Bel: ${s.waist}sm</text>
        </g>

        <!-- 4. Sleeve Length Callout (Yeng) -->
        <g>
          <line x1="${rightShoulderX + 36}" y1="${shoulderY}" x2="${rightWristX + 32}" y2="${rightWristY}" stroke="#38BDF8" stroke-width="1.4" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
          <rect x="${rightShoulderX + 42}" y="${shoulderY + (sleeveLen / 2) - 8}" width="80" height="15" rx="3" fill="#061320" stroke="#38BDF8" stroke-width="0.8"/>
          <text x="${rightShoulderX + 82}" y="${shoulderY + (sleeveLen / 2) + 3}" text-anchor="middle">↕ Yeng: ${s.sleeve}sm</text>
        </g>

        <!-- 5. Trouser Length Callout (Shim) -->
        <g>
          <line x1="${rightHipX + 28}" y1="${waistY}" x2="${cx + legBotW + 34}" y2="${trouserBottomY}" stroke="#38BDF8" stroke-width="1.4" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
          <rect x="${rightHipX + 34}" y="${waistY + (trouserH / 2) - 8}" width="80" height="15" rx="3" fill="#061320" stroke="#38BDF8" stroke-width="0.8"/>
          <text x="${rightHipX + 74}" y="${waistY + (trouserH / 2) + 3}" text-anchor="middle">↕ Shim: ${s.trouserLen}sm</text>
        </g>

        <!-- 6. Total Height Callout on Left Rail (Bo'y) -->
        <g>
          <line x1="28" y1="40" x2="28" y2="${trouserBottomY + 18}" stroke="#10B981" stroke-width="1.4" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
          <line x1="22" y1="40" x2="34" y2="40" stroke="#10B981" stroke-width="1.4"/>
          <line x1="22" y1="${trouserBottomY + 18}" x2="34" y2="${trouserBottomY + 18}" stroke="#10B981" stroke-width="1.4"/>
          <rect x="10" y="${(trouserBottomY / 2) - 10}" width="90" height="18" rx="3" fill="#061320" stroke="#10B981" stroke-width="1"/>
          <text x="55" y="${(trouserBottomY / 2) + 3}" text-anchor="middle" fill="#10B981">↕ Bo'y: ${s.height}sm</text>
        </g>
      </g>
    `;
  }

  svg.innerHTML = gHtml;
}

// --- TAB 2: Batch Table Management ---
