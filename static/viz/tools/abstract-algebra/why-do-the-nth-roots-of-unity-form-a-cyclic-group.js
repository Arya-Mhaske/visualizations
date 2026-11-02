import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { mod } from './_aa-math.js';

// The nth roots of unity are ω^k with ω = cos(360°/n) + i sin(360°/n). Multiplying adds the exponents, mod n.
const state = { n: 6, a: 2, b: 3 };
const show = (k, n) => {
  const t = (2 * Math.PI * k) / n;
  const re = Math.abs(Math.cos(t)) < 1e-9 ? 0 : Math.cos(t);
  const im = Math.abs(Math.sin(t)) < 1e-9 ? 0 : Math.sin(t);
  return { re, im };
};
const fmt = ({ re, im }) => `${re.toFixed(3)} ${im < 0 ? '−' : '+'} ${Math.abs(im).toFixed(3)}i`;

createTool({
  state,
  label: 'The unit circle with n equally spaced points, the nth roots of unity. A coral arrow marks omega to the a, a blue arrow omega to the b, and a green dot marks their product, which is omega to the a plus b.',
  draw(ctx, stage, c) {
    const [cx, cy, R] = [stage.w / 2, stage.h / 2, Math.min(stage.w, stage.h) * 0.38];
    const at = (k) => { const z = show(k, state.n); return [cx + R * z.re, cy - R * z.im]; };
    line(ctx, cx - R - 14, cy, cx + R + 14, cy, { color: c.grid, width: 1 });
    line(ctx, cx, cy - R - 14, cx, cy + R + 14, { color: c.grid, width: 1 });
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    const sum = mod(state.a + state.b, state.n);
    const [ax, ay] = at(mod(state.a, state.n));
    const [bx, by] = at(mod(state.b, state.n));
    if (mod(state.a, state.n)) arrow(ctx, cx, cy, ax, ay, { color: c.a, width: 3 });
    if (mod(state.b, state.n)) arrow(ctx, cx, cy, bx, by, { color: c.b, width: 3 });
    for (let k = 0; k < state.n; k++) {
      const [x, y] = at(k);
      dot(ctx, x, y, k === sum ? 12 : 8, k === sum ? c.fillC : k === 0 ? c.fillY : c.paper, c.ink);
      const outward = 1.17;
      label(ctx, `ω${k > 1 ? `^${k}` : k === 1 ? '' : '⁰'}`.replace('ω⁰', '1'), cx + (x - cx) * outward, cy + (y - cy) * outward, c, { size: 11, bounds: stage });
    }
  },
  controls: [
    { title: 'Multiply two roots' },
    { key: 'n', label: 'Number of roots, n', min: 2, max: 12, step: 1 },
    { key: 'a', label: 'First exponent, a', min: 0, max: 11, step: 1, format: (v) => `${v} (acts as ${mod(v, state.n)})` },
    { key: 'b', label: 'Second exponent, b', min: 0, max: 11, step: 1, format: (v) => `${v} (acts as ${mod(v, state.n)})` },
    { readout: [
      ['ω^a', (s) => fmt(show(mod(s.a, s.n), s.n))],
      ['ω^b', (s) => fmt(show(mod(s.b, s.n), s.n))],
      ['ω^a · ω^b', (s) => fmt(show(mod(s.a + s.b, s.n), s.n))],
      ['Exponent of product', (s) => String(mod(s.a + s.b, s.n))],
    ] },
  ],
  tex: (s) => `\\omega^{${mod(s.a, s.n)}}\\cdot\\omega^{${mod(s.b, s.n)}}=\\omega^{${mod(s.a, s.n)}+${mod(s.b, s.n)}}=\\omega^{${mod(s.a + s.b, s.n)}},\\quad \\omega=e^{2\\pi i/${s.n}}`,
});
