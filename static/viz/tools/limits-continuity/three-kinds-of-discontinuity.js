import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

// Break at a = 1. Removable: (x² − 1)/(x − 1) = x + 1 with a hole. Jump: step of size s. Infinite: s/(x − 1).
const A = 1;
const state = { kind: 'removable', s: 1 };
const KINDS = {
  removable: { name: 'Removable', f: (x) => x + 1, left: () => 2, right: () => 2, fa: null, fix: true },
  jump: { name: 'Jump', f: (x, s) => (x < A ? 1 : 1 + s), left: () => 1, right: (s) => 1 + s, fa: 1 + 0, fix: false },
  infinite: { name: 'Infinite', f: (x, s) => s / (x - A), left: () => -Infinity, right: () => Infinity, fa: null, fix: false },
};
const txt = (v) => (v === -Infinity ? '−∞' : v === Infinity ? '∞' : v.toFixed(2));

createTool({
  state,
  label: 'The graph of a function with a break at x equals 1, in one of three kinds. A removable break is a single hole, where the two sides meet at the same height. A jump has two sides at different heights. An infinite break has the graph shooting off to plus or minus infinity.',
  setup: (stage, c) => createPlot(stage, { c, x: [-1, 3], y: [-3, 5] }),
  draw(ctx, stage, c, plot) {
    const k = KINDS[state.kind];
    plot.axes({ xLabel: 'x', yLabel: 'f(x)' });
    plot.segment(A, -3, A, 5, { color: c.grid, width: 1.5, dash: [4, 4] });
    plot.fn((x) => k.f(x, state.s), { color: c.a, domain: [-1, A - 0.0001] });
    plot.fn((x) => k.f(x, state.s), { color: c.a, domain: [A + 0.0001, 3] });
    if (state.kind === 'removable') plot.point(A, 2, { fill: c.paper });
    if (state.kind === 'jump') { plot.point(A, 1, { fill: c.a }); plot.point(A, 1 + state.s, { fill: c.paper }); }
  },
  controls: [
    { title: 'Pick a break' },
    { key: 'kind', label: 'Kind', options: Object.entries(KINDS).map(([k, v]) => [k, v.name]) },
    { key: 's', label: 'Size (jump or steepness)', min: 0.5, max: 2, step: 0.5, format: (v) => v.toFixed(1) },
    { readout: [
      ['Left limit', (s) => txt(KINDS[s.kind].left(s.s))],
      ['Right limit', (s) => txt(KINDS[s.kind].right(s.s))],
      ['Can it be repaired?', (s) => (KINDS[s.kind].fix ? { text: 'yes: define f(1) = 2', good: true } : { text: 'no', good: false })],
    ] },
  ],
  tex: (s) => (s.kind === 'removable'
    ? '\\lim_{x\\to1}\\dfrac{x^{2}-1}{x-1}=\\lim_{x\\to1}(x+1)=2'
    : s.kind === 'jump' ? `\\lim_{x\\to1^-}f=1,\\quad \\lim_{x\\to1^+}f=${(1 + s.s).toFixed(1)}` : '\\lim_{x\\to1^{\\pm}}\\dfrac{s}{x-1}=\\pm\\infty'),
});
