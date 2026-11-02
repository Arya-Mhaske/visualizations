import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes } from './_is.js';
import { ratio, seriesRatio } from '../oscillations-waves/_pendulum-math.js';

// sin θ = θ − θ³/6 + …, so replacing sin θ by θ is only good for small θ. The true period is longer than 2π√(L/g).
const state = { deg: 20 };
const rad = () => (state.deg * Math.PI) / 180;
const [boxA, boxB] = boxes(2);
const MAX = (Math.PI * 170) / 180;

createTool({
  state,
  label: 'Top: sine of theta against theta itself and theta minus theta cubed over six. Bottom: the true period of a pendulum divided by the small-angle period, against the amplitude.',
  setup: (stage, c) => ({
    a: createPlot(stage, { x: [0, MAX], y: [0, 3], c, box: boxA, ticks: 'auto' }),
    b: createPlot(stage, { x: [0, MAX], y: [0.9, 3], c, box: boxB }),
  }),
  draw(ctx, stage, c, { a, b }) {
    a.axes({ xLabel: 'θ (rad)', yLabel: 'y' });
    a.fn((t) => t, { color: c.b, width: 3, dash: [6, 4] });
    a.fn((t) => t - t ** 3 / 6, { color: c.c, width: 2.5 });
    a.fn(Math.sin, { color: c.a, width: 3 });
    a.segment(rad(), 0, rad(), 3, { color: c.ink, width: 1.5, dash: [4, 4] });
    b.axes({ xLabel: 'amplitude θ₀ (rad)', yLabel: 'T / T₀' });
    b.fn((t) => ratio(Math.max(t, 1e-6)), { color: c.a, width: 3, domain: [0.001, MAX] });
    b.fn((t) => seriesRatio(t, 2), { color: c.c, width: 2.5, dash: [6, 4], domain: [0, MAX] });
    b.segment(0, 1, MAX, 1, { color: c.b, width: 2, dash: [6, 4] });
    b.segment(rad(), 0.9, rad(), 3, { color: c.ink, width: 1.5, dash: [4, 4] });
    b.point(rad(), ratio(rad()), { fill: c.a });
  },
  controls: [
    { title: 'Swing it wider' },
    { key: 'deg', label: 'Amplitude θ₀', min: 1, max: 170, step: 1, format: (v) => `${v}°` },
    { readout: [
      ['sin θ₀', () => Math.sin(rad()).toFixed(5)],
      ['θ₀ (radians)', () => rad().toFixed(5)],
      ['sin θ ≈ θ is off by', () => `${(((rad() - Math.sin(rad())) / Math.sin(rad())) * 100).toFixed(2)}%`],
      ['True T ÷ small-angle T₀', () => ratio(rad()).toFixed(4)],
      ['Period too short by', () => `${((1 - 1 / ratio(rad())) * 100).toFixed(2)}%`],
    ] },
  ],
  tex: (s) => `\\sin\\theta=\\theta-\\frac{\\theta^3}{6}+\\cdots,\\qquad \\frac{T}{T_0}\\approx 1+\\frac{\\theta_0^2}{16}+\\frac{11\\theta_0^4}{3072}`,
});
