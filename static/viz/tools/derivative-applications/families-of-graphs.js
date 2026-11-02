import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { roots, speck, num } from './_da.js';

// A parameter a changes the graph. The turning points move with a; the grey trail shows where they have been.
const FAM = {
  cubic: { name: 'f(x) = x³ − 3a·x', a: [0, 4], A: 1, f: (x, a) => x ** 3 - 3 * a * x, d: (x, a) => 3 * x * x - 3 * a, x: [-3, 3], y: [-8, 8], rule: 'Turning points at x = ±√a (when a > 0)' },
  decay: { name: 'f(x) = x·e^(−a·x)', a: [0.3, 3], A: 1, f: (x, a) => x * Math.exp(-a * x), d: (x, a) => (1 - a * x) * Math.exp(-a * x), x: [-1, 5], y: [-1, 1.2], rule: 'One maximum at x = 1/a, height 1/(a e)' },
  line: { name: 'f(x) = sin x + a·x', a: [0, 1.2], A: 0.3, f: (x, a) => Math.sin(x) + a * x, d: (x, a) => Math.cos(x) + a, x: [-7, 7], y: [-5, 5], rule: 'Turning points where cos x = −a; none once a ≥ 1' },
};
const state = { fam: 'cubic', a: 1 };
const F = () => FAM[state.fam];
const turns = (a) => roots((x) => F().d(x, a), F().x[0], F().x[1]);

createTool({
  state,
  label: 'A family of graphs controlled by one parameter. Dots mark the turning points of the current graph; grey dots show where the turning points sat for other values of the parameter.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 3], y: [-8, 8], c }),
  draw(ctx, stage, c, plot) {
    const fam = F();
    plot.setRange(fam.x, fam.y);
    plot.axes({ xLabel: 'x', yLabel: 'f' });
    for (let i = 0; i <= 40; i++) {
      const a = fam.a[0] + ((fam.a[1] - fam.a[0]) * i) / 40;
      for (const r of turns(a)) speck(ctx, plot, r, fam.f(r, a), 2.5, c.grid, c.grid);
    }
    plot.fn((x) => fam.f(x, state.a), { color: c.ink, width: 3 });
    for (const r of turns(state.a)) plot.point(r, fam.f(r, state.a), { fill: c.a, r: 7 });
  },
  controls: [
    { title: 'Change the parameter' },
    { key: 'fam', label: 'Family', options: Object.entries(FAM).map(([k, v]) => [k, v.name]) },
    { key: 'a', label: 'Parameter a', min: 0.3, max: 3, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['Turning points x', () => turns(state.a).map((r) => num(r, 3)).join(', ') || 'none'],
      ['Heights f', () => turns(state.a).map((r) => num(F().f(r, state.a), 3)).join(', ') || '—'],
      ['Rule', () => F().rule],
    ] },
  ],
  tex: (s) => `f'(x)=${s.fam === 'cubic' ? `3x^2-3(${s.a.toFixed(2)})` : s.fam === 'decay' ? '(1-ax)e^{-ax}' : '\\cos x+a'}`,
});
