import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';

const state = { shape: 'ball', r: 21, dr: 0.05 };
const SH = {
  ball: { name: 'Sphere volume', f: (r) => (4 / 3) * Math.PI * r ** 3, d: (r) => 4 * Math.PI * r ** 2, unit: 'cm³', tex: 'V=\\tfrac43\\pi r^3,\\ dV=4\\pi r^2\\,dr' },
  disc: { name: 'Disc area', f: (r) => Math.PI * r ** 2, d: (r) => 2 * Math.PI * r, unit: 'cm²', tex: 'A=\\pi r^2,\\ dA=2\\pi r\\,dr' },
};
const S = (s = state) => SH[s.shape];
const dQ = (s) => S(s).d(s.r) * s.dr;
const worst = (s) => (S(s).f(s.r + s.dr) - S(s).f(s.r - s.dr)) / 2;

createTool({
  state,
  label: 'A measured radius with its possible error, shown as a band on the horizontal axis. The curve gives the quantity computed from the radius, and its tangent line gives the linear estimate of how far the quantity can be off. The vertical band is the estimated error.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [0, 1], c, pad: 36 }),
  draw(ctx, stage, c, plot) {
    const { r, dr } = state;
    const f = S().f;
    const w = dr * 4;
    plot.setRange([r - w, r + w], [f(r) - S().d(r) * w * 1.3, f(r) + S().d(r) * w * 1.3]);
    plot.axes({ xLabel: 'r (cm)', yLabel: S().unit });
    plot.shade((x) => f(r) + S().d(r) * (x - r), null, r - dr, r + dr, c.fillY);
    plot.fn(f, { color: c.ink, width: 4 });
    plot.fn((x) => f(r) + S().d(r) * (x - r), { color: c.a, width: 3 });
    plot.segment(r - dr, f(r) - S().d(r) * w * 1.3, r - dr, f(r - dr), { color: c.b, width: 3, dash: [4, 4] });
    plot.segment(r + dr, f(r) - S().d(r) * w * 1.3, r + dr, f(r + dr), { color: c.b, width: 3, dash: [4, 4] });
    plot.point(r, f(r), { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Measure a radius' },
    { key: 'shape', label: 'Compute', options: Object.entries(SH).map(([k, v]) => [k, v.name]) },
    { key: 'r', label: 'Radius r', min: 5, max: 50, step: 0.5, format: (v) => `${fixed(v, 1)} cm` },
    { key: 'dr', label: 'Possible error dr', min: 0.01, max: 1, step: 0.01, format: (v) => `± ${fixed(v, 2)} cm` },
    { readout: [
      ['Computed value', (s) => `${sig(S(s).f(s.r), 5)} ${S(s).unit}`],
      ['Error estimate, dQ', (s) => ({ text: `± ${sig(dQ(s), 3)} ${S(s).unit}`, good: true })],
      ['True worst case', (s) => `± ${sig(worst(s), 3)} ${S(s).unit}`],
      ['Relative error', (s) => `${fixed((dQ(s) / S(s).f(s.r)) * 100, 2)}%`],
    ] },
  ],
  tex: (s) => `${S(s).tex}\\ \\Rightarrow\\ \\pm${sig(dQ(s), 3)}\\text{ ${S(s).unit}}`,
});
