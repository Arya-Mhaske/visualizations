import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// x'' + 4x = cos(wt), x(0) = x'(0) = 0, natural angular frequency 2.
const W0 = 2;
const state = { w: 2 };
const near = (s) => Math.abs(s.w - W0) < 0.001;
const x = (s, t) => (near(s) ? (t * Math.sin(W0 * t)) / (2 * W0) : (Math.cos(s.w * t) - Math.cos(W0 * t)) / (W0 * W0 - s.w * s.w));

createTool({
  state,
  label: 'The response of an undamped oscillator that is pushed by a force cos of omega t, drawn over forty seconds. When the driving frequency is far from the natural frequency of 2 the motion stays small. Exactly at 2 the swings keep growing in a straight-line envelope, as t over 4. Near 2 the motion beats.',
  setup: (stage, c) => createPlot(stage, { x: [0, 40], y: [-10, 10], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 'x' });
    if (near(state)) {
      plot.fn((t) => t / (2 * W0), { color: c.b, width: 2, dash: [6, 5] });
      plot.fn((t) => -t / (2 * W0), { color: c.b, width: 2, dash: [6, 5] });
    }
    plot.fn((t) => x(state, t), { color: c.a, width: 3 });
  },
  controls: (tool) => [
    { title: 'Drive the oscillator' },
    { key: 'w', label: 'Driving frequency ω', min: 0.5, max: 3.5, step: 0.05, format: (v) => fixed(v, 2) },
    { button: 'Drive at the natural frequency', onClick: () => { state.w = W0; tool.update(); } },
    { readout: [
      ['Natural frequency', () => '2'],
      ['Largest swing in 40 s', (s) => { let m = 0; for (let t = 0; t <= 40; t += 0.05) m = Math.max(m, Math.abs(x(s, t))); return { text: fixed(m, 2), good: m < 3 }; }],
      ['Case', (s) => (near(s) ? 'resonance: amplitude t/4' : 'bounded motion')],
    ] },
  ],
  tex: (s) => (near(s) ? String.raw`x(t)=\dfrac{t}{2\omega_0}\sin\omega_0 t` : String.raw`x(t)=\dfrac{\cos ${fixed(s.w, 2)}t-\cos 2t}{4-${fixed(s.w * s.w, 2)}}`),
});
