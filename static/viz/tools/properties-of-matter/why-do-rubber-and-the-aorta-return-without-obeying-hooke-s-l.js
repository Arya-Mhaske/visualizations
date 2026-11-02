import { plotTool } from '../../lib/recipes.js';
import { sig } from '../../lib/format.js';

const state = { m: 'rubber', e: 4 };
const load = (s, x) => (s.m === 'steel' ? x * 100 : 0.5 * (x + 0.3 * x ** 3));
const unload = (s, x) => (s.m === 'steel' ? x * 100 : 0.65 * load(s, x));
const xmax = (s) => (s.m === 'steel' ? 5 : 6);

plotTool({
  state,
  label: 'Stress against strain on loading and on unloading. For rubber the curve is bent and the return path is lower, enclosing a loop. For steel both paths are the same straight line.',
  x: [0, 6],
  y: [0, 20],
  xLabel: 'strain (arbitrary units)',
  yLabel: 'stress',
  range: (s) => [[0, xmax(s)], [0, load(s, xmax(s)) * 1.1]],
  shades: (s, c) => [[(x) => load(s, x), (x) => unload(s, x), 0, s.e, c.fillA]],
  curves: (s, c) => [[(x) => load(s, x), { color: c.b, domain: [0, xmax(s)] }], [(x) => unload(s, x), { color: c.a, domain: [0, xmax(s)] }]],
  points: (s, c) => [[s.e, load(s, s.e), c.b], [s.e, unload(s, s.e), c.a]],
  controls: [
    { title: 'Load and release' },
    { key: 'm', label: 'Material', options: [['rubber', 'Rubber or aorta'], ['steel', 'Steel']] },
    { key: 'e', label: 'Strain reached', min: 0.5, max: 5, step: 0.5 },
    { readout: [
      ['Stress on loading', (s) => sig(load(s, s.e), 3)],
      ['Stress on release', (s) => sig(unload(s, s.e), 3)],
      ['Loop (energy lost)', (s) => (s.m === 'steel' ? 'none' : 'shaded area')],
    ] },
  ],
  tex: () => `\\text{elastic}\\ne\\text{Hookean}`,
});
