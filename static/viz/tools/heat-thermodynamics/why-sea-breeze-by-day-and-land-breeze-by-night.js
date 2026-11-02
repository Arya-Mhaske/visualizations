import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { arrow, line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// Illustrative daily cycle: land swings 8 °C, sea only 1.5 °C (water has a large specific heat and mixes).
const TAU = Math.PI * 2;
const land = (h) => 25 + 8 * Math.sin((TAU * (h - 8)) / 24);
const sea = (h) => 25 + 1.5 * Math.sin((TAU * (h - 9)) / 24);
const state = { t: 14 };
const CYCLE = 24;
const clock = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const hh = (h) => `${String(Math.floor(h)).padStart(2, '0')}:${h % 1 ? '30' : '00'}`;
const verdict = (h) => {
  const d = land(h) - sea(h);
  return Math.abs(d) < 0.4 ? 'calm' : d > 0 ? 'sea breeze (sea to land)' : 'land breeze (land to sea)';
};

const tool = createTool({
  state,
  label: 'A coastline, land on the left and sea on the right. Air over the warmer side rises and air over the cooler side sinks. At the surface the wind blows from the cooler side to the warmer side. A graph below shows the land warming and cooling much more than the sea through the day, so the wind direction reverses after sunset.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const h1 = H * 0.6;
    const gy = h1 * 0.8;
    ctx.fillStyle = c.fillC;
    ctx.fillRect(0, gy, W / 2, h1 - gy);
    ctx.fillStyle = c.fillB;
    ctx.fillRect(W / 2, gy, W / 2, h1 - gy);
    line(ctx, 0, gy, W, gy, { color: c.ink, width: 3 });
    const t = state.t;
    const d = land(t) - sea(t);
    label(ctx, `land ${fixed(land(t), 1)}°C`, W / 4, gy + (h1 - gy) / 2, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `sea ${fixed(sea(t), 1)}°C`, (3 * W) / 4, gy + (h1 - gy) / 2, c, { size: 12, bounds: stage, patch: false });
    label(ctx, t >= 6 && t < 18 ? 'DAY' : 'NIGHT', 36, 14, c, { size: 12, bounds: stage, patch: false });
    if (Math.abs(d) < 0.4) {
      label(ctx, 'calm: no breeze', W / 2, h1 * 0.4, c, { size: 13, bounds: stage });
    } else {
      const warm = d > 0 ? W / 4 : (3 * W) / 4;
      const cool = d > 0 ? (3 * W) / 4 : W / 4;
      const len = 0.1 * W + 0.12 * W * Math.min(1, Math.abs(d) / 7);
      const dir = Math.sign(warm - cool);
      const [lowY, highY] = [gy - 16, h1 * 0.22];
      arrow(ctx, W / 2 - (dir * len) / 2 - dir * 0, lowY, W / 2 + (dir * len) / 2, lowY, { color: c.a, width: 4 });
      arrow(ctx, W / 2 + (dir * len) / 2, highY, W / 2 - (dir * len) / 2, highY, { color: c.b, width: 4 });
      arrow(ctx, warm, gy - 28, warm, highY + 14, { color: c.a, width: 4 });
      arrow(ctx, cool, highY + 14, cool, gy - 28, { color: c.b, width: 4 });
      label(ctx, 'rises', warm, h1 * 0.5, c, { size: 11, bounds: stage, patch: false });
      label(ctx, 'sinks', cool, h1 * 0.5, c, { size: 11, bounds: stage, patch: false });
    }
    // daily graph
    const [gx0, gx1, gy0, gy1] = [W * 0.12, W * 0.94, h1 + 18, H - 22];
    const px = (h) => gx0 + (h / 24) * (gx1 - gx0);
    const py = (T) => gy1 - ((T - 15) / 20) * (gy1 - gy0);
    line(ctx, gx0, gy0, gx0, gy1, { color: c.ink, width: 2 });
    line(ctx, gx0, gy1, gx1, gy1, { color: c.ink, width: 2 });
    for (const [fn, col] of [[land, c.a], [sea, c.b]]) {
      ctx.beginPath();
      for (let h = 0; h <= 24; h += 0.25) (h ? ctx.lineTo(px(h), py(fn(h))) : ctx.moveTo(px(h), py(fn(h))));
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    line(ctx, px(t), gy0, px(t), gy1, { color: c.ink, width: 2, dash: [4, 4] });
    for (const h of [0, 6, 12, 18, 24]) label(ctx, String(h), px(h), gy1 + 12, c, { size: 10, bounds: stage, patch: false });
    label(ctx, 'land', px(14), py(land(14)) - 10, c, { size: 11, color: c.a, bounds: stage, patch: false });
    label(ctx, 'sea', px(15), py(sea(15)) - 10, c, { size: 11, color: c.b, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Run a day' },
    { key: 't', label: 'Time of day (h)', min: 0, max: 24, step: 0.5, format: hh },
    transport(clock.clock),
    { readout: [
      ['Land − sea', (s) => `${fixed(land(s.t) - sea(s.t), 1)} °C`],
      ['Surface wind', (s) => verdict(s.t)],
    ] },
  ],
  tex: (s) => `\\Delta T=T_{land}-T_{sea}=${fixed(land(s.t), 1)}-${fixed(sea(s.t), 1)}=${fixed(land(s.t) - sea(s.t), 1)}\\ ^\\circ\\mathrm{C}`,
  onChange: () => clock.sync(),
});
clock.sync();
tool.update();
