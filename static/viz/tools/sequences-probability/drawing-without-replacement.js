import { createStepper } from '../../lib/stepper.js';
import { fixed } from '../../lib/format.js';
import { drawChance } from './_conditional-probability-bayes-math.js';

const state = { red: 5, blue: 3, order: 'RR' };
const WORD = { R: 'red', B: 'blue' };

function steps(s) {
  const [first, second] = s.order;
  const total = s.red + s.blue;
  const firstCount = first === 'R' ? s.red : s.blue;
  const leftRed = s.red - (first === 'R' ? 1 : 0);
  const leftBlue = s.blue - (first === 'B' ? 1 : 0);
  const secondCount = second === 'R' ? leftRed : leftBlue;
  const p = drawChance(s.red, s.blue, s.order);
  return [
    { text: `The bag starts with ${s.red} red and ${s.blue} blue, ${total} in all.` },
    { text: `First draw is ${WORD[first]}:`, tex: `P(A) = \\frac{${firstCount}}{${total}}` },
    { text: `One ball is gone. The bag now holds ${leftRed} red and ${leftBlue} blue, ${total - 1} in all.` },
    { text: `Second draw is ${WORD[second]}, given the first:`, tex: `P(B \\mid A) = \\frac{${secondCount}}{${total - 1}}` },
    { text: 'Multiply along the path:', tex: `P(A \\cap B) = P(A)\\,P(B \\mid A) = \\frac{${firstCount}}{${total}} \\times \\frac{${secondCount}}{${total - 1}} = \\frac{${firstCount * secondCount}}{${total * (total - 1)}} \\approx ${fixed(p, 3)}` },
    { text: 'Compare with replacement, where the second draw is unchanged:', tex: `\\frac{${firstCount}}{${total}} \\times \\frac{${second === 'R' ? s.red : s.blue}}{${total}} \\approx ${fixed((firstCount * (second === 'R' ? s.red : s.blue)) / total ** 2, 3)}` },
  ];
}

const stage = document.querySelector('#stage');
stage.setAttribute('aria-label', 'Worked steps for two draws from a bag without replacement');
stage.setAttribute('role', 'group');
createStepper({
  stage,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Two balls, no putting back' },
    { key: 'red', label: 'Red balls', min: 1, max: 10 },
    { key: 'blue', label: 'Blue balls', min: 1, max: 10 },
    { key: 'order', label: 'Draws', options: [['RR', 'red, red'], ['RB', 'red, blue'], ['BR', 'blue, red'], ['BB', 'blue, blue']] },
    { readout: [
      ['P(this order)', (s) => fixed(drawChance(s.red, s.blue, s.order), 4)],
      ['All four orders add to', (s) => fixed(['RR', 'RB', 'BR', 'BB'].reduce((sum, o) => sum + drawChance(s.red, s.blue, o), 0), 4)],
    ] },
  ],
});
