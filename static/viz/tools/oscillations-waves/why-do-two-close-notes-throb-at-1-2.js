import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { createTone } from '../../lib/tone.js';
import { transport } from '../../lib/sim.js';
import { handles } from '../../lib/stage.js';
import { fixed } from '../../lib/format.js';
import { beatStrip } from './_beats-view.js';
import { beatRate, envelope, lag, stepWord, swing, wave } from './_beats-math.js';

const CYCLE = 2; // s: with ν in steps of 0.5 Hz, both notes are back in step after exactly 2 s, so the loop has no jump
const ZOOM = 7; // ms shown in the two close-up graphs
const SLOW = 0.125;
const state = { nu1: 440, nu2: 444, t: 0.125, speed: SLOW, sound: false };
const toneOne = createTone();
const toneTwo = createTone();
const line = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
let hearing = false;

const gained = (s) => beatRate(s.nu1, s.nu2) * s.t;
const shift = (s) => lag(s.nu1, s.nu2, s.t);
const now = (s) => {
  const word = stepWord(gained(s));
  if (s.nu1 === s.nu2) return { text: 'always in step: steady', good: true };
  if (word === 'in step') return { text: 'in step: loud', good: true };
  if (word === 'opposite') return { text: 'opposite: quiet', good: false };
  return 'sliding apart';
};

function setSound(s) {
  toneOne.set(s.sound ? s.nu1 : 0);
  toneTwo.set(s.sound ? s.nu2 : 0);
  if (s.sound && !hearing) { // both tones start in step at t = 0, so the picture restarts with them, in real time
    s.t = 0;
    s.speed = 1;
    line.clock.state.t = 0;
    line.clock.play();
  }
  hearing = s.sound;
}

const tool = createTool({
  state,
  label: 'Three graphs. Top: a close-up of a few milliseconds of both waves, the first held still, the second shifted by the cycles it has gained. Middle: their sum in the same close-up. Bottom: the size of the sum over two seconds, a row of lobes, one for each beat, with a coral dot you can drag through time.',
  setup: (stage, c) => {
    const row = (top, height, x, y) => createPlot(stage, { x, y, c, pad: 22, box: (g) => ({ x: 0, y: g.h * top, w: g.w, h: g.h * height }) });
    return {
      waves: row(0, 0.3, [0, ZOOM], [-1.3, 1.3]),
      total: row(0.3, 0.3, [0, ZOOM], [-2.3, 2.3]),
      strip: row(0.6, 0.4, [0, CYCLE], [-2.3, 2.3]),
    };
  },
  draw(ctx, stage, c, { waves, total, strip }) {
    const { nu1, nu2, t } = state;
    const ms = (f) => (x) => f(x / 1000);
    const two = ms((s) => wave(nu2, s, shift(state)));
    waves.axes({ xLabel: 'ms', yLabel: 'the two notes, close up' });
    waves.fn(ms((s) => wave(nu1, s)), { color: c.a });
    waves.fn(two, { color: c.b });
    total.axes({ xLabel: 'ms', yLabel: 'their sum' });
    total.fn((x) => wave(nu1, x / 1000) + two(x), { color: c.c, width: 4 });
    beatStrip(ctx, strip, c, beatRate(nu1, nu2), CYCLE);
    strip.axes({ xLabel: 't (s)', yLabel: 'size of the sum: 1 lobe = 1 beat' });
    strip.fn((x) => envelope(nu1, nu2, x), { color: c.d, width: 2, dash: [5, 4] });
    strip.segment(t, -2.3, t, 2.3, { color: c.a, width: 3 });
    strip.point(t, 0, { fill: c.a, r: 8 });
  },
  controls: () => [
    { title: 'Two notes' },
    { key: 'nu1', label: 'First note, ν₁', min: 430, max: 450, step: 0.5, format: (n) => `${fixed(n, 1)} Hz` },
    { key: 'nu2', label: 'Second note, ν₂', min: 420, max: 460, step: 0.5, format: (n) => `${fixed(n, 1)} Hz` },
    { key: 'sound', label: 'Hear both notes', toggle: true },
    { title: 'Move through time' },
    { key: 't', label: 'Time, t', min: 0, max: CYCLE, step: 0.005, format: (n) => `${fixed(n, 3)} s` },
    { key: 'speed', label: 'Play speed', options: [[SLOW, '⅛ speed'], [1, 'Real speed']] },
    transport(line.clock),
    { text: 'The picture matches the sound only at real speed.' },
    { readout: [
      ['Beats per second, |ν₁ − ν₂|', (s) => fixed(beatRate(s.nu1, s.nu2), 1)],
      ['Cycles gained so far', (s) => fixed(gained(s), 2)],
      ['The two notes are', now],
      ['Biggest size of the sum', (s) => `${fixed(swing(s.nu1, s.nu2, s.t), 2)} a`],
    ] },
  ],
  tex: (s) => {
    const half = fixed(Math.abs(s.nu1 - s.nu2) / 2, 2);
    const mean = fixed((s.nu1 + s.nu2) / 2, 2);
    return `y=2a\\cos(2\\pi\\cdot ${half}\\,t)\\,\\sin(2\\pi\\cdot ${mean}\\,t),\\quad \\nu_{\\text{beat}}=|${fixed(s.nu1, 1)}-${fixed(s.nu2, 1)}|=${fixed(beatRate(s.nu1, s.nu2), 1)}\\ \\text{Hz}`;
  },
  onChange: (s) => {
    setSound(s);
    line.clock.speed = s.speed;
    line.sync();
  },
});

line.clock.speed = state.speed;
line.sync();

const { strip } = tool.extra;
handles(tool.stage, [{
  at: () => strip.toPx(state.t, 0),
  move(px) {
    state.t = Math.max(0, Math.min(CYCLE - 1e-9, strip.toWorld(px, 0)[0]));
  },
  nudge(direction) {
    state.t = Math.max(0, Math.min(CYCLE - 1e-9, state.t + direction * 0.005));
  },
}], {
  onChange() {
    line.sync();
    tool.update();
  },
});
