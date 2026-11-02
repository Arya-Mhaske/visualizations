import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { createGas, drawGas } from './_gas.js';
import { fixed } from '../../lib/format.js';

const state = { N: 30, T: 1, W: 8 };
const FAST = 4;
let gas = createGas({ masses: Array(state.N).fill(1), T: state.T, W: state.W });
let last = 0;
const clock = createClock(document.querySelector('#stage'), {
  onFrame: (st) => {
    const dt = st.t - last;
    last = st.t;
    if (dt >= 0) gas.step(dt * FAST);
    tool.update();
  },
});
const ideal = () => (gas.N * gas.T) / gas.vol();

const tool = createTool({
  state,
  label: 'A box of molecules with a movable right wall. Change the number of molecules, the temperature and the volume. The pressure measured on the wall is compared with N k T over V.',
  draw(ctx, stage, c) {
    drawGas(ctx, stage, c, gas);
  },
  controls: () => [
    { title: 'Set up the gas' },
    { key: 'N', label: 'Molecules N', min: 10, max: 60, step: 10 },
    { key: 'T', label: 'Temperature T', min: 0.5, max: 3, step: 0.25, format: (v) => fixed(v, 2) },
    { key: 'W', label: 'Box length (volume)', min: 4, max: 12, step: 1 },
    transport(clock),
    { readout: [
      ['P measured', () => fixed(gas.P, 3)],
      ['P = N k T / V', () => fixed(ideal(), 3)],
      ['P × V', () => fixed(gas.P * gas.vol(), 1)],
      ['N k T', () => fixed(gas.N * gas.T, 1)],
    ] },
  ],
  tex: () => `PV=NkT:\\quad ${fixed(gas.P, 3)}\\times ${fixed(gas.vol(), 0)}=${fixed(gas.P * gas.vol(), 1)}\\ \\approx\\ ${gas.N}\\times ${fixed(gas.T, 2)}=${fixed(gas.N * gas.T, 1)}`,
  onChange(s) {
    if (s.N !== gas.N) gas = createGas({ masses: Array(s.N).fill(1), T: s.T, W: s.W });
    if (s.T !== gas.T) gas.setT(s.T);
    if (s.W !== gas.W) gas.setW(s.W);
  },
});
clock.play();
