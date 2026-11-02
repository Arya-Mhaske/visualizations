// Pure maths for the linear-algebra tools. No DOM. Matrices are arrays of rows, vectors are arrays.
// 2 × 2: det2 tr2 mul2 apply2 inv2 eig2 svd2 rot2 expm2.  Any size: mul matVec transpose solve det inverse rref rank nullBasis
// eliminate (the log of Gaussian elimination), lstsq, project, gramSchmidt.  Text: num, bmat, vecTex.
import { fixed, frac } from '../../lib/format.js';

const EPS = 1e-10;
const clean = (x) => (Math.abs(x) < EPS ? 0 : x);

export const det2 = ([[a, b], [c, d]]) => a * d - b * c;
export const tr2 = ([[a], [, d]]) => a + d;
export const mul2 = (A, B) => A.map((r) => [0, 1].map((j) => r[0] * B[0][j] + r[1] * B[1][j]));
export const apply2 = (A, [x, y]) => [A[0][0] * x + A[0][1] * y, A[1][0] * x + A[1][1] * y];
export const inv2 = (A) => { const D = det2(A); return D === 0 ? null : [[A[1][1] / D, -A[0][1] / D], [-A[1][0] / D, A[0][0] / D]]; };
export const rot2 = (t) => [[Math.cos(t), -Math.sin(t)], [Math.sin(t), Math.cos(t)]];
export const diag2 = (p, q) => [[p, 0], [0, q]];
export const rad = (d) => (d * Math.PI) / 180;

// Eigenvalues and unit eigenvectors of a real 2 × 2. real: false gives re ± i·im. v[1] is null for a defective matrix.
export function eig2(A) {
  const [[a, b], [c, d]] = A;
  const t = a + d;
  const D = a * d - b * c;
  const disc = (t * t) / 4 - D;
  if (disc < -1e-12) return { real: false, re: t / 2, im: Math.sqrt(-disc), trace: t, det: D };
  const r = Math.sqrt(Math.max(disc, 0));
  const l = [t / 2 + r, t / 2 - r];
  const unit = (v) => { const n = Math.hypot(...v); return v.map((x) => x / n); };
  const vec = (lam) => {
    const options = [[b, lam - a], [lam - d, c]].filter((v) => Math.hypot(...v) > 1e-9);
    if (options.length === 0) return null;
    return unit(options.sort((p, q) => Math.hypot(...q) - Math.hypot(...p))[0]);
  };
  let v = l.map(vec);
  const scalar = Math.abs(b) < 1e-12 && Math.abs(c) < 1e-12 && Math.abs(a - d) < 1e-12;
  if (scalar) v = [[1, 0], [0, 1]];
  else if (r < 1e-9) v = [v[0], null];
  else if (!v[0] || !v[1]) v = [v[0] || [1, 0], v[1] || [0, 1]];
  return { real: true, l, v, trace: t, det: D, defective: !scalar && r < 1e-9 };
}

// A = R(γ) diag(s1, s2) R(β): two rotations and a stretch. s2 may be negative (that is a reflection folded in).
export function svd2(A) {
  const E = (A[0][0] + A[1][1]) / 2;
  const F = (A[0][0] - A[1][1]) / 2;
  const G = (A[1][0] + A[0][1]) / 2;
  const H = (A[1][0] - A[0][1]) / 2;
  const Q = Math.hypot(E, H);
  const R = Math.hypot(F, G);
  const a1 = Math.atan2(G, F);
  const a2 = Math.atan2(H, E);
  return { s: [Q + R, Q - R], beta: (a2 - a1) / 2, gamma: (a2 + a1) / 2 };
}
export const svdParts = (A) => { const { s, beta, gamma } = svd2(A); return { s, V: rot2(beta), U: rot2(gamma), beta, gamma }; };

// e^{At} u by scaling and squaring a Taylor series.
export function expm2(A, t) {
  let n = 0;
  let norm = Math.max(...A.flat().map(Math.abs)) * Math.abs(t);
  while (norm > 0.5) { norm /= 2; n++; }
  const M = A.map((r) => r.map((x) => (x * t) / 2 ** n));
  let term = [[1, 0], [0, 1]];
  let sum = [[1, 0], [0, 1]];
  for (let k = 1; k < 20; k++) {
    term = mul2(term, M).map((r) => r.map((x) => x / k));
    sum = sum.map((r, i) => r.map((x, j) => x + term[i][j]));
  }
  for (let i = 0; i < n; i++) sum = mul2(sum, sum);
  return sum;
}

