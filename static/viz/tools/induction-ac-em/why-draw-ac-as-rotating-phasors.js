import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { handles } from '../../lib/stage.js';
import { arc, arrow, dot, label, line, TAU } from '../../lib/draw.js';
import { height, phasor, wave } from '../../lib/phasor.js';
import { fixed, sig } from '../../lib/format.js';
import { sumByHand, sumOfArrows, twoWaves } from './_ac-basics-math.js';

const RAD = Math.PI / 180;
const state = { view: 'one', t: 60, a: 8, b: 5, phi: 60 };
const clock = createTimeline(document.querySelector('#stage'), state, { cycle: () => 360, update: () => tool.update() });
clock.clock.speed = 60;

const theta = (s = state) => s.t * RAD;
const phi = (s = state) => s.phi * RAD;
const sum = (s = state) => twoWaves(s.a, s.b, phi(s));
const hand = (s = state) => sumByHand(s.a, s.b, phi(s), theta(s));
const arrows = (s = state) => sumOfArrows(s.a, s.b, phi(s), theta(s));

function layout(stage) {
  const R = Math.min(stage.w * 0.23, stage.h * 0.4);
  const cx = R + 14;
  const axis = cx + R + 22;
  return { R, cx, cy: stage.h * 0.52, axis, width: stage.w - axis - 8, unit: R / (state.view === 'one' ? 8 : 13) };
}

function drawAxis(ctx, stage, c, { cy, axis, width, R }) {
  line(ctx, axis, cy - R - 8, axis, cy + R + 8, { color: c.ink, width: 2 });
  line(ctx, axis, cy, axis + width, cy, { color: c.ink, width: 2 });
  label(ctx, 'v (V)', axis + 4, cy - R - 16, c, { size: 12, align: 'left', bounds: stage });
  label(ctx, 'earlier →', axis + width, cy + R + 18, c, { size: 11, align: 'right', bounds: stage });
}

function drawOne(ctx, stage, c, box) {
  const { cx, cy, axis, width, unit } = box;
  drawAxis(ctx, stage, c, box);
  wave(ctx, axis, cy, width, (back) => height(state.a * unit, theta() + back), { color: c.a, turns: 1.5 });
  arc(ctx, cx, cy, state.a * unit, -theta(), 0, { color: c.ink, width: 2 });
  phasor(ctx, cx, cy, state.a * unit, theta(), { color: c.a, c, shadowX: axis });
  label(ctx, 'Drag the arrow tip', 6, 13, c, { size: 11, align: 'left', bounds: stage });
  label(ctx, `shadow = ${fixed(height(state.a, theta()), 2)} V`, axis + 8, stage.h - 12, c, { size: 12, align: 'left', bounds: stage });
}

function drawTwo(ctx, stage, c, box) {
  const { cx, cy, axis, width, unit } = box;
  const whole = sum();
  drawAxis(ctx, stage, c, box);
  wave(ctx, axis, cy, width, (back) => height(state.a * unit, theta() + back), { color: c.a, turns: 1.5, lineWidth: 2 });
  wave(ctx, axis, cy, width, (back) => height(state.b * unit, theta() + phi() + back), { color: c.b, turns: 1.5, lineWidth: 2 });
  wave(ctx, axis, cy, width, (back) => height(whole.size * unit, theta() + whole.angle + back), { color: c.c, turns: 1.5 });
  const tip = phasor(ctx, cx, cy, state.a * unit, theta(), { color: c.a, c, circle: false });
  const end = [tip[0] + state.b * unit * Math.cos(theta() + phi()), tip[1] - state.b * unit * Math.sin(theta() + phi())];
  arc(ctx, cx, cy, whole.size * unit, 0, TAU, { color: c.grid, width: 2 });
  arrow(ctx, ...tip, ...end, { color: c.b, width: 4 });
  phasor(ctx, cx, cy, whole.size * unit, theta() + whole.angle, { color: c.c, c, circle: false, shadowX: axis });
  dot(ctx, cx, cy, 4, c.ink);
  // The two shadows stacked against the axis reach exactly the green dot.
  const x = axis - 9;
  const mid = cy - height(state.a * unit, theta());
  line(ctx, x, cy, x, mid, { color: c.a, width: 5 });
  line(ctx, x, mid, x, mid - height(state.b * unit, theta() + phi()), { color: c.b, width: 5 });
  label(ctx, 'Drag the coral tip', 6, 13, c, { size: 11, align: 'left', bounds: stage });
  label(ctx, 'Coral + blue shadows = green', axis - 10, stage.h - 12, c, { size: 11, align: 'left', bounds: stage });
}

