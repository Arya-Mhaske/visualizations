import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { CITIES, TAU, dataFor, leastSquaresSine, rmsError, sineModel } from './_sine-cosine-math.js';

const state = { city: 'del', A: 1, phi: 1, B: 12.1, P: 12 };
let tool;
let lastCity = state.city;
const data = (s = state) => dataFor(s.city);
const model = (s = state) => ({ B: s.B, A: s.A, phi: s.phi, w: TAU / s.P });
const best = (s = state) => leastSquaresSine(data(s), s.P);
const range = (s = state) => {
  const ys = data(s).map((p) => p.y);
  return [Math.floor(Math.min(...ys) - 1), Math.ceil(Math.max(...ys) + 1)];
};
const sgn = (x) => (x < 0 ? '-' : '+');

tool = createTool({
  state,
  label: 'Twelve dots showing the hours of daylight on the 15th of each month in one city, calculated from the position of the Sun. A coral sine curve y equals B plus A sine of omega x minus phi, which you adjust to pass through the dots. A button finds the curve with the smallest total error.',
  setup: (stage, c) => createPlot(stage, { x: [0, 12], y: [8, 16], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 12], range());
    plot.axes({ xLabel: 'month', yLabel: 'hours' });
    plot.fn(sineModel(model()), { color: c.a, width: 4 });
    data().forEach((p) => plot.point(p.x, p.y, { fill: c.b, r: 6 }));
  },
  controls: [
    { title: 'Daylight through the year' },
    { key: 'city', label: 'City', options: Object.entries(CITIES).map(([k, v]) => [k, v.short]) },
    { key: 'A', label: 'Amplitude, A', min: 0, max: 4, step: 0.05, format: (n) => `${fixed(n, 2)} h` },
    { key: 'B', label: 'Middle level, B', min: 9, max: 15, step: 0.05, format: (n) => `${fixed(n, 2)} h` },
    { key: 'phi', label: 'Phase, φ', min: -3.14, max: 3.14, step: 0.01, format: (n) => `${fixed(n, 2)} rad` },
    { key: 'P', label: 'Period', min: 6, max: 18, step: 0.5, format: (n) => `${fixed(n, 1)} months` },
    { row: [
      { button: 'Best fit for this period', onClick() { const f = best(); Object.assign(state, { A: Math.min(4, f.A), B: f.B, phi: f.phi }); tool.update(); } },
    ] },
    { readout: [
      ['Your total error (rms)', (s) => `${fixed(rmsError(data(s), model(s)), 3)} h`],
      ['Smallest possible (rms)', (s) => `${fixed(best(s).rms, 3)} h`],
      ['Longest, shortest day', (s) => `${fixed(Math.max(...data(s).map((p) => p.y)), 2)}, ${fixed(Math.min(...data(s).map((p) => p.y)), 2)} h`],
    ] },
  ],
  tex: (s) => `y=${fixed(s.B, 2)}${sgn(s.A)}${fixed(Math.abs(s.A), 2)}\\sin\\left(\\dfrac{2\\pi}{${fixed(s.P, 1)}}x${sgn(-s.phi)}${fixed(Math.abs(s.phi), 2)}\\right)`,
  onChange(s) {
    // a new city: start from a plain guess
    if (s.city !== lastCity) {
      lastCity = s.city;
      Object.assign(s, { A: 1, B: 12.1, phi: 1 });
    }
  },
});
