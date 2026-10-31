// Stages: a canvas or SVG that fills .viz-stage at exact device pixels and redraws only on change.
//   createStage(el, draw, {label})   draw(ctx, size, stage); stage has .w .h .size .ctx .canvas
//     stage.redraw()      draws now.  stage.invalidate()  draws once on the next frame, and waits
//                         while the stage is off-screen or the tab is hidden.
//   createSvgStage(el, draw, {label}) draw(svg, w, h) with an emptied <svg>; add shapes with svgEl().
//   enableDrag(canvas, handlers)     pointer drag (mouse, touch, pen) plus keys.
//   handles(stage, points, options)  draggable points with arrow keys; Enter moves to the next point.

function watchVisible(el, onVisible) {
  const state = { onScreen: true };
  new IntersectionObserver((entries) => {
    state.onScreen = entries[entries.length - 1].isIntersecting;
    if (state.onScreen) onVisible();
  }).observe(el);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) onVisible(); });
  return state;
}

export function createStage(container, draw, { label = '' } = {}) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  if (label) canvas.setAttribute('aria-label', label);
  container.appendChild(canvas);
  // Opaque, so the browser can use its sharper LCD text smoothing. redraw() paints the stage background first.
  const ctx = canvas.getContext('2d', { alpha: false });
  const stage = { canvas, ctx, size: 0, w: 0, h: 0, redraw, invalidate };
  let frame = 0;
  let dirty = false;

  // The canvas must cover a whole number of device pixels and its buffer must match them exactly, or the browser
  // resamples the whole picture and it blurs. A grid column is usually a fractional width, so the buffer rounds down
  // and the canvas is sized to it (never more than one device pixel short of the stage). stage.w and stage.h can be
  // fractional: they are that size in CSS pixels, so a drawn pixel lands on a real one.
  function measure() {
    const dpr = window.devicePixelRatio || 1;
    const box = container.getBoundingClientRect();
    const inner = [box.width - container.offsetWidth + container.clientWidth, box.height - container.offsetHeight + container.clientHeight];
    const pixelW = Math.floor(inner[0] * dpr + 1e-6);
    const pixelH = Math.floor((inner[1] || inner[0]) * dpr + 1e-6);
    if (pixelW < 1 || pixelH < 1) return;
    const [w, h] = [pixelW / dpr, pixelH / dpr];
    Object.assign(stage, { w, h, size: Math.min(w, h) });
    canvas.width = pixelW;
    canvas.height = pixelH;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  function redraw() {
    if (!stage.w) return;
    dirty = false;
    ctx.fillStyle = getComputedStyle(container).backgroundColor;
    ctx.fillRect(0, 0, stage.w, stage.h);
    draw(ctx, stage.size, stage);
  }

  function flush() {
    frame = 0;
    if (dirty && seen.onScreen && !document.hidden) redraw();
  }

  function invalidate() {
    dirty = true;
    if (!frame) frame = requestAnimationFrame(flush);
  }

  const seen = watchVisible(container, () => { if (dirty) invalidate(); });
  new ResizeObserver(measure).observe(container);
  // A zoom, or a move to another monitor, may change the display scale with no change of layout (wide pages are capped).
  // Browsers differ in which of these two fire, so both are watched; a repeat does nothing.
  let scale = 0;
  const followScale = () => {
    const now = window.devicePixelRatio || 1;
    if (now === scale) return;
    scale = now;
    measure();
    matchMedia(`(resolution: ${now}dppx)`).addEventListener('change', followScale, { once: true });
  };
  window.addEventListener('resize', followScale);
  followScale();
  return stage;
}

export function svgEl(parent, tag, attrs = {}, text = '') {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (text) node.textContent = text;
  if (parent) parent.appendChild(node);
  return node;
}

export function createSvgStage(container, draw, { label = '' } = {}) {
  const svg = svgEl(container, 'svg', { role: 'img' });
  if (label) svg.setAttribute('aria-label', label);
  const stage = { svg, w: 0, h: 0, redraw, invalidate: redraw };

  function redraw() {
    if (!stage.w) return;
    svg.replaceChildren();
    draw(svg, stage.w, stage.h);
  }

  new ResizeObserver(() => {
    stage.w = container.clientWidth;
    stage.h = container.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${stage.w} ${stage.h}`);
    redraw();
  }).observe(container);
  return stage;
}

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

const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

// points: [{ at() -> [px, py], move(px, py), keyStep?, nudge? }], in stage pixels. A point that turns about a
// centre must give nudge(direction): direction is +1 for right/up and −1 for left/down, because a pixel step
// along the ray would change nothing.
// options: radius (touch target), keyStep (pixels per arrow press), pan(dx, dy) for a drag that misses
// every point (a 3D scene uses this to orbit), onChange() after every move.
// Returns { active }: the index of the point the keyboard moves, so a tool can ring it when drawing.
export function handles(stage, points, { radius = 24, keyStep = 4, pan = null, onChange = () => {} } = {}) {
  const state = { active: 0 };
  let grabbed = -1;
  let last = null;
  enableDrag(stage.canvas, {
    start(x, y) {
      let best = radius;
      grabbed = -1;
      points.forEach((point, i) => {
        const [px, py] = point.at();
        const distance = Math.hypot(px - x, py - y);
        if (distance <= best) { best = distance; grabbed = i; }
      });
      if (grabbed >= 0) state.active = grabbed;
      last = [x, y];
      return grabbed >= 0 || Boolean(pan);
    },
    move(x, y) {
      if (grabbed >= 0) points[grabbed].move(x, y);
      else if (pan) pan(x - last[0], y - last[1]);
      last = [x, y];
      onChange();
    },
    key(name) {
      if ((name === 'Enter' || name === ' ') && points.length > 1) {
        state.active = (state.active + 1) % points.length;
        onChange();
        return true;
      }
      const arrow = ARROWS[name];
      const point = points[state.active];
      if (!arrow || !point) return false;
      if (point.nudge) {
        point.nudge(arrow[0] - arrow[1]);
        onChange();
        return true;
      }
      const [px, py] = point.at();
      const step = point.keyStep || keyStep;
      point.move(px + arrow[0] * step, py + arrow[1] * step);
      onChange();
      return true;
    },
  });
  return state;
}
