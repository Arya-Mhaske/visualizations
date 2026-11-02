import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { arrow, label } from '../../lib/draw.js';
import { mark } from './_charge.js';

// A metal slab in a field E0 to the right. Free electrons move left until the surface charge's own field cancels E0. Relaxation time τ = 1 s (shown slowed down).
const TAU = 1;
const state = { E0: 3, t: 0 };
const Ein = (s) => s.E0 * Math.exp(-s.t / TAU);
const shift = (s) => 1 - Math.exp(-s.t / TAU);
const clock = createTimeline(document.querySelector('#stage'), state, { cycle: () => 6, update: () => tool.update() });

const tool = createTool({
  state,
  label: 'A metal slab in an electric field pointing right. Its free electrons drift to the left face and leave positive charge on the right face. Those surface charges make their own field, pointing left, which grows until it exactly cancels the original field inside the slab. The field inside the slab falls to zero.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const [x0, x1, y0, y1] = [W * 0.34, W * 0.66, H * 0.2, H * 0.8];
    ctx.fillStyle = c.fillY;
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 4;
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    const k = shift(state);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) {
      const x = x0 + 20 + i * ((x1 - x0 - 40) / 4);
      const y = y0 + 28 + j * ((y1 - y0 - 56) / 3);
      mark(ctx, x, y, 1, c, 5);
      mark(ctx, x + 10 - k * (x1 - x0 - 50) * (i / 4) * 0.35 - k * 8, y - 6, -1, c, 5);
    }
    for (let j = 0; j < 4; j++) {
      const y = y0 + 28 + j * ((y1 - y0 - 56) / 3);
      for (let n = 0; n < Math.round(k * 3); n++) { mark(ctx, x0 + 8 + n * 8, y + 12, -1, c, 4); mark(ctx, x1 - 8 - n * 8, y + 12, 1, c, 4); }
    }
    for (let j = 0; j < 4; j++) {
      const y = y0 + 20 + j * ((y1 - y0 - 40) / 3);
      const L = 20 + state.E0 * 8;
      arrow(ctx, W * 0.04, y, W * 0.04 + L + 20, y, { color: c.a, width: 3, head: 9 });
      arrow(ctx, W * 0.96 - L - 20, y, W * 0.96, y, { color: c.a, width: 3, head: 9 });
    }
    const L2 = (Ein(state) / state.E0) * (20 + state.E0 * 8);
    if (L2 > 4) arrow(ctx, (x0 + x1) / 2 - L2 / 2, H * 0.5, (x0 + x1) / 2 + L2 / 2, H * 0.5, { color: c.ink, width: 4, head: 9 });
    label(ctx, `E inside = ${Ein(state).toFixed(2)}`, W * 0.5, H * 0.9, c, { size: 13, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Switch on a field' },
    { key: 't', label: 'Time (slowed down)', min: 0, max: 5.9, step: 0.1, format: (v) => `${v.toFixed(1)} s` },
    transport(clock.clock),
    { key: 'E0', label: 'Outside field E₀', min: 1, max: 5, step: 1 },
    { readout: [
      ['Applied E₀', (s) => s.E0.toFixed(2)],
      ['Field from surface charge', (s) => (-(s.E0 - Ein(s))).toFixed(2)],
      ['Net E inside', (s) => ({ text: Ein(s).toFixed(2), good: Ein(s) < 0.05 })],
    ] },
  ],
  tex: (s) => `E_{in}=E_0-E_{induced}=${s.E0}-${(s.E0 - Ein(s)).toFixed(2)}=${Ein(s).toFixed(2)}`,
  onChange: () => clock.sync(),
});
clock.sync();
tool.update();
