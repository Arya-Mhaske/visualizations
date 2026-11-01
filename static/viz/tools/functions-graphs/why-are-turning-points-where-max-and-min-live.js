import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { SHAPES, turningPoints, stretches } from './_properties-library-math.js';

const state = { fn: 'cubic', x: -2 };
const S = (s = state) => SHAPES[s.fn];
const verdict = (s) => {
  const slope = S(s).df(s.x);
  return Math.abs(slope) < 0.12 ? 'nearly level' : slope > 0 ? 'rising' : 'falling';
};

createTool({
  state,
  label: 'A curve drawn in green where it rises and coral where it falls. Peaks and valleys sit where the colour changes. A moving dot shows the direction of travel with an arrow and reads the slope.',
  setup: (stage, c) => createPlot(stage, { x: [-2.5, 2.5], y: [-3, 3], c }),
  draw(ctx, stage, c, plot) {
    const shape = S();
    plot.setRange(shape.span, shape.y);
    plot.axes({ grid: false });
    stretches(shape).forEach((st) => plot.fn(shape.f, { color: st.dir > 0 ? c.c : c.a, width: 5, domain: [st.a, st.b] }));
    turningPoints(shape).forEach((t) => {
      plot.point(t.x, t.y, { fill: c.fillY, r: 8 });
      plot.text(t.kind === 'max' ? 'peak' : 'valley', t.x, t.y + (t.kind === 'max' ? 0.1 : -0.1) * (shape.y[1] - shape.y[0]), { size: 11 });
    });
    const y = shape.f(state.x);
    plot.point(state.x, y, { fill: c.ink, r: 6 });
    const [px, py] = plot.toPx(state.x, y);
    const s = shape.df(state.x);
    const run = Math.abs(s) < 0.12 ? 0 : Math.sign(s);
    if (run) arrow(ctx, px, py, px + 34, py - run * 34 * Math.min(1, Math.abs(s)), { color: c.ink, width: 3, head: 9 });
  },
  controls: [
    { title: 'Travel along the curve' },
    { key: 'fn', label: 'Curve', options: Object.entries(SHAPES).map(([k, v]) => [k, v.text]) },
    { key: 'x', label: 'Position, x', min: -2.5, max: 2.5, step: 0.1, format: (n) => fixed(n, 1) },
    { readout: [
      ['Height', (s) => fixed(S(s).f(s.x), 2)],
      ['Slope', (s) => fixed(S(s).df(s.x), 2)],
      ['Direction', (s) => verdict(s)],
      ['Turning points', (s) => turningPoints(S(s)).length],
    ] },
  ],
  tex: (s) => `f(x)=${S(s).tex},\\quad f'(${fixed(s.x, 1)})=${fixed(S(s).df(s.x), 2)}`,
});
