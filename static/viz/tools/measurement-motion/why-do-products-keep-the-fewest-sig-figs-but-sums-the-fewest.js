import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { TRUE_A, TRUE_B, combine, leastCount, measure } from './_units-measurement-math.js';

const state = { op: 'sum', da: 1, db: 3 };
const read = () => {
  const a = measure(TRUE_A, state.da);
  const b = measure(TRUE_B, state.db);
  return { a, b, out: combine(state.op, a, b) };
};

createTool({
  state,
  label: 'Two measurements with their uncertainty as bars, and the uncertainty of their sum or product as a stacked bar. For a sum the bars are absolute sizes; for a product they are relative sizes.',
  draw(ctx, stage, c) {
    const { a, b, out } = read();
    const sum = state.op === 'sum';
    const ea = sum ? leastCount(state.da) : leastCount(state.da) / Number(a);
    const eb = sum ? leastCount(state.db) : leastCount(state.db) / Number(b);
    const pad = 16;
    const full = stage.w - 2 * pad;
    const scale = full / (ea + eb);
    const bar = (y, start, size, fill, text) => {
      const w = Math.max(3, size * scale);
      ctx.fillStyle = fill;
      ctx.fillRect(pad + start, y, w, 30);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = c.line;
      ctx.strokeRect(pad + start, y, w, 30);
      if (text) label(ctx, text, pad, y - 12, c, { align: 'left', bounds: stage, size: 12 });
      return w;
    };
    const unit = sum ? 'absolute error' : 'relative error';
    const show = (e) => (sum ? fixed(e, 3) : `${fixed(e * 100, 2)}%`);
    bar(stage.h * 0.14, 0, ea, c.a, `a = ${a} → ${unit} ${show(ea)}`);
    bar(stage.h * 0.34, 0, eb, c.b, `b = ${b} → ${unit} ${show(eb)}`);
    const wa = bar(stage.h * 0.58, 0, ea, c.a, `${sum ? 'a + b' : 'a × b'} → ${unit} ${show(ea + eb)} (the two add)`);
    bar(stage.h * 0.58, wa, eb, c.b, '');
    label(ctx, sum ? `${a} + ${b} = ${out.exact} ± ${sig(out.error, 3)}` : `${a} × ${b} = ${out.exact} ± ${sig(out.error, 2)}`, stage.w / 2, stage.h * 0.78, c, { bounds: stage, size: 13 });
    label(ctx, `Rule says: ${out.ruleText}`, stage.w / 2, stage.h * 0.88, c, { bounds: stage, size: 15 });
  },
  controls: [
    { title: 'Combine two measurements' },
    { key: 'op', label: 'Operation', options: [['sum', 'Add'], ['product', 'Multiply']] },
    { key: 'da', label: 'Decimals in a', min: 0, max: 3, step: 1 },
    { key: 'db', label: 'Decimals in b', min: 0, max: 3, step: 1 },
    { readout: [
      ['a', () => read().a],
      ['b', () => read().b],
      ['Exact result', () => read().out.exact],
      ['Uncertainty', (s) => (s.op === 'sum' ? `± ${sig(read().out.error, 2)}` : `± ${sig(read().out.error, 2)} (${fixed(read().out.relative * 100, 2)}%)`)],
      ['Rule keeps', (s) => (s.op === 'sum' ? `${read().out.ruleDecimals} decimals` : `${read().out.sf} sig figs`)],
      ['Rule gives', () => read().out.ruleText],
      ['Error bar agrees?', () => {
        const ok = read().out.ruleDecimals === read().out.errorDecimals;
        return { text: ok ? 'yes, same last digit' : 'off by a digit: the rule is a shortcut', good: ok };
      }],
    ] },
  ],
  tex: (s) => (s.op === 'sum'
    ? `\\Delta(a+b) = \\Delta a + \\Delta b = ${fixed(leastCount(s.da), 3)} + ${fixed(leastCount(s.db), 3)}`
    : `\\frac{\\Delta(ab)}{ab} = \\frac{\\Delta a}{a} + \\frac{\\Delta b}{b} = ${fixed(read().out.relative * 100, 2)}\\%`),
});
