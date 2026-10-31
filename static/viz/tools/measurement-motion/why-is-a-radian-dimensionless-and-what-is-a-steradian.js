import { createTool } from '../../lib/tool.js';
import { arc, label, line, wedge } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { arcLength, capArea, solidAngle } from './_units-measurement-math.js';

const state = { view: 'rad', r: 5, theta: 60, alpha: 40 };
const rad = (deg) => (deg * Math.PI) / 180;

createTool({
  state,
  label: 'A circle with a highlighted arc, or the cross-section of a sphere with a cone cut out of it. Changing the radius changes the arc or the patch of surface, but not the ratio to r or r squared.',
  draw(ctx, stage, c) {
    const cx = stage.w * 0.4;
    const cy = stage.h / 2;
    const px = (Math.min(stage.w * 0.4, stage.h * 0.46) / 10) * state.r;
    ctx.beginPath();
    ctx.arc(cx, cy, px, 0, Math.PI * 2);
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (state.view === 'rad') {
      const half = rad(state.theta) / 2;
      wedge(ctx, cx, cy, px, -half, half, { fill: c.fillA, stroke: c.ink });
      arc(ctx, cx, cy, px, -half, half, { color: c.a, width: 8 });
      label(ctx, `r = ${state.r} cm`, cx + px / 2, cy + 14, c, { bounds: stage, size: 11 });
      label(ctx, `s = ${fixed(arcLength(state.r, rad(state.theta)), 2)} cm`, cx + px + 4, cy, c, { align: 'left', bounds: stage, size: 12 });
    } else {
      const half = rad(state.alpha);
      wedge(ctx, cx, cy, px, -half, half, { fill: c.fillB, stroke: c.ink });
      arc(ctx, cx, cy, px, -half, half, { color: c.b, width: 8 });
      line(ctx, cx, cy, cx + px, cy, { color: c.ink, width: 2, dash: [5, 4] });
      label(ctx, `r = ${state.r} cm`, cx + px / 2, cy + 14, c, { bounds: stage, size: 11 });
      label(ctx, `A = ${fixed(capArea(state.r, half), 1)} cm²`, cx + px + 4, cy - 18, c, { align: 'left', bounds: stage, size: 12 });
    }
  },
  controls: [
    { title: 'Ratios whose units cancel' },
    { key: 'view', label: 'Show', options: [['rad', 'Radian (arc)'], ['sr', 'Steradian (area)']] },
    { key: 'r', label: 'Radius r', min: 1, max: 10, step: 1, format: (v) => `${v} cm` },
    { key: 'theta', label: 'Angle θ at the centre', min: 10, max: 360, step: 5, format: (v) => `${v}°` },
    { key: 'alpha', label: 'Cone half-angle', min: 5, max: 180, step: 5, format: (v) => `${v}°` },
    { readout: [
      ['Arc s', (s) => `${fixed(arcLength(s.r, rad(s.theta)), 2)} cm`],
      ['s ÷ r', (s) => `${fixed(rad(s.theta), 3)} (cm ÷ cm: no unit)`],
      ['Patch A', (s) => `${fixed(capArea(s.r, rad(s.alpha)), 1)} cm²`],
      ['A ÷ r²', (s) => `${sig(solidAngle(rad(s.alpha)), 4)} (cm² ÷ cm²: no unit)`],
      ['Whole sphere', () => `4π = ${fixed(4 * Math.PI, 3)} sr`],
    ] },
  ],
  tex: (s) => (s.view === 'rad'
    ? `\\theta = \\frac{s}{r} = \\frac{${fixed(arcLength(s.r, rad(s.theta)), 2)}\\ \\text{cm}}{${s.r}\\ \\text{cm}} = ${fixed(rad(s.theta), 3)}\\ \\text{rad}`
    : `\\Omega = \\frac{A}{r^2} = \\frac{${fixed(capArea(s.r, rad(s.alpha)), 1)}\\ \\text{cm}^2}{${s.r}^2\\ \\text{cm}^2} = ${sig(solidAngle(rad(s.alpha)), 4)}\\ \\text{sr}`),
});
