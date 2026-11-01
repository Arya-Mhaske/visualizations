// The spinner-and-wave picture shared by the Sine & Cosine tools: a circle on the left, a graph on the right,
// and one vertical scale for both, so the height of the arrow's tip is the height of the curve.
//   const plot = makePlot(stage, c, { x0, span });      in setup
//   fit(stage, plot, x0, span);                          first thing in draw: matches the graph's scale to the circles
//   plot.axes(...); drawSpinnerWave(ctx, stage, c, plot, x0, xNow, series, { ghost });
import { createPlot } from '../../lib/plot.js';
import { arc, arrow, dot, label, line } from '../../lib/draw.js';
import { TAU, tip, wave } from './_sine-cosine-math.js';

export const GRAPH_LEFT = 0.4; // the graph starts at this share of the stage width
const CIRCLE = 0.19; // a spinner of radius 1.6 fills this share of the width
const PAD = 20;
const scale = (stage) => (stage.w * CIRCLE) / 1.6; // pixels per unit of height

export function makePlot(stage, c, { x0 = 0, span = 2 * TAU } = {}) {
  return createPlot(stage, {
    x: [x0, x0 + span], y: [-3, 3], c, ticks: 'pi', pad: PAD,
    box: (g) => ({ x: g.w * GRAPH_LEFT, y: 0, w: g.w * (1 - GRAPH_LEFT), h: g.h }),
  });
}

export function fit(stage, plot, x0 = 0, span = 2 * TAU) {
  const half = (stage.h - PAD * 2) / 2 / scale(stage);
  plot.setRange([x0, x0 + span], [-half, half]);
  return half;
}

// series: [{ A, B, C, k, color, label? }]. xNow is where the clock reads; the curve is traced from x0 up to it.
export function drawSpinnerWave(ctx, stage, c, plot, x0, xNow, series, { ghost = null, span = 2 * TAU } = {}) {
  const ppu = scale(stage);
  const half = (stage.h - PAD * 2) / 2 / ppu;
  const cx = stage.w * (GRAPH_LEFT / 2) - 4;
  if (ghost) plot.fn(ghost, { color: c.grid, width: 3, dash: [6, 5] });
  plot.segment(xNow, -half, xNow, half, { color: c.grid, width: 1 });
  series.forEach((s) => {
    const f = wave(s.A, s.B, s.C, s.k);
    const graphY = plot.toPx(0, s.k)[1];
    plot.fn(f, { color: c.grid, width: 2 });
    plot.fn(f, { color: s.color, width: 4, domain: [x0, xNow] });
    if (s.k !== 0) plot.segment(x0, s.k, x0 + span, s.k, { color: c.ink, width: 1, dash: [4, 4] });
    // the spinner: circle, arrow, and the tip's height carried across to the curve
    const R = Math.abs(s.A) * ppu;
    const [dx, dy] = tip(s.A, s.B, s.C, xNow);
    const T = [cx + dx * ppu, graphY - dy * ppu];
    arc(ctx, cx, graphY, R, 0, TAU, { color: c.ink, width: 2 });
    arrow(ctx, cx, graphY, ...T, { color: s.color, width: 4, head: 11 });
    dot(ctx, cx, graphY, 4, c.ink, c.ink);
    const P = plot.toPx(xNow, f(xNow));
    line(ctx, ...T, ...P, { color: s.color, width: 1.5, dash: [5, 4] });
    dot(ctx, ...T, 7, s.color, c.ink, 2);
    dot(ctx, ...P, 8, s.color, c.ink);
    if (s.label) label(ctx, s.label, cx, graphY + R + 14, c, { size: 11, color: s.color, bounds: stage, patch: false });
  });
}
