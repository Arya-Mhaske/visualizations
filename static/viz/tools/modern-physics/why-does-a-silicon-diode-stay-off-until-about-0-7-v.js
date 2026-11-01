import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig, texSci } from '../../lib/format.js';
import { IS, V0, VT, ableToClimb, forwardCurrent } from './_p-n-junction-diode-math.js';
import { amps } from './_p-n-junction-diode-view.js';

const V_MAX = 0.78;
const I_TOP = 60; // mA, top of the current graph
const state = { V: 0.55, scale: 'linear' };
const barrier = (s) => Math.max(V0 - s.V, 0);
const share = (s) => Math.min(1, ableToClimb(s.V));
const mA = (V) => forwardCurrent(V) * 1000;
const sciText = (x) => (x >= 1e-3 ? sig(x, 3) : sig(x, 2));
const logShare = (E) => -E / (VT * Math.LN10); // log10 of the share with energy ≥ E

const tool = createTool({
  state,
  label: 'Top: how many n-side electrons have at least a given energy. The curve falls steeply, and a vertical line marks the barrier height. The height of the curve at that line is the share of electrons able to climb. Bottom: current against voltage, with a point that follows the voltage slider.',
  setup: (stage, c) => ({
    tail: createPlot(stage, { x: [0, 0.8], y: [0, 1.05], c, pad: 26, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.5 }) }),
    logTail: createPlot(stage, { x: [0, 0.8], y: [-13, 0.6], c, pad: 26, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.5 }) }),
    iv: createPlot(stage, { x: [0, 0.8], y: [0, I_TOP], c, pad: 26, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  }),
  draw(ctx, stage, c, { tail, logTail, iv }) {
    const E = barrier(state);
    if (state.scale === 'linear') {
      tail.axes({ xLabel: 'energy (eV)', yLabel: 'share with at least this' });
      tail.fn((x) => Math.exp(-x / VT), { color: c.b });
      tail.segment(E, 0, E, 1.05, { color: c.a, width: 3, dash: [7, 5] });
      tail.point(E, Math.min(1, Math.exp(-E / VT)), { fill: c.a, r: 7 });
    } else {
      logTail.axes({ xLabel: 'energy (eV)', yLabel: 'log₁₀ share' });
      logTail.fn(logShare, { color: c.b });
      logTail.segment(E, -13, E, 0.6, { color: c.a, width: 3, dash: [7, 5] });
      logTail.point(E, logShare(E), { fill: c.a, r: 7 });
    }
    iv.axes({ xLabel: 'V (V)', yLabel: 'I (mA)' });
    iv.fn(mA, { color: c.c });
    iv.point(state.V, Math.min(I_TOP, mA(state.V)), { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: 'Raise the voltage' },
    { key: 'V', label: 'Forward voltage, V', min: 0, max: V_MAX, step: 0.01, format: (n) => `${fixed(n, 2)} V` },
    { key: 'scale', label: 'Top graph', options: [['linear', 'Linear'], ['log', 'Log scale']] },
    { readout: [
      ['Barrier', (s) => `${fixed(barrier(s), 2)} V`],
      ['Able to climb', (s) => (s.V >= V0 ? 'all of them' : sciText(share(s)))],
      ['Current', (s) => amps(forwardCurrent(s.V))],
    ] },
  ],
  tex: (s) => `I=I_s\\left(e^{V/V_T}-1\\right)=${texSci(IS, 2)}\\left(e^{${fixed(s.V, 2)}/0.02585}-1\\right)=${texSci(forwardCurrent(s.V), 3)}\\ \\text{A}`,
});

tool.update();
