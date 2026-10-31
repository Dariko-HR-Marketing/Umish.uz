function updateCalc() {
  const sector = document.getElementById('calcSector').value;
  const item = document.getElementById('calcItem').value;
  const qty = parseInt(document.getElementById('calcQty').value, 10);
  const qtyVal = document.getElementById('calcQtyVal');
  if (qtyVal) qtyVal.textContent = qty + ' dona';

  const P = UMISH_PRICING;

  // Bazaviy narx: soha + komplekt turi + opsiyalar
  let basePrice = P.base[sector] ?? P.defaultBase;
  const it = P.items[item];
  if (it) basePrice = it.fixed !== undefined ? it.fixed : basePrice + (it.add || 0);
  Object.keys(P.options).forEach(id => {
    const el = document.getElementById(id);
    if (el && el.checked) basePrice += P.options[id];
  });

  // Miqdor bo'yicha chegirma
  const tier = P.tiers.find(t => qty >= t.min);
  const discountPct = tier ? tier.pct : 0;
  const discountLabel = tier ? tier.label : P.defaultTierLabel;

  const discountedUnit = Math.round(basePrice * (1 - discountPct));
  const total = discountedUnit * qty;

  const sectorNames = P.sectorNames;

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
renderCalcNext("tailor");
