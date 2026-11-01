import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { arc, arrow, dot, label, line } from '../../lib/draw.js';
import { cell, resistor } from '../../lib/circuit.js';
import { fixed, sig } from '../../lib/format.js';
import { balanceR4, bridge, isBalanced, r4ForPotential } from './_kirchhoff-math.js';

const NCERT = { E: 10, R1: 100, R2: 10, R3: 60, R4: 5, Rg: 15 };
const state = { R4: 20, R1: 20, R2: 30, R3: 40, E: 10, Rg: 50, cut: false };

const ohms = (n) => `${sig(n, 3)} Ω`;
const volts = (n) => `${fixed(n, 2)} V`;
const milliamps = (i) => `${sig(i * 1000, 3)} mA`;
const now = (s = state) => bridge(s);

// On this drawing, height is potential: A at the top is E, C at the bottom is 0 V.
const levels = (stage) => [stage.h * 0.1, stage.h * 0.9];
const heightOf = (stage, V) => {
  const [top, bottom] = levels(stage);
  return bottom - (V / state.E) * (bottom - top);
};
const points = (stage, { VB, VD }) => ({
  A: [stage.w * 0.52, levels(stage)[0]],
  C: [stage.w * 0.52, levels(stage)[1]],
  B: [stage.w * 0.3, heightOf(stage, VB)],
  D: [stage.w * 0.74, heightOf(stage, VD)],
});

function drawBattery(ctx, stage, c, A, C) {
  const x = stage.w * 0.08;
  line(ctx, x, A[1], A[0], A[1], { color: c.ink });
  line(ctx, x, C[1], C[0], C[1], { color: c.ink });
  cell(ctx, x, C[1], x, A[1], { color: c.ink });
  label(ctx, `${state.E} V`, x + 12, stage.h * 0.2, c, { size: 12, align: 'left', bounds: stage });
}

function drawArm(ctx, stage, c, from, to, name, color = c.ink) {
  resistor(ctx, ...from, ...to, { color });
  const side = from[0] < stage.w * 0.52 || to[0] < stage.w * 0.52 ? -1 : 1;
  label(ctx, name, (from[0] + to[0]) / 2 + side * 26, (from[1] + to[1]) / 2 + 4, c, { size: 12, color, bounds: stage });
}

function drawMeter(ctx, c, B, D, flow, on) {
  const [x, y] = [(B[0] + D[0]) / 2, (B[1] + D[1]) / 2];
  line(ctx, ...B, ...D, on ? { color: flow.good ? c.c : c.ink, width: 4 } : { color: c.grid, width: 3, dash: [6, 6] });
  dot(ctx, x, y, 24, c.paper, on ? c.ink : c.grid);
  arc(ctx, x, y + 8, 17, -Math.PI * 0.85, -Math.PI * 0.15, { color: c.grid, width: 2 });
  const swing = Math.max(-1, Math.min(1, flow.Ig / 0.05)) * 1.05;
  const tilt = Math.sign(swing) * Math.sqrt(Math.abs(swing) / 1.05) * 1.05; // a small current still shows
  line(ctx, x, y + 10, x + Math.sin(tilt) * 22, y + 10 - Math.cos(tilt) * 22, { color: c.a, width: 3 });
  dot(ctx, x, y + 10, 3, c.ink, c.ink, 1);
}

function drawLevels(ctx, stage, c, B, D, flow) {
  line(ctx, 0, B[1], stage.w, B[1], { color: c.b, width: 2, dash: [5, 5] });
  line(ctx, 0, D[1], stage.w, D[1], { color: c.a, width: 2, dash: [5, 5] });
  const x = stage.w * 0.93;
  if (Math.abs(B[1] - D[1]) > 14) {
    const [from, to] = flow.VB > flow.VD ? [B[1], D[1]] : [D[1], B[1]];
    arrow(ctx, x, from, x, to, { color: c.d, width: 3 });
    label(ctx, volts(Math.abs(flow.VB - flow.VD)), x - 6, (from + to) / 2, c, { size: 12, align: 'right', color: c.d, bounds: stage });
  }
}

