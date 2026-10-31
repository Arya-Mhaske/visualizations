import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { createRng } from '../../lib/rng.js';
import { transport } from '../../lib/sim.js';
import { handles } from '../../lib/stage.js';
import { arrow, dot, label, line, poly, TAU } from '../../lib/draw.js';
import { fixed, sci, sig, texSci } from '../../lib/format.js';
import {
  LIGHT_SPEED, MARBLES, SIGNAL_SPEED, SOUND_SPEED, THERMAL_SPEED, WALKING_SPEED, crossingTime, driftSpeed, pipeEmpty, pipeFull,
} from './_current-drift-math.js';

const CYCLE = 3; // s of slowed time in one run
const FRONT_END = 2; // the signal reaches the bulb 2 s into the run
const COUNT = 36;
const JITTER = 130; // px/s on screen for the thermal motion
const state = { view: 'pipe', push: 0.6, I: 1.5, boost: 1e7, field: true, L: 10, t: 1.2 };
const rng = createRng(7);
const gas = Array.from({ length: COUNT }, () => ({ x: rng.next(), y: rng.next(), a: rng.next() * TAU, left: rng.next() }));
let lastT = state.t;

const vd = (s) => driftSpeed(s.I);
const fraction = (s) => Math.min(1, s.t / FRONT_END);
const signalTime = (s) => crossingTime(s.L, SIGNAL_SPEED);
const walkTime = (s) => crossingTime(s.L, vd(s));
const hours = (seconds) => (seconds >= 3600 ? `${sig(seconds / 3600, 2)} h` : `${sig(seconds / 60, 2)} min`);

function advance() {
  const dt = (state.t - lastT + CYCLE) % CYCLE;
  lastT = state.t;
  if (state.view !== 'wire' || dt > 0.5) return;
  const stage = tool.stage;
  const speed = JITTER / Math.max(stage.w, 1);
  // on screen the jitter stands for THERMAL_SPEED, so drift has the true ratio times the boost
  const drift = state.field ? (vd(state) / THERMAL_SPEED) * state.boost * speed : 0;
  for (const e of gas) {
    e.left -= dt;
    if (e.left <= 0) {
      e.a = rng.next() * TAU;
      e.left = 0.15 + rng.next() * 0.5;
    }
    e.x = (e.x + Math.cos(e.a) * speed * dt + drift * dt + 1) % 1;
    e.y = (e.y + Math.sin(e.a) * speed * dt + 1) % 1;
  }
}

function drawPipe(ctx, stage, c, y, title, marbles) {
  const left = 34;
  const d = (stage.w - left - 34) / (MARBLES + 0.5);
  const right = left + d * MARBLES + d * 0.3;
  const r = d / 2 - 1;
  label(ctx, title, left, y - d - 12, c, { size: 12, align: 'left', bounds: stage });
  line(ctx, left - 8, y - d / 2 - 3, right, y - d / 2 - 3, { color: c.ink, width: 3 });
  line(ctx, left - 8, y + d / 2 + 3, right, y + d / 2 + 3, { color: c.ink, width: 3 });
  const headX = left + state.push * d - 2;
  line(ctx, 0, y, headX, y, { color: c.a, width: 8 });
  line(ctx, headX, y - r, headX, y + r, { color: c.a, width: 6 });
  marbles.forEach((m, i) => dot(ctx, left + (m + 0.5) * d, y, r, i === MARBLES - 1 ? c.c : c.fillB, c.ink, 2));
  return { x: headX, d };
}

let plunger = { x: 0, d: 1, y: 0 };
function drawPipes(ctx, stage, c) {
  const one = stage.h * 0.3;
  const made = drawPipe(ctx, stage, c, one, 'Pipe already full', pipeFull(state.push));
  drawPipe(ctx, stage, c, stage.h * 0.72, 'One marble in an empty pipe', pipeEmpty(state.push));
  plunger = { ...made, y: one };
  dot(ctx, made.x, one, 9, c.a, c.ink);
}

