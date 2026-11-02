import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { approach } from './_separable-math.js';

// Closing the switch on a battery V.
//   RC: R dq/dt + q/C = V      so q' + q/(RC) = V/R   q = CV(1 − e^{−t/RC}),   τ = RC
//   RL: L di/dt + R i = V      so i' + (R/L) i = V/L   i = (V/R)(1 − e^{−Rt/L}), τ = L/R
// Both are y' + y/τ = final/τ, solved by the integrating factor e^{t/τ}.
const state = { mode: 'rc', V: 10, R: 1000, C: 0.1, L: 1, n: 1 };
const tau = (s) => (s.mode === 'rc' ? s.R * (s.C / 1000) : s.L / s.R);
const final = (s) => (s.mode === 'rc' ? s.V : s.V / s.R); // capacitor voltage (V), or inductor current (A)
const time = (s) => s.n * tau(s);
const unit = (s) => (s.mode === 'rc' ? 'V' : 'A');
const at = (s, t) => approach(final(s), tau(s), t);

createTool({
  state,
  label: 'A graph of how the capacitor voltage in an RC circuit, or the current in an RL circuit, rises after the switch is closed. The curve starts steeply and levels off towards its final value, shown as a dashed line. After one time constant it has covered about 63 percent of the way. A time slider moves a marker along the curve.',
  setup: (stage, c) => createPlot(stage, { x: [0, 5], y: [0, 10], c, pad: 24 }),
  draw(ctx, stage, c, plot) {
    const t5 = 5 * tau(state);
    plot.setRange([0, t5], [0, final(state) * 1.15]);
    plot.axes({ xLabel: 't (s)', yLabel: state.mode === 'rc' ? 'V_C (V)' : 'i (A)' });
    plot.segment(0, final(state), t5, final(state), { color: c.grid, width: 3, dash: [6, 5] });
    plot.fn((t) => at(state, t), { color: c.a, width: 4 });
    plot.segment(tau(state), 0, tau(state), at(state, tau(state)), { color: c.b, width: 3, dash: [4, 3] });
    plot.point(tau(state), at(state, tau(state)), { fill: c.fillB, r: 6 });
    plot.point(time(state), at(state, time(state)), { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Close the switch' },
    { key: 'mode', label: 'Circuit', options: [['rc', 'RC circuit'], ['rl', 'RL circuit']] },
    { key: 'n', label: 'Time (in time constants)', min: 0, max: 5, step: 0.1, format: (n) => `${fixed(n, 1)} τ` },
    { key: 'V', label: 'Battery', min: 2, max: 12, step: 1, format: (n) => `${n} V` },
    { key: 'R', label: 'Resistance', min: 10, max: 1000, step: 10, format: (n) => `${n} Ω` },
    { key: 'C', label: 'Capacitance', min: 0.01, max: 1, step: 0.01, format: (n) => `${fixed(n, 2)} mF` },
    { key: 'L', label: 'Inductance', min: 0.1, max: 2, step: 0.1, format: (n) => `${fixed(n, 1)} H` },
    { readout: [
      ['Time constant τ', (s) => `${fixed(tau(s), 4)} s`],
      ['Time now', (s) => `${fixed(time(s), 4)} s`],
      ['Now (V_C or i)', (s) => `${fixed(at(s, time(s)), 3)} ${unit(s)}`],
      ['Share of final value', (s) => `${fixed((at(s, time(s)) / final(s)) * 100, 1)}%`],
      ['Final value', (s) => `${fixed(final(s), 3)} ${unit(s)}`],
    ] },
  ],
  tex: (s) => (s.mode === 'rc'
    ? `V_C=V\\left(1-e^{-t/RC}\\right),\\quad \\tau=RC=${fixed(tau(s), 4)}\\ \\text{s}`
    : `i=\\dfrac{V}{R}\\left(1-e^{-Rt/L}\\right),\\quad \\tau=\\dfrac{L}{R}=${fixed(tau(s), 4)}\\ \\text{s}`),
  onChange: (s) => show(s),
});

// RC uses C, RL uses L: hide the one that does not apply (fields: circuit, time, V, R, C, L)
const fields = [...document.querySelectorAll('#panel .nb-field')];
function show(s) {
  if (fields.length < 6) return;
  fields[4].hidden = s.mode !== 'rc';
  fields[5].hidden = s.mode !== 'rl';
}
show(state);
