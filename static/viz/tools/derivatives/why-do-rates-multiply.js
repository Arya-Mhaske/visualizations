import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line, TAU } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { ab: 3, bc: 2, turns: 1 };

createTool({
  state,
  label: 'Three wheels, C, B and A. Wheel B turns bc times for each turn of C, and wheel A turns ab times for each turn of B. So A turns ab times bc times for each turn of C: the rates multiply.',
  draw(ctx, stage, c) {
    const r = Math.min(stage.w * 0.11, stage.h * 0.28);
    const y = stage.h * 0.46;
    const wheels = [
      ['C', 0.17, c.fillC, 1],
      ['B', 0.5, c.fillB, state.bc],
      ['A', 0.83, c.fillA, state.ab * state.bc],
    ];
    wheels.forEach(([name, at, fill, rate]) => {
      const x = stage.w * at;
      const angle = -Math.PI / 2 + TAU * state.turns * rate;
      dot(ctx, x, y, r, fill, c.ink);
      for (let k = 1; k < 4; k++) {
        const a = angle + (k * TAU) / 4;
        line(ctx, x, y, x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, { color: c.grid, width: 2 });
      }
      line(ctx, x, y, x + Math.cos(angle) * r, y + Math.sin(angle) * r, { color: c.a, width: 5 });
      dot(ctx, x, y, 4, c.ink, c.ink, 1);
      label(ctx, name, x, y - r - 14, c, { size: 14, bounds: stage });
      label(ctx, `${fixed(state.turns * rate, 2)} turns`, x, y + r + 16, c, { size: 11, bounds: stage });
    });
    [[0.17, 0.5, `×${fixed(state.bc, 1)}`], [0.5, 0.83, `×${fixed(state.ab, 1)}`]].forEach(([p, q, text]) => {
      const x1 = stage.w * p + r + 4;
      const x2 = stage.w * q - r - 4;
      arrow(ctx, x1, y, x2, y, { color: c.ink, width: 3, head: 8 });
      label(ctx, text, (x1 + x2) / 2, y - 14, c, { size: 11, bounds: stage });
    });
    label(ctx, `A turns ${fixed(state.ab * state.bc, 2)} times for every turn of C`, stage.w / 2, stage.h * 0.92, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Three wheels' },
    { key: 'turns', label: 'Turn C by', min: 0, max: 2, step: 0.05, format: (n) => `${fixed(n, 2)} turns` },
    { key: 'bc', label: 'B turns per turn of C', min: 1, max: 5, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'ab', label: 'A turns per turn of B', min: 1, max: 5, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['B per C', (s) => fixed(s.bc, 1)],
      ['A per B', (s) => fixed(s.ab, 1)],
      ['A per C', (s) => ({ text: fixed(s.ab * s.bc, 2), good: true })],
    ] },
  ],
  tex: (s) => `\\dfrac{dA}{dC}=\\dfrac{dA}{dB}\\cdot\\dfrac{dB}{dC}=${fixed(s.ab, 1)}\\times${fixed(s.bc, 1)}=${fixed(s.ab * s.bc, 2)}`,
});
