import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { keep: 10 };

createTool({
  state,
  label: 'A graph of the fraction of speed kept against the fraction of kinetic energy kept: a square root curve that always lies above the straight line.',
  setup: (stage, c) => createPlot(stage, { x: [0, 100], y: [0, 100], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'KE kept (%)', yLabel: 'speed kept (%)' });
    plot.fn((x) => x, { color: c.ink, dash: [5, 5] });
    plot.fn((x) => 10 * Math.sqrt(x), { color: c.b });
    plot.point(state.keep, 10 * Math.sqrt(state.keep));
  },
  controls: [
    { title: 'Through the board' },
    { key: 'keep', label: 'KE kept (%)', min: 1, max: 100, step: 1 },
    { readout: [
      ['Speed kept', (s) => `${fixed(10 * Math.sqrt(s.keep), 1)}%`],
      ['Energy lost', (s) => `${100 - s.keep}%`],
    ] },
  ],
  tex: (s) => `\\dfrac{v}{v_0}=\\sqrt{\\dfrac{K}{K_0}}=\\sqrt{${s.keep / 100}}=${fixed(Math.sqrt(s.keep / 100), 3)}`,
});
