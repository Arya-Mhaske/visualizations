import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import {
  TAU, chargeSwing, crossoverFreq, humpArea, peakCurrentC, peakCurrentL, period, reactanceC, reactanceL,
} from './_ac-basics-math.js';

const SPAN = 40; // ms
const I_MAX = 0.35; // A: the top of both current plots, just above the largest current the sliders allow
const X_MAX = 650; // Ω: just above the largest reactance the sliders allow
const state = { f: 50, Lm: 200, CuF: 25, vm: 10 };

const L = (s = state) => s.Lm / 1000;
const C = (s = state) => s.CuF * 1e-6;
const halfMs = (s = state) => (period(s.f) * 1000) / 2;
const phase = (ms, s = state) => (TAU * s.f * ms) / 1000;
const vHeight = (s = state) => (s.vm / 10) * 0.3; // v keeps one height on screen; its scale is not the amps axis

const panel = (top, share) => (g) => ({ x: 0, y: g.h * top, w: g.w, h: g.h * share });

function title(ctx, stage, text, y, c) {
  label(ctx, text, stage.w - 6, y, c, { size: 11, align: 'right', bounds: stage });
}

const tool = createTool({
  state,
  label: 'Three graphs against frequency. Top: an inductor, where each hump of voltage gets narrower as frequency rises, so the current it builds gets smaller. Middle: a capacitor, where each hump of current must carry the same charge, so it gets taller as it gets narrower. Bottom: X_L rising and X_C falling.',
  setup: (stage, c) => ({
    coil: createPlot(stage, { x: [0, SPAN], y: [-I_MAX, I_MAX], c, pad: 22, box: panel(0, 0.33) }),
    plate: createPlot(stage, { x: [0, SPAN], y: [-I_MAX, I_MAX], c, pad: 22, box: panel(0.33, 0.33) }),
    sweep: createPlot(stage, { x: [0, 200], y: [0, X_MAX], c, pad: 22, box: panel(0.66, 0.34) }),
  }),
  draw(ctx, stage, c, { coil, plate, sweep }) {
    const half = halfMs();
    const iL = peakCurrentL(state.vm, state.f, L());
    const iC = peakCurrentC(state.vm, state.f, C());

    const push = (t) => vHeight() * Math.sin(phase(t));
    coil.shade((t) => Math.max(push(t), 0), null, 0, half, c.fillA);
    coil.axes({ xLabel: 't (ms)', yLabel: 'i (A)' });
    coil.fn(push, { color: c.a, width: 2 });
    coil.fn((t) => -iL * Math.cos(phase(t)), { color: c.b });
    title(ctx, stage, 'L: shorter push, less i', 11, c);

    const flow = (t) => iC * Math.sin(phase(t));
    plate.shade((t) => Math.max(flow(t), 0), null, 0, half, c.fillB);
    plate.axes({ xLabel: 't (ms)', yLabel: 'i (A)' });
    plate.fn((t) => -vHeight() * Math.cos(phase(t)), { color: c.a, width: 2 });
    plate.fn(flow, { color: c.b });
    title(ctx, stage, 'C: same charge, less time', stage.h * 0.33 + 11, c);

    sweep.axes({ xLabel: 'f (Hz)', yLabel: 'X (Ω)' });
    sweep.fn((f) => reactanceL(f, L()), { color: c.a, domain: [1, 200] });
    sweep.fn((f) => reactanceC(f, C()), { color: c.b, domain: [1, 200] });
    sweep.segment(state.f, 0, state.f, X_MAX, { color: c.ink, width: 1, dash: [3, 4] });
    sweep.point(state.f, reactanceL(state.f, L()), { fill: c.a, r: 6 });
    sweep.point(state.f, reactanceC(state.f, C()), { fill: c.b, r: 6 });
    title(ctx, stage, 'coral X_L, blue X_C', stage.h * 0.66 + 11, c);
  },
  controls: () => [
    { title: 'Sweep the frequency' },
    { key: 'f', label: 'Frequency, f', min: 25, max: 200, step: 5, format: (n) => `${n} Hz` },
    { key: 'Lm', label: 'Inductance, L', min: 200, max: 400, step: 50, format: (n) => `${fixed(n / 1000, 2)} H` },
    { key: 'CuF', label: 'Capacitance, C', min: 10, max: 25, step: 5, format: (n) => `${n} µF` },
    { key: 'vm', label: 'Peak voltage, v_m', min: 2, max: 10, step: 1, format: (n) => `${n} V` },
    { text: 'Shaded: one half cycle. Coral curves show v at its own height, not on the amps scale.' },
    { readout: [
      ['Half cycle', (s) => `${sig(halfMs(s), 3)} ms`],
      ['L: area of v hump', (s) => `${sig(humpArea(s.vm, s.f), 3)} V s`],
      ['L: swing in i', (s) => `${sig(humpArea(s.vm, s.f) / L(s), 3)} A`],
      ['L: peak i_m', (s) => `${sig(peakCurrentL(s.vm, s.f, L(s)), 3)} A`],
      ['C: charge moved', (s) => `${sig(chargeSwing(s.vm, C(s)) * 1e6, 3)} µC`],
      ['C: peak i_m', (s) => `${sig(peakCurrentC(s.vm, s.f, C(s)), 3)} A`],
      ['X_L = X_C at', (s) => `${sig(crossoverFreq(L(s), C(s)), 3)} Hz`],
    ] },
  ],
  tex: (s) => `X_L=\\omega L=${sig(reactanceL(s.f, L(s)), 3)}\\ \\Omega,\\quad X_C=\\dfrac{1}{\\omega C}=${sig(reactanceC(s.f, C(s)), 3)}\\ \\Omega`,
});

tool.update();
