import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { createTone } from '../../lib/tone.js';
import { transport } from '../../lib/sim.js';
import { fixed } from '../../lib/format.js';
import { TAU, antinodesOf, harmonicNumber, modeFreq, noteOf, nodesOf, shape } from './_standing-waves-math.js';

const SPEED = { string: 240, open: 340, closed: 340 }; // m/s: a guitar-like string; air
const NAME = { string: 'string, fixed at both ends', open: 'pipe open at both ends', closed: 'pipe closed at one end' };
const CYCLE = 2;
const state = { kind: 'closed', n: 2, L: 0.6, t: 0.4, sound: false };
const tone = createTone();
const line = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const v = (s) => SPEED[s.kind];
const freq = (s) => modeFreq(s.kind, s.n, v(s), s.L);
const lambda = (s) => v(s) / freq(s);
const ladder = (s) => [1, 2, 3, 4, 5, 6].map((n) => fixed(modeFreq(s.kind, n, v(s), s.L), 0)).join(', ');
const swing = (s) => Math.cos((TAU * s.t) / CYCLE);

const tool = createTool({
  state,
  label: 'A graph of a standing wave along a string or pipe of length L, with its nodes marked N and its antinodes marked A. The wave swings up and down slowly. Controls choose the kind of string or pipe, the mode number and the length.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [-1.5, 1.5], c, pad: 24 }),
  draw(ctx, stage, c, plot) {
    const { kind, n, L } = state;
    plot.setRange([0, L], [-1.5, 1.5]);
    plot.axes({ xLabel: 'x (m)', yLabel: kind === 'string' ? 'height' : 'air swing' });
    plot.fn((x) => shape(kind, n, L, x), { color: c.grid, width: 2, dash: [5, 5] });
    plot.fn((x) => -shape(kind, n, L, x), { color: c.grid, width: 2, dash: [5, 5] });
    plot.fn((x) => shape(kind, n, L, x) * swing(state), { color: c.c, width: 4 });
    plot.segment(0, -1.5, 0, 1.5, { color: c.ink, width: kind === 'open' ? 2 : 6 });
    plot.segment(L, -1.5, L, 1.5, { color: c.ink, width: kind === 'closed' || kind === 'open' ? 2 : 6 });
    for (const x of nodesOf(kind, n, L)) plot.point(x, 0, { fill: c.ink, r: 5 });
    for (const x of antinodesOf(kind, n, L)) plot.point(x, shape(kind, n, L, x) * swing(state), { fill: c.a, r: 6 });
    plot.text('black dots = nodes, coral = antinodes', L / 2, 1.3, { size: 11 });
  },
  controls: [
    { title: 'Pick a mode' },
    { key: 'kind', label: 'The instrument is', options: [['string', 'String'], ['open', 'Open pipe'], ['closed', 'Closed pipe']] },
    { key: 'n', label: 'Mode number, n', min: 1, max: 8, step: 1, format: (n) => String(n) },
    { key: 'L', label: 'Length, L', min: 0.3, max: 1.2, step: 0.05, format: (n) => `${fixed(n, 2)} m` },
    { key: 't', label: 'Slowed-down time', min: 0, max: CYCLE, step: 0.02, format: (n) => `${fixed(n, 2)} s` },
    transport(line.clock),
    { key: 'sound', label: 'Hear this mode', toggle: true },
    { readout: [
      ['This is', (s) => NAME[s.kind]],
      ['Harmonic number', (s) => `${harmonicNumber(s.kind, s.n)}`],
      ['Frequency, ν', (s) => `${fixed(freq(s), 1)} Hz (${noteOf(freq(s)).name})`],
      ['Wavelength, λ', (s) => `${fixed(lambda(s), 3)} m`],
      ['Nodes / antinodes', (s) => `${nodesOf(s.kind, s.n, s.L).length} / ${antinodesOf(s.kind, s.n, s.L).length}`],
      ['First six notes (Hz)', (s) => ladder(s)],
    ] },
  ],
  tex: (s) => (s.kind === 'closed'
    ? `\\nu_n=\\dfrac{(2n-1)v}{4L}=\\dfrac{${2 * s.n - 1}\\times${v(s)}}{4\\times${fixed(s.L, 2)}}=${fixed(freq(s), 1)}\\ \\text{Hz}`
    : `\\nu_n=\\dfrac{nv}{2L}=\\dfrac{${s.n}\\times${v(s)}}{2\\times${fixed(s.L, 2)}}=${fixed(freq(s), 1)}\\ \\text{Hz}`),
  onChange: (s) => {
    line.sync();
    tone.set(s.sound ? freq(s) : 0);
  },
});

line.sync();
