import { createTool } from '../../lib/tool.js';
import { line, poly, label } from '../../lib/draw.js';
import { vec } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { W: 400, la: 0.5, lb: 2 };
const E = (s) => (s.W * s.la) / s.lb;

createTool({
  state,
  label: 'A lever with a load close to the pivot and an effort far from it. The arrows are scaled to the forces, so the effort arrow is much smaller than the load arrow.',
  draw(ctx, stage, c) {
    const [px, y] = [stage.w * 0.3, stage.h * 0.6];
    const k = stage.w * 0.55 / 3;
    line(ctx, px - state.la * k, y, px + state.lb * k, y, { color: c.ink, width: 7 });
    poly(ctx, [[px - 16, y + 38], [px + 16, y + 38], [px, y + 4]], { fill: c.fillC, stroke: c.ink });
    vec(ctx, c, px - state.la * k, y - 4, 0, state.W * 0.12, { color: c.a, text: 'load' });
    vec(ctx, c, px + state.lb * k, y - 4, 0, E(state) * 0.12, { color: c.b, text: 'effort' });
    label(ctx, `load arm ${state.la} m, effort arm ${state.lb} m`, stage.w / 2, 20, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Balance a load' },
    { key: 'W', label: 'Load (N)', min: 100, max: 800, step: 50 },
    { key: 'la', label: 'Load arm (m)', min: 0.25, max: 1.5, step: 0.25 },
    { key: 'lb', label: 'Effort arm (m)', min: 0.5, max: 3, step: 0.25 },
    { readout: [
      ['Effort needed', (s) => `${fixed(E(s), 1)} N`],
      ['Force saved', (s) => `×${fixed(s.W / E(s), 2)}`],
      ['Effort end moves', (s) => `${fixed(s.lb / s.la, 2)} × as far`],
    ] },
  ],
  tex: (s) => `W\\,l_a=E\\,l_b\\ \\Rightarrow\\ E=${fixed(E(s), 1)}\\ \\mathrm{N}`,
});
