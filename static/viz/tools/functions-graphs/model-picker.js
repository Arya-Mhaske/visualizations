import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { DATASETS, evalLow, expFit, logFit, logistic, logisticFit, polyFit, rSquared } from './_modelling-math.js';

const state = { set: 0, model: 'linear' };
const pts = (s = state) => DATASETS[s.set].pts;
function models(s) {
  const p = pts(s);
  const out = {};
  const poly = (deg, name) => { const c = polyFit(p, deg); out[name] = { f: (x) => evalLow(c, x), label: name }; };
  poly(1, 'linear'); poly(2, 'quadratic'); poly(3, 'cubic');
  if (p.every((q) => q[1] > 0)) { const e = expFit(p); out.exponential = { f: (x) => e.A * e.base ** x }; }
  if (p.every((q) => q[0] > 0)) { const l = logFit(p); out.logarithmic = { f: (x) => l.a + l.b * Math.log(x) }; }
  if (p.every((q) => q[1] > 0)) { const m = logisticFit(p); if (Number.isFinite(m.k) && m.k > 0) out.logistic = { f: (x) => logistic(m, x) }; }
  Object.values(out).forEach((m) => { m.r2 = rSquared(p, m.f); });
  return out;
}
const NAMES = ['linear', 'quadratic', 'cubic', 'exponential', 'logarithmic', 'logistic'];

createTool({
  state,
  label: 'A small made-up data set and one fitted curve at a time. The model can be linear, quadratic, cubic, exponential, logarithmic or logistic, each fitted to the same points by least squares. The readout lists how much of the variation each model explains, called R squared. A higher R squared means a closer fit, but a model with more freedom always fits better, so the shape of the data and common sense matter too.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 12], y: [-10, 150], c, pad: 22 }),
  draw(ctx, stage, c, plot) {
    const p = pts();
    const xs = p.map((q) => q[0]);
    const ys = p.map((q) => q[1]);
    plot.setRange([Math.min(...xs) - 0.5, Math.max(...xs) + 0.5], [Math.min(...ys) - (Math.max(...ys) - Math.min(...ys)) * 0.25, Math.max(...ys) + (Math.max(...ys) - Math.min(...ys)) * 0.25]);
    plot.axes({ xLabel: DATASETS[state.set].x, yLabel: '' });
    const m = models(state)[state.model];
    if (m) plot.fn(m.f, { color: c.a, width: 4, domain: [Math.max(Math.min(...xs) - 0.5, state.model === 'logarithmic' ? 0.05 : -1e9), Math.max(...xs) + 0.5] });
    p.forEach(([x, y]) => plot.point(x, y, { fill: c.b, r: 6 }));
  },
  controls: [
    { title: 'Pick data and a model' },
    { key: 'set', label: 'Data set', min: 0, max: DATASETS.length - 1, step: 1, format: (v) => DATASETS[v].name },
    { key: 'model', label: 'Model', options: NAMES.map((n) => [n, { linear: 'Line', quadratic: 'Quad', cubic: 'Cubic', exponential: 'Exp', logarithmic: 'Log', logistic: 'Logistic' }[n]]) },
    { readout: NAMES.map((n) => [`R² ${n}`, (s) => { const m = models(s)[n]; return m ? { text: fixed(m.r2, 4), good: m.r2 >= Math.max(...Object.values(models(s)).map((q) => q.r2)) - 1e-9 } : 'not possible here'; }]) },
  ],
  onChange(s) { if (!models(s)[s.model]) s.model = 'linear'; },
  tex: (s) => `R^2=1-\\dfrac{SS_{\\text{res}}}{SS_{\\text{tot}}}=${models(s)[s.model] ? fixed(models(s)[s.model].r2, 4) : '-'}`,
});
