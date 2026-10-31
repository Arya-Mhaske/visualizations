// requestAnimationFrame loop that pauses when the tab is hidden, the stage is off-screen,
// or the student prefers reduced motion (in which case it never starts).
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createLoop(target, step) {
  let wanted = false;
  let visible = true;
  let frame = 0;
  let last = 0;

  const running = () => wanted && visible && !document.hidden && !reducedMotion();

  function tick(now) {
    frame = 0;
    if (!running()) return;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    step(dt);
    frame = requestAnimationFrame(tick);
  }

  function kick() {
    if (running() && !frame) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }

  new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    kick();
  }).observe(target);
  document.addEventListener('visibilitychange', kick);

  return {
    start() { wanted = true; kick(); return !reducedMotion(); },
    stop() { wanted = false; },
    get playing() { return wanted; },
  };
}
