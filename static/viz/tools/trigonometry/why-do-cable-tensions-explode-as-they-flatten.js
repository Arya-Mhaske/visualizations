import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { arrowW, eqFrame, rad, segW } from './_kit.js';

const state = { phi: 30, W: 500 };
const tension = (phi = state.phi) => state.W / (2 * Math.sin(rad(phi)));

createTool({
  state,
  label: 'Top: a sign hanging from two cables fixed to posts at the same height, with the force arrows at the sign. Bottom: the tension in each cable against the angle the cables make with the horizontal. As the cables get flatter the tension climbs steeply without limit.',
  setup: (stage, c) => createPlot(stage, { x: [0, 60], y: [0, 6000], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.55, w: g.w, h: g.h * 0.45 }) }),
  draw(ctx, stage, c, plot) {
    const top = { w: stage.w, h: stage.h * 0.55 };
    const f = eqFrame(top, [-4.4, 4.4], [-5.8, 1], 6);
    const sag = 3 * Math.tan(rad(state.phi));
    const S = [0, -sag];
    [-3, 3].forEach((x) => {
      poly(ctx, [f.px([x - 0.15, 1]), f.px([x + 0.15, 1]), f.px([x + 0.15, -5.8]), f.px([x - 0.15, -5.8])], { fill: c.fillB, stroke: c.ink, width: 2 });
    });
    segW(ctx, f, [-3, 0], S, { color: c.ink, width: 3 });
    segW(ctx, f, [3, 0], S, { color: c.ink, width: 3 });
    poly(ctx, [f.px([-0.7, -sag]), f.px([0.7, -sag]), f.px([0.7, -sag - 0.6]), f.px([-0.7, -sag - 0.6])], { fill: c.fillY, stroke: c.ink, width: 3 });
    const k = 0.7 / state.W; // units of arrow per newton, scaled
    const dirL = [-Math.cos(rad(state.phi)), Math.sin(rad(state.phi))];
    const dirR = [Math.cos(rad(state.phi)), Math.sin(rad(state.phi))];
    const t = Math.min(tension() * k, 3.3);
    arrowW(ctx, f, S, [S[0] + dirL[0] * t, S[1] + dirL[1] * t], { color: c.a, width: 5, head: 11 });
    arrowW(ctx, f, S, [S[0] + dirR[0] * t, S[1] + dirR[1] * t], { color: c.a, width: 5, head: 11 });
    arrowW(ctx, f, [0, -sag - 0.3], [0, -sag - 0.3 - state.W * k], { color: c.b, width: 5, head: 11 });
    label(ctx, `T = ${fixed(tension(), 0)} N`, f.px([-2.4, 0])[0], f.px([0, 0.6])[1], c, { size: 11, color: c.a, bounds: stage, patch: false });
    label(ctx, `W = ${state.W} N`, f.px([0.3, -sag - 0.9])[0] + 38, f.px([0, -sag - 0.9])[1], c, { size: 11, color: c.b, bounds: stage, patch: false });
    label(ctx, `φ = ${state.phi}°`, f.px([-1.3, -sag * 0.4])[0], f.px([0, -sag * 0.4])[1] - 10, c, { size: 11, bounds: stage, patch: false });
    plot.axes({ xLabel: 'φ (°)', yLabel: 'T (N)' });
    plot.fn((p) => Math.min(6000, tension(p)), { color: c.a, width: 4, domain: [2, 60] });
    plot.point(state.phi, Math.min(6000, tension()), { fill: c.a });
  },
  controls: [
    { title: 'Hang the sign' },
    { key: 'phi', label: 'Cable angle, φ', min: 3, max: 60, step: 1, format: (n) => `${n}°` },
    { key: 'W', label: 'Weight, W', min: 100, max: 1000, step: 50, format: (n) => `${n} N` },
    { readout: [
      ['Tension in each cable', () => `${fixed(tension(), 0)} N`],
      ['Tension ÷ weight', () => fixed(tension() / state.W, 2)],
      ['Sag below the posts', () => `${fixed(3 * Math.tan(rad(state.phi)), 2)} m`],
    ] },
  ],
  tex: () => `2T\\sin\\varphi=W\\ \\Rightarrow\\ T=\\dfrac{W}{2\\sin\\varphi}=\\dfrac{${state.W}}{2\\sin ${state.phi}^\\circ}=${fixed(tension(), 0)}\\ \\text{N}`,
});
