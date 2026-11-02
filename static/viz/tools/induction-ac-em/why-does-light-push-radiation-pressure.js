import { createTool } from '../../lib/tool.js';
import { arrow, label, line } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';

// An EM wave of intensity I carries momentum: p = U/c. A surface that absorbs it gets pressure P = I/c; one that reflects it gets 2I/c.
const C = 3e8;
const state = { lg: 3.14, refl: false, A: 100, m: 20 };
const inten = (s) => 10 ** s.lg;
const press = (s) => (s.refl ? 2 : 1) * inten(s) / C;
const force = (s) => press(s) * s.A; // A in m², sail
const accel = (s) => force(s) / s.m;

const tool = createTool({
  state,
  label: 'A beam of light arriving from the left as coral arrows and striking a sail. For an absorbing sail the arrows stop at the surface. For a reflecting sail they bounce back, and a larger arrow shows the bigger push. The force on the sail and its acceleration are given below.',
  draw(ctx, stage, c) {
    const sx = stage.w * 0.62;
    const top = stage.h * 0.2;
    const bot = stage.h * 0.8;
    for (let k = 0; k < 5; k++) {
      const y = top + ((bot - top) * (k + 0.5)) / 5;
      arrow(ctx, 12, y, sx - 4, y, { color: c.a, width: 3, head: 8 });
      if (state.refl) arrow(ctx, sx - 4, y + 10, 24, y + 10, { color: c.a, width: 2, head: 6 });
    }
    ctx.fillStyle = state.refl ? c.paper : c.ink;
    ctx.fillRect(sx, top - 10, 12, bot - top + 20);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(sx, top - 10, 12, bot - top + 20);
    const push = state.refl ? 80 : 40;
    arrow(ctx, sx + 20, stage.h * 0.5, Math.min(stage.w - 10, sx + 20 + push), stage.h * 0.5, { color: c.c, width: 5, head: 11 });
    label(ctx, 'push', sx + 40, stage.h * 0.5 - 16, c, { size: 11, bounds: stage, patch: false });
    label(ctx, state.refl ? 'reflects: momentum reverses, push ×2' : 'absorbs: momentum is given up', stage.w / 2, stage.h * 0.92, c, { size: 11, bounds: stage, patch: false });
    line(ctx, 12, top - 24, 12, top - 24, { color: c.ink, width: 1 });
  },
  controls: () => [
    { title: 'Shine light on a sail' },
    { key: 'lg', label: 'Intensity, log₁₀', min: 0, max: 8, step: 0.01, format: (v) => `${sig(10 ** v, 3)} W/m²` },
    { key: 'refl', label: 'Mirror-like sail (reflects)', toggle: true },
    { key: 'A', label: 'Sail area', min: 1, max: 1000, step: 1, format: (v) => `${v} m²` },
    { key: 'm', label: 'Spacecraft mass', min: 1, max: 100, step: 1, format: (v) => `${v} kg` },
    { readout: [
      ['Momentum per second per m²', (s) => `${sig(inten(s) / C, 3)} N/m² (U/c)`],
      ['Pressure', (s) => `${sig(press(s), 3)} Pa`],
      ['Force on the sail', (s) => `${sig(force(s), 3)} N`],
      ['Acceleration', (s) => `${sig(accel(s), 3)} m/s²`],
      ['Sunlight at Earth', () => '1.4 kW/m² gives 4.7 μPa absorbed'],
    ] },
  ],
  tex: (s) => `P=${s.refl ? '\\dfrac{2I}{c}' : '\\dfrac{I}{c}'}=${sig(press(s), 3)}\\ \\text{Pa}`,
});

tool.update();
