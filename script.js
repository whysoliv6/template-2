// Smooth inertia scrolling (Lenis)
if (window.Lenis) {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      if (target || id === '') {
        e.preventDefault();
        lenis.scrollTo(target || 0);
      }
    });
  });
}

// Scroll-reveal animations
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));
  // Safety net: never leave content permanently invisible if the observer
  // never fires (e.g. backgrounded tab on load).
  setTimeout(() => revealEls.forEach(el => el.classList.add('is-visible')), 4000);
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// Animated count-up stats
const countEls = document.querySelectorAll('[data-countup]');
function runCountUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const target = parseFloat(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(eased * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
if ('IntersectionObserver' in window) {
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      runCountUp(entry.target);
      countObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  countEls.forEach(el => countObserver.observe(el));
  setTimeout(() => countEls.forEach(runCountUp), 4000);
} else {
  countEls.forEach(runCountUp);
}

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle?.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});
mainNav?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mainNav.classList.remove('open'));
});

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    item.classList.toggle('open', !isOpen);
    q.querySelector('span').textContent = !isOpen ? '−' : '+';
  });
});

// Services tabs
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector(`.tab-panel[data-panel="${tab.dataset.tab}"]`).classList.add('active');
  });
});

// Contact form — logs the lead to a Google Sheet (if configured) then hands off to WhatsApp
const KAIRUS_WHATSAPP = '5585998333612';
// Paste the URL from your Google Apps Script deployment (see docs/GOOGLE_SHEETS_SETUP.md).
// Leave empty to skip sheet logging and go straight to WhatsApp.
const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxH8AxkVY_7SUa87zKM6x11hRY_2imDSqSaayrm_0zGeBfu8r8_aYzxtnmtA5i2jNDE/exec';

const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = contactForm.name.value.trim();
  const whatsapp = contactForm.whatsapp.value.trim();
  const mensagem = contactForm.message.value.trim();

  if (SHEET_ENDPOINT) {
    fetch(SHEET_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ nome, whatsapp, mensagem, origem: 'site' })
    }).catch(() => {});
  }

  const texto = `Olá! Meu nome é ${nome}.\nMeu WhatsApp: ${whatsapp}\n\nSobre o projeto: ${mensagem}`;
  const link = `https://wa.me/${KAIRUS_WHATSAPP}?text=${encodeURIComponent(texto)}`;

  formNote.textContent = 'Abrindo o WhatsApp...';
  contactForm.reset();
  window.open(link, '_blank');
});
