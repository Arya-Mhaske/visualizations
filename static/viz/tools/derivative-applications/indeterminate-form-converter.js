import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { sci, fixed } from '../../lib/format.js';

// Each form: the expression, how it is rewritten, what the rewrite becomes, the limit and a numeric evaluator at the slider's value.
const FORMS = {
  zi: { name: '0 · ∞', expr: 'x ln x  as x → 0⁺', steps: ['x ln x  is 0 · (−∞)', 'write as  ln x ÷ (1/x)', 'now  −∞ ÷ ∞,  use l\'Hôpital', '(1/x) ÷ (−1/x²) = −x → 0'], limit: '0', f: (x) => x * Math.log(x), near: 'zero' },
  ii: { name: '∞ − ∞', expr: '1/x − 1/sin x  as x → 0⁺', steps: ['1/x − 1/sin x  is  ∞ − ∞', 'common denominator:', '(sin x − x) ÷ (x sin x)  is 0/0', 'l\'Hôpital twice gives 0'], limit: '0', f: (x) => 1 / x - 1 / Math.sin(x), near: 'zero' },
  oi: { name: '1^∞', expr: '(1 + x)^(1/x)  as x → 0⁺', steps: ['(1+x)^(1/x)  is  1^∞', 'take ln:  ln(1+x) ÷ x  is 0/0', 'l\'Hôpital: 1/(1+x) → 1', 'so the limit is e¹ = e'], limit: 'e ≈ 2.71828', f: (x) => (1 + x) ** (1 / x), near: 'e' },
  zz: { name: '0⁰', expr: 'x^x  as x → 0⁺', steps: ['x^x  is  0⁰', 'take ln:  x ln x  is 0 · ∞', 'rewrite  ln x ÷ (1/x)  → 0', 'so the limit is e⁰ = 1'], limit: '1', f: (x) => x ** x, near: 'one' },
  ie: { name: '∞⁰', expr: 'x^(1/x)  as x → ∞', steps: ['x^(1/x)  is  ∞⁰', 'take ln:  (ln x) ÷ x  is ∞/∞', 'l\'Hôpital: (1/x) ÷ 1 → 0', 'so the limit is e⁰ = 1'], limit: '1', f: (x) => x ** (1 / x), near: 'one' },
};
const state = { form: 'zi', step: 1, k: 3 };
const xAt = (s) => (s.form === 'ie' ? 10 ** s.k : 10 ** -s.k);

createTool({
  state,
  label: 'A step-by-step rewrite of an indeterminate form into zero over zero or infinity over infinity so that l Hopital can be used. Each line is one step. A number readout evaluates the original expression very close to the limit point so the answer can be seen.',
  draw(ctx, stage, c) {
    const F = FORMS[state.form];
    label(ctx, F.expr, 14, 26, c, { size: 14, align: 'left', patch: false, bounds: stage });
    F.steps.slice(0, state.step).forEach((text, i) => {
      const y = 70 + i * 56;
      ctx.fillStyle = i === state.step - 1 ? c.fillY : c.fillB;
      ctx.fillRect(10, y - 20, stage.w - 20, 44);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(10, y - 20, stage.w - 20, 44);
      label(ctx, `${i + 1}  ${text}`, 18, y + 2, c, { size: 12, align: 'left', patch: false, bounds: stage });
    });
  },
  controls: [
    { title: 'Pick a form' },
    { key: 'form', label: 'Form', options: Object.entries(FORMS).map(([k, v]) => [k, v.name]) },
    { key: 'step', label: 'Steps shown', min: 1, max: 4, step: 1 },
    { key: 'k', label: 'Test closer to the limit', min: 1, max: 8, step: 1 },
    { readout: [
      ['Test point x', (s) => sci(xAt(s), 2)],
      ['Original expression', (s) => fixed(FORMS[s.form].f(xAt(s)), 6)],
      ['Limit', (s) => ({ text: FORMS[s.form].limit, good: true })],
    ] },
  ],
  tex: () => '\\text{rewrite as }\\tfrac00\\text{ or }\\tfrac\\infty\\infty,\\text{ then use l\'H\\^opital}',
});
