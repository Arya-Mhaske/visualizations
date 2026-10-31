import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { fixed } from '../../lib/format.js';
import { wave, riderX, speedOf } from './_travelling-waves-math.js';

const A = 1;
const X = 8; // metres of string shown
const state = { k: 2, w: 3, theta: 1.57, s: 1 };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const v = (s) => speedOf(s.k, s.w);
const cycle = (s) => Math.min(6, 4 / v(s)); // the rider travels at most 4 m before the loop restarts
const now = (s) => clock.state.t % cycle(s);
const start = (s) => (s.s > 0 ? 0 : 4);
const rider = (s, u) => riderX(s.theta, u, s.k, s.w, s.s, start(s));
const phaseNow = (s, u) => s.k * rider(s, u) - s.s * s.w * u;

const tool = createTool({
  state,
  label: 'Top: the wave y = sin(kx − ωt) at this instant, with a coral dot riding one point of constant phase. Bottom: the dot’s position against time, a straight line. With a minus sign the dot moves right; with a plus sign it moves left.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, X], y: [-1.4, 1.4], c, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.56 }) }),
    low: createPlot(stage, { x: [0, 6], y: [0, X], c, box: (g) => ({ x: 0, y: g.h * 0.56, w: g.w, h: g.h * 0.44 }) }),
  }),
  draw(ctx, stage, c, { top, low }) {
    const u = now(state);
    const xr = rider(state, u);
    top.axes({ xLabel: 'x (m)', yLabel: 'y' });
    top.fn((x) => wave(x, 0, A, state.k, state.w, 0, state.s), { color: c.grid, width: 2, dash: [5, 5] });
    top.fn((x) => wave(x, u, A, state.k, state.w, 0, state.s), { color: c.b });
    top.segment(xr, -1.4, xr, 1.4, { color: c.a, width: 1, dash: [3, 3] });
    top.point(xr, wave(xr, u, A, state.k, state.w, 0, state.s), { fill: c.a });
    top.text('dashed: the wave at t = 0', X * 0.62, 1.25, { size: 10 });

    low.axes({ xLabel: 't (s)', yLabel: 'x (m)' });
    const T = cycle(state);
    low.segment(0, rider(state, 0), T, rider(state, T), { color: c.a, width: 3 });
    low.point(u, xr, { fill: c.a });
    low.text(state.s > 0 ? 'x grows with t: it moves right' : 'x shrinks with t: it moves left', 3.2, X * 0.08, { size: 10 });
  },
  controls: [
    { title: 'Ride one point of the wave' },
    { key: 'theta', label: 'Phase you ride, kx − ωt', min: 0, max: 6.28, step: 0.01, format: (n) => `${fixed(n, 2)} rad` },
    { key: 's', label: 'Sign in front of ωt', options: [[1, 'kx − ωt'], [-1, 'kx + ωt']] },
    { key: 'k', label: 'Wave number, k', min: 1.6, max: 4, step: 0.1, format: (n) => `${fixed(n, 1)} rad/m` },
    { key: 'w', label: 'Angular frequency, ω', min: 1, max: 5, step: 0.1, format: (n) => `${fixed(n, 1)} rad/s` },
    transport(clock),
    { readout: [
      ['Time, t', (s) => `${fixed(now(s), 2)} s`],
      ['Rider’s position, x', (s) => `${fixed(rider(s, now(s)), 2)} m`],
      ['Phase, kx ∓ ωt', (s) => fixed(phaseNow(s, now(s)), 2)],
      ['Rider’s speed, ω/k', (s) => `${s.s > 0 ? '+' : '−'}${fixed(v(s), 2)} m/s`],
    ] },
  ],
  tex: (s) => `kx ${s.s > 0 ? '-' : '+'} \\omega t = \\text{const} \\;\\Rightarrow\\; x = x_0 ${s.s > 0 ? '+' : '-'} \\dfrac{\\omega}{k}\\,t = x_0 ${s.s > 0 ? '+' : '-'} ${fixed(v(s), 2)}\\,t`,
});

clock.step(1);
