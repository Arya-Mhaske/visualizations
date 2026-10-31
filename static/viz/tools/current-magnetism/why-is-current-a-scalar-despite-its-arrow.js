import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { handles } from '../../lib/stage.js';
import { arrow, dot, label, line, TAU } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { arrivals, countBy, vectorSum } from './_current-drift-math.js';

const CYCLE = 60; // s; one dot is one coulomb, so 1 A is one dot a second
const TRANSIT = 2.5; // s for a dot to run the length of a wire
const state = { I1: 3, I2: 2, a1: 2.6, a2: 3.9, t: 8 };
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });

const scalar = (s) => s.I1 + s.I2;
// Each wire's arrow points at the junction, the opposite way to the wire's own angle from it.
const vector = (s) => vectorSum(s.I1, s.a1 + Math.PI, s.I2, s.a2 + Math.PI);
const centre = (stage) => [stage.w * 0.5, stage.h * 0.42];
const reach = (stage) => Math.min(stage.w * 0.46, stage.h * 0.38);
const tip = (stage, angle) => {
  const [x, y] = centre(stage);
  return [x + Math.cos(angle) * reach(stage), y - Math.sin(angle) * reach(stage)];
};
const inside = (s) => countBy(s.I1, s.t) + countBy(s.I2, s.t);
const outside = (s) => countBy(s.I1, s.t - TRANSIT) + countBy(s.I2, s.t - TRANSIT);

function inDots(ctx, stage, c, I, angle, color) {
  const [x, y] = centre(stage);
  const [ex, ey] = tip(stage, angle);
  line(ctx, ex, ey, x, y, { color: c.ink, width: 8 });
  for (const hit of arrivals(I, state.t + TRANSIT)) {
    const left = (hit - state.t) / TRANSIT;
    if (left > 0 && left <= 1) dot(ctx, x + (ex - x) * left, y + (ey - y) * left, 5, color, c.ink, 1);
  }
}

function drawOut(ctx, stage, c) {
  const [x, y] = centre(stage);
  const ex = stage.w - 6;
  line(ctx, x, y, ex, y, { color: c.ink, width: 12 });
  const stream = [...arrivals(state.I1, state.t), ...arrivals(state.I2, state.t)];
  for (const hit of stream) {
    const gone = (state.t - hit) / TRANSIT;
    if (gone >= 0 && gone < 1) dot(ctx, x + (ex - x) * gone, y, 5, c.c, c.ink, 1);
  }
}

function drawArrows(ctx, stage, c) {
  const y0 = stage.h * 0.9;
  const unit = stage.h * 0.022;
  const x0 = stage.w * 0.25;
  const a = state.a1 + Math.PI;
  const b = state.a2 + Math.PI;
  const x1 = x0 + state.I1 * unit * Math.cos(a);
  const y1 = y0 - state.I1 * unit * Math.sin(a);
  const x2 = x1 + state.I2 * unit * Math.cos(b);
  const y2 = y1 - state.I2 * unit * Math.sin(b);
  label(ctx, 'If they added as arrows', 8, stage.h * 0.76, c, { size: 11, align: 'left', bounds: stage });
  arrow(ctx, x0, y0, x1, y1, { color: c.a });
  arrow(ctx, x1, y1, x2, y2, { color: c.b });
  arrow(ctx, x0, y0, x2, y2, { color: c.d });
  label(ctx, `${sig(vector(state), 2)} A: wrong`, stage.w - 12, stage.h * 0.82, c, { size: 13, align: 'right', color: c.d, bounds: stage });
  label(ctx, `Real wire: ${fixed(scalar(state), 1)} A`, stage.w - 12, stage.h * 0.9, c, { size: 13, align: 'right', color: c.ink, bounds: stage });
}

const tool = createTool({
  state,
  label: 'Two wires join at a junction and one wire leaves it to the right. Dots flow along the wires, one dot for each coulomb. You can drag the two wire ends to any angle. Below, arrows show the wrong answer you would get by adding the two currents as vectors.',
  draw(ctx, stage, c) {
    drawOut(ctx, stage, c);
    inDots(ctx, stage, c, state.I1, state.a1, c.a);
    inDots(ctx, stage, c, state.I2, state.a2, c.b);
    const [x, y] = centre(stage);
    dot(ctx, x, y, 9, c.paper, c.ink);
    const [ax, ay] = tip(stage, state.a1);
    const [bx, by] = tip(stage, state.a2);
    dot(ctx, ax, ay, 10, c.a, c.ink);
    dot(ctx, bx, by, 10, c.b, c.ink);
    label(ctx, 'Drag the wire ends', 6, 12, c, { size: 11, align: 'left', bounds: stage });
    drawArrows(ctx, stage, c);
  },
  controls: () => [
    { title: 'Two wires in, one out' },
    { key: 'I1', label: 'Coral wire, I₁', min: 0.5, max: 5, step: 0.5, format: (n) => `${fixed(n, 1)} A` },
    { key: 'I2', label: 'Blue wire, I₂', min: 0.5, max: 5, step: 0.5, format: (n) => `${fixed(n, 1)} A` },
    { key: 't', label: 'Time', min: 0, max: CYCLE, step: 0.1, format: (n) => `${fixed(n, 1)} s` },
    transport(line2.clock),
    { text: 'One dot is one coulomb.' },
    { readout: [
      ['Angle between the wires', (s) => `${fixed(angleBetween(s), 0)}°`],
      ['Charge in, so far', (s) => `${inside(s)} C`],
      ['Charge out, so far', (s) => `${outside(s)} C`],
      ['Out wire carries', (s) => ({ text: `${fixed(scalar(s), 1)} A`, good: true })],
      ['Vector sum would say', (s) => `${sig(vector(s), 2)} A`],
    ] },
  ],
  tex: (s) => `I_{\\text{out}}=I_1+I_2=${fixed(s.I1, 1)}+${fixed(s.I2, 1)}=${fixed(scalar(s), 1)}\\ \\text{A}`,
  onChange: () => line2.sync(),
});

function angleBetween(s) {
  const gap = Math.abs(s.a1 - s.a2) % TAU;
  return ((gap > Math.PI ? TAU - gap : gap) * 180) / Math.PI;
}

// Wire ends stay clear of the outgoing wire on the right.
const clampAngle = (a) => Math.max(0.5, Math.min(TAU - 0.5, (a + TAU) % TAU));
const grip = (key) => ({
  at: () => tip(tool.stage, state[key]),
  move(px, py) {
    const [x, y] = centre(tool.stage);
    state[key] = clampAngle(Math.atan2(y - py, px - x));
  },
  nudge(direction) { state[key] = clampAngle(state[key] + direction * 0.05); },
});
handles(tool.stage, [grip('a1'), grip('a2')], { onChange: () => tool.update() });
line2.sync();
tool.update();
