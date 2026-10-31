import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { dot, label, line as stroke } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { TAU, endTest, fitRatios } from './_standing-waves-math.js';

const CYCLE = 2;
const ROWS = 3;
const COLS = 26;
const state = { t: 0.4, r: 3, type: 'closed-open' };
const line = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const wave = (s, u) => (s.type === 'open-open' ? Math.cos : Math.sin)((Math.PI / 2) * s.r * u); // u = x / L, 0 to 1
const test = (s) => endTest(s.type, s.r);
const swing = (s) => Math.cos((TAU * s.t) / CYCLE);
const allowed = (s) => fitRatios(s.type, 8).join(', ');
const hop = (r) => () => {
  state.r = r;
  tool.update();
};

const tool = createTool({
  state,
  label: 'A pipe with air shown as dots, above a graph of how far the air swings along the pipe. The pipe is closed at its left end and open at its right end, or open at both. The frequency is set as a multiple of the lowest note of a closed pipe. A ring at the right end is green if the pattern fits there and coral if it does not.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [-1.4, 1.4], c, pad: 22, box: (g) => ({ x: 0, y: g.h * 0.4, w: g.w, h: g.h * 0.6 }) }),
  draw(ctx, stage, c, plot) {
    const left = plot.toPx(0, 0)[0];
    const right = plot.toPx(1, 0)[0];
    const top = 26;
    const rowGap = 18;
    const open = state.type === 'open-open';
    const result = test(state);
    // the pipe, with the air as dots
    ctx.fillStyle = c.fillB;
    ctx.fillRect(left, top, right - left, rowGap * (ROWS + 1));
    stroke(ctx, left, top, right, top, { color: c.ink, width: 4 });
    stroke(ctx, left, top + rowGap * (ROWS + 1), right, top + rowGap * (ROWS + 1), { color: c.ink, width: 4 });
    if (!open) stroke(ctx, left, top, left, top + rowGap * (ROWS + 1), { color: c.ink, width: 8 });
    const reach = (right - left) / COLS / 1.6;
    for (let r = 1; r <= ROWS; r++) {
      for (let i = 0; i < COLS; i++) {
        const u = (i + 0.5) / COLS;
        const x = left + u * (right - left) + reach * wave(state, u) * swing(state);
        dot(ctx, x, top + r * rowGap, 4, c.a, c.ink, 1.5);
      }
    }
    label(ctx, open ? 'open end: air swings freely' : 'closed end: air cannot move', left + 8, top - 14, c, { align: 'left', size: 11, bounds: stage });
    label(ctx, 'open end: air swings freely', right - 8, top + rowGap * (ROWS + 1) + 16, c, { align: 'right', size: 11, bounds: stage });
    // the pattern
    plot.axes({ xLabel: 'x / L', yLabel: 'how far the air swings' });
    plot.fn((x) => wave(state, x), { color: c.c, width: 3, dash: [5, 5] });
    plot.fn((x) => -wave(state, x), { color: c.c, width: 3, dash: [5, 5] });
    plot.fn((x) => wave(state, x) * swing(state), { color: c.c, width: 4 });
    const leftNode = !open;
    plot.point(0, 0, { fill: leftNode ? c.c : c.a, r: 7 });
    if (open) plot.point(0, swing(state), { fill: c.c, r: 7 });
    plot.point(1, wave(state, 1) * swing(state), { fill: result.fits ? c.c : c.a, r: 9 });
    plot.text(result.fits ? 'fits: the open end is an antinode' : 'does not fit: the air there is not free enough', 0.5, -1.15, { color: result.fits ? c.ink : c.a, size: 11 });
    ctx.save();
    ctx.strokeStyle = result.fits ? c.c : c.a;
    ctx.lineWidth = 4;
    ctx.strokeRect(right - 3, top - 3, 6, rowGap * (ROWS + 1) + 6);
    ctx.restore();
  },
  controls: [
    { title: 'Choose the note' },
    { key: 'type', label: 'The pipe is', options: [['closed-open', 'Closed at one end'], ['open-open', 'Open at both ends']] },
    { key: 'r', label: 'Frequency ÷ lowest note of the closed pipe', min: 0.5, max: 8, step: 0.05, format: (n) => `${fixed(n, 2)}` },
    { row: [1, 2, 3, 4].map((r) => ({ button: `× ${r}`, ghost: true, onClick: hop(r) })) },
    { row: [5, 6, 7].map((r) => ({ button: `× ${r}`, ghost: true, onClick: hop(r) })) },
    { key: 't', label: 'Slowed-down time', min: 0, max: CYCLE, step: 0.02, format: (n) => `${fixed(n, 2)} s` },
    transport(line.clock),
    { readout: [
      ['Open end swings', (s) => ({ text: `${fixed(test(s).value * 100, 0)}% of the most`, good: test(s).fits })],
      ['Notes that fit (× lowest)', (s) => allowed(s)],
    ] },
  ],
  tex: (s) => {
    const nu1 = '\\nu_1=\\dfrac{v}{4L}';
    return `${nu1}:\\quad \\nu = ${fixed(s.r, 2)}\\,\\nu_1\\ \\Rightarrow\\ \\dfrac{4L}{\\lambda}=${fixed(s.r, 2)}\\ \\text{quarter-waves}`;
  },
  onChange: () => line.sync(),
});

line.sync();
