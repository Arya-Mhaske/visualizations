import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sig } from '../../lib/format.js';
import { LIQUIDS, capRise, dropExcess, bubbleExcess } from './_surface-tension-math.js';

const state = { liq: 'water', x: 10 }; // r = 10^(x/10 - 1.5) mm, x = 0..30 gives 0.03 .. 31 mm
const radiusMm = (s) => 10 ** (s.x / 10 - 1);
const L = (s) => LIQUIDS[s.liq];
const hmm = (s, r = radiusMm(s)) => capRise(L(s)[1], L(s)[3], L(s)[2], r / 1000) * 1000;

createTool({
  state,
  label: 'Two graphs of capillary rise and excess pressure against tube radius, on log scales. Both fall as the radius grows. A marker shows the chosen radius.',
  setup: (stage, c) => [
    createPlot(stage, { x: [-1, 1], y: [-1.5, 2.5], c, box: (st) => ({ x: 0, y: 0, w: st.w, h: st.h * 0.5 }) }),
    createPlot(stage, { x: [-1, 1], y: [0, 4], c, box: (st) => ({ x: 0, y: st.h * 0.5, w: st.w, h: st.h * 0.5 }) }),
  ],
  draw(ctx, stage, c, [top, bottom]) {
    const lg = Math.log10;
    top.axes({ xLabel: 'log₁₀ r (mm)', yLabel: 'log₁₀|h| (mm)' });
    top.fn((x) => lg(Math.abs(hmm(state, 10 ** x))), { color: c.b });
    top.point(lg(radiusMm(state)), lg(Math.abs(hmm(state))));
    bottom.axes({ xLabel: 'log₁₀ r (mm)', yLabel: 'log₁₀ ΔP (Pa)' });
    bottom.fn((x) => lg(dropExcess(L(state)[1], (10 ** x) / 1000)), { color: c.c });
    bottom.fn((x) => lg(bubbleExcess(L(state)[1], (10 ** x) / 1000)), { color: c.a });
    bottom.point(lg(radiusMm(state)), lg(dropExcess(L(state)[1], radiusMm(state) / 1000)), { fill: c.c });
    bottom.point(lg(radiusMm(state)), lg(bubbleExcess(L(state)[1], radiusMm(state) / 1000)), { fill: c.a });
  },
  controls: [
    { title: 'Inputs' },
    { key: 'liq', label: 'Liquid', options: Object.entries(LIQUIDS).map(([k, v]) => [k, v[0]]) },
    { key: 'x', label: 'Radius r (log scale)', min: 0, max: 20, step: 1, format: (v) => `${sig(10 ** (v / 10 - 1), 2)} mm` },
    { readout: [
      ['S (N/m)', (s) => String(L(s)[1])],
      ['Capillary rise h', (s) => `${sig(hmm(s), 3)} mm`],
      ['Drop ΔP = 2S/r', (s) => `${sig(dropExcess(L(s)[1], radiusMm(s) / 1000), 3)} Pa`],
      ['Bubble ΔP = 4S/r', (s) => `${sig(bubbleExcess(L(s)[1], radiusMm(s) / 1000), 3)} Pa`],
    ] },
  ],
  tex: (s) => `h=\\dfrac{2S\\cos\\theta}{\\rho g r}=${sig(hmm(s), 3)}\\ \\mathrm{mm}`,
});
