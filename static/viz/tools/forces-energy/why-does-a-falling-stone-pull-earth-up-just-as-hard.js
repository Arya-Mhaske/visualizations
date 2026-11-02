import { createTool } from '../../lib/tool.js';
import { bars, G } from '../../lib/quick.js';
import { sci } from '../../lib/format.js';

const state = { m: 1 };
const ME = 5.97e24;
const aE = (s) => (s.m * G) / ME;

createTool({
  state,
  label: 'Two bars show the force on the stone and on the Earth, which are equal. Two more bars on a log scale show their accelerations, which differ by about twenty-five powers of ten.',
  draw(ctx, stage, c) {
    const mid = { w: stage.w, h: stage.h / 2 };
    bars(ctx, mid, c, [['on stone', state.m * G, c.fillA, `${sci(state.m * G, 2)} N`], ['on Earth', state.m * G, c.fillB, `${sci(state.m * G, 2)} N`]], { left: 0.3 });
    ctx.save();
    ctx.translate(0, stage.h / 2);
    bars(ctx, mid, c, [['a of stone', 30 + Math.log10(G), c.fillA, `${sci(G, 2)} m/s²`], ['a of Earth', 30 + Math.log10(aE(state)), c.fillB, `${sci(aE(state), 2)} m/s²`]], { left: 0.3, max: 32 });
    ctx.restore();
  },
  controls: [
    { title: 'Drop a stone' },
    { key: 'm', label: 'Stone mass (kg)', min: 0.1, max: 100, step: 0.1 },
    { readout: [
      ['Force either way', (s) => `${sci(s.m * G, 3)} N`],
      ['Stone accelerates', () => `${sci(G, 2)} m/s²`],
      ['Earth accelerates', (s) => `${sci(aE(s), 2)} m/s²`],
      ['Ratio', (s) => sci(G / aE(s), 2)],
    ] },
  ],
  tex: (s) => `a_E=\\dfrac{mg}{M_E}=\\dfrac{${s.m}\\times9.8}{5.97\\times10^{24}}`,
});
