// Drawing helpers shared by the Unit Circle tools. Maths y points up; the canvas y points down.
import { arc, label, line } from '../../lib/draw.js';
import { deg } from './_right-triangle-math.js';
import { normalise, pointAt } from './_unit-circle-math.js';

// extent: how many radii fit from the centre to the stage edge
export function frame(stage, extent = 1.5) {
  const k = Math.min(stage.w, stage.h) / (2 * extent);
  const [cx, cy] = [stage.w / 2, stage.h / 2];
  return { cx, cy, k, px: ([x, y]) => [cx + x * k, cy - y * k] };
}

// Axes, the unit circle and a light circle for a different radius r
export function drawFrame(ctx, f, c, { r = 1, ticks = true } = {}) {
  const e = f.k * Math.max(1.45, r * 1.12);
  line(ctx, f.cx - e, f.cy, f.cx + e, f.cy, { color: c.ink, width: 2 });
  line(ctx, f.cx, f.cy - e, f.cx, f.cy + e, { color: c.ink, width: 2 });
  arc(ctx, f.cx, f.cy, f.k, 0, Math.PI * 2, { color: r === 1 ? c.ink : c.grid, width: r === 1 ? 3 : 2 });
  if (r !== 1) arc(ctx, f.cx, f.cy, f.k * r, 0, Math.PI * 2, { color: c.ink, width: 3 });
  if (ticks) {
    [[1, 0, '1'], [-1, 0, '−1'], [0, 1, '1'], [0, -1, '−1']].forEach(([x, y, text]) => {
      const [px, py] = f.px([x * r, y * r]);
      label(ctx, text, px + (x === 0 ? 12 : x * 4 + (x > 0 ? 8 : -8)), py + (y === 0 ? 14 : y * -4), c, { size: 10, patch: false });
    });
  }
}

// A draggable point on a circle of radius r. frameOf() gives the current frame, so it follows resizes.
export function angleHandle(frameOf, get, set, r = () => 1) {
  return {
    at: () => frameOf().px(pointAt(get(), r())),
    move(px, py) {
      const f = frameOf();
      set(normalise(Math.round(deg(Math.atan2(f.cy - py, px - f.cx)))));
    },
    nudge(direction) { set(normalise(get() + direction * 5)); },
  };
}
