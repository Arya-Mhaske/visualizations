import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { line, label } from '../../lib/draw.js';
import { createGas, drawGas } from './_gas.js';
import { fixed } from '../../lib/format.js';

const state = { T: 1, m: 1 };
const FAST = 4;
const gas = createGas({ masses: Array(40).fill(1), T: 1 });
let last = 0;
const clock = createClock(document.querySelector('#stage'), {
  onFrame: (st) => {
    const dt = st.t - last;
    last = st.t;
    if (dt >= 0) gas.step(dt * FAST);
    tool.update();
  },
});

const tool = createTool({
  state,
  label: 'Molecules bouncing in a box, and below them a bar for the kinetic energy of each molecule. A dashed line marks three halves kT and a solid line marks the mean of the bars. The two lines agree at every temperature and for every mass.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    drawGas(ctx, stage, c, gas, { area: { x: 0, y: 0, w: W, h: H * 0.58 } });
    const kes = gas.kes();
    const base = H * 0.96;
    const top = H * 0.64;
    const unit = (base - top) / (4.5 * 3);
    const bw = (W - 24) / kes.length;
    kes.forEach((e, i) => {
      ctx.fillStyle = c.fillA;
      ctx.fillRect(12 + i * bw + 1, base - Math.min(e, 13) * unit, bw - 2, Math.min(e, 13) * unit);
    });
    line(ctx, 12, base - 1.5 * state.T * unit, W - 12, base - 1.5 * state.T * unit, { color: c.ink, width: 2, dash: [6, 5] });
    line(ctx, 12, base - gas.ke() * unit, W - 12, base - gas.ke() * unit, { color: c.b, width: 3 });
    label(ctx, 'each molecule ½mv²', W * 0.3, top - 6, c, { size: 11, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Heat the gas' },
    { key: 'T', label: 'Temperature T', min: 0.25, max: 3, step: 0.25, format: (v) => fixed(v, 2) },
    { key: 'm', label: 'Molecule mass m', min: 1, max: 4, step: 1 },
    transport(clock),
    { readout: [
      ['Mean ½m⟨v²⟩', () => fixed(gas.ke(), 3)],
      ['(3/2) k T', () => fixed(1.5 * state.T, 3)],
      ['Mean speed²', () => fixed(gas.v2(), 2)],
    ] },
  ],
  tex: () => `\\tfrac12 m\\langle v^{2}\\rangle=${fixed(gas.ke(), 3)}\\ \\approx\\ \\tfrac32 kT=${fixed(1.5 * state.T, 3)}`,
  onChange(s) {
    if (s.T !== gas.T) gas.setT(s.T);
    if (s.m !== gas.m[0]) gas.setM(s.m);
  },
});
clock.play();
