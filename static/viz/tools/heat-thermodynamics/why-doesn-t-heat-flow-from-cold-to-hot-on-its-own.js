import { createTool } from '../../lib/tool.js';
import { arrow, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// Move Qc out of a cold place at Tc into a hot place at Th, using work W. Q_h = Qc + W. Disorder (entropy) change = Q_h/Th − Qc/Tc must not be negative.
const state = { Tc: 270, Th: 300, Qc: 500, W: 0 };
const Qh = (s) => s.Qc + s.W;
const dS = (s) => Qh(s) / s.Th - s.Qc / s.Tc;
const Wmin = (s) => s.Qc * (s.Th / s.Tc - 1);

createTool({
  state,
  label: 'A cold place on the left and a hot place on the right. An arrow shows heat taken out of the cold place and a second arrow shows heat delivered to the hot place, with work added from below. A ledger of heat divided by temperature must not fall. With no work added the ledger falls, so the move is not allowed.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const wd = (v) => 3 + (v / 1500) * 22;
    ctx.fillStyle = c.fillB;
    ctx.fillRect(W * 0.04, H * 0.1, W * 0.26, H * 0.5);
    ctx.fillStyle = c.fillA;
    ctx.fillRect(W * 0.7, H * 0.1, W * 0.26, H * 0.5);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(W * 0.04, H * 0.1, W * 0.26, H * 0.5);
    ctx.strokeRect(W * 0.7, H * 0.1, W * 0.26, H * 0.5);
    label(ctx, `cold ${state.Tc} K`, W * 0.17, H * 0.35, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `hot ${state.Th} K`, W * 0.83, H * 0.35, c, { size: 12, bounds: stage, patch: false });
    arrow(ctx, W * 0.3, H * 0.22, W * 0.68, H * 0.22, { color: c.b, width: wd(state.Qc), head: 16 });
    label(ctx, `Q out of cold ${fixed(state.Qc, 0)}`, W * 0.5, H * 0.14, c, { size: 11, bounds: stage, patch: false });
    if (state.W > 0) {
      arrow(ctx, W * 0.5, H * 0.9, W * 0.5, H * 0.34, { color: c.a, width: wd(state.W), head: 16 });
      label(ctx, `work in ${fixed(state.W, 0)}`, W * 0.5, H * 0.95, c, { size: 11, bounds: stage, patch: false });
      arrow(ctx, W * 0.5, H * 0.3, W * 0.68, H * 0.3, { color: c.ink, width: wd(state.W) / 2 + 2, head: 12 });
    }
    label(ctx, `Q into hot ${fixed(Qh(state), 0)}`, W * 0.83, H * 0.7, c, { size: 11, bounds: stage, patch: false });
    label(ctx, dS(state) >= -1e-9 ? 'allowed' : 'NOT allowed', W * 0.5, H * 0.58, c, { size: 14, bounds: stage });
  },
  controls: [
    { title: 'Move heat uphill' },
    { key: 'Qc', label: 'Heat taken from cold (J)', min: 100, max: 1000, step: 100 },
    { key: 'W', label: 'Work put in (J)', min: 0, max: 1000, step: 50 },
    { key: 'Tc', label: 'Cold temperature (K)', min: 200, max: 290, step: 10 },
    { key: 'Th', label: 'Hot temperature (K)', min: 300, max: 400, step: 10 },
    { readout: [
      ['Q out of cold ÷ T_c', (s) => `${fixed(-s.Qc / s.Tc, 3)} J/K`],
      ['Q into hot ÷ T_h', (s) => `${fixed(Qh(s) / s.Th, 3)} J/K`],
      ['Ledger total', (s) => ({ text: `${fixed(dS(s), 3)} J/K`, good: dS(s) >= -1e-9 })],
      ['Least work needed', (s) => `${fixed(Wmin(s), 0)} J`],
    ] },
  ],
  tex: (s) => `\\Delta S=\\dfrac{Q_h}{T_h}-\\dfrac{Q_c}{T_c}=\\dfrac{${fixed(Qh(s), 0)}}{${s.Th}}-\\dfrac{${fixed(s.Qc, 0)}}{${s.Tc}}=${fixed(dS(s), 3)}`,
});
