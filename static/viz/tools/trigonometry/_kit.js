// Small shared helpers for the later Trigonometry boxes: an equal-scale world frame, a grid, and draggable world points.
//   const f = eqFrame(stage, [x0, x1], [y0, y1]);   f.px([x, y]) -> canvas, f.inv(X, Y) -> world, f.k = pixels per unit
//   drawGrid(ctx, f, c, stage, { step, axes, labels })
//   pointHandle(() => frame, get, set, { snap, limit }) is a `handles` point that moves a world point [x, y]
import { arc, arrow, label, line } from '../../lib/draw.js';
import { createStage } from '../../lib/stage.js';
import { createPlot } from '../../lib/plot.js';
import { readColors } from '../../lib/colors.js';

export const TAU = Math.PI * 2;
export const rad = (d) => (d * Math.PI) / 180;
export const deg = (r) => (r * 180) / Math.PI;

export function eqFrame(stage, [x0, x1], [y0, y1], pad = 12) {
  const k = Math.min((stage.w - 2 * pad) / (x1 - x0), (stage.h - 2 * pad) / (y1 - y0));
  const ox = stage.w / 2 - ((x0 + x1) / 2) * k;
  const oy = stage.h / 2 + ((y0 + y1) / 2) * k;
  return { k, ox, oy, px: ([x, y]) => [ox + x * k, oy - y * k], inv: (X, Y) => [(X - ox) / k, (oy - Y) / k] };
}

export function drawGrid(ctx, f, c, stage, { step = 1, axes = true, labels = true } = {}) {
  const [xa, yb] = f.inv(0, stage.h);
  const [xb, ya] = f.inv(stage.w, 0);
  for (let x = Math.ceil(xa / step) * step; x <= xb + 1e-9; x += step) {
    const X = f.px([x, 0])[0];
    line(ctx, X, 0, X, stage.h, { color: c.grid, width: 1 });
  }
  for (let y = Math.ceil(yb / step) * step; y <= ya + 1e-9; y += step) {
    const Y = f.px([0, y])[1];
    line(ctx, 0, Y, stage.w, Y, { color: c.grid, width: 1 });
  }
  if (axes) {
    line(ctx, 0, f.oy, stage.w, f.oy, { color: c.ink, width: 2 });
    line(ctx, f.ox, 0, f.ox, stage.h, { color: c.ink, width: 2 });
  }
  if (labels) {
    for (let x = Math.ceil(xa / step) * step; x <= xb + 1e-9; x += step) {
      if (Math.abs(x) > 1e-9) label(ctx, String(Math.round(x * 100) / 100).replace('-', '−'), f.px([x, 0])[0], Math.min(f.oy + 12, stage.h - 8), c, { size: 10, patch: false, bounds: stage });
    }
    for (let y = Math.ceil(yb / step) * step; y <= ya + 1e-9; y += step) {
      if (Math.abs(y) > 1e-9) label(ctx, String(Math.round(y * 100) / 100).replace('-', '−'), Math.max(f.ox - 6, 12), f.px([0, y])[1], c, { size: 10, align: 'right', patch: false, bounds: stage });
    }
  }
}

export function pointHandle(frameOf, get, set, { snap = 0, limit = null, unit = 0 } = {}) {
  return {
    at: () => frameOf().px(get()),
    move(px, py) {
      let [x, y] = frameOf().inv(px, py);
      if (snap) { x = Math.round(x / snap) * snap; y = Math.round(y / snap) * snap; }
      if (limit) [x, y] = limit([x, y]);
      set([x, y]);
    },
    get keyStep() { return unit ? frameOf().k * unit : 6; },
  };
}

