import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { boilT, cookerP, cookTime } from './_phase.js';

const state = { g: 70, d: 3 };
const P = (s) => cookerP(s.g / 1000, s.d / 1000);

createTool({
  state,
  label: 'A graph of boiling point against pressure with a marker at the cooker pressure, and below it two bars comparing the cooking time in an open pan and in the cooker.',
  setup: (stage, c) => createPlot(stage, { x: [0.8, 3.5], y: [90, 140], c, box: (st) => ({ x: 0, y: 0, w: st.w, h: st.h * 0.66 }) }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'P (atm)', yLabel: 'boils at (°C)' });
    plot.fn((x) => boilT(x), { color: c.b });
    plot.point(P(state), boilT(P(state)), { fill: c.a });
    [['open pan', 1, c.fillB], ['cooker', cookTime(boilT(P(state))), c.c]].forEach(([name, v, fill], i) => {
      const y = stage.h * 0.72 + i * 34;
      const w = v * stage.w * 0.55;
      poly(ctx, [[stage.w * 0.3, y], [stage.w * 0.3 + w, y], [stage.w * 0.3 + w, y + 24], [stage.w * 0.3, y + 24]], { fill, stroke: c.ink });
      label(ctx, name, stage.w * 0.3 - 6, y + 12, c, { size: 11, align: 'right', patch: false });
    });
  },
  controls: [
    { title: 'The valve' },
    { key: 'g', label: 'Valve mass (g)', min: 0, max: 150, step: 5 },
    { key: 'd', label: 'Vent diameter (mm)', min: 2, max: 5, step: 0.5 },
    { readout: [
      ['Pressure inside', (s) => `${fixed(P(s), 2)} atm`],
      ['Water boils at', (s) => `${fixed(boilT(P(s)), 1)} °C`],
      ['Cooking time', (s) => `${fixed(cookTime(boilT(P(s))) * 100, 0)}% of open pan`],
    ] },
  ],
  tex: (s) => `P=P_0+\\dfrac{mg}{A}=${fixed(P(s), 2)}\\ \\mathrm{atm}`,
});
