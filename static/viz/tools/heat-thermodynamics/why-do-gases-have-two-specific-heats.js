import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { cv, cp, heatGas, workGas } from './_heat-capacity-math.js';

const state = { f: 3, n: 1, dT: 50, proc: 'V' };
const Q = (s) => heatGas(s.f, s.n, s.dT, s.proc);
const W = (s) => workGas(s.n, s.dT, s.proc);

createTool({
  state,
  label: 'A cylinder with a piston and a bar showing the heat supplied. The bar splits into the part that raises internal energy and the part that does work on the piston, which is zero at constant volume.',
  draw(ctx, stage, c) {
    const [x0, y0, w, h] = [stage.w * 0.3, 14, stage.w * 0.4, stage.h * 0.4];
    const rise = Math.min(1, W(state) / 2000) * 30;
    poly(ctx, [[x0, y0 + h], [x0, y0], [x0 + w, y0], [x0 + w, y0 + h]], { stroke: c.ink, closed: false });
    poly(ctx, [[x0, y0 + h * 0.5 - rise], [x0 + w, y0 + h * 0.5 - rise], [x0 + w, y0 + h * 0.5 - rise + 10], [x0, y0 + h * 0.5 - rise + 10]], { fill: state.proc === 'V' ? c.ink : c.a, stroke: c.ink });
    label(ctx, state.proc === 'V' ? 'piston locked' : 'piston free: rises', stage.w / 2, y0 + h + 14, c, { size: 11, patch: false });
    const [bx, by, bw] = [16, stage.h * 0.68, stage.w - 32];
    const total = heatGas(5, 3, 100, 'P');
    const wU = ((Q(state) - W(state)) / total) * bw;
    const wW = (W(state) / total) * bw;
    poly(ctx, [[bx, by], [bx + wU, by], [bx + wU, by + 26], [bx, by + 26]], { fill: c.b, stroke: c.ink });
    if (wW > 0) poly(ctx, [[bx + wU, by], [bx + wU + wW, by], [bx + wU + wW, by + 26], [bx + wU, by + 26]], { fill: c.a, stroke: c.ink });
    label(ctx, `heat Q = ${fixed(Q(state), 0)} J: blue → ΔU, coral → work`, stage.w / 2, by + 46, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Heat a gas' },
    { key: 'f', label: 'Gas', options: [[3, 'Monatomic'], [5, 'Diatomic']] },
    { key: 'proc', label: 'Held at', options: [['V', 'Constant V'], ['P', 'Constant P']] },
    { key: 'n', label: 'Moles n', min: 1, max: 3, step: 1 },
    { key: 'dT', label: 'Temperature rise ΔT (K)', min: 10, max: 100, step: 10 },
    { readout: [
      ['Cv', (s) => `${fixed(cv(s.f), 2)} J/mol·K`],
      ['Cp = Cv + R', (s) => `${fixed(cp(s.f), 2)} J/mol·K`],
      ['Heat needed', (s) => `${fixed(Q(s), 0)} J`],
      ['Work by gas', (s) => `${fixed(W(s), 0)} J`],
    ] },
  ],
  tex: (s) => `Q=n\\,C\\,\\Delta T=${fixed(Q(s), 0)}\\ \\mathrm{J}\\quad C_p-C_v=R`,
});
