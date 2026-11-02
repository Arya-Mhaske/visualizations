import { createTool } from '../../lib/tool.js';
import { line, poly, label } from '../../lib/draw.js';
import { box } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { m: 10, x: 12, p: 45 };
const M = (s) => (s.m * (s.p - s.x)) / (50 - s.p);

createTool({
  state,
  label: 'A metre stick resting on a pivot at the chosen balance point with a pair of coins at the 12 centimetre mark. The stick mass is found from the balance.',
  draw(ctx, stage, c) {
    const [x0, w, y] = [20, stage.w - 40, stage.h * 0.5];
    const X = (v) => x0 + (v / 100) * w;
    line(ctx, X(0), y, X(100), y, { color: c.ink, width: 8 });
    for (let v = 0; v <= 100; v += 20) label(ctx, String(v), X(v), y - 20, c, { size: 10, patch: false });
    poly(ctx, [[X(state.p) - 14, y + 40], [X(state.p) + 14, y + 40], [X(state.p), y + 5]], { fill: c.fillC, stroke: c.ink });
    box(ctx, c, X(state.x) - 10, y - 18, 20, 12, c.fillA);
    label(ctx, '50 cm: centre of the stick', X(50), y + 60, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `stick mass ${fixed(M(state), 1)} g`, stage.w / 2, 22, c, { size: 14, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Coins on the stick' },
    { key: 'm', label: 'Coins\' total mass (g)', min: 2, max: 30, step: 1 },
    { key: 'x', label: 'Coins at (cm)', min: 0, max: 40, step: 1 },
    { key: 'p', label: 'Stick balances at (cm)', min: 41, max: 49, step: 0.5 },
    { readout: [
      ['Coin arm', (s) => `${fixed(s.p - s.x, 1)} cm`],
      ['Stick arm', (s) => `${fixed(50 - s.p, 1)} cm`],
      ['Stick mass', (s) => `${fixed(M(s), 1)} g`],
    ] },
  ],
  tex: (s) => `M=\\dfrac{m(p-x)}{50-p}=\\dfrac{${s.m}\\times${s.p - s.x}}{${50 - s.p}}=${fixed(M(s), 1)}\\ \\mathrm{g}`,
});
