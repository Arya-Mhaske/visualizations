import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { evalP, showP, synth } from './_polynomial-math.js';

const state = { a3: 1, a2: -2, a1: -5, a0: 6, c: 2 };
const P = (s = state) => [s.a3, s.a2, s.a1, s.a0];

createTool({
  state,
  label: 'A cubic polynomial and a point c on the x-axis. Dividing by x minus c gives a quotient Q and a remainder R, so P of x equals x minus c times Q of x plus R. Putting x equal to c makes the first term vanish, since x minus c is 0, so P of c is just R. The remainder from synthetic division is the height of the graph at c, shown as a marker.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 5], y: [-12, 14], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => evalP(P(), x), { color: c.a, width: 4 });
    plot.segment(state.c, 0, state.c, evalP(P(), state.c), { color: c.b, width: 4 });
    plot.point(state.c, evalP(P(), state.c), { fill: c.fillY, r: 9 });
    plot.point(state.c, 0, { fill: c.c, r: 6 });
  },
  controls: [
    { title: 'Divide by x − c' },
    { key: 'c', label: 'c', min: -3, max: 4, step: 1 },
    { key: 'a3', label: 'x³ coefficient', min: -3, max: 3, step: 1 },
    { key: 'a2', label: 'x² coefficient', min: -6, max: 6, step: 1 },
    { key: 'a1', label: 'x coefficient', min: -8, max: 8, step: 1 },
    { key: 'a0', label: 'constant', min: -8, max: 8, step: 1 },
    { readout: [
      ['Synthetic division row', (s) => synth(P(s), s.c).row.join(', ')],
      ['Remainder R', (s) => fixed(synth(P(s), s.c).r, 3)],
      ['P(c)', (s) => ({ text: fixed(evalP(P(s), s.c), 3), good: synth(P(s), s.c).r === evalP(P(s), s.c) })],
    ] },
  ],
  onChange(s) { if (s.a3 === 0) s.a3 = 1; },
  tex: (s) => `P(x)=(x-${s.c})\\,(${showP(synth(P(s), s.c).q)})+${synth(P(s), s.c).r}\\ \\Rightarrow\\ P(${s.c})=0+${synth(P(s), s.c).r}`.replace(/-(-\d)/g, '+$1'),
});
