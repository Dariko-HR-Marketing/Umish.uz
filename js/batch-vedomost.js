function renderBatchTable() {
  const tbody = document.getElementById('batchTableBody');
  if (!tbody) return;

  let totalMeters = 0;
  let rowsHtml = '';

  batchEmployees.forEach((emp, idx) => {
    const calc = calculateGost(emp.height, emp.chest, emp.waist);
    totalMeters += parseFloat(calc.fabricMeter);

    rowsHtml += `
      <tr>
        <td style="font-family:var(--f-mono); font-weight:700; color:var(--mute);">${idx + 1}</td>
        <td>
          <b style="color:var(--tx);">${emp.name}</b>
          <div style="font-size:.72rem; color:var(--mute);">${emp.date}</div>
        </td>
        <td>${emp.chest} sm</td>
        <td>${emp.waist} sm</td>
        <td>${emp.sleeve} sm</td>
        <td>${emp.shoulder} sm</td>
        <td>${emp.height} sm</td>
        <td>${emp.trouserLen} sm</td>
        <td>${emp.trouserWaist} sm</td>
        <td>${emp.head} sm</td>
        <td><span style="color:#EF4444; font-weight:700;">${emp.blood}</span></td>
        <td><span style="color:#F59E0B; font-weight:600;">${emp.rank}</span></td>
        <td><span class="batch-badge">${calc.size} / ${calc.rost}</span></td>
        <td style="font-family:var(--f-mono); font-weight:700; color:#10B981;">${calc.fabricMeter} m</td>
        <td>
          <div style="display:flex; gap:4px;">
            <button type="button" class="batch-row-btn" title="Ushbu o'lchovni CAD ga yuklash" onclick="loadBatchToCad(${idx})">
              CAD
            </button>
            <button type="button" class="batch-row-btn" style="color:#EF4444;" title="O'chirish" onclick="deleteBatchRow(${idx})">
              ✕
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHtml;

  const countSummary = document.getElementById('batchCountSummary');
  if (countSummary) countSummary.textContent = `${batchEmployees.length} nafar xodim`;

  const totalCount = document.getElementById('batchTotalCount');
  if (totalCount) totalCount.textContent = `${batchEmployees.length} komplekt`;

  const badgeCount = document.getElementById('batchBadgeCount');
  if (badgeCount) badgeCount.textContent = `${batchEmployees.length} nafar`;

  const totalFabric = document.getElementById('batchTotalFabric');
  if (totalFabric) totalFabric.textContent = `${totalMeters.toFixed(1)} metr`;
}

function loadBatchToCad(idx) {
  const emp = batchEmployees[idx];
  if (!emp) return;

  cadState.height = emp.height;
  cadState.chest = emp.chest;
  cadState.waist = emp.waist;
  cadState.shoulder = emp.shoulder;
  cadState.sleeve = emp.sleeve;
  cadState.trouserLen = emp.trouserLen;
  cadState.trouserWaist = emp.trouserWaist;
  cadState.head = emp.head;
  cadState.bloodGroup = emp.blood;
  cadState.rank = emp.rank;

  // Sync inputs
  syncTailorInput('Height', emp.height);
  syncTailorInput('Chest', emp.chest);
  syncTailorInput('Waist', emp.waist);
  syncTailorInput('Shoulder', emp.shoulder);
  syncTailorInput('Sleeve', emp.sleeve);
  syncTailorInput('TrouserLen', emp.trouserLen);
  syncTailorInput('TrouserWaist', emp.trouserWaist);
  syncTailorInput('Head', emp.head);

  const bloodEl = document.getElementById('tBloodGroup');
  if (bloodEl) bloodEl.value = emp.blood;
  const rankEl = document.getElementById('tRank');
  if (rankEl) rankEl.value = emp.rank;

  // Switch to Tab 1
  switchCalcTab('tailor');
}

function deleteBatchRow(idx) {
  if (confirm(`Rostdan ham ${batchEmployees[idx].name} o'lchovini o'chirmoqchimisiz?`)) {
    batchEmployees.splice(idx, 1);
    renderBatchTable();
  }
}

function addCurrentToBatch() {
  const name = prompt("Xodimning Ism va Familiyasini kiriting:", "Yangi xodim");
  if (!name) return;

  const newEmp = {
    id: Date.now(),
    name: name.trim(),
    chest: cadState.chest,
    waist: cadState.waist,
    sleeve: cadState.sleeve,
    shoulder: cadState.shoulder,
    height: cadState.height,
    trouserLen: cadState.trouserLen,
    trouserWaist: cadState.trouserWaist,
    head: cadState.head,
    blood: cadState.bloodGroup,
    rank: cadState.rank,
    date: new Date().toISOString().split('T')[0]
  };

  batchEmployees.push(newEmp);
  renderBatchTable();
  switchCalcTab('batch');
}

function openAddBatchModal() {
  const name = prompt("Yangi xodim Ism va Familiyasini kiriting:");
  if (!name) return;
  addCurrentToBatch();
}

// --- CSV Export with UTF-8 BOM ---
function exportBatchCSV() {
  let csv = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  csv += '№;Ism Familiya;Ko\'krak (sm);Bel (sm);Yeng (sm);Yelka (sm);Bo\'y (sm);Shim uzunligi (sm);Shim beli (sm);Bosh (sm);Qon guruhi;Unvoni;Razmer / Rost;Mato sarfi (metr)\r\n';

  batchEmployees.forEach((emp, i) => {
    const calc = calculateGost(emp.height, emp.chest, emp.waist);
    csv += `${i + 1};"${emp.name}";${emp.chest};${emp.waist};${emp.sleeve};${emp.shoulder};${emp.height};${emp.trouserLen};${emp.trouserWaist};${emp.head};"${emp.blood}";"${emp.rank}";"${calc.size}/${calc.rost}";${calc.fabricMeter}\r\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `UMISH_Tikuv_O'lchov_Vedomosti_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Print Clean A4 Measurement Sheet ---
function printTailorSheet() {
  const calc = calculateGost(cadState.height, cadState.chest, cadState.waist);
  const printEl = document.getElementById('printSheet');
  if (!printEl) return;

  printEl.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #111;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
        <div style="display:flex; align-items:center; gap:16px;">
          <img src="assets/umish-logo-light.png" alt="UMISH" style="height:44px; width:auto; display:block;">
          <div>
            <h2 style="margin:0; font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing:.02em;">UMISH — Tikuvchilik & Maxsus Kiyim Fabrikasi</h2>
            <p style="margin:3px 0 0; font-size: 11px; color: #555;">Individual O'lchov va Texnik Lekal Varaqasi (GOST 23134-78)</p>
          </div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #333;">
          <b>Sana:</b> ${new Date().toLocaleDateString('uz-UZ')}<br>
          <b>Hujjat №:</b> UM-${Date.now().toString().slice(-6)}
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div style="border: 1px solid #ccc; padding: 12px; border-radius: 4px;">
          <h3 style="margin-top:0; font-size:14px; border-bottom:1px solid #ddd; padding-bottom:6px;">STANDART RAZMER & QOMAT</h3>
          <p style="font-size:24px; font-weight:bold; color:#0b57d0; margin:10px 0;">${calc.size} / ${calc.rost}-rost</p>
          <p style="font-size:12px; margin:4px 0;"><b>Qomat guruhi (Polnota):</b> ${calc.polnota}</p>
          <p style="font-size:12px; margin:4px 0;"><b>Unvoni / Mansabi:</b> ${cadState.rank}</p>
          <p style="font-size:12px; margin:4px 0;"><b>Qon guruhi:</b> ${cadState.bloodGroup}</p>
          <p style="font-size:12px; margin:4px 0;"><b>Bosh kiyim o'lchami:</b> ${cadState.head}-o'lcham</p>
        </div>

        <div style="border: 1px solid #ccc; padding: 12px; border-radius: 4px;">
          <h3 style="margin-top:0; font-size:14px; border-bottom:1px solid #ddd; padding-bottom:6px;">XOM-ASHYO METRAJI</h3>
          <p style="font-size:20px; font-weight:bold; color:#107c41; margin:10px 0;">${calc.fabricMeter} metr mato</p>
          <p style="font-size:12px; margin:4px 0;"><b>Astar (Podkladka):</b> 1.80 metr</p>
          <p style="font-size:12px; margin:4px 0;"><b>Dublerin:</b> 0.65 metr</p>
          <p style="font-size:12px; margin:4px 0;"><b>Furnitura:</b> 8 ta tugma, 2 ta molniya</p>
        </div>
      </div>

      <h3 style="font-size:14px; border-bottom:1px solid #000; padding-bottom:4px; margin-bottom:10px;">ANIQ ANATOMIK O'LCHOVLAR (SM)</h3>
      <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom: 30px;">
        <thead>
          <tr style="background:#f0f0f0;">
            <th style="border:1px solid #ccc; padding:6px; text-align:left;">Parametr</th>
            <th style="border:1px solid #ccc; padding:6px; text-align:center;">O'lchov (sm)</th>
            <th style="border:1px solid #ccc; padding:6px; text-align:left;">Parametr</th>
            <th style="border:1px solid #ccc; padding:6px; text-align:center;">O'lchov (sm)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #ccc; padding:6px;">Umumiy bo'y (Rost)</td>
            <td style="border:1px solid #ccc; padding:6px; text-align:center; font-weight:bold;">${cadState.height} sm</td>
            <td style="border:1px solid #ccc; padding:6px;">Shim uzunligi (ДБ)</td>
            <td style="border:1px solid #ccc; padding:6px; text-align:center; font-weight:bold;">${cadState.trouserLen} sm</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc; padding:6px;">Ko'krak aylanasi (ОГ)</td>
            <td style="border:1px solid #ccc; padding:6px; text-align:center; font-weight:bold;">${cadState.chest} sm</td>
            <td style="border:1px solid #ccc; padding:6px;">Shim beli (Bel Burka)</td>
            <td style="border:1px solid #ccc; padding:6px; text-align:center; font-weight:bold;">${cadState.trouserWaist} sm</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc; padding:6px;">Bel aylanasi (ОТ)</td>
            <td style="border:1px solid #ccc; padding:6px; text-align:center; font-weight:bold;">${cadState.waist} sm</td>
            <td style="border:1px solid #ccc; padding:6px;">Bo'ksa / Taz aylanasi</td>
            <td style="border:1px solid #ccc; padding:6px; text-align:center; font-weight:bold;">${cadState.hips} sm</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc; padding:6px;">Yelka kengligi (ШП)</td>
            <td style="border:1px solid #ccc; padding:6px; text-align:center; font-weight:bold;">${cadState.shoulder} sm</td>
            <td style="border:1px solid #ccc; padding:6px;">Son aylanasi</td>
            <td style="border:1px solid #ccc; padding:6px; text-align:center; font-weight:bold;">${cadState.thigh} sm</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc; padding:6px;">Yeng uzunligi (ДР)</td>
            <td style="border:1px solid #ccc; padding:6px; text-align:center; font-weight:bold;">${cadState.sleeve} sm</td>
            <td style="border:1px solid #ccc; padding:6px;">Shim poyasi kengligi</td>
            <td style="border:1px solid #ccc; padding:6px; text-align:center; font-weight:bold;">${cadState.trouserBottom} sm</td>
          </tr>
        </tbody>
      </table>

      <div style="display:flex; justify-content:space-between; margin-top:50px; font-size:12px;">
        <div><b>O'lchov oluvchi usta:</b> ___________________ (imzo)</div>
        <div><b>Buyurtmachi vakili:</b> ___________________ (imzo)</div>
      </div>
    </div>
  `;

  printEl.style.display = 'block';
  window.print();
  printEl.style.display = 'none';
}

function printBatchSheet() {
  const printEl = document.getElementById('printSheet');
  if (!printEl) return;

  let trs = '';
  let totalFabric = 0;
  batchEmployees.forEach((emp, i) => {
    const c = calculateGost(emp.height, emp.chest, emp.waist);
    totalFabric += parseFloat(c.fabricMeter);
    trs += `
      <tr>
        <td style="border:1px solid #ccc; padding:5px; text-align:center;">${i + 1}</td>
        <td style="border:1px solid #ccc; padding:5px; font-weight:bold;">${emp.name}</td>
        <td style="border:1px solid #ccc; padding:5px; text-align:center;">${emp.chest}</td>
        <td style="border:1px solid #ccc; padding:5px; text-align:center;">${emp.waist}</td>
        <td style="border:1px solid #ccc; padding:5px; text-align:center;">${emp.sleeve}</td>
        <td style="border:1px solid #ccc; padding:5px; text-align:center;">${emp.shoulder}</td>
        <td style="border:1px solid #ccc; padding:5px; text-align:center;">${emp.height}</td>
        <td style="border:1px solid #ccc; padding:5px; text-align:center;">${emp.trouserLen}</td>
        <td style="border:1px solid #ccc; padding:5px; text-align:center;">${emp.trouserWaist}</td>
        <td style="border:1px solid #ccc; padding:5px; text-align:center;">${emp.head}</td>
        <td style="border:1px solid #ccc; padding:5px; text-align:center;">${emp.blood}</td>
        <td style="border:1px solid #ccc; padding:5px; text-align:center;">${emp.rank}</td>
        <td style="border:1px solid #ccc; padding:5px; text-align:center; font-weight:bold; background:#eef2ff;">${c.size}/${c.rost}</td>
        <td style="border:1px solid #ccc; padding:5px; text-align:center; font-weight:bold;">${c.fabricMeter}m</td>
      </tr>
    `;
  });

  printEl.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; color: #111;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px;">
        <div style="display:flex; align-items:center; gap:16px;">
          <img src="assets/umish-logo-light.png" alt="UMISH" style="height:40px; width:auto; display:block;">
          <div>
            <h2 style="margin:0; font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing:.02em;">UMISH — Tikuv Buyurtmalari va O'lchov Vedomosti</h2>
            <p style="margin:3px 0 0; font-size: 11px; color: #555;">Maxsus va harbiy kiyimlar partiyasi o'lchov ro'yxati (GOST 23134-78)</p>
          </div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #333;">
          <b>Sana:</b> ${new Date().toLocaleDateString('uz-UZ')}<br>
          <b>Jami xodimlar:</b> ${batchEmployees.length} nafar | <b>Jami mato:</b> ${totalFabric.toFixed(1)} metr
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse; font-size:10px; margin-bottom: 24px;">
        <thead>
          <tr style="background:#f0f0f0;">
            <th style="border:1px solid #ccc; padding:5px;">№</th>
            <th style="border:1px solid #ccc; padding:5px;">Ism Familiya</th>
            <th style="border:1px solid #ccc; padding:5px;">Ko'krak</th>
            <th style="border:1px solid #ccc; padding:5px;">Bel</th>
            <th style="border:1px solid #ccc; padding:5px;">Yeng</th>
            <th style="border:1px solid #ccc; padding:5px;">Yelka</th>
            <th style="border:1px solid #ccc; padding:5px;">Bo'y</th>
            <th style="border:1px solid #ccc; padding:5px;">Shim</th>
            <th style="border:1px solid #ccc; padding:5px;">Shim beli</th>
            <th style="border:1px solid #ccc; padding:5px;">Bosh</th>
            <th style="border:1px solid #ccc; padding:5px;">Qon</th>
            <th style="border:1px solid #ccc; padding:5px;">Unvoni</th>
            <th style="border:1px solid #ccc; padding:5px;">Razmer</th>
            <th style="border:1px solid #ccc; padding:5px;">Mato</th>
          </tr>
        </thead>
        <tbody>
          ${trs}
        </tbody>
      </table>

      <div style="display:flex; justify-content:space-between; margin-top:40px; font-size:11px;">
        <div><b>O'lchov oluvchi:</b> ___________________ (imzo)</div>
        <div><b>Mas'ul komissiya:</b> ___________________ (imzo)</div>
      </div>
    </div>
  `;

  printEl.style.display = 'block';
  window.print();
  printEl.style.display = 'none';
}

// --- Submit CAD Order to Lead Modal ---
function submitTailorOrder() {
  const calc = calculateGost(cadState.height, cadState.chest, cadState.waist);
  const srvName = `Smart CAD Tikuv: Razmer ${calc.size}/${calc.rost} (${cadState.rank}, Ko'krak ${cadState.chest}sm, Bel ${cadState.waist}sm, Mato ~${calc.fabricMeter}m)`;

  if (formChip && formChipVal) {
    formChip.hidden = false;
    formChipVal.textContent = srvName;
  }
  const commentEl = document.getElementById('leadComment');
  if (commentEl) {
    commentEl.value = `O'lchov parametrlari:\nRazmer/Rost: ${calc.size}/${calc.rost}\nBo'y: ${cadState.height}sm, Ko'krak: ${cadState.chest}sm, Bel: ${cadState.waist}sm, Yelka: ${cadState.shoulder}sm, Yeng: ${cadState.sleeve}sm, Shim: ${cadState.trouserLen}sm, Beli: ${cadState.trouserWaist}sm, Bosh: ${cadState.head}sm, Qon guruhi: ${cadState.bloodGroup}, Unvon: ${cadState.rank}`;
  }
  if (modal) modal.showModal();
}

function submitBatchOrder() {
  let totalFabric = 0;
  batchEmployees.forEach(e => {
    totalFabric += parseFloat(calculateGost(e.height, e.chest, e.waist).fabricMeter);
  });
  const srvName = `Jamoaviy Partiya Buyurtmasi: ${batchEmployees.length} komplekt (Jami mato ~${totalFabric.toFixed(1)} metr)`;

  if (formChip && formChipVal) {
    formChip.hidden = false;
    formChipVal.textContent = srvName;
  }
  const commentEl = document.getElementById('leadComment');
  if (commentEl) {
    commentEl.value = `Jamoaviy vedomost buyurtmasi: Jami ${batchEmployees.length} nafar xodim uchun o'lchovlar to'liq shakllantirilgan. Umumiy mato talabi: ${totalFabric.toFixed(1)} metr.`;
  }
  if (modal) modal.showModal();
}
