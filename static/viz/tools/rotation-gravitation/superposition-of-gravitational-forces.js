import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { x: 1, y: 0.8 };
const P = [[0, 0], [2, 0], [1, Math.sqrt(3)]];
const pull = (s, [px, py]) => {
  const [dx, dy] = [px - s.x, py - s.y];
  const d = Math.hypot(dx, dy) || 1e-9;
  return [dx / d ** 3, dy / d ** 3];
};
const net = (s) => P.map((p) => pull(s, p)).reduce((t, v) => [t[0] + v[0], t[1] + v[1]], [0, 0]);

plotTool({
  state,
  label: 'Three equal masses at the corners of a triangle and a test mass inside. Arrows from the test mass show the pull from each corner, and a thicker arrow shows the net pull.',
  x: [-1, 3],
  y: [-1, 3],
  range: () => [[-1, 3], [-1, 3]],
  segments: (s, c) => [...P.map((p, i) => { const v = pull(s, p); const k = 0.5; return [s.x, s.y, s.x + v[0] * k, s.y + v[1] * k, { color: [c.a, c.b, c.c][i], width: 3 }]; }), [s.x, s.y, s.x + net(s)[0] * 0.5, s.y + net(s)[1] * 0.5, { color: c.ink, width: 6 }]],
  points: (s, c) => [...P.map((p) => [p[0], p[1], c.fillB, 10]), [s.x, s.y, c.ink, 6]],
  controls: [
    { title: 'Move the test mass' },
    { key: 'x', label: 'x', min: 0.2, max: 1.8, step: 0.05 },
    { key: 'y', label: 'y', min: 0.1, max: 1.5, step: 0.05 },
    { readout: [
      ['Net pull (units of Gm/d²)', (s) => `${fixed(Math.hypot(...net(s)), 3)}`],
      ['At the centroid (1, 0.577)', () => '0'],
    ] },
  ],
  tex: (s) => `\\vec F=\\sum\\vec F_i=(${fixed(net(s)[0], 3)},\\ ${fixed(net(s)[1], 3)})`,
});
