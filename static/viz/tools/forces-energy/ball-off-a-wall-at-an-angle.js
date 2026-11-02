import { createTool } from '../../lib/tool.js';
import { vec } from '../../lib/quick.js';
import { line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { th: 40, v: 10, e: 1 };
const rad = (d) => (d * Math.PI) / 180;
const vn = (s) => s.v * Math.cos(rad(s.th));
const vp = (s) => s.v * Math.sin(rad(s.th));

createTool({
  state,
  label: 'A vertical wall with a ball arriving at an angle and leaving at the mirror angle. An arrow shows the force on the wall, which is perpendicular to it.',
  draw(ctx, stage, c) {
    const [wx, wy] = [stage.w * 0.6, stage.h * 0.55];
    line(ctx, wx, 20, wx, stage.h - 20, { color: c.ink, width: 6 });
    const k = 6;
    vec(ctx, c, wx - vn(state) * k, wy + vp(state) * k, vn(state) * k, -vp(state) * k, { color: c.a, text: 'in' });
    vec(ctx, c, wx, wy, -state.e * vn(state) * k, -vp(state) * k, { color: c.b, text: 'out' });
    vec(ctx, c, wx + 10, wy, 55, 0, { color: c.c, text: 'force on wall' });
    label(ctx, 'sideways speed along the wall stays the same', stage.w / 2, 20, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'The bounce' },
    { key: 'th', label: 'Angle from the wall normal (°)', min: 0, max: 80, step: 5 },
    { key: 'v', label: 'Speed (m/s)', min: 2, max: 20, step: 1 },
    { key: 'e', label: 'Bounce quality e', min: 0.5, max: 1, step: 0.05 },
    { readout: [
      ['Normal velocity', (s) => `${fixed(vn(s), 2)} → ${fixed(-s.e * vn(s), 2)}`],
      ['Parallel velocity', (s) => `${fixed(vp(s), 2)} → ${fixed(vp(s), 2)} (same)`],
      ['Impulse per kg (normal)', (s) => fixed((1 + s.e) * vn(s), 2)],
    ] },
  ],
  tex: (s) => `\\Delta v_{\\parallel}=0,\\quad \\Delta v_{\\perp}=-(1+e)v\\cos\\theta=${fixed(-(1 + s.e) * vn(s), 2)}`,
});
