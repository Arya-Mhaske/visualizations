import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { product, sumForm } from './_identities-math.js';

const state = { f1: 7, f2: 6 };
const T = 2 * Math.PI;
const half = (stage) => ({ x: 0, y: 0, w: stage.w, h: stage.h * 0.55 });
const lower = (stage) => ({ x: 0, y: stage.h * 0.55, w: stage.w, h: stage.h * 0.45 });

createTool({
  state,
  label: 'Top graph: the product of two cosine waves in coral, and the sum of a slow cosine and a fast cosine in blue. The two lines are the same curve. Bottom graph: those two parts, each with half the height, one at the difference of the frequencies and one at the sum.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, T], y: [-1.2, 1.2], ticks: 'pi', c, box: half }),
    low: createPlot(stage, { x: [0, T], y: [-0.7, 0.7], ticks: 'pi', c, box: lower }),
  }),
  draw(ctx, stage, c, { top, low }) {
    top.axes({ xLabel: 't', yLabel: '' });
    top.fn((t) => sumForm(state.f1, state.f2, t), { color: c.b, width: 8 });
    top.fn((t) => product(state.f1, state.f2, t), { color: c.a, width: 3 });
    low.axes({ xLabel: 't', yLabel: '' });
    low.fn((t) => Math.cos((state.f1 - state.f2) * t) / 2, { color: c.c, width: 3 });
    low.fn((t) => Math.cos((state.f1 + state.f2) * t) / 2, { color: c.d, width: 2 });
  },
  controls: [
    { title: 'Multiply two waves' },
    { key: 'f1', label: 'Frequency 1 (cycles in the window)', min: 1, max: 12, step: 1 },
    { key: 'f2', label: 'Frequency 2', min: 1, max: 12, step: 1 },
    { readout: [
      ['Slow part (green)', (s) => `${Math.abs(s.f1 - s.f2)} cycles`],
      ['Fast part (purple)', (s) => `${s.f1 + s.f2} cycles`],
    ] },
  ],
  tex: (s) => `\\cos ${s.f1}t\\,\\cos ${s.f2}t=\\tfrac12\\cos ${Math.abs(s.f1 - s.f2)}t+\\tfrac12\\cos ${s.f1 + s.f2}t`,
});
