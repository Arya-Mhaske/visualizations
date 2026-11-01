import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { arrow, dot, label, line, poly } from '../../lib/draw.js';
import { fixed, sci, sig } from '../../lib/format.js';
import { paperForces, uniformForces, weight } from './_electric-field-math.js';

const state = { r: 3, Q: 10, negative: true, uniform: false };
const WEIGHT = weight();
const Q = (s = state) => s.Q * 1e-9;
const combY = (stage) => stage.h * 0.16;
const span = (stage) => stage.h * 0.56;
const paperY = (stage, r = state.r) => combY(stage) + (r / 6) * span(stage);
const forces = (s = state) => (s.uniform ? uniformForces(paperForces(Q(s), s.r * 1e-2).E) : paperForces(Q(s), s.r * 1e-2));
const lifts = (s = state) => forces(s).net > WEIGHT;
const milli = (x) => `${sig(x * 1e6, 3)} µN`;

function drawComb(ctx, stage, c) {
  const y = combY(stage);
  const [left, right] = [stage.w * 0.12, stage.w * 0.88];
  poly(ctx, [[left, y - 26], [right, y - 26], [right, y - 12], [left, y - 12]], { fill: c.ink });
  for (let i = 0; i <= 24; i++) {
    const x = left + ((right - left) * i) / 24;
    line(ctx, x, y - 12, x, y, { color: c.ink, width: 3 });
  }
  if (state.uniform) return;
  const sign = state.negative ? '−' : '+';
  for (let i = 0; i < 7; i++) label(ctx, sign, stage.w * (0.5 + (i - 3) * 0.05), y + 10, c, { size: 13, color: state.negative ? c.b : c.a, patch: false });
}

function drawUniform(ctx, stage, c) {
  for (const f of [0.15, 0.3, 0.7, 0.85]) {
    const [top, bottom] = [combY(stage) + 8, combY(stage) + 8 + span(stage)];
    // a field points towards negative charge
    arrow(ctx, stage.w * f, state.negative ? bottom : top, stage.w * f, state.negative ? top : bottom, { color: c.grid, width: 2 });
  }
}

function drawLines(ctx, stage, c) {
  const top = [stage.w / 2, combY(stage) + 8];
  for (let i = -4; i <= 4; i++) {
    const x = stage.w * (0.5 + i * 0.1);
    line(ctx, top[0], top[1], x, stage.h * 0.92, { color: c.grid, width: 2 });
  }
}

function drawPaper(ctx, stage, c) {
  const y = paperY(stage);
  const halfW = stage.w * 0.13;
  const h = 36;
  poly(ctx, [[stage.w / 2 - halfW, y - h / 2], [stage.w / 2 + halfW, y - h / 2], [stage.w / 2 + halfW, y + h / 2], [stage.w / 2 - halfW, y + h / 2]], { fill: c.paper, stroke: c.ink });
  const nearSign = state.negative ? 1 : -1;
  const row = (rowY, sign) => {
    for (let i = -2; i <= 2; i++) dot(ctx, stage.w / 2 + i * halfW * 0.38, rowY, 6, sign > 0 ? c.a : c.b, c.ink, 1);
  };
  row(y - h / 2 + 8, nearSign);
  row(y + h / 2 - 8, -nearSign);
  const { near, far } = forces();
  const unit = 64 / near; // the near arrow keeps its length, so the far arrow shows the share that is left
  const x = stage.w / 2;
  arrow(ctx, x - 36, y - h / 2, x - 36, y - h / 2 - near * unit, { color: c.c, width: 4 });
  arrow(ctx, x + 36, y + h / 2, x + 36, y + h / 2 + far * unit, { color: c.a, width: 4 });
  label(ctx, 'pull', x - 44, y - h / 2 - 16, c, { size: 11, align: 'right', color: c.c, bounds: stage });
  label(ctx, 'push', x + 44, y + h / 2 + 16, c, { size: 11, align: 'left', color: c.a, bounds: stage });
}

// How the net pull compares with the weight: the line in the bar is the weight.
function drawMeter(ctx, stage, c) {
  const [x, y, w, h] = [stage.w * 0.16, stage.h - 42, stage.w * 0.68, 14];
  const full = Math.min(1, forces().net / (2 * WEIGHT));
  poly(ctx, [[x, y], [x + w * full, y], [x + w * full, y + h], [x, y + h]], { fill: lifts() ? c.c : c.fillB });
  poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { stroke: c.ink, width: 2 });
  line(ctx, x + w / 2, y - 4, x + w / 2, y + h + 4, { color: c.d, width: 3 });
  label(ctx, 'Net pull, against the weight', x + w / 2, y - 12, c, { size: 11, color: c.d, bounds: stage });
}

const tool = createTool({
  state,
  label: 'A charged comb above a scrap of paper. Charge in the paper separates, with the opposite sign nearer the comb. The near side is pulled harder than the far side is pushed, so the neutral paper feels a net pull. Drag the paper to change its distance from the comb.',
  draw(ctx, stage, c) {
    if (state.uniform) drawUniform(ctx, stage, c);
    else drawLines(ctx, stage, c);
    drawComb(ctx, stage, c);
    drawPaper(ctx, stage, c);
    drawMeter(ctx, stage, c);
    const y = stage.h - 14;
    label(ctx, lifts() ? 'The pull beats the weight: it jumps up' : 'Too weak to lift it', stage.w / 2, y, c, { size: 12, color: lifts() ? c.c : c.ink, bounds: stage });
    label(ctx, 'Drag the paper', 6, 12, c, { size: 11, align: 'left', bounds: stage });
  },
  controls: () => [
    { title: 'Comb and paper' },
    { key: 'r', label: 'Gap to the paper', min: 1, max: 6, step: 0.1, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'Q', label: 'Charge on the comb', min: 2, max: 20, format: (n) => `${n} nC` },
    { key: 'negative', label: 'Comb is negative (switch off for positive)', toggle: true },
    { key: 'uniform', label: 'Swap to a uniform field of the same strength', toggle: true },
    { readout: [
      ['Charge on the paper', () => '0 net'],
      ['Near side of the paper', (s) => (s.negative ? 'Positive' : 'Negative')],
      ['Field at the paper', () => `${sci(paperForces(Q(), state.r * 1e-2).E, 2)} N/C`],
      ['Pull on the near side', () => milli(forces().near)],
      ['Push on the far side', () => milli(forces().far)],
      ['Net pull', () => milli(forces().net)],
      ['Weight of the paper', () => milli(WEIGHT)],
      ['Lifts?', () => ({ text: lifts() ? 'Yes' : 'No', good: lifts() })],
    ] },
  ],
  tex: (s) => `F_{\\text{net}}=F_{\\text{near}}-F_{\\text{far}}=${sig(forces(s).near * 1e6, 3)}-${sig(forces(s).far * 1e6, 3)}=${sig(forces(s).net * 1e6, 3)}\\ \\mu\\text{N}`,
});

const clampR = (r) => Math.max(1, Math.min(6, Math.round(r * 10) / 10));
handles(tool.stage, [{
  at: () => [tool.stage.w / 2, paperY(tool.stage)],
  move(px, py) { state.r = clampR(((py - combY(tool.stage)) / span(tool.stage)) * 6); },
  nudge(direction) { state.r = clampR(state.r - direction * 0.1); },
}], { onChange: () => tool.update(), radius: 40 });
