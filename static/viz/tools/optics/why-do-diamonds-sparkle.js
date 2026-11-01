import { createTool } from '../../lib/tool.js';
import { createBench } from '../../lib/rays.js';
import { line, label, arrow } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { criticalAngle, polygonTrace, rad } from './_refraction-math.js';

// A diamond cut seen from the side. Light comes down on the flat top (the table).
const OUTLINE = [[0.5, 0.55], [-0.5, 0.55], [-1.0, 0.25], [-1.0, 0.18], [0, -0.75], [1.0, 0.18], [1.0, 0.25]];
const N = { diamond: 2.42, glass: 1.5 };
const state = { stone: 'diamond', tilt: 10, x: 0 };
const run = (s) => {
  const a = rad(s.tilt);
  return polygonTrace(OUTLINE, N[s.stone], 1, [s.x - Math.tan(a) * 1.05, 1.6], [Math.sin(a), -Math.cos(a)], false, 10);
};
const verdict = (s) => {
  const e = run(s).escapes[0];
  if (!e) return { text: 'trapped inside', good: true };
  return e.from[1] > 0.2 ? { text: 'back out of the top: sparkle', good: true } : { text: 'lost through the bottom', good: false };
};

const tool = createTool({
  state,
  label: 'A side view of a cut diamond with a ray entering the flat top. In a diamond the ray is totally reflected at the lower facets and comes back out of the top, so the stone sparkles. In ordinary glass the same ray leaks out through the bottom facets.',
  setup: (stage, c) => createBench(stage, { x: [-2, 2], cy: 0.42, c }),
  draw(ctx, stage, c, bench) {
    ctx.beginPath();
    OUTLINE.forEach(([x, y], k) => {
      const [px, py] = bench.toPx(x, y);
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle = c.fillB;
    ctx.fill();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    const result = run(state);
    result.segments.forEach((seg, k) => {
      const color = seg.inside ? c.a : c.ink;
      line(ctx, ...bench.toPx(...seg.from), ...bench.toPx(...seg.to), { color, width: 3 });
      if (k === 0) {
        const m = [(seg.from[0] + seg.to[0]) / 2, (seg.from[1] + seg.to[1]) / 2];
        arrow(ctx, ...bench.toPx(seg.from[0] * 0.5 + m[0] * 0.5, seg.from[1] * 0.5 + m[1] * 0.5), ...bench.toPx(m[0], m[1]), { color, width: 3, head: 10 });
      }
    });
    for (const e of result.escapes) arrow(ctx, ...bench.toPx(...e.from), ...bench.toPx(...e.to), { color: c.b, width: 4, head: 11 });
    label(ctx, `${state.stone === 'diamond' ? 'Diamond' : 'Glass'}, n = ${fixed(N[state.stone], 2)}`, stage.w / 2, stage.h - 16, c, { color: c.ink, size: 13 });
  },
  controls: () => [
    { title: 'Shine a ray on the stone' },
    { key: 'stone', label: 'Material', options: [['diamond', 'Diamond'], ['glass', 'Glass']] },
    { key: 'tilt', label: 'Angle of the ray', min: 0, max: 30, step: 1, format: (n) => `${n}°` },
    { key: 'x', label: 'Where it lands on the top', min: -0.4, max: 0.4, step: 0.05, format: (n) => fixed(n, 2) },
    { readout: [
      ['Critical angle, C', (s) => `${fixed(criticalAngle(N[s.stone]), 1)}°`],
      ['What happens', (s) => verdict(s)],
    ] },
  ],
  tex: (s) => `\\sin C=\\dfrac{1}{n}=\\dfrac{1}{${fixed(N[s.stone], 2)}}\\ \\Rightarrow\\ C=${fixed(criticalAngle(N[s.stone]), 1)}^\\circ`,
});
tool.update();
