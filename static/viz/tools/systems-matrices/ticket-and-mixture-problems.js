import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { classify2 } from './_sm-math.js';

// Both stories have the same two equations:  x + y = N  and  A x + B y = total.
const STORIES = {
  tickets: { name: 'Tickets', x: 'adult tickets', y: 'child tickets', n: 'tickets sold', a: 'adult price (₹)', b: 'child price (₹)', total: (s) => s.A * s.x + s.B * (s.N - s.x), unit: '₹' },
  mixture: { name: 'Mixture', x: 'litres of strong acid', y: 'litres of weak acid', n: 'litres in the mix', a: 'strong: % acid', b: 'weak: % acid', total: (s) => s.A * s.x + s.B * (s.N - s.x), unit: '% litres' },
};
const state = { story: 'tickets', N: 100, x: 60, A: 150, B: 80 };
const lines = (s) => [[1, 1, s.N], [s.A, s.B, STORIES[s.story].total(s)]];
const sol = (s) => classify2(...lines(s).flat());

createTool({
  state,
  label: 'A word problem turned into two equations and drawn as two lines. The first line says how many items there are in total. The second line says what they add up to in money or in strength. The point where the lines cross gives the two unknown amounts.',
  setup: (stage, c) => createPlot(stage, { x: [0, 200], y: [0, 200], c, pad: 26 }),
  draw(ctx, stage, c, plot) {
    const [l1, l2] = lines(state);
    const r = sol(state);
    plot.setRange([0, state.N * 1.5], [0, state.N * 1.5]);
    plot.axes({ xLabel: STORIES[state.story].x.split(' ')[0], yLabel: STORIES[state.story].y.split(' ')[0] });
    plot.fn((x) => (l1[2] - l1[0] * x) / l1[1], { color: c.a, width: 4, domain: [0, state.N * 1.5] });
    plot.fn((x) => (l2[2] - l2[0] * x) / l2[1], { color: c.b, width: 4, domain: [0, state.N * 1.5] });
    if (r.kind === 'one') plot.point(r.x, r.y, { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Write the story as equations' },
    { key: 'story', label: 'Story', options: Object.entries(STORIES).map(([key, v]) => [key, v.name]) },
    { key: 'N', label: 'Total amount N', min: 20, max: 200, step: 10, format: (n) => `${n}` },
    { key: 'x', label: 'How much is of the first kind', min: 0, max: 200, step: 5, format: (n) => `${n}` },
    { key: 'A', label: 'Rate of the first kind', min: 10, max: 200, step: 10, format: (n) => `${n}` },
    { key: 'B', label: 'Rate of the second kind', min: 10, max: 200, step: 10, format: (n) => `${n}` },
    { readout: [
      ['Total from the story', (s) => `${fixed(STORIES[s.story].total({ ...s, x: Math.min(s.x, s.N) }), 0)} ${STORIES[s.story].unit}`],
      ['Solved: first kind, second kind', (s) => { const r = sol({ ...s, x: Math.min(s.x, s.N) }); return r.kind === 'one' ? `${fixed(r.x, 2)}, ${fixed(r.y, 2)}` : 'rates are equal: no unique answer'; }],
    ] },
  ],
  tex: (s) => `\\begin{cases}x+y=${s.N}\\\\ ${s.A}x+${s.B}y=${fixed(STORIES[s.story].total({ ...s, x: Math.min(s.x, s.N) }), 0)}\\end{cases}`,
});
