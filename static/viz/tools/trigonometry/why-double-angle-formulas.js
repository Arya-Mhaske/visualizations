import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { cosD, rad, sinD } from './_identities-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { A: 35 };

createTool({
  state,
  label: 'The unit circle with an isosceles triangle: two radii, one along the x-axis and one at angle 2A, joined by a chord. The line from the centre to the middle of the chord splits it into two equal right triangles with angle A. Finding the triangle area two ways gives sine of 2A, and the x-coordinate of the corner gives cosine of 2A.',
  draw(ctx, stage, c) {
    const f = frame(stage, 1.3);
    drawFrame(ctx, f, c, { ticks: false });
    const O = f.px([0, 0]);
    const R = f.px([1, 0]);
    const P = f.px([cosD(2 * state.A), sinD(2 * state.A)]);
    const M = f.px([(1 + cosD(2 * state.A)) / 2, sinD(2 * state.A) / 2]);
    poly(ctx, [O, R, P], { fill: c.fillC, stroke: c.ink, width: 3 });
    line(ctx, ...O, ...M, { color: c.d, width: 5 });
    line(ctx, ...R, ...M, { color: c.a, width: 6 });
    line(ctx, ...M, ...P, { color: c.a, width: 6 });
    line(ctx, ...P, ...f.px([cosD(2 * state.A), 0]), { color: c.b, width: 3, dash: [5, 4] });
    arc(ctx, ...O, 24, -rad(state.A), 0, { color: c.b, width: 4 });
    arc(ctx, ...O, 34, -rad(2 * state.A), -rad(state.A), { color: c.b, width: 4 });
    dot(ctx, ...P, 7, c.a, c.ink);
    dot(ctx, ...M, 4, c.fillY, c.ink, 2);
    label(ctx, 'cos A', (O[0] + M[0]) / 2 - 12, (O[1] + M[1]) / 2 - 12, c, { size: 11, color: c.d, bounds: stage, patch: false });
    label(ctx, 'sin A', (R[0] + M[0]) / 2 + 20, (R[1] + M[1]) / 2 + 4, c, { size: 11, color: c.a, bounds: stage, patch: false });
    label(ctx, 'A', O[0] + 40, O[1] - 5, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Set the angle' },
    { key: 'A', label: 'Angle A', min: 5, max: 85, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Area, ½·1·1·sin 2A', (s) => fixed(sinD(2 * s.A) / 2, 4)],
      ['Area, ½·base·height', (s) => fixed(0.5 * 2 * sinD(s.A) * cosD(s.A), 4)],
      ['cos 2A, three ways', (s) => `${fixed(cosD(s.A) ** 2 - sinD(s.A) ** 2, 3)}, ${fixed(2 * cosD(s.A) ** 2 - 1, 3)}, ${fixed(1 - 2 * sinD(s.A) ** 2, 3)}`],
    ] },
  ],
  tex: (s) => `\\sin 2A=2\\sin A\\cos A=2(${fixed(sinD(s.A), 3)})(${fixed(cosD(s.A), 3)})=${fixed(sinD(2 * s.A), 3)}`,
});
