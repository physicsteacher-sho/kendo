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
