import { createStepper } from '../../lib/stepper.js';
import { fixed, sig } from '../../lib/format.js';
import { convert } from './_shm-math.js';

const state = { known: 'f', value: 50 };
const UNIT = { T: 's', f: 'Hz', w: 'rad/s' };
const NAME = { T: 'T', f: 'f', w: '\\omega' };
const out = (s) => convert(s.known, s.value);

function steps(s) {
  const { T, f, w } = out(s);
  const given = { text: 'Start from what you know:', tex: `${NAME[s.known]} = ${s.value}\\ \\text{${UNIT[s.known]}}` };
  const rows = {
    T: [
      { text: 'Frequency is cycles per second, the inverse of the period:', tex: `f = \\frac{1}{T} = ${sig(f, 4)}\\ \\text{Hz}` },
      { text: 'Each cycle is 2π radians:', tex: `\\omega = 2\\pi f = ${sig(w, 4)}\\ \\text{rad/s}` },
    ],
    f: [
      { text: 'The period is the inverse of the frequency:', tex: `T = \\frac{1}{f} = ${sig(T, 4)}\\ \\text{s}` },
      { text: 'Each cycle is 2π radians:', tex: `\\omega = 2\\pi f = ${sig(w, 4)}\\ \\text{rad/s}` },
    ],
    w: [
      { text: 'Divide by the 2π radians in a cycle:', tex: `f = \\frac{\\omega}{2\\pi} = ${sig(f, 4)}\\ \\text{Hz}` },
      { text: 'Then invert:', tex: `T = \\frac{1}{f} = ${sig(T, 4)}\\ \\text{s}` },
    ],
  };
  return [given, ...rows[s.known]];
}

const stage = document.querySelector('#stage');
stage.setAttribute('aria-label', 'Worked steps converting between period, frequency and angular frequency');
stage.setAttribute('role', 'group');
createStepper({
  stage,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Know one, find two' },
    { key: 'known', label: 'I know', options: [['T', 'T'], ['f', 'f'], ['w', 'ω']] },
    { key: 'value', label: 'Its value', min: 1, max: 100, format: (v) => fixed(v, 0) },
    { readout: [
      ['T', (s) => `${sig(out(s).T, 4)} s`],
      ['f', (s) => `${sig(out(s).f, 4)} Hz`],
      ['ω', (s) => `${sig(out(s).w, 4)} rad/s`],
    ] },
  ],
});
