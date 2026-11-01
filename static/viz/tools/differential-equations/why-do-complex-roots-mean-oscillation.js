import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { al: -0.2, be: 2 };
const y = (s, x) => Math.exp(s.al * x) * Math.cos(s.be * x);
const y1 = (s, x) => Math.exp(s.al * x) * (s.al * Math.cos(s.be * x) - s.be * Math.sin(s.be * x));
const y2 = (s, x) => Math.exp(s.al * x) * ((s.al ** 2 - s.be ** 2) * Math.cos(s.be * x) - 2 * s.al * s.be * Math.sin(s.be * x));
const bq = (s) => [-2 * s.al, s.al ** 2 + s.be ** 2];
const residual = (s) => {
  const [b, q] = bq(s);
  let worst = 0;
  for (let i = 0; i <= 200; i++) { const x = i * 0.05; worst = Math.max(worst, Math.abs(y2(s, x) + b * y1(s, x) + q * y(s, x))); }
  return worst;
};

createTool({
  state,
  label: 'The solution e to the alpha x times cos of beta x for roots alpha plus or minus i beta. The cosine part makes the wave and the exponential part makes the envelope, drawn as dashed curves, which grows if alpha is positive and shrinks if it is negative. The readouts give the equation this solves and check it numerically.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [-2, 2], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 10], [-2.5, 2.5]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn((x) => Math.exp(state.al * x), { color: c.b, width: 2, dash: [6, 5] });
    plot.fn((x) => -Math.exp(state.al * x), { color: c.b, width: 2, dash: [6, 5] });
    plot.fn((x) => y(state, x), { color: c.a, width: 4 });
  },
  controls: [
    { title: 'Choose complex roots' },
    { key: 'al', label: 'Real part α', min: -1, max: 0.3, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'be', label: 'Imaginary part β', min: 0, max: 5, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['Equation solved', (s) => `y″ + ${fixed(bq(s)[0], 2)} y′ + ${fixed(bq(s)[1], 2)} y = 0`],
      ['Largest leftover', (s) => ({ text: residual(s).toExponential(1), good: residual(s) < 1e-9 })],
      ['Behaviour', (s) => (s.be === 0 ? 'no oscillation' : s.al < 0 ? 'oscillation dying out' : s.al === 0 ? 'steady oscillation' : 'oscillation growing')],
    ] },
  ],
  tex: (s) => String.raw`e^{(${fixed(s.al, 2)}+${fixed(s.be, 1)}i)x}=e^{${fixed(s.al, 2)}x}\left(\cos ${fixed(s.be, 1)}x+i\sin ${fixed(s.be, 1)}x\right)`,
});
