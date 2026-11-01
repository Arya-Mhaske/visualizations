import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { rad, singleSine } from './_identities-math.js';

const state = { M: 3, N: 2, t: 40 };
const T = 2 * Math.PI;
const bottom = (stage) => ({ x: 0, y: stage.h * 0.5, w: stage.w, h: stage.h * 0.5 });
const tip = (len, angle) => [len * Math.cos(rad(angle)), len * Math.sin(rad(angle))];

createTool({
  state,
  label: 'Top: two arrows turning together, one of length M, and one of length N that stays a quarter-turn ahead of it. Placed tip to tail they make a third arrow of constant length root of M squared plus N squared. Bottom: the heights of the arrows over time. M sin t is coral, N cos t is blue, and their sum is a single sine wave in green.',
  setup: (stage, c) => createPlot(stage, { x: [0, T], y: [-6, 6], ticks: 'pi', c, box: bottom }),
  draw(ctx, stage, c, plot) {
    const { M, N, t } = state;
    const { R, phi } = singleSine(M, N);
    const k = Math.min(stage.h * 0.24, stage.w * 0.42) / 7.1 / 1.9;
    const O = [stage.w * 0.5, stage.h * 0.26];
    const px = ([x, y]) => [O[0] + x * k * 1.9, O[1] - y * k * 1.9];
    line(ctx, O[0] - 6.4 * k * 1.9, O[1], O[0] + 6.4 * k * 1.9, O[1], { color: c.grid, width: 1 });
    line(ctx, O[0], O[1] - 6.2 * k * 1.9, O[0], O[1] + 6.2 * k * 1.9, { color: c.grid, width: 1 });
    const a = px(tip(M, t));
    const b = px([tip(M, t)[0] + tip(N, t + 90)[0], tip(M, t)[1] + tip(N, t + 90)[1]]);
    arrow(ctx, ...O, ...a, { color: c.a, width: 4 });
    arrow(ctx, ...a, ...b, { color: c.b, width: 4 });
    arrow(ctx, ...O, ...b, { color: c.c, width: 5 });
    line(ctx, ...b, b[0], O[1], { color: c.grid, width: 2, dash: [4, 4] });
    dot(ctx, ...b, 5, c.c, c.ink);
    label(ctx, `M = ${M}`, (O[0] + a[0]) / 2 + 12, (O[1] + a[1]) / 2 + 12, c, { size: 11, color: c.a, bounds: stage, patch: false });
    label(ctx, `N = ${N}`, (a[0] + b[0]) / 2 + 12, (a[1] + b[1]) / 2, c, { size: 11, color: c.b, bounds: stage, patch: false });
    label(ctx, `R = ${fixed(R, 2)}`, b[0] - 8, b[1] - 12, c, { size: 11, color: c.c, bounds: stage, patch: false });
    plot.axes({ xLabel: 't', yLabel: '' });
    plot.fn((x) => M * Math.sin(x), { color: c.a, width: 2 });
    plot.fn((x) => N * Math.cos(x), { color: c.b, width: 2 });
    plot.fn((x) => R * Math.sin(x + rad(phi)), { color: c.c, width: 7 });
    plot.fn((x) => M * Math.sin(x) + N * Math.cos(x), { color: c.ink, width: 2, dash: [3, 4] });
  },
  controls: [
    { title: 'Add two waves' },
    { key: 'M', label: 'M (the sine part)', min: 0, max: 5, step: 0.5 },
    { key: 'N', label: 'N (the cosine part)', min: 0, max: 5, step: 0.5 },
    { key: 't', label: 'Time, t as an angle', min: 0, max: 360, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['R = √(M² + N²)', (s) => fixed(singleSine(s.M, s.N).R, 3)],
      ['Phase, φ', (s) => `${fixed(singleSine(s.M, s.N).phi, 1)}°`],
    ] },
  ],
  tex: (s) => `${s.M}\\sin t+${s.N}\\cos t=${fixed(singleSine(s.M, s.N).R, 3)}\\sin(t+${fixed(singleSine(s.M, s.N).phi, 1)}^\\circ)`,
});
