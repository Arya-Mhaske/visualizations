import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { rad } from './_la-math.js';
import { plane, vec } from './_la-view.js';

// v lies along the x axis, length 3, so v · w = 3 × (the x part of w). Turn w and that x part is |w| cos θ: the shadow of w on v.
const state = { len: 2.5, theta: 50 };
const V = [3, 0];
const W = (s) => [s.len * Math.cos(rad(s.theta)), s.len * Math.sin(rad(s.theta))];
const dotVW = (s) => V[0] * W(s)[0] + V[1] * W(s)[1];

createTool({
  state,
  label: 'A fixed vector v along the x axis and a vector w that you turn round it. The shadow of w on the line of v is marked. The dot product is the length of v times the signed length of the shadow, which is the length of w times cosine of the angle.',
  setup: (stage, c) => plane(stage, c, 4),
  draw(ctx, stage, c, plot) {
    const w = W(state);
    plot.axes({ grid: false });
    plot.segment(w[0], w[1], w[0], 0, { color: c.grid, width: 2, dash: [5, 4] });
    plot.segment(0, 0, w[0], 0, { color: c.c, width: 9 });
    vec(ctx, plot, c, [0, 0], V, { color: c.a, width: 5, text: 'v' });
    vec(ctx, plot, c, [0, 0], w, { color: c.b, width: 5, text: 'w' });
    plot.text('shadow', w[0] / 2, w[0] >= 0 ? -0.5 : 0.5, { size: 11, color: c.c, patch: false });
  },
  controls: [
    { title: 'Turn w round v' },
    { key: 'theta', label: 'Angle θ from v to w', min: 0, max: 360, step: 5, format: (n) => `${n}°` },
    { key: 'len', label: 'Length of w', min: 0.5, max: 3.5, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['v · w from the parts', (s) => fixed(dotVW(s), 3)],
      ['Shadow of w on v', (s) => fixed(W(s)[0], 3)],
      ['|v||w| cos θ', (s) => ({ text: fixed(3 * s.len * Math.cos(rad(s.theta)), 3), good: true })],
    ] },
  ],
  tex: (s) => `\\mathbf v\\cdot\\mathbf w=|\\mathbf v||\\mathbf w|\\cos\\theta=3\\times${fixed(s.len, 1)}\\times${fixed(Math.cos(rad(s.theta)), 3)}=${fixed(dotVW(s), 3)}`,
});
