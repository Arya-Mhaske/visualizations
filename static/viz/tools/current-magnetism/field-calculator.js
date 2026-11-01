import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { axisLoop, longWire, solenoidInfinite } from './_sources-of-magnetic-field-math.js';

// The inputs are in the units a student meets: cm, A, turns per metre. The maths wants metres.
const state = { shape: 'wire', I: 10, r: 5, R: 5, x: 0, N: 1, n: 1000 };
const EARTH = 40e-6; // tesla, about; it runs from 25 to 65 µT over the globe
const m = (cm) => cm / 100;
const FIELD = {
  wire: (s) => longWire(s.I, m(s.r)),
  loop: (s) => s.N * axisLoop(s.I, m(s.R), m(s.x)),
  solenoid: (s) => solenoidInfinite(s.n, s.I),
};
const B = (s = state) => FIELD[s.shape](s);
const unit = (t) => (Math.abs(t) >= 1e-3 ? [t * 1e3, 'mT'] : [t * 1e6, 'µT']);
const show = (t) => { const [v, u] = unit(t); return `${sig(v, 3)} ${u}`; };

// What the graph shows for each source: the variable on the axis, its range, and B as a function of it.
const GRAPH = {
  wire: { xLabel: 'r (cm)', x: [0.5, 30], at: (s) => s.r, f: (s) => (r) => longWire(s.I, m(r)) },
  loop: { xLabel: 'x (cm)', x: [-30, 30], at: (s) => s.x, f: (s) => (x) => s.N * axisLoop(s.I, m(s.R), m(x)) },
  solenoid: { xLabel: 'I (A)', x: [0, 20], at: (s) => s.I, f: (s) => (I) => solenoidInfinite(s.n, I) },
};
const top = (s) => ({ wire: longWire(s.I, m(1)) * 0.5, loop: s.N * axisLoop(s.I, m(s.R), 0) * 1.15, solenoid: solenoidInfinite(s.n, 20) * 1.1 })[s.shape];
const scaleFor = (s) => (top(s) >= 1e-3 ? [1e3, 'B (mT)'] : [1e6, 'B (µT)']);

const tool = createTool({
  state,
  label: 'A graph of the field of the chosen source against the variable in its formula, with a dot at the current setting. For a long wire it falls as one over the distance, for a loop on its axis it is a bell shape, and for a solenoid it is a straight line against current.',
  setup: (stage, c) => createPlot(stage, { x: [0, 30], y: [0, 100], c, pad: 34 }),
  draw(ctx, stage, c, plot) {
    const g = GRAPH[state.shape];
    const [k, yLabel] = scaleFor(state);
    plot.setRange(g.x, [0, top(state) * k]);
    plot.axes({ xLabel: g.xLabel, yLabel });
    const f = g.f(state);
    plot.fn((x) => f(x) * k, { color: c.c });
    plot.point(g.at(state), B() * k, { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: 'Choose a source' },
    { key: 'shape', label: 'Source', options: [['wire', 'Long wire'], ['loop', 'Coil'], ['solenoid', 'Solenoid']] },
    { key: 'I', label: 'Current, I', min: 0.5, max: 20, step: 0.5, format: (n) => `${fixed(n, 1)} A` },
    { key: 'r', label: 'Distance from wire, r', min: 1, max: 30, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'R', label: 'Coil radius, R', min: 2, max: 20, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'x', label: 'Distance along the axis, x', min: 0, max: 30, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'N', label: 'Turns in the coil, N', min: 1, max: 100, format: (n) => `${n}` },
    { key: 'n', label: 'Turns per metre, n', min: 100, max: 5000, step: 100, format: (n) => `${n} /m` },
    { readout: [
      ['Field, B', (s) => show(B(s))],
      ['Earth\'s field is', () => 'about 40 µT'],
      ['In Earth fields', (s) => `${sig(B(s) / EARTH, 3)}`],
    ] },
    { text: 'Right-hand rule: for a wire, thumb along I and your fingers curl the way B goes. For a coil, curl your fingers with I and your thumb gives B.' },
  ],
  tex: (s) => {
    if (s.shape === 'wire') return `B=\\dfrac{\\mu_0 I}{2\\pi r}=\\dfrac{(4\\pi\\times 10^{-7})(${fixed(s.I, 1)})}{2\\pi\\,(${fixed(m(s.r), 3)})}=${show(B(s))}`;
    if (s.shape === 'loop') return `B=\\dfrac{\\mu_0 N I R^2}{2(x^2+R^2)^{3/2}}=\\dfrac{(4\\pi\\times 10^{-7})(${s.N})(${fixed(s.I, 1)})(${fixed(m(s.R), 3)})^2}{2\\,(${fixed(m(s.x) ** 2 + m(s.R) ** 2, 4)})^{3/2}}=${show(B(s))}`;
    return `B=\\mu_0 n I=(4\\pi\\times 10^{-7})(${s.n})(${fixed(s.I, 1)})=${show(B(s))}`;
  },
  onChange() { showFields(); },
});

const fields = [...document.querySelectorAll('#panel .nb-field')];
const SHOWN = { wire: [1, 2], loop: [1, 3, 4, 5], solenoid: [1, 6] };
function showFields() {
  fields.forEach((field, i) => { field.hidden = i > 0 && !SHOWN[state.shape].includes(i); });
}
showFields();
tool.update();
