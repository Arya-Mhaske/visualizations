import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { specificHeatOfBall, C_WATER, C_COPPER } from './_heat-capacity-math.js';

const state = { Tf: 23 };
const P = { mBall: 0.047, T0: 100, mWater: 0.25, mCal: 0.14, Ti: 20 };
const cOf = (Tf) => specificHeatOfBall({ ...P, Tf });

createTool({
  state,
  label: 'A graph of the specific heat you would calculate against the final temperature that the thermometer reads. A marker shows the chosen reading.',
  setup: (stage, c) => createPlot(stage, { x: [20, 27], y: [0, 1500], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'final T (°C)', yLabel: 'c (J/kg·K)' });
    plot.fn((x) => (x > 20.05 ? cOf(x) : NaN), { color: c.b });
    plot.segment(20, 900, 27, 900, { color: c.c, dash: [6, 5], width: 2 });
    plot.text('tabulated ≈ 900', 20.2, 960, { align: 'left', patch: false });
    plot.point(state.Tf, cOf(state.Tf), { fill: c.a });
  },
  controls: [
    { title: 'Read the thermometer' },
    { key: 'Tf', label: 'Final temperature (°C)', min: 20.5, max: 26, step: 0.5 },
    { readout: [
      ['Heat gained, water', (s) => `${fixed(P.mWater * C_WATER * (s.Tf - P.Ti), 0)} J`],
      ['Heat gained, calorimeter', (s) => `${fixed(P.mCal * C_COPPER * (s.Tf - P.Ti), 0)} J`],
      ['Ball cooled by', (s) => `${fixed(P.T0 - s.Tf, 1)} K`],
      ['Specific heat of Al', (s) => `${fixed(cOf(s.Tf), 0)} J/kg·K`],
    ] },
  ],
  tex: (s) => `c=\\dfrac{(0.25\\times4180+0.14\\times390)(${s.Tf}-20)}{0.047\\times(100-${s.Tf})}=${fixed(cOf(s.Tf), 0)}`,
});
