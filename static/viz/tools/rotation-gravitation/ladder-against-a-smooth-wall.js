import { createTool } from '../../lib/tool.js';
import { line } from '../../lib/draw.js';
import { vec, G } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { x: 1, m: 20 };
const L = 3;
const h = (s) => Math.sqrt(L * L - s.x * s.x);
const Fw = (s) => (s.m * G * s.x) / (2 * h(s));

createTool({
  state,
  label: 'A ladder leaning on a smooth vertical wall, with arrows for its weight, the push of the wall, and at the foot the floor reaction and friction.',
  draw(ctx, stage, c) {
    const k = Math.min(stage.w, stage.h) * 0.2;
    const [wx, fy] = [stage.w * 0.82, stage.h * 0.82];
    const [footX, topY] = [wx - state.x * k, fy - h(state) * k];
    line(ctx, wx, fy, wx, 10, { color: c.ink, width: 5 });
    line(ctx, 10, fy, wx, fy, { color: c.ink, width: 4 });
    line(ctx, footX, fy, wx, topY, { color: c.a, width: 7 });
    vec(ctx, c, (footX + wx) / 2, (fy + topY) / 2, 0, state.m * G * 0.15, { color: c.b, text: 'W' });
    vec(ctx, c, wx, topY, -Fw(state) * 0.6, 0, { color: c.c, text: 'wall' });
    vec(ctx, c, footX, fy, 0, -state.m * G * 0.15, { color: c.c, text: 'N' });
    vec(ctx, c, footX, fy, Fw(state) * 0.6, 0, { color: c.d, text: 'f' });
  },
  controls: [
    { title: 'The ladder (3 m long)' },
    { key: 'x', label: 'Foot distance from the wall (m)', min: 0.5, max: 2.5, step: 0.1 },
    { key: 'm', label: 'Mass of ladder (kg)', min: 10, max: 40, step: 5 },
    { readout: [
      ['Height reached', (s) => `${fixed(h(s), 2)} m`],
      ['Wall force', (s) => `${fixed(Fw(s), 1)} N`],
      ['Floor normal N = mg', (s) => `${fixed(s.m * G, 0)} N`],
      ['Friction f = wall force', (s) => `${fixed(Fw(s), 1)} N`],
      ['Smallest μ needed', (s) => fixed(Fw(s) / (s.m * G), 3)],
    ] },
  ],
  tex: (s) => `F_w=\\dfrac{mg\\,x}{2h}=\\dfrac{${s.m}\\times9.8\\times${s.x}}{2\\times${fixed(h(s), 2)}}=${fixed(Fw(s), 1)}\\ \\mathrm{N}`,
});
