import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { createGas, drawGas } from './_gas.js';
import { fixed } from '../../lib/format.js';

const state = { N: 40, T: 1 };
const FAST = 4;
let gas = createGas({ masses: Array(state.N).fill(1), T: state.T });
let last = 0;
const clock = createClock(document.querySelector('#stage'), {
  onFrame: (st) => {
    const dt = st.t - last;
    last = st.t;
    if (dt < 0) return;
    gas.step(dt * FAST);
    tool.update();
  },
});
const theory = () => (gas.N * gas.m[0] * gas.v2()) / (3 * gas.vol());

const tool = createTool({
  state,
  label: 'Molecules bounce around a box. The right-hand wall collects the push of every hit. The measured pressure on that wall is compared with one third of the molecule density times mass times the mean square speed. With a single molecule you can follow one bounce at a time.',
  draw(ctx, stage, c) {
    drawGas(ctx, stage, c, gas);
  },
  controls: () => [
    { title: 'Fill the box' },
    { key: 'N', label: 'Molecules N', min: 1, max: 80, step: 1 },
    { key: 'T', label: 'Temperature T', min: 0.25, max: 3, step: 0.25, format: (v) => fixed(v, 2) },
    transport(clock),
    { readout: [
      ['Wall hits per s', () => fixed(gas.rate, 1)],
      ['Push per hit 2m·vₓ', () => `${fixed(gas.hits ? gas.impulse / gas.hits : 2 * gas.m[0] * Math.sqrt(gas.v2() / 3), 2)}`],
      ['P measured', () => fixed(gas.P, 3)],
      ['P = ⅓ n m ⟨v²⟩', () => fixed(theory(), 3)],
    ] },
  ],
  tex: () => `P=\\dfrac{1}{3}\\,\\dfrac{N}{V}\\,m\\langle v^{2}\\rangle=\\dfrac{1}{3}\\times\\dfrac{${gas.N}}{${fixed(gas.vol(), 0)}}\\times ${fixed(gas.m[0], 0)}\\times ${fixed(gas.v2(), 2)}=${fixed(theory(), 3)}`,
  onChange(s) {
    if (s.N !== gas.N) gas = createGas({ masses: Array(s.N).fill(1), T: s.T, W: gas.W });
    else if (s.T !== gas.T) gas.setT(s.T);
  },
});
clock.play();
