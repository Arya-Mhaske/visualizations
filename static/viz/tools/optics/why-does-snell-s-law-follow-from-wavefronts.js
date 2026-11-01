import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { radius, refractAngle } from './_huygens-wavefronts-math.js';
import { deg, front as drawFront, rad } from './_huygens-wavefronts-view.js';

const V1 = 1;
const HALF = 5; // boundary runs from -5 to +5 world units
const state = { i: 40, n: 1.5, t: 4 };
const v2 = (s) => V1 / s.n;
const rAngle = (s) => refractAngle(rad(s.i), V1, v2(s));

const tool = createTool({
  state,
  label: 'Light travelling down and to the right in medium 1 above a horizontal boundary, drawn as parallel blue wavefronts. Below the boundary, small coral half-circle wavelets grow from points along it, smaller the later the wavefront reached that point. A green line touching all the wavelets is the refracted wavefront, tilted closer to the normal.',
  draw(ctx, stage, c) {
    const k = (stage.w - 20) / (2 * HALF);
    const ox = stage.w / 2;
    const oy = stage.h / 2;
    const to = (x, y) => [ox + x * k, oy - y * k];
    const i = rad(state.i);
    const r = rAngle(state);
    const lam = 3; // wavelength in medium 1
    // medium 2 shading
    ctx.fillStyle = c.fillB;
    ctx.fillRect(0, oy, stage.w, stage.h - oy);
    line(ctx, 0, oy, stage.w, oy, { color: c.ink, width: 4 });
    label(ctx, 'medium 1: v₁', 8, 14, c, { size: 10, align: 'left', patch: false });
    label(ctx, 'medium 2: v₂', 8, stage.h - 12, c, { size: 10, align: 'left', patch: false });
    const d1 = [Math.sin(i), -Math.cos(i)];
    // incident fronts: the leading one touches the boundary at x = t sin i... shifted so it starts at the left end
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, stage.w, oy);
    ctx.clip();
    for (let m = 0; m < 4; m++) {
      const s = V1 * state.t - m * lam + -HALF * Math.sin(i);
      drawFront(ctx, to, d1, s, c.b, m === 0 ? 4 : 2);
    }
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, oy, stage.w, stage.h - oy);
    ctx.clip();
    for (let j = 0; j <= 10; j++) {
      const x = -HALF + j;
      const rr = radius(x + HALF, state.t, i, V1, v2(state));
      if (rr <= 0) continue;
      const [px, py] = to(x, 0);
      ctx.strokeStyle = c.a;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, rr * k, 0, Math.PI);
      ctx.stroke();
      dot(ctx, px, py, 4, c.a, c.ink, 2);
    }
    if (r !== null) {
      const d2 = [Math.sin(r), -Math.cos(r)];
      const lam2 = lam * (v2(state) / V1);
      for (let m = 0; m < 4; m++) {
        const s = v2(state) * state.t - m * lam2 + -HALF * Math.sin(r);
        drawFront(ctx, to, d2, s, c.c, m === 0 ? 4 : 2);
      }
    }
    ctx.restore();
    if (r === null) label(ctx, 'no tangent: total internal reflection', stage.w / 2, oy + 24, c, { size: 11, bounds: stage });
  },
  controls: () => [
    { title: 'Send a wavefront in' },
    { key: 't', label: 'Time', min: 0, max: 10, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'i', label: 'Angle of incidence, i', min: 5, max: 80, step: 1, format: (n) => `${n}°` },
    { key: 'n', label: 'Slowing, v₁ ÷ v₂', min: 0.6, max: 2, step: 0.05, format: (n) => fixed(n, 2) },
    { readout: [
      ['Angle of refraction, r', (s) => (rAngle(s) === null ? { text: 'none (TIR)', good: false } : `${sig((rAngle(s) * 180) / Math.PI, 3)}°`)],
      ['sin i ÷ sin r', (s) => (rAngle(s) === null ? '—' : sig(Math.sin(rad(s.i)) / Math.sin(rAngle(s)), 3))],
      ['v₁ ÷ v₂', (s) => fixed(s.n, 2)],
    ] },
  ],
  tex: (s) => (rAngle(s) === null
    ? '\sin r=\dfrac{v_2}{v_1}\sin i>1:\ \text{no refracted wave}'
    : `\dfrac{\sin i}{\sin r}=\dfrac{\sin ${s.i}^\circ}{\sin ${fixed((rAngle(s) * 180) / Math.PI, 1)}^\circ}=${sig(Math.sin(rad(s.i)) / Math.sin(rAngle(s)), 3)}=\dfrac{v_1}{v_2}`),
});

tool.update();
