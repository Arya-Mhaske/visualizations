import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { ALPHAS } from './_expansion-math.js';

const state = { mat: 'steel', L: 10, dT: 40 };
const alpha = (s) => ALPHAS[s.mat][1];
const dL = (s) => alpha(s) * s.L * s.dT;

createTool({
  state,
  label: 'A rod drawn at its original length with the extra length after heating added at the right end in a different colour. The extra length is enlarged so it can be seen.',
  draw(ctx, stage, c) {
    const [x0, w] = [16, stage.w - 32];
    const f = dL(state) / state.L;
    const boost = Math.min(0.3 / Math.max(f, 1e-9), 5000);
    const extra = Math.min(w * 0.3, f * boost * w * 0.7);
    const y = stage.h * 0.4;
    poly(ctx, [[x0, y], [x0 + w * 0.7, y], [x0 + w * 0.7, y + 30], [x0, y + 30]], { fill: c.fillB, stroke: c.ink });
    poly(ctx, [[x0 + w * 0.7, y], [x0 + w * 0.7 + extra, y], [x0 + w * 0.7 + extra, y + 30], [x0 + w * 0.7, y + 30]], { fill: c.a, stroke: c.ink });
    label(ctx, `growth enlarged ×${sig(boost, 2)}`, stage.w / 2, y + 60, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `ΔL = ${sig(dL(state) * 1000, 3)} mm`, stage.w / 2, y - 24, c, { size: 14, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Heat the rod' },
    { key: 'mat', label: 'Material', options: Object.entries(ALPHAS).map(([k, v]) => [k, v[0]]) },
    { key: 'L', label: 'Length L (m)', min: 1, max: 100, step: 1 },
    { key: 'dT', label: 'Temperature rise ΔT (K)', min: 10, max: 200, step: 10 },
    { readout: [
      ['α (per K)', (s) => sig(alpha(s), 3)],
      ['ΔL = αLΔT', (s) => `${sig(dL(s) * 1000, 3)} mm`],
      ['ΔA / A = 2αΔT', (s) => sig(2 * alpha(s) * s.dT, 3)],
      ['ΔV / V = 3αΔT', (s) => sig(3 * alpha(s) * s.dT, 3)],
    ] },
  ],
  tex: (s) => `\\Delta L=\\alpha L\\Delta T=${sig(alpha(s), 3)}\\times${s.L}\\times${s.dT}=${sig(dL(s) * 1000, 3)}\\ \\mathrm{mm}`,
});
