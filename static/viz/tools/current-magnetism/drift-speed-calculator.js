import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, poly } from '../../lib/draw.js';
import { createRng } from '../../lib/rng.js';
import { fixed, sci, sig, texSci } from '../../lib/format.js';
import { E_CHARGE, MATERIALS, crossingTime, driftSpeed, electronsPerSecond } from './_current-drift-math.js';

const FULL_SLICE = 12e-3; // m: a slice this long fills the drawing; the fastest setting (silver, 10 A, 0.1 mm²) gives 10.6 mm
const state = { I: 1.5, A: 0.1, material: 'copper' };
const area = (s) => s.A * 1e-6;
const n = (s) => MATERIALS[s.material].n;
const vd = (s) => driftSpeed(s.I, n(s), area(s));
const rng = createRng(3);
const specks = Array.from({ length: 70 }, () => [rng.next(), rng.next()]);

createTool({
  state,
  label: 'A side view of a wire with electrons drifting to the right. A shaded slice at the right end has length equal to the drift speed times one second: every electron inside it crosses the end face in that second.',
  draw(ctx, stage, c) {
    const left = 16;
    const right = stage.w - 16;
    const mid = stage.h * 0.46;
    const half = 18 + Math.sqrt(state.A / 5) * stage.h * 0.2;
    const length = Math.max(3, Math.min(1, vd(state) / FULL_SLICE) * (right - left));
    poly(ctx, [[left, mid - half], [right, mid - half], [right, mid + half], [left, mid + half]], { fill: c.fillY, stroke: c.ink });
    poly(ctx, [[right - length, mid - half], [right, mid - half], [right, mid + half], [right - length, mid + half]], { fill: c.fillC, stroke: c.ink });
    for (const [x, y] of specks) {
      const px = left + 6 + x * (right - left - 12);
      dot(ctx, px, mid - half + 5 + y * (2 * half - 10), 3, px > right - length ? c.a : c.b, c.ink, 1);
    }
    arrow(ctx, stage.w * 0.3, mid - half - 18, stage.w * 0.6, mid - half - 18, { color: c.a });
    label(ctx, 'electrons drift this way', stage.w * 0.45, mid - half - 36, c, { size: 11, bounds: stage });
    label(ctx, `slice: v_d × 1 s = ${sig(vd(state) * 1000, 2)} mm`, stage.w / 2, mid + half + 22, c, { size: 12, color: c.ink, bounds: stage });
    label(ctx, `all ${sci(electronsPerSecond(state.I), 2)} in it cross`, stage.w / 2, mid + half + 42, c, { size: 12, bounds: stage });
    label(ctx, 'in one second', stage.w / 2, mid + half + 60, c, { size: 12, bounds: stage });
  },
  controls: [
    { title: 'Your wire' },
    { key: 'I', label: 'Current, I', min: 0.1, max: 10, step: 0.1, format: (x) => `${fixed(x, 1)} A` },
    { key: 'A', label: 'Cross-section, A', min: 0.1, max: 5, step: 0.1, format: (x) => `${fixed(x, 1)} mm²` },
    { key: 'material', label: 'Metal', options: Object.entries(MATERIALS).map(([key, m]) => [key, m.name]) },
    { readout: [
      ['n', (s) => `${sci(n(s), 2)} per m³`],
      ['A', (s) => `${sci(area(s), 2)} m²`],
      ['neA', (s) => `${sig(n(s) * E_CHARGE * area(s), 3)} C/m`],
      ['Drift speed, v_d = I/neA', (s) => `${sci(vd(s), 2)} m/s`],
      ['Time to go 1 m', (s) => `${sig(crossingTime(1, vd(s)) / 60, 3)} min`],
    ] },
  ],
  tex: (s) => `v_d=\\dfrac{I}{neA}=\\dfrac{${fixed(s.I, 1)}}{${sig(n(s) * E_CHARGE * area(s), 3)}}=${texSci(vd(s), 2)}\\ \\text{m/s}`,
});
