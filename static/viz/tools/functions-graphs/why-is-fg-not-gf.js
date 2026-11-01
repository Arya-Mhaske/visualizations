import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { machineRow, num } from './_combining-view.js';

const FUNCS = [
  { name: 'add 3', f: (x) => x + 3, tex: 'x+3' },
  { name: 'double', f: (x) => 2 * x, tex: '2x' },
  { name: 'square', f: (x) => x * x, tex: 'x^2' },
  { name: 'take 1', f: (x) => x - 1, tex: 'x-1' },
  { name: 'root', f: (x) => (x < 0 ? NaN : Math.sqrt(x)), tex: '\\sqrt x' },
];
const state = { f: 1, g: 0, x: 2 };
const F = (s = state) => FUNCS[s.f];
const G = (s = state) => FUNCS[s.g];
const fg = (s) => F(s).f(G(s).f(s.x));
const gf = (s) => G(s).f(F(s).f(s.x));

createTool({
  state,
  label: 'Two function machines used in two orders. In the top row the number goes through g first and then f, giving f of g of x. In the bottom row it goes through f first and then g, giving g of f of x. Like putting on socks and then shoes, compared with shoes and then socks, the order changes the result. The numbers after each machine are shown. Choose two functions that do commute, like double and square the root, to see an exception.',
  draw(ctx, stage, c) {
    machineRow(ctx, stage, c, stage.h * 0.28, state.x, [{ name: G().name, value: G().f(state.x) }, { name: F().name, value: fg(state) }], { title: 'f∘g: do g first, then f' });
    machineRow(ctx, stage, c, stage.h * 0.72, state.x, [{ name: F().name, value: F().f(state.x) }, { name: G().name, value: gf(state) }], { title: 'g∘f: do f first, then g' });
  },
  controls: [
    { title: 'Choose two machines' },
    { key: 'f', label: 'f', min: 0, max: FUNCS.length - 1, step: 1, format: (v) => FUNCS[v].name },
    { key: 'g', label: 'g', min: 0, max: FUNCS.length - 1, step: 1, format: (v) => FUNCS[v].name },
    { key: 'x', label: 'Input, x', min: 0, max: 9, step: 1 },
    { readout: [
      ['f(g(x))', (s) => num(fg(s))],
      ['g(f(x))', (s) => num(gf(s))],
      ['Same?', (s) => ({ text: Math.abs(fg(s) - gf(s)) < 1e-9 ? 'yes, this time' : 'no', good: Math.abs(fg(s) - gf(s)) < 1e-9 })],
    ] },
  ],
  tex: (s) => `f(g(${s.x}))=${num(fg(s))},\\quad g(f(${s.x}))=${num(gf(s))}`,
});
