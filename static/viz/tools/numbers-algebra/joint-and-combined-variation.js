import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// Each law: out = K * product of v^exp. Plots show out against each variable in turn, the others held.
const LAWS = {
  hooke: { name: "Hooke's law", out: 'F', unit: 'N', K: 5, tex: 'F=kx', vars: [{ key: 'x', label: 'Stretch x (cm)', exp: 1 }] },
  ohm: { name: "Ohm's law", out: 'V', unit: 'V', K: 1, tex: 'V=IR', vars: [{ key: 'I', label: 'Current I (A)', exp: 1 }, { key: 'R', label: 'Resistance R (Ω)', exp: 1 }] },
  gas: { name: 'Gas law', out: 'P', unit: 'kPa', K: 8.314, tex: 'P=\\dfrac{nRT}{V}', vars: [{ key: 'T', label: 'Temperature T (K)', exp: 1 }, { key: 'V', label: 'Volume V (L)', exp: -1 }, { key: 'n', label: 'Amount n (mol)', exp: 1 }] },
};
const state = { law: 'hooke', x: 4, I: 2, R: 5, T: 300, V: 25, n: 1 };
const RANGE = { x: [1, 10], I: [0.5, 5], R: [1, 10], T: [200, 400], V: [10, 50], n: [0.5, 3] };
const out = (law, s, override = {}) => LAWS[law].vars.reduce((p, v) => p * (override[v.key] ?? s[v.key]) ** v.exp, LAWS[law].K);
const range = (key) => RANGE[key];
const ymaxOf = (law, s, i) => {
  const v = LAWS[law].vars[i];
  const [lo, hi] = range(v.key);
  return Math.max(out(law, s, { [v.key]: lo }), out(law, s, { [v.key]: hi })) * 1.1;
};

const tool = createTool({
  state,
  label: 'Stacked graphs of the chosen law. Each graph shows the output against one variable while the others are held fixed. A dot marks the current values. A straight line through the origin is direct variation, and a falling curve is inverse variation.',
  setup(stage, c) {
    return [0, 1, 2].map((i) => createPlot(stage, {
      c, x: [0, 10], y: [0, 10], pad: 24,
      box: (st) => {
        const n = LAWS[state.law].vars.length;
        return { x: 0, y: (i * st.h) / n, w: st.w, h: st.h / n };
      },
    }));
  },
  draw(ctx, stage, c, plots) {
    const L = LAWS[state.law];
    L.vars.forEach((v, i) => {
      const [lo, hi] = range(v.key);
      const plot = plots[i];
      plot.setRange([0, hi * 1.05], [0, ymaxOf(state.law, state, i)]);
      plot.axes({ xLabel: v.key, yLabel: L.out });
      plot.fn((t) => out(state.law, state, { [v.key]: t }), { color: c.a, domain: [Math.max(lo, 0.05), hi] });
      plot.point(state[v.key], out(state.law, state), { fill: c.b });
    });
  },
  controls: [
    { title: 'Choose a law' },
    { key: 'law', label: 'Law', options: [['hooke', 'Hooke'], ['ohm', 'Ohm'], ['gas', 'Gas']] },
    { key: 'x', label: 'Stretch x (cm)', min: 1, max: 10, step: 1 },
    { key: 'I', label: 'Current I (A)', min: 0.5, max: 5, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'R', label: 'Resistance R (Ω)', min: 1, max: 10, step: 1 },
    { key: 'T', label: 'Temperature T (K)', min: 200, max: 400, step: 20 },
    { key: 'V', label: 'Volume V (L)', min: 10, max: 50, step: 5 },
    { key: 'n', label: 'Amount n (mol)', min: 0.5, max: 3, step: 0.5, format: (v) => fixed(v, 1) },
    { readout: [
      ['Output', (s) => `${LAWS[s.law].out} = ${fixed(out(s.law, s), 2)} ${LAWS[s.law].unit}`],
      ['Double the 1st', (s) => `× ${fixed(2 ** LAWS[s.law].vars[0].exp, 2)}`],
      ['Double the 2nd', (s) => (LAWS[s.law].vars[1] ? `× ${fixed(2 ** LAWS[s.law].vars[1].exp, 2)}` : '—')],
      ['Double the 3rd', (s) => (LAWS[s.law].vars[2] ? `× ${fixed(2 ** LAWS[s.law].vars[2].exp, 2)}` : '—')],
    ] },
  ],
  tex: (s) => {
    const L = LAWS[s.law];
    const v = (k) => fixed(s[k], 1);
    if (s.law === 'hooke') return `${L.tex},\\ k=5\\ \\mathrm{N/cm}:\\ F=5\\times ${s.x}=${fixed(out('hooke', s), 1)}\\ \\mathrm{N}`;
    if (s.law === 'ohm') return `${L.tex}=${v('I')}\\times ${s.R}=${fixed(out('ohm', s), 1)}\\ \\mathrm{V}`;
    return `${L.tex}=\\dfrac{${v('n')}\\times 8.314\\times ${s.T}}{${s.V}}=${fixed(out('gas', s), 1)}\\ \\mathrm{kPa}`;
  },
  onChange() { hide(); },
});

// Show only the sliders that belong to the current law (field 0 is the law chooser).
const fields = [...document.querySelectorAll('#panel .nb-field')];
const KEYS = ['x', 'I', 'R', 'T', 'V', 'n'];
function hide() {
  const mine = LAWS[state.law].vars.map((v) => v.key);
  KEYS.forEach((k, i) => { if (fields[i + 1]) fields[i + 1].hidden = !mine.includes(k); });
}
hide();
