import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { createTone } from '../../lib/tone.js';
import { transport } from '../../lib/sim.js';
import { fixed } from '../../lib/format.js';
import { TAU, Q, drivenParts, modeFreq, swingGain } from './_standing-waves-math.js';

const V = 200; // m/s on this string
const CYCLE = 2; // seconds of slowed-down picture for one real vibration
const NU = Array.from({ length: 191 }, (_, i) => 50 + i * 5);
const state = { t: 0.3, nu: 200, L: 0.5, N: 10, sound: false };
const tone = createTone();
const line = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const params = (s) => ({ k: (TAU * s.nu) / V, L: s.L, N: s.N, q: Q });
const phase = (s) => (TAU * s.t) / CYCLE;
const gain = (s) => swingGain(s.nu, { v: V, L: s.L, N: s.N });
const halves = (s) => (2 * s.L * s.nu) / V;
const nearest = (s) => Math.max(1, Math.round(halves(s)));
const fits = (s) => Math.abs(halves(s) - Math.round(halves(s))) < 0.03 && halves(s) > 0.5;
let cache = { key: '', curve: [] };
const curve = (s) => {
  const key = `${s.L}|${s.N}`;
  if (cache.key !== key) cache = { key, curve: NU.map((nu) => swingGain(nu, { v: V, L: s.L, N: s.N })) };
  return cache.curve;
};
const hop = (n) => () => {
  state.nu = Math.min(1000, Math.round(modeFreq('string', n, V, state.L)));
  tone.set(state.sound ? state.nu : 0);
  tool.update();
};

const tool = createTool({
  state,
  label: 'Two graphs. Top: a string with a small driver at its left end and a fixed right end, shown as two waves, one running right (blue) and one running left (purple), and their sum, the real string (green). Bottom: the biggest swing of the string against the driver frequency, with a marker at your frequency.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 0.6], y: [-12, 12], c, pad: 22, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.6 }) }),
    low: createPlot(stage, { x: [50, 1000], y: [0, 12], c, pad: 22, box: (g) => ({ x: 0, y: g.h * 0.6, w: g.w, h: g.h * 0.4 }) }),
  }),
  draw(ctx, stage, c, { top, low }) {
    const p = params(state);
    const ph = phase(state);
    const at = (x) => drivenParts(x, ph, p);
    top.axes({ xLabel: 'x (m)', yLabel: 'height (mm)' });
    top.fn((x) => at(x).right, { color: c.b, width: 2, dash: [5, 5], domain: [0, state.L] });
    top.fn((x) => at(x).left, { color: c.d, width: 2, dash: [5, 5], domain: [0, state.L] });
    top.fn((x) => at(x).sum, { color: c.c, width: 4, domain: [0, state.L] });
    top.segment(state.L, -12, state.L, 12, { color: c.ink, width: 4 });
    top.point(0, at(0).sum, { fill: c.a, r: 6 });
    low.axes({ xLabel: 'ν (Hz)', yLabel: 'biggest swing (mm)' });
    for (let n = 1; n * modeFreq('string', 1, V, state.L) <= 1000; n++) {
      const f = n * modeFreq('string', 1, V, state.L);
      low.segment(f, 0, f, 12, { color: c.grid, width: 2, dash: [3, 4] });
    }
    const values = curve(state);
    low.fn((x) => values[Math.max(0, Math.min(values.length - 1, Math.round((x - 50) / 5)))], { color: c.c, width: 3 });
    low.point(state.nu, Math.min(11.8, gain(state)), { fill: c.a, r: 6 });
  },
  controls: [
    { title: 'Shake the string' },
    { key: 'nu', label: 'Driver frequency, ν', min: 50, max: 1000, step: 5, format: (n) => `${n} Hz` },
    { row: [1, 2, 3, 4].map((n) => ({ button: `Mode ${n}`, ghost: true, onClick: hop(n) })) },
    { key: 'N', label: 'Round trips of the wave so far', min: 0, max: 10, step: 1, format: (n) => String(n) },
    { key: 'L', label: 'Length of string, L', min: 0.3, max: 0.6, step: 0.05, format: (n) => `${fixed(n, 2)} m` },
    { key: 't', label: 'Slowed-down time', min: 0, max: CYCLE, step: 0.02, format: (n) => `${fixed(n, 2)} s` },
    transport(line.clock),
    { key: 'sound', label: 'Hear the driver', toggle: true },
    { readout: [
      ['Half-wavelengths in L', (s) => ({ text: fixed(halves(s), 2), good: fits(s) })],
      ['Biggest swing ÷ driver swing', (s) => `${fixed(gain(s), 1)}×`],
      ['Lowest note that fits, v/2L', (s) => `${fixed(modeFreq('string', 1, V, s.L), 0)} Hz`],
    ] },
  ],
  tex: (s) => `\\dfrac{2L}{\\lambda}=\\dfrac{2\\nu L}{v}=\\dfrac{2(${s.nu})(${fixed(s.L, 2)})}{${V}}=${fixed(halves(s), 2)}\\ \\Rightarrow\\ ${fits(s) ? `\\text{fits: } \\nu_{${nearest(s)}}` : '\\text{does not fit}'}`,
  onChange: (s) => {
    line.sync();
    tone.set(s.sound ? s.nu : 0);
  },
});

line.sync();
