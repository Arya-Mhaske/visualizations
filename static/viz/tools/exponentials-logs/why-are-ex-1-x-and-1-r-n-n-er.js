import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { view: 'zoom', h: 2, n: 4, r: 2 };
const f = (n, r) => (1 + r / n) ** n;

createTool({
  state,
  label: 'In the zoom view the curve e to the x and the line 1 plus x are drawn near zero; as you zoom in the two become impossible to tell apart. In the compounding view the curve one plus r over n to the n is drawn against r for the n you choose, and it hugs e to the r more tightly as n grows.',
  setup: (stage, c) => createPlot(stage, { x: [-2, 2], y: [-1, 4], c }),
  draw(ctx, stage, c, plot) {
    if (state.view === 'zoom') {
      const h = state.h;
      plot.setRange([-h, h], [1 - 1.3 * h, 1 + 1.3 * h]);
      plot.axes({ xLabel: 'x', yLabel: 'y' });
      plot.fn((x) => 1 + x, { color: c.b, width: 5 });
      plot.fn(Math.exp, { color: c.a, width: 3 });
      plot.point(0, 1, { fill: c.fillY, r: 7 });
    } else {
      plot.setRange([0, 3], [1, 21]);
      plot.axes({ xLabel: 'r', yLabel: 'y' });
      plot.fn(Math.exp, { color: c.a, width: 5 });
      plot.fn((r) => f(state.n, r), { color: c.b, width: 3 });
      plot.segment(state.r, 1, state.r, Math.exp(state.r), { color: c.grid, width: 2, dash: [4, 4] });
      plot.point(state.r, Math.exp(state.r), { fill: c.a, r: 8 });
      plot.point(state.r, f(state.n, state.r), { fill: c.b, r: 7 });
    }
  },
  controls: [
    { title: 'Zoom or compound' },
    { key: 'view', label: 'View', options: [['zoom', 'Zoom in at 0'], ['compound', 'Compound more']] },
    { key: 'h', label: 'Window half-width', min: 0.05, max: 3, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'n', label: 'Compounded n times', min: 1, max: 200, step: 1 },
    { key: 'r', label: 'Rate r', min: 0.2, max: 3, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['e^h', (s) => (s.view === 'zoom' ? fixed(Math.exp(s.h), 5) : '—')],
      ['1 + h', (s) => (s.view === 'zoom' ? fixed(1 + s.h, 5) : '—')],
      ['(1+r/n)ⁿ', (s) => (s.view === 'compound' ? fixed(f(s.n, s.r), 4) : '—')],
      ['e^r', (s) => (s.view === 'compound' ? fixed(Math.exp(s.r), 4) : '—')],
    ] },
  ],
  tex: (s) => (s.view === 'zoom' ? `e^{${fixed(s.h, 2)}}=${fixed(Math.exp(s.h), 5)}\\ \\approx\\ 1+${fixed(s.h, 2)}=${fixed(1 + s.h, 5)}` : `\\left(1+\\tfrac{${fixed(s.r, 1)}}{${s.n}}\\right)^{${s.n}}=${fixed(f(s.n, s.r), 4)}\\ \\approx\\ e^{${fixed(s.r, 1)}}=${fixed(Math.exp(s.r), 4)}`),
  onChange: (s) => show(s),
});

const fields = [...document.querySelectorAll('#panel .nb-field')];
function show(s) {
  if (fields.length < 4) return;
  fields[1].hidden = s.view !== 'zoom';
  fields[2].hidden = s.view !== 'compound';
  fields[3].hidden = s.view !== 'compound';
}
show(state);
