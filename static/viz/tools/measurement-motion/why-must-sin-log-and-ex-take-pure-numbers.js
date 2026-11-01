import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';

// sin x = x - x^3/3! + x^5/5! - ... If x has a unit, every term has a different unit and the sum is meaningless.
const state = { mode: 'length', s: 5, r: 2 };
const fact = [1, 6, 120];
const xOf = (s) => (s.mode === 'ratio' ? s.s / s.r : s.s);
const terms = (s) => [xOf(s), -(xOf(s) ** 3) / fact[1], xOf(s) ** 5 / fact[2]];
const unitsOf = (s, k) => {
  if (s.mode === 'number') return '';
  if (s.mode === 'ratio') return ' (no unit)';
  const p = 2 * k + 1;
  return p === 1 ? ' m' : ` m${p === 3 ? '³' : '⁵'}`;
};
const meaningful = (s) => s.mode !== 'length';

const tool = createTool({
  state,
  label: 'The first three terms of the series for sine, with the units each one would carry. When x is a length in metres the terms are in metres, cubic metres and fifth powers of metres, which cannot be added. When x is a ratio of two lengths all the terms are pure numbers and the sum makes sense.',
  draw(ctx, stage, c) {
    const t = terms(state);
    const rowH = stage.h / 5;
    ['x', '− x³/3!', '+ x⁵/5!'].forEach((name, k) => {
      const y = rowH * (k + 0.5);
      const bad = !meaningful(state);
      ctx.fillStyle = bad ? c.fillA : c.fillC;
      ctx.fillRect(16, y - rowH * 0.32, stage.w - 32, rowH * 0.64);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(16, y - rowH * 0.32, stage.w - 32, rowH * 0.64);
      label(ctx, `${name} = ${sig(t[k], 3)}${unitsOf(state, k)}`, stage.w / 2, y, c, { color: c.ink, size: 13, patch: false, bounds: stage });
    });
    const y = rowH * 3.7;
    if (meaningful(state)) {
      label(ctx, 'all terms are pure numbers, so they can be added', stage.w / 2, y, c, { color: c.ink, size: 13, bounds: stage });
      label(ctx, `the whole series gives sin(${sig(xOf(state), 3)}) = ${sig(Math.sin(xOf(state)), 3)}`, stage.w / 2, y + 28, c, { color: c.c, size: 13, bounds: stage });
    } else {
      label(ctx, 'sum = ?  metres + cubic metres + ...', stage.w / 2, y, c, { color: c.ink, size: 14, bounds: stage });
      label(ctx, `so sin(${state.s} m) means nothing`, stage.w / 2, y + 28, c, { color: c.a, size: 14, bounds: stage });
    }
  },
  controls: () => [
    { title: 'Take the sine of something' },
    { key: 'mode', label: 'x is', options: [['number', 'A number'], ['length', 'A length'], ['ratio', 'Arc ÷ radius']] },
    { key: 's', label: 'Arc or length, s', min: 0.5, max: 6, step: 0.5, format: (n) => (state.mode === 'number' ? fixed(n, 1) : `${fixed(n, 1)} m`) },
    { key: 'r', label: 'Radius, r', min: 1, max: 6, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    { readout: [
      ['x', (s) => (s.mode === 'ratio' ? `${fixed(s.s, 1)} m ÷ ${fixed(s.r, 1)} m = ${sig(xOf(s), 3)}` : s.mode === 'length' ? `${fixed(s.s, 1)} m` : fixed(s.s, 1))],
      ['Can we take sin x?', (s) => (meaningful(s) ? { text: 'yes: x has no unit', good: true } : { text: 'no: x has a unit', good: false })],
    ] },
  ],
  tex: () => '\\sin x=x-\\dfrac{x^3}{3!}+\\dfrac{x^5}{5!}-\\cdots',
  onChange: () => show(),
});
const fields = [...document.querySelectorAll('#panel .nb-field')];
const show = () => {
  // fields: mode, s, r
  fields[2].hidden = state.mode !== 'ratio';
};
show();
tool.update();
