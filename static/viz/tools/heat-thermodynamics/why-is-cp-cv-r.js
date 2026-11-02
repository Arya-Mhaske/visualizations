import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const R = 8.314;
const state = { dT: 20, f: 3 };
const Cv = (s) => (s.f / 2) * R;

createTool({
  state,
  label: 'Two bars for warming one mole of gas by the same temperature rise. In a rigid box all the heat becomes internal energy. At constant pressure the gas also pushes its piston out, so the heat needed is larger by the work. The extra work equals R times the temperature rise.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const base = H * 0.84;
    const unit = (H * 0.64) / (3.5 * R * 50);
    const dU = Cv(state) * state.dT;
    const work = R * state.dT;
    const [x1, x2, bw] = [W * 0.14, W * 0.58, W * 0.24];
    line(ctx, W * 0.06, base, W * 0.96, base, { color: c.ink, width: 3 });
    const box = (x, y, h, fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, bw, h);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, bw, h);
    };
    box(x1, base - dU * unit, dU * unit, c.fillA);
    box(x2, base - dU * unit, dU * unit, c.fillA);
    box(x2, base - (dU + work) * unit, work * unit, c.fillB);
    label(ctx, 'ΔU', x1 + bw / 2, base - (dU * unit) / 2, c, { size: 12, bounds: stage, patch: false });
    label(ctx, 'ΔU', x2 + bw / 2, base - (dU * unit) / 2, c, { size: 12, bounds: stage, patch: false });
    label(ctx, 'PΔV = RΔT', x2 + bw / 2, base - (dU + work / 2) * unit, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `Q_V = ${fixed(dU, 0)} J`, x1 + bw / 2, base - dU * unit - 12, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `Q_P = ${fixed(dU + work, 0)} J`, x2 + bw / 2, base - (dU + work) * unit - 12, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'rigid box', x1 + bw / 2, base + 16, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'free piston', x2 + bw / 2, base + 16, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Warm 1 mole of gas' },
    { key: 'dT', label: 'Temperature rise ΔT (K)', min: 5, max: 50, step: 5 },
    { key: 'f', label: 'Gas', options: [[3, 'Monatomic'], [5, 'Diatomic']] },
    { readout: [
      ['Cᵥ', (s) => `${fixed(Cv(s), 2)} J/mol·K`],
      ['Cₚ', (s) => `${fixed(Cv(s) + R, 2)} J/mol·K`],
      ['Cₚ − Cᵥ', (s) => `${fixed(R, 3)} J/mol·K`],
      ['γ = Cₚ/Cᵥ', (s) => fixed((Cv(s) + R) / Cv(s), 3)],
    ] },
  ],
  tex: (s) => `C_p-C_v=\\dfrac{Q_P-Q_V}{n\\,\\Delta T}=\\dfrac{P\\,\\Delta V}{\\Delta T}=\\dfrac{R\\,\\Delta T}{\\Delta T}=R=8.314`,
});