function showView() {
  const items = [...document.querySelector('#panel').firstElementChild.children];
  const one = state.view === 'one';
  for (const name of ['b', 'phi', 'readTwo']) items[ROW[name]].hidden = one;
  items[ROW.readOne].hidden = !one;
}

const ROW = { b: 5, phi: 6, readOne: 7, readTwo: 8 };

const tool = createTool({
  state,
  label: 'An arrow turning about a centre. Its height, carried across to a vertical axis, draws a sine wave flowing to the right. In the second view two arrows are joined tip to tail and a green arrow closes the triangle: its shadow is the sum of the other two.',
  draw(ctx, stage, c) {
    const box = layout(stage);
    if (state.view === 'one') drawOne(ctx, stage, c, box);
    else drawTwo(ctx, stage, c, box);
  },
  controls: () => [
    { title: 'Turn the arrow' },
    { key: 'view', label: 'View', options: [['one', 'One arrow'], ['two', 'Add two']] },
    { key: 't', label: 'Angle, ωt', min: 0, max: 360, step: 1, format: (n) => `${fixed(n, 0)}°` },
    transport(clock.clock),
    { key: 'a', label: 'Peak v_m (arrow length)', min: 1, max: 8, step: 0.5, format: (n) => `${fixed(n, 1)} V` },
    { key: 'b', label: 'Second peak', min: 1, max: 5, step: 0.5, format: (n) => `${fixed(n, 1)} V` },
    { key: 'phi', label: 'Phase between them, φ', min: 0, max: 180, step: 5, format: (n) => `${n}°` },
    { readout: [
      ['Height of arrow', (s) => `${fixed(height(s.a, theta(s)), 2)} V`],
      ['v_m sin ωt', (s) => `${fixed(s.a * Math.sin(theta(s)), 2)} V`],
    ] },
    { readout: [
      ['First wave now', (s) => `${fixed(height(s.a, theta(s)), 2)} V`],
      ['Second wave now', (s) => `${fixed(height(s.b, theta(s) + phi(s)), 2)} V`],
      ['Added by hand', (s) => `${fixed(hand(s), 2)} V`],
      ['Green arrow shadow', (s) => `${fixed(arrows(s), 2)} V`],
      ['Peak of the sum', (s) => `${sig(sum(s).size, 3)} V`],
      ['Phase of the sum', (s) => `${fixed(sum(s).angle / RAD, 1)}°`],
    ] },
  ],
  tex: (s) => (s.view === 'one'
    ? `v=v_m\\sin\\omega t=${fixed(s.a, 1)}\\sin ${fixed(s.t, 0)}^\\circ=${fixed(s.a * Math.sin(theta(s)), 2)}\\ \\text{V}`
    : `\\sqrt{${fixed(s.a, 1)}^2+${fixed(s.b, 1)}^2+${fixed(2 * s.a * s.b, 1)}\\cos ${s.phi}^\\circ}=${sig(sum(s).size, 3)}\\ \\text{V}`),
  onChange() {
    clock.sync();
    showView();
  },
});

function setAngle(degrees) {
  clock.clock.pause();
  state.t = ((degrees % 360) + 360) % 360;
  clock.sync();
}

handles(tool.stage, [{
  at() {
    const { cx, cy, unit } = layout(tool.stage);
    return [cx + state.a * unit * Math.cos(theta()), cy - state.a * unit * Math.sin(theta())];
  },
  move(px, py) {
    const { cx, cy } = layout(tool.stage);
    setAngle(Math.round(Math.atan2(cy - py, px - cx) / RAD));
  },
  nudge(direction) { setAngle(state.t + direction * 5); },
}], { radius: 30, onChange: () => tool.update() });

showView();
clock.sync();
