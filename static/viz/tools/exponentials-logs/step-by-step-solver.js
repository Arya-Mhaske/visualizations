import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { mode: 'exp', a: 2, b: 3, c: 8, d: 2, step: 1 };
const f = (v) => fixed(v, 4);

function lines(s) {
  const { a, b, c, d } = s;
  const q = (c - d) / a;
  if (s.mode === 'exp') {
    const head = `${a}·${b}ˣ + ${d} = ${c}`;
    if (q <= 0) {
      return [head, [`1 Isolate: ${b}ˣ = (${c} − ${d})/${a} = ${f(q)}`, true], [`2 ${b}ˣ is never ≤ 0: no solution`, false]];
    }
    const x = Math.log(q) / Math.log(b);
    return [head,
      [`1 Isolate: ${b}ˣ = (${c} − ${d})/${a} = ${f(q)}`, true],
      [`2 Take ln: x ln ${b} = ln ${f(q)}`, true],
      [`3 Solve: x = ${f(Math.log(q))}/${f(Math.log(b))} = ${f(x)}`, true],
      [`4 Check: ${a}·${b}^${f(x)} + ${d} = ${f(a * b ** x + d)}`, true]];
  }
  const x = b ** q;
  return [`${a}·log_${b}(x) + ${d} = ${c}`,
    [`1 Isolate: log_${b} x = (${c} − ${d})/${a} = ${f(q)}`, true],
    [`2 Rewrite as a power: x = ${b}^${f(q)}`, true],
    [`3 Compute: x = ${f(x)}`, true],
    [`4 Check x > 0 ✓: ${a}·log_${b}(${f(x)}) + ${d} = ${f(a * (Math.log(x) / Math.log(b)) + d)}`, true]];
}

createTool({
  state,
  label: 'A worked solution to an exponential or logarithmic equation, revealed one step at a time: isolate the power or the log, take logs or rewrite as a power, solve, then check by putting the answer back. The numbers come from the sliders, and an impossible case says why it has no solution.',
  draw(ctx, stage, c) {
    const L = lines(state);
    label(ctx, L[0], 14, 28, c, { size: 15, align: 'left', patch: false });
    for (let i = 1; i <= Math.min(state.step, L.length - 1); i++) {
      const [text, ok] = L[i];
      const y = 28 + i * 54;
      ctx.fillStyle = ok ? (i === state.step ? c.fillY : c.fillB) : c.fillA;
      ctx.fillRect(10, y - 18, stage.w - 20, 40);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(10, y - 18, stage.w - 20, 40);
      label(ctx, text, 18, y + 2, c, { size: 12, align: 'left', patch: false, bounds: stage });
    }
  },
  controls: [
    { title: 'Set the equation' },
    { key: 'mode', label: 'Type', options: [['exp', 'a·bˣ + d = c'], ['log', 'a·log_b x + d = c']] },
    { key: 'a', label: 'a', min: 1, max: 5, step: 1 },
    { key: 'b', label: 'b', min: 2, max: 10, step: 1 },
    { key: 'c', label: 'c', min: 0, max: 100, step: 1 },
    { key: 'd', label: 'd', min: -10, max: 10, step: 1 },
    { key: 'step', label: 'Steps shown', min: 1, max: 4, step: 1 },
    { readout: [['Steps available', (s) => `${lines(s).length - 1}`]] },
  ],
  tex: (s) => (s.mode === 'exp' ? `${s.a}\\cdot ${s.b}^{x}+${s.d}=${s.c}` : `${s.a}\\log_{${s.b}}x+${s.d}=${s.c}`),
});
