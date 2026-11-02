import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// Tight-binding chain of N atoms. Each atomic level E0 splits into N levels E_k = E0 − 2t cos(kπ/(N+1)),
// where the coupling t falls off as the atoms move apart: t(a) = t0 exp(−(a − 1)/0.9). Schematic energies.
const LEVELS = [['3s', -8], ['3p', -2]];
const state = { N: 6, a: 2.2 };
const t0 = 3;
const hop = (a) => t0 * Math.exp(-(a - 1) / 0.9);
const level = (E0, k, N, a) => E0 - 2 * hop(a) * Math.cos((k * Math.PI) / (N + 1));
const width = (a) => 4 * hop(a);
const centreGap = (s) => { const k = Math.floor(s.N / 2); return level(0, k + 1, s.N, s.a) - level(0, k, s.N, s.a); };

const tool = createTool({
  state,
  label: 'A graph of energy against the spacing between atoms. At large spacing, on the right, there are two single levels. Moving left the atoms come closer, and each level splits into N lines that spread apart. A vertical coral line marks the chosen spacing, with a dot on every level at that spacing.',
  setup: (stage, c) => createPlot(stage, { x: [1, 5], y: [-15, 5], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'spacing a →', yLabel: 'E (eV)', grid: false });
    for (const [name, E0] of LEVELS) {
      for (let k = 1; k <= state.N; k++) {
        plot.fn((a) => level(E0, k, state.N, a), { color: c.b, width: 2, domain: [1, 5] });
        plot.point(state.a, level(E0, k, state.N, state.a), { fill: c.a, r: 4 });
      }
      plot.text(name, 4.85, E0 + 0.9, { align: 'right', size: 11 });
    }
    plot.segment(state.a, -15, state.a, 5, { color: c.a, width: 2, dash: [5, 4] });
  },
  controls: () => [
    { title: 'Bring atoms together' },
    { key: 'N', label: 'Number of atoms N', min: 2, max: 14, step: 1 },
    { key: 'a', label: 'Spacing', min: 1, max: 5, step: 0.05, format: (v) => `${fixed(v, 2)} (relative)` },
    { readout: [
      ['Levels in each group', (s) => s.N],
      ['Width of each band', (s) => `${fixed(width(s.a), 2)} eV`],
      ['Gap, mid-band levels', (s) => `${fixed(centreGap(s), 3)} eV`],
      ['Do 3s and 3p overlap?', (s) => (width(s.a) > 6 ? 'yes' : 'no')],
    ] },
  ],
  tex: (s) => `E_k=E_0-2t\\cos\\dfrac{k\\pi}{N+1},\\quad k=1\\ldots${s.N}`,
});

tool.update();
