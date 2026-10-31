import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { fixed, sig, texSci } from '../../lib/format.js';
import { deviceCurrent, ratioR } from './_current-drift-math.js';

const V_MIN = -1;
const V_MAX = 0.66;
const state = { device: 'resistor', V: 0.3 };
const tex = (x) => (Math.abs(x) >= 1e-3 && Math.abs(x) < 1e6 ? sig(x, 3) : texSci(x, 3));
const mA = (V) => deviceCurrent(state.device, V) * 1000;
const current = (s) => deviceCurrent(s.device, s.V);
const shownR = (s) => (s.V === 0 ? '0/0: no value' : `${sig(ratioR(s.V, current(s)), 3)} Ω`);
const doubled = (s) => {
  if (s.V === 0) return '—';
  if (2 * s.V > V_MAX || 2 * s.V < V_MIN) return 'off this range';
  return `× ${sig(deviceCurrent(s.device, 2 * s.V) / current(s), 3)}`;
};
const roundV = (v) => Math.round(Math.max(V_MIN, Math.min(V_MAX, v)) * 100) / 100;

const tool = createTool({
  state,
  label: 'A graph of current against voltage for the chosen device, with a coral point you can drag along it. A dashed line from the origin to the point has slope I/V, so it shows the value of R at that point.',
  setup: (stage, c) => createPlot(stage, { x: [V_MIN, 0.8], y: [-5, 25], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'V (V)', yLabel: 'I (mA)' });
    plot.fn(mA, { color: c.b, domain: [V_MIN, V_MAX] });
    plot.segment(0, 0, state.V, mA(state.V), { color: c.a, width: 3, dash: [7, 5] });
    plot.point(state.V, Math.max(-5, Math.min(25, mA(state.V))), { fill: c.a, r: 8 });
  },
  controls: () => [
    { title: 'Measure the device' },
    { key: 'device', label: 'Device', options: [['resistor', 'Resistor'], ['diode', 'Diode']] },
    { key: 'V', label: 'Voltage, V', min: V_MIN, max: V_MAX, step: 0.01, format: (n) => `${fixed(n, 2)} V` },
    { readout: [
      ['Current, I', (s) => `${sig(current(s) * 1000, 3)} mA`],
      ['R = V/I', shownR],
      ['Double V, and I goes', doubled],
      ['Obeys Ohm\'s law?', (s) => (s.device === 'resistor' ? { text: 'yes: R stays fixed', good: true } : { text: 'no: R keeps changing', good: false })],
    ] },
  ],
  tex: (s) => (s.V === 0
    ? 'R=\\dfrac{V}{I}=\\dfrac{0}{0}'
    : `R=\\dfrac{V}{I}=\\dfrac{${fixed(s.V, 2)}}{${tex(current(s))}}=${tex(ratioR(s.V, current(s)))}\\ \\Omega`),
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(state.V, Math.max(-5, Math.min(25, mA(state.V)))),
  move(px) { state.V = roundV(tool.extra.toWorld(px, 0)[0]); },
  nudge(direction) { state.V = roundV(state.V + direction * 0.01); },
}], { onChange: () => tool.update() });
