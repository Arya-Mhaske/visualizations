// Pure maths for the Counting and Binomial theorem boxes (no DOM).
export const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
export const nPr = (n, r) => fact(n) / fact(n - r);
export const nCr = (n, r) => (r < 0 || r > n ? 0 : Math.round(nPr(n, r) / fact(r)));
export const multichoose = (n, r) => nCr(n + r - 1, r);
export function permutations(items) {
  if (items.length <= 1) return [items.join('')];
  return items.flatMap((x, i) => permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((p) => x + p));
}
export function combos(items, r) {
  if (r === 0) return [[]];
  if (items.length < r) return [];
  const [head, ...rest] = items;
  return [...combos(rest, r - 1).map((c) => [head, ...c]), ...combos(rest, r)];
}
export const letterCounts = (word) => Object.entries([...word].reduce((m, ch) => ({ ...m, [ch]: (m[ch] || 0) + 1 }), {}));
export const distinctArrangements = (word) => letterCounts(word).reduce((t, [, k]) => t / fact(k), fact(word.length));
export const term = (n, r, p, q) => nCr(n, r) * p ** (n - r) * q ** r;
export const fib = (n) => (n <= 2 ? 1 : fib(n - 1) + fib(n - 2));
