import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { dot, label } from '../../lib/draw.js';
import { fixed, sig, texSci } from '../../lib/format.js';
import { accel, currentDensity, distanceAt, drudeDrift, flights, meanDrift, speedAt } from './_current-drift-math.js';

const SPAN = 200e-15; // s of electron time shown
const CYCLE = 8; // s for that on screen: slowed about 4 × 10¹³ times
const SEED = 11;
const ELECTRONS = 300;
const SWARM_SPAN = 1000e-15;
const SETTLE = 200e-15; // at least 5τ, so the start from rest has died away
const state = { E: 0.25, tau: 2.5, collide: true, t: 2 };
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
let hits = [];
let marks = [];
let markTau = 0;
let perAccel = 0; // the swarm's steady average speed for unit acceleration, redone only when τ changes: speed scales with E

const tau = (s) => s.tau * 1e-14;
const a = (s) => accel(s.E);
const now = (s) => (s.t / CYCLE) * SPAN;
const measured = (s) => perAccel * a(s);
const predict = (s) => drudeDrift(s.E, tau(s));
const fs = (x) => x / 1e-15;

function rebuild(s) {
  hits = s.collide ? flights(SEED, tau(s), SPAN) : [];
  if (s.tau !== markTau) {
    marks = [];
    perAccel = meanDrift(SEED, ELECTRONS, 1, tau(s), SWARM_SPAN, SETTLE);
  }
  markTau = s.tau;
  if (s.collide && !marks.some(([E]) => E === s.E)) marks.push([s.E, currentDensity(measured(s)) / 1e7]);
}

const tool = createTool({
  state,
  label: 'Three parts. Top: one electron among a row of ions, pushed by the field and stopped by collisions. Middle: its speed along the field against time, a sawtooth, with a dashed line at the average. Bottom: current density against field, one dot for each field you have tried.',
  setup: (stage, c) => ({
    speed: createPlot(stage, { x: [0, fs(SPAN)], y: [0, 12], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.18, w: g.w, h: g.h * 0.44 }) }),
    law: createPlot(stage, { x: [0, 0.5], y: [0, 5], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.62, w: g.w, h: g.h * 0.38 }) }),
  }),
  draw(ctx, stage, c, { speed, law }) {
    const t = now(state);
    const y = stage.h * 0.1;
    for (let i = 0; i < 9; i++) dot(ctx, (stage.w * (i + 0.5)) / 9, y, 7, c.fillB, c.ink, 2);
    const scale = stage.w / (drudeDrift(0.25, 2.5e-14) * SPAN);
    const x = (distanceAt(hits, a(state), t) * scale) % stage.w;
    dot(ctx, x, y + 15, 6, c.a, c.ink, 2);
    label(ctx, 'ions, and one electron (hops not to scale)', 4, 11, c, { size: 10, align: 'left', bounds: stage });

    speed.axes({ xLabel: 'fs', yLabel: 'its speed along E (mm/s)' });
    const v = (time) => speedAt(hits, a(state), time / 1e15) * 1000;
    let last = 0;
    for (const hit of [...hits, SPAN]) { // straight pieces, so the drops stay sharp
      const [from, to] = [last, hit];
      speed.segment(fs(from), 0, fs(to), a(state) * (to - from) * 1000, { color: c.a, width: 3 });
      last = hit;
    }
    if (state.collide) {
      const mean = predict(state) * 1000;
      speed.segment(0, mean, fs(SPAN), mean, { color: c.c, width: 3, dash: [7, 5] });
    }
    speed.point(fs(t), Math.min(12, v(fs(t))), { fill: c.a, r: 6 });

    law.axes({ xLabel: 'E (V/m)', yLabel: 'j (10⁷ A/m²)' });
    for (const [E, j] of marks) law.point(E, j, { fill: state.E === E ? c.a : c.b, r: state.E === E ? 7 : 5 });
  },
  controls: () => [
    { title: 'Push and collide' },
    { key: 'E', label: 'Electric field, E', min: 0.05, max: 0.5, step: 0.05, format: (n) => `${fixed(n, 2)} V/m` },
    { key: 'tau', label: 'Mean time between collisions, τ', min: 1.5, max: 4, step: 0.5, format: (n) => `${fixed(n, 1)} × 10⁻¹⁴ s` },
    { key: 'collide', label: 'Collisions happen', toggle: true },
    { key: 't', label: 'Slowed time', min: 0, max: CYCLE, step: 0.02, format: (n) => `${sig((n / CYCLE) * 200, 3)} fs` },
    transport(line2.clock),
    { readout: [
      ['Speed gained per fs', (s) => `${sig(a(s) * 1e-15 * 1000, 2)} mm/s`],
      ['Average speed, 300 electrons', (s) => (s.collide ? `${sig(measured(s) * 1000, 3)} mm/s` : { text: 'never settles', good: false })],
      ['eEτ/m', (s) => `${sig(predict(s) * 1000, 3)} mm/s`],
      ['j, from the average', (s) => (s.collide ? `${sig(currentDensity(measured(s)) / 1e7, 3)} × 10⁷ A/m²` : '—')],
    ] },
  ],
  tex: (s) => `v_d=\\dfrac{eE\\tau}{m}=${texSci(predict(s), 2)}\\ \\text{m/s},\\quad j=nev_d=\\dfrac{ne^2\\tau}{m}E`,
  onChange: (s) => {
    line2.sync();
    rebuild(s);
  },
});

rebuild(state);
line2.sync();
tool.update();
