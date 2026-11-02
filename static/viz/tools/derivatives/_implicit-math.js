// Implicit curves F(x, y) = 0 with exact partial derivatives, so dy/dx = -Fx/Fy.
// Each curve lists four integer points that lie on it, and the working in TeX for the stepper.
export const CURVES = {
  circle: {
    name: 'x² + y² = 25', tex: 'x^2+y^2=25',
    F: (x, y) => x * x + y * y - 25, Fx: (x) => 2 * x, Fy: (x, y) => 2 * y,
    points: [[3, 4], [4, 3], [-3, 4], [3, -4]],
    diff: "2x+2y\\,y'=0", collect: "2y\\,y'=-2x", solve: "y'=-\\dfrac{x}{y}",
    slope: (x, y) => -x / y,
  },
  hyperbola: {
    name: 'xy = 12', tex: 'xy=12',
    F: (x, y) => x * y - 12, Fx: (x, y) => y, Fy: (x) => x,
    points: [[3, 4], [4, 3], [2, 6], [6, 2]],
    diff: "y+x\\,y'=0\\ \\ (\\text{product rule})", collect: "x\\,y'=-y", solve: "y'=-\\dfrac{y}{x}",
    slope: (x, y) => -y / x,
  },
  tilted: {
    name: 'x² + xy + y² = 7', tex: 'x^2+xy+y^2=7',
    F: (x, y) => x * x + x * y + y * y - 7, Fx: (x, y) => 2 * x + y, Fy: (x, y) => x + 2 * y,
    points: [[1, 2], [2, 1], [2, -3], [-3, 2]],
    diff: "2x+\\left(y+x\\,y'\\right)+2y\\,y'=0", collect: "(x+2y)\\,y'=-(2x+y)", solve: "y'=-\\dfrac{2x+y}{x+2y}",
    slope: (x, y) => -(2 * x + y) / (x + 2 * y),
  },
  elliptic: {
    name: 'y² = x³ + 1', tex: 'y^2=x^3+1',
    F: (x, y) => y * y - x ** 3 - 1, Fx: (x) => -3 * x * x, Fy: (x, y) => 2 * y,
    points: [[2, 3], [2, -3], [0, 1], [0, -1]],
    diff: "2y\\,y'=3x^2", collect: "2y\\,y'=3x^2", solve: "y'=\\dfrac{3x^2}{2y}",
    slope: (x, y) => (3 * x * x) / (2 * y),
  },
};

export const slopeAt = (curve, x, y) => -curve.Fx(x, y) / curve.Fy(x, y);

// Slope found by nudging x either way and sliding y back onto the curve with Newton's method.
export function nudge(curve, x, y, h = 1e-4) {
  const back = (xx) => {
    let yy = y;
    for (let i = 0; i < 40; i++) yy -= curve.F(xx, yy) / curve.Fy(xx, yy);
    return yy;
  };
  return (back(x + h) - back(x - h)) / (2 * h);
}
