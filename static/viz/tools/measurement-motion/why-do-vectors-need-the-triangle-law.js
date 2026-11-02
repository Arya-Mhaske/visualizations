import { createTool } from '../../lib/tool.js';
import { vec } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { A: 3, B: 4, th: 90 };
const R = (s) => Math.sqrt(s.A ** 2 + s.B ** 2 + 2 * s.A * s.B * Math.cos((s.th * Math.PI) / 180));

createTool({
  state,
  label: 'Vector A drawn along the horizontal, vector B drawn from its tip at the chosen angle, and the resultant R drawn from the start to the end.',
  draw(ctx, stage, c) {
    const k = (stage.w * 0.78) / 7;
    const [x0, y0] = [stage.w * 0.1, stage.h * 0.65];
    const t = (state.th * Math.PI) / 180;
    const [ax, bx, by] = [state.A * k, state.B * k * Math.cos(t), -state.B * k * Math.sin(t)];
    vec(ctx, c, x0, y0, ax, 0, { color: c.a, text: 'A' });
    vec(ctx, c, x0 + ax, y0, bx, by, { color: c.b, text: 'B' });
    vec(ctx, c, x0, y0, ax + bx, by, { color: c.c, text: 'R', width: 4 });
    label(ctx, `R = ${fixed(R(state), 2)} m`, stage.w / 2, 24, c, { size: 15, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Two walks' },
    { key: 'A', label: 'First walk A (m)', min: 1, max: 5, step: 1 },
    { key: 'B', label: 'Second walk B (m)', min: 1, max: 5, step: 1 },
    { key: 'th', label: 'Angle between A and B (°)', min: 0, max: 180, step: 5 },
    { readout: [
      ['Resultant R', (s) => `${fixed(R(s), 2)} m`],
      ['Largest possible', (s) => `${s.A + s.B} m`],
      ['Smallest possible', (s) => `${Math.abs(s.A - s.B)} m`],
    ] },
  ],
  tex: (s) => `R=\\sqrt{${s.A}^2+${s.B}^2+2(${s.A})(${s.B})\\cos${s.th}^\\circ}=${fixed(R(s), 2)}\\ \\mathrm{m}`,
});