const tool = createTool({
  state,
  label: 'A Wheatstone bridge drawn so that height is potential. The battery holds A at the top and C at the bottom. Midpoints B and D sit at their true heights, joined by a galvanometer. Drag D to change R4. When B and D are level, the galvanometer reads zero.',
  draw(ctx, stage, c) {
    const flow = now();
    const { A, B, C, D } = points(stage, flow);
    const good = isBalanced(state);
    drawLevels(ctx, stage, c, B, D, flow);
    drawBattery(ctx, stage, c, A, C);
    drawArm(ctx, stage, c, A, B, 'R₁');
    drawArm(ctx, stage, c, B, C, 'R₂');
    drawArm(ctx, stage, c, A, D, 'R₃');
    drawArm(ctx, stage, c, D, C, 'R₄', c.a);
    drawMeter(ctx, c, B, D, { ...flow, good }, !state.cut); // on top: B and D can sit right beside A or C
    dot(ctx, ...A, 6, c.ink, c.ink);
    dot(ctx, ...C, 6, c.ink, c.ink);
    dot(ctx, ...B, 8, c.b, c.ink);
    dot(ctx, ...D, 12, c.a, c.ink);
    label(ctx, 'A', A[0], A[1] - 15, c, { size: 13, bounds: stage });
    label(ctx, 'C', C[0], C[1] + 15, c, { size: 13, bounds: stage });
    label(ctx, `B ${volts(flow.VB)}`, B[0] - 12, B[1] - 15, c, { size: 12, align: 'right', bounds: stage, color: c.b });
    label(ctx, `D ${volts(flow.VD)}`, D[0] + 16, D[1] - 15, c, { size: 12, align: 'left', bounds: stage, color: c.a });
    label(ctx, good ? 'Level: no push across the bridge' : 'Drag D until the lines meet', stage.w / 2, stage.h - 12, c, { size: 12, bounds: stage, color: good ? c.c : c.ink });
  },
  controls: (t) => [
    { title: 'Tune the bridge' },
    { key: 'R4', label: 'R₄ (tune this)', min: 1, max: 200, step: 0.5, format: ohms },
    { key: 'R1', label: 'R₁', min: 5, max: 100, step: 5, format: ohms },
    { key: 'R2', label: 'R₂', min: 5, max: 100, step: 5, format: ohms },
    { key: 'R3', label: 'R₃', min: 5, max: 100, step: 5, format: ohms },
    { key: 'E', label: 'Battery', min: 2, max: 20, format: (n) => `${n} V` },
    { key: 'Rg', label: 'Galvanometer', min: 5, max: 100, step: 5, format: ohms },
    { key: 'cut', label: 'Cut the bridge wire', toggle: true },
    { button: 'NCERT Example: 100, 10, 60, 5 Ω', ghost: true, onClick() { Object.assign(state, NCERT, { cut: false }); t.update(); } },
    { readout: [
      ['B minus D', (s) => volts(now(s).VB - now(s).VD)],
      ['Galvanometer current', (s) => ({ text: s.cut ? 'wire cut' : milliamps(now(s).Ig), good: s.cut || isBalanced(s) })],
      ['Cutting moves B by', (s) => volts(Math.abs(bridge({ ...s, cut: true }).VB - bridge({ ...s, cut: false }).VB))],
      ['R₁/R₂', (s) => sig(s.R1 / s.R2, 3)],
      ['R₃/R₄', (s) => sig(s.R3 / s.R4, 3)],
      ['Balance needs R₄ =', (s) => ohms(balanceR4(s))],
    ] },
  ],
  tex: (s) => `\\frac{R_1}{R_2}=${sig(s.R1 / s.R2, 3)}\\quad\\frac{R_3}{R_4}=${sig(s.R3 / s.R4, 3)}\\quad I_g=${s.cut ? '0' : `${sig(now(s).Ig * 1000, 3)}\\ \\text{mA}`}`,
});

const clampR4 = (r) => Math.max(1, Math.min(200, Math.round(r * 2) / 2));
handles(tool.stage, [{
  at: () => points(tool.stage, now()).D,
  move(px, py) {
    const [top, bottom] = levels(tool.stage);
    const V = ((bottom - py) / (bottom - top)) * state.E;
    state.R4 = clampR4(r4ForPotential(state, V));
  },
  nudge(direction) { state.R4 = clampR4(state.R4 + direction * 0.5); },
}], { onChange: () => tool.update(), radius: 30 });
