import { createTool } from '../../lib/tool.js';
import { dotGrid } from '../../lib/discrete.js';
import { fixed, frac } from '../../lib/format.js';
import { illGivenPositive, testPositive } from './_conditional-probability-bayes-math.js';

const PEOPLE = 1000;
const state = { view: 1, prevalence: 0.1, detect: 99, falsePositive: 0.5 };
const rates = (s) => [s.prevalence / 100, s.detect / 100, s.falsePositive / 100];
const ill = (s) => Math.round(PEOPLE * rates(s)[0]);
const illPositive = (s) => Math.round(ill(s) * rates(s)[1]);
const healthyPositive = (s) => Math.round((PEOPLE - ill(s)) * rates(s)[2]);
const answer = (s) => illGivenPositive(...rates(s));
const asFraction = (x) => {
  const found = frac(x, 1000);
  return found ? `${found.p}/${found.q}` : fixed(x, 4);
};

createTool({
  state,
  label: 'A grid of 1000 dots for people. Ill people are coral. Positive tests light up, and among the lit dots only a few are ill.',
  draw(ctx, stage, c) {
    const [sick, sickPlus, wellPlus] = [ill(state), illPositive(state), healthyPositive(state)];
    const box = { x: 8, y: 8, w: stage.w - 16, h: stage.h - 16 };
    // Scatter the positives evenly through the grid so they can be counted by eye.
    const lit = new Set();
    for (let k = 0; k < wellPlus; k++) lit.add(sick + Math.floor(((k + 0.5) * (PEOPLE - sick)) / wellPlus));
    dotGrid(ctx, box, PEOPLE, (i) => {
      const isIll = i < sick;
      if (state.view === 1) return isIll ? c.a : c.grid;
      const positive = isIll ? i < sickPlus : lit.has(i);
      if (positive) return isIll ? c.a : c.b;
      if (state.view === 3) return c.paper;
      return isIll ? c.fillA : c.grid;
    }, c.ink);
  },
  controls: [
    { title: 'Fill the grid' },
    { key: 'view', label: 'View', options: [[1, '1 Who is ill'], [2, '2 Who tests +'], [3, '3 Among the +']] },
    { key: 'prevalence', label: 'Ill, P(E₁)', min: 0.1, max: 20, step: 0.1, format: (v) => `${fixed(v, 1)}%` },
    { key: 'detect', label: 'Detected, P(+ | ill)', min: 50, max: 100, step: 1, format: (v) => `${v}%` },
    { key: 'falsePositive', label: 'False positive, P(+ | healthy)', min: 0.1, max: 10, step: 0.1, format: (v) => `${fixed(v, 1)}%` },
    { readout: [
      ['Ill people', (s) => String(ill(s))],
      ['Ill and positive', (s) => String(illPositive(s))],
      ['Healthy and positive', (s) => String(healthyPositive(s))],
      ['P(+ | ill)', (s) => `${s.detect}%`],
      ['P(ill | +)', (s) => `${asFraction(answer(s))} ≈ ${fixed(answer(s) * 100, 1)}%`],
    ] },
  ],
  tex: (s) => {
    const [p, d, f] = rates(s);
    return `P(E_1 \\mid A) = \\frac{${fixed(p, 3)} \\times ${fixed(d, 2)}}{${fixed(p * d, 5)} + ${fixed((1 - p) * f, 6)}} = \\frac{${fixed(p * d, 5)}}{${fixed(testPositive(p, d, f), 6)}} = ${fixed(answer(s), 4)}`;
  },
});
