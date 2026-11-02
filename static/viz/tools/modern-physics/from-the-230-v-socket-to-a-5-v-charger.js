import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';

// 230 V rms mains (peak 325 V) → step-down transformer → bridge rectifier (two diodes in line, 2 × 0.7 V) → filter
// capacitor feeding a load that draws a steady current I. The capacitor drains by I/C between the humps.
// A 5 V regulator (beyond the text) would need its input above about 7 V.
const F = 50;
const state = { Vs: 9, C: 2200, I: 0.4 };
const peakIn = (s) => s.Vs * Math.SQRT2;
const peakRect = (s) => Math.max(0, peakIn(s) - 1.4);
const mains = (m) => 325 * Math.sin(2 * Math.PI * (F / 1000) * m);
const sec = (s, m) => peakIn(s) * Math.sin(2 * Math.PI * (F / 1000) * m);
const rect = (s, m) => Math.max(0, Math.abs(sec(s, m)) - 1.4);

// Filter, simulated: v follows the rectified wave upward, otherwise falls by I dt / C.
function filtered(s) {
  const dt = 2e-5;
  const n = Math.round(0.08 / dt);
  const out = new Float64Array(n + 1);
  let v = 0;
  const step = (s.I * dt) / (s.C * 1e-6);
  for (let i = 0; i <= n; i++) {
    const r = rect(s, (i * dt) * 1000);
    v = r > v ? r : Math.max(0, v - step);
    out[i] = v;
  }
  return { out, dt };
}
const stats = (s) => {
  const { out, dt } = filtered(s);
  const from = Math.round(0.04 / dt);
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = from; i < out.length; i++) { lo = Math.min(lo, out[i]); hi = Math.max(hi, out[i]); }
  return { lo, hi, pp: hi - lo };
};

const tool = createTool({
  state,
  label: 'Four stacked graphs against time over 40 milliseconds, one for each stage. First, the mains at 325 volts peak. Second, the secondary of the step-down transformer at a few volts. Third, the bridge-rectified humps. Fourth, the filtered output, nearly steady with a small ripple.',
  setup: (stage, c) => {
    const mk = (k, y) => createPlot(stage, { x: [0, 40], y, c, pad: 18, box: (g) => ({ x: 0, y: (g.h * k) / 4, w: g.w, h: g.h / 4 }) });
    return [mk(0, [-350, 350]), mk(1, [-20, 20]), mk(2, [-1, 20]), mk(3, [-1, 20])];
  },
  draw(ctx, stage, c, plots) {
    plots[0].axes({ xLabel: 'ms', yLabel: 'mains', grid: false });
    plots[0].fn(mains, { color: c.b });
    plots[1].axes({ xLabel: 'ms', yLabel: 'secondary', grid: false });
    plots[1].fn((m) => sec(state, m), { color: c.b });
    plots[2].axes({ xLabel: 'ms', yLabel: 'rectified', grid: false });
    plots[2].fn((m) => rect(state, m), { color: c.a });
    const f = filtered(state);
    plots[3].axes({ xLabel: 'ms', yLabel: 'filtered', grid: false });
    plots[3].fn((m) => f.out[Math.round(((m + 40) / 1000) / f.dt)], { color: c.c, domain: [0, 40] });
    plots[3].segment(0, 7, 40, 7, { color: c.ink, width: 2, dash: [5, 4] });
    plots[3].text('7 V: regulator minimum', 39, 8.8, { align: 'right', size: 9 });
  },
  controls: () => [
    { title: 'Design the charger' },
    { key: 'Vs', label: 'Secondary, rms', min: 5, max: 15, step: 0.5, format: (v) => `${fixed(v, 1)} V` },
    { key: 'C', label: 'Filter capacitor', min: 100, max: 4700, step: 100, format: (v) => `${v} μF` },
    { key: 'I', label: 'Phone draws', min: 0.1, max: 1, step: 0.05, format: (v) => `${fixed(v, 2)} A` },
    { readout: [
      ['Turns ratio, primary : secondary', (s) => `${sig(230 / s.Vs, 3)} : 1`],
      ['Peak after rectifier', (s) => `${fixed(peakRect(s), 1)} V`],
      ['Ripple', (s) => `${fixed(stats(s).pp, 2)} V`],
      ['Lowest voltage', (s) => ({ text: `${fixed(stats(s).lo, 1)} V`, good: stats(s).lo >= 7 })],
    ] },
  ],
  tex: (s) => `\\dfrac{N_p}{N_s}=\\dfrac{V_p}{V_s}=\\dfrac{230}{${fixed(s.Vs, 1)}}=${sig(230 / s.Vs, 3)},\\quad \\Delta V\\approx\\dfrac{I}{2fC}`,
});

tool.update();
