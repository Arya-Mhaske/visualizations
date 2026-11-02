import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sci } from '../../lib/format.js';
import { tinyError, tinyPivot, exactTiny } from './_elimination-lu-math.js';

// [[ε, 1], [1, 1]] x = (1, 2), solved by hand-style elimination that keeps only a few digits.
const state = { e: 5, digits: 5 };
const eps = (s) => 10 ** -s.e;
const logErr = (value) => Math.log10(Math.max(value, 1e-16));

createTool({
  state,
  label: 'The error of a small system solved with a few digits of precision, plotted against how tiny the first pivot epsilon is. Taking the first pivot as it comes, the error grows as epsilon shrinks. Swapping rows first to use the largest pivot keeps the error tiny.',
  setup: (stage, c) => createPlot(stage, { x: [1, 8], y: [-16, 1], c, pad: 26 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '−log ε', yLabel: 'log error' });
    for (const [pivot, color] of [[false, c.a], [true, c.c]]) {
      plot.fn((x) => logErr(tinyError(10 ** -Math.round(x), state.digits, pivot)), { color, width: 4, domain: [1, 8] });
    }
    plot.segment(state.e, -16, state.e, 1, { color: c.grid, width: 2, dash: [5, 4] });
    plot.point(state.e, logErr(tinyError(eps(state), state.digits, false)), { fill: c.fillA, r: 7 });
    plot.point(state.e, logErr(tinyError(eps(state), state.digits, true)), { fill: c.fillC, r: 7 });
    plot.text('first pivot as it comes', 2, -2.2, { size: 10, color: c.a, align: 'left', patch: false });
    plot.text('largest pivot first', 2, -12, { size: 10, color: c.c, align: 'left', patch: false });
  },
  controls: [
    { title: 'Keep only a few digits' },
    { key: 'e', label: 'First pivot ε = 10⁻ᵏ, k', min: 1, max: 8, step: 1, format: (n) => `${n}` },
    { key: 'digits', label: 'Digits kept', min: 3, max: 10, step: 1, format: (n) => `${n}` },
    { readout: [
      ['True x', (s) => `(${fixed(exactTiny(eps(s))[0], 6)}, ${fixed(exactTiny(eps(s))[1], 6)})`],
      ['First pivot as it comes', (s) => `(${fixed(tinyPivot(eps(s), s.digits, false)[0], 4)}, ${fixed(tinyPivot(eps(s), s.digits, false)[1], 4)})`],
      ['Largest pivot first', (s) => ({ text: `(${fixed(tinyPivot(eps(s), s.digits, true)[0], 4)}, ${fixed(tinyPivot(eps(s), s.digits, true)[1], 4)})`, good: true })],
      ['Relative error, no swap', (s) => sci(Math.max(tinyError(eps(s), s.digits, false), 1e-16), 2)],
      ['Relative error, swap', (s) => sci(Math.max(tinyError(eps(s), s.digits, true), 1e-16), 2)],
    ] },
  ],
  tex: (s) => `\\begin{bmatrix}10^{-${s.e}}&1\\\\1&1\\end{bmatrix}\\mathbf x=\\begin{bmatrix}1\\\\2\\end{bmatrix},\\quad \\text{multiplier }\\ell=10^{${s.e}}\\ \\text{is huge when the pivot is tiny}`,
});
