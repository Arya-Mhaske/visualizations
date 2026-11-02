import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { EXPRS, leftToRight, precedence } from './_number-systems-math.js';

const state = { e: 0 };
const T = (s) => EXPRS[s.e].tokens;
const show = (t, first) => {
  const [a, o1, b, o2, d] = t;
  return first ? `(${a} ${o1} ${b}) ${o2} ${d}` : `${a} ${o1} (${b} ${o2} ${d})`;
};

createTool({
  state,
  label: 'Two boxes show the same expression worked in two different orders, with their different answers. A line below tells a story that matches the multiplication-first answer.',
  draw(ctx, stage, c) {
    const t = T(state);
    [[`Left to right`, show(t, true), leftToRight(t), c.fillB], [`× and ÷ first`, show(t, false), precedence(t), c.fillC]].forEach(([name, text, v, fill], i) => {
      const y = 16 + i * (stage.h * 0.3);
      const h = stage.h * 0.25;
      poly(ctx, [[12, y], [stage.w - 12, y], [stage.w - 12, y + h], [12, y + h]], { fill, stroke: c.ink });
      label(ctx, name, stage.w / 2, y + 16, c, { size: 12, patch: false });
      label(ctx, `${text} = ${v}`, stage.w / 2, y + h - 22, c, { size: 17, bounds: stage, patch: false });
    });
    label(ctx, leftToRight(t) === precedence(t) ? 'same answer here' : 'different answers!', stage.w / 2, stage.h * 0.66, c, { size: 14, bounds: stage, patch: false });
    label(ctx, EXPRS[state.e].story, stage.w / 2, stage.h * 0.82, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'An expression' },
    { key: 'e', label: 'Expression', options: EXPRS.map((x, i) => [i, x.tokens.join(' ')]) },
    { readout: [
      ['Left to right', (s) => String(leftToRight(T(s)))],
      ['The convention', (s) => String(precedence(T(s)))],
    ] },
  ],
  tex: (s) => `${T(s).join('\\,').replace(/×/g, '\\times').replace(/÷/g, '\\div').replace(/−/g, '-')}=${precedence(T(s))}`,
});
