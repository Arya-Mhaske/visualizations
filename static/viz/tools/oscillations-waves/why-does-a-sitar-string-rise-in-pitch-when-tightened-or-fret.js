import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { createTone } from '../../lib/tone.js';
import { transport } from '../../lib/sim.js';
import { fixed } from '../../lib/format.js';
import { TAU, fretLength, noteOf, semitones, stringFreq, stringSpeed } from './_standing-waves-math.js';

const MU = 0.0005; // kg/m: a thin steel string
const L0 = 0.9; // m: the open string
const CYCLE = 2;
const NU_MAX = 1000;
const state = { T: 80, L: 0.9, t: 0.4, sound: false };
const tone = createTone();
const line = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const freq = (s) => stringFreq(s.T, MU, s.L);
const openFreq = (s) => stringFreq(s.T, MU, L0);
const note = (s) => noteOf(freq(s));
const cents = (s) => (note(s).cents >= 0 ? `+${note(s).cents}` : String(note(s).cents).replace('-', '−'));
const fret = (L) => () => {
  state.L = L;
  tone.set(state.sound ? freq(state) : 0);
  tool.update();
};

const tool = createTool({
  state,
  label: 'Two graphs. Top: a string from the bridge on the left to a fret you can move; the part between them vibrates in its lowest mode, and small ticks show where the twelve semitone frets of a guitar would go. Bottom: the pitch against the vibrating length, for your tension (solid) and for four times the tension (dashed), with a coral marker at your setting.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, L0], y: [-1.6, 1.6], c, pad: 22, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.4 }) }),
    low: createPlot(stage, { x: [0.4, 0.95], y: [0, NU_MAX], c, pad: 22, box: (g) => ({ x: 0, y: g.h * 0.4, w: g.w, h: g.h * 0.6 }) }),
  }),
  draw(ctx, stage, c, { top, low }) {
    const { T, L } = state;
    top.axes({ xLabel: 'x (m)', yLabel: 'string, from the bridge' });
    for (let k = 1; k <= 12; k++) top.segment(fretLength(L0, k), -0.3, fretLength(L0, k), 0.3, { color: c.grid, width: 2 });
    top.segment(L, 0, L0, 0, { color: c.grid, width: 2, dash: [4, 4] });
    top.fn((x) => 1.2 * Math.sin((Math.PI * x) / L) * Math.cos((TAU * state.t) / CYCLE), { color: c.c, width: 4, domain: [0, L] });
    top.segment(L, -1.4, L, 1.4, { color: c.ink, width: 6 });
    top.segment(0, -1.4, 0, 1.4, { color: c.ink, width: 6 });
    top.text('fret', L, -1.35, { size: 11 });
    low.axes({ xLabel: 'L (m)', yLabel: 'pitch ν (Hz)' });
    low.fn((x) => stringFreq(T, MU, x), { color: c.a, width: 3 });
    low.fn((x) => stringFreq(4 * T, MU, x), { color: c.b, width: 3, dash: [6, 5] });
    low.point(L, freq(state), { fill: c.a, r: 7 });
    low.text('4 × tension', 0.5, Math.min(NU_MAX - 40, stringFreq(4 * T, MU, 0.5)) , { color: c.b, size: 11 });
  },
  controls: [
    { title: 'Tune and fret' },
    { key: 'T', label: 'Tension, T', min: 20, max: 100, step: 5, format: (n) => `${n} N` },
    { key: 'L', label: 'Vibrating length, L', min: 0.45, max: 0.9, step: 0.01, format: (n) => `${fixed(n, 2)} m` },
    { row: [
      { button: 'Open string', ghost: true, onClick: fret(0.9) },
      { button: 'Fourth', ghost: true, onClick: fret(0.67) },
      { button: 'Fifth', ghost: true, onClick: fret(0.6) },
      { button: 'Octave', ghost: true, onClick: fret(0.45) },
    ] },
    { key: 't', label: 'Slowed-down time', min: 0, max: CYCLE, step: 0.02, format: (n) => `${fixed(n, 2)} s` },
    transport(line.clock),
    { key: 'sound', label: 'Hear the string', toggle: true },
    { readout: [
      ['Wave speed, v = √(T/μ)', (s) => `${fixed(stringSpeed(s.T, MU), 0)} m/s`],
      ['Pitch, ν', (s) => `${fixed(freq(s), 0)} Hz`],
      ['Nearest note', (s) => `${note(s).name} (${cents(s)} cents)`],
      ['Above the open string', (s) => `${fixed(semitones(freq(s), openFreq(s)), 1)} semitones`],
    ] },
  ],
  tex: (s) => `\\nu=\\dfrac{1}{2L}\\sqrt{\\dfrac{T}{\\mu}}=\\dfrac{1}{2(${fixed(s.L, 2)})}\\sqrt{\\dfrac{${s.T}}{0.0005}}=${fixed(freq(s), 0)}\\ \\text{Hz}`,
  onChange: (s) => {
    line.sync();
    tone.set(s.sound ? freq(s) : 0);
  },
});

line.sync();
