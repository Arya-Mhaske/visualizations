import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

const MATS = [['vacuum', 1], ['paper', 3.5], ['mica', 5.4], ['glass', 6], ['water', 80]];
const state = { K: 5, E0: 1000 };
const near = (K) => MATS.reduce((a, b) => (Math.abs(b[1] - K) < Math.abs(a[1] - K) ? b : a));

createTool({
  state,
  label: 'Three bars: the applied field, the opposing field made by the polarised dielectric, and the net field. As the dielectric constant grows the opposing bar grows towards the applied one and the net bar shrinks.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 4], y: [-1100, 1100], ticks: 'auto' }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '', yLabel: 'E (V/m)', grid: true });
    const E = state.E0 / state.K;
    [[state.E0, c.a, 'applied', 0.5], [-(state.E0 - E), c.b, 'dipoles', 1.5], [E, c.c, 'net', 2.5]].forEach(([v, col, name, x]) => {
      plot.shade(() => v, null, x - 0.35, x + 0.35, col);
      plot.segment(x - 0.35, v, x + 0.35, v, { width: 3 });
      plot.text(name, x, v >= 0 ? v + 90 : v - 90, { size: 11, patch: false });
    });
  },
  controls: [
    { title: 'Choose a dielectric' },
    { key: 'K', label: 'Dielectric constant K', min: 1, max: 80, step: 1 },
    { key: 'E0', label: 'Applied field E₀ (V/m)', min: 200, max: 1000, step: 200 },
    { readout: [
      ['Nearest material', (s) => `${near(s.K)[0]} (K = ${near(s.K)[1]})`],
      ['Net field E', (s) => `${(s.E0 / s.K).toFixed(0)} V/m`],
      ['Polarisation share', (s) => `${((1 - 1 / s.K) * 100).toFixed(1)} % of E₀ cancelled`],
      ['Bound charge ÷ free charge', (s) => (1 - 1 / s.K).toFixed(3)],
    ] },
  ],
  tex: (s) => `E=\\dfrac{E_0}{K}=\\dfrac{${s.E0}}{${s.K}}=${(s.E0 / s.K).toFixed(0)}\\ \\mathrm{V/m}`,
});
