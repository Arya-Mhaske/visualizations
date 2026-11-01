import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig, texSci } from '../../lib/format.js';
import { diodeCurrent, secantR } from './_p-n-junction-diode-math.js';

// Forward in mA, reverse in μA, as the textbook draws them. Two readings at once, so no control is hidden.
const state = { f1: 0.69, fd: 0.02, r1: -1, rd: 4 };
const fwd = (s) => ({ V1: s.f1, V2: s.f1 + s.fd });
const rev = (s) => ({ V1: s.r1, V2: s.r1 - s.rd });
const dV = ({ V1, V2 }) => V2 - V1;
const dI = ({ V1, V2 }) => diodeCurrent(V2) - diodeCurrent(V1);
const ohms = (p) => secantR(p.V1, p.V2);
const ohmText = (x) => sig(x, 3);

function secant(plot, c, { V1, V2 }, scale) {
  const [I1, I2] = [diodeCurrent(V1) * scale, diodeCurrent(V2) * scale];
  plot.segment(V1, I1, V2, I1, { color: c.ink, width: 2, dash: [5, 4] });
  plot.segment(V2, I1, V2, I2, { color: c.ink, width: 2, dash: [5, 4] });
  plot.segment(V1, I1, V2, I2, { color: c.a, width: 3 });
  plot.point(V1, I1, { fill: c.a, r: 6 });
  plot.point(V2, I2, { fill: c.a, r: 6 });
}

const tool = createTool({
  state,
  label: 'Two graphs of the diode. Top: forward current in milliamps against voltage, which stays near zero and then climbs steeply. Bottom: reverse current in microamps against negative voltage, a nearly flat line just below zero. On each, a coral line joins two points, with a dashed triangle showing the voltage step and the current step between them.',
  setup: (stage, c) => ({
    forward: createPlot(stage, { x: [0.4, 0.8], y: [0, 60], c, pad: 26, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.5 }) }),
    reverse: createPlot(stage, { x: [-14, 0], y: [-1.7, 0.2], c, pad: 26, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  }),
  draw(ctx, stage, c, { forward, reverse }) {
    forward.axes({ xLabel: 'V (V)', yLabel: 'forward I (mA)' });
    forward.fn((V) => diodeCurrent(V) * 1000, { color: c.c });
    secant(forward, c, fwd(state), 1000);
    reverse.axes({ xLabel: 'V (V)', yLabel: 'reverse I (μA)' });
    reverse.fn((V) => diodeCurrent(V) * 1e6, { color: c.b, domain: [-14, 0] });
    secant(reverse, c, rev(state), 1e6);
  },
  controls: () => [
    { title: 'Forward: two points' },
    { key: 'f1', label: 'First voltage', min: 0.5, max: 0.75, step: 0.01, format: (n) => `${fixed(n, 2)} V` },
    { key: 'fd', label: 'Step up by, ΔV', min: 0.01, max: 0.05, step: 0.01, format: (n) => `${fixed(n, 2)} V` },
    { title: 'Reverse: two points' },
    { key: 'r1', label: 'First voltage', min: -10, max: -1, step: 0.5, format: (n) => `${fixed(n, 1)} V` },
    { key: 'rd', label: 'Step down by, ΔV', min: 1, max: 4, step: 0.5, format: (n) => `${fixed(n, 1)} V` },
    { readout: [
      ['Forward ΔI', (s) => `${sig(dI(fwd(s)) * 1000, 3)} mA`],
      ['Forward r = ΔV/ΔI', (s) => `${ohmText(ohms(fwd(s)))} Ω`],
      ['Reverse ΔI', (s) => `${sig(dI(rev(s)) * 1e6, 3)} μA`],
      ['Reverse R = ΔV/ΔI', (s) => `${ohmText(ohms(rev(s)))} Ω`],
      ['Reverse ÷ forward', (s) => `× ${sig(ohms(rev(s)) / ohms(fwd(s)), 2)}`],
    ] },
  ],
  tex: (s) => `r_f=\\dfrac{${fixed(dV(fwd(s)), 2)}}{${texSci(dI(fwd(s)), 3)}}=${sig(ohms(fwd(s)), 3)}\\ \\Omega,\\quad R_r=${texSci(ohms(rev(s)), 3)}\\ \\Omega`,
});

tool.update();
