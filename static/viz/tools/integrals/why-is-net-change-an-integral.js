import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, simpson, num } from '../integral-applications/_ia.js';

// Water tank. Rate r(t) in litres per minute is inflow minus outflow. Water gained = ∫ r dt = area under r (below the axis counts negative).
const RATES = {
  pump: { name: 'Pump surges, then tapers', r: (t) => 40 * Math.sin((Math.PI * t) / 10) , T: 10 },
  leak: { name: 'Filling with a leak (net can go negative)', r: (t) => 30 - 6 * t, T: 10 },
  mix: { name: 'In, out, in again', r: (t) => 25 * Math.cos((2 * Math.PI * t) / 10) + 5, T: 10 },
};
const state = { kind: 'pump', t: 6, start: 100 };
const K = () => RATES[state.kind];
const gained = (t) => simpson(K().r, 0, t, Math.max(2, Math.ceil(t * 20)));
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: the net rate at which water enters a tank against time, with the area from zero to now shaded green above the axis and coral below it. Bottom: the amount of water in the tank, which climbs when the area is positive.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [0, 10], y: [-40, 40], c, box: bA }), b: createPlot(stage, { x: [0, 10], y: [0, 400], c, box: bB }) }),
  draw(ctx, stage, c, { a, b }) {
    const k = K();
    const m = Math.max(...Array.from({ length: 50 }, (_, i) => Math.abs(k.r((k.T * i) / 49)))) * 1.2;
    a.setRange([0, k.T], [-m, m]);
    const ys = Array.from({ length: 101 }, (_, i) => state.start + gained((k.T * i) / 100));
    b.setRange([0, k.T], [Math.min(0, ...ys) - 20, Math.max(...ys) * 1.15 + 20]);
    a.axes({ xLabel: 't (min)', yLabel: 'rate (L/min)' });
    a.shade((t) => Math.max(0, k.r(t)), null, 0, state.t, c.fillC);
    a.shade((t) => Math.min(0, k.r(t)), null, 0, state.t, c.fillA);
    a.fn(k.r, { color: c.ink, width: 3 });
    b.axes({ xLabel: 't (min)', yLabel: 'water (L)' });
    b.fn((t) => state.start + gained(t), { color: c.b, width: 3 });
    b.point(state.t, state.start + gained(state.t), { fill: c.a });
  },
  controls: [
    { title: 'Run the tank' },
    { key: 'kind', label: 'Net rate', options: Object.entries(RATES).map(([k, v]) => [k, v.name]) },
    { key: 'start', label: 'Water at the start', min: 0, max: 300, step: 10, format: (v) => `${v} L` },
    { key: 't', label: 'Time now', min: 0.2, max: 10, step: 0.1, format: (v) => `${v.toFixed(1)} min` },
    { readout: [
      ['Area under the rate (signed)', () => `${num(gained(state.t), 4)} L`],
      ['Water now = start + area', () => `${num(state.start + gained(state.t), 4)} L`],
    ] },
  ],
  tex: (s) => `V(t)=V(0)+\\int_0^{t} r(u)\\,du=${s.start}+${num(gained(s.t), 4)}`,
});
