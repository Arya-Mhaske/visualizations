import { createTool } from '../../lib/tool.js';
import { line, poly, label } from '../../lib/draw.js';
import { vec, G } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { M: 10, m: 6, x: 0.8, a: 0.1, b: 0.9 };
const L = 1;
const R2 = (s) => (s.M * G * (0.5 - s.a) + s.m * G * (s.x - s.a)) / (s.b - s.a);
const R1 = (s) => (s.M + s.m) * G - R2(s);

createTool({
  state,
  label: 'A one-metre beam on two supports with a hanging load. Arrows show the support forces upwards and the weights downwards.',
  draw(ctx, stage, c) {
    const [x0, w, y] = [24, stage.w - 48, stage.h * 0.45];
    const X = (v) => x0 + v * w;
    line(ctx, X(0), y, X(L), y, { color: c.ink, width: 8 });
    [state.a, state.b].forEach((v) => poly(ctx, [[X(v) - 10, y + 30], [X(v) + 10, y + 30], [X(v), y + 4]], { fill: c.fillC, stroke: c.ink }));
    vec(ctx, c, X(state.a), y + 32, 0, -R1(state) * 0.2 + 0, { color: c.c, text: `${fixed(R1(state), 0)} N` });
    vec(ctx, c, X(state.b), y + 32, 0, -R2(state) * 0.2, { color: c.c, text: `${fixed(R2(state), 0)} N` });
    vec(ctx, c, X(0.5), y - 4, 0, state.M * G * 0.2, { color: c.a, text: 'beam' });
    vec(ctx, c, X(state.x), y - 4, 0, state.m * G * 0.2, { color: c.b, text: 'load' });
    label(ctx, 'positions in metres from the left end', stage.w / 2, stage.h - 10, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Beam and load' },
    { key: 'M', label: 'Beam mass (kg)', min: 2, max: 20, step: 1 },
    { key: 'm', label: 'Load mass (kg)', min: 0, max: 15, step: 1 },
    { key: 'x', label: 'Load position (m)', min: 0, max: 1, step: 0.05 },
    { key: 'a', label: 'Left support (m)', min: 0, max: 0.4, step: 0.05 },
    { key: 'b', label: 'Right support (m)', min: 0.6, max: 1, step: 0.05 },
    { readout: [
      ['Reaction at left', (s) => `${fixed(R1(s), 1)} N`],
      ['Reaction at right', (s) => `${fixed(R2(s), 1)} N`],
      ['Sum = total weight', (s) => `${fixed(R1(s) + R2(s), 1)} N`],
    ] },
  ],
  tex: (s) => `R_1+R_2=(M+m)g,\\quad R_2=${fixed(R2(s), 1)}\\ \\mathrm{N}`,
});
