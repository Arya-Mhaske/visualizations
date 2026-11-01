import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { deg, heightFromTwo, nearestDegree, rad, tanD } from './_right-triangle-math.js';

// Heights are measured above the observer's eye. The distance to the base is not known to the observer.
const state = { H: 30, d1: 40, s: 20, whole: false };
const angles = (s = state) => {
  const exact = [deg(Math.atan(s.H / s.d1)), deg(Math.atan(s.H / (s.d1 + s.s)))];
  return s.whole ? exact.map(nearestDegree) : exact;
};
const estimate = (s = state) => heightFromTwo(angles(s)[0], angles(s)[1], s.s);

createTool({
  state,
  label: 'A tower on the right and two observation points on the ground to its left. The nearer point sees the top at a bigger angle, the farther point at a smaller angle. The distance between the points is known, the distance to the base is not. The two angles and that gap are enough to find the height.',
  draw(ctx, stage, c) {
    const ground = stage.h * 0.82;
    const k = Math.min((stage.w * 0.84) / (state.d1 + state.s + 6), (stage.h * 0.68) / state.H);
    const base = stage.w * 0.92;
    const p1 = base - state.d1 * k;
    const p2 = base - (state.d1 + state.s) * k;
    const top = ground - state.H * k;
    line(ctx, 0, ground, stage.w, ground, { color: c.ink, width: 4 });
    poly(ctx, [[base, ground], [base + 7, ground], [base + 7, top], [base, top]], { fill: c.fillB, stroke: c.ink, width: 3 });
    const [a1, a2] = angles();
    line(ctx, p1, ground, base, top, { color: c.a, width: 2 });
    line(ctx, p2, ground, base, top, { color: c.d, width: 2 });
    arc(ctx, p1, ground, 34, -rad(a1), 0, { color: c.a, width: 4 });
    arc(ctx, p2, ground, 50, -rad(a2), 0, { color: c.d, width: 4 });
    dot(ctx, p1, ground, 5, c.fillY, c.ink);
    dot(ctx, p2, ground, 5, c.fillY, c.ink);
    line(ctx, p2, ground + 12, p1, ground + 12, { color: c.c, width: 4 });
    label(ctx, `s = ${state.s} m`, (p1 + p2) / 2, ground + 26, c, { size: 11, color: c.c, bounds: stage, patch: false });
    label(ctx, '? m', (p1 + base) / 2, ground + 12, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `α = ${fixed(a1, state.whole ? 0 : 1)}°`, p1 + 6, ground - 40, c, { size: 11, align: 'left', color: c.a, bounds: stage, patch: false });
    label(ctx, `β = ${fixed(a2, state.whole ? 0 : 1)}°`, p2 + 6, ground - 56, c, { size: 11, align: 'left', color: c.d, bounds: stage, patch: false });
    label(ctx, 'h', base + 16, (ground + top) / 2, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Two sightings, no tape to the base' },
    { key: 'H', label: 'True height (hidden from the observer)', min: 10, max: 50, step: 1, format: (n) => `${n} m` },
    { key: 'd1', label: 'Distance to base (unknown)', min: 20, max: 60, step: 1, format: (n) => `${n} m` },
    { key: 's', label: 'Step back, s', min: 10, max: 40, step: 1, format: (n) => `${n} m` },
    { key: 'whole', label: 'Read angles to whole degrees only', toggle: true },
    { readout: [
      ['Angles seen', (s) => `${fixed(angles(s)[0], s.whole ? 0 : 2)}° and ${fixed(angles(s)[1], s.whole ? 0 : 2)}°`],
      ['Height from the sightings', (s) => `${fixed(estimate(s), 2)} m`],
      ['Error', (s) => ({ text: `${fixed(estimate(s) - s.H, 2)} m`, good: Math.abs(estimate(s) - s.H) < 0.01 })],
      ['Distance to base found', (s) => `${fixed(estimate(s) / tanD(angles(s)[0]), 1)} m`],
    ] },
  ],
  tex: (s) => `h=\\dfrac{s}{\\cot\\beta-\\cot\\alpha}=\\dfrac{${s.s}}{${fixed(1 / tanD(angles(s)[1]), 3)}-${fixed(1 / tanD(angles(s)[0]), 3)}}=${fixed(estimate(s), 2)}\\text{ m}`,
});
