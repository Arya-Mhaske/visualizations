// Pure maths for the What is a Function? box. No DOM.

// ---- one output per input: curves given by their branches, so a vertical line can count the hits ----
export const CURVES = {
  line: { text: 'y = x/2 + 1', branches: [(x) => x / 2 + 1] },
  parabola: { text: 'y = x² − 2', branches: [(x) => x * x - 2] },
  sideways: { text: 'x = y²', branches: [(x) => (x < 0 ? NaN : Math.sqrt(x)), (x) => (x < 0 ? NaN : -Math.sqrt(x))] },
  circle: { text: 'x² + y² = 9', branches: [(x) => (Math.abs(x) > 3 ? NaN : Math.sqrt(9 - x * x)), (x) => (Math.abs(x) > 3 ? NaN : -Math.sqrt(9 - x * x))] },
};

// Every distinct y on the curve above x (a repeated value counts once).
export function outputs(name, x) {
  const found = [];
  for (const branch of CURVES[name].branches) {
    const y = branch(x);
    if (Number.isFinite(y) && !found.some((v) => Math.abs(v - y) < 1e-9)) found.push(y);
  }
  return found;
}

// A curve is a function when no vertical line meets it twice. Scanned on a grid of 0.01.
export function isFunction(name) {
  for (let i = -600; i <= 600; i++) if (outputs(name, i / 100).length > 1) return false;
  return true;
}

// ---- domain restrictions ----
export const RESTRICTED = {
  sqrt: { text: '√x', tex: '\\sqrt{x}', f: (x) => Math.sqrt(x), ok: (x) => x >= 0, domain: 'x ≥ 0', domainTex: 'x\\ge 0', why: 'no square root of a negative' },
  recip: { text: '1/x', tex: '\\dfrac{1}{x}', f: (x) => 1 / x, ok: (x) => Math.abs(x) > 1e-9, domain: 'x ≠ 0', domainTex: 'x\\ne 0', why: 'division by zero' },
  log: { text: 'ln x', tex: '\\ln x', f: (x) => Math.log(x), ok: (x) => x > 0, domain: 'x > 0', domainTex: 'x>0', why: 'e to a power is never ≤ 0' },
  both: { text: '1/√(x − 1)', tex: '\\dfrac{1}{\\sqrt{x-1}}', f: (x) => 1 / Math.sqrt(x - 1), ok: (x) => x > 1 + 1e-9, domain: 'x > 1', domainTex: 'x>1', why: 'root of a negative, or ÷ 0' },
};
export const valueOf = (name, x) => (RESTRICTED[name].ok(x) ? RESTRICTED[name].f(x) : null);

// ---- difference quotient ----
export const FNS = {
  square: { text: 'x²', tex: 'x^2', f: (x) => x * x, slope: (x) => 2 * x },
  cube: { text: 'x³', tex: 'x^3', f: (x) => x ** 3, slope: (x) => 3 * x * x },
  root: { text: '√x', tex: '\\sqrt{x}', f: (x) => Math.sqrt(x), slope: (x) => 1 / (2 * Math.sqrt(x)) },
};
export const quotient = (f, x, h) => (f(x + h) - f(x)) / h;
// f(x + h) − (f(x) + h): zero only when f(x + h) really is f(x) + h
export const shiftGap = (f, x, h) => f(x + h) - (f(x) + h);

// ---- two functions, one formula? ----
const NOT = NaN;
export const PAIRS = {
  cancel: { f: 'x', g: 'x²/x', fTex: 'x', gTex: '\\dfrac{x^2}{x}', F: (x) => x, G: (x) => (x === 0 ? NOT : (x * x) / x), domF: 'all x', domG: 'x ≠ 0', hole: 0 },
  factor: { f: 'x + 1', g: '(x² − 1)/(x − 1)', fTex: 'x+1', gTex: '\\dfrac{x^2-1}{x-1}', F: (x) => x + 1, G: (x) => (x === 1 ? NOT : (x * x - 1) / (x - 1)), domF: 'all x', domG: 'x ≠ 1', hole: 1 },
  abs: { f: '|x|', g: '√(x²)', fTex: '|x|', gTex: '\\sqrt{x^2}', F: (x) => Math.abs(x), G: (x) => Math.sqrt(x * x), domF: 'all x', domG: 'all x', hole: null },
  expand: { f: '(x + 1)²', g: 'x² + 2x + 1', fTex: '(x+1)^2', gTex: 'x^2+2x+1', F: (x) => (x + 1) ** 2, G: (x) => x * x + 2 * x + 1, domF: 'all x', domG: 'all x', hole: null },
};
// Same function = same domain and same value everywhere on the grid (steps of 0.01 from −5 to 5, exact integers included).
export function sameFunction(name) {
  const pair = PAIRS[name];
  for (let i = -500; i <= 500; i++) {
    const x = i / 100;
    const [a, b] = [pair.F(x), pair.G(x)];
    if (Number.isNaN(a) !== Number.isNaN(b)) return false;
    if (!Number.isNaN(a) && Math.abs(a - b) > 1e-9) return false;
  }
  return true;
}

