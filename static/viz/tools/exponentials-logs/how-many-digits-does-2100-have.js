import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { powerDigits } from './_exp-log-math.js';

const state = { a: 2, n: 100 };

createTool({
  state,
  label: 'A number line of the logarithm of a to the power n, zoomed in around its value. A bar runs up to the log. The whole number just below it, plus one, is the number of digits. The exact digit count from the full number is shown beside the log reading so you can check they agree.',
  setup: (stage, c) => createPlot(stage, { x: [0, 8], y: [-1, 3], c }),
  draw(ctx, stage, c, plot) {
    const { L } = powerDigits(state.a, state.n);
    const f = Math.floor(L);
    const lo = Math.max(0, f - 3);
    plot.setRange([lo, lo + 8], [-1, 3]);
    plot.segment(lo, 0, lo + 8, 0, { color: c.ink, width: 3 });
    plot.shade(() => 0.8, null, lo, L, c.fillA);
    plot.segment(lo, 0.8, L, 0.8, { color: c.ink, width: 3 });
    plot.segment(L, 0, L, 0.8, { color: c.ink, width: 3 });
    for (let v = lo; v <= lo + 8; v++) {
      plot.segment(v, 0, v, -0.2, { color: c.ink, width: 3 });
      plot.text(`${v}`, v, -0.55, { size: 11, patch: false });
    }
    plot.segment(f, 0, f, 2.2, { color: c.c, width: 3, dash: [6, 4] });
    plot.segment(f + 1, 0, f + 1, 2.2, { color: c.b, width: 3, dash: [6, 4] });
    plot.text(`10^${f}`, f, 2.5, { size: 11, color: c.c });
    plot.text(`10^${f + 1}`, f + 1, 2.5, { size: 11, color: c.b });
    plot.text(`log₁₀ = ${fixed(L, 3)}`, L, 1.3, { size: 12 });
    plot.point(L, 0.8, { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Count digits with a log' },
    { key: 'a', label: 'Base a', min: 2, max: 9, step: 1 },
    { key: 'n', label: 'Exponent n', min: 1, max: 300, step: 1 },
    { readout: [
      ['log₁₀(aⁿ) = n log₁₀ a', (s) => fixed(powerDigits(s.a, s.n).L, 4)],
      ['Digits by the log', (s) => `${powerDigits(s.a, s.n).byLog}`],
      ['Digits, counted exactly', (s) => ({ text: `${powerDigits(s.a, s.n).exact}`, good: powerDigits(s.a, s.n).exact === powerDigits(s.a, s.n).byLog })],
      ['Starts with', (s) => `${powerDigits(s.a, s.n).lead[0]}.${powerDigits(s.a, s.n).lead.slice(1)}…`],
    ] },
  ],
  tex: (s) => {
    const d = powerDigits(s.a, s.n);
    return `\\log_{10}(${s.a}^{${s.n}})=${s.n}\\log_{10}${s.a}=${fixed(d.L, 3)}\\ \\Rightarrow\\ \\lfloor ${fixed(d.L, 3)}\\rfloor+1=${d.byLog}\\text{ digits}`;
  },
});
