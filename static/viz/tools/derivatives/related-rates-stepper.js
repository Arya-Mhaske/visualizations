import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';

// Write the relation, differentiate in t, substitute, solve. Every answer is exact, then rounded for display.
const r2 = (v, d = 3) => String(Number(v.toFixed(d))).replace('-', '-');
const PROBS = {
  ladder: {
    name: 'Ladder sliding down a wall',
    sliders: [{ key: 'a', label: 'Foot distance x', min: 2, max: 9, step: 0.5, unit: 'ft' }, { key: 'b', label: 'Foot speed dx/dt', min: 0.5, max: 4, step: 0.5, unit: 'ft/s' }],
    start: { a: 6, b: 2 },
    steps: (s) => {
      const L = 10; const x = s.a; const u = s.b; const y = Math.sqrt(L * L - x * x); const v = -(x * u) / y;
      return [
        { text: 'A 10 ft ladder leans on a wall. The foot is pulled out. Relation between the two distances:', tex: 'x^2+y^2=100' },
        { text: 'Differentiate both sides with respect to t. Both x and y change with time, so the chain rule gives:', tex: '2x\\,\\dfrac{dx}{dt}+2y\\,\\dfrac{dy}{dt}=0' },
        { text: 'Solve for the unknown rate:', tex: '\\dfrac{dy}{dt}=-\\dfrac{x}{y}\\,\\dfrac{dx}{dt}' },
        { text: `Only now put in the numbers. With x = ${x} the other side is y = ${r2(y)}.`, tex: `y=\\sqrt{100-${x}^2}=${r2(y)}` },
        { text: 'Substitute the rates and the distances.', tex: `\\dfrac{dy}{dt}=-\\dfrac{${x}}{${r2(y)}}(${u})=${r2(v)}\\ \\text{ft/s}` },
        { text: v < 0 ? 'Negative: the top is sliding down.' : 'Check the sign.' },
      ];
    },
    tex: (s) => `x=${s.a},\\ \\dfrac{dx}{dt}=${s.b}`,
  },
  balloon: {
    name: 'Balloon filling with air',
    sliders: [{ key: 'a', label: 'Radius r', min: 2, max: 20, step: 1, unit: 'cm' }, { key: 'b', label: 'Air rate dV/dt', min: 50, max: 300, step: 10, unit: 'cm³/s' }],
    start: { a: 10, b: 100 },
    steps: (s) => {
      const r = s.a; const k = s.b; const v = k / (4 * Math.PI * r * r);
      return [
        { text: 'A spherical balloon fills with air. Relation between volume and radius:', tex: 'V=\\dfrac43\\pi r^3' },
        { text: 'Differentiate in t. The radius depends on time, so r³ gets a 3r² and a dr/dt:', tex: '\\dfrac{dV}{dt}=4\\pi r^2\\,\\dfrac{dr}{dt}' },
        { text: 'Solve for the unknown rate:', tex: '\\dfrac{dr}{dt}=\\dfrac{1}{4\\pi r^2}\\,\\dfrac{dV}{dt}' },
        { text: `Substitute r = ${r} cm and dV/dt = ${k} cm³/s.`, tex: `\\dfrac{dr}{dt}=\\dfrac{${k}}{4\\pi(${r})^2}=${r2(v, 4)}\\ \\text{cm/s}` },
        { text: 'Try a bigger radius: the same air rate gives a smaller dr/dt.' },
      ];
    },
    tex: (s) => `r=${s.a},\\ \\dfrac{dV}{dt}=${s.b}`,
  },
  ripple: {
    name: 'Circular ripple on a pond',
    sliders: [{ key: 'a', label: 'Radius r', min: 2, max: 40, step: 2, unit: 'cm' }, { key: 'b', label: 'Ripple speed dr/dt', min: 2, max: 20, step: 1, unit: 'cm/s' }],
    start: { a: 20, b: 5 },
    steps: (s) => {
      const r = s.a; const u = s.b; const v = 2 * Math.PI * r * u;
      return [
        { text: 'A circular ripple spreads out. Relation between area and radius:', tex: 'A=\\pi r^2' },
        { text: 'Differentiate in t:', tex: '\\dfrac{dA}{dt}=2\\pi r\\,\\dfrac{dr}{dt}' },
        { text: `Substitute r = ${r} cm and dr/dt = ${u} cm/s.`, tex: `\\dfrac{dA}{dt}=2\\pi(${r})(${u})=${r2(v, 1)}\\ \\text{cm}^2/\\text{s}` },
        { text: 'The area grows faster as the ripple gets bigger, even at a steady radius speed.' },
      ];
    },
    tex: (s) => `r=${s.a},\\ \\dfrac{dr}{dt}=${s.b}`,
  },
};
const state = { which: 'ladder', ...PROBS.ladder.start };
const P = () => PROBS[state.which];
const formula = liveFormula(document.querySelector('#formula'), (s) => PROBS[s.which].tex(s));
formula.update(state);

let stepper;
const sliderSpec = () => PROBS[state.which].sliders.map((d) => ({ key: d.key, label: d.label, min: d.min, max: d.max, step: d.step, format: (v) => `${v} ${d.unit}` }));
const spec = () => [
  { title: 'Choose a problem' },
  { key: 'which', label: 'Problem', options: Object.entries(PROBS).map(([k, v]) => [k, v.name]) },
  // Sliders for all problems share keys a and b; ranges are rewritten when the problem changes.
  ...sliderSpec(),
];

stepper = createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps: (s) => PROBS[s.which].steps(s),
  controls: spec(),
  onChange: (s) => {
    // Reset the shared sliders to the new problem's range when the problem changes.
    const inputs = document.querySelectorAll('#panel input.nb-range');
    PROBS[s.which].sliders.forEach((d, i) => {
      const input = inputs[i];
      if (!input) return;
      if (Number(input.min) !== d.min || Number(input.max) !== d.max) {
        input.min = d.min; input.max = d.max; input.step = d.step;
        s[d.key] = PROBS[s.which].start[d.key];
        input.value = s[d.key];
      }
      const out = input.parentElement.querySelector('output');
      const label = input.parentElement.querySelector('label');
      if (label) label.firstChild.textContent = `${d.label} `;
      if (out) out.textContent = `${s[d.key]} ${d.unit}`;
    });
    formula.update(s);
  },
});
