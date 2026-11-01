// The Sources of Magnetic Field box: pure numbers, no DOM. SI units throughout (T, A, m).
// A piece is { p: [x, y, z], dl: [x, y, z] } (dl is the vector length of the piece, along the current).
//   elementField(I, piece, at)      Biot–Savart for one piece: (μ0/4π) I dl × r / r³, r from the piece to `at`
//   sumField(I, pieces, at)         the vector sum over all pieces
//   loopPieces(R, n, x0)            a circle in the plane x = x0 round the x axis (current runs y → z); arc-length pieces
//   wirePieces(half, n)             a straight wire on the x axis from −half to +half, current along +x
//   axisLoop, longWire, finiteWire, solenoidInfinite, solenoidAxis, parallelForce   the textbook closed forms
//   circulation(wires, r, phi)      ∮ B·dl round a circle of radius r from angle 0 to phi, for thin or thick wires
//   coreField(H)                    B in a soft-iron core: μ0 H plus a core that saturates
export const MU0 = 4e-7 * Math.PI;
const K = 1e-7; // μ0 / 4π

export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (v) => Math.hypot(...v);

export function elementField(I, { p, dl }, at) {
  const r = [at[0] - p[0], at[1] - p[1], at[2] - p[2]];
  const d = norm(r);
  const k = (K * I) / (d * d * d);
  const c = cross(dl, r);
  return [k * c[0], k * c[1], k * c[2]];
}

export function sumField(I, pieces, at) {
  const total = [0, 0, 0];
  for (const piece of pieces) {
    const b = elementField(I, piece, at);
    total[0] += b[0];
    total[1] += b[1];
    total[2] += b[2];
  }
  return total;
}

export function loopPieces(R, n, x0 = 0) {
  return Array.from({ length: n }, (_, i) => {
    const phi = ((i + 0.5) * 2 * Math.PI) / n;
    const arc = (R * 2 * Math.PI) / n;
    return { p: [x0, R * Math.cos(phi), R * Math.sin(phi)], dl: [0, -arc * Math.sin(phi), arc * Math.cos(phi)], phi };
  });
}

// Pieces of equal length from −half to +half. The loop-and-wire tools draw in the page plane (z out of the page).
export function wirePieces(half, n) {
  const ds = (2 * half) / n;
  return Array.from({ length: n }, (_, i) => ({ p: [-half + (i + 0.5) * ds, 0, 0], dl: [ds, 0, 0] }));
}

// A loop in the page plane (z = 0), anticlockwise seen from +z, centred on the origin.
export function pageLoopPieces(R, n) {
  return Array.from({ length: n }, (_, i) => {
    const phi = ((i + 0.5) * 2 * Math.PI) / n;
    const arc = (R * 2 * Math.PI) / n;
    return { p: [R * Math.cos(phi), R * Math.sin(phi), 0], dl: [-arc * Math.sin(phi), arc * Math.cos(phi), 0], phi };
  });
}

export const axisLoop = (I, R, x) => (MU0 * I * R * R) / (2 * (x * x + R * R) ** 1.5);
export const longWire = (I, r) => (MU0 * I) / (2 * Math.PI * r);
export const finiteWire = (I, r, half) => ((MU0 * I) / (2 * Math.PI * r)) * (half / Math.hypot(half, r));
export const solenoidInfinite = (n, I) => MU0 * n * I;

// On the axis of a solenoid of length L and radius R, at x from its middle.
export function solenoidAxis(n, I, L, R, x) {
  const a = x + L / 2;
  const b = x - L / 2;
  return ((MU0 * n * I) / 2) * (a / Math.hypot(a, R) - b / Math.hypot(b, R));
}

// Force per metre between parallel wires; positive means attraction when the currents run the same way.
export const parallelForce = (I1, I2, d) => (MU0 * I1 * I2) / (2 * Math.PI * d);

// ---- Ampère: going round a circle ----
// wires: [{ x, y, I, a }] along z (I positive out of the page). a is the radius of a uniform thick wire (0 for a thin one).
// Returns B (a 2-vector, in tesla) at a point of the page.
export function wireFieldAt(wires, [px, py]) {
  let bx = 0;
  let by = 0;
  for (const { x, y, I, a = 0 } of wires) {
    const [dx, dy] = [px - x, py - y];
    const r2 = dx * dx + dy * dy;
    const inside = a > 0 && r2 < a * a ? r2 / (a * a) : 1; // a uniform wire carries r²/a² of its current inside radius r
    const k = (MU0 * I * inside) / (2 * Math.PI * r2);
    bx += -k * dy;
    by += k * dx;
  }
  return [bx, by];
}

export function circulation(wires, r, phi = 2 * Math.PI, n = 1440) {
  let sum = 0;
  const dphi = phi / n;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) * dphi;
    const [bx, by] = wireFieldAt(wires, [r * Math.cos(t), r * Math.sin(t)]);
    sum += (-bx * Math.sin(t) + by * Math.cos(t)) * r * dphi;
  }
  return sum;
}

// The current through a circle of radius r centred on the origin, counting each wire's share if it is thick.
export function enclosed(wires, r) {
  return wires.reduce((sum, { x, y, I, a = 0 }) => {
    const d = Math.hypot(x, y);
    if (a > 0 && Math.abs(d) < 1e-12) return sum + I * Math.min(1, (r * r) / (a * a));
    return sum + (d < r ? I : 0);
  }, 0);
}

// ---- The electromagnet ----
export const B_SAT = 1.6; // tesla, soft iron
export const CHI = 500; // initial relative susceptibility of the model core
export const coreField = (H) => MU0 * H + B_SAT * Math.tanh((CHI * MU0 * H) / B_SAT);
export const airField = (H) => MU0 * H;
// The pull of one flat pole face of area A on a plate touching it: F = B² A / 2μ0.
export const pull = (B, A) => (B * B * A) / (2 * MU0);
export const G = 9.8;
