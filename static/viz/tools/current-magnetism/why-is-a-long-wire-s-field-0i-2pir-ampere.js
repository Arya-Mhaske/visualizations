import { createTool } from '../../lib/tool.js';
import { createBench } from '../../lib/rays.js';
import { handles } from '../../lib/stage.js';
import { arc, arrow, dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { MU0, circulation, enclosed, longWire, wireFieldAt } from './_sources-of-magnetic-field-math.js';

// Centimetres on the stage, metres in the maths. The page has x right, y up, and current out of the page is positive.
const state = { r: 4, I: 10, phi: 360, second: false };
const A_WIRE = 1; // cm, the thick wire's radius
const D2 = 6.25; // cm, where the return wire sits
const PHI = (s = state) => (s.phi * Math.PI) / 180;
const wires = (s = state) => [{ x: 0, y: 0, I: s.I, a: A_WIRE / 100 }, ...(s.second ? [{ x: D2 / 100, y: 0, I: -s.I, a: 0 }] : [])];
const path = (s, t) => [(s.r / 100) * Math.cos(t), (s.r / 100) * Math.sin(t)];
const tangent = (s, t) => { const [bx, by] = wireFieldAt(wires(s), path(s, t)); return -bx * Math.sin(t) + by * Math.cos(t); };
const micro = (t) => `${sig(t * 1e6, 3)} µT`;
const walked = (s = state) => circulation(wires(s), s.r / 100, PHI(s));
const whole = (s = state) => circulation(wires(s), s.r / 100);
const inside = (s = state) => enclosed(wires(s), s.r / 100);
const REF = longWire(10, 0.04);

const tool = createTool({
  state,
  label: 'A long wire carries current out of the page, shown as a dot in the middle. A circle of adjustable radius surrounds it, with small arrows along it showing how much of the field lies along the circle. A marker walks round the circle and a bar adds up the field times each step of the walk.',
  setup: (stage, c) => createBench(stage, { x: [-12, 12], cy: 0.5, c }),
  draw(ctx, stage, c, bench) {
    const [ox, oy] = bench.toPx(0, 0);
    const unit = bench.toPx(1, 0)[0] - ox;
    const R = state.r * unit;
    for (const rr of [2, 4, 6, 8, 10]) arc(ctx, ox, oy, rr * unit, 0, 6.2832, { color: c.grid, width: 1 });
    arc(ctx, ox, oy, R, 0, 6.2832, { color: c.ink, width: 2, dash: [6, 4] });
    arc(ctx, ox, oy, R, 0, -PHI(), { color: c.a, width: 6 });
    dot(ctx, ox, oy, A_WIRE * unit, c.fillA, c.ink);
    dot(ctx, ox, oy, 3.5, c.ink);
    if (state.second) {
      const [wx, wy] = bench.toPx(D2, 0);
      dot(ctx, wx, wy, A_WIRE * unit * 0.6, c.fillB, c.ink);
      line(ctx, wx - 5, wy - 5, wx + 5, wy + 5, { color: c.ink, width: 3 });
      line(ctx, wx - 5, wy + 5, wx + 5, wy - 5, { color: c.ink, width: 3 });
    }
    for (let i = 0; i < 16; i++) {
      const t = (i + 0.5) * (Math.PI / 8);
      const b = tangent(state, t);
      const len = Math.max(-34, Math.min(34, (b / REF) * 22));
      const [px, py] = [ox + R * Math.cos(t), oy - R * Math.sin(t)];
      const [tx, ty] = [-Math.sin(t), -Math.cos(t)];
      if (Math.abs(len) > 2) arrow(ctx, px, py, px + tx * len, py + ty * len, { color: len > 0 ? c.a : c.b, width: 3, head: 9 });
    }
    const [wx, wy] = [ox + R * Math.cos(PHI()), oy - R * Math.sin(PHI())];
    dot(ctx, wx, wy, 8, c.c, c.ink);
    const full = Math.max(MU0 * state.I, 1e-12);
    const barW = stage.w * 0.4;
    const zero = stage.w * 0.5;
    line(ctx, zero, 20, zero + (barW * Math.max(-1.2, Math.min(1.2, walked() / full))), 20, { color: c.c, width: 10 });
    line(ctx, zero, 10, zero, 30, { color: c.ink, width: 3 });
    line(ctx, zero + barW, 12, zero + barW, 28, { color: c.ink, width: 2, dash: [3, 3] });
    label(ctx, '0', zero, 40, c, { size: 11, patch: false });
    label(ctx, 'μ₀I', zero + barW, 40, c, { size: 11, patch: false, bounds: stage });
    label(ctx, '∮ B·dl so far', 8, 20, c, { size: 11, align: 'left', patch: false });
  },
  controls: () => [
    { title: 'Walk round the wire' },
    { key: 'phi', label: 'How far round', min: 0, max: 360, step: 5, format: (n) => `${n}°` },
    { key: 'r', label: 'Circle radius, r', min: 0.5, max: 10, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'I', label: 'Current, I', min: 1, max: 20, format: (n) => `${n} A` },
    { key: 'second', label: 'Add a return wire (opposite current)', toggle: true },
    { text: 'The wire is 1 cm in radius. Drag the green marker, or press an arrow key.' },
    { readout: [
      ['Field along the path', (s) => micro(tangent(s, PHI(s)))],
      ['Added so far', (s) => `${sig(walked(s) * 1e6, 3)} µT m`],
      ['Current inside', (s) => `${fixed(inside(s), 1)} A`],
      ['Round trip, ∮ B·dl', (s) => `${sig(whole(s) * 1e6, 3)} µT m`],
      ['μ₀ × current inside', (s) => `${sig(MU0 * inside(s) * 1e6, 3)} µT m`],
    ] },
  ],
  tex: (s) => {
    const around = whole(s) * 1e6;
    if (!s.second) return `B\\times 2\\pi r=${sig(Math.abs(tangent(s, 0)) * 1e6, 3)}\\times ${fixed(2 * Math.PI * s.r / 100, 3)}=${sig(around, 3)}\\ \\mu\\text{T m}=\\mu_0 I_{enc}`;
    return `\\oint \\vec B\\cdot d\\vec l=${sig(around, 3)}\\ \\mu\\text{T m}=\\mu_0 I_{enc}=\\mu_0(${fixed(inside(s), 1)}\\ \\text{A})`;
  },
});

const bench = tool.extra;
handles(tool.stage, [{
  at: () => bench.toPx(state.r * Math.cos(PHI()), state.r * Math.sin(PHI())),
  move(px, py) {
    const [wx, wy] = bench.toWorld(px, py);
    state.phi = Math.round(((Math.atan2(wy, wx) * 180) / Math.PI + 360) % 360 / 5) * 5;
  },
  nudge(direction) { state.phi = Math.max(0, Math.min(360, state.phi + 5 * direction)); },
}], { onChange: () => tool.update(), radius: 30 });
tool.update();
