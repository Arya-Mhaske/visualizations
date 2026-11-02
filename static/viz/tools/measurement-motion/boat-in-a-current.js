import { createTool } from '../../lib/tool.js';
import { vec } from '../../lib/quick.js';
import { line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { head: 90, cur: 10, width: 1 };
const BOAT = 25;
const rad = (d) => (d * Math.PI) / 180;
const vel = (s) => [s.cur + BOAT * Math.cos(rad(s.head)), BOAT * Math.sin(rad(s.head))];

createTool({
  state,
  label: 'A river with the current flowing to the right. A triangle of velocities shows the boat velocity through the water, the current, and the resultant over the ground.',
  draw(ctx, stage, c) {
    const k = stage.w / 90;
    const [ox, oy] = [stage.w * 0.12, stage.h * 0.62];
    const [vx, vy] = vel(state);
    line(ctx, 0, stage.h * 0.1, stage.w, stage.h * 0.1, { color: c.ink, width: 3 });
    vec(ctx, c, ox, oy, BOAT * Math.cos(rad(state.head)) * k, -vy * k, { color: c.a, text: 'boat' });
    vec(ctx, c, ox + BOAT * Math.cos(rad(state.head)) * k, oy - vy * k, state.cur * k, 0, { color: c.b, text: 'current' });
    vec(ctx, c, ox, oy, vx * k, -vy * k, { color: c.c, width: 4, text: 'ground' });
    label(ctx, `speed over ground ${fixed(Math.hypot(vx, vy), 1)} km/h`, stage.w / 2, stage.h * 0.9, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Steer the boat' },
    { key: 'head', label: 'Heading from downstream (°)', min: 20, max: 160, step: 5 },
    { key: 'cur', label: 'Current (km/h)', min: 0, max: 15, step: 1 },
    { key: 'width', label: 'River width (km)', min: 0.5, max: 3, step: 0.5 },
    { readout: [
      ['Velocity over ground', (s) => `${fixed(vel(s)[0], 1)}, ${fixed(vel(s)[1], 1)} km/h`],
      ['Crossing time', (s) => `${fixed((s.width / vel(s)[1]) * 60, 1)} min`],
      ['Drift downstream', (s) => `${fixed((s.width / vel(s)[1]) * vel(s)[0], 2)} km`],
    ] },
  ],
  tex: (s) => `\\vec v_{\\text{ground}}=\\vec v_{\\text{boat}}+\\vec v_{\\text{current}}=(${fixed(vel(s)[0], 1)},\\ ${fixed(vel(s)[1], 1)})`,
});
