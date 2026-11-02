import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { simple, splitAt, together } from './_linear-equations-math.js';

const state = { mode: 'interest', P: 10000, r: 8, t: 3, X: 15000, r1: 6, r2: 9, I: 1200, a: 6, b: 12 };
const GROUPS = { interest: [1, 2, 3], split: [4, 5, 6, 7], job: [8, 9] };
let tool;

function bar(ctx, c, x, y, w, h, fill) {
  poly(ctx, [[x, y], [x + Math.max(w, 0), y], [x + Math.max(w, 0), y + h], [x, y + h]], { fill, stroke: c.ink });
}

tool = createTool({
  state,
  label: 'A bar diagram for the chosen word problem: an amount with its simple interest, a sum split between two rates, or two workers filling a job together.',
  draw(ctx, stage, c) {
    const [x0, w] = [16, stage.w - 32];
    if (state.mode === 'interest') {
      const A = state.P + simple(state.P, state.r, state.t);
      const k = w / 30000;
      bar(ctx, c, x0, stage.h * 0.3, state.P * k, 34, c.fillB);
      bar(ctx, c, x0 + state.P * k, stage.h * 0.3, (A - state.P) * k, 34, c.a);
      label(ctx, `principal ₹${state.P}`, x0 + (state.P * k) / 2, stage.h * 0.3 + 17, c, { size: 11, bounds: stage, patch: false });
      label(ctx, `amount ₹${fixed(A, 0)}`, stage.w / 2, stage.h * 0.62, c, { size: 14, bounds: stage, patch: false });
    } else if (state.mode === 'split') {
      const x1 = splitAt(state.X, state.r1, state.r2, state.I);
      const ok = x1 >= 0 && x1 <= state.X;
      bar(ctx, c, x0, stage.h * 0.3, w, 34, c.paper);
      if (ok) {
        bar(ctx, c, x0, stage.h * 0.3, (x1 / state.X) * w, 34, c.b);
        bar(ctx, c, x0 + (x1 / state.X) * w, stage.h * 0.3, w - (x1 / state.X) * w, 34, c.a);
        label(ctx, `₹${fixed(x1, 0)} at ${state.r1}%`, x0 + (x1 / state.X) * w * 0.5, stage.h * 0.3 + 56, c, { size: 11, bounds: stage, patch: false });
        label(ctx, `₹${fixed(state.X - x1, 0)} at ${state.r2}%`, x0 + w - ((state.X - x1) / state.X) * w * 0.5, stage.h * 0.3 + 76, c, { size: 11, bounds: stage, patch: false });
      } else label(ctx, 'no split can earn that', stage.w / 2, stage.h * 0.45, c, { size: 14, bounds: stage, patch: false });
    } else {
      const t = together(state.a, state.b);
      const [fa, fb] = [t / state.a, t / state.b];
      bar(ctx, c, x0, stage.h * 0.3, fa * w, 34, c.b);
      bar(ctx, c, x0 + fa * w, stage.h * 0.3, fb * w, 34, c.a);
      label(ctx, 'A', x0 + (fa * w) / 2, stage.h * 0.3 + 17, c, { size: 12, patch: false });
      label(ctx, 'B', x0 + fa * w + (fb * w) / 2, stage.h * 0.3 + 17, c, { size: 12, patch: false });
      bar(ctx, c, x0, stage.h * 0.55, w, 34, c.c);
      label(ctx, `A's part + B's part = the whole job, in ${fixed(t, 2)} days`, stage.w / 2, stage.h * 0.55 + 56, c, { size: 11, bounds: stage, patch: false });
    }
  },
  controls: [
    { title: 'Pick a problem' },
    { key: 'mode', label: 'Problem', options: [['interest', 'Interest'], ['split', 'Split'], ['job', 'Job']] },
    { key: 'P', label: 'Principal (₹)', min: 1000, max: 20000, step: 1000 },
    { key: 'r', label: 'Rate (% a year)', min: 2, max: 15, step: 1 },
    { key: 't', label: 'Years', min: 1, max: 10, step: 1 },
    { key: 'X', label: 'Total sum (₹)', min: 5000, max: 20000, step: 1000 },
    { key: 'r1', label: 'Rate 1 (%)', min: 2, max: 8, step: 1 },
    { key: 'r2', label: 'Rate 2 (%)', min: 9, max: 15, step: 1 },
    { key: 'I', label: 'Interest in a year (₹)', min: 500, max: 2500, step: 100 },
    { key: 'a', label: 'A alone (days)', min: 2, max: 20, step: 1 },
    { key: 'b', label: 'B alone (days)', min: 2, max: 20, step: 1 },
    { readout: [
      ['Interest', (s) => (s.mode === 'interest' ? `₹${fixed(simple(s.P, s.r, s.t), 0)}` : '—')],
      ['Amount at rate 1', (s) => (s.mode === 'split' ? `₹${fixed(splitAt(s.X, s.r1, s.r2, s.I), 0)}` : '—')],
      ['Together', (s) => (s.mode === 'job' ? `${fixed(together(s.a, s.b), 2)} days` : '—')],
    ] },
  ],
  tex: (s) => (s.mode === 'interest' ? `I=\\dfrac{Prt}{100}=\\dfrac{${s.P}\\times${s.r}\\times${s.t}}{100}=${fixed(simple(s.P, s.r, s.t), 0)}` : s.mode === 'split' ? `\\dfrac{${s.r1}x+${s.r2}(${s.X}-x)}{100}=${s.I}` : `\\dfrac1{${s.a}}+\\dfrac1{${s.b}}=\\dfrac1t\\ \\Rightarrow\\ t=${fixed(together(s.a, s.b), 2)}`),
  onChange: () => sync(),
});
void tool;
function sync() {
  const fields = [...document.querySelectorAll('#panel .nb-field')];
  fields.forEach((f, i) => {
    if (i === 0) return;
    f.hidden = !GROUPS[state.mode].includes(i);
  });
}
sync();
