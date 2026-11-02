import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { eig2 } from './_la-math.js';

// (F(n+1), F(n)) = Q^n (1, 0) with Q = [[1, 1], [1, 0]]. Q's eigenvalues are φ = 1.618… and −0.618…
const state = { n: 8 };
const Q = [[1, 1], [1, 0]];
const fib = (n) => { let a = 0n; let b = 1n; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; };
const PHI = (1 + Math.sqrt(5)) / 2;
const ratio = (n) => Number(fib(n + 1)) / Number(fib(n));

createTool({
  state,
  label: 'The ratio of each Fibonacci number to the one before it, plotted against n. The ratios swing above and below the golden ratio, 1.618, and settle onto it. This happens because the matrix that steps the sequence forward has eigenvalues 1.618 and minus 0.618, and the second one fades away when raised to higher powers.',
  setup: (stage, c) => createPlot(stage, { x: [0, 26], y: [0.5, 2.2], c, pad: 26 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'n', yLabel: 'F(n+1) ÷ F(n)' });
    plot.segment(0, PHI, 26, PHI, { color: c.c, width: 3, dash: [6, 5] });
    for (let n = 1; n <= 25; n++) {
      if (n > 1) plot.segment(n - 1, ratio(n - 1), n, ratio(n), { color: c.a, width: 2 });
    }
    for (let n = 1; n <= 25; n++) plot.point(n, ratio(n), { fill: n === state.n ? c.fillY : c.fillA, r: n === state.n ? 8 : 4 });
    plot.text('φ = 1.618…', 24.5, PHI + 0.1, { size: 11, color: c.c, align: 'right', patch: false });
  },
  controls: [
    { title: 'Step the sequence forward' },
    { key: 'n', label: 'n', min: 1, max: 25, step: 1, format: (n) => `${n}` },
    { readout: [
      ['F(n)', (s) => String(fib(s.n))],
      ['F(n+1) ÷ F(n)', (s) => fixed(ratio(s.n), 6)],
      ['Binet: φⁿ ÷ √5, rounded', (s) => String(Math.round(PHI ** s.n / Math.sqrt(5)))],
      ['Eigenvalues of the step matrix', () => eig2(Q).l.map((v) => fixed(v, 4)).join(', ')],
      ['|second eigenvalue|ⁿ', (s) => fixed(Math.abs(eig2(Q).l[1]) ** s.n, 6)],
    ] },
  ],
  tex: (s) => `\\begin{bmatrix}F_{${s.n + 1}}\\\\F_{${s.n}}\\end{bmatrix}=\\begin{bmatrix}1&1\\\\1&0\\end{bmatrix}^{${s.n}}\\begin{bmatrix}1\\\\0\\end{bmatrix},\\quad F_n\\approx\\dfrac{\\varphi^{${s.n}}}{\\sqrt5}`,
});
