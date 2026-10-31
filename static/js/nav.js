// On every device, hide the sticky navbar while scrolling down and bring it back on scroll up.
const nav = document.querySelector('.nb-nav');
if (nav) {
  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (y <= nav.offsetHeight || delta < -4) nav.classList.remove('is-hidden');
      else if (delta > 4) nav.classList.add('is-hidden');
      if (Math.abs(delta) > 4) lastY = y;
      ticking = false;
    });
  }, { passive: true });
}
