import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { arc, dot, label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { SPECIES, gyroRadius, gyroPeriod, lengthText, timeText } from './_magnetic-force-on-charges-math.js';

const state = { who: 'electron', v: 2, B: 1, t: 0.6 };
const TURN = 4; // seconds on screen for one real period
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => TURN, update: () => tool.update() });
const sp = (s) => SPECIES[s.who];
const speeds = (s) => [s.v, 2 * s.v, 3 * s.v]; // ×10⁶ m/s
const radius = (s, mult) => gyroRadius(sp(s).m, sp(s).q, mult * 1e6, s.B * 1e-3);
const period = (s) => gyroPeriod(sp(s).m, sp(s).q, s.B * 1e-3);
const KEYS = ['b', 'c', 'a'];

const tool = createTool({
  state,
  label: 'Three particles of the same kind, fired at speeds in the ratio one, two and three, going round in circles whose radii are in the same ratio. They are always at the same angle on their circles, so they take equal time for a lap.',
  draw(ctx, stage, c) {
    const half = Math.min(stage.w, stage.h) / 2 - 14;
    const cx = stage.w / 2;
    const cy = stage.h / 2;
    const sc = half / Math.max(...speeds(state).map((m) => radius(state, m)));
    const phase = (2 * Math.PI * state.t) / TURN;
    // all circles touch the start point on the left, so they nest like a target
    const x0 = cx - half;
    speeds(state).forEach((m, i) => {
      const R = radius(state, m) * sc;
      const ox = x0 + R;
      arc(ctx, ox, cy, R, 0, Math.PI * 2, { color: c[KEYS[i]], width: 3 });
      const clockwise = sp(state).q > 0 ? 1 : -1;
      const a = Math.PI + clockwise * phase;
      dot(ctx, ox + R * Math.cos(a), cy + R * Math.sin(a), 8, c.fillY, c.ink);
    });
  },
  controls: () => [
    { title: 'Fire three charges, 1×, 2×, 3× the speed' },
    { key: 'who', label: 'Particle', options: [['electron', 'Electron'], ['proton', 'Proton']] },
    { key: 'v', label: 'Slowest speed', min: 0.5, max: 3, step: 0.5, format: (n) => `${fixed(n, 1)} ×10⁶ m/s` },
    { key: 'B', label: 'Field, B', min: 0.5, max: 5, step: 0.5, format: (n) => `${fixed(n, 1)} mT` },
    transport(line2.clock),
    { readout: [
      ['Radii', (s) => speeds(s).map((m) => lengthText(radius(s, m))).join(', ')],
      ['Time for a lap', (s) => `${timeText(period(s))} (all three)`],
    ] },
  ],
  tex: (s) => `r=\\dfrac{mv}{qB}\\qquad T=\\dfrac{2\\pi m}{qB}=${sig(period(s) * 1e9, 3)}\\ \\text{ns}`,
  onChange: () => line2.sync(),
});
line2.clock.speed = 1;
line2.sync();
tool.update();
