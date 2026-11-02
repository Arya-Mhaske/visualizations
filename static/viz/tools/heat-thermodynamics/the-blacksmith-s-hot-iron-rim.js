import { createTool } from '../../lib/tool.js';
import { dot, label } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { rimDiameter, neededRise } from './_expansion-math.js';

const state = { small: 5, dT: 0 };
const D = 1.2;
const ALPHA = 12e-6;
const d0 = (s) => D - s.small / 1000;
const dNow = (s) => rimDiameter(d0(s), ALPHA, s.dT);

createTool({
  state,
  label: 'A wooden wheel drawn as a circle with an iron rim around it. The rim starts slightly too small; heating makes it larger until it is bigger than the wheel and can be slipped on.',
  draw(ctx, stage, c) {
    const [cx, cy] = [stage.w / 2, stage.h * 0.45];
    const R = Math.min(stage.w, stage.h) * 0.3;
    const rr = R * (1 + ((dNow(state) - D) / D) * 40);
    ctx.save();
    ctx.fillStyle = c.fillA;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = dNow(state) >= D ? c.c : c.a;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, rr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    dot(ctx, cx, cy, 4, c.ink, c.ink);
    label(ctx, dNow(state) >= D ? 'fits: slip it on' : 'too small', cx, stage.h * 0.88, c, { size: 14, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Heat the rim' },
    { key: 'small', label: 'Rim smaller by (mm)', min: 1, max: 8, step: 1 },
    { key: 'dT', label: 'Temperature rise ΔT (K)', min: 0, max: 600, step: 10 },
    { readout: [
      ['Wheel diameter', () => '1.200 m'],
      ['Rim diameter now', (s) => `${sig(dNow(s), 5)} m`],
      ['Rise needed', (s) => `${sig(neededRise(d0(s), D, ALPHA), 3)} K`],
      ['Fits?', (s) => ({ text: dNow(s) >= D ? 'yes' : 'no', good: dNow(s) >= D })],
    ] },
  ],
  tex: (s) => `d=d_0(1+\\alpha\\Delta T)=${sig(d0(s), 4)}\\times(1+12\\times10^{-6}\\times${s.dT})=${sig(dNow(s), 5)}`,
});
