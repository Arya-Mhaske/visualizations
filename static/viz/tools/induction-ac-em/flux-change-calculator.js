import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';

// Φ = B A cos θ. Change one of B, A or θ over a time Δt: ε = −N ΔΦ/Δt (NCERT).
const state = { what: 'B', N: 100, B1: 0.2, B2: 0.8, A1: 0.02, A2: 0.05, th1: 0, th2: 60, dt: 0.5 };
const B0 = 0.5;
const A0 = 0.03;
const phi = (s, u) => {
  const B = s.what === 'B' ? s.B1 + (s.B2 - s.B1) * u : B0;
  const A = s.what === 'A' ? s.A1 + (s.A2 - s.A1) * u : A0;
  const th = s.what === 'th' ? s.th1 + (s.th2 - s.th1) * u : 0;
  return B * A * Math.cos((th * Math.PI) / 180);
};
const dPhi = (s) => phi(s, 1) - phi(s, 0);
const emf = (s) => (-s.N * dPhi(s)) / s.dt;

const tool = createTool({
  state,
  label: 'A graph of flux in milliwebers against time from 0 to the chosen interval. A straight coral line joins the starting flux to the final flux. Its slope, times the number of turns and with a minus sign, is the induced emf.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [0, 40], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    const hi = Math.max(phi(state, 0), phi(state, 1), 0.001) * 1000;
    plot.setRange([0, state.dt * 1.1], [Math.min(0, phi(state, 0) * 1000, phi(state, 1) * 1000) - hi * 0.1, hi * 1.2 + 0.1]);
    plot.axes({ xLabel: 't (s)', yLabel: 'Φ (mWb)' });
    plot.segment(0, phi(state, 0) * 1000, state.dt, phi(state, 1) * 1000, { color: c.a, width: 4 });
    plot.point(0, phi(state, 0) * 1000, { fill: c.b, r: 6 });
    plot.point(state.dt, phi(state, 1) * 1000, { fill: c.c, r: 6 });
  },
  controls: () => [
    { title: 'Change the flux' },
    { key: 'what', label: 'What changes', options: [['B', 'field B'], ['A', 'area A'], ['th', 'angle θ']] },
    { key: 'N', label: 'Turns N', min: 1, max: 500, step: 1 },
    { key: 'B1', label: 'B at start', min: 0, max: 1, step: 0.05, format: (v) => `${fixed(v, 2)} T` },
    { key: 'B2', label: 'B at end', min: 0, max: 1, step: 0.05, format: (v) => `${fixed(v, 2)} T` },
    { key: 'A1', label: 'A at start', min: 0.01, max: 0.1, step: 0.01, format: (v) => `${fixed(v, 2)} m²` },
    { key: 'A2', label: 'A at end', min: 0.01, max: 0.1, step: 0.01, format: (v) => `${fixed(v, 2)} m²` },
    { key: 'th1', label: 'Angle at start', min: 0, max: 90, step: 5, format: (v) => `${v}°` },
    { key: 'th2', label: 'Angle at end', min: 0, max: 90, step: 5, format: (v) => `${v}°` },
    { key: 'dt', label: 'Time taken Δt', min: 0.1, max: 2, step: 0.1, format: (v) => `${fixed(v, 1)} s` },
    { readout: [
      ['Φ at start', (s) => `${sig(phi(s, 0) * 1000, 3)} mWb`],
      ['Φ at end', (s) => `${sig(phi(s, 1) * 1000, 3)} mWb`],
      ['ΔΦ', (s) => `${sig(dPhi(s) * 1000, 3)} mWb`],
      ['Emf ε = −NΔΦ/Δt', (s) => `${fixed(emf(s), 3)} V`],
    ] },
  ],
  onChange: (s) => {
    const hide = { B: ['A1', 'A2', 'th1', 'th2'], A: ['B1', 'B2', 'th1', 'th2'], th: ['B1', 'B2', 'A1', 'A2'] }[s.what];
    fieldsOf().forEach(([key, el]) => { el.hidden = hide.includes(key); });
  },
  tex: (s) => `\\varepsilon=-N\\dfrac{\\Delta\\Phi}{\\Delta t}=-${s.N}\\times\\dfrac{${sig(dPhi(s), 3)}}{${fixed(s.dt, 1)}}=${fixed(emf(s), 3)}\\ \\text{V}`,
});

// Fields in the panel follow the controls in order: what, N, B1, B2, A1, A2, th1, th2, dt.
const KEYS = ['what', 'N', 'B1', 'B2', 'A1', 'A2', 'th1', 'th2', 'dt'];
function fieldsOf() {
  const els = [...document.querySelectorAll('#panel .nb-field')];
  return KEYS.map((k, i) => [k, els[i]]).filter(([, el]) => el);
}
tool.ui.refresh();
fieldsOf().forEach(([key, el]) => { el.hidden = ['A1', 'A2', 'th1', 'th2'].includes(key); });
tool.update();
