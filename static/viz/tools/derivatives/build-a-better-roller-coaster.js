import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// Left piece (x ≤ 3): y = 10 − 2x + 0.15x². Right piece (x ≥ 3): y = H + S(x − 3) + (P/2)(x − 3)².
const state = { H: 8, S: 0, P: 1, x: 1.5 };
const left = (x) => 10 - 2 * x + 0.15 * x * x;
const L = { y: left(3), m: -2 + 0.3 * 3, c: 0.3 };
const right = (s, x) => s.H + s.S * (x - 3) + (s.P / 2) * (x - 3) ** 2;
const piece = (s, x) => (x <= 3 ? left(x) : right(s, x));
const gaps = (s) => ({ h: s.H - L.y, m: s.S - L.m, c: s.P - L.c });
const ok = (v) => Math.abs(v) < 0.05;

createTool({
  state,
  label: 'A roller-coaster track made of two pieces that meet at x equal to 3. The left piece is fixed. You choose the height, slope and curvature of the right piece at the joint. If the heights differ the track has a step. If the slopes differ it has a kink, a sudden change of direction. If the curvatures differ the ride has a sudden jolt. A smooth ride needs all three to match.',
  setup: (stage, c) => createPlot(stage, { x: [0, 8], y: [0, 12], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '', yLabel: '' });
    plot.fn(left, { color: c.b, width: 4, domain: [0, 3] });
    plot.fn((x) => right(state, x), { color: c.a, width: 4, domain: [3, 8] });
    const g = gaps(state);
    if (!ok(g.h)) plot.segment(3, L.y, 3, state.H, { color: c.ink, width: 4 });
    plot.point(3, L.y, { fill: c.fillY, r: 8 });
    plot.point(3, state.H, { fill: ok(g.h) && ok(g.m) ? c.c : c.a, r: 6 });
    plot.point(state.x, piece(state, state.x), { fill: c.d, r: 8 });
  },
  controls: [
    { title: 'Shape the right piece at the joint' },
    { key: 'H', label: 'Height at the joint', min: 2, max: 11, step: 0.25 },
    { key: 'S', label: 'Slope at the joint', min: -3, max: 3, step: 0.1 },
    { key: 'P', label: 'Curvature (second derivative)', min: -1, max: 2, step: 0.1 },
    { key: 'x', label: 'Car position', min: 0, max: 8, step: 0.1 },
    { readout: [
      ['Left piece at the joint: height, slope, curvature', () => `${fixed(L.y, 2)}, ${fixed(L.m, 2)}, ${fixed(L.c, 2)}`],
      ['Height gap', (s) => ({ text: fixed(gaps(s).h, 2), good: ok(gaps(s).h) })],
      ['Slope gap', (s) => ({ text: fixed(gaps(s).m, 2), good: ok(gaps(s).m) })],
      ['Curvature gap', (s) => ({ text: fixed(gaps(s).c, 2), good: ok(gaps(s).c) })],
      ['Ride', (s) => { const g = gaps(s); return { text: !ok(g.h) ? 'a step' : !ok(g.m) ? 'a kink' : !ok(g.c) ? 'a jolt' : 'smooth', good: ok(g.h) && ok(g.m) && ok(g.c) }; }],
    ] },
  ],
  tex: (s) => `y_R(3)=${fixed(s.H, 2)},\\ y_R'(3)=${fixed(s.S, 2)},\\ y_R''(3)=${fixed(s.P, 2)}`,
});
