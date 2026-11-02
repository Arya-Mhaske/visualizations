import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { h: 10, r: 0.6, n: 10 };
const dist = (s, n) => s.h + (2 * s.h * s.r * (1 - s.r ** n)) / (1 - s.r);
const total = (s) => (s.h * (1 + s.r)) / (1 - s.r);

plotTool({
  state,
  label: 'Total distance travelled by a bouncing ball against the number of bounces. It climbs towards a finite limit.',
  x: [0, 20],
  y: [0, 100],
  xLabel: 'number of bounces',
  yLabel: 'distance travelled (m)',
  range: (s) => [[0, 20], [0, total(s) * 1.1]],
  curves: (s, c) => [[() => total(s), { color: c.c, dash: [6, 5] }]],
  points: (s, c) => Array.from({ length: 21 }, (_, n) => [n, dist(s, n), n === s.n ? c.a : c.b, n === s.n ? 7 : 4]),
  controls: [
    { title: 'The ball' },
    { key: 'h', label: 'Drop height h (m)', min: 1, max: 20, step: 1 },
    { key: 'r', label: 'Rebound ratio r', min: 0.2, max: 0.9, step: 0.05 },
    { key: 'n', label: 'Bounces', min: 0, max: 20, step: 1 },
    { readout: [['Distance so far', (s) => `${fixed(dist(s, s.n), 2)} m`], ['Total, all bounces', (s) => `${fixed(total(s), 2)} m`]] },
  ],
  tex: (s) => `d=\\dfrac{h(1+r)}{1-r}=${fixed(total(s), 2)}\\ \\mathrm{m}`,
});
