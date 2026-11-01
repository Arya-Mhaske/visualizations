import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { floor, fractional } from './_properties-library-math.js';

const state = { x: 1.5 };
const atInteger = (s) => Math.abs(s.x - Math.round(s.x)) < 1e-9;

createTool({
  state,
  label: 'The staircase graph of the greatest-integer function. A dot slides along it as you move x. At each whole number the height jumps up by one: the left piece ends in an empty dot and the next piece starts with a filled dot.',
  setup: (stage, c) => createPlot(stage, { x: [-3.5, 3.5], y: [-4, 4], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ grid: true });
    for (let n = -4; n < 4; n++) {
      plot.segment(n, n, n + 1, n, { color: c.b, width: 4 });
      plot.point(n, n, { fill: c.ink, r: 5 });
      plot.point(n + 1, n, { fill: c.paper, r: 5 });
    }
    const y = floor(state.x);
    plot.segment(state.x, 0, state.x, y, { color: c.a, width: 2, dash: [5, 4] });
    plot.point(state.x, y, { fill: c.a, r: 9 });
    plot.text(`⌊${fixed(state.x, 2)}⌋ = ${y}`, Math.min(2.2, Math.max(-2.2, state.x)), y + 0.9, { size: 12 });
  },
  controls: [
    { title: 'Slide x across a whole number' },
    { key: 'x', label: 'Input, x', min: -3.5, max: 3.5, step: 0.05, format: (n) => fixed(n, 2) },
    { readout: [
      ['⌊x⌋', (s) => floor(s.x)],
      ['A hair to the left', (s) => floor(s.x - 0.001)],
      ['Fractional part', (s) => fixed(fractional(s.x), 2)],
      ['At a whole number?', (s) => ({ text: atInteger(s) ? 'yes: a jump' : 'no', good: !atInteger(s) })],
    ] },
  ],
  tex: (s) => `\\lfloor ${fixed(s.x, 2)}\\rfloor=${floor(s.x)},\\quad x-\\lfloor x\\rfloor=${fixed(fractional(s.x), 2)}`,
});
