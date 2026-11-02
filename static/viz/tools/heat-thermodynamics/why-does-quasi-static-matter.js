import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { rk4Step } from '../../lib/sim.js';
import { fixed } from '../../lib/format.js';

// Two 10 L chambers of gas (0.5 mol each, 300 K, held constant) joined by a narrow pipe. A piston halves chamber A in T seconds.
// The pipe lets pressure even out at about 0.3 per second. P in kPa, V in L, work in J.
const RT = 8.314 * 300;
const G = 6e-4; // mol per kPa per second
const state = { T: 1 };
const cache = new Map();
function run(T) {
  if (cache.has(T)) return cache.get(T);
  const vA = (t) => 10 * (1 - 0.5 * Math.min(t, T) / T);
  const pA = (t, y) => (y[0] * RT) / vA(t);
  const pB = (y) => (y[1] * RT) / 10;
  const deriv = (t, y) => {
    const flow = G * (pA(t, y) - pB(y));
    return [-flow, flow, t < T ? (pA(t, y) * 5) / T : 0];
  };
  let st = { t: 0, y: [0.5, 0.5, 0] };
  const dt = 0.01;
  const pts = [];
  let gap = 0;
  const steps = Math.round((T + 30) / dt);
  for (let i = 0; i <= steps; i++) {
    if (st.t <= T + 1e-9 && i % Math.max(1, Math.round(T / dt / 150)) === 0) {
      const peq = RT / (vA(st.t) + 10);
      pts.push({ V: vA(st.t) + 10, A: pA(st.t, st.y), B: pB(st.y), eq: peq });
      gap = Math.max(gap, Math.abs(pA(st.t, st.y) - pB(st.y)) / peq);
    }
    st = rk4Step(st, deriv, dt);
  }
  const out = { pts, gap, extra: st.y[2] - RT * Math.log(20 / 15) };
  cache.set(T, out);
  return out;
}

createTool({
  state,
  label: 'Pressure against total volume for a gas squeezed in one of two linked chambers. A black line is the equilibrium pressure. The coral line is the pressure in the squeezed chamber and the blue line is the pressure in the far chamber. A slow push keeps them together on the black line. A fast push pulls them apart, so there is no single pressure for the gas.',
  setup: (stage, c) => createPlot(stage, { c, x: [14, 21], y: [100, 300] }),
  draw(ctx, stage, c, plot) {
    const { pts } = run(state.T);
    plot.axes({ xLabel: 'V total (L)', yLabel: 'P (kPa)' });
    const trace = (key, color, width) => {
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(...plot.toPx(p.V, p[key])) : ctx.moveTo(...plot.toPx(p.V, p[key]))));
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    };
    trace('eq', c.ink, 5);
    trace('A', c.a, 3);
    trace('B', c.b, 3);
    plot.text('squeezed side', 15.2, run(state.T).pts.at(-1).A + 12, { color: c.a, size: 11, patch: false });
    plot.text('far side', 15.2, run(state.T).pts.at(-1).B - 14, { color: c.b, size: 11, patch: false });
  },
  controls: [
    { title: 'Squeeze the gas' },
    { key: 'T', label: 'Time to push the piston (s)', min: 0.5, max: 30, step: 0.5 },
    { readout: [
      ['Largest pressure gap', (s) => `${fixed(run(s.T).gap * 100, 1)} % of P`],
      ['Extra work wasted', (s) => `${fixed(run(s.T).extra, 1)} J`],
      ['Ideal (slow) work', (s) => `${fixed(RT * Math.log(20 / 15), 1)} J`],
    ] },
  ],
  tex: (s) => `W_{rev}=nRT\\ln\\dfrac{V_i}{V_f}=${fixed(RT * Math.log(20 / 15), 1)}\\ \\mathrm{J}\\quad W_{actual}-W_{rev}=${fixed(run(s.T).extra, 1)}\\ \\mathrm{J}`,
});
