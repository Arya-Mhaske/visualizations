import { createTool } from '../../lib/tool.js';
import { line, poly, label } from '../../lib/draw.js';
import { box } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { m1: 2, x1: 1, m2: 5, x2: 8 };
const cm = (s) => (s.m1 * s.x1 + s.m2 * s.x2) / (s.m1 + s.m2);

createTool({
  state,
  label: 'A beam marked in metres with two masses on it and a triangular pivot under the centre of mass, where the beam balances. The pivot is nearer the heavier mass.',
  draw(ctx, stage, c) {
    const [x0, w, y] = [24, stage.w - 48, stage.h * 0.5];
    const X = (v) => x0 + (v / 10) * w;
    line(ctx, x0, y, x0 + w, y, { color: c.ink, width: 6 });
    for (let v = 0; v <= 10; v += 2) label(ctx, String(v), X(v), y + 40, c, { size: 11, patch: false });
    [[state.m1, state.x1, c.fillA], [state.m2, state.x2, c.fillB]].forEach(([m, x, f]) => {
      const s = 14 + m * 4;
      box(ctx, c, X(x) - s / 2, y - s - 3, s, s, f, `${m}`);
    });
    poly(ctx, [[X(cm(state)) - 14, y + 30], [X(cm(state)) + 14, y + 30], [X(cm(state)), y + 4]], { fill: c.c, stroke: c.ink });
    label(ctx, `balance at ${fixed(cm(state), 2)} m`, stage.w / 2, 24, c, { size: 14, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Two masses on a beam' },
    { key: 'm1', label: 'Mass 1 (kg)', min: 1, max: 10, step: 1 },
    { key: 'x1', label: 'Position 1 (m)', min: 0, max: 10, step: 0.5 },
    { key: 'm2', label: 'Mass 2 (kg)', min: 1, max: 10, step: 1 },
    { key: 'x2', label: 'Position 2 (m)', min: 0, max: 10, step: 0.5 },
    { readout: [
      ['Centre of mass', (s) => `${fixed(cm(s), 3)} m`],
      ['Torques about it', (s) => `${fixed(s.m1 * (cm(s) - s.x1), 2)} and ${fixed(s.m2 * (s.x2 - cm(s)), 2)}`],
    ] },
  ],
  tex: (s) => `x_c=\\dfrac{${s.m1}\\times${s.x1}+${s.m2}\\times${s.x2}}{${s.m1}+${s.m2}}=${fixed(cm(s), 3)}`,
});
