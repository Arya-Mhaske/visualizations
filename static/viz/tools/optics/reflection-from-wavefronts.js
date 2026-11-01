import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { radius, reflectAngle } from './_huygens-wavefronts-math.js';
import { deg, front, rad } from './_huygens-wavefronts-view.js';

const V = 1;
const HALF = 5;
const state = { i: 35, t: 4 };

const tool = createTool({
  state,
  label: 'A mirror along a horizontal line. Blue wavefronts come down and to the right. Coral half-circle wavelets grow upward from each point on the mirror once the wavefront has touched it, the earliest the biggest. A green line touching all the wavelets is the reflected wavefront, tilted the same angle away from the normal as the incoming one.',
  draw(ctx, stage, c) {
    const k = (stage.w - 20) / (2 * HALF);
    const ox = stage.w / 2;
    const oy = stage.h * 0.62;
    const to = (x, y) => [ox + x * k, oy - y * k];
    const i = rad(state.i);
    const lam = 3;
    ctx.fillStyle = c.fillY;
    ctx.fillRect(0, oy, stage.w, stage.h - oy);
    line(ctx, 0, oy, stage.w, oy, { color: c.ink, width: 4 });
    label(ctx, 'mirror', 8, oy + 14, c, { size: 10, align: 'left', patch: false });
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, stage.w, oy);
    ctx.clip();
    const d1 = [Math.sin(i), -Math.cos(i)];
    const dr = [Math.sin(i), Math.cos(i)];
    for (let m = 0; m < 4; m++) {
      const s = V * state.t - m * lam - HALF * Math.sin(i);
      front(ctx, to, d1, s, c.b, m === 0 ? 4 : 2);
      front(ctx, to, dr, s, c.c, m === 0 ? 4 : 2);
    }
    for (let j = 0; j <= 10; j++) {
      const x = -HALF + j;
      const rr = radius(x + HALF, state.t, i, V, V);
      if (rr <= 0) continue;
      const [px, py] = to(x, 0);
      ctx.strokeStyle = c.a;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, rr * k, Math.PI, Math.PI * 2);
      ctx.stroke();
      dot(ctx, px, py, 4, c.a, c.ink, 2);
    }
    ctx.restore();
  },
  controls: () => [
    { title: 'Bounce a wavefront' },
    { key: 't', label: 'Time', min: 0, max: 10, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'i', label: 'Angle of incidence, i', min: 5, max: 80, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Angle of reflection, r', (s) => `${fixed(deg(reflectAngle(rad(s.i))), 1)}°`],
      ['i − r', (s) => `${fixed(s.i - deg(reflectAngle(rad(s.i))), 1)}°`],
    ] },
  ],
  tex: (s) => `\sin r=\dfrac{v_1}{v_1}\sin i\ \Rightarrow\ r=${fixed(deg(reflectAngle(rad(s.i))), 1)}^\circ=i`,
});

tool.update();
