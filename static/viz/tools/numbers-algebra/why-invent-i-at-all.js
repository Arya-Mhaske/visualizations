import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { cardanoRoots, cardanoUnder, cubic } from './_complex-numbers-math.js';

const state = { c: 4 };
let tool;

createTool({
  state,
  label: 'The graph of y equals x cubed minus 15x in coral, and a horizontal blue line at height c. Where they meet are the solutions of x cubed equals 15x plus c. For c between about minus 22 and 22 the line cuts the curve three times, so all three solutions are real. Yet Cardano\'s formula needs the square root of a negative number to find them.',
  setup: (stage, c) => createPlot(stage, { x: [-5, 5], y: [-40, 40], c }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => x * x * x - 15 * x, { color: c.a, width: 4 });
    plot.segment(-5, state.c, 5, state.c, { color: c.b, width: 4 });
    cardanoRoots(state.c).forEach((x) => plot.point(x, state.c, { fill: c.c, r: 7 }));
  },
  controls: (t) => {
    tool = t;
    return [
      { title: 'Move the line' },
      { key: 'c', label: 'c in x³ = 15x + c', min: -35, max: 35, step: 1 },
      { row: [{ button: 'c = 4 (Bombelli)', onClick: () => { state.c = 4; tool.update(); } }] },
      { readout: [
        ['Number under the √', (s) => fixed(cardanoUnder(s.c), 2)],
        ['The √ asks for', (s) => (cardanoUnder(s.c) < 0 ? { text: `${fixed(Math.sqrt(-cardanoUnder(s.c)), 3)} i`, good: false } : { text: 'a real number', good: true })],
        ['Real solutions', (s) => `${cardanoRoots(s.c).length}`],
        ['They are at x =', (s) => cardanoRoots(s.c).map((x) => fixed(x, 3)).join(', ')],
      ] },
    ];
  },
  tex: (s) => (s.c === 4
    ? '\\sqrt[3]{2+\\sqrt{-121}}+\\sqrt[3]{2-\\sqrt{-121}}=(2+i)+(2-i)=4'
    : `\\text{number under the root}=\\dfrac{c^2}{4}-125=${fixed(cardanoUnder(s.c), 2)}`),
});
