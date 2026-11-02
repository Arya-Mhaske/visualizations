import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { w: 30, v: 25, rev: false };
const m = 0.16;
const side = (s, x) => (s.rev ? -1 : 1) * 0.5 * ((6e-4 * s.w * s.v) / m) * (x / s.v) ** 2;

plotTool({
  state,
  label: 'A top view of the path of a spinning ball moving forward. The sideways force from the spin bends the path to one side, and the bend reverses if the spin is reversed.',
  x: [0, 20],
  y: [-2, 2],
  xLabel: 'distance forward (m)',
  yLabel: 'sideways swing (m)',
  range: (s) => [[0, 20], [-Math.max(Math.abs(side(s, 20)) * 1.3, 0.5), Math.max(Math.abs(side(s, 20)) * 1.3, 0.5)]],
  curves: (s, c) => [[() => 0, { color: c.grid, dash: [5, 5] }], [(x) => side(s, x), { color: c.a }]],
  controls: [
    { title: 'Bowl it' },
    { key: 'w', label: 'Spin (rev/s)', min: 0, max: 50, step: 5 },
    { key: 'v', label: 'Speed (m/s)', min: 10, max: 40, step: 1 },
    { key: 'rev', label: 'Reverse the spin', toggle: true },
    { readout: [['Swing after 20 m', (s) => `${fixed(side(s, 20), 2)} m`]] },
  ],
  tex: () => `F_{\\text{side}}\\propto\\omega v`,
});
