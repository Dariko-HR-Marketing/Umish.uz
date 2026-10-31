function updateCalc() {
  const sector = document.getElementById('calcSector').value;
  const item = document.getElementById('calcItem').value;
  const qty = parseInt(document.getElementById('calcQty').value, 10);
  const qtyVal = document.getElementById('calcQtyVal');
  if (qtyVal) qtyVal.textContent = qty + ' dona';

  // Base price table
  let basePrice = 240000;
  if (sector === 'harbiy') basePrice = 420000;
  else if (sector === 'iiv') basePrice = 380000;
  else if (sector === 'sanoat') basePrice = 250000;
  else if (sector === 'tibbiyot') basePrice = 195000;
  else if (sector === 'horeca') basePrice = 220000;
  else if (sector === 'korporativ') basePrice = 180000;

  if (item === 'full') basePrice += 90000;
  else if (item === 'kombinezon') basePrice += 40000;
  else if (item === 'polo') basePrice = 160000;

  // Options
  if (document.getElementById('calcOptEmbroidery').checked) basePrice += 20000;
  if (document.getElementById('calcOptReflect').checked) basePrice += 15000;
  if (document.getElementById('calcOptFireproof').checked) basePrice += 35000;

  // Discount tier
  let discountPct = 0;
  let discountLabel = "Chakana / O'rta partiya";
  if (qty >= 500) {
    discountPct = 0.18;
    discountLabel = "-18% (Katta zavod partiyasi)";
  } else if (qty >= 200) {
    discountPct = 0.14;
    discountLabel = "-14% (Katta korxona partiyasi)";
  } else if (qty >= 50) {
    discountPct = 0.10;
    discountLabel = "-10% (Ulgurji narx)";
  }

  const discountedUnit = Math.round(basePrice * (1 - discountPct));
  const total = discountedUnit * qty;

  const sectorNames = {
    harbiy: "Harbiy & Maxsus",
    iiv: "IIV & Xavfsizlik",
    sanoat: "Sanoat & Spetsodejda",
    tibbiyot: "Tibbiyot & Klinika",
    horeca: "HoReCa & Restoran",
    korporativ: "Korporativ & Ofis"
  };

  document.getElementById('resSector').textContent = sectorNames[sector] || sector;
  document.getElementById('resQty').textContent = qty + ' dona';
  document.getElementById('resUnitPrice').textContent = discountedUnit.toLocaleString('uz-UZ') + " so'm";
  document.getElementById('resDiscount').textContent = discountLabel;
  document.getElementById('resTotal').textContent = total.toLocaleString('uz-UZ') + " so'm";
}

function submitCalcOrder() {
  const qty = document.getElementById('calcQty').value;
  const sector = document.getElementById('resSector').textContent;
  const total = document.getElementById('resTotal').textContent;
  const srvName = `Kalkulyator: ${sector} (${qty} dona, jami: ${total})`;
  
  if (formChip && formChipVal) {
    formChip.hidden = false;
    formChipVal.textContent = srvName;
  }
  if (modal) modal.showModal();
}

// Soha kartasidan kalkulyatorga o'tish: soha oldindan tanlanadi, 3-tab (narx) ochiladi
function goToCalc(sector) {
  const sel = document.getElementById('calcSector');
  if (sel && sector) sel.value = sector;
  updateCalc();
  switchCalcTab('budget');
  const target = document.getElementById('kalkulyator');
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const res = document.getElementById('resTotal');
  if (res) {
    const card = res.closest('.calc-total') || res.parentElement;
    card.classList.remove('is-flash'); void card.offsetWidth; card.classList.add('is-flash');
  }
}

// Initial calculation on load
updateCalc();
// Initial CAD and Batch load
updateTailorCad();
renderBatchTable();
