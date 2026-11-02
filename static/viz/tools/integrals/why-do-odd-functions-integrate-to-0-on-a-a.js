import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact, shadeSigned } from './_ig.js';

// f(−x) = −f(x) (odd): the left area is the mirror of the right area, upside down, so they cancel.
const FS = {
  cube: ['x³ (odd)', (x) => x ** 3, 'odd'],
  sin: ['sin x (odd)', Math.sin, 'odd'],
  gauss: ['x e^(−x²) (odd)', (x) => x * Math.exp(-x * x), 'odd'],
  sq: ['x² (even)', (x) => x * x, 'even'],
  cos: ['cos x (even)', Math.cos, 'even'],
};
const state = { fn: 'cube', a: 1.5 };
const f = (s) => FS[s.fn][1];

const tool = createTool({
  state,
  label: 'A graph of a function on the interval from minus a to a. Area above the axis is green and area below is coral. For an odd function the left half is the right half turned upside down, so the green and coral areas are equal and cancel. For an even function the two halves are mirror images and add.',
  setup: (stage, c) => createPlot(stage, { x: [-3.2, 3.2], y: [-5, 5], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    const g = f(state);
    let hi = 0;
    for (let i = 0; i <= 100; i++) hi = Math.max(hi, Math.abs(g(-state.a + (2 * state.a * i) / 100)));
    plot.setRange([-3.2, 3.2], [-hi * 1.2 - 0.2, hi * 1.2 + 0.2]);
    plot.axes({ xLabel: 'x', yLabel: 'f(x)' });
    shadeSigned(plot, c, g, -state.a, state.a);
    plot.fn(g, { color: c.a, domain: [-3.2, 3.2] });
    plot.segment(-state.a, -50, -state.a, 50, { color: c.ink, width: 2, dash: [4, 4] });
    plot.segment(state.a, -50, state.a, 50, { color: c.ink, width: 2, dash: [4, 4] });
  },
  controls: () => [
    { title: 'Integrate from −a to a' },
    { key: 'fn', label: 'Function', options: Object.entries(FS).map(([k, v]) => [k, v[0]]) },
    { key: 'a', label: 'a', min: 0.2, max: 3, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['Left half, −a to 0', (s) => fixed(exact(f(s), -s.a, 0), 4)],
      ['Right half, 0 to a', (s) => fixed(exact(f(s), 0, s.a), 4)],
      ['Whole, −a to a', (s) => fixed(exact(f(s), -s.a, s.a), 4)],
      ['Type', (s) => FS[s.fn][2]],
    ] },
  ],
  tex: (s) => (FS[s.fn][2] === 'odd' ? `\\int_{-a}^{a}f\\,dx=0\\quad(f\\ \\text{odd})` : `\\int_{-a}^{a}f\\,dx=2\\int_0^a f\\,dx=${fixed(exact(f(s), -s.a, s.a), 3)}`),
});

tool.update();
