import { createTool } from '../../lib/tool.js';
import { label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { angleArc, arrowW, eqFrame, rad, segW } from './_kit.js';

const G = 9.8;
const state = { th: 30, m: 5 };
const mg = () => state.m * G;

createTool({
  state,
  label: 'A block on a slope. The weight mg points straight down. It is split into two parts: one along the slope, which makes the block slide, and one pressing into the slope. The two parts and the weight form a right triangle, and the angle of the slope appears again inside it.',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-1.5, 11], [-4.4, 6.6], 8);
    const t = rad(state.th);
    const up = [Math.cos(t), Math.sin(t)];
    const out = [-Math.sin(t), Math.cos(t)];
    const into = [Math.sin(t), -Math.cos(t)];
    const W = 10;
    poly(ctx, [f.px([0, 0]), f.px([W, 0]), f.px([W, W * Math.tan(t)])], { fill: c.fillB, stroke: c.ink, width: 3 });
    const base = [3.2 * up[0], 3.2 * up[1]];
    const c0 = [base[0] + 0.7 * out[0], base[1] + 0.7 * out[1]];
    const corner = (a, b) => [c0[0] + a * up[0] * 0.7 + b * out[0] * 0.7, c0[1] + a * up[1] * 0.7 + b * out[1] * 0.7];
    poly(ctx, [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)].map(f.px), { fill: c.fillY, stroke: c.ink, width: 3 });
    const k = 0.05;
    const wEnd = [c0[0], c0[1] - mg() * k];
    const sEnd = [c0[0] - up[0] * mg() * Math.sin(t) * k, c0[1] - up[1] * mg() * Math.sin(t) * k];
    const nEnd = [c0[0] + into[0] * mg() * Math.cos(t) * k, c0[1] + into[1] * mg() * Math.cos(t) * k];
    segW(ctx, f, sEnd, wEnd, { color: c.grid, width: 2, dash: [5, 4] });
    segW(ctx, f, nEnd, wEnd, { color: c.grid, width: 2, dash: [5, 4] });
    arrowW(ctx, f, c0, nEnd, { color: c.b, width: 5, head: 11 });
    arrowW(ctx, f, c0, sEnd, { color: c.c, width: 5, head: 11 });
    arrowW(ctx, f, c0, wEnd, { color: c.a, width: 5, head: 12 });
    angleArc(ctx, f.px([0, 0]), f.px([W, 0]), f.px([W, W * Math.tan(t)]), 30, { color: c.ink, width: 3 });
    angleArc(ctx, f.px(c0), f.px(wEnd), f.px(nEnd), 24, { color: c.ink, width: 3 });
    label(ctx, `θ = ${state.th}°`, f.px([1.9, 0])[0] + 8, f.px([0, 0.45])[1] + 8, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'mg', f.px(wEnd)[0] + 14, f.px(wEnd)[1] + 4, c, { size: 12, color: c.a, bounds: stage, patch: false });
    label(ctx, 'mg sin θ', f.px(sEnd)[0] - 6, f.px(sEnd)[1] + 14, c, { size: 11, color: c.c, align: 'right', bounds: stage, patch: false });
    label(ctx, 'mg cos θ', f.px(nEnd)[0] + 8, f.px(nEnd)[1] + 4, c, { size: 11, color: c.b, align: 'left', bounds: stage, patch: false });
  },
  controls: [
    { title: 'Tilt the slope' },
    { key: 'th', label: 'Slope angle, θ', min: 0, max: 80, step: 1, format: (n) => `${n}°` },
    { key: 'm', label: 'Mass, m', min: 1, max: 10, step: 1, format: (n) => `${n} kg` },
    { readout: [
      ['Weight, mg', () => `${fixed(mg(), 1)} N`],
      ['Along the slope, mg sin θ', () => `${fixed(mg() * Math.sin(rad(state.th)), 1)} N`],
      ['Into the slope, mg cos θ', () => `${fixed(mg() * Math.cos(rad(state.th)), 1)} N`],
      ['Check: √(sum of squares)', () => `${fixed(Math.hypot(mg() * Math.sin(rad(state.th)), mg() * Math.cos(rad(state.th))), 1)} N`],
    ] },
  ],
  tex: () => `mg\\sin\\theta=(${state.m})(9.8)\\sin ${state.th}^\\circ=${fixed(mg() * Math.sin(rad(state.th)), 1)}\\ \\text{N}`,
});
