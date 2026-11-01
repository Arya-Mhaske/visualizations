import { createTool } from '../../lib/tool.js';
import { createBench } from '../../lib/rays.js';
import { handles } from '../../lib/stage.js';
import { line, label, arrow, arc } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { rad, snell, criticalAngle, reflectance } from './_refraction-math.js';

// Glass below y = 0, air above. Light comes up from the lower left.
const state = { i: 30, n: 1.5 };

const tool = createTool({
  state,
  label: 'A ray in glass meets the boundary with air. A coral reflected ray goes back into the glass. A blue refracted ray goes out into the air, bending away from the normal. As the angle of incidence reaches the critical angle, the blue ray skims along the boundary, and past it the blue ray is gone.',
  setup: (stage, c) => createBench(stage, { x: [-4, 4], cy: 0.5, c }),
  draw(ctx, stage, c, bench) {
    const [x0, y0] = bench.toPx(-4, 0);
    const [x1] = bench.toPx(4, 0);
    ctx.fillStyle = c.fillB;
    ctx.fillRect(x0, y0, x1 - x0, stage.h - y0);
    line(ctx, x0, y0, x1, y0, { color: c.ink, width: 3 });
    line(ctx, ...bench.toPx(0, 3.4), ...bench.toPx(0, -3.4), { color: c.ink, width: 2, dash: [6, 5] });
    const i = rad(state.i);
    const t = snell(state.n, 1, state.i);
    const R = reflectance(state.n, 1, state.i);
    const start = [-Math.sin(i) * 3.2, -Math.cos(i) * 3.2];
    const w = (share) => 2 + 6 * Math.sqrt(share);
    arrow(ctx, ...bench.toPx(...start), ...bench.toPx(0, 0), { color: c.ink, width: 6, head: 13 });
    arrow(ctx, ...bench.toPx(0, 0), ...bench.toPx(Math.sin(i) * 3.2, -Math.cos(i) * 3.2), { color: c.a, width: w(R), head: 12 });
    if (t !== null) {
      const o = rad(t);
      arrow(ctx, ...bench.toPx(0, 0), ...bench.toPx(Math.sin(o) * 3.2, Math.cos(o) * 3.2), { color: c.b, width: w(1 - R), head: 12 });
    }
    const [cx, cy] = bench.toPx(0, 0);
    arc(ctx, cx, cy, 44, Math.PI / 2, Math.PI / 2 + i, { color: c.ink, width: 2 });
    label(ctx, 'i', cx + 58 * Math.cos(Math.PI / 2 + i / 2), cy + 58 * Math.sin(Math.PI / 2 + i / 2), c, { color: c.ink, size: 12 });
    label(ctx, `glass, n = ${fixed(state.n, 2)}`, 70, stage.h - 16, c, { color: c.ink, size: 12 });
    label(ctx, 'air', 30, 16, c, { color: c.ink, size: 12 });
    label(ctx, t === null ? 'TOTAL INTERNAL REFLECTION' : '', stage.w / 2, 30, c, { color: c.a, size: 13 });
  },
  controls: () => [
    { title: 'Raise the angle' },
    { key: 'i', label: 'Angle of incidence, i', min: 0, max: 89, step: 1, format: (n) => `${n}°` },
    { key: 'n', label: 'Refractive index of glass, n', min: 1.2, max: 2.4, step: 0.05, format: (n) => fixed(n, 2) },
    { readout: [
      ['Critical angle, C', (s) => `${fixed(criticalAngle(s.n), 1)}°`],
      ['Angle in the air', (s) => (snell(s.n, 1, s.i) === null ? 'none: no light gets out' : `${fixed(snell(s.n, 1, s.i), 1)}°`)],
      ['Light reflected', (s) => `${sig(reflectance(s.n, 1, s.i) * 100, 3)} %`],
    ] },
  ],
  tex: (s) => `\\sin C=\\dfrac{1}{n}=\\dfrac{1}{${fixed(s.n, 2)}}\\ \\Rightarrow\\ C=${fixed(criticalAngle(s.n), 1)}^\\circ`,
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(-Math.sin(rad(state.i)) * 3.2, -Math.cos(rad(state.i)) * 3.2),
  move(px, py) {
    const [x, y] = tool.extra.toWorld(px, py);
    state.i = Math.max(0, Math.min(89, Math.round((Math.atan2(-x, -y) * 180) / Math.PI)));
  },
  nudge(direction) { state.i = Math.max(0, Math.min(89, state.i + direction)); },
}], { onChange: () => tool.update() });
tool.update();
