import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { a: 347, b: 829, dec: 5 };
const roundTo = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
const lookup = (s) => {
  const la = roundTo(Math.log10(s.a), s.dec);
  const lb = roundTo(Math.log10(s.b), s.dec);
  const sum = roundTo(la + lb, s.dec);
  const answer = 10 ** sum;
  return { la, lb, sum, answer, exact: s.a * s.b, error: Math.abs(answer - s.a * s.b) / (s.a * s.b) };
};
const group = (n) => Math.round(n).toLocaleString('en-IN');

createTool({
  state,
  label: 'A multiplication done the way astronomers did it before calculators. Look up the logarithm of each number in a table, add the two logs, then look up which number has that logarithm. The table method needs one addition, while long multiplication needs nine small products. More table decimals give a closer answer.',
  draw(ctx, stage, c) {
    const t = lookup(state);
    const rows = [
      ['1  Look up', `log ${state.a} = ${t.la.toFixed(state.dec)}`],
      ['2  Look up', `log ${state.b} = ${t.lb.toFixed(state.dec)}`],
      ['3  Add (one sum!)', `${t.la.toFixed(state.dec)} + ${t.lb.toFixed(state.dec)} = ${t.sum.toFixed(state.dec)}`],
      ['4  Look up back', `10^${t.sum.toFixed(state.dec)} ≈ ${group(t.answer)}`],
    ];
    rows.forEach(([head, body], i) => {
      const y = 28 + i * 58;
      ctx.fillStyle = i === 2 ? c.fillY : c.fillB;
      ctx.fillRect(10, y - 18, stage.w - 20, 44);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(10, y - 18, stage.w - 20, 44);
      label(ctx, head, 18, y - 5, c, { size: 10, align: 'left', patch: false });
      label(ctx, body, 18, y + 12, c, { size: 13, align: 'left', patch: false });
    });
    label(ctx, `Long multiplication: ${group(t.exact)}`, 10, 28 + 4 * 58 + 6, c, { size: 12, align: 'left', patch: false });
    label(ctx, `needs ${String(state.a).length * String(state.b).length} digit products and carries`, 10, 28 + 4 * 58 + 26, c, { size: 11, align: 'left', patch: false });
  },
  controls: [
    { title: 'Multiply by adding' },
    { key: 'a', label: 'First number', min: 100, max: 999, step: 1 },
    { key: 'b', label: 'Second number', min: 100, max: 999, step: 1 },
    { key: 'dec', label: 'Table decimals', min: 2, max: 7, step: 1 },
    { readout: [
      ['Table answer', (s) => group(lookup(s).answer)],
      ['True product', (s) => group(lookup(s).exact)],
      ['Relative error', (s) => ({ text: `${fixed(lookup(s).error * 100, 4)}%`, good: lookup(s).error < 1e-3 })],
    ] },
  ],
  tex: (s) => `\\log(${s.a}\\times ${s.b})=\\log ${s.a}+\\log ${s.b}=${fixed(lookup(s).sum, s.dec)}`,
});
