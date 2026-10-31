// The picture all three beats tools share: the swing of two summed notes over time, one lobe per beat.
import { poly } from '../../lib/draw.js';

// Draws ±2|cos(π·rate·t)| from t = 0 to span on a plot whose y axis runs past ±2. rate 0 gives a steady band.
export function beatStrip(ctx, plot, c, rate, span, { fill = c.fillC, steps = 900 } = {}) {
  const top = [];
  const bottom = [];
  for (let i = 0; i <= steps; i++) {
    const t = (span * i) / steps;
    const h = 2 * Math.abs(Math.cos(Math.PI * rate * t));
    top.push(plot.toPx(t, h));
    bottom.unshift(plot.toPx(t, -h));
  }
  poly(ctx, [...top, ...bottom], { fill, stroke: c.ink, width: 2 });
}
