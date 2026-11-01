// Pure helpers for the differential-equations tools. No DOM.
// solve(f, y0, t0, t1, n): RK4 for a system y' = f(t, y) with y an array. Returns rows [t, ...y].
export function solve(f, y0, t0, t1, n) {
  const h = (t1 - t0) / n;
  let y = y0.slice();
  let t = t0;
  const out = [[t, ...y]];
  const add = (a, b, s) => a.map((v, j) => v + s * b[j]);
  for (let i = 0; i < n; i++) {
    const k1 = f(t, y);
    const k2 = f(t + h / 2, add(y, k1, h / 2));
    const k3 = f(t + h / 2, add(y, k2, h / 2));
    const k4 = f(t + h, add(y, k3, h));
    y = y.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
    t += h;
    out.push([t, ...y]);
  }
  return out;
}

// Euler's method for y' = f(x, y): n steps of size h. Returns [[x, y], ...].
export function euler(f, x0, y0, h, n) {
  const out = [[x0, y0]];
  let x = x0;
  let y = y0;
  for (let i = 0; i < n; i++) {
    y += h * f(x, y);
    x += h;
    out.push([x, y]);
  }
  return out;
}

// Lotka–Volterra: x' = a x - b x y (prey), y' = -c y + d x y (predators).
export const lotkaVolterra = (a, b, c, d) => (t, [x, y]) => [a * x - b * x * y, -c * y + d * x * y];
// The conserved quantity of Lotka–Volterra, constant along every orbit.
export const lvInvariant = (a, b, c, d, x, y) => d * x - c * Math.log(x) + b * y - a * Math.log(y);

// Logistic with harvest: P' = r P (1 - P/K) - H
export const harvest = (r, K, H) => (t, [P]) => [r * P * (1 - P / K) - H];

// Roots of P' = 0 for the harvested logistic, smaller first; [] when H > rK/4.
export function harvestRoots(r, K, H) {
  const disc = (r * K) ** 2 - 4 * r * K * H; // r P (1 - P/K) = H  =>  P^2 - K P + H K / r = 0 ... scaled
  const D = K * K - (4 * K * H) / r;
  void disc;
  if (D < 0) return [];
  return [(K - Math.sqrt(D)) / 2, (K + Math.sqrt(D)) / 2];
}
