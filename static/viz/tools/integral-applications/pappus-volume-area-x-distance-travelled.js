import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arc, line, dot, TAU } from '../../lib/draw.js';
import { simpson, num } from './_ia.js';

// Pappus: spin a flat region about an axis that does not cut it. V = (area) × (distance its centroid travels) = A · 2π d̄.
// A disc of radius r whose centre is R from the axis makes a torus: V = (πr²)(2πR) = 2π² R r². Checked by washers.
const state = { r: 1, R: 2.5 };
// Washers about the y-axis: slices at height y have outer radius R + √(r²−y²) and inner radius R − √(r²−y²).
const byWashers = () => simpson((y) => Math.PI * ((state.R + Math.sqrt(Math.max(0, state.r ** 2 - y * y))) ** 2 - (state.R - Math.sqrt(Math.max(0, state.r ** 2 - y * y))) ** 2), -state.r, state.r, 4000);

createTool({
  state,
  label: 'A disc beside a vertical axis. A dashed circle shows the path of the disc centre, which has length 2 pi R when the axis is spun. The volume of the doughnut equals the disc area times that path length.',
  draw(ctx, stage, c) {
    const s = Math.min(stage.w, stage.h) / 2 / 5.2;
    const ax = stage.w * 0.16; const cy = stage.h / 2;
    line(ctx, ax, 6, ax, stage.h - 6, { color: c.a, width: 4 });
    const cx = ax + state.R * s;
    arc(ctx, cx, cy, state.r * s, 0, TAU, { color: c.ink, width: 3 });
    ctx.fillStyle = c.fillB; ctx.beginPath(); ctx.arc(cx, cy, state.r * s, 0, TAU); ctx.fill();
    dot(ctx, cx, cy, 6, c.c, c.ink);
    line(ctx, ax, cy, cx, cy, { color: c.c, width: 3 });
    // path of the centroid, seen as an ellipse for depth
    ctx.strokeStyle = c.c; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.ellipse(ax, cy, state.R * s, state.R * s * 0.3, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  },
  controls: [
    { title: 'Place the disc' },
    { key: 'r', label: 'Disc radius r', min: 0.5, max: 2, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'R', label: 'Distance to the axis R', min: 2.2, max: 4, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [
      ['Area of the disc', () => num(Math.PI * state.r ** 2, 5)],
      ['Distance the centre travels 2πR', () => num(2 * Math.PI * state.R, 5)],
      ['Pappus: area × distance', () => num(Math.PI * state.r ** 2 * 2 * Math.PI * state.R, 6)],
      ['Washers, summed slice by slice', () => num(byWashers(), 6)],
    ] },
  ],
  tex: (s) => `V=A\\cdot 2\\pi\\bar d=\\pi r^2\\cdot2\\pi R=2\\pi^2Rr^2`,
});
