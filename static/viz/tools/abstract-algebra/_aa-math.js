// Pure maths for the whole abstract-algebra subject: number theory, permutations, finite groups, finite fields.
// Nothing here touches the page, so it can be checked on its own.

// ---------- number theory ----------
export const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const lcm = (a, b) => (a / gcd(a, b)) * b;
export const mod = (a, n) => ((a % n) + n) % n;

// Extended Euclid: g = x a + y b. `rows` lists every division a = q b + r that was made.
export function egcd(a, b) {
  const rows = [];
  let [r0, r1, s0, s1, t0, t1] = [a, b, 1, 0, 0, 1];
  const seq = [{ r: r0, s: s0, t: t0 }, { r: r1, s: s1, t: t1 }];
  while (r1 !== 0) {
    const q = Math.floor(r0 / r1);
    rows.push({ a: r0, b: r1, q, r: r0 - q * r1 });
    [r0, r1] = [r1, r0 - q * r1];
    [s0, s1] = [s1, s0 - q * s1];
    [t0, t1] = [t1, t0 - q * t1];
    seq.push({ r: r1, s: s1, t: t1 });
  }
  return { g: r0, x: s0, y: t0, rows, seq };
}

export function modpow(base, exp, m) {
  let result = 1n;
  let b = BigInt(base) % BigInt(m);
  let e = BigInt(exp);
  const M = BigInt(m);
  while (e > 0n) {
    if (e & 1n) result = (result * b) % M;
    b = (b * b) % M;
    e >>= 1n;
  }
  return Number(result % M);
}

// Square-and-multiply with every row recorded: bit i of the exponent, a^(2^i) mod m, and whether it was used.
export function squaring(a, e, m) {
  const rows = [];
  let power = mod(a, m);
  let result = 1 % m;
  let multiplications = 0;
  for (let i = 0, rest = e; rest > 0; i++, rest = Math.floor(rest / 2)) {
    const bit = rest % 2;
    rows.push({ i, power, bit });
    if (bit) {
      result = (result * power) % m;
      multiplications++;
    }
    if (Math.floor(rest / 2) > 0) power = (power * power) % m;
  }
  return { rows, result, squarings: Math.max(0, rows.length - 1), multiplications };
}

export function modinv(a, n) {
  const { g, x } = egcd(mod(a, n), n);
  return g === 1 ? mod(x, n) : null;
}

export function factor(n) {
  const out = [];
  for (let p = 2; p * p <= n; p++) {
    while (n % p === 0) { out.push(p); n /= p; }
  }
  if (n > 1) out.push(n);
  return out;
}

export const isPrime = (n) => n > 1 && factor(n).length === 1;
export const phi = (n) => { let count = 0; for (let k = 1; k <= n; k++) if (gcd(k, n) === 1) count++; return count; };
export const divisors = (n) => { const d = []; for (let k = 1; k <= n; k++) if (n % k === 0) d.push(k); return d; };
export const units = (n) => { const u = []; for (let k = 1; k < n; k++) if (gcd(k, n) === 1) u.push(k); return u; };
export const primesUpTo = (n) => { const out = []; for (let k = 2; k <= n; k++) if (isPrime(k)) out.push(k); return out; };
export const nextPrime = (n) => { let k = n + 1; while (!isPrime(k)) k++; return k; };

// ---------- permutations (0-based arrays: p[i] is where i goes). compose(p, q) means "q first, then p". ----------
export const identityPerm = (n) => [...Array(n).keys()];
export const compose = (p, q) => q.map((x) => p[x]);
export const invertPerm = (p) => { const out = []; p.forEach((x, i) => { out[x] = i; }); return out; };
export const samePerm = (p, q) => p.every((x, i) => x === q[i]);

export function cyclesOf(p) {
  const seen = new Set();
  const out = [];
  for (let i = 0; i < p.length; i++) {
    if (seen.has(i)) continue;
    const cycle = [];
    for (let j = i; !seen.has(j); j = p[j]) { seen.add(j); cycle.push(j); }
    out.push(cycle);
  }
  return out;
}

export function cycleText(p) {
  const parts = cyclesOf(p).filter((cy) => cy.length > 1).map((cy) => `(${cy.map((x) => x + 1).join(' ')})`);
  return parts.length ? parts.join('') : '(1)';
}

