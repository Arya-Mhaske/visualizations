import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { ellipseHalfHeight, ellipseLatus, ellipsePoint, focalC } from './_conics-math.js';
import { curve, trace } from './_conics-view.js';

const state = { a: 5, b: 3, x: 1 };
const R = 7;
let tool;
const c = (s = state) => focalC(s.a, s.b);
const atFocus = (s = state) => Math.abs(s.x - c(s)) < 1e-9;

tool = createTool({
  state,
  label: 'An ellipse with a vertical chord that you can slide. Its length is shown. When the chord passes through a focus it is called the latus rectum, and its length is 2 b squared over a.',
  setup: (stage, col) => createPlot(stage, { x: [-R, R], y: [-R, R], c: col, pad: 16 }),
  draw(ctx, stage, col, plot) {
    plot.axes({ xLabel: '', yLabel: '' });
    curve(plot, trace((t) => ellipsePoint(state.a, state.b, t), 0, Math.PI * 2, 200), { color: col.a, width: 4 });
    const y = ellipseHalfHeight(state.a, state.b, state.x);
    plot.segment(state.x, -y, state.x, y, { color: atFocus() ? col.c : col.b, width: atFocus() ? 7 : 4 });
    [-c(), c()].forEach((x) => plot.point(x, 0, { fill: col.c, r: 7 }));
    plot.point(state.x, y, { fill: col.fillY, r: 5 });
    plot.point(state.x, -y, { fill: col.fillY, r: 5 });
  },
  controls: [
    { title: 'Slide the chord' },
    { key: 'a', label: 'Semi-major axis, a', min: 3, max: 6, step: 0.5 },
    { key: 'b', label: 'Semi-minor axis, b', min: 1, max: 5, step: 0.5 },
    { key: 'x', label: 'Chord at x =', min: -5.5, max: 5.5, step: 0.1, format: (n) => fixed(n, 1) },
    { button: 'Put the chord through a focus', onClick: () => { state.x = Math.round(c() * 10) / 10 === c() ? c() : c(); tool.update(); } },
    { readout: [
      ['Chord length', (s) => fixed(2 * ellipseHalfHeight(s.a, s.b, s.x), 3)],
      ['2b²/a', (s) => fixed(ellipseLatus(s.a, s.b), 3)],
      ['Through a focus?', (s) => ({ text: atFocus(s) ? 'yes: latus rectum' : 'no', good: atFocus(s) })],
    ] },
  ],
  onChange(s) { if (s.b >= s.a) s.b = s.a - 0.5; },
  tex: (s) => `\\text{at }x=c:\\ y=\\pm\\dfrac{b^2}{a}\\Rightarrow\\text{length}=\\dfrac{2b^2}{a}=\\dfrac{2(${s.b})^2}{${s.a}}=${fixed(ellipseLatus(s.a, s.b), 3)}`,
});
