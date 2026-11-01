import { createTool } from '../../lib/tool.js';
import { createBench } from '../../lib/rays.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { makerPower, surfaceFocus, twoSurfaces, traceLens, focusOfTrace } from './_lenses-math.js';

const state = { n: 1.5, R1: 5, R2: -5 };
const T = 0.1;
const FLAT = 1e5;
// 0 means a flat face; tiny curves are held to 2.5 so the lens fits the drawing.
const rad = (r) => (r === 0 ? FLAT : Math.sign(r) * Math.max(2.5, Math.abs(r)));
const lens = (s) => ({ n: s.n, R1: rad(s.R1), R2: rad(s.R2), t: T });
const power = (s) => makerPower(s.n, rad(s.R1), rad(s.R2));
const sag = (R, y) => (Math.abs(R) >= FLAT ? 0 : R - Math.sign(R) * Math.sqrt(R * R - y * y));
const HEIGHTS = [-1.1, -0.7, -0.3, 0.3, 0.7, 1.1];

const tool = createTool({
  state,
  label: 'Parallel rays pass through a lens whose two curved faces you can choose. The rays bend at the first face, then again at the second face, and meet at the focus F. A marker shows where the first face alone would have focused them.',
  setup: (stage, c) => createBench(stage, { x: [-5, 13], cy: 0.5, c }),
  draw(ctx, stage, c, bench) {
    const L = lens(state);
    const body = () => {
      ctx.beginPath();
      for (let k = -24; k <= 24; k++) {
        const y = (k / 24) * 2.2;
        const [px, py] = bench.toPx(-T / 2 + sag(L.R1, y), y);
        if (k === -24) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      for (let k = 24; k >= -24; k--) {
        const y = (k / 24) * 2.2;
        const [px, py] = bench.toPx(T / 2 + sag(L.R2, y), y);
        ctx.lineTo(px, py);
      }
      ctx.closePath();
    };
    body();
    ctx.fillStyle = c.fillB;
    ctx.fill();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    bench.axis();
    for (const y of HEIGHTS) {
      const r = traceLens(L, y, -5);
      if (r.missed) continue;
      for (let k = 0; k < r.path.length - 1; k++) bench.ray(r.path[k], r.path[k + 1], { color: c.a, width: 2, arrow: false });
      bench.rayTo(r.path[r.path.length - 1], r.d, { color: c.a, width: 2, arrow: false });
    }
    // where the first face alone would bring the beam to a focus
    const f1 = -T / 2 + surfaceFocus(1, state.n, L.R1);
    if (Number.isFinite(f1) && f1 > -5 && f1 < 13) {
      const [px, py] = bench.toPx(f1, 0);
      line(ctx, px, py - 8, px, py + 8, { color: c.d, width: 3 });
      label(ctx, 'face 1 alone', px, py - 18, c, { color: c.d, size: 10, bounds: stage });
    }
    const fx = focusOfTrace(L, 0.05);
    if (fx !== null && fx > -5 && fx < 13) {
      dot(ctx, ...bench.toPx(fx, 0), 7, c.fillC, c.ink);
      label(ctx, 'F', ...bench.toPx(fx, -0.6), c, { color: c.ink, size: 12 });
    }
  },
  controls: () => [
    { title: 'Two faces, one lens' },
    { key: 'n', label: 'Index of glass, n', min: 1.3, max: 2, step: 0.05, format: (n) => fixed(n, 2) },
    { key: 'R1', label: 'First face, R₁ (0 = flat)', min: -12, max: 12, step: 0.5, format: (n) => (n === 0 ? 'flat' : fixed(n, 1)) },
    { key: 'R2', label: 'Second face, R₂ (0 = flat)', min: -12, max: 12, step: 0.5, format: (n) => (n === 0 ? 'flat' : fixed(n, 1)) },
    { readout: [
      ['After face 1 alone, v₁', (s) => { const v = twoSurfaces(s.n, rad(s.R1), rad(s.R2)).v1; return Number.isFinite(v) ? sig(v, 3) : '∞'; }],
      ['After face 2 as well, v₂', (s) => { const v = twoSurfaces(s.n, rad(s.R1), rad(s.R2)).v2; return Number.isFinite(v) ? sig(v, 3) : '∞'; }],
      ['f from the formula', (s) => (power(s) === 0 ? '∞' : sig(1 / power(s), 3))],
      ['Lens', (s) => (power(s) > 0 ? { text: 'converging', good: true } : power(s) < 0 ? { text: 'diverging', good: false } : { text: 'no focusing', good: false })],
    ] },
  ],
  tex: (s) => `\\dfrac{1}{f}=(n-1)\\left(\\dfrac{1}{R_1}-\\dfrac{1}{R_2}\\right)=${sig(power(s), 3)}`,
});
tool.update();
