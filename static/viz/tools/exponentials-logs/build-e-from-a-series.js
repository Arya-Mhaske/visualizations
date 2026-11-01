import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { eSum, compound } from './_exp-log-math.js';

const state = { k: 5 };
const err = (v) => Math.log10(Math.abs(Math.E - v));
const seriesErr = (k) => err(eSum(k));
const compoundErr = (n) => err(compound(1, n));
const correct = (k) => Math.max(0, Math.floor(-Math.log10(Math.abs(Math.E - eSum(k)))));
const termsTex = (k) => ['1', '1', ...Array.from({ length: Math.max(0, k - 1) }, (_, i) => `\\tfrac1{${i + 2}!}`)].slice(0, k + 1).join('+');

createTool({
  state,
  label: 'A graph of how small the error is, counting zeros after the decimal point, against the number of terms. The coral line is the factorial series 1 plus 1 plus 1 over 2 factorial and so on. The blue line is the compounding formula one plus one over n to the n. The series error plunges far faster.',
  setup: (stage, c) => createPlot(stage, { x: [0, 12], y: [-11, 1], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'terms k (or n)', yLabel: 'log₁₀ error' });
    for (let k = 1; k <= state.k; k++) {
      if (k >= 2) plot.segment(k - 1, compoundErr(k - 1), k, compoundErr(k), { color: c.b, width: 3 });
      plot.point(k, compoundErr(k), { fill: c.b, r: 5 });
    }
    for (let k = 0; k <= state.k; k++) {
      if (k >= 1) plot.segment(k - 1, seriesErr(k - 1), k, seriesErr(k), { color: c.a, width: 3 });
      plot.point(k, seriesErr(k), { fill: c.a, r: 6 });
    }
    plot.text('series', 9.3, -3.2, { color: c.a, size: 11 });
    plot.text('(1+1/n)ⁿ', 9.3, -0.1, { color: c.b, size: 11 });
  },
  controls: [
    { title: 'Add terms' },
    { key: 'k', label: 'Terms after the first, k', min: 0, max: 12, step: 1 },
    { readout: [
      ['Sum', (s) => fixed(eSum(s.k), 10)],
      ['e', () => fixed(Math.E, 10)],
      ['Correct decimals', (s) => `${correct(s.k)}`],
      ['(1+1/n)ⁿ with n = k', (s) => (s.k ? fixed(compound(1, s.k), 6) : '—')],
    ] },
  ],
  tex: (s) => `S_{${s.k}}=${termsTex(s.k)}=${fixed(eSum(s.k), 8)}`,
});
