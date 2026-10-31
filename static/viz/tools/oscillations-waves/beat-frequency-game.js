import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTone } from '../../lib/tone.js';
import { fixed } from '../../lib/format.js';
import { beatStrip } from './_beats-view.js';
import { FORK, IN_TUNE, STRING_LENGTH, beatRate, candidates, gameString, moveWord, stringFreq } from './_beats-math.js';

const SPAN = 4; // s of the beat picture
const T_MIN = 68;
const T_MAX = 76;
const BEATS_MAX = 24;
const state = { T: 72, round: 1, sound: false, reveal: false, tuned: 0, word: 'start', solved: false };
const forkTone = createTone();
const stringTone = createTone();
let string = gameString(state.round);
let trail = [];

const nu = (s) => stringFreq(s.T, string.mu);
const beats = (s) => beatRate(nu(s), FORK);
const clampT = (T) => Math.max(T_MIN, Math.min(T_MAX, Math.round(T * 50) / 50));

const WORDS = {
  start: 'Turn the peg',
  same: 'No change',
  closer: { text: 'Slower beats: right way', good: true },
  further: { text: 'Faster beats: wrong way', good: false },
  tuned: { text: 'Beats gone: in tune', good: true },
};

function record(s, before) {
  s.word = moveWord(before, beats(s));
  trail.push([s.T, beats(s)]);
  if (trail.length > 400) trail = trail.slice(-400);
  if (s.word === 'tuned' && !s.solved) {
    s.solved = true;
    s.tuned += 1;
  }
}

function setSound(s) {
  forkTone.set(s.sound ? FORK : 0);
  stringTone.set(s.sound ? nu(s) : 0);
}

const step = (dT) => () => {
  const before = beats(state);
  state.T = clampT(state.T + dT);
  record(state, before);
  tool.ui.changed();
};

function newString() {
  state.round += 1;
  string = gameString(state.round);
  state.T = 72;
  state.solved = false;
  state.word = 'start';
  trail = [[state.T, beats(state)]];
  tool.ui.changed();
}

let last = 0;
const tool = createTool({
  state,
  label: 'Two graphs. Top: the size of the fork and string sounding together over four seconds, one lobe for each beat. Bottom: every setting tried so far, as beats per second against the string tension.',
  setup: (stage, c) => ({
    strip: createPlot(stage, { x: [0, SPAN], y: [-2.3, 2.3], c, pad: 24, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.45 }) }),
    trailPlot: createPlot(stage, { x: [T_MIN, T_MAX], y: [0, BEATS_MAX], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.45, w: g.w, h: g.h * 0.55 }) }),
  }),
  draw(ctx, stage, c, { strip, trailPlot }) {
    beatStrip(ctx, strip, c, beats(state), SPAN, { fill: beats(state) < IN_TUNE ? c.fillC : c.fillY });
    strip.axes({ xLabel: 't (s)', yLabel: 'fork + string: 1 lobe = 1 beat' });
    trailPlot.axes({ xLabel: 'T (N)', yLabel: 'beats per second' });
    for (const [T, b] of trail) if (b <= BEATS_MAX) trailPlot.point(T, b, { fill: c.b, r: 3 });
    if (beats(state) <= BEATS_MAX) trailPlot.point(state.T, beats(state), { fill: c.a, r: 8 });
  },
  controls: () => [
    { title: 'Turn the peg' },
    { key: 'T', label: 'String tension, T', min: T_MIN, max: T_MAX, step: 0.02, format: (n) => `${fixed(n, 2)} N` },
    { row: [
      { button: 'Slacken a little', ghost: true, onClick: step(-0.1) },
      { button: 'Tighten a little', ghost: true, onClick: step(0.1) },
    ] },
    { key: 'sound', label: 'Hear fork and string', toggle: true },
    { key: 'reveal', label: "Show the string's real pitch", toggle: true },
    { button: 'New string', onClick: newString },
    { readout: [
      ['Fork', () => `${FORK} Hz`],
      ['Beats per second', (s) => fixed(beats(s), 1)],
      ['Last move', (s) => WORDS[s.word]],
      ['So the string is at', (s) => {
        if (s.reveal || s.solved) return `${fixed(nu(s), 1)} Hz`;
        const [low, high] = candidates(FORK, beats(s));
        return `${fixed(low, 1)} or ${fixed(high, 1)} Hz`;
      }],
      ['Strings tuned', (s) => String(s.tuned)],
    ] },
  ],
  tex: (s) => {
    const shown = s.reveal || s.solved ? fixed(nu(s), 1) : '\\nu';
    return `\\nu_{\\text{beat}}=|${FORK}-${shown}|=${fixed(beats(s), 1)}\\ \\text{Hz},\\quad \\nu=\\dfrac{1}{2(${STRING_LENGTH})}\\sqrt{\\dfrac{T}{\\mu}}`;
  },
  onChange: (s) => {
    if (s.T !== trail[trail.length - 1][0]) record(s, last);
    last = beats(s);
    setSound(s);
  },
});

trail = [[state.T, beats(state)]];
last = beats(state);
tool.update();
