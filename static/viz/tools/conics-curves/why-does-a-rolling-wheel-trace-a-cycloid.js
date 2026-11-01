import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { cycloid } from './_rotation-math.js';
import { curve, fitEqual, trace } from './_conics-view.js';

const state = { turn: 120, d: 1 };
const rad = (d) => (d * Math.PI) / 180;
const TAU = Math.PI * 2;

createTool({
  state,
  label: 'A wheel of radius 1 rolling along the ground without slipping. A point fixed to the wheel traces a curve. When the point is on the rim the curve is a cycloid, a series of arches with sharp points where the rim touches the ground. Move the point inside or outside the rim and the shape of the arch changes. The wheel\'s centre moves along a straight line at height 1.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 13], y: [-1, 4], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    const half = Math.max(2.4, 7.4 / (stage.w / stage.h));
    fitEqual(plot, stage, 5.8, half - 1.2, half);
    plot.axes({ xLabel: '', yLabel: '', grid: false });
    const th = rad(state.turn);
    curve(plot, trace((u) => cycloid(1, state.d, u), 0, TAU * 2, 400), { color: c.grid, width: 2, dash: [5, 4] });
    curve(plot, trace((u) => cycloid(1, state.d, u), 0, th, Math.max(2, Math.round(th * 30))), { color: c.a, width: 4 });
    const C = [th, 1];
    curve(plot, trace((u) => [C[0] + Math.cos(u), C[1] + Math.sin(u)], 0, TAU, 80), { color: c.ink, width: 3 });
    const P = cycloid(1, state.d, th);
    plot.segment(C[0], C[1], P[0], P[1], { color: c.b, width: 3 });
    plot.segment(-1, 0, 13.5, 0, { color: c.ink, width: 3 });
    plot.point(C[0], C[1], { fill: c.fillY, r: 5 });
    plot.point(P[0], P[1], { fill: c.a, r: 8 });
    plot.point(th, 0, { fill: c.c, r: 5 });
  },
  controls: [
    { title: 'Roll the wheel' },
    { key: 'turn', label: 'Angle the wheel has turned, θ', min: 0, max: 720, step: 2, format: (v) => `${v}°` },
    { key: 'd', label: 'Distance of the point from the centre', min: 0.25, max: 1.5, step: 0.25, format: (v) => (v === 1 ? '1 (on the rim)' : fixed(v, 2)) },
    { readout: [
      ['Centre of the wheel', (s) => `(${fixed(rad(s.turn), 2)}, 1)`],
      ['Point x', (s) => fixed(cycloid(1, s.d, rad(s.turn))[0], 3)],
      ['Point y', (s) => fixed(cycloid(1, s.d, rad(s.turn))[1], 3)],
      ['One arch', (s) => (s.d === 1 ? `width 2π = ${fixed(TAU, 2)}, height 2` : 'a rim point has the sharp cusps')],
    ] },
  ],
  tex: (s) => `x=r\\theta-d\\sin\\theta,\\ y=r-d\\cos\\theta\\ \\ (r=1,\\ d=${s.d})`,
});
