import { createTool } from '../../lib/tool.js';
import { createBench } from '../../lib/rays.js';
import { arc, arrow, dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { parallelForce, wireFieldAt } from './_sources-of-magnetic-field-math.js';

// The wires run perpendicular to the page (z); a positive current comes out of the page. Centimetres on the stage, metres in the maths.
const state = { I1: 5, I2: 5, d: 4, opposite: false };
const m = (cm) => cm / 100;
const wires = (s = state) => [
  { x: -m(s.d) / 2, y: 0, I: s.I1 },
  { x: m(s.d) / 2, y: 0, I: s.opposite ? -s.I2 : s.I2 },
];
// The field of the other wire at this wire, and the force on one metre of this wire: F = I (z-hat × B).
function onWire(s, i) {
  const [self, other] = i === 0 ? wires(s) : [wires(s)[1], wires(s)[0]];
  const [bx, by] = wireFieldAt([other], [self.x, self.y]);
  return { B: [bx, by], F: [-self.I * by, self.I * bx] };
}
const RING = (s) => Math.min(8, Math.max(2.2, s.d * 0.9));
const micro = (t) => `${sig(t * 1e6, 3)} µT`;
const verdict = (s, i) => {
  const f = onWire(s, i).F[0];
  const toward = i === 0 ? f > 0 : f < 0;
  return toward ? 'Pulled towards' : 'Pushed away from';
};

function symbol(ctx, x, y, out, c, r = 13) {
  dot(ctx, x, y, r, out ? c.fillA : c.fillB, c.ink);
  if (out) dot(ctx, x, y, 3.5, c.ink);
  else {
    line(ctx, x - 6, y - 6, x + 6, y + 6, { color: c.ink, width: 3 });
    line(ctx, x - 6, y + 6, x + 6, y - 6, { color: c.ink, width: 3 });
  }
}

const tool = createTool({
  state,
  label: 'Two long parallel wires seen end on, with currents out of or into the page. Rings show the field each wire makes. A purple arrow shows the field of one wire at the other, and a coral arrow shows the resulting push on that wire. Same-direction currents pull together and opposite ones push apart.',
  setup: (stage, c) => createBench(stage, { x: [-10, 10], cy: 0.5, c }),
  draw(ctx, stage, c, bench) {
    const unit = bench.toPx(1, 0)[0] - bench.toPx(0, 0)[0];
    wires().forEach((w, i) => {
      const [x, y] = bench.toPx(w.x * 100, 0);
      for (const k of [0.45, 0.8]) {
        const r = RING(state) * k * unit;
        arc(ctx, x, y, r, 0, 6.2832, { color: c.grid, width: 2 });
        const dir = w.I > 0 ? 1 : -1; // anticlockwise on the page when the current is out of it
        const t = 0.9 + i * 2.2;
        const [px, py] = [x + r * Math.cos(t), y - r * Math.sin(t)];
        arrow(ctx, px + dir * Math.sin(t) * 6, py + dir * Math.cos(t) * 6, px - dir * Math.sin(t) * 6, py - dir * Math.cos(t) * 6, { color: c.grid, width: 2, head: 8 });
      }
    });
    const REF = parallelForce(5, 5, 0.04);
    wires().forEach((w, i) => {
      const [x, y] = bench.toPx(w.x * 100, 0);
      const { B, F } = onWire(state, i);
      const bSize = Math.hypot(...B);
      const scaleB = Math.min(70, (bSize / Math.hypot(...onWire({ ...state, I1: 5, I2: 5, d: 4 }, 0).B)) * 36);
      arrow(ctx, x, y - 34, x + (B[0] / bSize) * 0, y - 34 - (B[1] / bSize) * scaleB, { color: c.d, width: 3, head: 10 });
      const fx = Math.min(80, (Math.hypot(...F) / REF) * 40);
      const dir = Math.sign(F[0]);
      arrow(ctx, x, y + 34, x + dir * fx, y + 34, { color: c.a, width: 5, head: 12 });
    });
    wires().forEach((w) => symbol(ctx, ...bench.toPx(w.x * 100, 0), w.I > 0, c));
    label(ctx, 'Purple: field of the other wire', 6, 12, c, { size: 11, align: 'left', color: c.d, bounds: stage, patch: false });
    label(ctx, 'Coral: push on one metre of this wire', 6, stage.h - 12, c, { size: 11, align: 'left', color: c.a, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Two wires' },
    { key: 'I1', label: 'Left current, I₁', min: 1, max: 10, format: (n) => `${n} A` },
    { key: 'I2', label: 'Right current, I₂', min: 1, max: 10, format: (n) => `${n} A` },
    { key: 'd', label: 'Gap, d', min: 2, max: 12, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'opposite', label: 'Right current the other way', toggle: true },
    { button: 'Set both to 1 A', onClick: () => { state.I1 = 1; state.I2 = 1; state.opposite = false; tool.update(); }, ghost: true },
    { readout: [
      ['Field of left wire, at right', (s) => micro(Math.hypot(...onWire(s, 1).B))],
      ['Left wire is', (s) => verdict(s, 0)],
      ['Right wire is', (s) => verdict(s, 1)],
      ['Push per metre', (s) => `${sig(Math.hypot(...onWire(s, 1).F) * 1e6, 3)} µN/m`],
      ['Same wires, 1 m apart', (s) => `${sig(parallelForce(s.I1, s.I2, 1) * 1e7, 3)} ×10⁻⁷ N/m`],
    ] },
  ],
  tex: (s) => `\\dfrac{F}{L}=\\dfrac{\\mu_0 I_1 I_2}{2\\pi d}=\\dfrac{(4\\pi\\times 10^{-7})(${s.I1})(${s.I2})}{2\\pi\\,(${fixed(m(s.d), 3)})}=${sig(parallelForce(s.I1, s.I2, m(s.d)) * 1e6, 3)}\\ \\mu\\text{N/m}`,
});

tool.update();
