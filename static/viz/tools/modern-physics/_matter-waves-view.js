// A ruler for lengths from 1e-40 m to 1e-4 m, in powers of ten. Returns x(logMetres).
import { line, label, dot, arrow } from '../../lib/draw.js';

export const OBJECTS = [
  ['e', 'electron', 9.11e-31, 6],
  ['p', 'proton', 1.67e-27, 5],
  ['d', 'dust grain, 1 μg', 1e-9, 0],
  ['b', 'cricket ball, 160 g', 0.16, 1.5],
  ['m', 'person, 60 kg', 60, 0.3],
];
export const objectOf = (key) => OBJECTS.find((o) => o[0] === key);

export function drawRuler(ctx, c, stage, { lo = -40, hi = -4, y = 0.6, marks = [], caption = 'length in metres', step = 4 } = {}) {
  const x0 = 24;
  const x1 = stage.w - 24;
  const X = (e) => x0 + ((e - lo) / (hi - lo)) * (x1 - x0);
  const Y = stage.h * y;
  line(ctx, x0, Y, x1, Y, { color: c.ink, width: 3 });
  for (let e = lo; e <= hi; e += step) {
    line(ctx, X(e), Y - 6, X(e), Y + 6, { color: c.ink, width: 2 });
    label(ctx, `10${String(e).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`, X(e), Y + 20, c, { size: 9, bounds: stage, patch: false });
  }
  label(ctx, caption, x1, Y + 38, c, { size: 10, align: 'right', patch: false });
  marks.forEach(({ e, text, fill, up, high }) => {
    const ey = Y - (up ? 26 + (high ? 24 : 0) : -56);
    line(ctx, X(e), Y, X(e), ey + (up ? 8 : -8), { color: c.ink, width: 2 });
    dot(ctx, X(e), Y, 6, fill, c.ink);
    label(ctx, text, X(e), ey, c, { size: 10, bounds: stage });
  });
  return X;
}

export { arrow };
