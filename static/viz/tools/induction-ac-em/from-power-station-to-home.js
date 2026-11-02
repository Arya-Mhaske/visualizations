import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';

// A 50 MW plant (generated at 11 kV, stepped up to V_t) sends power down a line of total resistance 10 Ω, then steps down to 230 V.
// Line current I = P/V_t, line loss I²R. Transformers are taken as ideal; the loss is in the wire.
const P = 50e6;
const RLINE = 10;
const state = { kv: 132 };
const Vt = (s) => s.kv * 1000;
const I = (s) => P / Vt(s);
const loss = (s) => Math.min(P, I(s) * I(s) * RLINE);
const fmt = (w) => (w >= 1e6 ? `${sig(w / 1e6, 3)} MW` : `${sig(w / 1e3, 3)} kW`);

const tool = createTool({
  state,
  label: 'A row of boxes from left to right: power station at 11 kilovolts, step-up transformer, transmission line, step-down transformer, home at 230 volts. Below the line a bar shows what share of the power is lost as heat in the wires. A high transmission voltage keeps the loss tiny. A low one eats the whole power.',
  draw(ctx, stage, c) {
    const stages = [['plant', '11 kV'], ['step-up', `→ ${state.kv} kV`], ['line', `${sig(I(state), 3)} A`], ['step-down', '→ 230 V'], ['home', '230 V']];
    const w = (stage.w - 20) / stages.length;
    stages.forEach(([name, v], i) => {
      const x = 10 + i * w;
      ctx.fillStyle = i === 2 ? c.fillY : c.fillB;
      ctx.fillRect(x + 3, stage.h * 0.1, w - 6, stage.h * 0.22);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 3, stage.h * 0.1, w - 6, stage.h * 0.22);
      label(ctx, name, x + w / 2, stage.h * 0.17, c, { size: 10, bounds: stage, patch: false });
      label(ctx, v, x + w / 2, stage.h * 0.26, c, { size: 10, bounds: stage, patch: false });
    });
    const share = loss(state) / P;
    const bx = 20;
    const bw = stage.w - 40;
    const by = stage.h * 0.55;
    ctx.fillStyle = c.fillC;
    ctx.fillRect(bx, by, bw, 36);
    ctx.fillStyle = c.a;
    ctx.fillRect(bx, by, bw * share, 36);
    ctx.strokeStyle = c.ink;
    ctx.strokeRect(bx, by, bw, 36);
    label(ctx, `lost as heat: ${fixed(share * 100, 2)}%`, stage.w / 2, by - 14, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `delivered: ${fmt(P - loss(state))}`, stage.w / 2, by + 58, c, { size: 11, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Choose the transmission voltage' },
    { key: 'kv', label: 'Line voltage', min: 11, max: 765, step: 1, format: (v) => `${v} kV` },
    { readout: [
      ['Line current P/V', (s) => `${sig(I(s), 3)} A`],
      ['Loss in wires I²R', (s) => fmt(loss(s))],
      ['Share lost', (s) => ({ text: `${fixed((loss(s) / P) * 100, 2)}%`, good: loss(s) / P < 0.05 })],
      ['Delivered', (s) => fmt(P - loss(s))],
    ] },
  ],
  tex: (s) => `I=\\dfrac{P}{V},\\quad \\text{loss}=I^2R=\\left(\\dfrac{${sig(P / 1e6, 2)}\\times10^{6}}{${sig(Vt(s), 3)}}\\right)^2\\times10=${fmt(loss(s)).replace(' ', '\\ ')}`,
});

tool.update();
