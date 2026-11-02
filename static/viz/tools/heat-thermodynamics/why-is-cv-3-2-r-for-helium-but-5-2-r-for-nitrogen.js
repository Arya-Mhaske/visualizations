import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { GASES, cvOf, R } from './_equipartition.js';
import { fixed } from '../../lib/format.js';

const state = { pick: 3, vib: false };
const f = (g, s) => (s.vib ? g.fv : g.f);

createTool({
  state,
  label: 'For six gases, a filled bar shows the measured molar heat capacity at constant volume and an outline shows the value predicted from counting degrees of freedom. Atoms match three halves R. Diatomic gases match five halves R when vibration is left out and overshoot when it is counted.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const base = H * 0.84;
    const unit = (H * 0.7) / 32;
    const bw = (W * 0.86) / GASES.length;
    line(ctx, W * 0.05, base, W * 0.97, base, { color: c.ink, width: 3 });
    GASES.forEach((g, i) => {
      const x = W * 0.07 + i * bw;
      ctx.fillStyle = i === state.pick ? c.fillA : c.fillY;
      ctx.fillRect(x, base - g.cv * unit, bw - 8, g.cv * unit);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = i === state.pick ? 4 : 2;
      ctx.strokeRect(x, base - cvOf(f(g, state)) * unit, bw - 8, cvOf(f(g, state)) * unit);
      label(ctx, g.name, x + (bw - 8) / 2, base + 14, c, { size: 12, bounds: stage, patch: false });
      label(ctx, fixed(g.cv, 1), x + (bw - 8) / 2, base - g.cv * unit - 10, c, { size: 10, bounds: stage, patch: false });
    });
    label(ctx, 'J/mol·K: filled = measured, outline = predicted', W * 0.5, H * 0.05, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Count the degrees of freedom' },
    { key: 'pick', label: 'Gas', options: GASES.map((g, i) => [i, g.name]) },
    { key: 'vib', label: 'Count vibration too', toggle: true },
    { readout: [
      ['Degrees of freedom f', (s) => f(GASES[s.pick], s)],
      ['Predicted ½ f R', (s) => `${fixed(cvOf(f(GASES[s.pick], s)), 2)} J/mol·K`],
      ['Measured', (s) => `${fixed(GASES[s.pick].cv, 1)} J/mol·K`],
      ['Difference', (s) => `${fixed(((cvOf(f(GASES[s.pick], s)) - GASES[s.pick].cv) / GASES[s.pick].cv) * 100, 0)} %`],
    ] },
  ],
  tex: (s) => `C_v=\\dfrac{f}{2}R=\\dfrac{${f(GASES[s.pick], s)}}{2}\\times ${R}=${fixed(cvOf(f(GASES[s.pick], s)), 1)}\\ \\mathrm{J/mol\\,K}`,
});
