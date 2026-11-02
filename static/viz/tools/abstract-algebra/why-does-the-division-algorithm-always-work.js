import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line } from '../../lib/draw.js';

// Start at a and take k steps of size b towards 0. Exactly one k lands in the zone [0, b-1]: that landing spot is the remainder.
const state = { a: 47, b: 6, k: 7 };
const quotient = (s) => Math.floor(s.a / s.b);

createTool({
  state,
  label: 'A number line with the zone from 0 to b minus 1 shaded green. A coral dot starts at a and hops down by b, k times. Exactly one number of hops puts it inside the green zone.',
  draw(ctx, stage, c) {
    const here = state.a - state.k * state.b;
    const lo = Math.min(0, here, state.a) - state.b;
    const hi = Math.max(0, here, state.a) + state.b;
    const x = (v) => 20 + ((stage.w - 40) * (v - lo)) / (hi - lo);
    const y = stage.h * 0.62;
    ctx.fillStyle = c.fillC;
    ctx.fillRect(x(0), y - 38, x(state.b - 1) - x(0), 76);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(x(0), y - 38, x(state.b - 1) - x(0), 76);
    label(ctx, 'remainder zone', (x(0) + x(state.b - 1)) / 2, y - 52, c, { size: 11, bounds: stage });
    line(ctx, 14, y, stage.w - 14, y, { color: c.ink });
    const every = Math.max(1, Math.ceil(26 / ((stage.w - 40) * state.b / (hi - lo))));
    for (let t = Math.ceil(lo / state.b) * state.b, i = 0; t <= hi; t += state.b, i++) {
      line(ctx, x(t), y - 8, x(t), y + 8, { color: c.ink, width: 2 });
      if (Math.round(t / state.b) % every === 0) label(ctx, String(t), x(t), y + 24, c, { size: 11, bounds: stage });
    }
    const dir = Math.sign(state.k);
    for (let j = 0; j < Math.abs(state.k); j++) {
      const from = state.a - dir * j * state.b;
      const to = from - dir * state.b;
      const mid = (x(from) + x(to)) / 2;
      arc(ctx, mid, y, Math.abs(x(from) - x(to)) / 2, Math.PI, 2 * Math.PI, { color: c.b, width: 2 });
    }
    dot(ctx, x(state.a), y, 9, c.fillB, c.ink);
    label(ctx, `a = ${state.a}`, x(state.a), y - 66, c, { size: 12, bounds: stage });
    dot(ctx, x(here), y, 11, c.a, c.ink);
    label(ctx, `${here}`, x(here), y + 50, c, { size: 13, bounds: stage });
  },
  controls: (tool) => [
    { title: 'Step down by b' },
    { key: 'a', label: 'a', min: -40, max: 80, step: 1 },
    { key: 'b', label: 'b', min: 2, max: 12, step: 1 },
    { key: 'k', label: 'Steps taken, k', min: -10, max: 40, step: 1 },
    { row: [{ button: 'Find the remainder', onClick() { state.k = quotient(state); tool.update(); } }] },
    { readout: [
      ['a − k·b', (s) => String(s.a - s.k * s.b)],
      ['In the zone?', (s) => { const r = s.a - s.k * s.b; const ok = r >= 0 && r < s.b; return { text: ok ? 'yes: this is r' : r < 0 ? 'no: too far, step back' : 'no: step again', good: ok }; }],
      ['Answer', (s) => `q = ${quotient(s)},  r = ${s.a - quotient(s) * s.b}`],
    ] },
  ],
  tex: (s) => `${s.a}=${s.b}\\cdot(${s.k})+(${s.a - s.k * s.b})`,
});
