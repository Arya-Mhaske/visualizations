import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTone } from '../../lib/tone.js';
import { fixed, sig } from '../../lib/format.js';
import { TAU, NOTES, periodMs } from './_waves-math.js';

const state = { i: 3, sound: false };
const tone = createTone();
const freq = (s) => NOTES[s.i][1];

createTool({
  state,
  label: 'A sine wave y = sin(B t) over 20 milliseconds. A bracket marks one period. Higher notes squeeze more cycles into the same 20 milliseconds, so the period gets shorter.',
  setup: (stage, c) => createPlot(stage, { x: [0, 20], y: [-1.4, 1.4], c, pad: 26 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (ms)', yLabel: 'y' });
    const B = TAU * freq(state) / 1000; // per ms
    plot.fn((t) => Math.sin(B * t), { color: c.a, width: 4 });
    const T = periodMs(freq(state));
    plot.segment(0, -1.2, T, -1.2, { color: c.b, width: 5 });
    plot.segment(T, -1.3, T, -1.1, { color: c.b, width: 3 });
    plot.text(`T = ${sig(T, 3)} ms`, Math.min(T / 2 + 2, 16), -1.05, { size: 11, color: c.b, patch: false });
  },
  controls: [
    { title: 'Pick a note' },
    { key: 'i', label: 'Note', min: 0, max: NOTES.length - 1, step: 1, format: (n) => `${NOTES[n][0]} · ${fixed(NOTES[n][1], 1)} Hz` },
    { toggle: true, key: 'sound', label: 'Play the note' },
    { readout: [
      ['B = 2πf', (s) => `${sig(TAU * freq(s), 4)} per s`],
      ['Period, T', (s) => `${sig(periodMs(freq(s)), 3)} ms`],
      ['1 ÷ T', (s) => `${sig(1000 / periodMs(freq(s)), 4)} Hz`],
    ] },
  ],
  tex: (s) => `f=\\dfrac1T=\\dfrac{1}{${sig(periodMs(freq(s)) / 1000, 3)}\\ \\text{s}}=${sig(freq(s), 4)}\\ \\text{Hz}`,
  onChange: (s) => { if (tone.supported) tone.set(s.sound ? freq(s) : 0); },
});
if (!tone.supported) document.querySelectorAll('#panel .nb-switch').forEach((el) => { el.hidden = true; });
