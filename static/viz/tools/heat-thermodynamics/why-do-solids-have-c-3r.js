import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { METALS, R } from './_equipartition.js';
import { fixed } from '../../lib/format.js';

const state = { view: 'mole' };
const value = (m, view) => (view === 'mole' ? m.c * m.M : m.c);
const top = (view) => (view === 'mole' ? 32 : 1.0);
const spread = (view) => Math.max(...METALS.map((m) => value(m, view))) / Math.min(...METALS.map((m) => value(m, view)));

createTool({
  state,
  label: 'Bars for the heat capacity of six metals. Per gram the bars are very different. Per mole, which counts atoms, all six are close to 3R, about 25 joules per mole kelvin.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const base = H * 0.84;
    const unit = (H * 0.7) / top(state.view);
    const bw = (W * 0.86) / METALS.length;
    line(ctx, W * 0.05, base, W * 0.97, base, { color: c.ink, width: 3 });
    METALS.forEach((m, i) => {
      const x = W * 0.07 + i * bw;
      const v = value(m, state.view);
      ctx.fillStyle = c.fillB;
      ctx.fillRect(x, base - v * unit, bw - 8, v * unit);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, base - v * unit, bw - 8, v * unit);
      label(ctx, m.name, x + (bw - 8) / 2, base + 14, c, { size: 12, bounds: stage, patch: false });
      label(ctx, fixed(v, state.view === 'mole' ? 1 : 3), x + (bw - 8) / 2, base - v * unit - 10, c, { size: 10, bounds: stage, patch: false });
    });
    if (state.view === 'mole') {
      line(ctx, W * 0.05, base - 3 * R * unit, W * 0.97, base - 3 * R * unit, { color: c.a, width: 3, dash: [6, 5] });
      label(ctx, '3R = 24.9', W * 0.95, base - 3 * R * unit - 10, c, { size: 11, color: c.a, align: 'right', bounds: stage, patch: false });
    }
    label(ctx, state.view === 'mole' ? 'J per mol·K' : 'J per g·K', W * 0.5, H * 0.05, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Per gram or per mole' },
    { key: 'view', label: 'Heat capacity per', options: [['gram', 'Gram'], ['mole', 'Mole']] },
    { readout: [
      ['Highest ÷ lowest', (s) => `${fixed(spread(s.view), 2)} ×`],
      ['3R', () => `${fixed(3 * R, 1)} J/mol·K`],
    ] },
  ],
  tex: () => `C=3R:\\quad 3\\ \\text{kinetic}+3\\ \\text{potential terms}\\times\\tfrac12 kT=3kT\\ \\text{per atom}`,
});
