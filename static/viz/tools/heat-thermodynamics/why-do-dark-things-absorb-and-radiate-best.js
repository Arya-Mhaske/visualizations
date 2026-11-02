import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { rk4Step } from '../../lib/sim.js';
import { fixed } from '../../lib/format.js';

// A can of water (0.3 kg, 0.03 m²) exchanging heat by radiation only: dT/dt = e σ A (Ts⁴ − T⁴)/(m c).
const SIGMA = 5.67e-8;
const M_C = 0.3 * 4186;
const AREA = 0.03;
const state = { eShiny: 0.05, warm: false };
const BLACK = 0.95;
const setup = (s) => (s.warm ? { T0: 10, Ts: 60 } : { T0: 90, Ts: 20 });
const cache = new Map();
function curve(e, T0, Ts) {
  const key = `${e}|${T0}|${Ts}`;
  if (cache.has(key)) return cache.get(key);
  const out = [T0];
  let st = { t: 0, y: [T0 + 273.15] };
  const deriv = (t, y) => [(e * SIGMA * AREA * ((Ts + 273.15) ** 4 - y[0] ** 4)) / M_C];
  for (let m = 1; m <= 180; m++) {
    for (let i = 0; i < 6; i++) st = rk4Step(st, deriv, 10);
    out.push(st.y[0] - 273.15);
  }
  cache.set(key, out);
  return out;
}
const at = (arr, t) => arr[Math.min(180, Math.max(0, Math.round(t)))];

createTool({
  state,
  label: 'Temperature against time for two identical cans of water exchanging heat only by radiation, one painted black and one silvered. In the hot-can setting both cool towards the room, black fast and silver slowly. In the warm-wall setting both warm towards the wall, black fast and silver slowly.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 180], y: [0, 100] }),
  draw(ctx, stage, c, plot) {
    const { T0, Ts } = setup(state);
    const [blk, shy] = [curve(BLACK, T0, Ts), curve(state.eShiny, T0, Ts)];
    plot.axes({ xLabel: 't (min)', yLabel: '°C' });
    plot.fn(() => Ts, { color: c.grid, dash: [6, 5], width: 2 });
    plot.fn((t) => at(blk, t), { color: c.ink });
    plot.fn((t) => at(shy, t), { color: c.b });
    plot.text(state.warm ? 'wall 60°C' : 'room 20°C', 130, Ts + 4, { size: 11, patch: false });
    plot.text('black', 160, at(blk, 160) + (state.warm ? -5 : 5), { size: 11, patch: false });
    plot.text('silver', 160, at(shy, 160) + (state.warm ? 5 : -5), { size: 11, color: c.b, patch: false });
  },
  controls: [
    { title: 'Black can and shiny can' },
    { key: 'eShiny', label: 'Shiny can emissivity e', min: 0.02, max: 0.5, step: 0.01, format: (v) => fixed(v, 2) },
    { key: 'warm', label: 'Cold cans beside a hot wall instead', toggle: true },
    { readout: [
      ['Black after 1 h', (s) => `${fixed(at(curve(BLACK, setup(s).T0, setup(s).Ts), 60), 1)} °C`],
      ['Shiny after 1 h', (s) => `${fixed(at(curve(s.eShiny, setup(s).T0, setup(s).Ts), 60), 1)} °C`],
      ['Start', (s) => `${setup(s).T0} °C, surroundings ${setup(s).Ts} °C`],
    ] },
  ],
  tex: (s) => `P=e\\,\\sigma A\\,(T_s^{4}-T^{4}),\\quad e_{black}=0.95,\\ e_{shiny}=${fixed(s.eShiny, 2)}`,
});
