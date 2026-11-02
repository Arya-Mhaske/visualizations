import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sig } from '../../lib/format.js';
import { terminal, reynolds } from './_viscosity-math.js';

const CASES = {
  oil: ['Oil drop in air', 900, 1.2, 1.8e-5, 1.0],
  mist: ['Mist droplet in air', 1000, 1.2, 1.8e-5, 10],
  rain: ['Raindrop in air', 1000, 1.2, 1.8e-5, 1000],
  steel: ['Steel ball in glycerine', 7800, 1260, 1.4, 1000],
};
const state = { c: 'mist', x: 20 }; // x is log10(radius) in tenths from 0.1 μm: radius = 10^(x/10) μm
const radius = (s) => 10 ** (s.x / 10 - 1) * 1e-6 * 1; // 0.1 μm .. 10 mm
const vOf = (s, a = radius(s)) => terminal(a, CASES[s.c][1], CASES[s.c][2], CASES[s.c][3]);
const reOf = (s, a = radius(s)) => reynolds(a, vOf(s, a), CASES[s.c][2], CASES[s.c][3]);

createTool({
  state,
  label: 'A log-log graph of terminal speed against radius, a straight line of slope two. A marker shows the chosen radius, and a vertical line marks where the formula stops being valid.',
  setup: (stage, c) => createPlot(stage, { x: [-7, -2], y: [-8, 3], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'log₁₀ a (m)', yLabel: 'log₁₀ v (m/s)' });
    plot.fn((x) => Math.log10(vOf(state, 10 ** x)), { color: c.b });
    let limit = null;
    for (let x = -7; x <= -2; x += 0.01) if (reOf(state, 10 ** x) >= 1) { limit = x; break; }
    if (limit !== null) {
      plot.segment(limit, -8, limit, 3, { color: c.ink, dash: [6, 5], width: 2 });
      plot.text('Re > 1: not valid', limit + 0.1, 2.2, { align: 'left', patch: false });
    }
    plot.point(Math.log10(radius(state)), Math.log10(vOf(state)), { fill: c.a });
  },
  controls: [
    { title: 'Choose the drop' },
    { key: 'c', label: 'Case', options: Object.entries(CASES).map(([k, v]) => [k, v[0]]) },
    { key: 'x', label: 'Radius (log scale)', min: 0, max: 50, step: 1, format: (v) => `${sig(10 ** (v / 10 - 1), 2)} μm` },
    { readout: [
      ['Radius', (s) => `${sig(radius(s) * 1e6, 2)} μm`],
      ['Terminal speed', (s) => `${sig(vOf(s), 3)} m/s`],
      ['Reynolds number', (s) => sig(reOf(s), 2)],
      ['Formula valid?', (s) => ({ text: reOf(s) < 1 ? 'yes' : 'no', good: reOf(s) < 1 })],
    ] },
  ],
  tex: (s) => `v_T=\\dfrac{2a^2(\\rho-\\sigma)g}{9\\eta}=${sig(vOf(s), 3)}\\ \\mathrm{m/s}`,
});
