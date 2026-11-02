import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { gcd } from './_aa-math.js';
import { specFill } from './_aa-view.js';

// Cut the biggest squares you can from an a × b rectangle, then from what is left, and so on.
// The last square that fits exactly has side gcd(a, b).
const state = { a: 48, b: 18, stage: 9 };

function cut(a, b) {
  const out = [];
  let [w, h, x, y, stage] = [a, b, 0, 0, 0];
  while (w > 0 && h > 0) {
    if (w >= h) {
      const n = Math.floor(w / h);
      for (let k = 0; k < n; k++) out.push({ x: x + k * h, y, s: h, stage });
      x += n * h;
      w -= n * h;
    } else {
      const n = Math.floor(h / w);
      for (let k = 0; k < n; k++) out.push({ x, y: y + k * w, s: w, stage });
      y += n * w;
      h -= n * w;
    }
    stage++;
  }
  return { squares: out, stages: stage };
}

createTool({
  state,
  label: 'A rectangle a by b cut into the largest possible squares, then the leftover into the next largest, until it is cut exactly. The side of the smallest square is the greatest common divisor of a and b.',
  draw(ctx, stage, c) {
    const { squares, stages } = cut(state.a, state.b);
    const show = Math.min(state.stage, stages);
    const k = Math.min((stage.w - 20) / state.a, (stage.h - 50) / state.b);
    const [x0, y0] = [(stage.w - k * state.a) / 2, 16];
    ctx.fillStyle = c.paper;
    ctx.fillRect(x0, y0, k * state.a, k * state.b);
    for (const sq of squares) {
      if (sq.stage >= show) continue;
      const last = sq.stage === stages - 1;
      ctx.fillStyle = last ? c.fillC : specFill(c, sq.stage);
      ctx.fillRect(x0 + sq.x * k, y0 + sq.y * k, sq.s * k, sq.s * k);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = last ? 3 : 2;
      ctx.strokeRect(x0 + sq.x * k, y0 + sq.y * k, sq.s * k, sq.s * k);
      if (sq.s * k > 16) label(ctx, String(sq.s), x0 + (sq.x + sq.s / 2) * k, y0 + (sq.y + sq.s / 2) * k, c, { size: 12, patch: false });
    }
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(x0, y0, k * state.a, k * state.b);
    label(ctx, `${state.a} × ${state.b}`, stage.w / 2, y0 + k * state.b + 20, c, { size: 13 });
  },
  controls: [
    { title: 'Cut the rectangle' },
    { key: 'a', label: 'Width a', min: 2, max: 60, step: 1 },
    { key: 'b', label: 'Height b', min: 2, max: 60, step: 1 },
    { key: 'stage', label: 'Rounds of cutting', min: 0, max: 12, step: 1 },
    { readout: [
      ['Rounds needed', (s) => String(cut(s.a, s.b).stages)],
      ['Last square', (s) => (s.stage >= cut(s.a, s.b).stages ? `side ${gcd(s.a, s.b)}` : 'not reached yet')],
      ['gcd(a, b)', (s) => String(gcd(s.a, s.b))],
    ] },
  ],
  tex: (s) => `\\gcd(${s.a},${s.b})=${gcd(s.a, s.b)}`,
});
