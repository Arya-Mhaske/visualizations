import { createStepper } from '../../lib/stepper.js';
import { RULES, roster } from './_sets-math.js';

const state = { rule: 'even', limit: 12 };
const tests = (s) => {
  const list = [];
  for (let x = 1; x <= Math.min(s.limit, 6); x++) list.push(`${x}: ${RULES[s.rule][1](x) ? 'in' : 'out'}`);
  return list.join(', ');
};

function steps(s) {
  const [word, , pattern] = RULES[s.rule];
  const list = roster(s.rule, s.limit);
  const items = [
    { text: 'Set-builder form states the rule:', tex: `A = \\{x : x \\in \\mathbb{N},\\ ${word.replace('x is ', '\\text{')}},\\ x \\le ${s.limit}\\}`.replace('}, x', '}, x') },
    { text: `Test each natural number from 1 to ${s.limit} against the rule. First few: ${tests(s)}.` },
    { text: 'Roster form lists the numbers that passed, once each:', tex: `A = \\{${list.join(', ')}\\}` },
    { text: `So n(A) = ${list.length}. Order doesn't change the set.` },
  ];
  if (pattern) items.push({ text: 'Going back: find a pattern in the roster and write it as a rule.', tex: `A = \\{${pattern} : k \\in \\mathbb{N},\\ ${pattern} \\le ${s.limit}\\}` });
  else items.push({ text: 'Going back: primes follow no simple formula, so set-builder form must state the property in words.' });
  return items;
}

const stage = document.querySelector('#stage');
stage.setAttribute('aria-label', 'Worked steps converting a set between set-builder form and roster form');
stage.setAttribute('role', 'group');
createStepper({
  stage,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Rule ↔ list' },
    { key: 'rule', label: 'Rule', options: [['even', 'Even'], ['odd', 'Odd'], ['square', 'Squares'], ['prime', 'Primes']] },
    { key: 'limit', label: 'Up to', min: 5, max: 30 },
    { readout: [
      ['Roster', (s) => `{${roster(s.rule, s.limit).join(', ')}}`],
      ['n(A)', (s) => String(roster(s.rule, s.limit).length)],
    ] },
  ],
});
