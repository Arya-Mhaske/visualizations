import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const FNS = [
  { name: 'sin', f: Math.sin, inv: Math.asin, invName: 'sin⁻¹ x (arcsin)', recName: '(sin x)⁻¹ = cosec x', view: [[-1, 1], [-2, 2]], recView: [[-4, 4], [-4, 4]], v: [-0.95, 0.95] },
  { name: 'x³', f: (x) => x ** 3, inv: Math.cbrt, invName: 'the cube root', recName: '1 ÷ x³', view: [[-4, 4], [-4, 4]], recView: [[-4, 4], [-4, 4]], v: [-3, 3] },
];
const state = { which: 0, v: 0.5 };
const F = (s = state) => FNS[s.which];
const upper = (stage) => ({ x: 0, y: 0, w: stage.w, h: stage.h * 0.5 });
const lower = (stage) => ({ x: 0, y: stage.h * 0.5, w: stage.w, h: stage.h * 0.5 });

createTool({
  state,
  label: 'Two graphs for the same function f. Top: the inverse function, which undoes f, so it takes an output of f back to its input. Bottom: the reciprocal 1 over f, which is f\'s value turned upside down. They are completely different functions. The little minus 1 in sin to the minus 1 means the inverse, and it is a different thing from the power minus 1 of a number, which is the reciprocal. A marker at the same v shows both values.',
  setup: (stage, c) => ({ top: createPlot(stage, { x: [-1, 1], y: [-2, 2], c, box: upper, pad: 20 }), low: createPlot(stage, { x: [-4, 4], y: [-4, 4], c, box: lower, pad: 20 }) }),
  draw(ctx, stage, c, { top, low }) {
    const k = F();
    top.setRange(...k.view);
    low.setRange(...k.recView);
    top.axes({ xLabel: '', yLabel: '' });
    low.axes({ xLabel: '', yLabel: '' });
    top.fn(k.inv, { color: c.b, width: 4 });
    low.fn((x) => 1 / k.f(x), { color: c.a, width: 4 });
    if (Math.abs(state.v) <= k.v[1]) {
      top.point(state.v, k.inv(state.v), { fill: c.fillY, r: 8 });
      low.point(state.v, 1 / k.f(state.v), { fill: c.fillY, r: 8 });
    }
  },
  controls: [
    { title: 'Same input v, two different functions' },
    { key: 'which', label: 'Function f', min: 0, max: FNS.length - 1, step: 1, format: (v) => FNS[v].name },
    { key: 'v', label: 'v', min: -0.95, max: 0.95, step: 0.05 },
    { readout: [
      ['Inverse: f⁻¹(v)', (s) => ({ text: fixed(F(s).inv(s.v), 4), good: true })],
      ['Check: f(f⁻¹(v))', (s) => fixed(F(s).f(F(s).inv(s.v)), 4)],
      ['Reciprocal: 1 ÷ f(v)', (s) => ({ text: Number.isFinite(1 / F(s).f(s.v)) ? fixed(1 / F(s).f(s.v), 4) : 'undefined', good: false })],
    ] },
  ],
  tex: (s) => `f^{-1}(${s.v})=${fixed(F(s).inv(s.v), 3)}\\qquad\\dfrac1{f(${s.v})}=${Number.isFinite(1 / F(s).f(s.v)) ? fixed(1 / F(s).f(s.v), 3) : '\\text{undefined}'}`,
});
