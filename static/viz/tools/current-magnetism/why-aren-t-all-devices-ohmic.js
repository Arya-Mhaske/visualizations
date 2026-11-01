import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { fixed, sig } from '../../lib/format.js';
import { deviceMA } from './_resistance-temperature-math.js';

const V_MIN = -1;
const V_MAX = 0.8;
const Y = 30;
const state = { device: 'diode', V: 0.2 };
const clip = (v) => Math.max(-Y, Math.min(Y, v));
const roundV = (v) => Math.round(Math.max(V_MIN, Math.min(V_MAX, v)) * 100) / 100;
const mA = (V) => deviceMA(state.device, V);
const ratio = (s) => (s.V === 0 ? null : (s.V / (mA(s.V) / 1000)));

const tool = createTool({
  state,
  label: 'A graph of current against voltage for the chosen device. The curve is drawn only up to the voltage you have reached, as if you swept the voltage up from the left. A dashed straight line joins the origin to your point.',
  setup: (stage, c) => createPlot(stage, { x: [V_MIN, V_MAX], y: [-Y, Y], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'V (V)', yLabel: 'I (mA)' });
    plot.fn(mA, { color: c.grid, domain: [V_MIN, V_MAX] });
    plot.fn((v) => (v <= state.V ? mA(v) : NaN), { color: c.b, domain: [V_MIN, V_MAX] });
    plot.segment(0, 0, state.V, clip(mA(state.V)), { color: c.a, width: 3, dash: [7, 5] });
    plot.point(state.V, clip(mA(state.V)), { fill: c.a, r: 8 });
  },
  controls: () => [
    { title: 'Sweep the voltage' },
    { key: 'device', label: 'Device', options: [['resistor', 'Resistor'], ['lamp', 'Lamp'], ['diode', 'Diode']] },
    { key: 'V', label: 'Voltage, V', min: V_MIN, max: V_MAX, step: 0.01, format: (n) => `${fixed(n, 2)} V` },
    { readout: [
      ['Current, I', (s) => `${sig(mA(s.V), 3)} mA`],
      ['R = V/I', (s) => (ratio(s) === null ? 'no value at 0' : `${sig(ratio(s), 3)} Ω`)],
      ['Ohmic?', (s) => (s.device === 'resistor' ? { text: 'yes: straight line', good: true } : { text: 'no: curved', good: false })],
    ] },
  ],
  tex: (s) => (ratio(s) === null ? 'R=\\dfrac{V}{I}=\\dfrac{0}{0}' : `R=\\dfrac{V}{I}=\\dfrac{${fixed(s.V, 2)}}{${sig(mA(s.V) / 1000, 3)}}=${sig(ratio(s), 3)}\\ \\Omega`),
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(state.V, clip(mA(state.V))),
  move(px) { state.V = roundV(tool.extra.toWorld(px, 0)[0]); },
  nudge(direction) { state.V = roundV(state.V + direction * 0.01); },
}], { onChange: () => tool.update() });
tool.update();
