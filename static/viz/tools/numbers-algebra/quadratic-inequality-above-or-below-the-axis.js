import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { intervalTex, intervalText, quadSolution } from './_inequalities-math.js';

const state = { a: 1, b: -1, c: -6, want: 1, eq: false };
const f = (s = state) => (x) => s.a * x * x + s.b * x + s.c;
const sol = (s = state) => quadSolution(s.a, s.b, s.c, s.want, s.eq);
const SIGN = { 1: '>', '-1': '<' };

createTool({
  state,
  label: 'A parabola. The question is where it is above the x-axis, or below it. Wherever the answer is yes, the parabola is shaded down to the axis and the matching part of the axis is drawn as a thick green bar. The ends of the bar are the roots.',
  setup: (stage, c) => createPlot(stage, { x: [-7, 7], y: [-12, 12], c }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const g = f();
    sol().forEach((i) => {
      const a = Math.max(i.from, -7);
      const b = Math.min(i.to, 7);
      if (i.point) { plot.point(i.from, 0, { fill: c.c, r: 8 }); return; }
      plot.shade(g, null, a, b, c.fillC);
      plot.segment(a, 0, b, 0, { color: c.c, width: 9 });
    });
    plot.fn(g, { color: c.a, width: 4 });
    sol().forEach((i) => { if (!i.point && Number.isFinite(i.from)) plot.point(i.from, 0, { fill: i.openFrom ? c.paper : c.c, r: 7 }); if (!i.point && Number.isFinite(i.to)) plot.point(i.to, 0, { fill: i.openTo ? c.paper : c.c, r: 7 }); });
  },
  controls: [
    { title: 'Ask the parabola' },
    { key: 'want', label: 'Where is y', options: [[1, 'above (> 0)'], [-1, 'below (< 0)']] },
    { key: 'eq', label: 'Include the roots (≥ or ≤)', toggle: true },
    { key: 'a', label: 'a', min: -2, max: 2, step: 1 },
    { key: 'b', label: 'b', min: -6, max: 6, step: 1 },
    { key: 'c', label: 'c', min: -10, max: 10, step: 1 },
    { readout: [
      ['Solution', (s) => intervalText(sol(s))],
      ['b² − 4ac', (s) => `${s.b * s.b - 4 * s.a * s.c}`],
    ] },
  ],
  onChange(s) {
    if (s.a === 0) s.a = 1;
  },
  tex: (s) => `${s.a}x^2${s.b < 0 ? '-' : '+'}${Math.abs(s.b)}x${s.c < 0 ? '-' : '+'}${Math.abs(s.c)}\\ ${SIGN[s.want]}${s.eq ? '=' : ''}\\ 0\\ \\Rightarrow\\ x\\in ${intervalTex(sol(s))}`.replace('>=', '\\ge').replace('<=', '\\le'),
});
