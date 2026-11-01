import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const FN = {
  sqrt: { f: Math.sqrt, d: (x) => 0.5 / Math.sqrt(x), a: 4 },
  sin: { f: Math.sin, d: Math.cos, a: 1 },
  exp: { f: Math.exp, d: Math.exp, a: 0.5 },
  ln: { f: Math.log, d: (x) => 1 / x, a: 2 },
};
const state = { fn: 'sqrt', off: 0.5, h: 0.6 };
const F = (s = state) => FN[s.fn];
const slope = (s) => F(s).d(F(s).a) + s.off;
const line = (s, x) => F(s).f(F(s).a) + slope(s) * (x - F(s).a);
const err = (s, h = s.h) => Math.abs(F(s).f(F(s).a + h) - line(s, F(s).a + h));

createTool({
  state,
  label: 'A curve with a point on it, and a straight line through that point whose slope you can tilt away from the tangent slope. A vertical bar at a distance h to the right measures how far the line is from the curve. As h shrinks, the bar for the tangent shrinks much faster than the distance, but the bar for any other line does not.',
  setup: (stage, c) => createPlot(stage, { x: [0, 6], y: [0, 4], c }),
  draw(ctx, stage, c, plot) {
    const { f, a } = F();
    const xs = [a - 1.5, a + 1.5];
    const ys = Array.from({ length: 31 }, (_, i) => f(xs[0] + (i * 3) / 30)).filter(Number.isFinite);
    const pad = (Math.max(...ys) - Math.min(...ys)) * 0.5 + 0.1;
    plot.setRange(xs, [Math.min(...ys) - pad, Math.max(...ys) + pad]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(f, { color: c.ink, width: 4 });
    plot.fn((x) => line(state, x), { color: c.a, width: 3 });
    plot.segment(a + state.h, f(a + state.h), a + state.h, line(state, a + state.h), { color: c.b, width: 5 });
    plot.point(a, f(a), { fill: c.fillY, r: 8 });
  },
  controls: (tool) => [
    { title: 'Tilt the line' },
    { key: 'fn', label: 'Curve', options: [['sqrt', '√x at 4'], ['sin', 'sin x at 1'], ['exp', 'eˣ at 0.5'], ['ln', 'ln x at 2']] },
    { key: 'off', label: 'Slope minus tangent slope', min: -1.5, max: 1.5, step: 0.05, format: (v) => fixed(v, 2) },
    { button: 'Use the tangent', onClick: () => { state.off = 0; tool.update(); } },
    { key: 'h', label: 'Distance h', min: 0.02, max: 1, step: 0.02, format: (v) => fixed(v, 2) },
    { readout: [
      ['Gap at distance h', (s) => fixed(err(s), 5)],
      ['Gap ÷ h', (s) => ({ text: fixed(err(s) / s.h, 4), good: Math.abs(s.off) < 1e-9 })],
      ['Gap ÷ h at h/10', (s) => fixed(err(s, s.h / 10) / (s.h / 10), 4)],
    ] },
  ],
  tex: (s) => `\\dfrac{\\text{gap}}{h}=\\dfrac{${fixed(err(s), 5)}}{${fixed(s.h, 2)}}=${fixed(err(s) / s.h, 4)}`,
});
