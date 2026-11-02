// Pictures shared by the Change of state box: heating-curve plot, stacked energy bar, molecular inset.
import { poly, dot, label } from '../../lib/draw.js';
import { NAMES, LATENT } from './_phase.js';
import { createRng } from '../../lib/rng.js';

export function heatPlot(plot, c, segs, total, Q = null) {
  plot.setRange([0, total / 1000], [-40, 140]);
  plot.axes({ xLabel: 'heat added (kJ)', yLabel: 'T (°C)' });
  segs.forEach((s) => plot.segment(s.start / 1000, s.T0, (s.start + s.Q) / 1000, s.T1, { color: LATENT[s.kind] ? c.a : c.b, width: 4 }));
}

export function energyBar(ctx, stage, c, segs, total, box) {
  let x = box.x;
  segs.forEach((s) => {
    const w = (s.Q / total) * box.w;
    poly(ctx, [[x, box.y], [x + w, box.y], [x + w, box.y + box.h], [x, box.y + box.h]], { fill: LATENT[s.kind] ? c.a : c.b, stroke: c.ink, width: 2 });
    x += w;
  });
  label(ctx, 'blue: sensible heat (mcΔT)   coral: latent heat (mL)', box.x + box.w / 2, box.y + box.h + 14, c, { size: 10, bounds: stage, patch: false });
}

const N = 24;
const rng = createRng(5);
const LAT = Array.from({ length: N }, (_, i) => [(i % 6) / 5, Math.floor(i / 6) / 3]);
const LIQ = Array.from({ length: N }, () => [rng.next(), 0.45 + rng.next() * 0.55]);
const GAS = Array.from({ length: N }, () => [rng.next(), rng.next()]);

// kind: the current stage; f: how far through it.
export function molecules(ctx, c, box, kind, f) {
  poly(ctx, [[box.x, box.y], [box.x + box.w, box.y], [box.x + box.w, box.y + box.h], [box.x, box.y + box.h]], { fill: c.paper, stroke: c.ink, width: 2 });
  for (let i = 0; i < N; i++) {
    const frac = i / N;
    let p = LAT[i];
    if (kind === 'melt') p = frac < f ? LIQ[i] : LAT[i];
    else if (kind === 'water') p = LIQ[i];
    else if (kind === 'boil') p = frac < f ? GAS[i] : LIQ[i];
    else if (kind === 'steam') p = GAS[i];
    const col = kind === 'ice' || (kind === 'melt' && frac >= f) ? c.fillB : kind === 'steam' || (kind === 'boil' && frac < f) ? c.fillA : c.fillC;
    dot(ctx, box.x + 8 + p[0] * (box.w - 16), box.y + 8 + p[1] * (box.h - 16), 4, col, c.ink, 1.5);
  }
  label(ctx, NAMES[kind], box.x + box.w / 2, box.y - 8, c, { size: 11, patch: false });
}
