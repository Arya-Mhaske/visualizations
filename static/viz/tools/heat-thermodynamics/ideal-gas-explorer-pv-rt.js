import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sig } from '../../lib/format.js';
import { pressure } from './_temperature-math.js';

const state = { mu: 1, T: 300, V: 25 };

createTool({
  state,
  label: 'A graph of pressure against volume for a fixed amount of ideal gas at the chosen temperature. A marker shows the current state.',
  setup: (stage, c) => createPlot(stage, { x: [0, 60], y: [0, 500], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'V (L)', yLabel: 'P (kPa)' });
    plot.fn((v) => pressure(state.mu, 273.15, v), { color: c.ink, dash: [6, 5], domain: [3, 60] });
    plot.fn((v) => pressure(state.mu, state.T, v), { color: c.b, domain: [3, 60] });
    plot.point(state.V, Math.min(490, pressure(state.mu, state.T, state.V)), { fill: c.a });
  },
  controls: [
    { title: 'Change the gas' },
    { key: 'mu', label: 'Amount μ (mol)', min: 0.5, max: 3, step: 0.5 },
    { key: 'T', label: 'Temperature T (K)', min: 100, max: 600, step: 10 },
    { key: 'V', label: 'Volume V (L)', min: 5, max: 60, step: 1 },
    { readout: [
      ['P = μRT/V', (s) => `${sig(pressure(s.mu, s.T, s.V), 3)} kPa`],
      ['PV', (s) => `${sig(pressure(s.mu, s.T, s.V) * s.V, 3)} J`],
      ['μRT', (s) => `${sig(s.mu * 8.314 * s.T, 3)} J`],
    ] },
  ],
  tex: (s) => `P=\\dfrac{\\mu RT}{V}=\\dfrac{${s.mu}\\times 8.314\\times ${s.T}}{${s.V}}=${sig(pressure(s.mu, s.T, s.V), 3)}\\ \\mathrm{kPa}`,
});
