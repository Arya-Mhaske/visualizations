import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sig, fixed } from '../../lib/format.js';
import { atTemperature, alphaFrom } from './_resistance-temperature-math.js';

const T_REF = 20; // °C
const state = { mode: 'new', R0: 100, T: 100, alpha: 4, R2: 132 };
const alpha = (s) => (s.mode === 'new' ? s.alpha * 1e-3 : alphaFrom(s.R0, s.R2, T_REF, s.T));
const second = (s) => (s.mode === 'new' ? atTemperature(s.R0, alpha(s), s.T - T_REF) : s.R2);

const tool = createTool({
  state,
  label: 'A graph of resistance against temperature in degrees Celsius. A straight line passes through the reading at 20 degrees and the reading at the chosen temperature. Its slope is R-zero times alpha.',
  setup: (stage, c) => createPlot(stage, { x: [0, 200], y: [0, 260], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'T (°C)', yLabel: 'R (Ω)' });
    plot.fn((T) => atTemperature(state.R0, alpha(state), T - T_REF), { color: c.b, domain: [0, 200] });
    plot.segment(T_REF, state.R0, state.T, state.R0, { color: c.grid, dash: [6, 5] });
    plot.segment(state.T, state.R0, state.T, second(state), { color: c.a, width: 3, dash: [6, 5] });
    plot.point(T_REF, state.R0, { fill: c.c, r: 7 });
    plot.point(state.T, Math.min(260, Math.max(0, second(state))), { fill: c.a, r: 8 });
  },
  controls: () => [
    { title: 'Reading at 20 °C' },
    { key: 'mode', label: 'Find', options: [['new', 'R at new T'], ['alpha', 'α from 2 readings']] },
    { key: 'R0', label: 'R₀ at 20 °C', min: 20, max: 100, step: 1, format: (n) => `${n} Ω` },
    { key: 'T', label: 'Temperature, T', min: 25, max: 200, step: 5, format: (n) => `${n} °C` },
    { key: 'alpha', label: 'α', min: 0.5, max: 6, step: 0.1, format: (n) => `${fixed(n, 1)} ×10⁻³ /K` },
    { key: 'R2', label: 'Second reading, R', min: 20, max: 250, step: 1, format: (n) => `${n} Ω` },
    { readout: [
      ['ΔT', (s) => `${s.T - T_REF} K`],
      ['R at T', (s) => `${sig(second(s), 4)} Ω`],
      ['α', (s) => `${sig(alpha(s) * 1e3, 3)} ×10⁻³ /K`],
    ] },
  ],
  tex: (s) => `R=R_0(1+\\alpha\\Delta T)=${s.R0}\\left(1+${sig(alpha(s), 3)}\\times ${s.T - T_REF}\\right)=${sig(second(s), 4)}\\ \\Omega`,
  onChange: () => show(),
});

const fields = [...document.querySelectorAll('#panel .nb-field')];
const show = () => {
  // fields: mode, R0, T, alpha, R2
  fields[3].hidden = state.mode !== 'new';
  fields[4].hidden = state.mode === 'new';
};
show();
tool.update();
