import { createTool } from '../../lib/tool.js';
import { createBench } from '../../lib/rays.js';
import { handles } from '../../lib/stage.js';
import { line, dot, label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { MU0, sumField, loopPieces } from './_sources-of-magnetic-field-math.js';
import { angleBetween } from './_loops-meters-math.js';

// The solenoid is L long and R wide; its axis is x. We look at the plane through the axis.
const L = 3;
const R = 0.5;
const LOOPS = 20;
const I0 = 1; // A
const state = { show: 'both', px: 2.4, py: 1.1 };
const pieces = [];
for (let i = 0; i < LOOPS; i++) pieces.push(...loopPieces(R, 24, -L / 2 + (L * (i + 0.5)) / LOOPS));
const solenoid = (x, y) => {
  const B = sumField(I0, pieces, [x, y, 0]);
  return [B[0], B[1]];
};
// the magnet: a pole of strength q at each end. q = m / L with m = N I A
const Q = (LOOPS * I0 * Math.PI * R * R) / L;
const magnet = (x, y) => {
  const out = [0, 0];
  for (const [px, sign] of [[L / 2, 1], [-L / 2, -1]]) {
    const dx = x - px;
    const r = Math.hypot(dx, y);
    const k = (sign * (MU0 / (4 * Math.PI)) * Q) / r ** 3;
    out[0] += k * dx;
    out[1] += k * y;
  }
  return out;
};

function trace(f, start, { h = 0.06, steps = 500, stop = () => false } = {}) {
  const pts = [start];
  let p = start;
  for (let i = 0; i < steps; i++) {
    const B1 = f(p[0], p[1]);
    const m1 = Math.hypot(...B1);
    if (m1 === 0) break;
    const mid = [p[0] + (B1[0] / m1) * h / 2, p[1] + (B1[1] / m1) * h / 2];
    const B2 = f(mid[0], mid[1]);
    const m2 = Math.hypot(...B2);
    p = [p[0] + (B2[0] / m2) * h, p[1] + (B2[1] / m2) * h];
    pts.push(p);
    if (Math.abs(p[0]) > 7 || Math.abs(p[1]) > 7 || stop(p, i)) break;
  }
  return pts;
}
const solLines = [-0.4, -0.25, -0.1, 0.1, 0.25, 0.4].map((y0) => trace(solenoid, [0, y0], { stop: (p, i) => i > 20 && Math.hypot(p[0], p[1] - y0) < 0.06 }));
const magLines = [];
for (let k = 0; k < 9; k++) {
  const a = -Math.PI / 2 + (Math.PI * (k + 0.5)) / 9;
  magLines.push(trace(magnet, [L / 2 + 0.12 * Math.cos(a), 0.12 * Math.sin(a)], { stop: (p) => Math.hypot(p[0] + L / 2, p[1]) < 0.12 }));
}

const tool = createTool({
  state,
  label: 'The field lines of a solenoid, in blue, and of a bar magnet with a north pole at the right end, in coral. Outside the magnet they follow each other closely. A draggable probe point compares the two fields at one place.',
  setup: (stage, c) => createBench(stage, { x: [-5, 5], cy: 0.5, c }),
  draw(ctx, stage, c, bench) {
    // the solenoid body
    const [x0, y0] = bench.toPx(-L / 2, R);
    const [x1, y1] = bench.toPx(L / 2, -R);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.fillStyle = c.fillY;
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.fillStyle = c.fillA;
    ctx.fillRect((x0 + x1) / 2, y0, (x1 - x0) / 2, y1 - y0);
    ctx.fillStyle = c.fillB;
    ctx.fillRect(x0, y0, (x1 - x0) / 2, y1 - y0);
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    label(ctx, 'S', (x0 + (x0 + x1) / 2) / 2, (y0 + y1) / 2, c, { color: c.ink, size: 14, patch: false });
    label(ctx, 'N', (x1 + (x0 + x1) / 2) / 2, (y0 + y1) / 2, c, { color: c.ink, size: 14, patch: false });
    const path = (pts, color, dash) => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => {
        const [px, py] = bench.toPx(x, y);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.setLineDash(dash);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    if (state.show !== 'magnet') for (const pts of solLines) { path(pts, c.b, []); path(pts.map(([x, y]) => [x, -y]), c.b, []); }
    if (state.show !== 'solenoid') for (const pts of magLines) { path(pts, c.a, state.show === 'both' ? [6, 5] : []); path(pts.map(([x, y]) => [x, -y]), c.a, state.show === 'both' ? [6, 5] : []); }
    const [qx, qy] = bench.toPx(state.px, state.py);
    dot(ctx, qx, qy, 8, c.fillC, c.ink);
    line(ctx, qx - 12, qy, qx + 12, qy, { color: c.ink, width: 1 });
  },
  controls: () => [
    { title: 'Compare the two' },
    { key: 'show', label: 'Show', options: [['both', 'Both'], ['solenoid', 'Solenoid'], ['magnet', 'Bar magnet']] },
    { text: 'Drag the green probe point.' },
    { readout: [
      ['B, solenoid', (s) => `${sig(Math.hypot(...solenoid(s.px, s.py)) * 1e6, 3)} μT`],
      ['B, bar magnet', (s) => `${sig(Math.hypot(...magnet(s.px, s.py)) * 1e6, 3)} μT`],
      ['Angle between them', (s) => `${fixed(angleBetween(solenoid(s.px, s.py), magnet(s.px, s.py)), 1)}°`],
    ] },
  ],
  tex: (s) => `m=NIA=${LOOPS}\\times ${I0}\\times ${sig(Math.PI * R * R, 3)}=${sig(LOOPS * I0 * Math.PI * R * R, 3)}\\ \\text{A m}^2`,
});

const keep = () => {
  state.px = Math.max(-4.8, Math.min(4.8, state.px));
  state.py = Math.max(0.05, Math.min(3.2, state.py));
};
handles(tool.stage, [{
  at: () => tool.extra.toPx(state.px, state.py),
  move(px, py) {
    [state.px, state.py] = tool.extra.toWorld(px, py);
    keep();
  },
  keyStep: 0,
  nudge: undefined,
}], { onChange: () => tool.update(), keyStep: 6 });
tool.update();
