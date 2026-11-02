import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { mean, sd } from './_seq.js';

const state = { a: 1, b: 0 };
const X = [2, 4, 4, 4, 5, 5, 7, 9];
const Y = (s) => X.map((x) => s.a * x + s.b);

plotTool({
  state,
  label: 'Two dot plots on one scale: the original data and the data after multiplying by a and adding b. Shifting slides the dots; scaling stretches them.',
  x: [-20, 20],
  y: [-1, 2],
  range: () => [[-25, 25], [-0.8, 1.8]],
  segments: (s, c) => [[mean(X) - sd(X), 1.4, mean(X) + sd(X), 1.4, { color: c.a, width: 6 }], [mean(Y(s)) - sd(Y(s)), 0.4, mean(Y(s)) + sd(Y(s)), 0.4, { color: c.b, width: 6 }]],
  points: (s, c) => [...X.map((x) => [x, 1, c.a, 5]), ...Y(s).map((y) => [y, 0, c.b, 5])],
  controls: [
    { title: 'y = a x + b' },
    { key: 'a', label: 'Scale a', min: -3, max: 3, step: 0.5 },
    { key: 'b', label: 'Shift b', min: -10, max: 10, step: 1 },
    { readout: [
      ['Mean: x | y', (s) => `${fixed(mean(X), 2)} | ${fixed(mean(Y(s)), 2)}`],
      ['SD: x | y', (s) => `${fixed(sd(X), 3)} | ${fixed(sd(Y(s)), 3)}`],
      ['|a| × SD(x)', (s) => fixed(Math.abs(s.a) * sd(X), 3)],
    ] },
  ],
  tex: (s) => `\\sigma(ax+b)=|a|\\sigma(x)=${fixed(Math.abs(s.a) * sd(X), 3)}`,
});
