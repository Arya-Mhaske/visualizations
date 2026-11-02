import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// Spin y = f(x) about the x-axis. Cut into n bands. Each band is a slice of a cone: area 2π r_mid × (slant length), not 2π r × (width along the axis).
const FN = {
  cone: { name: 'y = x/2 on [0, 4]  (a cone)', f: (x) => x / 2, d: () => 0.5, a: 0, b: 4 },
  par: { name: 'y = √x on [0, 4]', f: Math.sqrt, d: (x) => 1 / (2 * Math.sqrt(x)), a: 0.0001, b: 4 },
  steep: { name: 'y = x² on [0, 1.5]  (steep end)', f: (x) => x * x, d: (x) => 2 * x, a: 0, b: 1.5 },
};
const state = { fn: 'steep', n: 4 };
const K = () => FN[state.fn];
const exact = () => simpson((x) => 2 * Math.PI * K().f(x) * Math.sqrt(1 + K().d(x) ** 2), K().a, K().b, 4000);
const bands = (slant, n = state.n) => { let s = 0; const h = (K().b - K().a) / n; for (let i = 0; i < n; i++) { const [x0, x1] = [K().a + i * h, K().a + (i + 1) * h]; const [y0, y1] = [K().f(x0), K().f(x1)]; s += 2 * Math.PI * ((y0 + y1) / 2) * (slant ? Math.hypot(h, y1 - y0) : h); } return s; };

createTool({
  state,
  label: 'The profile of a solid of revolution cut into bands with the true slanted edge of each band marked. A readout compares the area using slant length with the smaller number using the width along the axis.',
  setup: (stage, c) => createPlot(stage, { x: [0, 4], y: [-2.5, 2.5], c }),
  draw(ctx, stage, c, plot) {
    const k = K();
    const top = Math.max(...Array.from({ length: 30 }, (_, i) => k.f(k.a + ((k.b - k.a) * i) / 29))) * 1.2;
    plot.setRange([k.a - 0.2, k.b + 0.2], [-top, top]);
    plot.axes({ xLabel: 'axis x', yLabel: 'radius' });
    plot.fn(k.f, { color: c.ink, width: 2, domain: [k.a, k.b] });
    plot.fn((x) => -k.f(x), { color: c.ink, width: 2, domain: [k.a, k.b] });
    const h = (k.b - k.a) / state.n;
    for (let i = 0; i <= state.n; i++) { const x = k.a + i * h; plot.segment(x, -k.f(x), x, k.f(x), { color: c.b, width: 1.5 }); }
    for (let i = 0; i < state.n; i++) {
      const [x0, x1] = [k.a + i * h, k.a + (i + 1) * h];
      plot.segment(x0, k.f(x0), x1, k.f(x1), { color: c.a, width: 4 });
      plot.segment(x0, -k.f(x0), x1, -k.f(x1), { color: c.a, width: 4 });
    }
  },
  controls: [
    { title: 'Cut into bands' },
    { key: 'fn', label: 'Profile', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'n', label: 'Bands n', min: 1, max: 40, step: 1 },
    { readout: [
      ['Using slant length (correct)', () => num(bands(true), 6)],
      ['Using axis width only', () => num(bands(false), 6)],
      ['Exact 2π∫ y √(1+y′²) dx', () => num(exact(), 6)],
      ['Axis-width version is off by', () => `${num(((exact() - bands(false)) / exact()) * 100, 3)}%`],
    ] },
  ],
  tex: () => 'S=\\int_a^{b}2\\pi\\,f(x)\\sqrt{1+f\'(x)^2}\\,dx',
});
