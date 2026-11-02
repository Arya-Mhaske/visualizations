import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { skinAfter, contact, E_COPPER, E_WOOD, E_SKIN, SKIN } from './_temperature-math.js';

const state = { tw: 30, t: 0 };
const HOT = 44;
const COLD = 12;
const feel = (Ts, Tw) => (Math.abs(Tw - Ts) < 1 ? 'no change' : Tw > Ts ? 'feels warm' : 'feels cold');

createTool({
  state,
  label: 'Two curves of skin temperature over time after both hands are put into the same bowl. The hot-adapted hand starts above the bowl temperature and the cold-adapted hand starts below it. Each curve approaches the bowl temperature.',
  setup: (stage, c) => createPlot(stage, { x: [0, 60], y: [0, 50], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 'skin T (°C)' });
    plot.segment(0, state.tw, 60, state.tw, { color: c.b, width: 3 });
    plot.text('bowl', 54, state.tw + 3, { patch: false });
    plot.fn((x) => skinAfter(HOT, state.tw, x), { color: c.a });
    plot.fn((x) => skinAfter(COLD, state.tw, x), { color: c.c });
    plot.point(state.t, skinAfter(HOT, state.tw, state.t), { fill: c.a });
    plot.point(state.t, skinAfter(COLD, state.tw, state.t), { fill: c.c });
  },
  controls: [
    { title: 'Both hands into the bowl' },
    { key: 'tw', label: 'Bowl temperature (°C)', min: 15, max: 40, step: 1 },
    { key: 't', label: 'Time in the bowl (s)', min: 0, max: 60, step: 1 },
    { readout: [
      ['Hot hand (was 44 °C)', (s) => `${fixed(skinAfter(HOT, s.tw, s.t), 1)} °C: ${feel(skinAfter(HOT, s.tw, s.t), s.tw)}`],
      ['Cold hand (was 12 °C)', (s) => `${fixed(skinAfter(COLD, s.tw, s.t), 1)} °C: ${feel(skinAfter(COLD, s.tw, s.t), s.tw)}`],
      ['Metal at bowl T, touched', (s) => `${fixed(contact(E_COPPER, E_SKIN, s.tw, SKIN), 1)} °C`],
      ['Wood at bowl T, touched', (s) => `${fixed(contact(E_WOOD, E_SKIN, s.tw, SKIN), 1)} °C`],
    ] },
  ],
  tex: (s) => `T_{\\text{contact}}=\\dfrac{e_1T_1+e_2T_2}{e_1+e_2}`,
});
