import { createTool } from '../../lib/tool.js';
import { createBench } from '../../lib/rays.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { apparentDepthAt, rad } from './_refraction-math.js';

// The pool bottom is at depth d. The point P on it sends rays up to the surface; we look at the light that reaches the eye.
const state = { d: 2, n: 1.33, view: 25 };

const tool = createTool({
  state,
  label: 'A coin P on the bottom of a pool. Two nearby rays leave P, bend away from the normal at the surface and go to the eye. Dashed lines extend them backwards. They meet at a point above P, where the coin seems to be.',
  setup: (stage, c) => createBench(stage, { x: [-4, 4], cy: 0.3, c }),
  draw(ctx, stage, c, bench) {
    const [x0, y0] = bench.toPx(-4, 0);
    const [x1] = bench.toPx(4, 0);
    ctx.fillStyle = c.fillB;
    ctx.fillRect(x0, y0, x1 - x0, stage.h - y0);
    line(ctx, x0, y0, x1, y0, { color: c.ink, width: 3 });
    const P = [0, -state.d];
    const apparent = apparentDepthAt(state.d, state.n, state.view);
    for (const a of [0, state.view]) {
      const w = Math.asin(Math.sin(rad(a)) / state.n);
      const hitX = state.d * Math.tan(w);
      line(ctx, ...bench.toPx(...P), ...bench.toPx(hitX, 0), { color: c.a, width: 3 });
      // the ray in the air, going on up and to the right
      const out = [Math.sin(rad(a)), Math.cos(rad(a))];
      line(ctx, ...bench.toPx(hitX, 0), ...bench.toPx(hitX + out[0] * 4, out[1] * 4), { color: c.a, width: 3 });
      // the same ray traced backwards below the surface
      // the same ray traced backwards, down to the vertical through the coin
      if (a > 0) line(ctx, ...bench.toPx(hitX, 0), ...bench.toPx(0, -apparent), { color: c.grid, width: 2, dash: [6, 5] });
    }
    line(ctx, ...bench.toPx(0, 0), ...bench.toPx(0, -state.d), { color: c.grid, width: 2, dash: [6, 5] });
    dot(ctx, ...bench.toPx(0, -state.d), 8, c.fillY, c.ink);
    dot(ctx, ...bench.toPx(0, -apparent), 8, c.fillC, c.ink);
    label(ctx, 'coin', ...bench.toPx(0.7, -state.d), c, { color: c.ink, size: 12 });
    label(ctx, 'seems here', ...bench.toPx(-0.9, -apparent), c, { color: c.ink, size: 12, bounds: stage });
    label(ctx, 'air', 30, 16, c, { color: c.ink, size: 12 });
    label(ctx, `water, n = ${fixed(state.n, 2)}`, 70, stage.h - 16, c, { color: c.ink, size: 12 });
  },
  controls: () => [
    { title: 'Look into the pool' },
    { key: 'd', label: 'Real depth, d', min: 0.5, max: 3, step: 0.1, format: (n) => `${fixed(n, 1)} m` },
    { key: 'n', label: 'Refractive index, n', min: 1.1, max: 1.7, step: 0.01, format: (n) => fixed(n, 2) },
    { key: 'view', label: 'Viewing angle from straight down', min: 0, max: 60, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Looking straight down, d/n', (s) => `${sig(s.d / s.n, 3)} m`],
      ['At this angle', (s) => `${sig(apparentDepthAt(s.d, s.n, s.view), 3)} m`],
      ['Looks shallower by', (s) => `${sig(s.d - apparentDepthAt(s.d, s.n, s.view), 3)} m`],
    ] },
  ],
  tex: (s) => `\\text{apparent depth}=\\dfrac{d}{n}=\\dfrac{${fixed(s.d, 1)}}{${fixed(s.n, 2)}}=${sig(s.d / s.n, 3)}\\ \\text{m}`,
});
tool.update();
