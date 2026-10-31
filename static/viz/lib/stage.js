// A canvas that fills its container at devicePixelRatio resolution.
// draw(ctx, size) is called with a CSS-pixel coordinate system; call stage.redraw() after state changes.
export function createStage(container, draw, { label = '' } = {}) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  if (label) canvas.setAttribute('aria-label', label);
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const stage = { canvas, ctx, size: 0, redraw };

  function resize() {
    // clientWidth/Height exclude the stage's border, matching the canvas box
    const size = Math.round(Math.min(container.clientWidth, container.clientHeight || container.clientWidth));
    if (size < 1) return;
    const dpr = window.devicePixelRatio || 1;
    stage.size = size;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  function redraw() {
    if (!stage.size) return;
    ctx.clearRect(0, 0, stage.size, stage.size);
    draw(ctx, stage.size);
  }

  new ResizeObserver(resize).observe(container);
  resize();
  return stage;
}

// Pointer drag (mouse, touch, pen) plus arrow keys when the canvas has focus.
// handlers: { start(x, y) -> bool (true to begin a drag), move(x, y), end(), key(name, event) -> bool }
export function enableDrag(canvas, handlers) {
  canvas.tabIndex = 0;
  let dragging = false;
  const point = (e) => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  canvas.addEventListener('pointerdown', (e) => {
    const [x, y] = point(e);
    if (handlers.start(x, y)) {
      dragging = true;
      canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (dragging) handlers.move(...point(e));
  });
  const stop = () => {
    if (dragging && handlers.end) handlers.end();
    dragging = false;
  };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);
  canvas.addEventListener('keydown', (e) => {
    if (handlers.key && handlers.key(e.key, e)) e.preventDefault();
  });
}
