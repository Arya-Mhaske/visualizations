import { createTool } from '../../lib/tool.js';
import { poly, dot, label } from '../../lib/draw.js';
import { sig, fixed } from '../../lib/format.js';
import { pressureWork, surfaceGain, dropExcess, bubbleExcess } from './_surface-tension-math.js';

const S = { drop: 0.072, bubble: 0.025 };
const state = { kind: 'drop', r: 2, dP: 20 };
const rm = (s) => s.r / 1000;
const DR = 1e-4;
const work = (s) => pressureWork(s.dP, rm(s), DR);
const gain = (s) => surfaceGain(S[s.kind], s.kind === 'drop' ? 1 : 2, rm(s), DR);
const exact = (s) => (s.kind === 'drop' ? dropExcess(S.drop, rm(s)) : bubbleExcess(S.bubble, rm(s)));

createTool({
  state,
  label: 'A drop or bubble drawn above two bars. One bar is the work done by the pressure when the drop grows a little, the other is the surface energy gained. The bars are equal only at the right pressure.',
  draw(ctx, stage, c) {
    const rr = 14 + state.r * 6;
    dot(ctx, stage.w / 2, stage.h * 0.22, rr, state.kind === 'drop' ? c.fillB : c.fillC, c.ink);
    if (state.kind === 'bubble') dot(ctx, stage.w / 2, stage.h * 0.22, rr - 7, c.paper, c.ink, 2);
    const top = Math.max(work(state), gain(state), 1e-12);
    const [x0, bw] = [stage.w * 0.28, stage.w * 0.66];
    [['pressure work', work(state), c.a], ['surface energy', gain(state), c.c]].forEach(([name, v, col], i) => {
      const y = stage.h * 0.5 + i * 44;
      const w = bw * (v / top);
      poly(ctx, [[x0, y], [x0 + w, y], [x0 + w, y + 28], [x0, y + 28]], { fill: col, stroke: c.ink });
      label(ctx, name, x0 - 8, y + 14, c, { size: 11, align: 'right', patch: false });
    });
    const ok = Math.abs(work(state) - gain(state)) < gain(state) * 0.02;
    label(ctx, ok ? 'balanced: no tendency to grow or shrink' : work(state) > gain(state) ? 'pressure wins: it grows' : 'surface wins: it shrinks', stage.w / 2, stage.h * 0.9, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Try a pressure' },
    { key: 'kind', label: 'Object', options: [['drop', 'Drop (1 surface)'], ['bubble', 'Soap bubble (2)']] },
    { key: 'r', label: 'Radius r (mm)', min: 1, max: 10, step: 0.5 },
    { key: 'dP', label: 'Trial excess pressure ΔP (Pa)', min: 0, max: 150, step: 1 },
    { readout: [
      ['Pressure work', (s) => `${sig(work(s) * 1e9, 3)} nJ`],
      ['Surface energy gained', (s) => `${sig(gain(s) * 1e9, 3)} nJ`],
      ['Balance at ΔP =', (s) => `${fixed(exact(s), 1)} Pa`],
    ] },
  ],
  tex: (s) => (s.kind === 'drop' ? `\\Delta P=\\dfrac{2S}{r}=${fixed(exact(s), 1)}\\ \\mathrm{Pa}` : `\\Delta P=\\dfrac{4S}{r}=${fixed(exact(s), 1)}\\ \\mathrm{Pa}`),
});
