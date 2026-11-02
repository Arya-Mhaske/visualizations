import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arc, line, TAU } from '../../lib/draw.js';
import { num } from './_da.js';

// A ray at height b = sin i enters a drop (index n), reflects once at the back and leaves.
// Deviation D(i) = 180° + 2i − 4r, with sin i = n sin r. D has a minimum, so rays near it leave almost parallel: a bright bow.
const state = { n: 1.333, i: 40 };
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const dev = (iDeg, n = state.n) => { const i = rad(iDeg); const r = Math.asin(Math.sin(i) / n); return 180 + 2 * deg(i) - 4 * deg(r); };
const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];
function refract(d, nrm, eta) { // nrm faces the incoming ray's side
  const ci = -dot2(d, nrm);
  const k = 1 - eta * eta * (1 - ci * ci);
  const m = eta * ci - Math.sqrt(k);
  return [eta * d[0] + m * nrm[0], eta * d[1] + m * nrm[1]];
}
function trace(iDeg) {
  const b = Math.sin(rad(iDeg));
  const P1 = [-Math.sqrt(1 - b * b), b];
  const t = refract([1, 0], P1, 1 / state.n);
  const s2 = -2 * dot2(P1, t);
  const P2 = [P1[0] + s2 * t[0], P1[1] + s2 * t[1]];
  const dn = dot2(t, P2);
  const r = [t[0] - 2 * dn * P2[0], t[1] - 2 * dn * P2[1]];
  const s3 = -2 * dot2(P2, r);
  const P3 = [P2[0] + s3 * r[0], P2[1] + s3 * r[1]];
  const out = refract(r, [-P3[0], -P3[1]], state.n);
  return { P1, P2, P3, out, D: deg(Math.acos(Math.max(-1, Math.min(1, out[0])))) };
}
const minD = () => { let m = { i: 0, D: 999 }; for (let i = 1; i < 90; i += 0.05) { const D = dev(i); if (D < m.D) m = { i, D }; } return m; };

createTool({
  state,
  label: 'Top: a raindrop with parallel rays entering. They reflect off the back and leave; near one angle the exiting rays bunch together. Bottom: the deviation angle against the angle of incidence, with a flat minimum near 138 degrees.',
  setup: (stage, c) => createPlot(stage, { x: [0, 90], y: [130, 185], c, box: (s) => ({ x: 0, y: s.h * 0.56, w: s.w, h: s.h * 0.44 }) }),
  draw(ctx, stage, c, plot) {
    const h = stage.h * 0.56;
    const sc = Math.min(stage.w / 3.4, h / 2.4);
    const [cx, cy] = [stage.w * 0.4, h / 2];
    const P = ([x, y]) => [cx + x * sc, cy - y * sc];
    const seg = (a, b, color, w) => line(ctx, ...P(a), ...P(b), { color, width: w });
    arc(ctx, cx, cy, sc, 0, TAU, { color: c.b, width: 3 });
    for (let k = 1; k <= 18; k++) {
      const ang = Math.asin(k / 19) * 180 / Math.PI;
      const t = trace(ang);
      seg([-1.7, Math.sin(rad(ang))], t.P1, c.grid, 1.5); seg(t.P1, t.P2, c.grid, 1.5); seg(t.P2, t.P3, c.grid, 1.5);
      seg(t.P3, [t.P3[0] + t.out[0] * 1.8, t.P3[1] + t.out[1] * 1.8], c.grid, 1.5);
    }
    const t = trace(state.i);
    seg([-1.7, Math.sin(rad(state.i))], t.P1, c.a, 3); seg(t.P1, t.P2, c.a, 3); seg(t.P2, t.P3, c.a, 3);
    seg(t.P3, [t.P3[0] + t.out[0] * 1.8, t.P3[1] + t.out[1] * 1.8], c.a, 3);
    plot.axes({ xLabel: 'angle of incidence i (°)', yLabel: 'D (°)' });
    plot.fn((i) => dev(Math.max(i, 0.001)), { color: c.ink, width: 3 });
    plot.segment(0, minD().D, 90, minD().D, { color: c.c, width: 2, dash: [6, 4] });
    plot.point(state.i, dev(state.i), { fill: c.a });
  },
  controls: [
    { title: 'Aim a ray' },
    { key: 'i', label: 'Angle of incidence i', min: 5, max: 85, step: 0.5, format: (v) => `${v}°` },
    { key: 'n', label: 'Refractive index n', min: 1.32, max: 1.35, step: 0.001, format: (v) => v.toFixed(3) },
    { readout: [
      ['Deviation D (formula)', () => `${num(dev(state.i), 4)}°`],
      ['Deviation D (traced ray)', () => `${num(trace(state.i).D, 4)}°`],
      ['Minimum D at', () => `${num(minD().D, 4)}° when i = ${num(minD().i, 3)}°`],
      ['Bow angle 180° − D', () => `${num(180 - minD().D, 3)}°`],
    ] },
  ],
  tex: (s) => `D=180^\\circ+2i-4r,\\quad \\sin i=${s.n.toFixed(3)}\\sin r,\\quad \\frac{dD}{di}=0`,
});
