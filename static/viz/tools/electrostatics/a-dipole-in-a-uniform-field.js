import { createTool } from '../../lib/tool.js';
import { createSim, transport } from '../../lib/sim.js';
import { handles } from '../../lib/stage.js';
import { arc, arrow, label, line } from '../../lib/draw.js';
import { drawCharge } from '../../lib/field.js';
import { fixed, sci, sig, texSci } from '../../lib/format.js';
import { dipoleTorque } from './_electric-field-math.js';

const state = { thetaDeg: 60, q: 2, length: 4, E: 5 };
const DAMP = 0.9;
const RATE = 0.25; // how many s⁻² of swing each unit of q·length·E gives on screen, slowed so the turn can be watched
const sim = createSim(document.querySelector('#stage'), {
  init: () => ({ t: 0, y: [(state.thetaDeg * Math.PI) / 180, 0] }),
  deriv: (t, [theta, spin]) => [spin, -RATE * state.q * state.length * state.E * 0.1 * Math.sin(theta) - DAMP * spin],
  onFrame(run) {
    state.thetaDeg = (run.y[0] * 180) / Math.PI;
    tool.update();
  },
});

const theta = (s = state) => (s.thetaDeg * Math.PI) / 180;
const now = (s = state) => dipoleTorque(s.q, s.length, s.E, theta(s));
const centre = (stage) => [stage.w / 2, stage.h * 0.5];
const half = (stage) => (Math.min(stage.w, stage.h) * (0.12 + state.length * 0.022));
const tip = (stage, sign) => {
  const [x, y] = centre(stage);
  return [x + sign * half(stage) * Math.cos(theta()), y - sign * half(stage) * Math.sin(theta())];
};

function drawField(ctx, stage, c) {
  for (let i = 1; i <= 5; i++) {
    const y = (stage.h * i) / 6;
    line(ctx, 8, y, stage.w - 8, y, { color: c.grid, width: 2 });
    for (const f of [0.2, 0.8]) arrow(ctx, stage.w * f - 8, y, stage.w * f + 8, y, { color: c.grid, width: 2 });
  }
  label(ctx, `E = ${state.E} × 10⁴ N/C`, stage.w - 8, 12, c, { size: 12, align: 'right', bounds: stage });
}

function drawTurn(ctx, stage, c) {
  const { torque } = now();
  if (Math.abs(torque) < 1e-9) return;
  const [x, y] = centre(stage);
  const r = stage.w * 0.1;
  const [a, b] = torque > 0 ? [-theta() - 0.2, -0.15] : [-theta() + 0.2, 0.15];
  arc(ctx, x, y, r, a, b, { color: c.d, width: 3 });
  const end = [x + r * Math.cos(b), y + r * Math.sin(b)];
  const way = torque > 0 ? 1 : -1;
  arrow(ctx, end[0] - way * Math.sin(b) * -2, end[1] - way * Math.cos(b) * 2, end[0] + way * Math.sin(b) * -8, end[1] + way * Math.cos(b) * 8, { color: c.d, width: 3 });
}

const tool = createTool({
  state,
  label: 'A dipole in a uniform electric field. The field pushes the positive end one way and the negative end the opposite way with equal forces, so the net force is zero but the pair turns the dipole towards the field. Drag the positive end to set the angle.',
  draw(ctx, stage, c) {
    drawField(ctx, stage, c);
    const [plus, minus] = [tip(stage, 1), tip(stage, -1)];
    const [x, y] = centre(stage);
    line(ctx, ...minus, ...plus, { color: c.ink, width: 5 });
    drawTurn(ctx, stage, c);
    const push = stage.w * (0.08 + state.q * state.E * 0.006);
    arrow(ctx, ...plus, plus[0] + push, plus[1], { color: c.a, width: 4 });
    arrow(ctx, ...minus, minus[0] - push, minus[1], { color: c.b, width: 4 });
    // The arm is the gap between the two lines of force, measured square across them.
    const armX = stage.w * 0.9;
    line(ctx, plus[0], plus[1], armX, plus[1], { color: c.c, width: 2, dash: [5, 5] });
    line(ctx, minus[0], minus[1], armX, minus[1], { color: c.c, width: 2, dash: [5, 5] });
    line(ctx, armX, plus[1], armX, minus[1], { color: c.c, width: 4 });
    label(ctx, '2a sin θ', armX - 6, y, c, { size: 12, align: 'right', color: c.c, bounds: stage });
    drawCharge(ctx, ...plus, 13, 1, c);
    drawCharge(ctx, ...minus, 13, -1, c);
    label(ctx, '+qE', plus[0] + push, plus[1] - 15, c, { size: 12, color: c.a, align: 'right', bounds: stage });
    label(ctx, '−qE', minus[0] - push, minus[1] + 15, c, { size: 12, color: c.b, align: 'left', bounds: stage });
    label(ctx, 'Drag the + end', 6, 12, c, { size: 11, align: 'left', bounds: stage });
    label(ctx, 'Green: the gap between the two forces', 6, stage.h - 12, c, { size: 11, align: 'left', bounds: stage });
  },
  controls: () => [
    { title: 'Twist the dipole' },
    { key: 'thetaDeg', label: 'Angle θ from E', min: -180, max: 180, step: 1, format: (n) => `${fixed(n, 0)}°` },
    transport(sim, { onChange: () => tool.update() }),
    { key: 'q', label: 'Charge q', min: 1, max: 5, format: (n) => `${n} µC` },
    { key: 'length', label: 'Length 2a', min: 1, max: 8, format: (n) => `${n} cm` },
    { key: 'E', label: 'Field E', min: 1, max: 10, format: (n) => `${n} × 10⁴ N/C` },
    { text: 'Press Play to let go. The swing is slowed and given some drag.' },
    { readout: [
      ['Force on +q', () => `${sig(now().force, 3)} N`],
      ['Force on −q', () => `−${sig(now().force, 3)} N`],
      ['Net force', () => ({ text: '0 N', good: true })],
      ['Dipole moment p', () => `${sci(now().p, 2)} C m`],
      ['Arm 2a sin θ', () => `${fixed(Math.abs(now().arm) * 100, 2)} cm`],
      ['Torque', () => `${sci(Math.abs(now().torque) || 0, 2)} N m`],
      ['Turns', () => (Math.abs(now().torque) < 1e-9 ? 'Not at all' : now().torque > 0 ? 'Clockwise' : 'Anticlockwise')],
    ] },
  ],
  tex: (s) => `\\tau=pE\\sin\\theta=(${texSci(now(s).p, 2)})(${s.E}\\times 10^{4})\\sin ${fixed(Math.abs(s.thetaDeg), 0)}^\\circ`,
  onChange() {
    if (Math.abs(sim.state.y[0] - theta()) > 1e-6) sim.state.y = [theta(), 0]; // the angle slider takes over from a swing
  },
});

const wrap = (deg) => ((deg + 540) % 360) - 180;
handles(tool.stage, [{
  at: () => tip(tool.stage, 1),
  move(px, py) {
    const [x, y] = centre(tool.stage);
    sim.pause();
    state.thetaDeg = Math.round((Math.atan2(y - py, px - x) * 180) / Math.PI);
    sim.state.y = [theta(), 0];
  },
  nudge(direction) {
    sim.pause();
    state.thetaDeg = wrap(state.thetaDeg + direction);
    sim.state.y = [theta(), 0];
  },
}], { onChange: () => tool.update(), radius: 30 });
