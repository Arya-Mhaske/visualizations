import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { view: 'ground', w: 1, t: 1.5 };
const R0 = 3;
const path = (s, t) => {
  const [x, y] = [R0, s.w * R0 * t];
  if (s.view === 'ground') return [x, y];
  const a = s.w * t;
  return [x * Math.cos(a) + y * Math.sin(a), -x * Math.sin(a) + y * Math.cos(a)];
};

createTool({
  state,
  label: 'The ride as a circle and the path of a rider who lets go at the right-hand edge. From the ground the path is a straight tangent; from the ride it curves outward.',
  setup: (stage, c) => createPlot(stage, { x: [-9, 9], y: [-9, 9], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn((x) => Math.sqrt(Math.max(0, R0 * R0 - x * x)), { color: c.ink, domain: [-R0, R0] });
    plot.fn((x) => -Math.sqrt(Math.max(0, R0 * R0 - x * x)), { color: c.ink, domain: [-R0, R0] });
    const pts = Array.from({ length: 41 }, (_, i) => path(state, (i / 40) * state.t));
    pts.slice(1).forEach((p, i) => plot.segment(pts[i][0], pts[i][1], p[0], p[1], { color: c.a, width: 4 }));
    plot.point(...pts[pts.length - 1], { fill: c.a });
  },
  controls: [
    { title: 'Let go' },
    { key: 'view', label: 'View from', options: [['ground', 'The ground'], ['ride', 'The spinning ride']] },
    { key: 'w', label: 'Spin rate ω (rad/s)', min: 0.25, max: 1.5, step: 0.25 },
    { key: 't', label: 'Time since letting go (s)', min: 0, max: 3, step: 0.1 },
    { readout: [
      ['Real force on you after release', () => '0 N'],
      ['Distance from centre', (s) => `${fixed(Math.hypot(...path(s, s.t)), 2)} m`],
      ['Speed along the tangent', (s) => `${fixed(s.w * R0, 2)} m/s`],
    ] },
  ],
  tex: (s) => `v=\\omega R=${fixed(s.w * R0, 2)}\\ \\mathrm{m/s}`,
});
