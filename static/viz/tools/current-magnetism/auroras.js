import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { mirrorPath, mirrorPoint } from './_magnetic-force-on-charges-math.js';

// z runs along a field line, from one pole (−) to the other (+). The equator is z = 0. Units: B0 = 1, q/m = 1, v = 1.
const Z_ATM = 3; // where the field line meets the atmosphere
const state = { theta: 25, k: 0.3, t: 3 };
const CYCLE = 9;
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const rad = (d) => (d * Math.PI) / 180;
const ratioAt = (s, z) => 1 + s.k * z * z;
const critical = (s) => (Math.asin(Math.sqrt(1 / ratioAt(s, Z_ATM))) * 180) / Math.PI;
const hits = (s) => mirrorPoint(s.theta, s.k) > Z_ATM;
let cache = { key: '', path: [] };
function pathOf(s) {
  const key = `${s.theta}|${s.k}`;
  if (cache.key !== key) {
    const full = mirrorPath({ v: 1, thetaDeg: s.theta, k: s.k, steps: 9000, dt: 0.003 });
    const stop = full.findIndex((p) => Math.abs(p.z) >= Z_ATM);
    cache = { key, path: stop >= 0 ? full.slice(0, stop + 1) : full };
  }
  return cache.path;
}

const tool = createTool({
  state,
  label: 'A charged particle spiralling along a field line that narrows towards the poles. If it starts nearly along the field it reaches the atmosphere and makes the glow of an aurora. If it starts more sideways, it turns back before it gets there.',
  draw(ctx, stage, c) {
    const path = pathOf(state);
    const s = Math.min(stage.h / (2 * (Z_ATM + 0.5)), stage.w / 2.6);
    const cx = stage.w / 2;
    const cy = stage.h / 2;
    const tube = (z) => Math.sin(rad(state.theta)) / Math.sqrt(ratioAt(state, z));
    const toPx = (x, z) => [cx + x * s, cy - z * s];
    // atmosphere bands
    ctx.fillStyle = c.fillC;
    ctx.fillRect(0, 0, stage.w, cy - Z_ATM * s);
    ctx.fillRect(0, cy + Z_ATM * s, stage.w, stage.h - (cy + Z_ATM * s));
    // the tube
    for (const sign of [-1, 1]) {
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const z = -Z_ATM + (2 * Z_ATM * i) / 60;
        const [x, y] = toPx(sign * tube(z), z);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = c.grid;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    line(ctx, cx, cy - Z_ATM * s, cx, cy + Z_ATM * s, { color: c.grid, width: 2, dash: [4, 6] });
    const n = Math.max(1, Math.floor((state.t / CYCLE) * path.length));
    ctx.beginPath();
    for (let i = Math.max(0, n - 700); i < n; i++) {
      const p = path[i];
      const [x, y] = toPx(p.r * Math.cos(p.phase) * 1, p.z + 0.12 * p.r * Math.sin(p.phase));
      if (i === Math.max(0, n - 700)) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = c.a;
    ctx.lineWidth = 3;
    ctx.stroke();
    const p = path[n - 1];
    const [px, py] = toPx(p.r * Math.cos(p.phase), p.z + 0.12 * p.r * Math.sin(p.phase));
    dot(ctx, px, py, 7, c.fillY, c.ink);
    const gone = n >= path.length && Math.abs(path[path.length - 1].z) >= Z_ATM;
    if (gone) label(ctx, 'AURORA', cx, cy + Math.sign(p.z) * (Z_ATM + 0.2) * s - Math.sign(p.z) * 4, c, { color: c.ink, size: 13 });
    label(ctx, 'atmosphere', stage.w - 50, 14, c, { color: c.ink, size: 11 });
    label(ctx, 'equator: weakest field', cx, cy - 6, c, { color: c.grid, size: 10, patch: false });
  },
  controls: () => [
    { title: 'A charge near Earth' },
    { key: 'theta', label: 'Angle to the field at the equator', min: 10, max: 60, step: 1, format: (n) => `${n}°` },
    { key: 'k', label: 'Field narrowing', min: 0.1, max: 1, step: 0.05, format: (n) => fixed(n, 2) },
    transport(line2.clock),
    { readout: [
      ['Critical angle', (s) => `${fixed(critical(s), 1)}°`],
      ['Where it turns', (s) => (Number.isFinite(mirrorPoint(s.theta, s.k)) ? `z = ${fixed(mirrorPoint(s.theta, s.k), 2)}` : 'never')],
      ['Outcome', (s) => (hits(s) ? { text: 'enters the atmosphere: aurora', good: true } : { text: 'bounces back and forth', good: false })],
    ] },
  ],
  tex: (s) => `\\sin^2\\theta_c=\\dfrac{B_0}{B_{atm}}=\\dfrac{1}{${fixed(ratioAt(s, Z_ATM), 2)}}\\qquad \\theta_c=${fixed(critical(s), 1)}^\\circ`,
  onChange: () => line2.sync(),
});
line2.sync();
tool.update();
