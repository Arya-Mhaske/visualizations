import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sig, fixed } from '../../lib/format.js';

const V0 = 12;
const R1 = 6;
const state = { mode: 'series', R2: 12 };
const I = (s) => V0 / (R1 + s.R2);
// power in the second bulb, for a given R2, in each arrangement
const p2 = (mode, R2) => (mode === 'series' ? (V0 / (R1 + R2)) ** 2 * R2 : (V0 * V0) / R2);
const p1 = (s) => (s.mode === 'series' ? I(s) ** 2 * R1 : (V0 * V0) / R1);

const tool = createTool({
  state,
  label: 'A graph of the power in bulb two against its resistance. In a series chain the curve rises then falls, in parallel it falls steadily. A coral point shows the chosen resistance, and two dashed curves show what the formulas I squared R and V squared over R would give if the current or voltage were held fixed.',
  setup: (stage, c) => createPlot(stage, { x: [0, 30], y: [0, 40], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'R₂ (Ω)', yLabel: 'P₂ (W)' });
    const fixedI = I(state);
    const fixedV = state.mode === 'series' ? V0 / (R1 + state.R2) * state.R2 : V0;
    plot.fn((R) => fixedI * fixedI * R, { color: c.c, dash: [6, 5], domain: [0.5, 30] });
    plot.fn((R) => (fixedV * fixedV) / R, { color: c.d, dash: [6, 5], domain: [0.5, 30] });
    plot.fn((R) => p2(state.mode, R), { color: c.b, domain: [0.5, 30] });
    plot.point(state.R2, Math.min(40, p2(state.mode, state.R2)), { fill: c.a, r: 8 });
    plot.text('I²R, I held', 25, Math.min(38, fixedI * fixedI * 25), { patch: false });
    plot.text('V²/R, V held', 22, Math.min(38, (fixedV * fixedV) / 22 + 2), { patch: false });
  },
  controls: () => [
    { title: 'Bulb 1 is 6 Ω. Bulb 2:' },
    { key: 'mode', label: 'Joined', options: [['series', 'Series (same I)'], ['parallel', 'Parallel (same V)']] },
    { key: 'R2', label: 'Resistance of bulb 2', min: 1, max: 30, step: 1, format: (n) => `${n} Ω` },
    { readout: [
      ['Bulb 1', (s) => `${sig(p1(s), 3)} W`],
      ['Bulb 2', (s) => `${sig(p2(s.mode, s.R2), 3)} W`],
      ['Brighter bulb', (s) => (p2(s.mode, s.R2) > p1(s) ? 'bulb 2 (larger R)' : p2(s.mode, s.R2) < p1(s) ? 'bulb 1' : 'equal')],
    ] },
  ],
  tex: (s) => (s.mode === 'series'
    ? `P=I^2R=(${sig(I(s), 3)})^2(${s.R2})=${sig(p2('series', s.R2), 3)}\\ \\text{W}`
    : `P=\\dfrac{V^2}{R}=\\dfrac{${V0}^2}{${s.R2}}=${sig(p2('parallel', s.R2), 3)}\\ \\text{W}`),
});
tool.update();