// Counting crossings between the two rows: the number of inversions.
export const inversions = (p) => { let k = 0; for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) if (p[i] > p[j]) k++; return k; };
export const permOrder = (p) => cyclesOf(p).reduce((acc, cy) => lcm(acc, cy.length), 1);
export const swapPerm = (n, a, b) => { const p = identityPerm(n); p[a] = b; p[b] = a; return p; };

export function allPerms(n) {
  if (n <= 1) return [[0]];
  const out = [];
  for (const rest of allPerms(n - 1)) {
    for (let at = 0; at <= rest.length; at++) {
      const p = [...rest.slice(0, at), n - 1, ...rest.slice(at)];
      out.push(p);
    }
  }
  return out;
}

// ---------- finite groups: { n, names, mul(i, j) -> k, id } ----------
export function makeGroup(names, mulTable, id = 0) {
  const n = names.length;
  const inv = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (mulTable[i][j] === id) inv[i] = j;
  return { n, names, id, table: mulTable, mul: (i, j) => mulTable[i][j], inv: (i) => inv[i] };
}

export function cyclicGroup(n, op = 'add') {
  const names = [...Array(n).keys()].map(String);
  return makeGroup(names, names.map((_, i) => names.map((__, j) => (i + j) % n)));
}

// r^k is element k, r^k f is element n + k. (r^a f^s)(r^b f^t) = r^(a + (-1)^s b) f^(s + t).
export function dihedralGroup(n) {
  const names = [];
  for (let k = 0; k < n; k++) names.push(k === 0 ? 'e' : k === 1 ? 'r' : `r${k}`);
  for (let k = 0; k < n; k++) names.push(k === 0 ? 'f' : `r${k}f`);
  const split = (i) => [i % n, i >= n ? 1 : 0];
  const table = names.map((_, i) => names.map((__, j) => {
    const [a, s] = split(i);
    const [b, t] = split(j);
    const k = mod(a + (s ? -b : b), n);
    return k + ((s + t) % 2) * n;
  }));
  return makeGroup(names, table);
}

export function permGroup(perms, nameOf = cycleText) {
  const index = new Map(perms.map((p, i) => [p.join(','), i]));
  const id = perms.findIndex((p) => p.every((x, i) => x === i));
  const table = perms.map((p) => perms.map((q) => index.get(compose(p, q).join(','))));
  return makeGroup(perms.map(nameOf), table, id);
}

export const symmetricGroup = (n) => permGroup(allPerms(n));
export const alternatingGroup = (n) => permGroup(allPerms(n).filter((p) => inversions(p) % 2 === 0));

export function productGroup(A, B) {
  const names = [];
  for (let i = 0; i < A.n; i++) for (let j = 0; j < B.n; j++) names.push(`${A.names[i]},${B.names[j]}`);
  const at = (i, j) => i * B.n + j;
  const table = names.map((_, x) => names.map((__, y) => {
    const [i, j, k, l] = [Math.floor(x / B.n), x % B.n, Math.floor(y / B.n), y % B.n];
    return at(A.mul(i, k), B.mul(j, l));
  }));
  return makeGroup(names, table, at(A.id, B.id));
}

// Quaternion group Q8: 1, -1, i, -i, j, -j, k, -k.
export function quaternionGroup() {
  const units = [[1, 0, 0, 0], [-1, 0, 0, 0], [0, 1, 0, 0], [0, -1, 0, 0], [0, 0, 1, 0], [0, 0, -1, 0], [0, 0, 0, 1], [0, 0, 0, -1]];
  const names = ['1', '-1', 'i', '-i', 'j', '-j', 'k', '-k'];
  const mulQ = ([a, b, c, d], [e, f, g, h]) => [a * e - b * f - c * g - d * h, a * f + b * e + c * h - d * g, a * g - b * h + c * e + d * f, a * h + b * g - c * f + d * e];
  const find = (q) => units.findIndex((u) => u.every((x, i) => x === q[i]));
  return makeGroup(names, units.map((u) => units.map((v) => find(mulQ(u, v)))));
}

export function orderOf(G, g) {
  let k = 1;
  let x = g;
  while (x !== G.id) { x = G.mul(x, g); k++; }
  return k;
}

// The subgroup generated by some elements, as a sorted list of indices.
export function generated(G, gens) {
  const set = new Set([G.id]);
  let frontier = [G.id];
  while (frontier.length) {
    const next = [];
    for (const x of frontier) for (const g of gens) {
      const y = G.mul(x, g);
      if (!set.has(y)) { set.add(y); next.push(y); }
    }
    frontier = next;
  }
  return [...set].sort((a, b) => a - b);
}

