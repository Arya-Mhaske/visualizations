import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { stackBoxes } from './_ig.js';
import { BANK, area } from './_ftc.js';

// Loop 1: f → A(x) = ∫₀ˣ f → A′ = f.  Loop 2: f → f′ → ∫₀ˣ f′ = f(x) − f(0): back to f, minus its starting value.
const state = { loop: 'int', fn: 'wave', x: 2 };
const d = (g, t, h = 1e-4) => (g(t + h) - g(t - h)) / (2 * h);

const tool = createTool({
  state,
  label: 'Three stacked graphs in a loop. The top is the starting function f. The middle is the result of the first operation, integrating or differentiating. The bottom is the result of undoing it. A dashed copy of f in the bottom graph shows the loop returning to f, shifted down by f of zero when you differentiate first.',
  setup: (stage, c) => {
    const bx = stackBoxes(3);
    return bx.map((box) => createPlot(stage, { x: [0, 6.3], y: [-2, 18], c, pad: 20, box }));
  },
  draw(ctx, stage, c, [p1, p2, p3]) {
    const B = BANK[state.fn];
    const f = B.f;
    const mid = state.loop === 'int' ? (t) => area(f, 0, t) : (t) => d(f, t);
    const back = state.loop === 'int' ? (t) => d((u) => area(f, 0, u), t, 1e-3) : (t) => area((u) => d(f, u), 0, t);
    const range = (g) => { let lo = Infinity; let hi = -Infinity; for (let i = 0; i <= 60; i++) { const y = g((6.3 * i) / 60); lo = Math.min(lo, y); hi = Math.max(hi, y); } const pad = (hi - lo) * 0.15 + 0.1; return [lo - pad, hi + pad]; };
    p1.setRange([0, 6.3], range(f));
    p2.setRange([0, 6.3], range(mid));
    p3.setRange([0, 6.3], range(f));
    p1.axes({ xLabel: 't', yLabel: 'f' });
    p1.fn(f, { color: c.a });
    p2.axes({ xLabel: 't', yLabel: state.loop === 'int' ? '∫f' : 'f′' });
    p2.fn(mid, { color: c.b });
    p3.axes({ xLabel: 't', yLabel: state.loop === 'int' ? '(∫f)′' : '∫f′' });
    p3.fn(f, { color: c.a, dash: [6, 5], width: 2 });
    p3.fn(back, { color: c.c });
    for (const [p, g] of [[p1, f], [p2, mid], [p3, back]]) p.point(state.x, g(state.x), { fill: c.ink, r: 5 });
  },
  controls: () => [
    { title: 'Go round the loop' },
    { key: 'loop', label: 'First do', options: [['int', 'integrate, then differentiate'], ['diff', 'differentiate, then integrate']] },
    { key: 'fn', label: 'Function f', options: Object.entries(BANK).map(([k, v]) => [k, v.name]) },
    { key: 'x', label: 'Look at t', min: 0.1, max: 6, step: 0.05, format: (v) => fixed(v, 2) },
    { readout: [
      ['f(t)', (s) => fixed(BANK[s.fn].f(s.x), 4)],
      ['Back at the end', (s) => fixed(s.loop === 'int' ? d((u) => area(BANK[s.fn].f, 0, u), s.x, 1e-3) : area((u) => d(BANK[s.fn].f, u), 0, s.x), 4)],
      ['Lost on the way', (s) => (s.loop === 'int' ? 'nothing' : `f(0) = ${fixed(BANK[s.fn].f(0), 3)}`)],
    ] },
  ],
  tex: (s) => (s.loop === 'int' ? '\\dfrac{d}{dx}\\int_0^x f(t)\\,dt=f(x)' : '\\int_0^x f\'(t)\\,dt=f(x)-f(0)'),
});

tool.update();
