import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { box, vec } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { frame: 'ground', vA: 20, vB: -10, t: 3 };
const pos = (s) => {
  const [xa, xb] = [s.vA * s.t, 100 + s.vB * s.t];
  return s.frame === 'ground' ? [xa, xb] : [0, xb - xa];
};

createTool({
  state,
  label: 'Two trains on a straight line seen either from the ground or from train A, with arrows for their velocities in the chosen view.',
  draw(ctx, stage, c) {
    const [xa, xb] = pos(state);
    const centre = state.frame === 'ground' ? 60 : 0;
    const px = (x) => stage.w / 2 + ((x - centre) / 500) * stage.w * 0.9;
    const y = stage.h * 0.55;
    line(ctx, 8, y + 20, stage.w - 8, y + 20, { color: c.ink, width: 3 });
    const [va, vb] = state.frame === 'ground' ? [state.vA, state.vB] : [0, state.vB - state.vA];
    [['A', xa, va, c.a], ['B', xb, vb, c.b]].forEach(([n, x, v, col]) => {
      box(ctx, c, px(x) - 22, y - 20, 44, 40, col, n);
      if (v) vec(ctx, c, px(x), y - 36, Math.max(-90, Math.min(90, v * 3)), 0, { color: col, text: `${v}` });
    });
    label(ctx, state.frame === 'ground' ? 'view from the ground' : 'view from train A', stage.w / 2, 20, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Two trains' },
    { key: 'frame', label: 'View from', options: [['ground', 'Ground'], ['A', 'Train A']] },
    { key: 'vA', label: 'Velocity of A (m/s)', min: -30, max: 30, step: 5 },
    { key: 'vB', label: 'Velocity of B (m/s)', min: -30, max: 30, step: 5 },
    { key: 't', label: 'Time (s)', min: 0, max: 10, step: 0.5 },
    { readout: [
      ['Gap B − A', (s) => `${fixed(pos(s)[1] - pos(s)[0], 1)} m`],
      ['v_BA = v_B − v_A', (s) => `${s.vB - s.vA} m/s`],
    ] },
  ],
  tex: (s) => `v_{BA}=v_B-v_A=${s.vB}-(${s.vA})=${s.vB - s.vA}\\ \\mathrm{m/s}`,
});
