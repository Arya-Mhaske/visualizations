import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { fixed, sig } from '../../lib/format.js';
import { MAINS, TAU, peakOf, shareAbove } from './_ac-basics-math.js';

const SPAN = 40; // ms
const SLOW = 5; // ms of supply shown each second, so one 50 Hz cycle takes 4 s
const state = { V: 230, f: 50, limit: 250, t: 5 };
const time = createTimeline(document.querySelector('#stage'), state, { cycle: () => SPAN, update: () => tool.update() });
time.clock.speed = SLOW;

const peak = (s = state) => peakOf(s.V);
const v = (ms, s = state) => peak(s) * Math.sin((TAU * s.f * ms) / 1000);
const safe = (s) => s.limit >= peak(s);

const tool = createTool({
  state,
  label: 'The mains voltage against time, with a green level at the meter reading and a coral level at the limit of a part. The wave rises well past the meter reading. Where it passes the limit, it is shaded.',
  setup: (stage, c) => createPlot(stage, { x: [0, SPAN], y: [-450, 450], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    const lim = state.limit;
    const wave = (t) => v(t);
    plot.shade((t) => Math.max(wave(t), lim), () => lim, 0, SPAN, c.fillA);
    plot.shade((t) => Math.min(wave(t), -lim), () => -lim, 0, SPAN, c.fillA);
    plot.axes({ xLabel: 't (ms)', yLabel: 'v (V)' });
    for (const sign of [1, -1]) {
      plot.segment(0, sign * state.V, SPAN, sign * state.V, { color: c.c, width: 3 });
      plot.segment(0, sign * lim, SPAN, sign * lim, { color: c.a, width: 3, dash: [8, 5] });
    }
    plot.fn(wave, { color: c.b });
    plot.segment(state.t, -450, state.t, 450, { color: c.ink, width: 1, dash: [3, 4] });
    plot.point(state.t, wave(state.t), { fill: c.b, r: 6 });
    plot.text(`peak ${sig(peak(), 3)} V`, SPAN, peak() + 24, { size: 12, color: c.b, align: 'right' });
    plot.text(`meter ${state.V} V`, 0.6, -state.V + 24, { size: 12, color: c.c, align: 'left' });
    plot.text(`limit ${lim} V`, 15, lim + 22, { size: 12, color: c.a }); // at 15 ms the wave is far below, at 50 and 60 Hz
  },
  controls: () => [
    { title: 'Read the mains' },
    { key: 'limit', label: "Part's voltage limit", min: 100, max: 450, step: 10, format: (n) => `${n} V` },
    { key: 'V', label: 'Meter reading (rms)', min: 100, max: 250, step: 1, format: (n) => `${n} V` },
    { key: 't', label: 'Time, t', min: 0, max: SPAN, step: 0.5, format: (n) => `${fixed(n, 1)} ms` },
    transport(time.clock),
    { key: 'f', label: 'Frequency', options: [[50, '50 Hz'], [60, '60 Hz']] },
    { row: MAINS.map((place) => ({
      button: `${place.name} ${place.V} V`,
      ghost: true,
      onClick() {
        state.V = place.V;
        state.f = place.f;
        tool.ui.changed();
      },
    })) },
    { text: 'Play is slowed 200 times.' },
    { readout: [
      ['Meter reads', (s) => `${s.V} V`],
      ['Peak', (s) => `${sig(peak(s), 4)} V`],
      ['Peak to peak', (s) => `${sig(2 * peak(s), 4)} V`],
      ['v now', (s) => `${fixed(v(s.t, s), 0)} V`],
      ['Time above meter', (s) => `${fixed(shareAbove(peak(s), s.V) * 100, 0)}%`],
      ['Time past limit', (s) => `${fixed(shareAbove(peak(s), s.limit) * 100, 0)}%`],
      ['This part', (s) => (safe(s) ? { text: 'Safe', good: true } : { text: 'Too low', good: false })],
    ] },
  ],
  tex: (s) => `v_m=\\sqrt2\\,V=1.414\\times ${s.V}=${sig(peak(s), 4)}\\ \\text{V}`,
  onChange: () => time.sync(),
});

time.sync();
tool.update();
