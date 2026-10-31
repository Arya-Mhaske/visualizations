import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { fixed, piFrac } from '../../lib/format.js';
import { TAU, kindOf, pathDifference, resultant } from './_superposition-math.js';

const K = Math.PI / 2; // λ = 4 m
const W = Math.PI; // T = 2 s, so v = 2 m/s
const LAMBDA = TAU / K;
const A1 = 1;
const state = { phi: 0, A2: 1 };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const y1 = (x) => A1 * Math.sin(K * x - W * clock.state.t);
const y2 = (x) => state.A2 * Math.sin(K * x - W * clock.state.t + state.phi);
const R = () => resultant(A1, state.A2, state.phi);
const verdict = () => kindOf(state.phi, A1, state.A2);
const phiText = () => piFrac(state.phi) ?? fixed(state.phi, 2);
const setPhi = (phi) => () => { state.phi = phi; tool.update(); };

const tool = createTool({
  state,
  label: 'Two travelling sine waves on the same string. Top: wave 1 in blue and wave 2 in coral, which you shift by a phase difference. Bottom: their sum in green, with a dashed envelope showing its amplitude. At zero phase difference the sum is twice as tall; at half a turn it flattens.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 8], y: [-1.7, 1.7], c, pad: 22, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.46 }) }),
    low: createPlot(stage, { x: [0, 8], y: [-2.7, 2.7], c, pad: 22, box: (g) => ({ x: 0, y: g.h * 0.46, w: g.w, h: g.h * 0.54 }) }),
  }),
  draw(ctx, stage, c, { top, low }) {
    top.axes({ xLabel: 'x (m)', yLabel: 'two waves' });
    top.fn(y1, { color: c.b });
    top.fn(y2, { color: c.a });
    low.axes({ xLabel: 'x (m)', yLabel: 'their sum' });
    low.fn(() => R(), { color: c.grid, width: 2, dash: [5, 5] });
    low.fn(() => -R(), { color: c.grid, width: 2, dash: [5, 5] });
    low.fn((x) => y1(x) + y2(x), { color: c.c, width: 4 });
  },
  controls: [
    { title: 'Slide one wave against the other' },
    { key: 'phi', label: 'Phase difference, φ', min: 0, max: TAU, step: Math.PI / 24, format: (n) => `${piFrac(n) ?? fixed(n, 2)} rad` },
    { row: [
      { button: 'φ = 0', ghost: true, onClick: setPhi(0) },
      { button: 'φ = π', ghost: true, onClick: setPhi(Math.PI) },
      { button: 'φ = 2π', ghost: true, onClick: setPhi(TAU) },
    ] },
    { key: 'A2', label: 'Height of wave 2', min: 0.25, max: 1.5, step: 0.25, format: (n) => fixed(n, 2) },
    transport(clock),
    { readout: [
      ['Path difference, Δx', (s) => `${fixed(pathDifference(s.phi, LAMBDA), 2)} m (λ = ${LAMBDA} m)`],
      ['Height of the sum', () => fixed(R(), 2)],
      ['Compared with wave 1 + wave 2', () => `${fixed((R() / (A1 + state.A2)) * 100, 0)} %`],
      ['This is', () => verdict()],
    ] },
  ],
  tex: (s) => `A = \\sqrt{${fixed(A1, 2)}^2 + ${fixed(s.A2, 2)}^2 + 2(${fixed(A1, 2)})(${fixed(s.A2, 2)})\\cos(${phiText().replace('π', '\\pi')})} = ${fixed(R(), 2)}`,
});

clock.step(1.5);
