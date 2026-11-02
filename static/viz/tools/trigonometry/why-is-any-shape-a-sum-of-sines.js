import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { SHAPES, TAU, partialSum } from './_waves-math.js';

const state = { shape: 'square', N: 3, last: true };

createTool({
  state,
  label: 'A target shape in grey, the sum of the first N sine harmonics in coral, and the newest harmonic added in blue. As N grows, the coral curve hugs the target more closely.',
  setup: (stage, c) => createPlot(stage, { x: [-TAU, TAU], y: [-1.6, 1.6], c, ticks: 'pi', pad: 26 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const shape = SHAPES[state.shape];
    plot.fn(shape.target, { color: c.grid, width: 4 });
    if (state.last) {
      const n = lastNonZero();
      if (n) plot.fn((x) => shape.coef(n) * Math.sin(n * x), { color: c.b, width: 3 });
    }
    plot.fn(partialSum(state.shape, state.N), { color: c.a, width: 4 });
  },
  controls: [
    { title: 'Build a shape from sines' },
    { key: 'shape', label: 'Target', options: [['square', 'Square'], ['saw', 'Sawtooth'], ['triangle', 'Triangle']] },
    { key: 'N', label: 'Sines added, N', min: 1, max: 30, step: 1 },
    { toggle: true, key: 'last', label: 'Show the newest sine' },
    { readout: [
      ['Newest sine', (s) => { const n = lastNonZero(); return n ? `sin ${n}x, height ${fixed(Math.abs(SHAPES[s.shape].coef(n)), 3)}` : 'none'; }],
      ['Gap at x = π/2', (s) => fixed(Math.abs(partialSum(s.shape, s.N)(Math.PI / 2) - SHAPES[s.shape].target(Math.PI / 2)), 3)],
    ] },
  ],
  tex: (s) => (s.shape === 'square' ? `\\dfrac{4}{\\pi}\\Big(\\sin x+\\dfrac{\\sin 3x}{3}+\\dfrac{\\sin 5x}{5}+\\cdots\\Big)` : s.shape === 'saw' ? `\\dfrac{2}{\\pi}\\Big(\\sin x-\\dfrac{\\sin 2x}{2}+\\dfrac{\\sin 3x}{3}-\\cdots\\Big)` : `\\dfrac{8}{\\pi^2}\\Big(\\sin x-\\dfrac{\\sin 3x}{9}+\\dfrac{\\sin 5x}{25}-\\cdots\\Big)`),
});

function lastNonZero() {
  for (let n = state.N; n >= 1; n--) if (SHAPES[state.shape].coef(n) !== 0) return n;
  return 0;
}
