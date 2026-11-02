import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { copFridge } from './_engines.js';
import { fixed } from '../../lib/format.js';

const K = 273.15;
const state = { Tin: 4, Troom: 30, share: 40 };
const ideal = (Tin, Troom) => copFridge(Tin + K, Troom + K);
const real = (s, Tin = s.Tin) => (ideal(Tin, s.Troom) * s.share) / 100;

createTool({
  state,
  label: 'The coefficient of performance of a refrigerator against its inside temperature, for a fixed room. A dashed line shows the ideal Carnot value and a solid line shows a real fridge doing a fixed share of it. Colder insides make the fridge work harder per joule of heat removed.',
  setup: (stage, c) => createPlot(stage, { c, x: [-30, 15], y: [0, 15] }),
  draw(ctx, stage, c, plot) {
    const top = Math.max(15, Math.ceil(ideal(14, state.Troom) / 5) * 5);
    plot.setRange([-30, 15], [0, top]);
    plot.axes({ xLabel: 'inside (°C)', yLabel: 'COP' });
    plot.fn((t) => ideal(t, state.Troom), { color: c.grid, dash: [6, 5], width: 3, domain: [-30, Math.min(15, state.Troom - 3)] });
    plot.fn((t) => real(state, t), { color: c.a, domain: [-30, Math.min(15, state.Troom - 3)] });
    plot.point(state.Tin, real(state), { fill: c.a });
    plot.point(state.Tin, ideal(state.Tin, state.Troom), { fill: c.b, r: 5 });
    plot.text('ideal', -22, ideal(-22, state.Troom) + top * 0.04, { size: 11, patch: false });
    plot.text('real', -22, real(state, -22) + top * 0.05, { size: 11, color: c.a, patch: false });
  },
  controls: [
    { title: 'Cool the inside' },
    { key: 'Tin', label: 'Inside temperature (°C)', min: -25, max: 10, step: 1 },
    { key: 'Troom', label: 'Room temperature (°C)', min: 20, max: 45, step: 1 },
    { key: 'share', label: 'Share of ideal achieved (%)', min: 20, max: 70, step: 5 },
    { readout: [
      ['Ideal COP', (s) => fixed(ideal(s.Tin, s.Troom), 2)],
      ['Real COP', (s) => fixed(real(s), 2)],
      ['Work to remove 1000 J', (s) => `${fixed(1000 / real(s), 0)} J`],
      ['Heat into the room', (s) => `${fixed(1000 + 1000 / real(s), 0)} J`],
    ] },
  ],
  tex: (s) => `\\mathrm{COP}=\\dfrac{Q_c}{W}=\\dfrac{T_c}{T_h-T_c}=\\dfrac{${fixed(s.Tin + K, 1)}}{${fixed(s.Troom - s.Tin, 1)}}=${fixed(ideal(s.Tin, s.Troom), 2)}`,
  onChange(s) { s.Tin = Math.min(s.Tin, s.Troom - 5); },
});
