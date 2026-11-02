import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { SUBS, subP, vapP, fusT, region, path } from './_phase.js';

const state = { sub: 'co2', tn: 30, pn: 40 };
const S = (s) => SUBS[s.sub];
const Tof = (s) => S(s).T[0] + ((S(s).T[1] - S(s).T[0]) * s.tn) / 100;
const lpOf = (s) => S(s).lp[0] + ((S(s).lp[1] - S(s).lp[0]) * s.pn) / 100;

createTool({
  state,
  label: 'A phase diagram with temperature across and log pressure up, showing the solid, liquid and gas regions, the triple point and the critical point. A marker can be moved around it.',
  setup: (stage, c) => createPlot(stage, { x: [150, 340], y: [-0.5, 3], c }),
  draw(ctx, stage, c, plot) {
    const s = S(state);
    plot.setRange(s.T, s.lp);
    plot.axes({ xLabel: 'T (K)', yLabel: 'log₁₀ P (atm)' });
    plot.fn((T) => Math.log10(subP(s, T)), { color: c.b, domain: [s.T[0], s.Tt] });
    plot.fn((T) => Math.log10(vapP(s, T)), { color: c.b, domain: [s.Tt, s.Tc] });
    plot.segment(s.Tt, Math.log10(s.Pt), fusT(s, 10 ** s.lp[1]), s.lp[1], { color: c.b, width: 3 });
    plot.segment(s.T[0], 0, s.T[1], 0, { color: c.ink, dash: [5, 4], width: 1 });
    plot.point(s.Tt, Math.log10(s.Pt), { fill: c.c, r: 6 });
    plot.point(s.Tc, Math.log10(s.Pc), { fill: c.d, r: 6 });
    plot.text('1 atm', s.T[0] + (s.T[1] - s.T[0]) * 0.02, 0.18, { align: 'left', patch: false });
    plot.point(Tof(state), lpOf(state), { fill: c.a });
  },
  controls: [
    { title: 'Move around' },
    { key: 'sub', label: 'Substance', options: [['co2', 'CO₂'], ['water', 'Water']] },
    { key: 'tn', label: 'Temperature T', min: 0, max: 100, step: 1, format: (v) => `${fixed(Tof({ sub: state.sub, tn: v }), 0)} K` },
    { key: 'pn', label: 'Pressure P (log scale)', min: 0, max: 100, step: 1, format: (v) => `${sig(10 ** lpOf({ sub: state.sub, pn: v }), 2)} atm` },
    { readout: [
      ['Phase here', (s) => region(S(s), Tof(s), 10 ** lpOf(s))],
      ['Heating at 1 atm', (s) => path(S(s), 1).map((p) => p.phase).join(' → ')],
      ['Changes at', (s) => path(S(s), 1).slice(1).map((p) => `${fixed(p.T, 0)} K`).join(', ')],
    ] },
  ],
});
