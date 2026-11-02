import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, num } from './_da.js';

// Power needed: P(v) = a v³ (drag on the body) + b/v (cost of making lift). Energy per kilometre E = P/v.
// E is the slope of the line from the origin to (v, P(v)). The least slope is where that line just touches the curve. Made-up round numbers.
const a = 2e-4; // kW per (m/s)³
const state = { v: 40, b: 2420 };
const P = (v) => a * v ** 3 + state.b / v;
const E = (v) => (P(v) / v) * 1000; // kJ per km
const vMR = () => (state.b / a) ** 0.25; // minimum energy per km
const vMP = () => (state.b / (3 * a)) ** 0.25; // minimum power
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: power needed against speed, with a straight line from the origin to the current point; the energy per kilometre is its slope. Bottom: energy per kilometre against speed, with its lowest point marked.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [20, 120], y: [0, 160], c, box: bA }), b: createPlot(stage, { x: [20, 120], y: [0, 3], c, box: bB }) }),
  draw(ctx, stage, c, { a: pa, b: pb }) {
    pa.setRange([0, 120], [0, 160]);
    pb.setRange([20, 120], [0, 2500]);
    pa.axes({ xLabel: 'speed v (m/s)', yLabel: 'power P (kW)' });
    pa.fn(P, { color: c.ink, width: 3, domain: [10, 120] });
    pa.segment(0, 0, 120, (P(state.v) / state.v) * 120, { color: c.a, width: 2.5 });
    pa.segment(0, 0, 120, (P(vMR()) / vMR()) * 120, { color: c.c, width: 2, dash: [6, 4] });
    pa.point(state.v, P(state.v), { fill: c.a });
    pa.point(vMR(), P(vMR()), { fill: c.c, r: 7 });
    pa.point(vMP(), P(vMP()), { fill: c.d, r: 6 });
    pb.axes({ xLabel: 'speed v (m/s)', yLabel: 'energy (kJ/km)' });
    pb.fn(E, { color: c.b, width: 3, domain: [20, 120] });
    pb.point(vMR(), E(vMR()), { fill: c.c, r: 7 });
    pb.point(state.v, E(state.v), { fill: c.a });
  },
  controls: [
    { title: 'Choose a speed' },
    { key: 'v', label: 'Cruise speed', min: 20, max: 120, step: 1, format: (x) => `${x} m/s` },
    { key: 'b', label: 'Lift-cost constant b (heavier = bigger)', min: 1000, max: 4000, step: 100 },
    { readout: [
      ['Power P', () => `${num(P(state.v), 4)} kW`],
      ['Energy per km  E = P/v', () => `${num(E(state.v), 4)} kJ/km`],
      ['Least energy per km at', () => `${num(vMR(), 4)} m/s (green): ${num(E(vMR()), 4)} kJ/km`],
      ['Least power at', () => `${num(vMP(), 4)} m/s (purple): slower, stays up longest`],
    ] },
  ],
  tex: () => 'E(v)=\\frac{P(v)}{v}=av^2+\\frac{b}{v^2},\\quad E\'(v)=0\\Rightarrow v^4=\\frac{b}{a}',
});
