// ε–δ helpers: the largest δ such that |f(x) − L| < ε whenever 0 < |x − a| < δ (scanned outward).
export function bestDelta(f, a, L, eps, maxD = 3, steps = 6000) {
  let last = 0;
  for (let i = 1; i <= steps; i++) {
    const d = (maxD * i) / steps;
    if (!(Math.abs(f(a - d) - L) < eps) || !(Math.abs(f(a + d) - L) < eps)) return last;
    last = d;
  }
  return maxD;
}
