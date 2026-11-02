import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { balance } from './_number-systems-math.js';

const state = { a: 1, b: 1, g: 0 };
const f = (v) => String(v).replace('-', '−');

createTool({
  state,
  label: 'Two bars. The left bar is the value of (−a) times zero, which is zero. The right bar is minus ab plus your guess for (−a)(−b). The bars match only when the guess equals ab.',
  draw(ctx, stage, c) {
    const { a, b, g } = state;
    const right = balance(a, b, g);
    const mid = stage.w / 2;
    const unit = (stage.w / 2 - 30) / 30;
    [[0, 'LHS: (−a)(b + (−b)) = 0', stage.h * 0.2, c.fillB], [right, `RHS: −ab + g = ${f(right)}`, stage.h * 0.5, right === 0 ? c.c : c.a]].forEach(([v, name, y, fill]) => {
      label(ctx, name, mid, y - 14, c, { size: 12, bounds: stage, patch: false });
      const x2 = mid + v * unit;
      poly(ctx, [[mid, y], [x2 || mid + 2, y], [x2 || mid + 2, y + 28], [mid, y + 28]], { fill, stroke: c.ink });
    });
    label(ctx, right === 0 ? 'balanced: the laws hold' : 'not equal: the laws break', mid, stage.h * 0.82, c, { size: 14, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Guess (−a)(−b)' },
    { key: 'a', label: 'a', min: 1, max: 5, step: 1 },
    { key: 'b', label: 'b', min: 1, max: 5, step: 1 },
    { key: 'g', label: 'Guess g for (−a)(−b)', min: -25, max: 25, step: 1 },
    { readout: [
      ['(−a)(b) = −ab', (s) => f(-s.a * s.b)],
      ['−ab + g', (s) => f(balance(s.a, s.b, s.g))],
      ['Must equal', () => '0'],
      ['g must be', (s) => f(s.a * s.b)],
    ] },
  ],
  tex: (s) => `(-${s.a})(${s.b}+(-${s.b}))=0=-${s.a * s.b}+g\\ \\Rightarrow\\ g=${s.a * s.b}`,
});
