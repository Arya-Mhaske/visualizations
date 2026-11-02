import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTone } from '../../lib/tone.js';
import { fixed } from '../../lib/format.js';
import { TAU, beatEnvelope, beatRate, sumWave } from './_waves-math.js';

const F0 = 440; // the sounded note
const P0 = 24; // the drawn carrier (slowed down so the eye can follow it)
const state = { d: 2, sound: false };
const toneA = createTone();
const toneB = createTone();

const tool = createTool({
  state,
  label: 'The sum of two sine waves of slightly different frequency over one second. The waves fall in and out of step, so the sum swells and fades inside a dashed envelope, 2 cos of pi times the frequency difference times t.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [-2.4, 2.4], c, pad: 24 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 'sum' });
    const env = beatEnvelope(P0, P0 + state.d);
    plot.fn(env, { color: c.d, width: 2, dash: [6, 5] });
    plot.fn((t) => -env(t), { color: c.d, width: 2, dash: [6, 5] });
    plot.fn(sumWave(1, P0, 1, P0 + state.d), { color: c.a, width: 3 });
  },
  controls: [
    { title: 'Two close notes' },
    { key: 'd', label: 'Difference, f₂ − f₁', min: 0, max: 8, step: 0.5, format: (n) => `${fixed(n, 1)} Hz` },
    { toggle: true, key: 'sound', label: 'Sound the two real notes (440 Hz and 440 Hz + difference)' },
    { readout: [
      ['Loud swells per second', (s) => fixed(beatRate(F0, F0 + s.d), 1)],
      ['Time between swells', (s) => (s.d ? `${fixed(1 / s.d, 2)} s` : 'never')],
    ] },
  ],
  tex: (s) => `\\sin 2\\pi f_1t+\\sin 2\\pi f_2t=2\\cos\\!\\big(\\pi(${fixed(s.d, 1)})t\\big)\\sin\\!\\big(\\pi(f_1+f_2)t\\big)`,
  onChange: (s) => {
    if (!toneA.supported) return;
    toneA.set(s.sound ? F0 : 0);
    toneB.set(s.sound ? F0 + s.d : 0);
  },
});
if (!toneA.supported) document.querySelectorAll('#panel .nb-switch').forEach((el) => { el.hidden = true; });
