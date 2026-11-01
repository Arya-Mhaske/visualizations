import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { arc, arrow, label, line, TAU } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { phaseWords, ringScale, seriesCircuit } from './_ac-basics-math.js';

const RAD = Math.PI / 180;
const SPAN = 720;
const state = { step: 5, onR: true, onL: true, onC: true, R: 30, Lm: 200, CuF: 100, f: 50, im: 1, t: 0 };
const time = createTimeline(document.querySelector('#stage'), state, { cycle: () => 360, update: () => tool.update() });
time.clock.speed = 45;

const STEPS = ['', '1 Current', '2 Resistor', '3 Inductor', '4 Capacitor', '5 Join up'];
const circuit = (s = state) => seriesCircuit({
  on: { R: s.onR, L: s.onL, C: s.onC }, R: s.R, L: s.Lm / 1000, C: s.CuF * 1e-6, f: s.f, im: s.im,
});

function caption(s, k) {
  if (!s.onR && !s.onL && !s.onC) return 'Switch on at least one part';
  if (k === 1) return 'Draw I first: all parts share it';
  if (k === 2) return s.onR ? 'VR: in step with I' : 'No resistor: nothing to add';
  if (k === 3) return s.onL ? 'VL: a quarter turn ahead of I' : 'No inductor: nothing to add';
  if (k === 4) return s.onC ? 'VC: a quarter turn behind I' : 'No capacitor: nothing to add';
  return 'Tail to last tip: that is V';
}

// The ring covers the whole finished path, so the scale doesn't jump between build steps.
function reach() {
  const { VR, VL, VC, V } = circuit();
  return Math.max(V, VR, Math.hypot(VR, VL), Math.hypot(VR, VL - VC));
}

function drawDiagram(ctx, stage, c) {
  const k = state.step;
  const cut = stage.h * 0.62;
  const ring = Math.min(stage.w, cut) * 0.4;
  const cx = stage.w / 2;
  const cy = cut * 0.54;
  const full = ringScale(reach());
  const unit = ring / full;
  const turn = state.t * RAD;
  const on = circuit();
  const toPx = (x, y) => [cx + (x * Math.cos(turn) - y * Math.sin(turn)) * unit, cy - (x * Math.sin(turn) + y * Math.cos(turn)) * unit];
  arc(ctx, cx, cy, ring, 0, TAU, { color: c.grid, width: 2 });
  label(ctx, `ring: ${sig(full, 3)} V`, stage.w - 6, 30, c, { size: 11, align: 'right', bounds: stage });
  label(ctx, `Step ${STEPS[k]}`, 6, 12, c, { size: 12, align: 'left', bounds: stage });
  label(ctx, caption(state, k), 6, 30, c, { size: 11, align: 'left', bounds: stage });

  if (!state.onR && !state.onL && !state.onC) return;
  const iTip = [cx + ring * 1.08 * Math.cos(turn), cy - ring * 1.08 * Math.sin(turn)];
  arrow(ctx, cx, cy, ...iTip, { color: c.b, width: 2 });
  label(ctx, 'I', iTip[0] + 9 * Math.cos(turn), iTip[1] - 9 * Math.sin(turn), c, { size: 12, color: c.b, bounds: stage });

  // A shift in px along the diagram's own axes, so the labels turn with the arrows.
  const shift = ([x, y], [dx, dy]) => [x + dx * Math.cos(turn) - dy * Math.sin(turn), y - dx * Math.sin(turn) - dy * Math.cos(turn)];
  // `along` puts the label that far along the arrow, 0 at its tail and 1 at its tip, before the `away` shift.
  const add = (from, to, side, along, away, color, name, value) => {
    const [a, b] = [shift(toPx(...from), [side, 0]), shift(toPx(...to), [side, 0])];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1) return;
    arrow(ctx, ...a, ...b, { color, width: 4 });
    label(ctx, `${name} ${sig(value, 3)}`, ...shift([a[0] + (b[0] - a[0]) * along, a[1] + (b[1] - a[1]) * along], away), c, { size: 11, color, bounds: stage });
  };
  const A = [on.VR, 0];
  const B = [on.VR, on.VL];
  const D = [on.VR, on.VL - on.VC];
  if (k >= 2) add([0, 0], A, 0, 0.5, [0, -14], c.a, 'VR', on.VR);
  if (k >= 3) add(A, B, -7, 1, [0, 14], c.a, 'VL', on.VL);
  if (k >= 4) add(B, D, 7, 0.5, [36, 0], c.d, 'VC', on.VC);
  if (k >= 5) {
    const tip = toPx(...D);
    if (on.V > 0) arrow(ctx, cx, cy, ...tip, { color: c.c, width: 5 });
    label(ctx, `V ${sig(on.V, 3)}`, cx + (tip[0] - cx) * 0.5 - 30 * Math.cos(turn), cy + (tip[1] - cy) * 0.5 + 30 * Math.sin(turn), c, { size: 12, color: c.c, bounds: stage });
  }
}

