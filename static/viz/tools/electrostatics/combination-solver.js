import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { equivalent } from './_cap.js';

const c = (i) => ({ t: 'c', i });
const NETS = {
  a: { name: '(C₁ series C₂) beside C₃', node: { t: 'p', kids: [{ t: 's', kids: [c(0), c(1)] }, c(2)] }, inner: { t: 's', kids: [c(0), c(1)] }, how: 'First the series pair, then add C₃ in parallel.' },
  b: { name: 'C₁ beside (C₂ series C₃)', node: { t: 'p', kids: [c(0), { t: 's', kids: [c(1), c(2)] }] }, inner: { t: 's', kids: [c(1), c(2)] }, how: 'First the series pair C₂, C₃, then add C₁ in parallel.' },
  c: { name: 'C₁, C₂, C₃ in series', node: { t: 's', kids: [c(0), c(1), c(2)] }, inner: { t: 's', kids: [c(0), c(1)] }, how: 'Add reciprocals: 1/C = 1/C₁ + 1/C₂ + 1/C₃.' },
  d: { name: 'Three side by side', node: { t: 'p', kids: [c(0), c(1), c(2)] }, inner: { t: 'p', kids: [c(0), c(1)] }, how: 'Add the capacitances: C = C₁ + C₂ + C₃.' },
};
const state = { net: 'a', C1: 2, C2: 4, C3: 3 };
const vals = (s) => [s.C1, s.C2, s.C3];
const eqv = (s) => equivalent(NETS[s.net].node, vals(s));
const innerV = (s) => equivalent(NETS[s.net].inner, vals(s));

// Layout: returns {w, h} then draws.
function size(n) {
  if (n.t === 'c') return { w: 70, h: 34 };
  const k = n.kids.map(size);
  return n.t === 's' ? { w: k.reduce((p, a) => p + a.w + 20, -20), h: Math.max(...k.map((a) => a.h)) } : { w: Math.max(...k.map((a) => a.w)) + 40, h: k.reduce((p, a) => p + a.h + 16, -16) };
}
function drawNode(ctx, n, x, y, ctxs) {
  const { c: col, stage, vals: v } = ctxs;
  const sz = size(n);
  if (n.t === 'c') {
    ctx.fillStyle = col.fillB; ctx.fillRect(x, y, 70, 34); ctx.strokeStyle = col.ink; ctx.lineWidth = 3; ctx.strokeRect(x, y, 70, 34);
    label(ctx, `C${n.i + 1} = ${v[n.i]}`, x + 35, y + 17, col, { size: 11, bounds: stage, patch: false });
    return;
  }
  if (n.t === 's') {
    let cx = x;
    n.kids.forEach((k, i) => {
      const ks = size(k);
      drawNode(ctx, k, cx, y + (sz.h - ks.h) / 2, ctxs);
      if (i < n.kids.length - 1) line(ctx, cx + ks.w, y + sz.h / 2, cx + ks.w + 20, y + sz.h / 2, { color: col.ink, width: 3 });
      cx += ks.w + 20;
    });
  } else {
    let cy = y;
    n.kids.forEach((k) => {
      const ks = size(k);
      const kx = x + 20 + (sz.w - 40 - ks.w) / 2;
      drawNode(ctx, k, kx, cy, ctxs);
      line(ctx, x, cy + ks.h / 2, kx, cy + ks.h / 2, { color: col.ink, width: 3 });
      line(ctx, kx + ks.w, cy + ks.h / 2, x + sz.w, cy + ks.h / 2, { color: col.ink, width: 3 });
      cy += ks.h + 16;
    });
    line(ctx, x, y + size(n.kids[0]).h / 2, x, cy - 16 - size(n.kids.at(-1)).h / 2, { color: col.ink, width: 3 });
    line(ctx, x + sz.w, y + size(n.kids[0]).h / 2, x + sz.w, cy - 16 - size(n.kids.at(-1)).h / 2, { color: col.ink, width: 3 });
  }
}

createTool({
  state,
  label: 'A network of three capacitors drawn as boxes joined by wires: in a row for series and stacked for parallel. Readouts reduce it in steps, first the inner group and then the whole, giving the single equivalent capacitance.',
  draw(ctx, stage, c) {
    const n = NETS[state.net].node;
    const sz = size(n);
    const k = Math.min(1, (stage.w - 20) / sz.w);
    ctx.save();
    ctx.translate((stage.w - sz.w * k) / 2, (stage.h - sz.h * k) / 2 - 10);
    ctx.scale(k, k);
    drawNode(ctx, n, 0, 0, { c, stage, vals: vals(state) });
    ctx.restore();
    label(ctx, NETS[state.net].how, stage.w / 2, stage.h - 14, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Reduce the network' },
    { key: 'net', label: 'Network', options: Object.keys(NETS).map((k) => [k, k.toUpperCase()]) },
    { key: 'C1', label: 'C₁ (µF)', min: 1, max: 10, step: 1 },
    { key: 'C2', label: 'C₂ (µF)', min: 1, max: 10, step: 1 },
    { key: 'C3', label: 'C₃ (µF)', min: 1, max: 10, step: 1 },
    { readout: [
      ['Layout', (s) => NETS[s.net].name],
      ['Step 1: inner group', (s) => `${innerV(s).toFixed(2)} µF`],
      ['Whole network', (s) => `${eqv(s).toFixed(2)} µF`],
    ] },
  ],
  tex: (s) => `C_{eq}=${eqv(s).toFixed(2)}\\ \\mu\\mathrm{F}`,
});
