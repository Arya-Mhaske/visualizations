import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { TAU, apparentCycles, nyquist, sampledPoints } from './_sine-cosine-math.js';

const state = { cycles: 3, samples: 40 };
const faithful = (s = state) => s.cycles < nyquist(s.samples);

createTool({
  state,
  label: 'A grey sine wave, and below it in coral the graph a plotter draws by taking a fixed number of samples across the window and joining them with straight lines. With few cycles in the window the coral graph copies the wave. When the window is zoomed out so far that there are fewer than two samples per cycle, the coral graph shows a slower wave that is not really there.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [-1.6, 1.6], c, pad: 22 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'window', yLabel: 'y', grid: false });
    plot.fn((x) => Math.sin(TAU * state.cycles * x), { color: c.grid, width: 2 });
    const pts = sampledPoints(state.cycles, state.samples);
    pts.slice(1).forEach(([x, y], i) => plot.segment(pts[i][0], pts[i][1], x, y, { color: faithful() ? c.c : c.a, width: 3 }));
    pts.forEach(([x, y]) => plot.point(x, y, { fill: c.paper, r: 3 }));
    plot.text(faithful() ? 'the plotter copies the wave' : 'a fake, slower wave', 0.5, 1.35, { size: 12, color: faithful() ? c.c : c.a });
  },
  controls: [
    { title: 'Zoom the window out' },
    { key: 'cycles', label: 'Cycles of the true wave in the window', min: 1, max: 120, step: 1 },
    { key: 'samples', label: 'Samples the plotter takes', min: 20, max: 100, step: 10 },
    { readout: [
      ['Samples per cycle', (s) => fixed(s.samples / s.cycles, 2)],
      ['Needs at least', () => '2 per cycle'],
      ['Cycles the plotter shows', (s) => fixed(apparentCycles(s.cycles, s.samples), 1)],
      ['Verdict', (s) => ({ text: faithful(s) ? 'honest' : 'FAKE WAVE', good: faithful(s) })],
    ] },
  ],
  tex: (s) => `\\text{cycles seen}=\\left|c-N\\cdot\\text{round}\\left(\\dfrac{c}{N}\\right)\\right|=${fixed(apparentCycles(s.cycles, s.samples), 1)}`,
});
