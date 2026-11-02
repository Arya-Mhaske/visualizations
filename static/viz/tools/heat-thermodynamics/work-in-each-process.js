import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { KINDS, NAMES, end, work, curve } from './_proc.js';
import { fixed } from '../../lib/format.js';

// Four processes from the same start (100 kPa, 10 L) to a final volume V2. Isochoric has no volume change, so no area.
const [P1, V1] = [100, 10];
const state = { sel: 'isobaric', V2: 20, g: 1.4 };
const f = (s) => s.V2 / V1;

createTool({
  state,
  label: 'Pressure against volume with all four processes drawn from the same start to the same final volume. The chosen one has its area shaded. Isobaric has the largest area, then isothermal, then adiabatic, and isochoric has none.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 45], y: [0, 200] }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'V (L)', yLabel: 'P (kPa)' });
    const cols = { isobaric: c.a, isothermal: c.b, adiabatic: c.d };
    const sel = curve(state.sel, P1, V1, state.g);
    if (sel) plot.shade(sel, null, V1, state.V2, c.fillY);
    for (const k of ['isobaric', 'isothermal', 'adiabatic']) {
      plot.fn(curve(k, P1, V1, state.g), { color: cols[k], width: k === state.sel ? 5 : 2, domain: [V1, state.V2] });
      plot.point(state.V2, end(k, P1, V1, f(state), state.g).P2, { fill: cols[k], r: 5 });
    }
    plot.segment(V1, P1, V1, 0, { color: c.ink, width: state.sel === 'isochoric' ? 5 : 2, dash: [5, 4] });
    plot.point(V1, P1, { fill: c.c });
  },
  controls: [
    { title: 'Compare the work' },
    { key: 'sel', label: 'Shade', options: [['isobaric', 'P const'], ['isochoric', 'V const'], ['isothermal', 'T const'], ['adiabatic', 'Q = 0']] },
    { key: 'V2', label: 'Final volume (L)', min: 15, max: 40, step: 5 },
    { key: 'g', label: 'Gas γ', options: [[1.67, '1.67'], [1.4, '1.40']] },
    { readout: KINDS.map((k) => [`W ${NAMES[k].toLowerCase()}`, (s) => `${fixed(work(k, P1, V1, f(s), s.g), 0)} J`]) },
  ],
  tex: (s) => ({
    isobaric: `W=P\\,(V_2-V_1)=${fixed(work('isobaric', P1, V1, f(s), s.g), 0)}\\ \\mathrm{J}`,
    isochoric: 'W=P\\,\\Delta V=0\\quad(\\Delta V=0)',
    isothermal: `W=P_1V_1\\ln\\dfrac{V_2}{V_1}=${fixed(work('isothermal', P1, V1, f(s), s.g), 0)}\\ \\mathrm{J}`,
    adiabatic: `W=\\dfrac{P_1V_1-P_2V_2}{\\gamma-1}=${fixed(work('adiabatic', P1, V1, f(s), s.g), 0)}\\ \\mathrm{J}`,
  })[s.sel],
});
