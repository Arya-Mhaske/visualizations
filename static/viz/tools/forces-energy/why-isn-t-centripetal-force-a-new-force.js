import { createTool } from '../../lib/tool.js';
import { vec } from '../../lib/quick.js';
import { dot, label } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';

const SC = { stone: ['Stone on a string', 'tension'], car: ['Car on a level bend', 'friction from the road'], planet: ['Planet round the Sun', 'gravity'] };
const state = { sc: 'stone', m: 1, v: 5, R: 2 };
const need = (s) => (s.m * s.v * s.v) / s.R;

createTool({
  state,
  label: 'A body going round a circle with an arrow pointing to the centre, labelled with the real force that supplies it in the chosen scene.',
  draw(ctx, stage, c) {
    const [cx, cy, R] = [stage.w / 2, stage.h * 0.5, Math.min(stage.w, stage.h) * 0.3];
    ctx.save();
    ctx.strokeStyle = c.ink;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    dot(ctx, cx + R, cy, 10, c.a, c.ink);
    dot(ctx, cx, cy, 4, c.ink, c.ink);
    vec(ctx, c, cx + R, cy, -Math.min(R * 0.8, need(state) * 0.5), 0, { color: c.c, width: 4, text: SC[state.sc][1] });
    label(ctx, SC[state.sc][0], stage.w / 2, 20, c, { size: 13, patch: false });
  },
  controls: [
    { title: 'Pick a case' },
    { key: 'sc', label: 'Scene', options: Object.entries(SC).map(([k, v]) => [k, v[0]]) },
    { key: 'm', label: 'Mass (kg)', min: 0.5, max: 5, step: 0.5 },
    { key: 'v', label: 'Speed (m/s)', min: 1, max: 15, step: 1 },
    { key: 'R', label: 'Radius (m)', min: 1, max: 10, step: 0.5 },
    { readout: [
      ['Needed mv²/R', (s) => `${sig(need(s), 3)} N`],
      ['Supplied by', (s) => SC[s.sc][1]],
    ] },
  ],
  tex: (s) => `F_{\\text{real}}=\\dfrac{mv^2}{R}=${sig(need(s), 3)}\\ \\mathrm{N}`,
});
