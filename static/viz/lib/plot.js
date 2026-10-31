// Function graphs on a canvas stage, with NCERT-style ticks.
//   const plot = createPlot(stage, { x: [a, b], y: [c, d], ticks: 'auto' | 'pi', c: readColors() });
//   Inside draw: plot.axes({ xLabel, yLabel }); plot.fn(f, { color, domain, dash }); plot.shade(f, g, a, b, fill);
//   plot.point(x, y, { fill }); plot.segment(x1, y1, x2, y2, opts); plot.text(s, x, y, opts);
//   plot.toPx(x, y) and plot.toWorld(px, py) convert. plot.setRange(x, y) changes the window.
// sample(), niceStep() and tickValues() are pure and exported so tests can check them.
import { line, dot, label } from './draw.js';
import { fixed, piFrac } from './format.js';

export function niceStep(span, count = 6) {
  const rough = span / count;
  const power = 10 ** Math.floor(Math.log10(rough));
  const scaled = rough / power;
  const nice = scaled < 1.5 ? 1 : scaled < 3 ? 2 : scaled < 7 ? 5 : 10;
  return nice * power;
}

export function tickValues(lo, hi, step) {
  const out = [];
  for (let i = Math.ceil(lo / step - 1e-9); i * step <= hi + 1e-9; i++) out.push(i * step);
  return out;
}

// Adaptive sampling: bisects where the curve bends. Returns polylines of [x, y]; a pole or a gap in the
// domain starts a new polyline, so an asymptote is never joined across.
export function sample(f, a, b, { yRange, tolerance = 0.0015, depth = 9, start = 48 } = {}) {
  const span = yRange ? yRange[1] - yRange[0] : 1;
  const jump = span * 2;
  const pieces = [];
  let piece = [];
  const finish = () => {
    if (piece.length > 1) pieces.push(piece);
    piece = [];
  };
  const add = (x, y) => {
    if (!Number.isFinite(y)) { finish(); return; }
    piece.push([x, y]);
  };
  const refine = (x0, y0, x1, y1, level) => {
    const xm = (x0 + x1) / 2;
    const ym = f(xm);
    const flat = Number.isFinite(y0) && Number.isFinite(y1) && Number.isFinite(ym)
      && Math.abs(ym - (y0 + y1) / 2) < tolerance * span;
    if (level >= depth || flat) {
      if (level >= depth && Number.isFinite(y0) && Number.isFinite(y1) && Math.abs(y1 - y0) > jump) finish();
      add(x1, y1);
      return;
    }
    refine(x0, y0, xm, ym, level + 1);
    refine(xm, ym, x1, y1, level + 1);
  };
  let x0 = a;
  let y0 = f(a);
  add(x0, y0);
  for (let i = 1; i <= start; i++) {
    const x1 = a + ((b - a) * i) / start;
    const y1 = f(x1);
    refine(x0, y0, x1, y1, 0);
    x0 = x1;
    y0 = y1;
  }
  finish();
  return pieces;
}

