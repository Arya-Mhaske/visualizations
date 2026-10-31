import { createTool } from '../../lib/tool.js';
import { drawTree } from '../../lib/discrete.js';
import { fixed } from '../../lib/format.js';

const state = { a: 0.6, bGivenA: 0.3, bGivenNotA: 0.7, path: 'AB' };
const pct = (v) => fixed(v, 2);
const paths = (s) => ({
  AB: s.a * s.bGivenA,
  'AB′': s.a * (1 - s.bGivenA),
  'A′B': (1 - s.a) * s.bGivenNotA,
  'A′B′': (1 - s.a) * (1 - s.bGivenNotA),
});
const leaf = (name, edge, s, c) => ({
  label: `${name}: ${fixed(paths(s)[name], 3)}`, edge, fill: s.path === name ? c.a : c.paper,
  color: s.path === name ? c.a : c.ink, width: s.path === name ? 4 : 2,
});

createTool({
  state,
  label: 'A two-stage probability tree. Each branch carries a probability and each end shows the product along its path.',
  draw(ctx, stage, c) {
    const s = state;
    const onA = s.path[0] === 'A' && s.path[1] !== '′';
    drawTree(ctx, { x: 4, y: 12, w: stage.w - 8, h: stage.h - 24 }, {
      kids: [
        { edge: pct(s.a), label: 'A', color: onA ? c.a : c.ink, width: onA ? 4 : 2, kids: [leaf('AB', pct(s.bGivenA), s, c), leaf('AB′', pct(1 - s.bGivenA), s, c)] },
        { edge: pct(1 - s.a), label: 'A′', color: onA ? c.ink : c.a, width: onA ? 2 : 4, kids: [leaf('A′B', pct(s.bGivenNotA), s, c), leaf('A′B′', pct(1 - s.bGivenNotA), s, c)] },
      ],
    }, c);
  },
  controls: [
    { title: 'Set the branches' },
    { key: 'a', label: 'P(A)', min: 0, max: 1, step: 0.05, format: pct },
    { key: 'bGivenA', label: 'P(B | A)', min: 0, max: 1, step: 0.05, format: pct },
    { key: 'bGivenNotA', label: 'P(B | A′)', min: 0, max: 1, step: 0.05, format: pct },
    { key: 'path', label: 'Follow a path', options: [['AB', 'AB'], ['AB′', 'AB′'], ['A′B', 'A′B'], ['A′B′', 'A′B′']] },
    { readout: [
      ['This path', (s) => fixed(paths(s)[s.path], 3)],
      ['P(B), add two paths', (s) => fixed(paths(s).AB + paths(s)['A′B'], 3)],
      ['All four ends add to', (s) => fixed(Object.values(paths(s)).reduce((a, b) => a + b), 3)],
    ] },
  ],
  tex: (s) => `P(B) = ${pct(s.a)} \\times ${pct(s.bGivenA)} + ${pct(1 - s.a)} \\times ${pct(s.bGivenNotA)} = ${fixed(paths(s).AB + paths(s)['A′B'], 3)}`,
});
