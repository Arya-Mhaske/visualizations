import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTone } from '../../lib/tone.js';
import { line as stroke, dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { beatStrip } from './_beats-view.js';
import {
  FORK, GUITAR, IN_TUNE, PEG_TRUE, centsFrom, closure, detune, openFreqs, pairBeats, pairNote, reference, trueOpen,
} from './_beats-math.js';

const SPAN = 4;
const NECK = 0.45; // share of the stage for the guitar neck
const SHOWN_FRETS = 6;
const state = { string: 0, peg: PEG_TRUE, sound: false, reveal: false, round: 1 };
const pegs = GUITAR.map(() => PEG_TRUE);
let offsets = detune(state.round);
let current = state.string;
const toneA = createTone();
const toneB = createTone();

const opens = () => openFreqs(pegs, offsets);
const beats = (s) => pairBeats(s.string, opens());
const done = (i) => pairBeats(i, opens()) < IN_TUNE;
const allDone = () => GUITAR.every((_, i) => done(i));
const refName = (i) => (i === 0 ? `the fork, A₄ ${FORK} Hz` : `open ${GUITAR[i - 1].name}`);
const signed = (x, digits) => {
  const size = fixed(Math.abs(x), digits);
  return size === '0' ? size : `${x > 0 ? '+' : '−'}${size}`;
};
const centsOff = (i) => centsFrom(opens()[i], trueOpen(i));

function setSound(s) {
  toneA.set(s.sound ? reference(s.string, opens()) : 0);
  toneB.set(s.sound ? pairNote(s.string, opens()) : 0);
}

function newGuitar() {
  state.round += 1;
  offsets = detune(state.round);
  pegs.fill(PEG_TRUE);
  state.string = 0;
  state.peg = PEG_TRUE;
  tool.ui.changed();
}

// Fret positions on a real neck, scaled so the sixth fret reaches the right of the drawing.
const fretX = (f, left, width) => left + (width * (1 - 2 ** (-f / 12))) / (1 - 2 ** (-SHOWN_FRETS / 12));

function drawNeck(ctx, stage, c) {
  const left = 44;
  const right = stage.w - (state.reveal ? 62 : 30);
  const width = right - left;
  const top = 34;
  const gap = (stage.h * NECK - top - 14) / 5;
  const y = (i) => top + gap * i;
  const active = state.string;
  label(ctx, `Match fret ${GUITAR[active].fret} of ${GUITAR[active].name} to ${refName(active)}`, 6, 13, c, { size: 11, align: 'left', bounds: stage });
  for (let f = 0; f <= SHOWN_FRETS; f++) {
    stroke(ctx, fretX(f, left, width), y(0) - 6, fretX(f, left, width), y(5) + 6, { color: f ? c.grid : c.ink, width: f ? 2 : 6 });
  }
  GUITAR.forEach((string, i) => {
    const isRef = i === active - 1;
    const isActive = i === active;
    stroke(ctx, left, y(i), right, y(i), { color: isActive ? c.a : isRef ? c.b : c.ink, width: isActive || isRef ? 4 : 2 });
    label(ctx, string.name, 6, y(i), c, { size: 12, align: 'left' });
    if (done(i)) dot(ctx, 34, y(i), 4, c.c, c.ink, 1);
    if (state.reveal) label(ctx, `${signed(centsOff(i), 0)}¢`, stage.w - 4, y(i), c, { size: 11, align: 'right' });
  });
  const f = GUITAR[active].fret;
  dot(ctx, (fretX(f - 1, left, width) + fretX(f, left, width)) / 2, y(active), 8, c.a, c.ink);
}

const tool = createTool({
  state,
  label: 'Top: a guitar neck with six strings, the string you are tuning in coral with a dot on the fret you press, and the string it must match in blue. A small green dot marks each string already matched. Bottom: the size of the two notes together over four seconds, one lobe for each beat.',
  setup: (stage, c) => ({
    strip: createPlot(stage, { x: [0, SPAN], y: [-2.3, 2.3], c, pad: 24, box: (g) => ({ x: 0, y: g.h * NECK, w: g.w, h: g.h * (1 - NECK) }) }),
  }),
  draw(ctx, stage, c, { strip }) {
    drawNeck(ctx, stage, c);
    beatStrip(ctx, strip, c, beats(state), SPAN, { fill: done(state.string) ? c.fillC : c.fillY });
    strip.axes({ xLabel: 't (s)', yLabel: 'the pair together: 1 lobe = 1 beat' });
  },
  controls: () => [
    { title: 'Tune one string at a time' },
    { key: 'string', label: 'String', options: GUITAR.map((string, i) => [i, string.name]) },
    { key: 'peg', label: 'Peg position', min: 0, max: 2 * PEG_TRUE, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'sound', label: 'Hear the pair', toggle: true },
    { key: 'reveal', label: 'Show cents off true pitch', toggle: true },
    { button: 'Detune the guitar', ghost: true, onClick: newGuitar },
    { readout: [
      ['Beats per second', (s) => fixed(beats(s), 2)],
      ['This pair', (s) => (done(s.string) ? { text: 'matched', good: true } : { text: 'still beating', good: false })],
      ['Strings matched', () => `${GUITAR.filter((_, i) => done(i)).length} of 6`],
      ['Final check, 4 × E₂ − E₄', () => `${signed(closure(opens()), 2)} Hz`],
    ] },
  ],
  tex: (s) => {
    const i = s.string;
    return `\\nu_{\\text{beat}}=\\left|2^{${GUITAR[i].fret}/12}\\,\\nu_{\\text{open}}-\\nu_{\\text{ref}}\\right|=${fixed(beats(s), 2)}\\ \\text{Hz}`;
  },
  onChange: (s) => {
    if (s.string === current) pegs[s.string] = s.peg;
    else s.peg = pegs[s.string]; // a newly chosen string keeps the peg where it was left
    current = s.string;
    setSound(s);
  },
});
