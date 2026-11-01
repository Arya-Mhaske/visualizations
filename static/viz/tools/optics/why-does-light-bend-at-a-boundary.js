import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { createBench } from '../../lib/rays.js';
import { transport } from '../../lib/sim.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { rad, snell } from './_refraction-math.js';

// The crests of a plane wave from the top left. Air (n = 1) above y = 0, glass (n) below. One wavelength in air is 0.6.
const LAMBDA = 0.6;
const state = { i: 40, n: 1.5, t: 0.3 };
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => 1, update: () => tool.update() });
const rDeg = (s) => snell(1, s.n, s.i);

const tool = createTool({
  state,
  label: 'Wave crests drawn as parallel lines. In the air they are further apart than in the glass. Crests in the air and the glass meet the boundary at the same points, so the crests in the glass must tilt. This tilt is the bending of light.',
  setup: (stage, c) => createBench(stage, { x: [-4, 4], cy: 0.5, c }),
  draw(ctx, stage, c, bench) {
    const sinI = Math.sin(rad(state.i));
    const r = rad(rDeg(state));
    const [x0, y0] = bench.toPx(-4, 0);
    const [x1, y1] = bench.toPx(4, 0);
    ctx.fillStyle = c.fillB;
    ctx.fillRect(x0, y0, x1 - x0, stage.h - y0);
    line(ctx, x0, y0, x1, y1, { color: c.ink, width: 3 });
    const D = LAMBDA / sinI; // crest spacing along the boundary
    const shift = state.t * D;
    const L = 14;
    for (let k = -12; k <= 12; k++) {
      const x = k * D + shift;
      if (x < -6 || x > 6) continue;
      const above = [x + L * Math.cos(rad(state.i)), L * Math.sin(rad(state.i))];
      const below = [x - L * Math.cos(r), -L * Math.sin(r)];
      line(ctx, ...bench.toPx(x, 0), ...bench.toPx(...above), { color: c.b, width: 2 });
      line(ctx, ...bench.toPx(x, 0), ...bench.toPx(...below), { color: c.a, width: 2 });
      dot(ctx, ...bench.toPx(x, 0), 4, c.ink, c.ink, 1);
    }
    // the normal and the two rays
    line(ctx, ...bench.toPx(0, 2.6), ...bench.toPx(0, -2.6), { color: c.ink, width: 2, dash: [6, 5] });
    const hit = [0, 0];
    const inc = [-Math.sin(rad(state.i)), Math.cos(rad(state.i))];
    arrow(ctx, ...bench.toPx(inc[0] * 2.4, inc[1] * 2.4), ...bench.toPx(...hit), { color: c.b, width: 4, head: 11 });
    arrow(ctx, ...bench.toPx(...hit), ...bench.toPx(Math.sin(r) * 2.4, -Math.cos(r) * 2.4), { color: c.a, width: 4, head: 11 });
    label(ctx, 'air, n = 1', stage.w - 60, 16, c, { color: c.ink, size: 12 });
    label(ctx, `glass, n = ${fixed(state.n, 2)}`, stage.w - 70, stage.h - 16, c, { color: c.ink, size: 12 });
  },
  controls: () => [
    { title: 'A wave meets glass' },
    { key: 'i', label: 'Angle of incidence, i', min: 10, max: 80, step: 1, format: (n) => `${n}°` },
    { key: 'n', label: 'Refractive index of glass, n', min: 1.1, max: 2, step: 0.05, format: (n) => fixed(n, 2) },
    { key: 't', label: 'Time', min: 0, max: 1, step: 0.01, format: (n) => `${fixed(n, 2)} T` },
    transport(line2.clock),
    { readout: [
      ['Wavelength in air', () => `${LAMBDA} units`],
      ['Wavelength in glass', (s) => `${sig(LAMBDA / s.n, 3)} units`],
      ['Crest gap along boundary', (s) => `${sig(LAMBDA / Math.sin(rad(s.i)), 3)} units`],
      ['Refracted angle, r', (s) => `${fixed(rDeg(s), 1)}°`],
    ] },
  ],
  tex: (s) => `\\dfrac{\\sin i}{\\sin r}=\\dfrac{\\lambda_1}{\\lambda_2}=\\dfrac{v_1}{v_2}=n=${fixed(s.n, 2)}`,
  onChange: () => line2.sync(),
});
line2.sync();
tool.update();
