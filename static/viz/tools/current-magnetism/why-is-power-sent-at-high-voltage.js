import { createTool } from '../../lib/tool.js';
import { line, label, arrow } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { lineCurrent, lineLoss } from './_cells-emf-power-math.js';

const P = 100000; // W sent
const R_LINE = 5; // Ω of cable
const state = { kV: 11 };
const I = (s) => lineCurrent(P, s.kV * 1000);
const loss = (s) => lineLoss(P, s.kV * 1000, R_LINE);

const tool = createTool({
  state,
  label: 'Two bars. The top bar is the power sent, always 100 kilowatts. The lower bar shows what the cable turns into heat. A thick coral arrow shows the current in the cable, which shrinks as the voltage rises.',
  draw(ctx, stage, c) {
    const left = 14;
    const full = stage.w - 28;
    const lostW = Math.max(3, Math.min(full, (loss(state) / P) * full));
    const y1 = 30;
    const h = Math.min(60, stage.h / 6);
    ctx.lineWidth = 3;
    ctx.strokeStyle = c.ink;
    ctx.fillStyle = c.fillC;
    ctx.fillRect(left, y1, full, h);
    ctx.strokeRect(left, y1, full, h);
    label(ctx, 'Sent: 100 kW', stage.w / 2, y1 + h / 2, c, { color: c.ink, size: 13 });
    const y2 = y1 + h + 40;
    ctx.fillStyle = c.fillC;
    ctx.fillRect(left, y2, full, h);
    ctx.fillStyle = c.fillA;
    ctx.fillRect(left, y2, lostW, h);
    ctx.strokeRect(left, y2, full, h);
    line(ctx, left + lostW, y2, left + lostW, y2 + h, { color: c.ink });
    label(ctx, `Lost as heat: ${sig(loss(state) / 1000, 3)} kW`, stage.w / 2, y2 + h + 20, c, { color: c.ink, size: 12 });
    const ay = y2 + h + 70;
    const len = Math.max(8, Math.min(full - 20, (I(state) / 100) * (full - 20)));
    arrow(ctx, left + 10, ay, left + 10 + len, ay, { color: c.a, width: 8, head: 20 });
    label(ctx, `current ${sig(I(state), 3)} A`, stage.w / 2, ay + 26, c, { color: c.ink, size: 12 });
  },
  controls: () => [
    { title: '100 kW along a 5 Ω cable' },
    { key: 'kV', label: 'Transmission voltage', min: 1, max: 400, step: 1, format: (n) => `${n} kV` },
    { readout: [
      ['Current, I = P/V', (s) => `${sig(I(s), 3)} A`],
      ['Heat in cable, I²R', (s) => `${sig(loss(s) / 1000, 3)} kW`],
      ['Share lost', (s) => `${sig((loss(s) / P) * 100, 3)} %`],
    ] },
  ],
  tex: (s) => `I=\\dfrac{P}{V}=${sig(I(s), 3)}\\ \\text{A}\\qquad I^2R=${sig(loss(s) / 1000, 3)}\\ \\text{kW}`,
});
tool.update();
