import { createTool } from '../../lib/tool.js';
import { arrow, line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// One glass layer that absorbs a fraction a of the surface's infrared and re-emits a σTa⁴ both up and down.
// Layer balance: a σTs⁴ = 2 a σTa⁴, so Ta⁴ = Ts⁴/2.  Surface balance: S = (1 − a/2) σTs⁴.
const SIGMA = 5.67e-8;
const state = { a: 0.78, S: 240 };
const surf = (s) => Math.pow(s.S / (SIGMA * (1 - s.a / 2)), 0.25);
const up = (s) => SIGMA * surf(s) ** 4; // surface emission
const down = (s) => (s.a * up(s)) / 2; // back radiation
const escape = (s) => (1 - s.a) * up(s) + down(s);

createTool({
  state,
  label: 'Sunlight comes in from the top left and warms the ground. The ground sends infrared up. A glass layer absorbs a fraction of it and sends half of that back down. The more the glass absorbs, the more back-radiation, and the warmer the ground must get for the same energy to escape to space.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const wd = (v) => 2 + (v / 700) * 14;
    const gy = H * 0.86;
    const ly = H * 0.48;
    ctx.fillStyle = c.fillC;
    ctx.fillRect(0, gy, W, H - gy);
    line(ctx, 0, gy, W, gy, { color: c.ink, width: 3 });
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.5 * state.a;
    ctx.fillStyle = c.fillB;
    ctx.fillRect(0, ly - 12, W, 24);
    ctx.restore();
    line(ctx, 0, ly - 12, W, ly - 12, { color: c.ink, width: 2 });
    line(ctx, 0, ly + 12, W, ly + 12, { color: c.ink, width: 2 });
    label(ctx, 'glass layer (atmosphere)', W * 0.5, ly, c, { size: 11, bounds: stage, patch: false });
    arrow(ctx, W * 0.14, H * 0.06, W * 0.14, gy - 4, { color: c.d, width: wd(state.S), head: 14 });
    label(ctx, `sun ${fixed(state.S, 0)}`, W * 0.14, H * 0.03, c, { size: 11, bounds: stage, patch: false });
    arrow(ctx, W * 0.42, gy - 4, W * 0.42, ly + 16, { color: c.a, width: wd(up(state)), head: 14 });
    label(ctx, `up ${fixed(up(state), 0)}`, W * 0.42, (gy + ly) / 2, c, { size: 11, bounds: stage });
    arrow(ctx, W * 0.62, ly + 16, W * 0.62, gy - 4, { color: c.a, width: wd(down(state)) + 0.01, head: 14 });
    label(ctx, `back ${fixed(down(state), 0)}`, W * 0.62, (gy + ly) / 2, c, { size: 11, bounds: stage });
    arrow(ctx, W * 0.84, ly - 16, W * 0.84, H * 0.1, { color: c.a, width: wd(down(state)), head: 14 });
    arrow(ctx, W * 0.28, ly - 16, W * 0.28, H * 0.1, { color: c.a, width: wd((1 - state.a) * up(state)), head: 14 });
    label(ctx, `to space ${fixed(escape(state), 0)}`, W * 0.7, H * 0.05, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `W/m², ground ${fixed(surf(state) - 273.15, 0)}°C`, W * 0.5, H * 0.95, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Add a glass layer' },
    { key: 'a', label: 'Layer absorbs fraction a', min: 0, max: 1, step: 0.02, format: (v) => fixed(v, 2) },
    { key: 'S', label: 'Sunlight absorbed S (W/m²)', min: 200, max: 280, step: 10 },
    { readout: [
      ['Ground T', (s) => `${fixed(surf(s), 0)} K = ${fixed(surf(s) - 273.15, 1)} °C`],
      ['Ground emits', (s) => `${fixed(up(s), 0)} W/m²`],
      ['Back-radiation', (s) => `${fixed(down(s), 0)} W/m²`],
      ['Escapes to space', (s) => `${fixed(escape(s), 0)} W/m²`],
    ] },
  ],
  tex: (s) => `S=\\left(1-\\dfrac{a}{2}\\right)\\sigma T_s^{4}\\ \\Rightarrow\\ T_s=${fixed(surf(s), 0)}\\ \\mathrm{K}`,
});
