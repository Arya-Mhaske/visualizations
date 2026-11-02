import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createRng } from '../../lib/rng.js';
import { fixed } from '../../lib/format.js';
import { gasPoints, fitLine, zeroFrom } from './_temperature-math.js';

const P0 = [120, 80, 45];
const state = { low: 0, gases: 3 };
const fitFor = (s, i) => {
  const pts = gasPoints(P0[i], s.low, 6, createRng(7 + i));
  return { pts, fit: fitLine(pts) };
};

createTool({
  state,
  label: 'Pressure against temperature for gases at constant volume. Dots are measurements between the chosen coldest temperature and 100 degrees; straight lines run through them and are extended back until they reach zero pressure at about minus 273 degrees Celsius.',
  setup: (stage, c) => createPlot(stage, { x: [-300, 120], y: [0, 180], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'T (°C)', yLabel: 'P (kPa)' });
    plot.segment(-273.15, 0, -273.15, 180, { color: c.ink, dash: [6, 5], width: 2 });
    const cols = [c.a, c.b, c.c];
    for (let i = 0; i < state.gases; i++) {
      const { pts, fit } = fitFor(state, i);
      plot.fn((x) => fit.m * x + fit.b, { color: cols[i], domain: [-300, 120] });
      pts.forEach(([x, y]) => plot.point(x, y, { fill: cols[i], r: 5 }));
    }
  },
  controls: [
    { title: 'Measure and extend' },
    { key: 'low', label: 'Coldest measurement (°C)', min: -150, max: 0, step: 25 },
    { key: 'gases', label: 'Gas samples', min: 1, max: 3, step: 1 },
    { readout: [
      ...[0, 1, 2].map((i) => [`Gas ${i + 1} reaches P = 0 at`, (s) => (i < s.gases ? `${fixed(zeroFrom(fitFor(s, i).fit), 1)} °C` : '—')]),
      ['Accepted value', () => '−273.15 °C'],
    ] },
  ],
  tex: () => `P=P_0\\left(1+\\dfrac{T}{273.15}\\right)\\ \\Rightarrow\\ P=0\\ \\text{at}\\ T=-273.15\\,^\\circ\\mathrm{C}`,
});