export function createPlot(stage, { x = [-5, 5], y = [-5, 5], ticks = 'auto', c, pad = 26 }) {
  const view = { x, y };
  const ctx = stage.ctx;
  const toPx = (wx, wy) => [
    pad + ((wx - view.x[0]) / (view.x[1] - view.x[0])) * (stage.w - pad * 2),
    stage.h - pad - ((wy - view.y[0]) / (view.y[1] - view.y[0])) * (stage.h - pad * 2),
  ];
  const toWorld = (px, py) => [
    view.x[0] + ((px - pad) / (stage.w - pad * 2)) * (view.x[1] - view.x[0]),
    view.y[0] + ((stage.h - pad - py) / (stage.h - pad * 2)) * (view.y[1] - view.y[0]),
  ];
  const clipped = (body) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(pad, pad, stage.w - pad * 2, stage.h - pad * 2);
    ctx.clip();
    body();
    ctx.restore();
  };

  function xTicks() {
    if (ticks !== 'pi') {
      const step = niceStep(view.x[1] - view.x[0], stage.w < 420 ? 5 : 8);
      return tickValues(view.x[0], view.x[1], step).map((v) => [v, fixed(v, 3)]);
    }
    const span = view.x[1] - view.x[0];
    const step = Math.PI / (span <= Math.PI * 2.1 ? 2 : span <= Math.PI * 4.1 ? 1 : 0.5);
    return tickValues(view.x[0], view.x[1], step).map((v) => [v, piFrac(v) ?? fixed(v, 2)]);
  }

  function axes({ xLabel = 'x', yLabel = 'y', grid = true } = {}) {
    const [ox, oy] = toPx(Math.max(view.x[0], Math.min(view.x[1], 0)), Math.max(view.y[0], Math.min(view.y[1], 0)));
    const xs = xTicks();
    const ys = tickValues(view.y[0], view.y[1], niceStep(view.y[1] - view.y[0], stage.h < 300 ? 4 : 6))
      .map((v) => [v, fixed(v, 3)]);
    for (const [v] of grid ? xs : []) line(ctx, toPx(v, 0)[0], pad, toPx(v, 0)[0], stage.h - pad, { color: c.grid, width: 1 });
    for (const [v] of grid ? ys : []) line(ctx, pad, toPx(0, v)[1], stage.w - pad, toPx(0, v)[1], { color: c.grid, width: 1 });
    line(ctx, pad, oy, stage.w - pad, oy, { color: c.ink, width: 2 });
    line(ctx, ox, pad, ox, stage.h - pad, { color: c.ink, width: 2 });
    for (const [v, text] of xs) if (Math.abs(v) > 1e-9) label(ctx, text, toPx(v, 0)[0], Math.min(oy + 13, stage.h - 8), c, { size: 10, bounds: stage });
    for (const [v, text] of ys) if (Math.abs(v) > 1e-9) label(ctx, text, Math.max(ox - 5, 26), toPx(0, v)[1], c, { size: 10, align: 'right', bounds: stage });
    label(ctx, xLabel, stage.w - 5, Math.max(oy - 12, 10), c, { size: 12, align: 'right', bounds: stage });
    label(ctx, yLabel, Math.min(ox + 8, stage.w - 40), 12, c, { size: 12, align: 'left', bounds: stage });
  }

  function fn(f, { color = c.a, width = 3, dash = [], domain = view.x } = {}) {
    const pieces = sample(f, Math.max(domain[0], view.x[0]), Math.min(domain[1], view.x[1]), { yRange: view.y });
    clipped(() => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      ctx.lineJoin = 'round';
      for (const piece of pieces) {
        ctx.beginPath();
        piece.forEach(([wx, wy], i) => (i ? ctx.lineTo(...toPx(wx, wy)) : ctx.moveTo(...toPx(wx, wy))));
        ctx.stroke();
      }
    });
  }

  // Area between f and g on [a, b]; g defaults to the x-axis.
  function shade(f, g, a, b, fill = c.fillA) {
    const lower = g || (() => 0);
    const steps = 200;
    clipped(() => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const wx = a + ((b - a) * i) / steps;
        ctx.lineTo(...toPx(wx, f(wx)));
      }
      for (let i = steps; i >= 0; i--) {
        const wx = a + ((b - a) * i) / steps;
        ctx.lineTo(...toPx(wx, lower(wx)));
      }
      ctx.closePath();
      ctx.fill();
    });
  }

  return {
    toPx,
    toWorld,
    axes,
    fn,
    shade,
    setRange(nextX, nextY) {
      view.x = nextX;
      view.y = nextY;
    },
    point(wx, wy, { fill = c.a, r = 7 } = {}) {
      dot(ctx, ...toPx(wx, wy), r, fill, c.ink);
    },
    segment(x1, y1, x2, y2, options = {}) {
      clipped(() => line(ctx, ...toPx(x1, y1), ...toPx(x2, y2), { color: c.ink, ...options }));
    },
    text(text, wx, wy, options = {}) {
      label(ctx, text, ...toPx(wx, wy), c, { bounds: stage, ...options });
    },
  };
}
