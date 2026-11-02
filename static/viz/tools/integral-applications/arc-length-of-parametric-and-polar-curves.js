import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { simpson } from './_ia.js';

// Each example: set up the integrand, then integrate (exactly where there is a closed form, else Simpson).
const g = (v, d = 4) => String(Number(v.toFixed(d)));
const PROBS = {
  cyc: {
    name: 'One arch of a cycloid', tex: (s) => `x=${s.a}(t-\\sin t),\\ y=${s.a}(1-\\cos t),\\ 0\\le t\\le2\\pi`,
    steps: (s) => [
      { text: 'Differentiate both coordinates.', tex: `x'=${s.a}(1-\\cos t),\\quad y'=${s.a}\\sin t` },
      { text: 'Square and add.', tex: `x'^2+y'^2=${s.a * s.a}\\big(2-2\\cos t\\big)=${4 * s.a * s.a}\\sin^2\\tfrac t2` },
      { text: 'The root is a single trig term (sin(t/2) ≥ 0 on [0, 2π]).', tex: `\\sqrt{x'^2+y'^2}=${2 * s.a}\\sin\\tfrac t2` },
      { text: 'Integrate.', tex: `L=\\int_0^{2\\pi}${2 * s.a}\\sin\\tfrac t2\\,dt=${8 * s.a}` },
      { text: `Check by Simpson: ${g(simpson((t) => s.a * Math.sqrt(2 - 2 * Math.cos(t)), 0, 2 * Math.PI, 2000))}.` },
    ],
  },
  card: {
    name: 'Cardioid r = a(1 + cos θ)', tex: (s) => `r=${s.a}(1+\\cos\\theta),\\ 0\\le\\theta\\le2\\pi`,
    steps: (s) => [
      { text: 'Polar form: ds = √(r² + r′²) dθ.', tex: `r'=-${s.a}\\sin\\theta` },
      { text: 'Add the squares.', tex: `r^2+r'^2=${s.a * s.a}(2+2\\cos\\theta)=${4 * s.a * s.a}\\cos^2\\tfrac\\theta2` },
      { text: 'Take the root (use symmetry: double the half from 0 to π, where cos(θ/2) ≥ 0).', tex: `L=2\\int_0^{\\pi}${2 * s.a}\\cos\\tfrac\\theta2\\,d\\theta=${8 * s.a}` },
      { text: `Check by Simpson: ${g(simpson((t) => s.a * Math.sqrt(2 + 2 * Math.cos(t)), 0, 2 * Math.PI, 4000))}.` },
    ],
  },
  spiral: {
    name: 'Spiral r = aθ, one turn', tex: (s) => `r=${s.a}\\theta,\\ 0\\le\\theta\\le2\\pi`,
    steps: (s) => [
      { text: 'Here r′ = a.', tex: `r^2+r'^2=${s.a * s.a}(\\theta^2+1)` },
      { text: 'So the length is an integral with a square root of θ² + 1.', tex: `L=${s.a}\\int_0^{2\\pi}\\sqrt{\\theta^2+1}\\,d\\theta` },
      { text: 'Standard result: ∫√(θ²+1) dθ = ½[θ√(θ²+1) + ln(θ + √(θ²+1))].', tex: `L=\\tfrac{${s.a}}{2}\\Big[2\\pi\\sqrt{4\\pi^2+1}+\\ln(2\\pi+\\sqrt{4\\pi^2+1})\\Big]` },
      { text: `Value: ${g((s.a / 2) * (2 * Math.PI * Math.sqrt(4 * Math.PI ** 2 + 1) + Math.log(2 * Math.PI + Math.sqrt(4 * Math.PI ** 2 + 1))))}. Simpson check: ${g(simpson((t) => s.a * Math.sqrt(t * t + 1), 0, 2 * Math.PI, 4000))}.` },
    ],
  },
};
const state = { which: 'cyc', a: 1 };
const formula = liveFormula(document.querySelector('#formula'), (s) => PROBS[s.which].tex(s));
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps: (s) => PROBS[s.which].steps(s),
  controls: [
    { title: 'Choose a curve' },
    { key: 'which', label: 'Curve', options: Object.entries(PROBS).map(([k, v]) => [k, v.name.split(' ')[0] === 'One' ? 'Cycloid' : v.name.split(' ')[0]]) },
    { key: 'a', label: 'Scale a', min: 1, max: 5, step: 1 },
  ],
  onChange: (s) => formula.update(s),
});
