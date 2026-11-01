import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { chordAt } from './_conics-math.js';
import { curve, trace } from './_conics-view.js';

const state = { a: 2, x: 4 };
const R = 9;
let tool;
const atFocus = (s = state) => Math.abs(s.x - s.a) < 1e-9;

tool = createTool({
  state,
  label: 'A parabola with a vertical chord at a position x that you choose. Its length is shown. When the chord passes through the focus it is called the latus rectum, and its length is exactly four times the focal distance a.',
  setup: (stage, c) => createPlot(stage, { x: [-1, R], y: [-R + 1.5, R - 1.5], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    curve(plot, trace((t) => [state.a * t * t, 2 * state.a * t], -3, 3, 160), { color: c.a, width: 4 });
    const y = chordAt(state.a, state.x) / 2;
    plot.segment(state.x, -y, state.x, y, { color: atFocus() ? c.c : c.b, width: atFocus() ? 7 : 4 });
    plot.point(state.a, 0, { fill: c.c, r: 8 });
    plot.text('F', state.a + 0.4, -0.6, { size: 12, patch: false });
    plot.point(state.x, y, { fill: c.fillY, r: 5 });
    plot.point(state.x, -y, { fill: c.fillY, r: 5 });
  },
  controls: [
    { title: 'Slide the chord' },
    { key: 'a', label: 'Focal distance, a', min: 0.5, max: 3, step: 0.5 },
    { key: 'x', label: 'Chord at x =', min: 0.5, max: 8, step: 0.5 },
    { button: 'Put the chord through the focus', onClick: () => { state.x = state.a; tool.update(); } },
    { readout: [
      ['Chord length', (s) => fixed(chordAt(s.a, s.x), 2)],
      ['4a', (s) => fixed(4 * s.a, 2)],
      ['Through the focus?', (s) => ({ text: atFocus(s) ? 'yes: latus rectum' : 'no', good: atFocus(s) })],
    ] },
  ],
  tex: (s) => `y^2=4a(${fixed(s.x, 1)})\\Rightarrow y=\\pm${fixed(Math.sqrt(4 * s.a * s.x) , 2)}\\Rightarrow\\text{length}=${fixed(chordAt(s.a, s.x), 2)}${atFocus(s) ? `=4a=${4 * s.a}` : ''}`,
});
