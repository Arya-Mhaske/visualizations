// Capacitor maths (SI). Areas in cm², gaps in mm, charge in nC, capacitance in pF unless a name says otherwise.
export const EPS0 = 8.854e-12;
export const cap = (Acm2, dmm, K = 1) => (K * EPS0 * Acm2 * 1e-4) / (dmm * 1e-3); // farads
export const pF = (c) => c * 1e12;
export const series = (...cs) => 1 / cs.reduce((p, c) => p + 1 / c, 0);
export const parallel = (...cs) => cs.reduce((p, c) => p + c, 0);
// A network is { t: 'c', i } for capacitor i, or { t: 's' | 'p', kids: [...] }.
export function equivalent(node, values) {
  if (node.t === 'c') return values[node.i];
  const parts = node.kids.map((k) => equivalent(k, values));
  return node.t === 's' ? series(...parts) : parallel(...parts);
}