export const isAbelian = (G) => G.table.every((row, i) => row.every((v, j) => v === G.table[j][i]));
export const leftCosets = (G, H) => cosetsWith(G, H, (g, h) => G.mul(g, h));
export const rightCosets = (G, H) => cosetsWith(G, H, (g, h) => G.mul(h, g));
function cosetsWith(G, H, product) {
  const seen = new Set();
  const out = [];
  for (let g = 0; g < G.n; g++) {
    if (seen.has(g)) continue;
    const coset = H.map((h) => product(g, h)).sort((a, b) => a - b);
    coset.forEach((x) => seen.add(x));
    out.push(coset);
  }
  return out;
}
export const orderCounts = (G) => {
  const counts = {};
  for (let g = 0; g < G.n; g++) { const o = orderOf(G, g); counts[o] = (counts[o] || 0) + 1; }
  return counts;
};

// Every subgroup of G that two elements generate (enough for small groups like A4), as arrays of indices.
export function subgroupsBy2(G) {
  const seen = new Map();
  for (let a = 0; a < G.n; a++) for (let b = a; b < G.n; b++) {
    const H = generated(G, [a, b]);
    seen.set(H.join(','), H);
  }
  return [...seen.values()];
}

export function commutatorSubgroup(G) {
  const gens = [];
  for (let a = 0; a < G.n; a++) for (let b = 0; b < G.n; b++) gens.push(G.mul(G.mul(a, b), G.mul(G.inv(a), G.inv(b))));
  return generated(G, [...new Set(gens)]);
}

// The derived series of G, as group sizes: G, [G, G], [[G, G], [G, G]], ... until it stops shrinking.
export function derivedSeries(G) {
  const sizes = [G.n];
  let current = G;
  for (let guard = 0; guard < 12; guard++) {
    const H = commutatorSubgroup(current);
    sizes.push(H.length);
    if (H.length === current.n) break;
    const sub = restrict(current, H);
    current = sub;
    if (H.length === 1) break;
  }
  return sizes;
}

function restrict(G, H) {
  const pos = new Map(H.map((x, i) => [x, i]));
  const table = H.map((a) => H.map((b) => pos.get(G.mul(a, b))));
  return makeGroup(H.map((x) => G.names[x]), table, pos.get(G.id));
}

// ---------- polynomials over Z_p: arrays of coefficients, lowest degree first ----------
export function polyMulMod(a, b, f, p) {
  const prod = Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => { prod[i + j] = (prod[i + j] + x * y) % p; }));
  return polyRemMod(prod, f, p);
}
// f must be monic.
export function polyRemMod(a, f, p) {
  const r = a.map((x) => mod(x, p));
  const d = f.length - 1;
  for (let i = r.length - 1; i >= d; i--) {
    const k = r[i];
    if (k) for (let j = 0; j <= d; j++) r[i - d + j] = mod(r[i - d + j] - k * f[j], p);
  }
  const out = r.slice(0, d);
  while (out.length < d) out.push(0);
  return out;
}

// GF(p^n): elements numbered 0..p^n-1 by their coefficients in base p; f is the monic irreducible polynomial.
export function finiteField(p, f) {
  const n = f.length - 1;
  const size = p ** n;
  const toPoly = (k) => { const out = []; for (let i = 0; i < n; i++) { out.push(k % p); k = Math.floor(k / p); } return out; };
  const toNum = (q) => q.reduce((acc, x, i) => acc + x * p ** i, 0);
  const add = [];
  const times = [];
  for (let i = 0; i < size; i++) {
    add.push([]);
    times.push([]);
    for (let j = 0; j < size; j++) {
      add[i].push(toNum(toPoly(i).map((x, k) => (x + toPoly(j)[k]) % p)));
      times[i].push(toNum(polyMulMod(toPoly(i), toPoly(j), f, p)));
    }
  }
  const text = (k) => {
    const q = toPoly(k);
    const terms = [];
    for (let i = n - 1; i >= 0; i--) if (q[i]) terms.push((i === 0 ? `${q[i]}` : `${q[i] > 1 ? q[i] : ''}x${i > 1 ? `^${i}` : ''}`));
    return terms.length ? terms.join('+') : '0';
  };
  return { p, n, size, add, times, text, toPoly };
}

export const evalPolyMod = (coeffs, x, p) => coeffs.reduce((acc, c, i) => (acc + c * x ** i) % p, 0);

// ---------- Boolean ----------
export const bits = (n, width) => n.toString(2).padStart(width, '0');
