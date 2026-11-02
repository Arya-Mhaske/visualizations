import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const F = { sq: ['x² at a = 1', (x) => x * x, 1, 2], abs: ['|x| at a = 0', Math.abs, 0, null], sin: ['sin x at a = 1', Math.sin, 1, Math.cos(1)] };
const state = { f: 'sq', k: 0 };
const w = (s) => 2 * 10 ** -s.k;
const right = (s) => (F[s.f][1](F[s.f][2] + w(s) / 2) - F[s.f][1](F[s.f][2])) / (w(s) / 2);
const left = (s) => (F[s.f][1](F[s.f][2]) - F[s.f][1](F[s.f][2] - w(s) / 2)) / (w(s) / 2);
const slope = (s) => (right(s) + left(s)) / 2;

plotTool({
  state,
  label: 'A view of a curve through a magnifying window centred on the chosen point. As the window shrinks, a smooth curve looks like a straight line, but the corner of the absolute value stays a corner.',
  x: [0, 2],
  y: [0, 2],
  range: (s) => { const [, f, a] = F[s.f]; return [[a - w(s), a + w(s)], [f(a) - w(s), f(a) + w(s)]]; },
  curves: (s, c) => [[F[s.f][1], { color: c.b }]],
  segments: (s, c) => { const [, f, a] = F[s.f]; const m = slope(s); return s.f === 'abs' ? [] : [[a - w(s), f(a) - m * w(s), a + w(s), f(a) + m * w(s), { color: c.a, width: 2, dash: [5, 4] }]]; },
  points: (s, c) => [[F[s.f][2], F[s.f][1](F[s.f][2]), c.a]],
  controls: [
    { title: 'The microscope' },
    { key: 'f', label: 'Curve and point', options: Object.entries(F).map(([k, v]) => [k, v[0]]) },
    { key: 'k', label: 'Zoom level (×10 each step)', min: 0, max: 6, step: 1 },
    { readout: [
      ['Window width', (s) => `${w(s).toExponential(1)}`],
      ['Slope from the right', (s) => fixed(right(s), 6)],
      ['Slope from the left', (s) => fixed(left(s), 6)],
      ['Exact f′(a)', (s) => (F[s.f][3] === null ? 'does not exist' : fixed(F[s.f][3], 6))],
    ] },
  ],
  tex: (s) => `f'(a)=\\lim_{h\\to0}\\dfrac{f(a+h)-f(a-h)}{2h}`,
});
