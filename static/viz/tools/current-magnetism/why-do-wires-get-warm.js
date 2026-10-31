import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { dot } from '../../lib/draw.js';
import { fixed, sci, sig } from '../../lib/format.js';
import {
  E_CHARGE, RHO_COPPER, collisionRate, energyPerCollision, heatPower, relaxationTime, tempRise, wireField, wireResistance,
} from './_current-drift-math.js';

const L = 1; // m
const CYCLE = 60; // s
const TAU_CU = relaxationTime(RHO_COPPER);
const T_MAX = 60;
const state = { I: 10, A: 1, t: 30 };
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
line2.clock.speed = 6;

const area = (s) => s.A * 1e-6;
const R = (s) => wireResistance(L, area(s));
const perHit = (s) => energyPerCollision(wireField(s.I, area(s)), TAU_CU);
const rate = (s) => collisionRate(L, area(s), TAU_CU);
const rise = (s, t = s.t) => tempRise(s.I, L, area(s), t);

const tool = createTool({
  state,
  label: 'Top: a grid of copper ions that shake harder as the wire warms. Bottom: temperature rise of the wire against time, with no cooling, and a coral point at the current time.',
  setup: (stage, c) => createPlot(stage, { x: [0, CYCLE], y: [0, T_MAX], c, pad: 26, box: (g) => ({ x: 0, y: g.h * 0.42, w: g.w, h: g.h * 0.58 }) }),
  draw(ctx, stage, c, plot) {
    const shake = Math.min(11, Math.sqrt(Math.max(0, rise(state))) * 1.2);
    const cols = 8;
    const rows = 4;
    const gapX = stage.w / cols;
    const gapY = (stage.h * 0.4) / rows;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const phase = state.t * 37 + i * 2.1 + j * 3.3;
        dot(ctx, gapX * (i + 0.5) + shake * Math.sin(phase), gapY * (j + 0.5) + shake * Math.cos(phase * 1.3), 7, c.fillB, c.ink, 2);
      }
    }
    plot.axes({ xLabel: 't (s)', yLabel: 'rise (K)' });
    plot.fn((t) => rise(state, t), { color: c.a });
    plot.point(state.t, Math.min(T_MAX, rise(state)), { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: '1 m of copper wire' },
    { key: 'I', label: 'Current, I', min: 1, max: 20, step: 1, format: (n) => `${n} A` },
    { key: 'A', label: 'Cross-section, A', min: 0.5, max: 4, step: 0.5, format: (n) => `${fixed(n, 1)} mm²` },
    { key: 't', label: 'Time, t', min: 0, max: CYCLE, step: 1, format: (n) => `${fixed(n, 0)} s` },
    transport(line2.clock),
    { readout: [
      ['Energy per collision', (s) => `${sci(perHit(s) / E_CHARGE, 2)} eV`],
      ['Collisions per second', (s) => sci(rate(s), 2)],
      ['Their product', (s) => `${sig(perHit(s) * rate(s), 3)} W`],
      ['I²R', (s) => `${sig(heatPower(s.I, R(s)), 3)} W`],
      ['Rise, with no cooling', (s) => `${sig(rise(s), 3)} K`],
    ] },
  ],
  tex: (s) => `P=I^2R=(${s.I})^2(${sig(R(s), 3)})=${sig(heatPower(s.I, R(s)), 3)}\\ \\text{W}`,
  onChange: () => line2.sync(),
});

line2.sync();
tool.update();
