import { createStepper } from '../../lib/stepper.js';
import { fixed } from '../../lib/format.js';
import { exact } from './_ig.js';

// The three roots, the matching substitution, what the root becomes, and a numeric check of ∫ dx / root.
const FORMS = {
  sin: {
    name: '√(a² − x²)',
    root: '\\sqrt{a^2-x^2}',
    sub: 'x=a\\sin\\theta',
    dx: 'dx=a\\cos\\theta\\,d\\theta',
    becomes: 'a^2-a^2\\sin^2\\theta=a^2\\cos^2\\theta\\ \\Rightarrow\\ \\sqrt{\\ }=a\\cos\\theta',
    integral: '\\int\\dfrac{dx}{\\sqrt{a^2-x^2}}=\\int d\\theta=\\theta',
    back: '\\arcsin\\dfrac{x}{a}+C',
    tri: 'hypotenuse a, side x opposite θ, other side √(a² − x²)',
    f: (a) => (x) => 1 / Math.sqrt(a * a - x * x),
    F: (a) => (x) => Math.asin(x / a),
    lo: 0,
    hi: (a) => 0.8 * a,
  },
  tan: {
    name: '√(a² + x²)',
    root: '\\sqrt{a^2+x^2}',
    sub: 'x=a\\tan\\theta',
    dx: 'dx=a\\sec^2\\theta\\,d\\theta',
    becomes: 'a^2+a^2\\tan^2\\theta=a^2\\sec^2\\theta\\ \\Rightarrow\\ \\sqrt{\\ }=a\\sec\\theta',
    integral: '\\int\\dfrac{dx}{\\sqrt{a^2+x^2}}=\\int\\sec\\theta\\,d\\theta=\\ln|\\sec\\theta+\\tan\\theta|',
    back: '\\ln\\left(x+\\sqrt{a^2+x^2}\\right)+C',
    tri: 'legs a and x, hypotenuse √(a² + x²)',
    f: (a) => (x) => 1 / Math.sqrt(a * a + x * x),
    F: (a) => (x) => Math.log(x + Math.sqrt(a * a + x * x)),
    lo: 0,
    hi: (a) => 3 * a,
  },
  sec: {
    name: '√(x² − a²)',
    root: '\\sqrt{x^2-a^2}',
    sub: 'x=a\\sec\\theta',
    dx: 'dx=a\\sec\\theta\\tan\\theta\\,d\\theta',
    becomes: 'a^2\\sec^2\\theta-a^2=a^2\\tan^2\\theta\\ \\Rightarrow\\ \\sqrt{\\ }=a\\tan\\theta',
    integral: '\\int\\dfrac{dx}{\\sqrt{x^2-a^2}}=\\int\\sec\\theta\\,d\\theta=\\ln|\\sec\\theta+\\tan\\theta|',
    back: '\\ln\\left|x+\\sqrt{x^2-a^2}\\right|+C',
    tri: 'hypotenuse x, side a, other side √(x² − a²)',
    f: (a) => (x) => 1 / Math.sqrt(x * x - a * a),
    F: (a) => (x) => Math.log(x + Math.sqrt(x * x - a * a)),
    lo: (a) => 1.5 * a,
    hi: (a) => 4 * a,
  },
};
const state = { form: 'sin', a: 2 };
const val = (g, a) => (typeof g === 'function' ? g(a) : g);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  controls: [
    { title: 'Name the root' },
    { key: 'form', label: 'The root looks like', options: Object.entries(FORMS).map(([k, v]) => [k, v.name]) },
    { key: 'a', label: 'a', min: 1, max: 4, step: 0.5, format: (v) => fixed(v, 1) },
  ],
  steps: (s) => {
    const F = FORMS[s.form];
    const lo = val(F.lo, s.a);
    const hi = val(F.hi, s.a);
    const area = exact(F.f(s.a), lo, hi);
    const formula = F.F(s.a)(hi) - F.F(s.a)(lo);
    return [
      { text: `The integral contains ${F.name}. The form picks the substitution.`, tex: F.root },
      { text: 'Substitute for x.', tex: F.sub },
      { text: 'Differentiate to get dx.', tex: F.dx },
      { text: 'The triangle behind it: ' + F.tri + '. The root is a single trig term.', tex: F.becomes },
      { text: 'Rewrite and integrate. The root has disappeared.', tex: F.integral },
      { text: 'Put x back using the triangle.', tex: F.back },
      { text: `Check for a = ${fixed(s.a, 1)} from x = ${fixed(lo, 2)} to ${fixed(hi, 2)}: the area under 1/root is ${fixed(area, 5)}, and the formula gives ${fixed(formula, 5)}.` },
    ];
  },
});