const tool = createTool({
  state,
  label: 'A phasor diagram for a series circuit. The shared current arrow is drawn first, then the voltage across each part tip to tail: the resistor along the current, the inductor a quarter turn ahead, the capacitor a quarter turn behind. A green arrow joins them into the source voltage. Below, the current and source voltage are plotted against time.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, (SPAN * Math.PI) / 180], y: [-1.3, 1.3], ticks: 'pi', c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.62, w: g.w, h: g.h * 0.38 }),
  }),
  draw(ctx, stage, c, plot) {
    drawDiagram(ctx, stage, c);
    line(ctx, 0, stage.h * 0.62, stage.w, stage.h * 0.62, { color: c.ink, width: 2 });
    plot.axes({ xLabel: 'ωt', yLabel: '' });
    label(ctx, 'blue i, green v (fractions of peak)', stage.w - 6, stage.h * 0.62 + 11, c, { size: 11, align: 'right', bounds: stage });
    const on = circuit();
    if (state.onR || state.onL || state.onC) plot.fn((p) => Math.sin(p), { color: c.b });
    if (on.phi !== null && state.step === 5) plot.fn((p) => Math.sin(p - on.phi), { color: c.c });
    const p = state.t * RAD;
    plot.segment(p, -1.3, p, 1.3, { color: c.ink, width: 1, dash: [3, 4] });
  },
  controls: () => [
    { title: 'A series circuit' },
    { key: 'step', label: 'Build step', min: 1, max: 5, step: 1, format: (n) => STEPS[n] },
    { row: [
      { key: 'onR', label: 'R', toggle: true },
      { key: 'onL', label: 'L', toggle: true },
      { key: 'onC', label: 'C', toggle: true },
    ] },
    { key: 'R', label: 'Resistance, R', min: 10, max: 100, step: 5, format: (n) => `${n} Ω` },
    { key: 'Lm', label: 'Inductance, L', min: 50, max: 500, step: 10, format: (n) => `${fixed(n / 1000, 2)} H` },
    { key: 'CuF', label: 'Capacitance, C', min: 10, max: 200, step: 5, format: (n) => `${n} µF` },
    { key: 'f', label: 'Frequency, f', min: 10, max: 200, step: 5, format: (n) => `${n} Hz` },
    { key: 'im', label: 'Peak current, i_m', min: 0.5, max: 2, step: 0.1, format: (n) => `${fixed(n, 1)} A` },
    { key: 't', label: 'Turn the diagram, ωt', min: 0, max: 360, step: 5, format: (n) => `${fixed(n, 0)}°` },
    transport(time.clock),
    { readout: [
      ['X_L', () => `${sig(circuit().XL, 3)} Ω`],
      ['X_C', () => `${sig(circuit().XC, 3)} Ω`],
      ['VR, peak', () => `${sig(circuit().VR, 3)} V`],
      ['VL, peak', () => `${sig(circuit().VL, 3)} V`],
      ['VC, peak', () => `${sig(circuit().VC, 3)} V`],
      ['V, peak', () => `${sig(circuit().V, 3)} V`],
      ['Z = V/i_m', () => `${sig(circuit().Z, 3)} Ω`],
      ['Phase', () => phaseWords(circuit().phi)],
    ] },
  ],
  tex: () => {
    const { R, XL, XC, Z } = circuit();
    return `Z=\\sqrt{${sig(R, 3)}^2+(${sig(XC, 3)}-${sig(XL, 3)})^2}=${sig(Z, 3)}\\ \\Omega`;
  },
  onChange: () => time.sync(),
});

time.sync();
tool.update();
