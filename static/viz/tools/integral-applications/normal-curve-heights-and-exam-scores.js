import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { phi, Phi, num } from './_ia.js';

// P(a < X < b) is the area under the bell between a and b: Φ((b − μ)/σ) − Φ((a − μ)/σ). The numbers are made up.
const SETS = {
  height: { name: 'Heights of adult women (cm)', mu: 160, sd: 7, a: 155, b: 170, lo: 130, hi: 190, unit: 'cm' },
  exam: { name: 'Marks on an exam (out of 100)', mu: 62, sd: 14, a: 50, b: 80, lo: 10, hi: 110, unit: 'marks' },
};
const state = { set: 'height', mu: 160, sd: 7, a: 155, b: 170, __last: 'height' };
const pdf = (x) => phi((x - state.mu) / state.sd) / state.sd;
const P = () => Phi((Math.max(state.a, state.b) - state.mu) / state.sd) - Phi((Math.min(state.a, state.b) - state.mu) / state.sd);

createTool({
  state,
  label: 'A bell curve with the area between two values shaded. The shaded area is the probability that a random value falls between them.',
  setup: (stage, c) => createPlot(stage, { x: [130, 190], y: [0, 0.07], c }),
  draw(ctx, stage, c, plot) {
    const S = SETS[state.set];
    plot.setRange([S.lo, S.hi], [0, (1 / (state.sd * Math.sqrt(2 * Math.PI))) * 1.2]);
    plot.axes({ xLabel: S.unit, yLabel: 'density' });
    plot.shade(pdf, null, Math.min(state.a, state.b), Math.max(state.a, state.b), c.fillA);
    plot.fn(pdf, { color: c.ink, width: 3 });
    plot.segment(state.mu, 0, state.mu, 1, { color: c.c, width: 2, dash: [6, 4] });
    for (const k of [-2, -1, 1, 2]) plot.segment(state.mu + k * state.sd, 0, state.mu + k * state.sd, pdf(state.mu + k * state.sd), { color: c.grid, width: 1.5 });
  },
  controls: [
    { title: 'Shade a range' },
    { key: 'set', label: 'Data', options: Object.entries(SETS).map(([k, v]) => [k, v.name]) },
    { key: 'mu', label: 'Mean μ', min: 40, max: 180, step: 1 },
    { key: 'sd', label: 'Spread σ', min: 3, max: 25, step: 1 },
    { key: 'a', label: 'From a', min: 20, max: 190, step: 1 },
    { key: 'b', label: 'To b', min: 20, max: 190, step: 1 },
    { readout: [
      ['z for a and b', () => `${num((state.a - state.mu) / state.sd, 3)} and ${num((state.b - state.mu) / state.sd, 3)}`],
      ['P(a < X < b)', () => `${num(P() * 100, 4)} %`],
      ['Within 1σ, 2σ of the mean', () => `${num((Phi(1) - Phi(-1)) * 100, 4)} %, ${num((Phi(2) - Phi(-2)) * 100, 4)} %`],
    ] },
  ],
  onChange: (s) => {
    const preset = SETS[s.set];
    if (s.__last !== s.set) { s.__last = s.set; Object.assign(s, { mu: preset.mu, sd: preset.sd, a: preset.a, b: preset.b }); document.querySelectorAll('#panel input.nb-range').forEach((i, k) => { const key = ['mu', 'sd', 'a', 'b'][k]; if (key) { i.value = s[key]; const o = i.parentElement.querySelector('output'); if (o) o.textContent = s[key]; } }); }
  },
  tex: (s) => `P(a<X<b)=\\Phi\\!\\left(\\tfrac{b-\\mu}{\\sigma}\\right)-\\Phi\\!\\left(\\tfrac{a-\\mu}{\\sigma}\\right)=${num(P(), 4)}`,
});
