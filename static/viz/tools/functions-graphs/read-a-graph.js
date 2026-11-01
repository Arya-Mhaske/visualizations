import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { GRAPHS, inDomain, valueAt, domainIntervals, rangeOf, solutions } from './_what-is-a-function-math.js';

const state = { graph: 'bowl', a: 1, c: 2 };
const G = (s = state) => GRAPHS[s.graph];
const interval = ({ a, b, ca, cb }) => `${ca ? '[' : '('}${fixed(a, 1)}, ${fixed(b, 1)}${cb ? ']' : ')'}`;
const domainText = (s) => domainIntervals(G(s)).map(interval).join(' ∪ ');
const rangeText = (s) => {
  const r = rangeOf(G(s));
  return `${r.loClosed ? '[' : '('}${fixed(r.lo, 1)}, ${fixed(r.hi, 1)}${r.hiClosed ? ']' : ')'}`;
};

createTool({
  state,
  label: 'A graph with open and closed end dots. The domain is marked in green along the x-axis and the range in blue along the y-axis. A vertical marker reads f of a, and a horizontal marker finds every x where f of x equals c.',
  setup: (stage, c) => createPlot(stage, { x: [-5, 5], y: [-4, 8], c }),
  draw(ctx, stage, c, plot) {
    const g = G();
    plot.setRange(g.view[0], g.view[1]);
    plot.axes({ grid: true });
    domainIntervals(g).forEach((d) => plot.segment(d.a, 0, d.b, 0, { color: c.c, width: 7 }));
    const r = rangeOf(g);
    plot.segment(0, r.lo, 0, r.hi, { color: c.d, width: 7 });
    g.pieces.forEach((p) => plot.fn(p.fn, { color: c.b, width: 4, domain: [p.a, p.b] }));
    g.pieces.forEach((p) => {
      plot.point(p.a, p.fn(p.a), { fill: p.ca ? c.ink : c.paper, r: 6 });
      plot.point(p.b, p.fn(p.b), { fill: p.cb ? c.ink : c.paper, r: 6 });
    });
    const [vx, vy] = g.view;
    plot.segment(vx[0], state.c, vx[1], state.c, { color: c.a, width: 2, dash: [6, 5] });
    solutions(g, state.c).forEach((x) => plot.point(x, state.c, { fill: c.a, r: 7 }));
    if (inDomain(g, state.a)) {
      const v = valueAt(g, state.a);
      plot.segment(state.a, 0, state.a, v, { color: c.c, width: 2, dash: [4, 4] });
      plot.point(state.a, v, { fill: c.c, r: 8 });
    } else {
      plot.segment(state.a, vy[0], state.a, vy[1], { color: c.grid, width: 2, dash: [4, 4] });
      plot.text('not in domain', state.a, vy[1] - 0.6, { size: 11, color: c.a });
    }
  },
  controls: [
    { title: 'Read the picture' },
    { key: 'graph', label: 'Graph', options: Object.entries(GRAPHS).map(([k, v]) => [k, v.text]) },
    { key: 'a', label: 'Input, a', min: -4.5, max: 6.5, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'c', label: 'Output level, c', min: -3, max: 7, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Domain', (s) => domainText(s)],
      ['Range', (s) => rangeText(s)],
      ['f(a)', (s) => (inDomain(G(s), s.a) ? fixed(valueAt(G(s), s.a), 2) : 'not defined')],
      ['f(x) = c at x =', (s) => solutions(G(s), s.c).map((x) => fixed(x, 2)).join(', ') || 'nowhere'],
    ] },
  ],
  onChange(s) {
    const [vx, vy] = G(s).view;
    s.a = Math.max(vx[0] + 0.5, Math.min(vx[1] - 0.5, s.a));
    s.c = Math.max(vy[0] + 0.5, Math.min(vy[1] - 0.5, s.c));
  },
  tex: (s) => `f(${fixed(s.a, 1)})=${inDomain(G(s), s.a) ? fixed(valueAt(G(s), s.a), 2) : '\\text{undefined}'},\\quad f(x)=${fixed(s.c, 1)}\\text{ at }${solutions(G(s), s.c).length}\\text{ place(s)}`,
});
