import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, simpson, num } from '../integral-applications/_ia.js';

// Displacement = ∫ v dt (signed). Distance travelled = ∫ |v| dt (odometer). They differ when the walk turns back.
const WALKS = {
  turn: { name: 'Walk out, then turn back', v: (t) => 4 - 1.6 * t, T: 5 },
  out: { name: 'Walk out and keep going', v: (t) => 1 + 2 * Math.sin(t * 0.8) ** 2, T: 5 },
  zig: { name: 'Back and forth', v: (t) => 3 * Math.cos(1.5 * t), T: 5 },
};
const state = { kind: 'turn', t: 4 };
const K = () => WALKS[state.kind];
const disp = (t) => simpson(K().v, 0, t, Math.max(2, Math.ceil(t * 40)));
const dist = (t) => simpson((u) => Math.abs(K().v(u)), 0, t, Math.max(2, Math.ceil(t * 60)));
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: velocity against time with the area above the axis shaded green and below it coral. Bottom: the position (signed total) and the odometer reading (every area counted positive).',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [0, 5], y: [-4, 4], c, box: bA }), b: createPlot(stage, { x: [0, 5], y: [-6, 12], c, box: bB }) }),
  draw(ctx, stage, c, { a, b }) {
    const k = K();
    const ys = Array.from({ length: 51 }, (_, i) => [disp((k.T * i) / 50), dist((k.T * i) / 50)]).flat();
    a.setRange([0, k.T], [-4.5, 4.5]);
    b.setRange([0, k.T], [Math.min(0, ...ys) - 1, Math.max(...ys) + 1]);
    a.axes({ xLabel: 't (s)', yLabel: 'v (m/s)' });
    a.shade((t) => Math.max(0, k.v(t)), null, 0, state.t, c.fillC);
    a.shade((t) => Math.min(0, k.v(t)), null, 0, state.t, c.fillA);
    a.fn(k.v, { color: c.ink, width: 3 });
    b.axes({ xLabel: 't (s)', yLabel: 'metres' });
    b.fn(disp, { color: c.b, width: 3, domain: [0.02, k.T] });
    b.fn(dist, { color: c.a, width: 3, domain: [0.02, k.T] });
    b.point(state.t, disp(state.t), { fill: c.b }); b.point(state.t, dist(state.t), { fill: c.a });
  },
  controls: [
    { title: 'Take the walk' },
    { key: 'kind', label: 'Walk', options: Object.entries(WALKS).map(([k, v]) => [k, v.name]) },
    { key: 't', label: 'Time now', min: 0.1, max: 5, step: 0.1, format: (v) => `${v.toFixed(1)} s` },
    { readout: [
      ['Displacement ∫v dt (blue)', () => `${num(disp(state.t), 4)} m`],
      ['Distance ∫|v| dt (coral)', () => `${num(dist(state.t), 4)} m`],
      ['Same?', () => (Math.abs(disp(state.t) - dist(state.t)) < 1e-3 ? { text: 'yes: never turned back', good: true } : { text: 'no: the walk reversed', good: false })],
    ] },
  ],
  tex: (s) => `\\text{displacement}=\\int_0^{t}v\\,dt=${num(disp(s.t), 3)},\\quad \\text{distance}=\\int_0^{t}|v|\\,dt=${num(dist(s.t), 3)}`,
});
