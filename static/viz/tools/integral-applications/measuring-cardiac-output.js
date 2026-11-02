import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// Dye is injected (dose m mg). Its concentration c(t) at a downstream artery is measured. Blood flow F satisfies m = F ∫c dt, so F = m / ∫c dt.
// The curve has a first pass c = A t e^(−t/τ) and a later bump from recirculation, which must be cut off and replaced by the tail of the first pass.
// All numbers are made up for illustration.
const state = { dose: 5, A: 0.8, tau: 4, cut: 12 };
const first = (t) => state.A * t * Math.exp(-t / state.tau);
const recirc = (t) => (t > 14 ? 0.35 * Math.exp(-((t - 22) ** 2) / 18) : 0);
const measured = (t) => first(t) + recirc(t);
const truth = () => state.A * state.tau ** 2; // ∫ A t e^(−t/τ) dt = A τ²  (mg·s/L)
// Estimate: area up to the cut time, plus an exponential tail extrapolated from the cut.
const est = () => {
  const area = simpson(measured, 0, state.cut, 400);
  const cc = measured(state.cut);
  const rate = Math.log(Math.max(measured(state.cut - 1), 1e-9) / Math.max(cc, 1e-9)); // decay rate read from the last second of the cut
  return area + cc / rate;
};
const rawArea = () => simpson(measured, 0, 40, 800);

createTool({
  state,
  label: 'Dye concentration against time at a measuring point. The rise and fall of the first pass is followed by a small second bump from dye going round again. The area under the first pass, cut at a chosen time and finished with an exponential tail, gives the flow.',
  setup: (stage, c) => createPlot(stage, { x: [0, 40], y: [0, 4], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 40], [0, Math.max(...Array.from({ length: 80 }, (_, i) => measured(i / 2))) * 1.2]);
    plot.axes({ xLabel: 'time (s)', yLabel: 'concentration (mg/L)' });
    plot.shade(measured, null, 0, state.cut, c.fillB);
    plot.fn((t) => measured(t) * (t > state.cut ? 1 : 0), { color: c.grid, width: 2, domain: [state.cut, 40] });
    plot.fn(measured, { color: c.ink, width: 3, domain: [0, 40] });
    plot.fn((t) => measured(state.cut) * Math.exp(-(t - state.cut) / state.tau), { color: c.a, width: 3, dash: [6, 4], domain: [state.cut, 40] });
    plot.segment(state.cut, 0, state.cut, 4, { color: c.a, width: 2 });
  },
  controls: [
    { title: 'Read the curve' },
    { key: 'dose', label: 'Dye injected', min: 1, max: 10, step: 0.5, format: (v) => `${v} mg` },
    { key: 'A', label: 'Curve height A', min: 0.3, max: 1.5, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'tau', label: 'Spread time τ', min: 2, max: 6, step: 0.5, format: (v) => `${v} s` },
    { key: 'cut', label: 'Cut the first pass at', min: 8, max: 14, step: 0.5, format: (v) => `${v} s` },
    { readout: [
      ['Area, first pass cut + tail', () => `${num(est(), 5)} mg·s/L`],
      ['True first-pass area A τ²', () => `${num(truth(), 5)} mg·s/L`],
      ['Flow F = dose ÷ area', () => `${num((state.dose / est()) * 60, 4)} L/min`],
      ['If you wrongly included the bump', () => `${num((state.dose / rawArea()) * 60, 4)} L/min`],
    ] },
  ],
  tex: () => 'F=\\frac{m}{\\int_0^{\\infty}c(t)\\,dt}',
});
