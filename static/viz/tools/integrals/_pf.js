// Partial-fraction examples. Each piece has a function, an antiderivative and TeX for both.
export const PF = {
  lin2: {
    name: '(3x + 5) / ((x − 1)(x + 2))',
    tex: '\\dfrac{3x+5}{(x-1)(x+2)}',
    f: (x) => (3 * x + 5) / ((x - 1) * (x + 2)),
    a: 2, b: 4,
    pieces: [
      { tex: '\\dfrac{8/3}{x-1}', f: (x) => 8 / 3 / (x - 1), F: (x) => (8 / 3) * Math.log(Math.abs(x - 1)), Ftex: '\\tfrac83\\ln|x-1|' },
      { tex: '\\dfrac{1/3}{x+2}', f: (x) => 1 / 3 / (x + 2), F: (x) => (1 / 3) * Math.log(Math.abs(x + 2)), Ftex: '\\tfrac13\\ln|x+2|' },
    ],
  },
  diff: {
    name: '1 / (x² − 1)',
    tex: '\\dfrac{1}{x^2-1}',
    f: (x) => 1 / (x * x - 1),
    a: 2, b: 4,
    pieces: [
      { tex: '\\dfrac{1/2}{x-1}', f: (x) => 0.5 / (x - 1), F: (x) => 0.5 * Math.log(Math.abs(x - 1)), Ftex: '\\tfrac12\\ln|x-1|' },
      { tex: '\\dfrac{-1/2}{x+1}', f: (x) => -0.5 / (x + 1), F: (x) => -0.5 * Math.log(Math.abs(x + 1)), Ftex: '-\\tfrac12\\ln|x+1|' },
    ],
  },
  quad: {
    name: '1 / (x (x² + 1))',
    tex: '\\dfrac{1}{x(x^2+1)}',
    f: (x) => 1 / (x * (x * x + 1)),
    a: 1, b: 3,
    pieces: [
      { tex: '\\dfrac{1}{x}', f: (x) => 1 / x, F: (x) => Math.log(Math.abs(x)), Ftex: '\\ln|x|' },
      { tex: '\\dfrac{-x}{x^2+1}', f: (x) => -x / (x * x + 1), F: (x) => -0.5 * Math.log(x * x + 1), Ftex: '-\\tfrac12\\ln(x^2+1)' },
    ],
  },
  arctan: {
    name: '5 / ((x + 1)(x² + 4))',
    tex: '\\dfrac{5}{(x+1)(x^2+4)}',
    f: (x) => 5 / ((x + 1) * (x * x + 4)),
    a: 0, b: 3,
    pieces: [
      { tex: '\\dfrac{1}{x+1}', f: (x) => 1 / (x + 1), F: (x) => Math.log(Math.abs(x + 1)), Ftex: '\\ln|x+1|' },
      { tex: '\\dfrac{-x}{x^2+4}', f: (x) => -x / (x * x + 4), F: (x) => -0.5 * Math.log(x * x + 4), Ftex: '-\\tfrac12\\ln(x^2+4)' },
      { tex: '\\dfrac{1}{x^2+4}', f: (x) => 1 / (x * x + 4), F: (x) => 0.5 * Math.atan(x / 2), Ftex: '\\tfrac12\\arctan\\tfrac{x}{2}' },
    ],
  },
};
export const pieceSum = (e, x) => e.pieces.reduce((s, p) => s + p.f(x), 0);
export const antiAt = (e, x) => e.pieces.reduce((s, p) => s + p.F(x), 0);
