import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { machineRow, num } from './_combining-view.js';

const TARGETS = [
  { name: '√(x² + 1)', t: (x) => Math.sqrt(x * x + 1), opts: [
    { g: 'x² + 1', f: '√u', gf: (x) => x * x + 1, ff: (u) => Math.sqrt(u) },
    { g: 'x²', f: '√(u + 1)', gf: (x) => x * x, ff: (u) => Math.sqrt(u + 1) },
    { g: '√(x² + 1)', f: 'u (does nothing)', gf: (x) => Math.sqrt(x * x + 1), ff: (u) => u },
    { g: 'x²', f: '√u + 1', gf: (x) => x * x, ff: (u) => Math.sqrt(u) + 1 }] },
  { name: '(3x − 2)⁴', t: (x) => (3 * x - 2) ** 4, opts: [
    { g: '3x − 2', f: 'u⁴', gf: (x) => 3 * x - 2, ff: (u) => u ** 4 },
    { g: '(3x − 2)²', f: 'u²', gf: (x) => (3 * x - 2) ** 2, ff: (u) => u * u },
    { g: '3x', f: '(u − 2)⁴', gf: (x) => 3 * x, ff: (u) => (u - 2) ** 4 },
    { g: 'x⁴', f: '3u − 2', gf: (x) => x ** 4, ff: (u) => 3 * u - 2 }] },
  { name: '1 ÷ (x + 5)', t: (x) => 1 / (x + 5), opts: [
    { g: 'x + 5', f: '1/u', gf: (x) => x + 5, ff: (u) => 1 / u },
    { g: '1/x', f: 'u + 5', gf: (x) => 1 / x, ff: (u) => u + 5 },
    { g: 'x', f: '1/(u + 5)', gf: (x) => x, ff: (u) => 1 / (u + 5) },
    { g: 'x + 5', f: 'u − 1', gf: (x) => x + 5, ff: (u) => u - 1 }] },
];
const TESTS = [-2, -1, 0, 1, 2, 3];
const state = { target: 0, opt: 0, x: 2 };
const T = (s = state) => TARGETS[s.target];
const O = (s = state) => T(s).opts[s.opt];
const works = (s) => TESTS.every((x) => { const a = O(s).ff(O(s).gf(x)); const b = T(s).t(x); return (Number.isNaN(a) && Number.isNaN(b)) || Math.abs(a - b) < 1e-9; });

createTool({
  state,
  label: 'A function taken apart into two machines: an inner function g that is applied first and an outer function f that is applied to the result. Several different splits can be correct for the same function. The page tries each split on six test values and says whether putting the two machines together reproduces the original function everywhere. Some of the splits are wrong, on purpose.',
  draw(ctx, stage, c) {
    const g = O().gf(state.x);
    machineRow(ctx, stage, c, stage.h * 0.3, state.x, [{ name: O().g, value: g }, { name: O().f, value: O().ff(g) }], { title: 'inner machine g, then outer machine f' });
  },
  controls: [
    { title: 'Pick a split' },
    { key: 'target', label: 'Function', min: 0, max: TARGETS.length - 1, step: 1, format: (v) => TARGETS[v].name },
    { key: 'opt', label: 'Split number', min: 0, max: 3, step: 1, format: (v) => `${v + 1}` },
    { key: 'x', label: 'Test value, x', min: -2, max: 3, step: 1 },
    { readout: [
      ['Inner g(x)', (s) => O(s).g],
      ['Outer f(u)', (s) => O(s).f],
      ['f(g(x)) at the test value', (s) => num(O(s).ff(O(s).gf(s.x)))],
      ['Original at the test value', (s) => num(T(s).t(s.x))],
      ['Whole function matches?', (s) => ({ text: works(s) ? 'yes' : 'no: this split is wrong', good: works(s) })],
    ] },
  ],
  tex: (s) => `${T(s).name}=f(g(x)),\\ g(x)=\\text{${O(s).g}},\\ f(u)=\\text{${O(s).f}}`,
});
