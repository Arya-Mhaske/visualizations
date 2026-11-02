import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { k: 2, j: 1 };
const w = (s) => s.k / s.j;

barTool({
  state,
  label: 'Bars comparing momentum and kinetic energy of k balls arriving at speed one with those of j balls leaving. Both bars match only when j equals k.',
  rows: (s, c) => [['p in', s.k, c.fillB, fixed(s.k, 2)], ['p out', s.j * w(s), c.fillC, fixed(s.j * w(s), 2)], ['KE in', 0.5 * s.k, c.fillB, fixed(0.5 * s.k, 2)], ['KE out', 0.5 * s.j * w(s) ** 2, c.fillA, fixed(0.5 * s.j * w(s) ** 2, 2)]],
  max: 8,
  controls: [
    { title: 'Newton\'s cradle (balls of mass 1)' },
    { key: 'k', label: 'Balls lifted k', min: 1, max: 4, step: 1 },
    { key: 'j', label: 'Balls that fly out j', min: 1, max: 4, step: 1 },
    { readout: [
      ['Speed needed for momentum', (s) => fixed(w(s), 2)],
      ['Momentum kept', (s) => ({ text: 'yes', good: true })],
      ['Energy kept', (s) => ({ text: s.j === s.k ? 'yes' : 'no', good: s.j === s.k })],
    ] },
  ],
  tex: (s) => `kv=jw,\\ k v^2=jw^2\\ \\Rightarrow\\ w=v,\\ j=k`,
});
