import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

// f(x) = (x − n1)(x − n2) / ((x − d1)(x − d2))
const state = { n1: 1, n2: -2, d1: 1, d2: 3 };
const f = (s, x) => ((x - s.n1) * (x - s.n2)) / ((x - s.d1) * (x - s.d2));
const dens = (s) => [s.d1, s.d2];
const nums = (s) => [s.n1, s.n2];
// a denominator zero is a hole when the same factor is also on top (with multiplicity)
function classify(s) {
  const top = [...nums(s)];
  const out = [];
  [...new Set(dens(s))].forEach((d) => {
    const inDen = dens(s).filter((v) => v === d).length;
    const inNum = top.filter((v) => v === d).length;
    out.push({ x: d, kind: inNum >= inDen ? 'hole' : 'wall' });
  });
  return out;
}
const holeY = (s, x) => { const t = (nums(s).filter((v) => v === x).length ? 1 : 0); return t ? ((x - nums(s).find((v) => v !== x && nums(s).length) ) || 0) : null; };
const holeHeight = (s, x) => {
  const nn = nums(s).slice(); const dd = dens(s).slice();
  nn.splice(nn.indexOf(x), 1); dd.splice(dd.indexOf(x), 1);
  const num = nn.reduce((p, r) => p * (x - r), 1);
  const den = dd.reduce((p, r) => p * (x - r), 1);
  return num / den;
};

createTool({
  state,
  label: 'The graph of a fraction made of two factors on top and two on the bottom. The graph is broken wherever the bottom is zero. If the same factor is also on top, it cancels and the graph just has a single missing point, a hole, drawn as an open circle. If it does not cancel, the values blow up near that x and the graph has a vertical asymptote, a wall, drawn dashed. Move the zeros to see walls turn into holes.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-8, 8], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => f(state, x), { color: c.a, width: 4 });
    classify(state).forEach(({ x, kind }) => {
      if (kind === 'wall') plot.segment(x, -8, x, 8, { color: c.b, width: 2, dash: [6, 5] });
      else plot.point(x, holeHeight(state, x), { fill: c.paper, r: 8 });
    });
  },
  controls: [
    { title: 'Place the zeros' },
    { key: 'n1', label: 'Top zero 1', min: -4, max: 4, step: 1 },
    { key: 'n2', label: 'Top zero 2', min: -4, max: 4, step: 1 },
    { key: 'd1', label: 'Bottom zero 1', min: -4, max: 4, step: 1 },
    { key: 'd2', label: 'Bottom zero 2', min: -4, max: 4, step: 1 },
    { readout: [
      ['Walls', (s) => classify(s).filter((c) => c.kind === 'wall').map((c) => `x = ${c.x}`).join(', ') || 'none'],
      ['Holes', (s) => classify(s).filter((c) => c.kind === 'hole').map((c) => `at x = ${c.x}, height ${holeHeight(s, c.x)}`).join('; ') || 'none'],
    ] },
  ],
  tex: (s) => `f(x)=\\dfrac{(x${s.n1 < 0 ? '+' : '-'}${Math.abs(s.n1)})(x${s.n2 < 0 ? '+' : '-'}${Math.abs(s.n2)})}{(x${s.d1 < 0 ? '+' : '-'}${Math.abs(s.d1)})(x${s.d2 < 0 ? '+' : '-'}${Math.abs(s.d2)})}`.replace(/\(x-0\)/g, 'x').replace(/\(x\+0\)/g, 'x'),
});
