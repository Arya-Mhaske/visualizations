import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { m1: 3, m2: 1, drift: false, t: 3 };
const D = 6;
const W = 1;
const pos = (s, t) => {
  const M = s.m1 + s.m2;
  const [r1, r2] = [(s.m2 * D) / M, (s.m1 * D) / M];
  const cx = s.drift ? 0.9 * t : 0;
  return [[cx + r1 * Math.cos(W * t + Math.PI), r1 * Math.sin(W * t + Math.PI)], [cx + r2 * Math.cos(W * t), r2 * Math.sin(W * t)]];
};

plotTool({
  state,
  label: 'The paths of two stars orbiting their common centre of mass, either as two circles or, if the pair drifts, as looping curves, with the stars and the centre of mass marked at the chosen time.',
  x: [-8, 8],
  y: [-8, 8],
  range: (s) => (s.drift ? [[-8, 24], [-8, 8]] : [[-8, 8], [-8, 8]]),
  draw: (ctx, stage, c, plot) => {
    [0, 1].forEach((i) => {
      const pts = Array.from({ length: 121 }, (_, k) => pos(state, (k / 120) * (state.drift ? 20 : 6.3))[i]);
      pts.slice(1).forEach((p, k) => plot.segment(pts[k][0], pts[k][1], p[0], p[1], { color: i ? c.b : c.a, width: 2 }));
    });
    const [p1, p2] = pos(state, state.t);
    plot.segment(p1[0], p1[1], p2[0], p2[1], { color: c.grid, width: 1, dash: [4, 4] });
    plot.point(...p1, { fill: c.a, r: 5 + state.m1 * 2 });
    plot.point(...p2, { fill: c.b, r: 5 + state.m2 * 2 });
    plot.point((state.drift ? 0.9 * state.t : 0), 0, { fill: c.c, r: 5 });
  },
  controls: [
    { title: 'Two stars' },
    { key: 'm1', label: 'Mass of star 1', min: 1, max: 8, step: 1 },
    { key: 'm2', label: 'Mass of star 2', min: 1, max: 8, step: 1 },
    { key: 'drift', label: 'Pair drifts through space', toggle: true },
    { key: 't', label: 'Time', min: 0, max: 20, step: 0.1 },
    { readout: [
      ['Radius of star 1', (s) => fixed((s.m2 * D) / (s.m1 + s.m2), 2)],
      ['Radius of star 2', (s) => fixed((s.m1 * D) / (s.m1 + s.m2), 2)],
      ['Ratio r₁ : r₂', (s) => `${s.m2} : ${s.m1}`],
    ] },
  ],
  tex: (s) => `m_1r_1=m_2r_2,\\quad r_1+r_2=d`,
});
