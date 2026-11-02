import { createTool } from '../../lib/tool.js';
import { numberLine } from '../../lib/numline.js';
import { poly, dot, label, TAU } from '../../lib/draw.js';
import { bounds } from './_number-systems-math.js';

const state = { k: 4 };
const sides = (s) => 6 * 2 ** s.k;

createTool({
  state,
  label: 'A circle with a polygon inside it and a polygon outside it. Below, a number line zoomed round pi shows the two perimeters as bounds on either side.',
  draw(ctx, stage, c) {
    const n = sides(state);
    const R = Math.min(stage.w * 0.34, stage.h * 0.3);
    const [cx, cy] = [stage.w / 2, stage.h * 0.36];
    const ring = (r, off) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos(off + (i / n) * TAU), cy + r * Math.sin(off + (i / n) * TAU)]);
    poly(ctx, ring(R / Math.cos(Math.PI / n), Math.PI / n), { fill: c.fillA, stroke: c.ink, width: 2 });
    poly(ctx, ring(R, 0), { fill: c.fillB, stroke: c.ink, width: 2 });
    ctx.save();
    ctx.strokeStyle = c.a;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.stroke();
    ctx.restore();
    const { lo, hi } = bounds(n);
    const half = (hi - lo) * 1.4;
    const nl = numberLine(ctx, stage, c, { lo: Math.PI - half, hi: Math.PI + half, y: stage.h * 0.82, pad: 30 });
    nl.axis({ numbers: false });
    nl.mark(lo, { fill: c.b });
    nl.mark(hi, { fill: c.b });
    dot(ctx, nl.px(Math.PI), stage.h * 0.82, 8, c.c, c.ink);
    label(ctx, lo.toFixed(5), nl.px(lo), stage.h * 0.82 + 24, c, { size: 11, bounds: stage, patch: false });
    label(ctx, hi.toFixed(5), nl.px(hi), stage.h * 0.82 + 24, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'π', nl.px(Math.PI), stage.h * 0.82 - 20, c, { size: 14, patch: false });
  },
  controls: [
    { title: 'Double the sides' },
    { key: 'k', label: 'Doublings', min: 0, max: 7, step: 1, format: (v) => `${6 * 2 ** v} sides` },
    { readout: [
      ['Sides n', (s) => String(sides(s))],
      ['Inside: n sin(π/n)', (s) => bounds(sides(s)).lo.toFixed(5)],
      ['Outside: n tan(π/n)', (s) => bounds(sides(s)).hi.toFixed(5)],
      ['Gap', (s) => (bounds(sides(s)).hi - bounds(sides(s)).lo).toExponential(2)],
    ] },
  ],
  tex: (s) => `${bounds(sides(s)).lo.toFixed(5)}<\\pi<${bounds(sides(s)).hi.toFixed(5)}`,
});
