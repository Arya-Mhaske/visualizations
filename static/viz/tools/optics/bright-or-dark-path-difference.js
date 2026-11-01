import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { brightCount, classify, twoWave } from './_interference-math.js';

// World units are wavelengths. The sources sit on the left edge, d apart; the screen region extends right.
const state = { d: 4, X: 8, Y: 2.4 };
const W = 14;
const H = 16;
const dist = (s, sign) => Math.hypot(s.X, s.Y - sign * (s.d / 2));
const delta = (s) => dist(s, -1) - dist(s, 1); // path to the lower source minus path to the upper source

function verdict(s) {
  const k = classify(delta(s), 1);
  if (k.kind === 'bright') return { text: `bright, order ${k.order}`, good: true };
  if (k.kind === 'dark') return { text: `dark, ${k.order + 1}${['st', 'nd', 'rd'][k.order] || 'th'} dark band`, good: false };
  return 'in between';
}

const tool = createTool({
  state,
  label: 'A map of two sources on the left edge, with the plane to their right shaded coral where the two waves add and left white where they cancel. Two lines run from the sources to a chosen point. The path difference in wavelengths is shown, and the point is bright if it is a whole number and dark if it is a half number.',
  draw(ctx, stage, c) {
    const k = Math.min((stage.w - 12) / W, (stage.h - 12) / H);
    const ox = 6;
    const oy = stage.h / 2;
    const to = (x, y) => [ox + x * k, oy - y * k];
    const cell = 6;
    for (let px = 0; px < W * k; px += cell) {
      for (let py = 0; py < stage.h; py += cell) {
        const x = (px + cell / 2) / k;
        const y = (oy - (py + cell / 2)) / k;
        const dl = Math.hypot(x, y + state.d / 2) - Math.hypot(x, y - state.d / 2);
        ctx.globalAlpha = (twoWave(dl, 1) / 4) * 0.8;
        ctx.fillStyle = c.a;
        ctx.fillRect(ox + px, py, cell, cell);
      }
    }
    ctx.globalAlpha = 1;
    const [sx, s1] = to(0, state.d / 2);
    const [, s2] = to(0, -state.d / 2);
    const [pxx, pyy] = to(state.X, state.Y);
    line(ctx, sx, s1, pxx, pyy, { color: c.ink, width: 2 });
    line(ctx, sx, s2, pxx, pyy, { color: c.b, width: 2 });
    dot(ctx, sx, s1, 6, c.fillY, c.ink, 2);
    dot(ctx, sx, s2, 6, c.fillY, c.ink, 2);
    dot(ctx, pxx, pyy, 8, c.c, c.ink);
    label(ctx, 'P', pxx + 14, pyy - 12, c, { size: 12, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Place the point' },
    { key: 'X', label: 'P across, from the sources', min: 2, max: 13, step: 0.1, format: (n) => `${fixed(n, 1)} λ` },
    { key: 'Y', label: 'P up or down', min: -7, max: 7, step: 0.1, format: (n) => `${fixed(n, 1)} λ` },
    { key: 'd', label: 'Source gap, d', min: 1, max: 6, step: 0.5, format: (n) => `${fixed(n, 1)} λ` },
    { readout: [
      ['Upper path', (s) => `${fixed(dist(s, 1), 2)} λ`],
      ['Lower path', (s) => `${fixed(dist(s, -1), 2)} λ`],
      ['Path difference, Δ', (s) => `${fixed(Math.abs(delta(s)), 2)} λ`],
      ['So', verdict],
      ['Bright bands possible', (s) => String(brightCount(s.d, 1))],
    ] },
  ],
  tex: (s) => `\\Delta=${fixed(dist(s, -1), 2)}\\lambda-${fixed(dist(s, 1), 2)}\\lambda=${fixed(Math.abs(delta(s)), 2)}\\lambda`,
});

tool.update();
