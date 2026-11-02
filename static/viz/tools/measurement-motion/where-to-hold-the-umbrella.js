import { createTool } from '../../lib/tool.js';
import { vec } from '../../lib/quick.js';
import { line, dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { rain: 35, me: 12 };
const tilt = (s) => (Math.atan2(s.me, s.rain) * 180) / Math.PI;

createTool({
  state,
  label: 'A cyclist with an umbrella tilted forward. Beside it, a triangle of velocities: the rain falling, the backward velocity from cycling, and the rain as the cyclist sees it.',
  draw(ctx, stage, c) {
    const k = (stage.h * 0.5) / 40;
    const [ox, oy] = [stage.w * 0.62, stage.h * 0.14];
    vec(ctx, c, ox, oy, 0, state.rain * k, { color: c.b, text: 'rain' });
    vec(ctx, c, ox, oy + state.rain * k, -state.me * k, 0, { color: c.a, text: '−v' });
    vec(ctx, c, ox, oy, -state.me * k, state.rain * k, { color: c.c, width: 4 });
    const t = (tilt(state) * Math.PI) / 180;
    const [px, py] = [stage.w * 0.2, stage.h * 0.82];
    line(ctx, px, py, px, py - 60, { color: c.ink, width: 4 });
    dot(ctx, px, py - 70, 9, c.fillA, c.ink);
    line(ctx, px, py - 60, px + Math.sin(t) * 70, py - 60 - Math.cos(t) * 70, { color: c.a, width: 5 });
    label(ctx, `tilt ${fixed(tilt(state), 1)}°`, stage.w * 0.2, 30, c, { size: 14, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Rain and bicycle' },
    { key: 'rain', label: 'Rain speed (m/s)', min: 5, max: 40, step: 1 },
    { key: 'me', label: 'Cycling speed (m/s)', min: 0, max: 30, step: 1 },
    { readout: [
      ['Rain relative to you', (s) => `${fixed(Math.hypot(s.rain, s.me), 1)} m/s`],
      ['Tilt from vertical', (s) => `${fixed(tilt(s), 1)}°`],
    ] },
  ],
  tex: (s) => `\\tan\\theta=\\dfrac{${s.me}}{${s.rain}}\\ \\Rightarrow\\ \\theta=${fixed(tilt(s), 1)}^\\circ`,
});