// ---- any size ----
export const transpose = (M) => M[0].map((_, j) => M.map((r) => r[j]));
export const mul = (A, B) => A.map((r) => B[0].map((_, j) => r.reduce((s, x, k) => s + x * B[k][j], 0)));
export const matVec = (A, x) => A.map((r) => r.reduce((s, v, j) => s + v * x[j], 0));
export const identity = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)));
export const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
export const norm = (a) => Math.hypot(...a);

// Solve A x = b by elimination with partial pivoting. null when A is singular.
export function solve(A, b) {
  const n = A.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) x[i] = (M[i][n] - M[i].slice(i + 1, n).reduce((s, v, j) => s + v * x[i + 1 + j], 0)) / M[i][i];
  return x;
}

export function det(A) {
  const n = A.length;
  const M = A.map((r) => [...r]);
  let d = 1;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) return 0;
    if (p !== c) { [M[c], M[p]] = [M[p], M[c]]; d = -d; }
    d *= M[c][c];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k < n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return d;
}

export function inverse(A) {
  const n = A.length;
  const cols = identity(n).map((e) => solve(A, e));
  return cols.some((c) => !c) ? null : transpose(cols);
}

// Reduced row echelon form, with the pivot columns.
export function rref(A) {
  const R = A.map((r) => [...r]);
  const pivots = [];
  let row = 0;
  for (let c = 0; c < R[0].length && row < R.length; c++) {
    let p = row;
    for (let r = row + 1; r < R.length; r++) if (Math.abs(R[r][c]) > Math.abs(R[p][c])) p = r;
    if (Math.abs(R[p][c]) < 1e-10) continue;
    [R[row], R[p]] = [R[p], R[row]];
    const f = R[row][c];
    R[row] = R[row].map((x) => x / f);
    for (let r = 0; r < R.length; r++) {
      if (r === row) continue;
      const g = R[r][c];
      R[r] = R[r].map((x, k) => x - g * R[row][k]);
    }
    pivots.push(c);
    row++;
  }
  return { R: R.map((r) => r.map(clean)), pivots };
}
export const rank = (A) => rref(A).pivots.length;

// A basis for the nullspace: one special solution for each free column.
export function nullBasis(A) {
  const { R, pivots } = rref(A);
  const n = A[0].length;
  return Array.from({ length: n }, (_, c) => c).filter((c) => !pivots.includes(c)).map((free) => {
    const x = new Array(n).fill(0);
    x[free] = 1;
    pivots.forEach((pc, i) => { x[pc] = clean(-R[i][free]); });
    return x;
  });
}

// Gaussian elimination, stopping at the first column with no pivot. A zero pivot is rescued by a row swap when one exists
// (allowSwap) and the largest pivot is taken when partial is true.
// steps: swap, elim ({row, col, l}), stuck (zero pivot, swaps not allowed) or fail (no pivot in that column: singular).
// Each step carries a copy of the matrix after it.
export function eliminate(A, { partial = false, allowSwap = true } = {}) {
  const n = A.length;
  const M = A.map((r) => [...r]);
  const steps = [];
  const mults = [];
  const snap = () => M.map((r) => r.map(clean));
  for (let c = 0; c < n; c++) {
    let p = c;
    if (partial) { for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c]) + 1e-12) p = r; }
    else if (Math.abs(M[c][c]) < 1e-10) { for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > 1e-10) { p = r; break; } }
    if (Math.abs(M[p][c]) < 1e-10) { steps.push({ kind: 'fail', col: c, M: snap() }); break; }
    if (p !== c && !allowSwap) { steps.push({ kind: 'stuck', col: c, row: p, M: snap() }); break; }
    if (p !== c) { [M[c], M[p]] = [M[p], M[c]]; steps.push({ kind: 'swap', a: c, b: p, M: snap() }); }
    for (let r = c + 1; r < n; r++) {
      const l = M[r][c] / M[c][c];
      if (Math.abs(l) < 1e-12) continue;
      for (let k = c; k < M[r].length; k++) M[r][k] -= l * M[c][k];
      steps.push({ kind: 'elim', row: r, col: c, l, M: snap() });
      mults.push({ row: r, col: c, l });
    }
  }
  return { steps, U: snap(), mults, swapped: steps.some((s) => s.kind === 'swap'), failed: steps.some((s) => s.kind === 'fail' || s.kind === 'stuck') };
}