// A graph above a stepper's steps. draw(ctx, stage, c, plot) paints; set plot ranges with plot.setRange inside draw.
export function graphFigure(stageEl, { draw, x = [0, 360], y = [-2, 2], ticks = 'auto', label: text }) {
  const c = readColors();
  stageEl.setAttribute('role', 'group');
  stageEl.setAttribute('aria-label', `${text}, followed by the worked solution`);
  const el = document.createElement('div');
  el.className = 'viz-figure';
  stageEl.appendChild(el);
  let plot = null;
  const figure = createStage(el, (ctx, size, stage) => { if (plot) draw(ctx, stage, c, plot); }, { label: text });
  plot = createPlot(figure, { x, y, c, ticks, pad: 26 });
  figure.invalidate();
  return figure;
}

// The angle at P between the rays to Q and R (canvas points), drawn the short way round.
export function angleArc(ctx, P, Q, R, r, opts) {
  const a0 = Math.atan2(Q[1] - P[1], Q[0] - P[0]);
  let d = Math.atan2(R[1] - P[1], R[0] - P[0]) - a0;
  while (d > Math.PI) d -= TAU;
  while (d < -Math.PI) d += TAU;
  arc(ctx, P[0], P[1], r, a0, a0 + d, opts);
  return Math.abs(d);
}

// An arrow between two world points.
export function arrowW(ctx, f, p, q, opts) {
  arrow(ctx, ...f.px(p), ...f.px(q), opts);
}

// A world-space dashed or solid segment.
export function segW(ctx, f, p, q, opts) {
  line(ctx, ...f.px(p), ...f.px(q), opts);
}

// Rings and rays for polar coordinates, centred on the world origin.
export function drawPolarGrid(ctx, f, c, stage, { rMax = 5, ringStep = 1, rayStep = 30, labels = true } = {}) {
  const O = f.px([0, 0]);
  for (let r = ringStep; r <= rMax + 1e-9; r += ringStep) arc(ctx, O[0], O[1], r * f.k, 0, TAU, { color: c.grid, width: 1 });
  for (let a = 0; a < 360; a += rayStep) {
    const p = f.px([rMax * Math.cos(rad(a)), rMax * Math.sin(rad(a))]);
    line(ctx, O[0], O[1], p[0], p[1], { color: c.grid, width: 1 });
    if (labels) {
      const q = f.px([(rMax + 0.55) * Math.cos(rad(a)), (rMax + 0.55) * Math.sin(rad(a))]);
      label(ctx, `${a}°`, q[0], q[1], c, { size: 9, patch: false, bounds: stage });
    }
  }
  line(ctx, O[0] - rMax * f.k, O[1], O[0] + rMax * f.k, O[1], { color: c.ink, width: 2 });
  line(ctx, O[0], O[1] - rMax * f.k, O[0], O[1] + rMax * f.k, { color: c.ink, width: 2 });
}

// A handle that moves a point given as polar { r, th } (degrees) in steps. get() -> { r, th }; set({ r, th }).
export function polarHandle(frameOf, get, set, { rStep = 0.5, thStep = 15, rMin = 0, rMax = 5 } = {}) {
  return {
    at: () => { const { r, th } = get(); return frameOf().px([r * Math.cos(rad(th)), r * Math.sin(rad(th))]); },
    move(px, py) {
      const [x, y] = frameOf().inv(px, py);
      const r = Math.max(rMin, Math.min(rMax, Math.round(Math.hypot(x, y) / rStep) * rStep));
      const th = (Math.round(((deg(Math.atan2(y, x)) + 360) % 360) / thStep) * thStep) % 360;
      set({ r, th });
    },
    nudge(direction) { const { r, th } = get(); set({ r, th: (th + direction * thStep + 360) % 360 }); },
  };
}

// A stage inside a stepper's stage, for a picture above the steps. draw(ctx, stage, c).
export function planeFigure(stageEl, { draw, label: text }) {
  const c = readColors();
  stageEl.setAttribute('role', 'group');
  stageEl.setAttribute('aria-label', `${text}, followed by the worked solution`);
  const el = document.createElement('div');
  el.className = 'viz-figure';
  stageEl.appendChild(el);
  return createStage(el, (ctx, size, stage) => draw(ctx, stage, c), { label: text });
}
