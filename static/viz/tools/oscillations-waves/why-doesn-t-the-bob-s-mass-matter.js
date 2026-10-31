import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { G, at, exactPeriod, restoring, swing, toRad } from './_pendulum-math.js';

const END = 12;
const state = { heavy: 4, light: 0.5, L: 1, deg: 30 };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const A = (s) => toRad(s.deg);
let runs = {};
const build = (s) => {
  runs = {
    heavy: swing({ L: s.L, A: A(s), m: s.heavy, span: END }),
    light: swing({ L: s.L, A: A(s), m: s.light, span: END }),
  };
};
build(state);
const now = () => clock.state.t % END;
const angle = (key) => at(runs[key].theta, runs[key].dt, now());
const accel = (s, key) => restoring(s[key], G, angle(key)) / s[key];

const tool = createTool({
  state,
  label: 'Two pendulums of the same length, one with a heavy bob and one with a light bob, released together. Arrows show the pull-back force on each, and the acceleration it causes.',
  draw(ctx, stage, c) {
    const len = Math.min(stage.h * 0.55, stage.w * 0.27) * (0.4 + (0.6 * state.L) / 1.5);
    [['heavy', stage.w * 0.28, c.a], ['light', stage.w * 0.72, c.b]].forEach(([key, px, color]) => {
      const th = angle(key);
      const bx = px + len * Math.sin(th);
      const by = 28 + len * Math.cos(th);
      const r = 8 + 6 * Math.cbrt(state[key]);
      const tangent = [Math.cos(th), -Math.sin(th)];
      const radial = [Math.sin(th), Math.cos(th)];
      line(ctx, px, 28, bx, by, { color: c.ink, width: 3 });
      dot(ctx, bx, by, r, color, c.ink);
      label(ctx, `${fixed(state[key], 1)} kg bob`, px, 8, c, { size: 11, bounds: stage });
      const forceUnit = (stage.w * 0.1) / (G * 2);
      const accUnit = (stage.w * 0.12) / G;
      // Force arrow (ink): grows with the mass. Acceleration arrow (green): the same for both.
      [[restoring(state[key], G, th) * forceUnit, c.ink, r + 14], [accel(state, key) * accUnit, c.c, r + 30]].forEach(([size, ink, off]) => {
        const [sx, sy] = [bx + radial[0] * off, by + radial[1] * off];
        arrow(ctx, sx, sy, sx - size * tangent[0], sy - size * tangent[1], { color: ink, width: 4 });
      });
    });
    label(ctx, 'ink arrow: pull-back force', 10, stage.h - 40, c, { size: 10, align: 'left', bounds: stage });
    label(ctx, 'green arrow: acceleration', 10, stage.h - 20, c, { size: 10, align: 'left', color: c.c, bounds: stage });
  },
  controls: [
    { title: 'Two bobs, one length' },
    { key: 'heavy', label: 'Heavy bob', min: 1, max: 5, step: 0.5, format: (n) => `${fixed(n, 1)} kg` },
    { key: 'light', label: 'Light bob', min: 0.1, max: 0.9, step: 0.1, format: (n) => `${fixed(n, 1)} kg` },
    { key: 'L', label: 'String length', min: 0.5, max: 1.5, step: 0.1, format: (n) => `${fixed(n, 1)} m` },
    { key: 'deg', label: 'Starting angle', min: 5, max: 60, step: 5, format: (n) => `${n}°` },
    transport(clock),
    { readout: [
      ['Force on heavy bob', (s) => `${fixed(restoring(s.heavy, G, angle('heavy')), 2)} N`],
      ['Force on light bob', (s) => `${fixed(restoring(s.light, G, angle('light')), 2)} N`],
      ['Acceleration, heavy', (s) => `${fixed(accel(s, 'heavy'), 2)} m/s²`],
      ['Acceleration, light', (s) => `${fixed(accel(s, 'light'), 2)} m/s²`],
      ['Period, heavy', (s) => `${fixed(exactPeriod(s.L, A(s)), 3)} s`],
      ['Period, light', (s) => `${fixed(exactPeriod(s.L, A(s)), 3)} s`],
    ] },
  ],
  tex: (s) => `a = \\frac{mg\\sin\\theta}{m} = g\\sin\\theta`,
  onChange: (s) => {
    build(s);
    clock.reset();
    clock.step(1);
  },
});

clock.step(1);
