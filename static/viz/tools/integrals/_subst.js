// Substitution examples: integrand f(g(x))·g′(x), with inner g, outer f and outer antiderivative Fo.
export const EX = {
  cosx2: { name: '2x cos(x²)', tex: '2x\\cos(x^2)', u: 'x^2', fTex: '\\cos u', FoTex: '\\sin u', g: (x) => x * x, gp: (x) => 2 * x, f: Math.cos, Fo: Math.sin, x0: 0, x1: 2, view: [[0, 2], [-4.5, 4.5]] },
  expx3: { name: '3x² e^(x³)', tex: '3x^2e^{x^3}', u: 'x^3', fTex: 'e^u', FoTex: 'e^u', g: (x) => x ** 3, gp: (x) => 3 * x * x, f: Math.exp, Fo: Math.exp, x0: 0, x1: 1.5, view: [[0, 1.5], [0, 30]] },
  esin: { name: 'cos x · e^(sin x)', tex: '\\cos x\\,e^{\\sin x}', u: '\\sin x', fTex: 'e^u', FoTex: 'e^u', g: Math.sin, gp: Math.cos, f: Math.exp, Fo: Math.exp, x0: 0, x1: 3, view: [[0, 3], [-3, 3]] },
  lnx: { name: '(ln x)/x', tex: '\\dfrac{\\ln x}{x}', u: '\\ln x', fTex: 'u', FoTex: '\\dfrac{u^2}{2}', g: Math.log, gp: (x) => 1 / x, f: (u) => u, Fo: (u) => (u * u) / 2, x0: 1, x1: 5, view: [[1, 5], [-0.2, 1.8]] },
};
export const integrand = (e, x) => e.f(e.g(x)) * e.gp(x);
