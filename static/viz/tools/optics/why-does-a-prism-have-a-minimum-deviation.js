import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { fixed } from '../../lib/format.js';
import { drawPrism } from './_prism-view.js';
import { deviation, minDeviation, minAngle, pass } from './_prism-math.js';

const state = { A: 60, n: 1.5, i: 40 };

const tool = createTool({
  state,
  label: 'Top: a ray passing through a prism and turning towards the base. Bottom: a graph of the deviation D against the angle of incidence i. The curve dips to a lowest point, the minimum deviation, where the ray passes symmetrically through the prism.',
  setup: (stage, c) => createPlot(stage, { x: [20, 85], y: [30, 80], c, pad: 30, box: (g) => ({ x: 0, y: g.h * 0.55, w: g.w, h: g.h * 0.45 }) }),
  draw(ctx, stage, c, plot) {
    drawPrism(ctx, c, { x: 0, y: 0, w: stage.w, h: stage.h * 0.53 }, state.A, [{ n: state.n, i: state.i, color: c.a }]);
    plot.setRange([20, 85], [Math.max(0, minDeviation(state.A, state.n) - 8), minDeviation(state.A, state.n) + 40]);
    plot.axes({ xLabel: 'i (°)', yLabel: 'D (°)' });
    plot.fn((i) => deviation(state.A, state.n, i) ?? NaN, { color: c.b, domain: [20, 85] });
    const D = deviation(state.A, state.n, state.i);
    if (D !== null) plot.point(state.i, D, { fill: c.a, r: 8 });
    plot.point(minAngle(state.A, state.n), minDeviation(state.A, state.n), { fill: c.fillC, r: 6 });
  },
  controls: () => [
    { title: 'Turn the prism' },
    { key: 'i', label: 'Angle of incidence, i', min: 20, max: 85, step: 0.5, format: (n) => `${fixed(n, 1)}°` },
    { key: 'A', label: 'Prism angle, A', min: 30, max: 70, step: 5, format: (n) => `${n}°` },
    { key: 'n', label: 'Index, n', min: 1.3, max: 1.8, step: 0.01, format: (n) => fixed(n, 2) },
    { readout: [
      ['Angle out, e', (s) => { const p = pass(s.A, s.n, s.i); return p ? `${fixed(p.e, 1)}°` : 'trapped'; }],
      ['Deviation, D', (s) => { const D = deviation(s.A, s.n, s.i); return D === null ? 'none: total reflection' : `${fixed(D, 1)}°`; }],
      ['Smallest D', (s) => `${fixed(minDeviation(s.A, s.n), 1)}° at i = ${fixed(minAngle(s.A, s.n), 1)}°`],
    ] },
  ],
  tex: (s) => `D=i+e-A\\qquad D_{min}=2\\sin^{-1}\\!\\left(n\\sin\\dfrac{A}{2}\\right)-A=${fixed(minDeviation(s.A, s.n), 1)}^\\circ`,
});

handles(tool.stage, [{
  at: () => { const D = deviation(state.A, state.n, state.i); return tool.extra.toPx(state.i, D ?? 0); },
  move(px) { state.i = Math.max(20, Math.min(85, Math.round(tool.extra.toWorld(px, 0)[0] * 2) / 2)); },
  nudge(direction) { state.i = Math.max(20, Math.min(85, state.i + direction * 0.5)); },
}], { onChange: () => tool.update() });
tool.update();