function drawGas(ctx, stage, c) {
  const top = 34;
  const h = stage.h - 74;
  poly(ctx, [[0, top], [stage.w, top], [stage.w, top + h], [0, top + h]], { fill: c.fillY, stroke: c.ink });
  label(ctx, state.field ? 'field ON: the whole crowd creeps' : 'field OFF: no net motion', 8, 16, c, { size: 12, align: 'left', bounds: stage });
  gas.forEach((e, i) => dot(ctx, e.x * stage.w, top + 8 + e.y * (h - 16), i ? 5 : 8, i ? c.b : c.a, c.ink, i ? 1 : 2));
  if (state.field) arrow(ctx, stage.w * 0.3, top + h + 20, stage.w * 0.7, top + h + 20, { color: c.c, width: 5 });
  label(ctx, state.boost > 1 ? 'drift drawn × 10 million' : 'drift at true size: invisible', stage.w / 2, stage.h - 8, c, { size: 11, bounds: stage });
}

function drawSignal(ctx, stage, c) {
  const left = 24;
  const right = stage.w - 56;
  const y = stage.h * 0.42;
  const front = left + (right - left) * fraction(state);
  const reached = fraction(state) >= 1;
  label(ctx, `${sig(state.L, 3)} m of wire, slowed down`, 8, 18, c, { size: 12, align: 'left', bounds: stage });
  line(ctx, left, y, right, y, { color: c.ink, width: 12 });
  if (state.t > 0) line(ctx, left, y, front, y, { color: c.a, width: 6 });
  for (let i = 0; i <= 14; i++) {
    const x = left + ((right - left) * i) / 14;
    dot(ctx, x, y, 4, x <= front && state.t > 0 ? c.c : c.paper, c.ink, 1);
  }
  dot(ctx, right + 24, y, 20, reached ? c.fillY : c.paper, c.ink);
  label(ctx, reached ? 'lit' : 'bulb', right + 24, y, c, { size: 11, patch: false });
  label(ctx, 'switch', left, y + 26, c, { size: 11, align: 'left', bounds: stage });
  label(ctx, 'Green: electrons already', 8, stage.h * 0.68, c, { size: 12, align: 'left', bounds: stage });
  label(ctx, 'in the wire, now drifting', 8, stage.h * 0.68 + 18, c, { size: 12, align: 'left', bounds: stage });
  label(ctx, `Field front: ${sig(fraction(state) * signalTime(state) * 1e9, 3)} ns`, 8, stage.h * 0.86, c, { size: 12, align: 'left', color: c.a, bounds: stage });
}

function drawScale(ctx, stage, c) {
  const rows = [
    ['electron drift', vd(state), c.a],
    ['walking', WALKING_SPEED, c.ink],
    ['sound in air', SOUND_SPEED, c.ink],
    ['thermal jitter', THERMAL_SPEED, c.b],
    ['field signal', SIGNAL_SPEED, c.c],
    ['light', LIGHT_SPEED, c.d],
  ];
  const left = 14;
  const span = stage.w - 28;
  const lo = -6;
  const hi = 9;
  const px = (v) => left + ((Math.log10(v) - lo) / (hi - lo)) * span;
  const gap = (stage.h - 60) / rows.length;
  rows.forEach(([name, value, color], i) => {
    const y = 14 + gap * i;
    poly(ctx, [[left, y + 16], [px(value), y + 16], [px(value), y + 34], [left, y + 34]], { fill: color, stroke: c.ink, width: 2 });
    label(ctx, `${name}: ${sig(value, 2)} m/s`, left, y + 6, c, { size: 11, align: 'left', bounds: stage });
  });
  const base = stage.h - 30;
  line(ctx, left, base, left + span, base, { color: c.ink, width: 2 });
  for (let k = lo; k <= hi; k += 3) {
    line(ctx, px(10 ** k), base - 4, px(10 ** k), base + 4, { color: c.ink, width: 2 });
    label(ctx, `10${k < 0 ? '⁻' : ''}${String(Math.abs(k)).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`, px(10 ** k), base + 15, c, { size: 10, bounds: stage });
  }
}

const VIEWS = { pipe: drawPipes, wire: drawGas, signal: drawSignal, scale: drawScale };
const SHOWS = { push: ['pipe'], I: ['wire', 'signal', 'scale'], boost: ['wire'], field: ['wire'], L: ['signal'], t: ['signal'], play: ['wire', 'signal'] };

const line2 = createTimeline(document.querySelector('#stage'), state, {
  cycle: () => CYCLE,
  update: () => { advance(); tool.update(); },
});

