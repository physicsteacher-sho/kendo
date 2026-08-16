const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');

const onScroll = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 40);
};

const setMenuState = (open, { returnFocus = false } = {}) => {
  if (!menuButton || !menu) return;

  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  menu.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);

  if (returnFocus) menuButton.focus();
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  setMenuState(!isOpen);
});

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenuState(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    setMenuState(false, { returnFocus: true });
  }
});

const desktopQuery = window.matchMedia('(min-width: 901px)');
const resetMenuForViewport = () => {
  if (desktopQuery.matches) setMenuState(false);
};

desktopQuery.addEventListener?.('change', resetMenuForViewport);
window.addEventListener('orientationchange', () => setMenuState(false));

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
}

/* --- OPENING：スクロール進行度を --p (0〜1) として渡す ------------------- */
(function () {
  const opening = document.querySelector('.opening');
  if (!opening) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;

  // iOS はスクロール中にアドレスバーが伸縮する。svh は小さい方に固定されるため
  // sticky の高さと実ビューポートがずれて引っかかる。実寸を測って固定する。
  let vh = 0;
  const setVh = () => {
    const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    // バーの伸縮（数十px）では測り直さない。回転など大きな変化のときだけ更新する。
    if (Math.abs(h - vh) < 120) return;
    vh = h;
    opening.style.setProperty('--vh', h + 'px');
  };

  const update = () => {
    ticking = false;
    if (reduce.matches) { opening.style.removeProperty('--p'); return; }
    const rect = opening.getBoundingClientRect();
    const travel = opening.offsetHeight - (vh || window.innerHeight);
    if (travel <= 0) { opening.style.setProperty('--p', '0'); return; }
    const p = Math.min(Math.max(-rect.top / travel, 0), 1);
    opening.style.setProperty('--p', p.toFixed(4));
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { setVh(); onScroll(); });
  window.addEventListener('orientationchange', () => { setVh(); onScroll(); });
  reduce.addEventListener('change', update);
  setVh();
  update();
})();
