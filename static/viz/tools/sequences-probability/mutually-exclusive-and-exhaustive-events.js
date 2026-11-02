import { createTool } from '../../lib/tool.js';
import { OUTCOMES } from './_conditional-probability-bayes-math.js';
import { diceGrid } from './_conditional-probability-bayes-draw.js';

const PARTS = {
  none: ['—', () => false],
  low: ['Sum 2 to 6', (i, j) => i + j <= 6],
  mid: ['Sum 7', (i, j) => i + j === 7],
  high: ['Sum 8 to 12', (i, j) => i + j >= 8],
  mid2: ['Sum 6 to 8', (i, j) => i + j >= 6 && i + j <= 8],
  odd: ['Sum is odd', (i, j) => (i + j) % 2 === 1],
  even: ['Sum is even', (i, j) => (i + j) % 2 === 0],
  dbl: ['Doubles', (i, j) => i === j],
};
const state = { e1: 'low', e2: 'mid', e3: 'high' };
const hits = (s, i, j) => [s.e1, s.e2, s.e3].filter((k) => PARTS[k][1](i, j)).length;
const tally = (s) => ({
  overlap: OUTCOMES.filter(([i, j]) => hits(s, i, j) > 1).length,
  gap: OUTCOMES.filter(([i, j]) => hits(s, i, j) === 0).length,
  sum: [s.e1, s.e2, s.e3].reduce((t, k) => t + OUTCOMES.filter(([i, j]) => PARTS[k][1](i, j)).length, 0),
});
const choices = Object.entries(PARTS).map(([k, v]) => [k, v[0]]);

createTool({
  state,
  label: 'The 36 two-dice outcomes. Cells in exactly one chosen event are green, cells in two or more are coral, and cells in none are plain.',
  dom: (el) => diceGrid(el, (i, j) => {
    const h = hits(state, i, j);
    return h === 1 ? 'on' : h > 1 ? 'both' : '';
  }),
  controls: [
    { title: 'Three events' },
    { key: 'e1', label: 'Event 1', options: choices },
    { key: 'e2', label: 'Event 2', options: choices },
    { key: 'e3', label: 'Event 3', options: choices },
    { readout: [
      ['Cells in two or more', (s) => ({ text: String(tally(s).overlap), good: tally(s).overlap === 0 })],
      ['Cells in none', (s) => ({ text: String(tally(s).gap), good: tally(s).gap === 0 })],
      ['Total of P', (s) => `${tally(s).sum}/36`],
      ['Partition?', (s) => ({ text: tally(s).overlap === 0 && tally(s).gap === 0 ? 'yes' : 'no', good: tally(s).overlap === 0 && tally(s).gap === 0 })],
    ] },
  ],
  tex: (s) => `P(E_1)+P(E_2)+P(E_3)=\\dfrac{${tally(s).sum}}{36}`,
});
