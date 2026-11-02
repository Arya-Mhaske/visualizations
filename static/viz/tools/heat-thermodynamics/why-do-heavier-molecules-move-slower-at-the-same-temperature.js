import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { createGas, drawGas } from './_gas.js';
import { GASES, vrms } from './_kt.js';
import { fixed } from '../../lib/format.js';

// Half H₂ (mass 2.016) and half O₂ (31.998), as relative masses 1 and 15.87. Reduced temperature T/300.
const MH = GASES.H2.M;
const MO = GASES.O2.M;
const state = { T: 300 };
const FAST = 3;
const masses = [...Array(20).fill(1), ...Array(20).fill(MO / MH)];
const gas = createGas({ masses, T: 1 });
let last = 0;
const clock = createClock(document.querySelector('#stage'), {
  onFrame: (st) => {
    const dt = st.t - last;
    last = st.t;
    if (dt >= 0) gas.step(dt * FAST);
    tool.update();
  },
});
const rmsOf = (lo, hi) => {
  let s = 0;
  for (let i = lo; i < hi; i++) s += gas.vx[i] ** 2 + gas.vy[i] ** 2 + gas.vz[i] ** 2;
  return Math.sqrt(s / (hi - lo));
};

const tool = createTool({
  state,
  label: 'A box with small light hydrogen molecules and bigger heavy oxygen molecules at the same temperature. The light molecules rush about and the heavy ones move slowly. Readouts compare the measured speeds with the formula.',
  draw(ctx, stage, c) {
    drawGas(ctx, stage, c, gas, { colourOf: (i) => (i < 20 ? c.a : c.b) });
  },
  controls: () => [
    { title: 'Mix two gases' },
    { key: 'T', label: 'Temperature (K)', min: 100, max: 600, step: 50 },
    transport(clock),
    { readout: [
      ['H₂ rms speed', (s) => `${fixed(vrms(MH, s.T), 0)} m/s`],
      ['O₂ rms speed', (s) => `${fixed(vrms(MO, s.T), 0)} m/s`],
      ['Ratio H₂ ÷ O₂', (s) => `${fixed(Math.sqrt(MO / MH), 2)} (formula), ${fixed(rmsOf(0, 20) / rmsOf(20, 40), 2)} (box)`],
    ] },
  ],
  tex: (s) => `v_{rms}=\\sqrt{\\dfrac{3kT}{m}}\\ \\Rightarrow\\ \\dfrac{v_{H_2}}{v_{O_2}}=\\sqrt{\\dfrac{m_{O_2}}{m_{H_2}}}=\\sqrt{\\dfrac{${fixed(MO, 3)}}{${fixed(MH, 3)}}}=${fixed(Math.sqrt(MO / MH), 2)}`,
  onChange(s) { gas.setT(s.T / 300); },
});
gas.setT(state.T / 300);
clock.play();
