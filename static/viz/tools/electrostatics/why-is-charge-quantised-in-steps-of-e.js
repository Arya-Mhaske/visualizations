import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { E } from './_charge.js';

const state = { n: 3 };
const fmt = (q) => `${(q * 1e19).toFixed(1).replace('-', '−')}×10⁻¹⁹ C`;

createTool({
  state,
  label: 'A staircase graph of the charge on an object against the number of electrons added. Charge can sit only on the steps, whole multiples of e. A marker sits on the current step.',
  setup: (stage, c) => createPlot(stage, { c, x: [-11, 11], y: [-1.9e-18, 1.9e-18] }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'electrons added', yLabel: 'q' });
    for (let k = -10; k <= 10; k++) {
      plot.segment(k - 0.4, -k * E, k + 0.4, -k * E, { color: c.b, width: 4 });
      plot.point(k, -k * E, { fill: k === state.n ? c.a : c.paper, r: k === state.n ? 8 : 4 });
    }
    plot.text('no values between steps', 0, 1.6e-18, { size: 11, patch: false });
  },
  controls: [
    { title: 'Add or remove electrons' },
    { key: 'n', label: 'Electrons added (− means removed)', min: -10, max: 10, step: 1 },
    { readout: [
      ['Charge q', (s) => fmt(-s.n * E)],
      ['Smallest step', () => '1.6×10⁻¹⁹ C'],
      ['Electrons in 1 µC', () => '6.2×10¹²'],
    ] },
  ],
  tex: (s) => `q=ne=${-s.n}\\times 1.6\\times 10^{-19}=${(-s.n * 1.6).toFixed(1)}\\times 10^{-19}\\ \\mathrm{C}`,
});
