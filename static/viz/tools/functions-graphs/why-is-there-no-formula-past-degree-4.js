import { createTool } from '../../lib/tool.js';
import { label, line, dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// Dates are the commonly given ones; "c." marks approximate years.
const EVENTS = [
  { y: 1545, text: 'Cardano publishes the formula for cubics in Ars Magna, credited to del Ferro and Tartaglia, and the quartic formula found by his student Ferrari.' },
  { y: 1799, text: 'Ruffini gives a proof that the quintic cannot be solved with roots. It is thought to have gaps.' },
  { y: 1824, text: 'Abel proves that there is no general formula in radicals for degree 5 or more.' },
  { y: 1832, text: 'Galois explains why, by tracking which equations can be solved with roots (c. 1830–32).' },
];
const state = { year: 1600, deg: 3 };
const known = (s = state) => EVENTS.filter((e) => e.y <= s.year);
// x⁵ − x − 1: a quintic with no solution in radicals, but a real root all the same, found here by Newton's method
function newton() {
  let x = 1.2;
  for (let i = 0; i < 30; i++) x -= (x ** 5 - x - 1) / (5 * x ** 4 - 1);
  return x;
}

createTool({
  state,
  label: 'A timeline from 1500 to 1850 and a chart of polynomial degrees. Equations of degree 2, 3 and 4 can be solved by a formula that uses only arithmetic and roots. Move the year slider to see the story: the cubic and quartic formulas in the 1500s, then Abel\'s proof in 1824 that no such formula exists for general degree 5 or more. The equation x to the fifth minus x minus 1 has a real root, found here numerically, though no formula in radicals can give it.',
  draw(ctx, stage, c) {
    const [x0, x1, y] = [stage.w * 0.08, stage.w * 0.92, stage.h * 0.28];
    const at = (yr) => x0 + ((yr - 1500) / 350) * (x1 - x0);
    line(ctx, x0, y, x1, y, { color: c.ink, width: 3 });
    for (let yr = 1500; yr <= 1850; yr += 50) label(ctx, `${yr}`, at(yr), y + 20, c, { size: 9, bounds: stage, patch: false });
    EVENTS.forEach((e) => dot(ctx, at(e.y), y, e.y <= state.year ? 8 : 4, e.y <= state.year ? c.a : c.paper, c.ink));
    line(ctx, at(state.year), y - 24, at(state.year), y + 8, { color: c.d, width: 3 });
    ['2', '3', '4', '5', '6'].forEach((d, i) => {
      const solved = i < 3 && (i < 1 || state.year >= 1545);
      const bx = stage.w * (0.1 + i * 0.17);
      label(ctx, `degree ${d}`, bx + 20, stage.h * 0.58, c, { size: 11, bounds: stage, patch: false });
      label(ctx, i < 3 ? (solved ? 'formula' : 'not yet') : state.year >= 1824 ? 'no formula (proved)' : 'unknown', bx + 20, stage.h * 0.68, c, { size: 10, color: solved ? c.c : c.a, bounds: stage, patch: false });
    });
    label(ctx, `x⁵ − x − 1 = 0 has a real root near ${fixed(newton(), 4)}`, stage.w / 2, stage.h * 0.88, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Move through history' },
    { key: 'year', label: 'Year', min: 1500, max: 1850, step: 1 },
    { readout: [
      ['Latest event', (s) => (known(s).length ? known(s).at(-1).text : 'nothing yet')],
      ['Degrees with a formula', (s) => (s.year >= 1545 ? '2, 3 and 4 (and none above)' : '2')],
    ] },
  ],
  tex: () => 'x^2,\\ x^3,\\ x^4:\\ \\text{formulas}\\qquad x^5-x-1=0:\\ \\text{no formula in radicals}',
});