const tool = createTool({
  state,
  label: 'Four views, chosen in the panel. Pipe: a plunger pushes a pipe full of marbles and a nearly empty pipe. Wire: electrons jittering in a wire with a tiny drift. Signal: a field front runs down a wire to a bulb. Speeds: bars on a log scale from electron drift to light.',
  draw: (ctx, stage, c) => VIEWS[state.view](ctx, stage, c),
  controls: () => [
    { key: 'view', label: 'View', options: [['pipe', '1 Pipe'], ['wire', '2 Wire'], ['signal', '3 Signal'], ['scale', '4 Speeds']] },
    { key: 'push', label: 'Push, in marble widths', min: 0, max: 1, step: 0.05, format: (n) => fixed(n, 2) },
    { key: 'I', label: 'Current, I', min: 0.1, max: 10, step: 0.1, format: (n) => `${fixed(n, 1)} A` },
    { key: 'boost', label: 'Draw drift', options: [[1e7, '× 10 million'], [1, 'True size']] },
    { key: 'field', label: 'Battery connected', toggle: true },
    { key: 'L', label: 'Wire length, L', min: 1, max: 100, step: 1, format: (n) => `${n} m` },
    { key: 't', label: 'Slowed time', min: 0, max: CYCLE, step: 0.01, format: (n) => `${fixed(n, 2)} s` },
    transport(line2.clock),
    { readout: [
      ['Far marble, full pipe', (s) => `moved ${fixed(s.push, 2)}`],
      ['Far end, empty pipe', () => 'nothing yet'],
      ['Widths to reach far end', () => String(MARBLES - 1)],
    ] },
    { readout: [
      ['Thermal speed, about', () => sci(THERMAL_SPEED, 1) + ' m/s'],
      ['Drift speed', (s) => `${sig(vd(s) * 1000, 2)} mm/s`],
      ['Jitter ÷ drift', (s) => sci(THERMAL_SPEED / vd(s), 1)],
    ] },
    { readout: [
      ['Signal crosses wire in', (s) => `${sig(signalTime(s) * 1e9, 3)} ns`],
      ['One electron would take', (s) => hours(walkTime(s))],
      ['Wire area', () => '10⁻⁷ m²'],
    ] },
    { readout: [
      ['Drift speed', (s) => `${sig(vd(s) * 1000, 2)} mm/s`],
      ['Walking ÷ drift', (s) => sig(WALKING_SPEED / vd(s), 2)],
      ['Signal ÷ drift', (s) => sci(SIGNAL_SPEED / vd(s), 1)],
    ] },
  ],
  tex: (s) => (s.view === 'signal'
    ? `t_{\\text{signal}}=\\dfrac{L}{v}=\\dfrac{${s.L}}{2\\times10^{8}}=${sig(signalTime(s) * 1e9, 3)}\\ \\text{ns}`
    : `v_d=\\dfrac{I}{neA}=\\dfrac{${fixed(s.I, 1)}}{1360}=${texSci(vd(s), 2)}\\ \\text{m/s}`),
  onChange: (s) => {
    line2.sync();
    lastT = s.t;
    showView();
  },
});

// Only the controls and readout of the current view are shown.
function showView() {
  const panel = document.querySelector('#panel');
  const stack = panel.firstElementChild;
  const items = [...stack.children];
  const keys = ['view', 'push', 'I', 'boost', 'field', 'L', 't', 'play'];
  keys.forEach((key, i) => { if (key !== 'view') items[i].hidden = !SHOWS[key].includes(state.view); });
  ['pipe', 'wire', 'signal', 'scale'].forEach((view, i) => { items[keys.length + i].hidden = view !== state.view; });
}

showView();
line2.sync();
handles(tool.stage, [{
  at: () => (state.view === 'pipe' ? [plunger.x, plunger.y] : [-99, -99]),
  move(px) {
    const left = 34 - 2;
    state.push = Math.round(Math.max(0, Math.min(1, (px - left) / plunger.d)) * 20) / 20;
  },
  nudge(direction) {
    if (state.view === 'pipe') state.push = Math.round(Math.max(0, Math.min(1, state.push + direction * 0.05)) * 20) / 20;
  },
}], { onChange: () => tool.update() });
tool.update();
