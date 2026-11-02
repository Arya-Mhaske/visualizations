import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { createPlot } from '../../lib/plot.js';
import { line, label } from '../../lib/draw.js';
import { carnot, drawCycle, GAS } from './_engines.js';
import { R } from './_thermo.js';
import { fixed } from '../../lib/format.js';

// t in [0, 8): two seconds per step. Step 0: isothermal expansion; 1: adiabatic expansion; 2: isothermal compression; 3: adiabatic compression.
const state = { T1: 600, T2: 300, gas: 'mono', t: 0 };
const NAMES = ['Isothermal expansion at T₁: heat Q₁ flows in', 'Adiabatic expansion: no heat, gas cools to T₂', 'Isothermal compression at T₂: heat Q₂ flows out', 'Adiabatic compression: no heat, gas warms to T₁'];
const cyc = (s) => carnot(s.T1, s.T2, GAS[s.gas], 2);
const stepOf = (s) => Math.min(3, Math.floor(s.t / 2));
const frac = (s) => (s.t - 2 * stepOf(s)) / 2;
function now(s) {
  const cy = cyc(s);
  const i = stepOf(s);
  const V = [cy.VA, cy.VB, cy.VC, cy.VD];
  const v = V[i] + (V[(i + 1) % 4] - V[i]) * frac(s);
  return { cy, i, V: v, P: cy.curves[i](v) };
}
const clock = createTimeline(document.querySelector('#stage'), state, { cycle: () => 8, update: () => tool.update() });

const tool = createTool({
  state,
  label: 'Top: a cylinder whose piston moves as the gas goes round the Carnot cycle, with a hot block, a cold block or insulation underneath. Bottom: the cycle on a pressure against volume graph with a dot showing the gas now. The four steps are an isothermal expansion, an adiabatic expansion, an isothermal compression and an adiabatic compression.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 100], y: [0, 600], box: (st) => ({ x: 0, y: st.h * 0.34, w: st.w, h: st.h * 0.66 }) }),
  draw(ctx, stage, c, plot) {
    const [W, H] = [stage.w, stage.h];
    const { cy, i, V, P } = now(state);
    const [x0, x1, y0, y1] = [W * 0.1, W * 0.62, H * 0.03, H * 0.2];
    const share = (V - cy.VA) / (cy.VC - cy.VA);
    const px = x0 + (x1 - x0) * (0.25 + 0.7 * share);
    ctx.fillStyle = c.fillY;
    ctx.fillRect(x0, y0, px - x0, y1 - y0);
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(0.9, (((P * V) / R - state.T2) / (state.T1 - state.T2)) * 0.9));
    ctx.fillStyle = c.fillA;
    ctx.fillRect(x0, y0, px - x0, y1 - y0);
    ctx.restore();
    line(ctx, x0, y0, x1, y0, { color: c.ink, width: 4 });
    line(ctx, x0, y1, x1, y1, { color: c.ink, width: 4 });
    line(ctx, x0, y0, x0, y1, { color: c.ink, width: 4 });
    line(ctx, px, y0 - 3, px, y1 + 3, { color: c.ink, width: 7 });
    line(ctx, px, (y0 + y1) / 2, x1 + 14, (y0 + y1) / 2, { color: c.ink, width: 4 });
    const block = i === 0 ? c.fillA : i === 2 ? c.fillB : c.paper;
    ctx.fillStyle = block;
    ctx.fillRect(x0 - 4, y1 + 5, x1 - x0 + 4, H * 0.07);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(x0 - 4, y1 + 5, x1 - x0 + 4, H * 0.07);
    label(ctx, i === 0 ? `hot ${state.T1} K` : i === 2 ? `cold ${state.T2} K` : 'insulation', (x0 + x1) / 2, y1 + 5 + H * 0.035, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `T = ${fixed((P * V) / R, 0)} K`, W * 0.84, (y0 + y1) / 2, c, { size: 12, bounds: stage, patch: false });
    plot.setRange([0, cy.VC * 1.12], [0, cy.pts.A[1] * 1.15]);
    plot.axes({ xLabel: 'V (L)', yLabel: 'P (kPa)' });
    drawCycle(plot, cy, c, { width: 3, fill: c.fillY });
    const from = [cy.VA, cy.VB, cy.VC, cy.VD][i];
    plot.fn(cy.curves[i], { domain: [Math.min(from, V), Math.max(from, V)], color: c.ink, width: 6 });
    plot.point(V, P, { fill: c.a, r: 8 });
  },
  controls: () => [
    { title: 'Step through the cycle' },
    { key: 't', label: 'Time (steps of 2)', min: 0, max: 7.9, step: 0.1, format: (v) => `${fixed(v, 1)}` },
    transport(clock.clock),
    { key: 'T1', label: 'Hot T₁ (K)', min: 400, max: 800, step: 50 },
    { key: 'T2', label: 'Cold T₂ (K)', min: 150, max: 390, step: 10 },
    { key: 'gas', label: 'Gas', options: [['mono', 'Monatomic'], ['di', 'Diatomic']] },
    { readout: [
      ['Step', (s) => `${stepOf(s) + 1}: ${NAMES[stepOf(s)]}`],
      ['Heat Q in this step', (s) => {
        const cy = cyc(s);
        const i = stepOf(s);
        return i === 0 ? `+${fixed(cy.Q1, 0)} J` : i === 2 ? `−${fixed(cy.Q2, 0)} J` : '0';
      }],
      ['Net work per cycle', (s) => `${fixed(cyc(s).W, 0)} J`],
    ] },
  ],
  tex: (s) => `\\eta=1-\\dfrac{T_2}{T_1}=${fixed(1 - s.T2 / s.T1, 3)}`,
  onChange: () => clock.sync(),
});
clock.sync();
tool.update();
