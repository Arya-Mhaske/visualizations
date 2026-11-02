// Shared pieces for the integrals boxes written after net-change: a small function bank and rectangle drawing.
import { simpson } from '../integral-applications/_ia.js';
export { simpson };
export { stackBoxes } from '../../lib/graph.js';

// f, an antiderivative F, and a window for plotting.
export const FN = {
  x2: { name: 'x²', tex: 'x^2', f: (x) => x * x, F: (x) => x ** 3 / 3, view: [[0, 2], [-0.2, 4.2]] },
  sin: { name: 'sin x', tex: '\\sin x', f: Math.sin, F: (x) => -Math.cos(x), view: [[0, 6.4], [-1.3, 1.3]] },
  sqrt: { name: '√x', tex: '\\sqrt{x}', f: (x) => Math.sqrt(Math.max(x, 0)), F: (x) => (2 / 3) * Math.max(x, 0) ** 1.5, view: [[0, 4], [-0.2, 2.4]] },
  exp: { name: 'eˣ', tex: 'e^x', f: Math.exp, F: Math.exp, view: [[0, 2], [-0.3, 7.6]] },
  cubic: { name: 'x³ − 3x + 2', tex: 'x^3-3x+2', f: (x) => x ** 3 - 3 * x + 2, F: (x) => x ** 4 / 4 - 1.5 * x * x + 2 * x, view: [[-2.4, 2.4], [-1, 6]] },
};

// Sum of n rectangles on [a, b] with the sample taken a fraction s of the way across each slice (0 left, 1 right).
export const sumOf = (f, a, b, n, s) => {
  const h = (b - a) / n;
  let t = 0;
  for (let i = 0; i < n; i++) t += f(a + (i + s) * h);
  return t * h;
};

export function rects(ctx, plot, c, f, a, b, n, s, { fill, ink, width = 1.5 } = {}) {
  const h = (b - a) / n;
  for (let i = 0; i < n; i++) {
    const x0 = a + i * h;
    const y = f(x0 + s * h);
    const [px0, py] = plot.toPx(x0, y);
    const [px1, pz] = plot.toPx(x0 + h, 0);
    ctx.fillStyle = fill || (y >= 0 ? c.fillB : c.fillA);
    ctx.fillRect(px0, Math.min(py, pz), px1 - px0, Math.abs(py - pz));
    ctx.strokeStyle = ink || c.ink;
    ctx.lineWidth = width;
    ctx.strokeRect(px0, Math.min(py, pz), px1 - px0, Math.abs(py - pz));
  }
}

// Positive area (green) and negative area (coral) of f on [a, b], drawn with plot.shade.
export function shadeSigned(plot, c, f, a, b) {
  plot.shade((x) => Math.max(f(x), 0), null, a, b, c.fillC);
  plot.shade((x) => Math.min(f(x), 0), null, a, b, c.fillA);
}
export const exact = (f, a, b) => simpson(f, a, b, 800);
