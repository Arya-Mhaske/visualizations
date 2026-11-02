import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { createRng } from '../../lib/rng.js';
import { line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// 120 molecules. Each has 3 translation slots, rotation slots and vibration slots, holding a share of energy (each slot is a quadratic term).
// At the start all energy is in translation (3 units per molecule). A collision shuffles energy between two random slots in a random split.
const TYPES = { mono: [3, 0, 0], di: [3, 2, 0], hot: [3, 2, 2] };
const state = { type: 'di' };
const NM = 120;
let rng;
let slots;
const GROUPS = ['translation', 'rotation', 'vibration'];
function build() {
  rng = createRng(11);
  const [t, r, v] = TYPES[state.type];
  slots = [];
  for (let i = 0; i < NM; i++) for (let k = 0; k < t + r + v; k++) slots.push({ g: k < t ? 0 : k < t + r ? 1 : 2, e: k < t ? 1 : 0, m: i });
}
build();
function collide(n) {
  for (let k = 0; k < n; k++) {
    const a = slots[Math.floor(rng.next() * slots.length)];
    const b = slots[Math.floor(rng.next() * slots.length)];
    if (a === b) continue;
    const tot = a.e + b.e;
    a.e = rng.next() * tot;
    b.e = tot - a.e;
  }
}
const mean = (g) => {
  const list = slots.filter((s) => s.g === g);
  return list.length ? list.reduce((p, s) => p + s.e, 0) / list.length : null;
};
let last = 0;
const clock = createClock(document.querySelector('#stage'), {
  onFrame: (st) => {
    if (st.t < last) build();
    collide(Math.round((st.t - last) * 2500));
    last = st.t;
    tool.update();
  },
});

const tool = createTool({
  state,
  label: 'Bars showing the average energy in each kind of motion: translation, rotation and vibration, for a gas where at first all the energy is in translation. As the molecules collide, the bars level out until every degree of freedom holds the same average energy.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const base = H * 0.82;
    const unit = (H * 0.6) / 1.2;
    const total = slots.reduce((p, s) => p + s.e, 0) / slots.length;
    const f = slots.length / NM;
    const cols = [c.fillA, c.fillB, c.fillC];
    line(ctx, W * 0.08, base, W * 0.96, base, { color: c.ink, width: 3 });
    GROUPS.forEach((name, g) => {
      const m = mean(g);
      const x = W * (0.14 + 0.28 * g);
      if (m === null) { label(ctx, `no ${name}`, x + 30, base - 20, c, { size: 11, bounds: stage, patch: false }); return; }
      ctx.fillStyle = cols[g];
      ctx.fillRect(x, base - m * unit, 60, m * unit);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, base - m * unit, 60, m * unit);
      label(ctx, fixed(m, 2), x + 30, base - m * unit - 10, c, { size: 11, bounds: stage, patch: false });
      label(ctx, name, x + 30, base + 14, c, { size: 11, bounds: stage, patch: false });
    });
    line(ctx, W * 0.08, base - (total / f) * unit, W * 0.96, base - (total / f) * unit, { color: c.ink, width: 2, dash: [6, 5] });
    label(ctx, `equal share ${fixed(total / f, 2)}`, W * 0.9, base - (total / f) * unit - 8, c, { size: 11, align: 'right', bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Share energy by collisions' },
    { key: 'type', label: 'Molecule', options: [['mono', 'Single atom'], ['di', 'Diatomic'], ['hot', 'Diatomic, vibrating']] },
    transport(clock),
    { readout: [
      ['Slots per molecule', () => `${slots.length / NM}`],
      ['Energy per molecule', () => fixed(slots.reduce((p, s) => p + s.e, 0) / NM, 2)],
      ['Target per slot', () => fixed(3 / (slots.length / NM), 3)],
    ] },
  ],
  onChange() { build(); last = 0; clock.reset(); clock.play(); },
  tex: () => `\\langle E\\rangle=\\dfrac{f}{2}kT,\\quad \\text{each slot}=\\dfrac12 kT`,
});
clock.play();
