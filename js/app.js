// --- 1. Reticle Cursor Follower ---
const reticle = document.querySelector('[data-reticle]');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let curX = mouseX, curY = mouseY;
let isMoving = false;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (!isMoving && reticle) {
    reticle.style.opacity = '1';
    isMoving = true;
    requestAnimationFrame(renderReticle);
  }
});

function renderReticle() {
  curX += (mouseX - curX) * 0.18;
  curY += (mouseY - curY) * 0.18;
  if (reticle) {
    reticle.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
  }
  requestAnimationFrame(renderReticle);
}

// --- 2. Scroll Reveal Observer (.rv) ---
const rvElements = document.querySelectorAll('.rv');
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  rvElements.forEach(el => obs.observe(el));
} else {
  rvElements.forEach(el => el.classList.add('in'));
}

// --- 3. Mobile Navigation Toggle ---
const burger = document.getElementById('burgerBtn');
const mnav = document.getElementById('mnav');
if (burger && mnav) {
  burger.addEventListener('click', () => {
    const open = mnav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.m-link').forEach(link => {
    link.addEventListener('click', () => {
      mnav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

// --- 4. Modal Open & Close Handlers ---
const modal = document.getElementById('leadModal');
const modalClose = document.getElementById('modalCloseBtn');
const formChip = document.getElementById('formChip');
const formChipVal = document.getElementById('formChipVal');
const leadServiceSelect = document.getElementById('leadService');

document.querySelectorAll('[data-open-form]').forEach(btn => {
  btn.addEventListener('click', () => {
    const srv = btn.getAttribute('data-service') || '';
    if (srv && formChip && formChipVal) {
      formChip.hidden = false;
      formChipVal.textContent = srv;
      if (leadServiceSelect) {
        for (let opt of leadServiceSelect.options) {
          if (opt.text.toLowerCase().includes(srv.toLowerCase()) || opt.value.toLowerCase().includes(srv.toLowerCase())) {
            leadServiceSelect.value = opt.value;
            break;
          }
        }
      }
    } else if (formChip) {
      formChip.hidden = true;
    }
    if (modal) {
      modal.showModal();
    }
  });
});

if (modalClose && modal) {
  modalClose.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => {
    const rect = modal.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      modal.close();
    }
  });
}

// --- 4.1 Uniform Service Cards Interactive Carousel ---
function getCarouselTrack(btnOrEl) {
  return btnOrEl.closest('.svc-art-wrap');
}

function showCardSlide(wrap, targetIndex) {
  if (!wrap) return;
  const slides = wrap.querySelectorAll('.svc-slide');
  const dots = wrap.querySelectorAll('.svc-c-dot');
  if (!slides.length) return;

  const total = slides.length;
  const newIndex = (targetIndex + total) % total;

  slides.forEach((sl, idx) => {
    if (idx === newIndex) {
      sl.classList.add('is-active');
    } else {
      sl.classList.remove('is-active');
    }
  });

  dots.forEach((dot, idx) => {
    if (idx === newIndex) {
      dot.classList.add('is-active');
    } else {
      dot.classList.remove('is-active');
    }
  });
}

function moveCardSlide(btn, delta) {
  const wrap = getCarouselTrack(btn);
  if (!wrap) return;
  const slides = wrap.querySelectorAll('.svc-slide');
  let currentIdx = 0;
  slides.forEach((sl, idx) => {
    if (sl.classList.contains('is-active')) currentIdx = idx;
  });
  showCardSlide(wrap, currentIdx + delta);
}

function goToCardSlide(dotBtn, index) {
  const wrap = getCarouselTrack(dotBtn);
  showCardSlide(wrap, index);
}

// Lightbox Modal Controls
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');

function openLightbox(src, title) {
  if (!lightboxModal || !lightboxImg) return;
  lightboxImg.src = src;
  if (lightboxTitle) lightboxTitle.textContent = title || "UMISH Uniforma Ko'rinishi";
  lightboxModal.showModal();
}

function openLightboxCurrent(btn) {
  const wrap = getCarouselTrack(btn);
  if (!wrap) return;
  const activeSlide = wrap.querySelector('.svc-slide.is-active');
  if (!activeSlide) return;
  const img = activeSlide.querySelector('img');
  const badge = activeSlide.querySelector('.svc-slide-badge');
  const title = badge ? badge.textContent.trim() : (img ? img.alt : "Uniforma");
  if (img) {
    openLightbox(img.dataset.full || img.currentSrc || img.src, title);
  }
}

function closeLightbox() {
  if (lightboxModal) lightboxModal.close();
}

if (lightboxModal) {
  lightboxModal.addEventListener('click', (e) => {
    const rect = lightboxModal.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      lightboxModal.close();
    }
  });
}

// Touch swipe support for carousels on mobile
document.querySelectorAll('.svc-art-wrap[data-carousel]').forEach(wrap => {
  let touchStartX = 0;
  let touchEndX = 0;

  wrap.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  wrap.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      const slides = wrap.querySelectorAll('.svc-slide');
      let currentIdx = 0;
      slides.forEach((sl, idx) => { if (sl.classList.contains('is-active')) currentIdx = idx; });
      if (diff > 0) {
        // Swiped left -> next slide
        showCardSlide(wrap, currentIdx + 1);
      } else {
        // Swiped right -> prev slide
        showCardSlide(wrap, currentIdx - 1);
      }
    }
  }, { passive: true });
});

