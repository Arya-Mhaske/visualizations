import { createTool } from '../../lib/tool.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { k: 0 };
const sides = (s = state) => 6 * 2 ** s.k;
const inner = (n) => (n / 2) * Math.sin((2 * Math.PI) / n);
const outer = (n) => n * Math.tan(Math.PI / n);

createTool({
  state,
  label: 'A circle of radius 1 with a regular polygon inside it and another outside it, each with n sides. Doubling the number of sides, from 6 to 12 to 24 and on, squeezes the polygons closer to the circle. The area of the inner polygon rises towards pi and the area of the outer polygon falls towards pi, but in any finite number of steps neither reaches it.',
  draw(ctx, stage, c) {
    const n = sides();
    const O = [stage.w / 2, stage.h * 0.42];
    const r = Math.min(stage.w * 0.4, stage.h * 0.36);
    const ring = (rad, offset = 0) => Array.from({ length: n }, (_, i) => [O[0] + rad * Math.cos(offset + (2 * Math.PI * i) / n), O[1] - rad * Math.sin(offset + (2 * Math.PI * i) / n)]);
    poly(ctx, ring(r / Math.cos(Math.PI / n), Math.PI / n), { fill: c.fillB, stroke: c.ink, width: 2 });
    poly(ctx, ring(r), { fill: c.fillA, stroke: c.ink, width: 2 });
    ctx.save();
    ctx.beginPath();
    ctx.arc(O[0], O[1], r, 0, Math.PI * 2);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
    // a number line from 2.9 to 3.3 with pi marked
    const [x0, x1, y] = [stage.w * 0.08, stage.w * 0.92, stage.h * 0.9];
    const at = (v) => x0 + ((v - 3.0) / 0.3) * (x1 - x0);
    line(ctx, x0, y, x1, y, { color: c.ink, width: 3 });
    line(ctx, at(inner(n)), y, at(outer(n)), y, { color: c.c, width: 8 });
    dot(ctx, at(inner(n)), y, 6, c.a, c.ink);
    dot(ctx, at(outer(n)), y, 6, c.b, c.ink);
    line(ctx, at(Math.PI), y - 14, at(Math.PI), y + 14, { color: c.ink, width: 3 });
    label(ctx, 'π', at(Math.PI), y - 24, c, { size: 13, bounds: stage, patch: false });
    label(ctx, '3.0', x0, y + 18, c, { size: 10, bounds: stage, patch: false });
    label(ctx, '3.3', x1, y + 18, c, { size: 10, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Double the sides' },
    { key: 'k', label: 'Number of sides', min: 0, max: 8, step: 1, format: (v) => `${6 * 2 ** v}` },
    { readout: [
      ['Inner polygon area', (s) => fixed(inner(sides(s)), 6)],
      ['Outer polygon area', (s) => fixed(outer(sides(s)), 6)],
      ['Circle area, π', (s) => fixed(Math.PI, 6)],
      ['Still short by', (s) => ({ text: fixed(Math.PI - inner(sides(s)), 6), good: false })],
    ] },
  ],
  tex: (s) => `${fixed(inner(sides(s)), 4)}<\\pi<${fixed(outer(sides(s)), 4)}\\ \\ (n=${sides(s)})`,
});
