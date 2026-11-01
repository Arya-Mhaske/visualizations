import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sci, texSci, fixed } from '../../lib/format.js';

const THIN = 1e-4; // 0.1 mm in metres
const MOON = 3.844e8; // mean Earth–Moon distance in metres
const state = { n: 30 };
const metres = (n) => THIN * 2 ** n;
const lg = (n) => Math.log10(metres(n));
const nice = (m) => (m < 1 ? `${fixed(m * 1000, 1)} mm` : m < 1000 ? `${fixed(m, 1)} m` : `${sci(m / 1000, 2)} km`);
const MARKS = [['a person, 1.7 m', 1.7], ['Mount Everest, 8849 m', 8849], ['the Moon, 384 400 km', MOON]];

createTool({
  state,
  label: 'A graph of the thickness of a folded sheet of paper against the number of folds, on a digit-counting axis. The line is straight because each fold doubles the thickness. Horizontal lines mark a person, Mount Everest and the Moon; the line crosses the Moon at 42 folds.',
  setup: (stage, c) => createPlot(stage, { x: [0, 50], y: [-4.5, 9.5], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'folds', yLabel: 'log₁₀ m' });
    for (const [name, m] of MARKS) {
      plot.segment(0, Math.log10(m), 50, Math.log10(m), { color: c.b, width: 2, dash: [6, 4] });
      plot.text(name, 1, Math.log10(m) + 0.5, { size: 10, align: 'left', patch: false });
    }
    plot.fn((x) => -4 + x * Math.log10(2), { color: c.a, width: 4 });
    plot.segment(state.n, -4.5, state.n, lg(state.n), { color: c.grid, width: 2, dash: [4, 4] });
    plot.point(state.n, lg(state.n), { fill: c.fillY, r: 9 });
  },
  controls: [
    { title: 'Fold a 0.1 mm sheet' },
    { key: 'n', label: 'Folds', min: 0, max: 50, step: 1 },
    { readout: [
      ['Thickness', (s) => nice(metres(s.n))],
      ['Passes the Moon?', (s) => (metres(s.n) > MOON ? { text: 'yes', good: true } : { text: 'not yet', good: false })],
      ['First pass at', () => `${Math.ceil(Math.log2(MOON / THIN))} folds`],
    ] },
  ],
  tex: (s) => `0.0001\\text{ m}\\times 2^{${s.n}}=${texSci(metres(s.n), 3)}\\text{ m}`,
});
