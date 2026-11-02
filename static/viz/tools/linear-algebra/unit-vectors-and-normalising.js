import { createTool } from '../../lib/tool.js';
import { arc, dot, TAU } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { plane, vec } from './_la-view.js';

const state = { x: 3, y: 4 };
const len = (s) => Math.hypot(s.x, s.y);
const unit = (s) => (len(s) < 1e-9 ? [0, 0] : [s.x / len(s), s.y / len(s)]);

createTool({
  state,
  label: 'A vector v and the unit circle. Dividing v by its length shrinks or stretches it along its own line until its tip lands on the unit circle. The result keeps the direction of v and has length one.',
  setup: (stage, c) => plane(stage, c, 5),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const [cx, cy] = plot.toPx(0, 0);
    arc(ctx, cx, cy, plot.toPx(1, 0)[0] - cx, 0, TAU, { color: c.ink, width: 3 });
    vec(ctx, plot, c, [0, 0], [state.x, state.y], { color: c.a, width: 4, text: 'v' });
    vec(ctx, plot, c, [0, 0], unit(state), { color: c.c, width: 7, text: 'v/|v|', dx: 14, dy: 14 });
    dot(ctx, ...plot.toPx(...unit(state)), 6, c.fillY, c.ink, 2);
  },
  controls: [
    { title: 'Normalise a vector' },
    { key: 'x', label: 'x-part of v', min: -5, max: 5, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'y', label: 'y-part of v', min: -5, max: 5, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Length |v|', (s) => fixed(len(s), 3)],
      ['v ÷ |v|', (s) => `(${fixed(unit(s)[0], 3)}, ${fixed(unit(s)[1], 3)})`],
      ['Length of v ÷ |v|', (s) => ({ text: len(s) < 1e-9 ? 'undefined for the zero vector' : fixed(Math.hypot(...unit(s)), 3), good: len(s) >= 1e-9 })],
    ] },
  ],
  tex: (s) => (len(s) < 1e-9 ? '\\mathbf v=\\mathbf 0\\ \\text{has no direction to keep}' : `\\dfrac{\\mathbf v}{|\\mathbf v|}=\\dfrac{(${fixed(s.x, 1)},\\,${fixed(s.y, 1)})}{${fixed(len(s), 3)}}=(${fixed(unit(s)[0], 3)},\\,${fixed(unit(s)[1], 3)})`),
});
