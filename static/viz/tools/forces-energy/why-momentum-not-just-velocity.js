import { createTool } from '../../lib/tool.js';
import { bars } from '../../lib/quick.js';
import { sig } from '../../lib/format.js';

const OBJ = [['car', 1000, 20], ['truck', 5000, 20], ['slow bullet', 0.01, 100], ['fast bullet', 0.01, 400]];
const state = { F: 5000 };

createTool({
  state,
  label: 'Two sets of bars: the momentum of each object, and the time each takes to stop under the same steady force.',
  draw(ctx, stage, c) {
    const sub = { w: stage.w, h: stage.h / 2 };
    const p = OBJ.map(([, m, v]) => m * v);
    bars(ctx, sub, c, OBJ.map(([n], i) => [n, p[i], c.fillB, sig(p[i], 3)]), { max: Math.max(...p), top: 14, gap: 6, left: 0.3 });
    ctx.save();
    ctx.translate(0, stage.h / 2);
    bars(ctx, sub, c, OBJ.map(([n], i) => [n, p[i] / state.F, c.fillA, `${sig(p[i] / state.F, 3)} s`]), { max: Math.max(...p) / state.F, top: 14, gap: 6, left: 0.3 });
    ctx.restore();
  },
  controls: [
    { title: 'Stop them' },
    { key: 'F', label: 'Stopping force F (N)', min: 1000, max: 20000, step: 1000 },
    { readout: OBJ.map(([n, m, v]) => [`${n} (${m} kg, ${v} m/s)`, (s) => `p = ${sig(m * v, 3)}, stops in ${sig((m * v) / s.F, 3)} s`]) },
  ],
  tex: (s) => `t=\\dfrac{p}{F}=\\dfrac{mv}{${s.F}}`,
});
