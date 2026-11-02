import { barTool } from '../../lib/recipes.js';

const state = { a: 3, b: 1, sum: false };
const parts = (s) => (s.sum ? [['a² (a+b)', s.a * s.a * (s.a + s.b)], ['−ab (a+b)', -s.a * s.b * (s.a + s.b)], ['b² (a+b)', s.b * s.b * (s.a + s.b)]] : [['a² (a−b)', s.a * s.a * (s.a - s.b)], ['ab (a−b)', s.a * s.b * (s.a - s.b)], ['b² (a−b)', s.b * s.b * (s.a - s.b)]]);
const total = (s) => parts(s).reduce((t, p) => t + p[1], 0);

barTool({
  state,
  label: 'Bars for the three pieces whose volumes add up to a cubed minus b cubed, or a cubed plus b cubed. Each piece contains the common factor.',
  rows: (s, c) => parts(s).map(([n, v], i) => [n, Math.abs(v), v < 0 ? c.fillA : [c.fillB, c.fillC, c.fillB][i], String(v)]),
  max: (s) => s.a ** 3 + s.b ** 3,
  left: 0.3,
  controls: [
    { title: 'Cubes' },
    { key: 'a', label: 'a', min: 2, max: 6, step: 1 },
    { key: 'b', label: 'b', min: 1, max: 5, step: 1 },
    { key: 'sum', label: 'Sum a³ + b³ (instead of difference)', toggle: true },
    { readout: [['Sum of the pieces', (s) => String(total(s))], ['a³ ∓ b³', (s) => String(s.sum ? s.a ** 3 + s.b ** 3 : s.a ** 3 - s.b ** 3)]] },
  ],
  tex: (s) => (s.sum ? `a^3+b^3=(a+b)(a^2-ab+b^2)=${total(s)}` : `a^3-b^3=(a-b)(a^2+ab+b^2)=${total(s)}`),
  onChange: (s) => {
    s.b = Math.min(s.b, s.a - 1);
  },
});
