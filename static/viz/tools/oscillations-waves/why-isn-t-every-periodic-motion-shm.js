import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { ball, orbit, spring } from './_shm-math.js';

const MOTIONS = {
  spring: ['Spring', spring, 'a = −ω²x: a straight line through the origin', 45],
  ball: ['Bouncing ball', ball, 'a is constant between bounces', 12],
  orbit: ['Orbit (x only)', orbit, 'a curves: the force goes as 1/r²', 90],
};
const state = { motion: 'ball', t: 0.3 };
const motion = (s) => MOTIONS[s.motion];
const half = (top) => (stage) => ({ x: 0, y: top ? 0 : stage.h / 2, w: stage.w, h: stage.h / 2 });
const isShm = (s) => s.motion === 'spring';

createTool({
  state,
  label: 'Top: position against time over two periods. Bottom: acceleration against position. Only the spring gives a straight line through the origin.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 2], y: [-2, 2], c, box: half(true) }),
    low: createPlot(stage, { x: [-2, 2], y: [-50, 50], c, box: half(false) }),
  }),
  draw(ctx, stage, c, { top, low }) {
    const [, f, , range] = motion(state);
    top.axes({ xLabel: 't (T)', yLabel: 'x' });
    top.fn((t) => f(t)[0], { color: c.ink });
    top.point(state.t, f(state.t)[0]);
    low.setRange([-2, 2], [-range, range]);
    low.axes({ xLabel: 'x', yLabel: 'a' });
    for (let i = 1; i <= 200; i++) {
      const [p, q] = [f((i - 1) / 200), f(i / 200)];
      if (Math.abs(p[0] - q[0]) < 0.5) low.segment(p[0], p[1], q[0], q[1], { color: c.b, width: 3 });
    }
    low.point(...f(state.t));
  },
  controls: [
    { title: 'Repeats, but is it SHM?' },
    { key: 'motion', label: 'Motion', options: [['spring', 'Spring'], ['ball', 'Bouncing ball'], ['orbit', 'Orbit']] },
    { key: 't', label: 'Time', min: 0, max: 2, step: 0.01, format: (v) => `${fixed(v, 2)} T` },
    { readout: [
      ['Periodic?', () => ({ text: 'yes', good: true })],
      ['x now', (s) => fixed(motion(s)[1](s.t)[0], 2)],
      ['a now', (s) => fixed(motion(s)[1](s.t)[1], 2)],
      ['Pattern', (s) => motion(s)[2]],
      ['SHM?', (s) => ({ text: isShm(s) ? 'yes' : 'no', good: isShm(s) })],
    ] },
  ],
  tex: (s) => (isShm(s) ? 'a = -\\omega^2 x' : 'a \\neq -\\omega^2 x'),
});
