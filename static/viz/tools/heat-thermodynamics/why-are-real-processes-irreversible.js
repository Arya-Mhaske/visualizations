import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { carnotEta } from './_engines.js';
import { fixed } from '../../lib/format.js';

// Heat flows into the gas across a gap δ (gas at T1 − δ) and out across a gap δ (gas at T2 + δ). Rate of heat flow ∝ δ. Friction wastes a share f of the work.
const state = { T1: 600, T2: 300, d: 40, f: 5 };
const eta = (s, d = s.d) => Math.max(0, (1 - s.f / 100) * (1 - (s.T2 + d) / (s.T1 - d)));
const power = (s, d = s.d) => d * eta(s, d); // relative: heat rate ∝ δ
const dMax = (s) => (s.T1 - s.T2) / 2;

createTool({
  state,
  label: 'Efficiency and relative power plotted against the temperature gap that heat must cross inside the engine. At zero gap the engine is as efficient as Carnot but delivers no power. A bigger gap gives power but costs efficiency. Friction lowers the whole efficiency curve.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 150], y: [0, 1] }),
  draw(ctx, stage, c, plot) {
    const top = dMax(state);
    const pmax = Math.max(...Array.from({ length: 101 }, (_, i) => power(state, (top * i) / 100)));
    plot.setRange([0, top], [0, 1]);
    plot.axes({ xLabel: 'δ (K)', yLabel: 'fraction' });
    plot.fn(() => carnotEta(state.T1, state.T2), { color: c.grid, dash: [6, 5], width: 2 });
    plot.fn((d) => eta(state, d), { color: c.a });
    plot.fn((d) => power(state, d) / (pmax || 1), { color: c.b });
    plot.point(state.d, eta(state), { fill: c.a });
    plot.point(state.d, power(state) / (pmax || 1), { fill: c.b });
    plot.text('Carnot limit', top * 0.82, carnotEta(state.T1, state.T2) + 0.05, { size: 11, patch: false });
    plot.text('efficiency', top * 0.12, eta(state, top * 0.12) + 0.06, { size: 11, color: c.a, patch: false });
    plot.text('power', top * 0.55, power(state, top * 0.55) / (pmax || 1) + 0.08, { size: 11, color: c.b, patch: false });
  },
  controls: [
    { title: 'Make the engine real' },
    { key: 'd', label: 'Temperature gap δ (K)', min: 0, max: 140, step: 5 },
    { key: 'f', label: 'Friction loss (%)', min: 0, max: 30, step: 5 },
    { key: 'T1', label: 'Hot T₁ (K)', min: 500, max: 800, step: 50 },
    { key: 'T2', label: 'Cold T₂ (K)', min: 250, max: 350, step: 25 },
    { readout: [
      ['Carnot limit', (s) => `${fixed(carnotEta(s.T1, s.T2) * 100, 1)} %`],
      ['This engine', (s) => `${fixed(eta(s) * 100, 1)} %`],
      ['Power (relative)', (s) => (s.d === 0 ? '0: takes forever' : `${fixed(power(s), 1)} K`)],
    ] },
  ],
  onChange(s) { s.d = Math.min(s.d, dMax(s) - 1); },
  tex: (s) => `\\eta=(1-f)\\left(1-\\dfrac{T_2+\\delta}{T_1-\\delta}\\right)=${fixed(eta(s), 3)}`,
});
