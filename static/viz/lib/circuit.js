// DC circuits: exact solving, plus schematic symbols in the site style.
//   solveLinear(A, b)              x with Ax = b (partial pivoting), or null if A is singular
//   solveCircuit(n, branches, fixed)  nodes 0..n−1; branches [{ a, b, R, E = 0 }]; fixed { node: potential }, default { 0: 0 }
//     A branch's current I runs from a to b, and its cell lifts potential by E going that way: V_b = V_a + E − IR.
//     R must be above 0, so model an ideal source as a fixed node. Returns { V: [...], I: [...] }, I in branch order.
//   resistor(ctx, x1, y1, x2, y2, { color, width, size, teeth })   zig-zag in the middle of a wire, at any angle
//   cell(ctx, x1, y1, x2, y2, { color, width })                    the long (+) plate faces (x2, y2)
//   inductor(ctx, x1, y1, x2, y2, { color, width, loops })         a row of coil humps in the middle of a wire, at any angle
//   capacitor(ctx, x1, y1, x2, y2, { color, width, plate, gap })   two equal plates across the wire; returns nothing
//   flowDots(ctx, x1, y1, x2, y2, charge, { count, r, fill, ink }) one dot per unit of charge, running from 1 to 2.
//     charge is the total that has passed, so a dot reaches the end each time it goes up by 1 and a count stays honest.
import { dot } from './draw.js';

export function solveLinear(A, b) {
  const rows = A.map((row, i) => [...row, b[i]]);
  const n = rows.length;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(rows[r][col]) > Math.abs(rows[pivot][col])) pivot = r;
    if (Math.abs(rows[pivot][col]) < 1e-12) return null;
    [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
    for (let r = col + 1; r < n; r++) {
      const factor = rows[r][col] / rows[col][col];
      for (let k = col; k <= n; k++) rows[r][k] -= factor * rows[col][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let rest = rows[r][n];
    for (let k = r + 1; k < n; k++) rest -= rows[r][k] * x[k];
    x[r] = rest / rows[r][r];
  }
  return x;
}

export function solveCircuit(n, branches, fixed = { 0: 0 }) {
  const G = Array.from({ length: n }, () => new Array(n).fill(0));
  const rhs = new Array(n).fill(0);
  for (const { a, b, R, E = 0 } of branches) {
    G[a][a] += 1 / R;
    G[b][b] += 1 / R;
    G[a][b] -= 1 / R;
    G[b][a] -= 1 / R;
    rhs[a] -= E / R;
    rhs[b] += E / R;
  }
  for (const [node, potential] of Object.entries(fixed)) {
    G[node] = G[node].map((_, i) => (i === Number(node) ? 1 : 0));
    rhs[node] = potential;
  }
  const V = solveLinear(G, rhs);
  if (!V) return null;
  return { V, I: branches.map(({ a, b, R, E = 0 }) => (V[a] - V[b] + E) / R) };
}

function along(ctx, x1, y1, x2, y2, body) {
  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(Math.atan2(y2 - y1, x2 - x1));
  body(Math.hypot(x2 - x1, y2 - y1));
  ctx.restore();
}

export function resistor(ctx, x1, y1, x2, y2, { color, width = 3, size = 7, teeth = 4 } = {}) {
  along(ctx, x1, y1, x2, y2, (length) => {
    const body = Math.min(length * 0.7, 46);
    const start = (length - body) / 2;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(start, 0);
    for (let i = 0; i < teeth * 2; i++) ctx.lineTo(start + (body * (i + 0.5)) / (teeth * 2), i % 2 ? size : -size);
    ctx.lineTo(start + body, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();
  });
}

export function cell(ctx, x1, y1, x2, y2, { color, width = 3 } = {}) {
  along(ctx, x1, y1, x2, y2, (length) => {
    const gap = Math.min(length * 0.2, 5);
    const mid = length / 2;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(mid - gap, 0);
    ctx.moveTo(mid + gap, 0);
    ctx.lineTo(length, 0);
    ctx.moveTo(mid - gap, -7);
    ctx.lineTo(mid - gap, 7);
    ctx.moveTo(mid + gap, -14);
    ctx.lineTo(mid + gap, 14);
    ctx.stroke();
  });
}

export function inductor(ctx, x1, y1, x2, y2, { color, width = 3, loops = 4 } = {}) {
  along(ctx, x1, y1, x2, y2, (length) => {
    const body = Math.min(length * 0.8, loops * 15);
    const start = (length - body) / 2;
    const r = body / loops / 2;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(start, 0);
    for (let i = 0; i < loops; i++) ctx.arc(start + r * (2 * i + 1), 0, r, Math.PI, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();
  });
}

export function capacitor(ctx, x1, y1, x2, y2, { color, width = 3, plate = 16, gap = 6 } = {}) {
  along(ctx, x1, y1, x2, y2, (length) => {
    const mid = length / 2;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(mid - gap, 0);
    ctx.moveTo(mid + gap, 0);
    ctx.lineTo(length, 0);
    ctx.moveTo(mid - gap, -plate);
    ctx.lineTo(mid - gap, plate);
    ctx.moveTo(mid + gap, -plate);
    ctx.lineTo(mid + gap, plate);
    ctx.stroke();
  });
}

export function flowDots(ctx, x1, y1, x2, y2, charge, { count = 5, r = 5, fill, ink } = {}) {
  const part = ((charge % 1) + 1) % 1;
  for (let k = 0; k < count; k++) {
    const f = (k + part) / count;
    dot(ctx, x1 + (x2 - x1) * f, y1 + (y2 - y1) * f, r, fill, ink, 1);
  }
}
