import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { stackBoxes } from './_ig.js';
import { BANK, area } from './_ftc.js';

// A(x) = ∫₀ˣ f. Adding a strip of width h adds about f(x)·h, so the rate A(x+h) − A(x) per h tends to f(x).
const state = { fn: 'wave', x: 2.5, h: 1 };

const tool = createTool({
  state,
  label: 'Top: a curve f with the area up to x shaded blue and a thin extra strip of width h, shaded coral, on its right. Bottom: the area function A of x as a curve, with a coral secant over the same width h. The secant slope matches the height of f, and matches it better as h shrinks.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 6.3], y: BANK.wave.y, c, pad: 24, box: stackBoxes(2)[0] }),
    bottom: createPlot(stage, { x: [0, 6.3], y: BANK.wave.A, c, pad: 24, box: stackBoxes(2)[1] }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    const B = BANK[state.fn];
    const A = (x) => area(B.f, 0, x);
    top.setRange([0, 6.3], B.y);
    bottom.setRange([0, 6.3], B.A);
    top.axes({ xLabel: 't', yLabel: 'f(t)' });
    top.shade(B.f, null, 0, state.x, c.fillB);
    top.shade(B.f, null, state.x, state.x + state.h, c.fillA);
    top.fn(B.f, { color: c.a });
    bottom.axes({ xLabel: 'x', yLabel: 'A(x)' });
    bottom.fn(A, { color: c.b });
    bottom.segment(state.x, A(state.x), state.x + state.h, A(state.x + state.h), { color: c.a, width: 4 });
    bottom.point(state.x, A(state.x), { fill: c.b, r: 6 });
  },
  controls: () => [
    { title: 'Add a thin strip' },
    { key: 'fn', label: 'Curve f', options: Object.entries(BANK).map(([k, v]) => [k, v.name]) },
    { key: 'x', label: 'Area up to x', min: 0.2, max: 5, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'h', label: 'Strip width h', min: 0.01, max: 1.2, step: 0.01, format: (v) => fixed(v, 2) },
    { readout: [
      ['New area ΔA', (s) => fixed(area(BANK[s.fn].f, s.x, s.x + s.h), 4)],
      ['f(x) × h', (s) => fixed(BANK[s.fn].f(s.x) * s.h, 4)],
      ['ΔA ÷ h', (s) => fixed(area(BANK[s.fn].f, s.x, s.x + s.h) / s.h, 4)],
      ['f(x)', (s) => fixed(BANK[s.fn].f(s.x), 4)],
    ] },
  ],
  tex: (s) => `\\dfrac{A(x+h)-A(x)}{h}=${fixed(area(BANK[s.fn].f, s.x, s.x + s.h) / s.h, 3)}\\ \\to\\ f(x)=${fixed(BANK[s.fn].f(s.x), 3)}`,
});

tool.update();
