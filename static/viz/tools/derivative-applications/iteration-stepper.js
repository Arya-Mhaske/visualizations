import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const FN = {
  sqrt2: { name: 'Compute √2', f: (x) => x * x - 2, d: (x) => 2 * x, root: Math.SQRT2, tex: 'x^2-2=0', rule: 'x − (x² − 2) ÷ 2x' },
  cosx: { name: 'Solve cos x = x', f: (x) => Math.cos(x) - x, d: (x) => -Math.sin(x) - 1, root: 0.7390851332151607, tex: '\\cos x-x=0', rule: 'x − (cos x − x) ÷ (−sin x − 1)' },
};
const state = { fn: 'sqrt2', x0: 1, n: 3 };
function rows(s) {
  const { f, d } = FN[s.fn];
  const out = [{ x: s.x0 }];
  for (let i = 0; i < 6; i++) out.push({ x: out[i].x - f(out[i].x) / d(out[i].x) });
  return out.map((r) => ({ ...r, fx: f(r.x), dx: d(r.x) }));
}

createTool({
  state,
  label: 'A table of Newton iterations, one row per step. Each row shows the current guess, the value of the function there, the slope there and the next guess. Choose the equation, the start value and how many steps to show.',
  draw(ctx, stage, c) {
    const R = rows(state);
    label(ctx, FN[state.fn].rule, 12, 18, c, { size: 11, align: 'left', patch: false });
    ['n', 'xₙ', 'f(xₙ)'].forEach((h, i) => label(ctx, h, [12, 44, stage.w * 0.66][i], 48, c, { size: 11, align: 'left', patch: false, color: c.b }));
    R.slice(0, state.n + 1).forEach((r, i) => {
      const y = 78 + i * 34;
      ctx.fillStyle = i === state.n ? c.fillY : c.fillB;
      ctx.fillRect(6, y - 14, stage.w - 12, 28);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2;
      ctx.strokeRect(6, y - 14, stage.w - 12, 28);
      label(ctx, `${i}`, 12, y, c, { size: 12, align: 'left', patch: false });
      label(ctx, fixed(r.x, 10), 44, y, c, { size: 12, align: 'left', patch: false });
      label(ctx, r.fx.toExponential(1), stage.w * 0.66, y, c, { size: 11, align: 'left', patch: false });
    });
  },
  controls: [
    { title: 'Iterate by hand' },
    { key: 'fn', label: 'Problem', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'x0', label: 'Start x₀', min: 0.5, max: 3, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'n', label: 'Steps shown', min: 0, max: 6, step: 1 },
    { readout: [
      ['Latest guess', (s) => fixed(rows(s)[s.n].x, 12)],
      ['True value', (s) => fixed(FN[s.fn].root, 12)],
      ['Error', (s) => ({ text: Math.abs(rows(s)[s.n].x - FN[s.fn].root).toExponential(1), good: true })],
    ] },
  ],
  tex: (s) => `${FN[s.fn].tex}\\qquad x_{n+1}=x_n-\\dfrac{f(x_n)}{f'(x_n)}`,
});
