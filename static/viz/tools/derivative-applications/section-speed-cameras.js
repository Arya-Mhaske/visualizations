import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, num } from './_da.js';

// Two cameras D km apart stamp a car at times 0 and T. The average speed is D/T. By the MVT the speedometer read exactly that at some instant.
// The car's path is s(t) = D(t/T + w sin(2πt/T)/(2π)), so v(t) = (D/T)(1 + w cos(2πt/T)): it wobbles about the average.
const state = { D: 2, T: 80, w: 0.5, limit: 90 };
const avg = () => (state.D / state.T) * 3600; // km/h
const s = (t) => state.D * (t / state.T + (state.w * Math.sin((2 * Math.PI * t) / state.T)) / (2 * Math.PI));
const v = (t) => avg() * (1 + state.w * Math.cos((2 * Math.PI * t) / state.T));
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: distance travelled between two cameras against time, with the chord joining the two camera readings. Bottom: the speedometer reading, wobbling above and below the average, and crossing it at two moments.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [0, 120], y: [0, 4], c, box: bA }), b: createPlot(stage, { x: [0, 120], y: [0, 200], c, box: bB }) }),
  draw(ctx, stage, c, { a, b }) {
    a.setRange([0, state.T], [0, state.D * 1.1]);
    b.setRange([0, state.T], [0, Math.max(150, avg() * (1 + state.w) * 1.1)]);
    a.axes({ xLabel: 't (s)', yLabel: 'km' });
    a.fn(s, { color: c.ink, width: 3 });
    a.segment(0, 0, state.T, state.D, { color: c.a, width: 3 });
    b.axes({ xLabel: 't (s)', yLabel: 'km/h' });
    b.fn(v, { color: c.b, width: 3 });
    b.segment(0, avg(), state.T, avg(), { color: c.a, width: 3 });
    b.segment(0, state.limit, state.T, state.limit, { color: c.d, width: 2, dash: [6, 4] });
    for (const t of [state.T / 4, (3 * state.T) / 4]) { b.point(t, v(t), { fill: c.c, r: 7 }); a.point(t, s(t), { fill: c.c, r: 7 }); }
    b.point(state.T / 2, v(state.T / 2), { fill: c.b });
  },
  controls: [
    { title: 'Set up the cameras' },
    { key: 'D', label: 'Distance between cameras', min: 1, max: 4, step: 0.5, format: (x) => `${x} km` },
    { key: 'T', label: 'Time between stamps', min: 40, max: 120, step: 5, format: (x) => `${x} s` },
    { key: 'w', label: 'How much the driver varies speed', min: 0, max: 0.9, step: 0.1, format: (x) => x.toFixed(1) },
    { key: 'limit', label: 'Speed limit', min: 60, max: 120, step: 5, format: (x) => `${x} km/h` },
    { readout: [
      ['Average speed D/T', () => `${num(avg(), 4)} km/h`],
      ['Fastest speedometer reading', () => `${num(avg() * (1 + state.w), 4)} km/h`],
      ['Speed at the green points', () => `${num(v(state.T / 4), 4)} km/h`],
      ['Verdict', () => (avg() > state.limit ? { text: 'speeding for at least one instant: proven', good: false } : { text: 'average within the limit: no proof either way', good: true })],
    ] },
  ],
  tex: (s) => `\\bar v=\\frac{${s.D}\\ \\text{km}}{${s.T}\\ \\text{s}}=${num(avg(), 4)}\\ \\text{km/h}`,
});