// ---- a relation is a subset of A × B ----
export const cells = (p, q) => p * q;
export const relationCount = (p, q) => 2 ** (p * q);
export const functionCount = (p, q) => q ** p;
// ticks: a list of [a, b] with a in 1..p. A function ticks exactly one b for each a.
export function isFunctionRelation(ticks, p) {
  for (let a = 1; a <= p; a++) if (ticks.filter(([x]) => x === a).length !== 1) return false;
  return true;
}
export const PRESETS = {
  less: (a, b) => a < b,
  equal: (a, b) => a === b,
  double: (a, b) => b === 2 * a,
  all: () => true,
};
export function presetTicks(name, p, q) {
  const out = [];
  for (let a = 1; a <= p; a++) for (let b = 1; b <= q; b++) if (PRESETS[name](a, b)) out.push([a, b]);
  return out;
}

// ---- rule, table, graph ----
export const RULES = {
  lin: { text: '2x − 1', tex: '2x-1', f: (x) => 2 * x - 1, y: [-8, 8] },
  sq: { text: 'x² − 2', tex: 'x^2-2', f: (x) => x * x - 2, y: [-3, 8] },
  abs: { text: '|x| − 1', tex: '|x|-1', f: (x) => Math.abs(x) - 1, y: [-2, 4] },
  cube: { text: 'x³ / 3', tex: '\\dfrac{x^3}{3}', f: (x) => (x ** 3) / 3, y: [-9, 9] },
};
export const table = (name, xs) => xs.map((x) => [x, RULES[name].f(x)]);

// ---- reading a graph: pieces {a, b, fn, ca, cb} with closed (true) or open (false) ends ----
export const GRAPHS = {
  bowl: { text: 'A bowl', view: [[-4, 5], [-4, 8]], pieces: [{ a: -2, b: 3, fn: (x) => x * x - 2, ca: true, cb: false }] },
  jump: { text: 'A jump', view: [[-5, 5], [-4, 5]], pieces: [
    { a: -4, b: 0, fn: (x) => x + 2, ca: true, cb: false },
    { a: 0, b: 4, fn: (x) => 3 - x, ca: true, cb: true },
  ] },
  root: { text: 'A root', view: [[-4, 7], [-3, 4]], pieces: [{ a: -3, b: 6, fn: (x) => Math.sqrt(x + 3) - 1, ca: true, cb: true }] },
};

export function inDomain(graph, x) {
  return graph.pieces.some((p) => (x > p.a || (x === p.a && p.ca)) && (x < p.b || (x === p.b && p.cb)));
}
export function valueAt(graph, x) {
  const piece = graph.pieces.find((p) => (x > p.a || (x === p.a && p.ca)) && (x < p.b || (x === p.b && p.cb)));
  return piece ? piece.fn(x) : null;
}
// Joined intervals, e.g. [-4, 0) and [0, 4] become [-4, 4].
export function domainIntervals(graph) {
  const sorted = [...graph.pieces].sort((u, v) => u.a - v.a);
  const out = [];
  for (const p of sorted) {
    const last = out[out.length - 1];
    if (last && last.b === p.a && (last.cb || p.ca)) { last.b = p.b; last.cb = p.cb; } else out.push({ a: p.a, b: p.b, ca: p.ca, cb: p.cb });
  }
  return out;
}
// The range is one interval for every graph here. Found by sampling 2001 points of each piece.
export function rangeOf(graph) {
  const N = 2000;
  const samples = [];
  for (const p of graph.pieces) {
    for (let i = 0; i <= N; i++) {
      const x = p.a + ((p.b - p.a) * i) / N;
      const closed = i === 0 ? p.ca : i === N ? p.cb : true;
      samples.push([p.fn(x), closed]);
    }
  }
  const lo = Math.min(...samples.map((s) => s[0]));
  const hi = Math.max(...samples.map((s) => s[0]));
  return {
    lo, hi,
    loClosed: samples.some(([v, closed]) => closed && v <= lo + 1e-9),
    hiClosed: samples.some(([v, closed]) => closed && v >= hi - 1e-9),
  };
}
// Every x in the domain where f(x) = c.
export function solutions(graph, c) {
  const out = [];
  for (const p of graph.pieces) {
    const N = 4000;
    let prevX = p.a;
    let prevG = p.fn(p.a) - c;
    if (Math.abs(prevG) < 1e-12 && p.ca) out.push(p.a);
    for (let i = 1; i <= N; i++) {
      const x = p.a + ((p.b - p.a) * i) / N;
      const g = p.fn(x) - c;
      if (Math.abs(g) < 1e-12) {
        if ((i < N || p.cb) && !out.some((v) => Math.abs(v - x) < 1e-6)) out.push(x);
      } else if (prevG * g < 0) {
        let [lo, hi] = [prevX, x];
        for (let k = 0; k < 60; k++) {
          const mid = (lo + hi) / 2;
          if ((p.fn(lo) - c) * (p.fn(mid) - c) <= 0) hi = mid; else lo = mid;
        }
        const r = (lo + hi) / 2;
        if (!out.some((v) => Math.abs(v - r) < 1e-6)) out.push(r);
      }
      prevX = x;
      prevG = g;
    }
  }
  return out.sort((u, v) => u - v);
}