// ---- least squares ----
export const lstsq = (A, b, w = null) => {
  const At = transpose(A).map((r) => r.map((x, i) => (w ? x * w[i] : x)));
  return solve(mul(At, A), matVec(At, b));
};
export const polyDesign = (ts, degree) => ts.map((t) => Array.from({ length: degree + 1 }, (_, k) => t ** k));
export const polyFitLS = (pts, degree, w = null) => lstsq(polyDesign(pts.map((p) => p[0]), degree), pts.map((p) => p[1]), w);
export const evalPoly = (coef, t) => coef.reduce((s, c, k) => s + c * t ** k, 0);

// Projection of b onto the column space of A (columns given as arrays). Returns x̂, p and the error e.
export function project(A, b) {
  const x = lstsq(A, b);
  const p = matVec(A, x);
  return { x, p, e: b.map((v, i) => v - p[i]) };
}

export function gramSchmidt(vs) {
  const qs = [];
  for (const v of vs) {
    let w = [...v];
    for (const q of qs) { const k = dot(w, q); w = w.map((x, i) => x - k * q[i]); }
    const n = norm(w);
    if (n > 1e-10) qs.push(w.map((x) => x / n));
  }
  return qs;
}

// One-sided Jacobi SVD for a small dense matrix (rows ≥ columns). Returns { U (columns), s (descending), V }.
export function jacobiSVD(M) {
  const m = M.length;
  const n = M[0].length;
  const U = M.map((r) => [...r]);
  const V = identity(n);
  for (let sweep = 0; sweep < 40; sweep++) {
    let off = 0;
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        let a = 0; let b = 0; let g = 0;
        for (let i = 0; i < m; i++) { a += U[i][p] ** 2; b += U[i][q] ** 2; g += U[i][p] * U[i][q]; }
        if (Math.abs(g) < 1e-12 * Math.sqrt(a * b) || a === 0 || b === 0) continue;
        off = Math.max(off, Math.abs(g) / Math.sqrt(a * b));
        const zeta = (b - a) / (2 * g);
        const t = Math.sign(zeta || 1) / (Math.abs(zeta) + Math.sqrt(1 + zeta * zeta));
        const c = 1 / Math.sqrt(1 + t * t);
        const s = c * t;
        for (let i = 0; i < m; i++) { const x = U[i][p]; const y = U[i][q]; U[i][p] = c * x - s * y; U[i][q] = s * x + c * y; }
        for (let i = 0; i < n; i++) { const x = V[i][p]; const y = V[i][q]; V[i][p] = c * x - s * y; V[i][q] = s * x + c * y; }
      }
    }
    if (off < 1e-12) break;
  }
  const s = Array.from({ length: n }, (_, j) => Math.hypot(...U.map((r) => r[j])));
  const order = s.map((v, j) => [v, j]).sort((p, q) => q[0] - p[0]).map(([, j]) => j);
  return {
    s: order.map((j) => s[j]),
    U: U.map((r) => order.map((j) => (s[j] > 1e-12 ? r[j] / s[j] : 0))),
    V: V.map((r) => order.map((j) => r[j])),
  };
}

// ---- text ----
// A number as a small fraction when it is one, else a decimal.
export function num(x, digits = 2) {
  const f = frac(x, 12);
  if (f && f.q > 1) return `${f.p < 0 ? '−' : ''}${Math.abs(f.p)}/${f.q}`;
  return fixed(clean(x), digits);
}
export const texNum = (x, digits = 2) => {
  const f = frac(x, 12);
  if (f && f.q > 1) return `${f.p < 0 ? '-' : ''}\\tfrac{${Math.abs(f.p)}}{${f.q}}`;
  return fixed(clean(x), digits);
};
export const bmat = (M, f = texNum) => `\\begin{bmatrix}${M.map((r) => r.map((x) => f(x)).join('&')).join('\\\\')}\\end{bmatrix}`;
export const vecTex = (v, f = texNum) => bmat(v.map((x) => [x]), f);

// ---- complex numbers as [re, im] ----
export const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const cconj = (a) => [a[0], -a[1]];
export const cabs = (a) => Math.hypot(a[0], a[1]);
export const ctex = ([re, im]) => {
  const r = clean(re);
  const i = clean(im);
  if (i === 0) return fixed(r, 2);
  const imag = `${Math.abs(i) === 1 ? '' : fixed(Math.abs(i), 2)}i`;
  return r === 0 ? `${i < 0 ? '-' : ''}${imag}` : `${fixed(r, 2)}${i < 0 ? '-' : '+'}${imag}`;
};
