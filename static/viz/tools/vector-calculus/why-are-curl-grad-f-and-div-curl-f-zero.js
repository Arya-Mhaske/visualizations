import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { SCALARS, gradField, streamField, curl2, div2, circleCirculation, circleOutflow } from './_vector-calculus-math.js';
import { WINDOW, fieldArrows, drawContours, drawPath } from './_vector-calculus-view.js';
import { arcPath, TAU } from './_vector-calculus-math.js';

const state = { view: 'slope', surface: 'wave', px: 1, py: 1, r: 1.5 };
const field = (s) => (s.view === 'slope' ? gradField(SCALARS[s.surface]) : streamField(SCALARS[s.surface]));
const loopValue = (s) => (s.view === 'slope' ? circleCirculation(field(s), [s.px, s.py], s.r) : circleOutflow(field(s), [s.px, s.py], s.r));
const zero = (v) => (Math.abs(v) < 5e-5 ? 0 : v);

const tool = createTool({
  state,
  label: 'Either the slope field of a height, or a swirl built from the same height. A small circle at the probe measures the spin of the slope, or the outflow of the swirl, and both are zero.',
  setup: (stage, c) => createPlot(stage, { ...WINDOW, c }),
  draw(ctx, stage, c, plot) {
    const S = SCALARS[state.surface];
    const F = field(state);
    plot.axes({ grid: false });
    drawContours(ctx, plot, S.f, [-4, -3, -2, -1, -0.5, 0.5, 1, 2, 3, 4].map((v) => v / 2), { color: c.grid, width: 1 });
    fieldArrows(ctx, plot, (x, y) => [F.P(x, y), F.Q(x, y)], c, { step: 1, color: state.view === 'slope' ? c.b : c.a, soft: 2 });
    drawPath(ctx, plot, arcPath([state.px, state.py], state.r, 0, TAU), { color: c.c, width: 4 });
    plot.point(state.px, state.py, { fill: c.ink, r: 4 });
  },
  controls: [
    { title: 'Two zeros' },
    { key: 'view', label: 'Field', options: [['slope', 'Slope ∇f  (test: curl)'], ['swirl', 'Swirl (f_y, −f_x)  (test: div)']] },
    { key: 'surface', label: 'Height f', options: Object.entries(SCALARS).map(([k, v]) => [k, v.name]) },
    { key: 'px', label: 'Circle x', min: -3, max: 3, step: 1 },
    { key: 'py', label: 'Circle y', min: -3, max: 3, step: 1 },
    { key: 'r', label: 'Circle radius', min: 0.5, max: 2.5, step: 0.5 },
    { readout: [
      ['curl at the centre', (s) => fixed(zero(curl2(field(s), s.px, s.py)), 3)],
      ['div at the centre', (s) => fixed(zero(div2(field(s), s.px, s.py)), 3)],
      ['Round the circle', (s) => `${s.view === 'slope' ? 'spin' : 'outflow'} = ${fixed(zero(loopValue(s)), 3)}`],
    ] },
  ],
  tex: (s) => (s.view === 'slope'
    ? '\\operatorname{curl}(\\nabla f) = f_{yx} - f_{xy} = 0'
    : '\\operatorname{div}(f_y, -f_x) = f_{yx} - f_{xy} = 0'),
});
