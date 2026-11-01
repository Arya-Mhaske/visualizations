import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { drawCharge } from '../../lib/field.js';
import { sig, fixed } from '../../lib/format.js';
import { dipoleField, dipoleSlope, singleField } from './_electric-field-math.js';

const state = { r: 6, a: 1, q: 2, where: 'axial' };
const LOG_MAX = Math.log10(40);
const minR = (s = state) => (s.where === 'axial' ? 1.4 * s.a : 1.2);
const now = (s = state) => dipoleField(s.where, s.q, s.a, s.r);
const row = (stage) => stage.h * 0.24;
const left = (stage) => stage.w * 0.12;
const track = (stage) => stage.w * 0.62 - 34; // leaves room for a full-length arrow at the far end
const pointX = (stage, r) => left(stage) + 34 + (Math.log10(r) / LOG_MAX) * track(stage);
const rFrom = (stage, px) => 10 ** (((px - left(stage) - 34) / track(stage)) * LOG_MAX);

function drawDipole(ctx, stage, c) {
  const [x, y] = [left(stage), row(stage)];
  const [dx, dy] = state.where === 'axial' ? [20, 0] : [0, 20];
  line(ctx, x - dx, y + dy, x + dx, y - dy, { color: c.ink, width: 3 });
  drawCharge(ctx, x + dx, y - dy, 10, 1, c);
  drawCharge(ctx, x - dx, y + dy, 10, -1, c);
}

function drawVectors(ctx, stage, c) {
  const { plus, minus, net } = now();
  const [x, y] = [pointX(stage, state.r), row(stage)];
  const scale = Math.min(stage.h * 0.15, stage.w * 0.22) / plus; // E₊ always has the same length, so the picture shows the fraction left over
  const { a, r, where } = state;
  if (where === 'axial') {
    arrow(ctx, x, y - 11, x + plus * scale, y - 11, { color: c.a, width: 4 });
    arrow(ctx, x, y + 11, x - minus * scale, y + 11, { color: c.b, width: 4 });
    arrow(ctx, x, y + 28, x + net * scale, y + 28, { color: c.c, width: 4, head: 8 });
    return;
  }
  const s = a / Math.hypot(r, a);
  const co = r / Math.hypot(r, a);
  arrow(ctx, x - 3, y, x - 3 + co * plus * scale, y + s * plus * scale, { color: c.a, width: 4 });
  arrow(ctx, x + 3, y, x + 3 - co * minus * scale, y + s * minus * scale, { color: c.b, width: 4 });
  arrow(ctx, x, y, x, y + net * scale, { color: c.c, width: 4, head: 8 });
}

function drawGraph(ctx, stage, c, plot) {
  const { q, a, where } = state;
  const big = Math.log10(singleField(q, 1));
  plot.setRange([0, LOG_MAX], [big - 6, big]);
  plot.axes({ xLabel: 'log r', yLabel: 'log E' });
  const lowest = where === 'axial' ? Math.log10(1.05 * a) : 0;
  const dipole = (lr) => Math.log10(dipoleField(where, q, a, 10 ** lr).net);
  plot.fn((lr) => Math.log10(singleField(q, 10 ** lr)), { color: c.d, dash: [6, 5] });
  plot.fn(dipole, { color: c.c, domain: [Math.max(0, lowest), LOG_MAX] });
  plot.point(Math.log10(state.r), Math.log10(now().net), { fill: c.a });
  plot.text('One charge', LOG_MAX * 0.72, big - 2.2, { size: 11, color: c.d });
  plot.text('Dipole', LOG_MAX * 0.72, dipole(LOG_MAX * 0.72) - 0.4, { size: 11, color: c.c });
}

const tool = createTool({
  state,
  label: 'A dipole with a point P that can be moved away from it. Arrows at P show the field of each charge and their small sum. Below, a log graph compares the dipole with one charge alone: the dipole falls more steeply, with a slope that settles at minus 3.',
  setup: (stage, c) => createPlot(stage, { c, box: (s) => ({ x: 0, y: s.h * 0.46, w: s.w, h: s.h * 0.54 }) }),
  draw(ctx, stage, c, plot) {
    const y = row(stage);
    line(ctx, left(stage), y, stage.w - 6, y, { color: c.grid, width: 2, dash: [5, 5] });
    drawDipole(ctx, stage, c);
    drawVectors(ctx, stage, c);
    dot(ctx, pointX(stage, state.r), y, 10, c.paper, c.ink);
    label(ctx, 'Drag P', 6, 12, c, { size: 11, align: 'left', bounds: stage });
    label(ctx, 'Coral +q, blue −q, green sum', stage.w - 6, 12, c, { size: 11, align: 'right', bounds: stage });
    drawGraph(ctx, stage, c, plot);
  },
  controls: () => [
    { title: 'Walk away from a dipole' },
    { key: 'r', label: 'Distance r', min: 1.2, max: 40, step: 0.2, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'where', label: 'Direction', options: [['axial', 'Along the axis'], ['equator', 'Sideways']] },
    { key: 'a', label: 'Half-separation a', min: 0.5, max: 2, step: 0.1, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'q', label: 'Charge q', min: 1, max: 5, format: (n) => `${n} nC` },
    { readout: [
      ['From +q alone', () => `${sig(now().plus, 3)} N/C`],
      ['From −q alone', () => `${sig(now().minus, 3)} N/C`],
      ['Sum', () => `${sig(now().net, 3)} N/C`],
      ['Sum is this share of +q', () => `${sig((now().net / now().plus) * 100, 3)}%`],
      ['Far-field formula gives', () => `${sig(now().approx, 3)} N/C`],
      ['Slope on the graph', (s) => fixed(dipoleSlope(s.where, s.a, s.r), 2)],
    ] },
  ],
  tex: (s) => (s.where === 'axial'
    ? `E\\approx\\frac{2kp}{r^3}=${sig(now(s).approx, 3)}\\ \\text{N/C}`
    : `E\\approx\\frac{kp}{r^3}=${sig(now(s).approx, 3)}\\ \\text{N/C}`),
  onChange() { state.r = Math.max(state.r, minR()); },
});

const clampR = (r) => Math.max(minR(), Math.min(40, Math.round(r * 5) / 5));
handles(tool.stage, [{
  at: () => [pointX(tool.stage, state.r), row(tool.stage)],
  move(px) { state.r = clampR(rFrom(tool.stage, px)); },
  nudge(direction) { state.r = clampR(state.r + direction * 0.2); },
}], { onChange: () => tool.update(), radius: 28 });
