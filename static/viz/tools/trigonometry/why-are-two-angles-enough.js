import { createTool } from '../../lib/tool.js';
import { dot, label, line, poly, wedge } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// Base AB is fixed. Two angles are set; the student then tries to ask for a third that does not fit.
const state = { alpha: 55, beta: 65, wish: 80 };
const rad = (d) => (d * Math.PI) / 180;
const forced = (s = state) => 180 - s.alpha - s.beta;
const fits = (s = state) => Math.abs(s.wish - forced(s)) < 0.5;

const tool = createTool({
  state,
  label: 'A fixed base with two rays leaving it at the angles you set. They meet at one point, which gives the third corner. A third slider asks for a different third angle, and a dashed wedge shows how far the wish misses the angle the triangle really has.',
  draw(ctx, stage, c) {
    const L = stage.w * 0.74;
    const A = [stage.w * 0.13, stage.h * 0.85];
    const B = [A[0] + L, A[1]];
    const g = forced();
    const b = (L * Math.sin(rad(state.beta))) / Math.sin(rad(g));
    const C = [A[0] + b * Math.cos(rad(state.alpha)), A[1] - b * Math.sin(rad(state.alpha))];
    const R = Math.min(stage.w, stage.h) * 0.12;
    poly(ctx, [A, B, C], { fill: c.fillC, stroke: c.ink, width: 3 });
    wedge(ctx, ...A, R, -rad(state.alpha), 0, { fill: c.fillA, stroke: c.ink, width: 2 });
    wedge(ctx, ...B, R, Math.PI, Math.PI + rad(state.beta), { fill: c.fillB, stroke: c.ink, width: 2 });
    // The third corner: the real angle, and the angle you wished for, from the same arm CA.
    const toA = Math.atan2(A[1] - C[1], A[0] - C[0]);
    const toB = Math.atan2(B[1] - C[1], B[0] - C[0]);
    wedge(ctx, ...C, R * 1.1, toA, toB, { fill: c.fillY, stroke: c.ink, width: 2 });
    const wishEnd = toA - rad(state.wish);
    line(ctx, C[0], C[1], C[0] + Math.cos(wishEnd) * R * 2.6, C[1] + Math.sin(wishEnd) * R * 2.6, { color: fits() ? c.c : c.a, width: 3, dash: [6, 4] });
    [A, B, C].forEach((p) => dot(ctx, p[0], p[1], 6, c.paper, c.ink));
    label(ctx, `α = ${state.alpha}°`, A[0] + R * 1.8, A[1] - 12, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `β = ${state.beta}°`, B[0] - R * 1.8, B[1] - 12, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `γ = ${fixed(g, 0)}°`, C[0], C[1] - 14, c, { size: 12, bounds: stage });
    label(ctx, fits() ? 'Your wish fits' : `Wished ${state.wish}°: it does not fit`, 8, 12, c, { size: 11, align: 'left', color: fits() ? c.c : c.a, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Fix two angles' },
    { key: 'alpha', label: 'Angle α', min: 20, max: 100, step: 1, format: (n) => `${n}°` },
    { key: 'beta', label: 'Angle β', min: 20, max: 100, step: 1, format: (n) => `${n}°` },
    { key: 'wish', label: 'Third angle you want, γ', min: 10, max: 140, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['The triangle’s γ', () => `${fixed(forced(), 0)}°`],
      ['You wanted', () => `${state.wish}°`],
      ['Verdict', () => ({ text: fits() ? 'Possible' : `${fixed(Math.abs(state.alpha + state.beta + state.wish - 180), 0)}° too ${state.alpha + state.beta + state.wish > 180 ? 'much' : 'little'}`, good: fits() })],
    ] },
  ],
  tex: (s) => `\\gamma=180^\\circ-${s.alpha}^\\circ-${s.beta}^\\circ=${fixed(forced(s), 0)}^\\circ`,
  onChange(s) { if (s.alpha + s.beta > 170) s.beta = 170 - s.alpha; },
});
tool.update();
