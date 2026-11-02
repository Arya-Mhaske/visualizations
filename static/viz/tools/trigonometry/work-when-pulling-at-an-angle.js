import { createTool } from '../../lib/tool.js';
import { label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { angleArc, arrowW, eqFrame, rad, segW } from './_kit.js';

const state = { F: 60, th: 35, d: 8 };
const along = () => state.F * Math.cos(rad(state.th));
const across = () => state.F * Math.sin(rad(state.th));

createTool({
  state,
  label: 'A sled on the ground being pulled to the right by a rope at an angle. The pull force F is split into a green part along the ground and a blue part straight up. Only the green part moves the sled along, so only it does work over the distance d.',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-1.5, 15.5], [-1.8, 5.4], 8);
    const sled = (x, fill, dash) => poly(ctx, [f.px([x - 0.8, 0]), f.px([x + 0.8, 0]), f.px([x + 0.8, 0.8]), f.px([x - 0.8, 0.8])], { fill, stroke: c.ink, width: 3, dash });
    segW(ctx, f, [-1.5, 0], [15.5, 0], { color: c.ink, width: 4 });
    sled(0.8, null, [5, 4]);
    sled(0.8 + state.d, c.fillY, []);
    const k = 4 / 100; // units per newton
    const at = [0.8 + state.d, 0.4];
    const tip = [at[0] + across() * 0 + along() * k, at[1] + across() * k];
    arrowW(ctx, f, at, [at[0] + along() * k, at[1]], { color: c.c, width: 7, head: 12 });
    arrowW(ctx, f, [at[0] + along() * k, at[1]], tip, { color: c.b, width: 4, head: 10 });
    arrowW(ctx, f, at, tip, { color: c.a, width: 5, head: 12 });
    angleArc(ctx, f.px(at), f.px([at[0] + 1, at[1]]), f.px(tip), 28, { color: c.ink, width: 3 });
    arrowW(ctx, f, [0.8, -0.7], [0.8 + state.d, -0.7], { color: c.d, width: 4, head: 11 });
    label(ctx, `d = ${fixed(state.d, 1)} m`, f.px([0.8 + state.d / 2, -1.2])[0], f.px([0, -1.2])[1], c, { size: 11, color: c.d, bounds: stage, patch: false });
    label(ctx, `F cos θ = ${fixed(along(), 1)} N`, f.px([at[0] + along() * k / 2, 0])[0], f.px([0, 1.55 - 1.1])[1] + 22, c, { size: 10, color: c.c, bounds: stage, patch: false });
    label(ctx, 'F', f.px(tip)[0] + 10, f.px(tip)[1], c, { size: 13, color: c.a, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Pull the sled' },
    { key: 'F', label: 'Pull, F', min: 10, max: 100, step: 5, format: (n) => `${n} N` },
    { key: 'th', label: 'Rope angle, θ', min: 0, max: 90, step: 1, format: (n) => `${n}°` },
    { key: 'd', label: 'Distance, d', min: 1, max: 10, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    { readout: [
      ['Part along the ground', () => `${fixed(along(), 1)} N`],
      ['Part going up', () => `${fixed(across(), 1)} N`],
      ['Work, F · d', () => `${fixed(along() * state.d, 1)} J`],
      ['Work if pulled flat', () => `${fixed(state.F * state.d, 1)} J`],
    ] },
  ],
  tex: () => `W=\\vec F\\cdot\\vec d=Fd\\cos\\theta=(${state.F})(${fixed(state.d, 1)})\\cos ${state.th}^\\circ=${fixed(along() * state.d, 1)}\\ \\text{J}`,
});