// --- 5. Telegram Chat FAB Toggle ---
const chatWidget = document.getElementById('chatWidget');
const chatFabBtn = document.getElementById('chatFabBtn');
const chatCloseBtn = document.getElementById('chatCloseBtn');
const umChat = document.getElementById('um-chat');

if (chatFabBtn && chatWidget) {
  chatFabBtn.addEventListener('click', () => {
    const isOpen = chatWidget.hasAttribute('data-open');
    if (isOpen) {
      chatWidget.removeAttribute('data-open');
      if (umChat) umChat.hidden = true;
      chatFabBtn.setAttribute('aria-expanded', 'false');
    } else {
      chatWidget.setAttribute('data-open', '');
      if (umChat) umChat.hidden = false;
      chatFabBtn.setAttribute('aria-expanded', 'true');
    }
  });
}
if (chatCloseBtn && chatWidget) {
  chatCloseBtn.addEventListener('click', () => {
    chatWidget.removeAttribute('data-open');
    if (umChat) umChat.hidden = true;
    if (chatFabBtn) chatFabBtn.setAttribute('aria-expanded', 'false');
  });
}

// --- 6. Map Switcher (Google vs Yandex) ---
function switchMap(type) {
  const mapFrame = document.getElementById('mapFrame');
  const mapLink = document.getElementById('mapLink');
  const btnG = document.getElementById('mapTabG');
  const btnY = document.getElementById('mapTabY');

  if (type === 'g') {
    if (mapFrame) mapFrame.src = 'https://maps.google.com/maps?q=41.2777,69.2045&z=16&output=embed';
    if (mapLink) mapLink.href = 'https://maps.google.com/?q=41.2777,69.2045';
    if (btnG) btnG.setAttribute('aria-selected', 'true');
    if (btnY) btnY.setAttribute('aria-selected', 'false');
  } else {
    if (mapFrame) mapFrame.src = 'https://yandex.uz/map-widget/v1/?ll=69.2045%2C41.2777&z=16';
    if (mapLink) mapLink.href = 'https://yandex.uz/maps/?ll=69.2045%2C41.2777&z=16';
    if (btnG) btnG.setAttribute('aria-selected', 'false');
    if (btnY) btnY.setAttribute('aria-selected', 'true');
  }
}

// --- 7. Interactive B2B Calculator Logic ---

// --- 8. Form Submission Handling ---
function handleFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('leadName').value.trim();
  const phone = document.getElementById('leadPhone').value.trim();
  let hasErr = false;

  const nameErr = document.getElementById('nameErr');
  const phoneErr = document.getElementById('phoneErr');

  if (name.length < 2) {
    nameErr.textContent = "Iltimos, ismingizni to'liq kiriting.";
    hasErr = true;
  } else {
    nameErr.textContent = "";
  }

  if (phone.length < 9) {
    phoneErr.textContent = "Telefon raqamini to'liq kiriting.";
    hasErr = true;
  } else {
    phoneErr.textContent = "";
  }

  if (hasErr) return;

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = "Yuborilmoqda...";

  setTimeout(() => {
    const host = document.getElementById('formHost');
    const okTpl = document.getElementById('okTpl');
    if (host && okTpl) {
      host.innerHTML = '';
      const clone = okTpl.content.cloneNode(true);
      const code = '#UM-' + Math.floor(1000 + Math.random() * 9000);
      const codeEl = clone.getElementById('leadCode');
      if (codeEl) codeEl.textContent = code;
      host.appendChild(clone);
    }
  }, 600);
}

// --- 9. Helpers ---

function toggleLanguage(lang) {
  if (lang === 'ru') {
    const ruModal = document.getElementById('ruModal');
    if (ruModal) ruModal.showModal();
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function closeRuModal() {
  const ruModal = document.getElementById('ruModal');
  if (ruModal) ruModal.close();
}
