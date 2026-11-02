import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { dot, gramSchmidt, norm, rad } from './_la-math.js';
import { plane, vec } from './_la-view.js';

const state = { step: 3, a: 15, b: 70, lb: 3 };
const A = (s) => [3 * Math.cos(rad(s.a)), 3 * Math.sin(rad(s.a))];
const Bv = (s) => [s.lb * Math.cos(rad(s.b)), s.lb * Math.sin(rad(s.b))];
const GS = (s) => gramSchmidt([A(s), Bv(s)]);
const NAMES = ['Skewed a, b', 'q₁ = a ÷ |a|', 'Take b minus its shadow', 'q₂ = that ÷ its length'];

createTool({
  state,
  label: 'Two skewed vectors a and b. Step one divides a by its length to make q1. Step two subtracts from b its shadow along q1, leaving a vector that is perpendicular to q1. Step three divides that by its length to make q2. The result q1 and q2 are perpendicular unit vectors spanning the same plane.',
  setup: (stage, c) => plane(stage, c, 4.5),
  draw(ctx, stage, c, plot) {
    const a = A(state);
    const b = Bv(state);
    const qs = GS(state);
    plot.axes({ grid: false });
    vec(ctx, plot, c, [0, 0], a, { color: c.a, width: state.step === 0 ? 5 : 2, text: 'a' });
    vec(ctx, plot, c, [0, 0], b, { color: c.b, width: state.step === 0 ? 5 : 2, text: 'b' });
    if (qs.length < 2) return;
    const [q1, q2] = qs;
    const shadow = q1.map((v) => v * dot(b, q1));
    const rest = [b[0] - shadow[0], b[1] - shadow[1]];
    if (state.step >= 1) vec(ctx, plot, c, [0, 0], q1, { color: c.c, width: 6, text: 'q1', dx: 12, dy: 14 });
    if (state.step >= 2) {
      plot.segment(b[0], b[1], shadow[0], shadow[1], { color: c.grid, width: 2, dash: [5, 4] });
      vec(ctx, plot, c, [0, 0], shadow, { color: c.d, width: 4 });
      vec(ctx, plot, c, [0, 0], rest, { color: c.ink, width: 5, text: 'B', dx: -12, dy: -8 });
    }
    if (state.step >= 3) vec(ctx, plot, c, [0, 0], q2, { color: c.c, width: 6, text: 'q2', dx: -14, dy: -10 });
  },
  controls: [
    { title: 'Straighten the basis' },
    { key: 'step', label: 'Step', min: 0, max: 3, step: 1, format: (n) => NAMES[n] },
    { key: 'a', label: 'Direction of a', min: 0, max: 175, step: 5, format: (n) => `${n}°` },
    { key: 'b', label: 'Direction of b', min: 0, max: 175, step: 5, format: (n) => `${n}°` },
    { key: 'lb', label: 'Length of b', min: 1, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['q₁ · q₂', (s) => { const qs = GS(s); return qs.length < 2 ? 'a and b are parallel' : { text: fixed(dot(qs[0], qs[1]), 6), good: true }; }],
      ['|q₁|, |q₂|', (s) => { const qs = GS(s); return qs.length < 2 ? '—' : `${fixed(norm(qs[0]), 3)}, ${fixed(norm(qs[1]), 3)}`; }],
    ] },
  ],
  tex: () => '\\mathbf B=\\mathbf b-(\\mathbf q_1\\cdot\\mathbf b)\\mathbf q_1,\\qquad \\mathbf q_2=\\dfrac{\\mathbf B}{|\\mathbf B|}',
});
