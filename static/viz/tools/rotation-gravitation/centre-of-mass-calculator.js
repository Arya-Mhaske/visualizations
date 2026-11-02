import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { mode: 'particles', m1: 1, m2: 2, m3: 3, a: 1, ax: 1.5 };
const P = [[0, 0], [4, 0], [1, 3]];
let hide = () => {};
// L-shape: horizontal bar 6 x a, vertical bar a x 6 sharing the corner.
function parts(s) {
  const bar1 = [6 * s.a, 3, s.a / 2];
  const bar2 = [(6 - s.a) * s.a, s.a / 2, s.a + (6 - s.a) / 2];
  return [bar1, bar2];
}
function cm(s) {
  if (s.mode === 'particles') {
    const M = s.m1 + s.m2 + s.m3;
    return [(s.m1 * P[0][0] + s.m2 * P[1][0] + s.m3 * P[2][0]) / M, (s.m1 * P[0][1] + s.m2 * P[1][1] + s.m3 * P[2][1]) / M];
  }
  if (s.mode === 'L') {
    const [a, b] = parts(s);
    const A = a[0] + b[0];
    return [(a[0] * a[1] + b[0] * b[1]) / A, (a[0] * a[2] + b[0] * b[2]) / A];
  }
  return [(0 + 6 + s.ax) / 3, 4 / 3];
}

plotTool({
  state,
  label: 'The chosen system on a grid with a dot at its centre of mass: three particles, an L-shaped plate or a triangle.',
  x: [-1, 8],
  y: [-1, 8],
  xLabel: 'x',
  yLabel: 'y',
  range: () => [[-1, 8], [-1, 8]],
  segments: (s, c) => {
    if (s.mode === 'L') return [[0, 0, 6, 0, { color: c.ink, width: 3 }], [6, 0, 6, s.a, { color: c.ink, width: 3 }], [6, s.a, s.a, s.a, { color: c.ink, width: 3 }], [s.a, s.a, s.a, 6, { color: c.ink, width: 3 }], [s.a, 6, 0, 6, { color: c.ink, width: 3 }], [0, 6, 0, 0, { color: c.ink, width: 3 }]];
    if (s.mode === 'triangle') return [[0, 0, 6, 0, { color: c.ink, width: 3 }], [6, 0, s.ax, 4, { color: c.ink, width: 3 }], [s.ax, 4, 0, 0, { color: c.ink, width: 3 }], [3, 0, s.ax, 4, { color: c.grid, width: 1, dash: [4, 4] }], [0, 0, (6 + s.ax) / 2, 2, { color: c.grid, width: 1, dash: [4, 4] }], [6, 0, s.ax / 2, 2, { color: c.grid, width: 1, dash: [4, 4] }]];
    return [];
  },
  points: (s, c) => [...(s.mode === 'particles' ? P.map(([x, y], i) => [x, y, c.fillB, 5 + [s.m1, s.m2, s.m3][i] * 2]) : []), [...cm(s), c.a, 8]],
  controls: [
    { title: 'Choose a system' },
    { key: 'mode', label: 'System', options: [['particles', 'Particles'], ['L', 'L-shaped plate'], ['triangle', 'Triangle']] },
    { key: 'm1', label: 'Mass at (0, 0)', min: 1, max: 6, step: 1 },
    { key: 'm2', label: 'Mass at (4, 0)', min: 1, max: 6, step: 1 },
    { key: 'm3', label: 'Mass at (1, 3)', min: 1, max: 6, step: 1 },
    { key: 'a', label: 'L arm thickness', min: 0.5, max: 3, step: 0.5 },
    { key: 'ax', label: 'Triangle apex x', min: 0, max: 6, step: 0.5 },
    { readout: [['Centre of mass', (s) => `(${fixed(cm(s)[0], 3)}, ${fixed(cm(s)[1], 3)})`]] },
  ],
  tex: (s) => `(\\bar x,\\bar y)=(${fixed(cm(s)[0], 3)},\\ ${fixed(cm(s)[1], 3)})`,
  onChange: (s) => hide(s),
});
hide = (s) => {
  const f = [...document.querySelectorAll('#panel .nb-field')];
  f.forEach((e, i) => {
    if (i === 0) return;
    e.hidden = !({ particles: [1, 2, 3], L: [4], triangle: [5] }[s.mode] || []).includes(i);
  });
};
hide(state);
