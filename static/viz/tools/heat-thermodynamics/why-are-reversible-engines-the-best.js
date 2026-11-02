import { createTool } from '../../lib/tool.js';
import { arrow, label } from '../../lib/draw.js';
import { carnotEta } from './_engines.js';
import { fixed } from '../../lib/format.js';

// Engine X (claimed efficiency e) takes 1000 J from hot. Its work runs a reversed Carnot engine (a fridge) between the same two places.
const state = { Th: 600, Tc: 300, e: 40 };
const Q1 = 1000;
const calc = (s) => {
  const eC = carnotEta(s.Th, s.Tc);
  const w = (s.e / 100) * Q1;
  const toHot = w / eC; // heat the Carnot fridge delivers to hot
  return { eC, w, toHot, net: toHot - Q1, fromCold: toHot - w };
};

createTool({
  state,
  label: 'A hot place on top and a cold place below. A claimed engine takes 1000 joules from the hot place and gives work to a reversed Carnot engine. The reversed Carnot engine moves heat back up. If the claimed engine is better than Carnot, the pair moves heat from cold to hot with no outside work, which cannot happen.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const r = calc(state);
    const wd = (v) => 3 + (Math.abs(v) / 2500) * 22;
    ctx.fillStyle = c.fillA;
    ctx.fillRect(W * 0.05, H * 0.03, W * 0.9, H * 0.12);
    ctx.fillStyle = c.fillB;
    ctx.fillRect(W * 0.05, H * 0.85, W * 0.9, H * 0.12);
    label(ctx, `hot ${state.Th} K`, W * 0.5, H * 0.09, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `cold ${state.Tc} K`, W * 0.5, H * 0.91, c, { size: 12, bounds: stage, patch: false });
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(W * 0.12, H * 0.38, W * 0.26, H * 0.24);
    ctx.strokeRect(W * 0.62, H * 0.38, W * 0.26, H * 0.24);
    label(ctx, `engine X ${state.e}%`, W * 0.25, H * 0.5, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'Carnot reversed', W * 0.75, H * 0.5, c, { size: 11, bounds: stage, patch: false });
    arrow(ctx, W * 0.25, H * 0.15, W * 0.25, H * 0.38, { color: c.a, width: wd(Q1), head: 14 });
    arrow(ctx, W * 0.25, H * 0.62, W * 0.25, H * 0.85, { color: c.b, width: wd(Q1 - r.w), head: 14 });
    arrow(ctx, W * 0.38, H * 0.5, W * 0.62, H * 0.5, { color: c.ink, width: wd(r.w), head: 14 });
    label(ctx, `W ${fixed(r.w, 0)}`, W * 0.5, H * 0.45, c, { size: 11, bounds: stage, patch: false });
    arrow(ctx, W * 0.75, H * 0.85, W * 0.75, H * 0.62, { color: c.b, width: wd(r.fromCold), head: 14 });
    arrow(ctx, W * 0.75, H * 0.38, W * 0.75, H * 0.15, { color: c.a, width: wd(r.toHot), head: 14 });
    label(ctx, `${fixed(r.toHot, 0)} up`, W * 0.88, H * 0.27, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `${fixed(Q1, 0)} down`, W * 0.1, H * 0.27, c, { size: 11, bounds: stage, patch: false });
    label(ctx, r.net > 0.5 ? 'cold to hot, no work: impossible' : 'no contradiction', W * 0.5, H * 0.75, c, { size: 12, bounds: stage });
  },
  controls: [
    { title: 'Claim an engine' },
    { key: 'e', label: 'Claimed efficiency of X (%)', min: 10, max: 90, step: 5 },
    { key: 'Th', label: 'Hot temperature (K)', min: 400, max: 800, step: 50 },
    { key: 'Tc', label: 'Cold temperature (K)', min: 200, max: 350, step: 25 },
    { readout: [
      ['Carnot efficiency', (s) => `${fixed(calc(s).eC * 100, 1)} %`],
      ['Heat sent up', (s) => `${fixed(calc(s).toHot, 0)} J`],
      ['Heat taken down', (s) => `${fixed(Q1, 0)} J`],
      ['Net to hot', (s) => ({ text: `${fixed(calc(s).net, 0)} J`, good: calc(s).net <= 0.5 })],
    ] },
  ],
  tex: (s) => `Q_{up}=\\dfrac{W}{\\eta_C}=\\dfrac{${fixed(calc(s).w, 0)}}{${fixed(calc(s).eC, 3)}}=${fixed(calc(s).toHot, 0)}\\ \\mathrm{J}\\ \\text{vs}\\ ${Q1}\\ \\mathrm{J}\\ \\text{taken}`,
});
