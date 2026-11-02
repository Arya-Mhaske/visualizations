import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { stackBoxes } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';

// Functions on [−π, π] are vectors, and the dot product is an integral. sin(nx) and sin(mx) are orthogonal for n ≠ m.
// So the coefficient of sin(kx) in a function f is a projection: b_k = (f · sin kx) / (sin kx · sin kx).
const state = { view: 'orth', n: 2, m: 3, terms: 3 };
const N = 800;
const integrate = (g) => { let s = 0; const h = (2 * Math.PI) / N; for (let i = 0; i < N; i++) s += g(-Math.PI + (i + 0.5) * h) * h; return s; };
const square = (x) => (x >= 0 ? 1 : -1);
const bk = (k) => integrate((x) => square(x) * Math.sin(k * x)) / Math.PI;
const COEFFS = Array.from({ length: 16 }, (_, k) => (k === 0 ? 0 : bk(k)));
const partialFast = (x, terms) => { let s = 0; for (let k = 1; k <= terms; k++) s += COEFFS[k] * Math.sin(k * x); return s; };

createTool({
  state,
  label: 'Two views. In the orthogonality view, the graphs of sine n x and sine m x are drawn above their product, and the area under the product is the integral that plays the role of the dot product. It is zero for different n and m, and pi for equal ones. In the second view, a square wave is rebuilt as a sum of sines, each coefficient found by projecting onto one sine, and the partial sum hugs the square wave more closely as terms are added.',
  setup: (stage, c) => {
    const [top, bottom] = stackBoxes(2);
    return [
      createPlot(stage, { x: [-Math.PI, Math.PI], y: [-1.6, 1.6], c, pad: 22, ticks: 'pi', box: top }),
      createPlot(stage, { x: [-Math.PI, Math.PI], y: [-1.6, 1.6], c, pad: 22, ticks: 'pi', box: bottom }),
    ];
  },
  draw(ctx, stage, c, [up, low]) {
    up.axes({ xLabel: 'x', yLabel: '' });
    low.axes({ xLabel: 'x', yLabel: '' });
    if (state.view === 'orth') {
      up.fn((x) => Math.sin(state.n * x), { color: c.a, width: 3 });
      up.fn((x) => Math.sin(state.m * x), { color: c.b, width: 3 });
      low.shade((x) => Math.sin(state.n * x) * Math.sin(state.m * x), null, -Math.PI, Math.PI, c.fillY);
      low.fn((x) => Math.sin(state.n * x) * Math.sin(state.m * x), { color: c.ink, width: 3 });
      return;
    }
    up.fn(square, { color: c.grid, width: 3 });
    up.fn((x) => partialFast(x, state.terms), { color: c.a, width: 4 });
    for (let k = 1; k <= state.terms; k++) low.fn((x) => COEFFS[k] * Math.sin(k * x), { color: k % 2 ? c.b : c.d, width: 2 });
  },
  controls: [
    { title: 'Sines as vectors' },
    { key: 'view', label: 'View', options: [['orth', 'Orthogonality'], ['build', 'Build a square wave']] },
    { key: 'n', label: 'First sine: n', min: 1, max: 6, step: 1, format: (n) => `${n}` },
    { key: 'm', label: 'Second sine: m', min: 1, max: 6, step: 1, format: (n) => `${n}` },
    { key: 'terms', label: 'Terms in the sum', min: 1, max: 15, step: 1, format: (n) => `${n}` },
    { readout: [
      ['∫ sin(nx) sin(mx) dx', (s) => (s.view === 'orth' ? { text: fixed(integrate((x) => Math.sin(s.n * x) * Math.sin(s.m * x)), 3), good: s.n !== s.m } : '—')],
      ['Coefficient b₁, b₃, b₅', (s) => (s.view === 'build' ? [1, 3, 5].map((k) => fixed(bk(k), 3)).join(', ') : '—')],
      ['4/(πk) for k = 1, 3, 5', () => [1, 3, 5].map((k) => fixed(4 / (Math.PI * k), 3)).join(', ')],
    ] },
  ],
  tex: (s) => (s.view === 'orth' ? '\\langle\\sin nx,\\sin mx\\rangle=\\displaystyle\\int_{-\\pi}^{\\pi}\\sin nx\\,\\sin mx\\,dx=\\begin{cases}\\pi&n=m\\\\0&n\\ne m\\end{cases}' : `b_k=\\dfrac{\\langle f,\\sin kx\\rangle}{\\langle\\sin kx,\\sin kx\\rangle},\\quad f\\approx\\textstyle\\sum_{k\\le${s.terms}}b_k\\sin kx`),
  onChange: (s) => show(s),
});
const fields = [...document.querySelectorAll('#panel .nb-field')];
function show(s) {
  if (fields.length < 4) return;
  fields[1].hidden = s.view !== 'orth';
  fields[2].hidden = s.view !== 'orth';
  fields[3].hidden = s.view !== 'build';
}
show(state);
