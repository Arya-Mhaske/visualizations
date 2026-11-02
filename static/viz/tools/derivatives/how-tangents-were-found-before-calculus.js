import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { x: 1.5, e: 0.6 };

plotTool({
  state,
  label: 'The parabola y equals x squared with a point on it, the tangent line found by marking a point half way along the axis (Fermat\'s subtangent), and a small triangle on the curve (Barrow) whose slope gets closer to the tangent slope as it shrinks.',
  x: [-1, 4],
  y: [-1, 10],
  range: () => [[-0.5, 3.5], [-1, 10]],
  curves: (s, c) => [[(x) => x * x, { color: c.ink }]],
  segments: (s, c) => [[s.x / 2, 0, s.x, s.x * s.x, { color: c.a, width: 3 }], [s.x / 2, 0, s.x, 0, { color: c.c, width: 5 }], [s.x, 0, s.x, s.x * s.x, { color: c.grid, width: 1, dash: [4, 4] }], [s.x, s.x * s.x, s.x + s.e, s.x * s.x, { color: c.b, width: 3 }], [s.x + s.e, s.x * s.x, s.x + s.e, (s.x + s.e) ** 2, { color: c.b, width: 3 }]],
  points: (s, c) => [[s.x, s.x * s.x, c.a, 7], [s.x / 2, 0, c.c, 5]],
  controls: [
    { title: 'Two old methods' },
    { key: 'x', label: 'Point x', min: 0.5, max: 3, step: 0.1 },
    { key: 'e', label: 'Barrow\'s triangle width e', min: 0.01, max: 1, step: 0.01 },
    { readout: [
      ['Fermat: subtangent', (s) => fixed(s.x / 2, 3)],
      ['Slope from subtangent y / (x/2)', (s) => fixed((s.x * s.x) / (s.x / 2), 3)],
      ['Barrow: Δy/Δx', (s) => fixed(((s.x + s.e) ** 2 - s.x * s.x) / s.e, 3)],
      ['2x', (s) => fixed(2 * s.x, 3)],
    ] },
  ],
  tex: (s) => `\\dfrac{\\Delta y}{\\Delta x}=2x+e=${fixed(((s.x + s.e) ** 2 - s.x * s.x) / s.e, 3)}\\ \\to\\ 2x`,
});
