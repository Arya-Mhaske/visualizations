import { createTool } from '../../lib/tool.js';
import { arc, arrow, dot, label } from '../../lib/draw.js';
import { mod } from './_aa-math.js';

// Adding on a clock face with n hours: walk A hours round, then B more. The laws of ordinary addition survive.
const state = { n: 12, a: 9, b: 5 };
const A = (s) => mod(s.a, s.n);
const B = (s) => mod(s.b, s.n);

function lawsHold(n) {
  const all = [...Array(n).keys()];
  const add = (x, y) => (x + y) % n;
  return {
    closed: all.every((x) => all.every((y) => add(x, y) >= 0 && add(x, y) < n)),
    commutative: all.every((x) => all.every((y) => add(x, y) === add(y, x))),
    associative: all.every((x) => all.every((y) => all.every((z) => add(add(x, y), z) === add(x, add(y, z))))),
    zero: all.every((x) => add(0, x) === x),
    inverses: all.every((x) => all.some((y) => add(x, y) === 0)),
  };
}

createTool({
  state,
  label: 'A clock face with n hours. A coral arc walks from 0 round to a, a blue arc walks on by b more hours, and a green dot marks where you finish, which is a plus b on this clock.',
  draw(ctx, stage, c) {
    const [cx, cy, R] = [stage.w / 2, stage.h / 2, Math.min(stage.w, stage.h) * 0.36];
    const angle = (k) => -Math.PI / 2 + (2 * Math.PI * k) / state.n;
    dot(ctx, cx, cy, R + 14, c.paper, c.ink);
    const a = A(state);
    const b = B(state);
    const total = a + b;
    if (a > 0) arc(ctx, cx, cy, R - 12, angle(0), angle(a), { color: c.a, width: 6 });
    if (b > 0) arc(ctx, cx, cy, R - 24, angle(a), angle(a) + (2 * Math.PI * b) / state.n, { color: c.b, width: 6 });
    for (let k = 0; k < state.n; k++) {
      const [x, y] = [cx + R * Math.cos(angle(k)), cy + R * Math.sin(angle(k))];
      const sum = k === total % state.n;
      dot(ctx, x, y, sum ? 15 : 12, sum ? c.fillC : k === 0 ? c.fillY : c.paper, c.ink, sum ? 3 : 2);
      label(ctx, String(k), x, y, c, { size: 12, patch: false });
    }
    arrow(ctx, cx, cy, cx + (R - 36) * Math.cos(angle(total % state.n)), cy + (R - 36) * Math.sin(angle(total % state.n)), { color: c.ink, width: 4 });
    label(ctx, total >= state.n ? 'went past the top' : 'did not pass the top', cx, cy + R * 0.45, c, { size: 11 });
  },
  controls: [
    { title: 'Add on a clock' },
    { key: 'n', label: 'Hours on the clock', min: 2, max: 12, step: 1 },
    { key: 'a', label: 'First walk, a', min: 0, max: 11, step: 1, format: (v) => `${v} (acts as ${mod(v, state.n)})` },
    { key: 'b', label: 'Second walk, b', min: 0, max: 11, step: 1, format: (v) => `${v} (acts as ${mod(v, state.n)})` },
    { readout: [
      ['a + b', (s) => String((A(s) + B(s)) % s.n)],
      ['b + a', (s) => String((B(s) + A(s)) % s.n)],
      ['Inverse of a', (s) => String(mod(-A(s), s.n))],
      ['Closed', (s) => ({ text: lawsHold(s.n).closed ? 'yes' : 'no', good: lawsHold(s.n).closed })],
      ['Commutative', (s) => ({ text: lawsHold(s.n).commutative ? 'yes' : 'no', good: lawsHold(s.n).commutative })],
      ['Associative', (s) => ({ text: lawsHold(s.n).associative ? 'yes' : 'no', good: lawsHold(s.n).associative })],
      ['0 does nothing', (s) => ({ text: lawsHold(s.n).zero ? 'yes' : 'no', good: lawsHold(s.n).zero })],
      ['Every a has an inverse', (s) => ({ text: lawsHold(s.n).inverses ? 'yes' : 'no', good: lawsHold(s.n).inverses })],
    ] },
  ],
  tex: (s) => `${A(s)}+${B(s)}\\equiv ${(A(s) + B(s)) % s.n}\\pmod{${s.n}}`,
});
