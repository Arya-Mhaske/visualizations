import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed, sig, texSci } from '../../lib/format.js';
import { ATOM_SPACING, CONTACT_GAP, POLISH, atomsTall, contactShare, medianGap, pressTogether } from './_p-n-junction-diode-math.js';

const state = { view: 'slabs', polish: 'ground', zoom: -4.7, squash: 0 };
const ATOM_VIEW = 40e-9; // m: zoomed in this far, atoms are big enough to draw
const CELLS = 120;
const cache = {};
const press = (s) => (cache[s.polish] ??= pressTogether(POLISH[s.polish]));
const rms = (s) => POLISH[s.polish];
const win = (s) => 10 ** s.zoom;
const squashM = (s) => s.squash * rms(s);

function lengthText(m) {
  if (m >= 1e-3) return `${sig(m * 1e3, 2)} mm`;
  return m >= 1e-6 ? `${sig(m * 1e6, 2)} μm` : `${sig(m * 1e9, 2)} nm`;
}
const niceLength = (target) => {
  const e = 10 ** Math.floor(Math.log10(target));
  return [5, 2, 1].map((k) => k * e).find((v) => v <= target) ?? e;
};
const share = (s) => (s.view === 'crystal' ? 1 : contactShare(press(s), squashM(s)));
const shareText = (x) => (x >= 0.9995 ? '100%' : `${sig(x * 100, 2)}%`);

// The smallest gap in each of CELLS stretches of the surface, found once per slab pair.
function cells(p) {
  if (!p.cells) {
    p.cells = new Float64Array(CELLS).fill(Infinity);
    p.gap.forEach((v, i) => {
      const k = Math.floor((i / p.gap.length) * CELLS);
      if (v < p.cells[k]) p.cells[k] = v;
    });
  }
  return p.cells;
}

function drawSlabs(ctx, c, area, stage) {
  const p = press(state);
  const W = win(state);
  const pad = 8;
  const s = (area.w - pad * 2) / W;
  const x0 = p.at - W / 2;
  const base = p.a.h(p.at);
  const lower = (x) => p.a.h(x);
  const upper = (x) => p.top - p.b.h(x) - squashM(state);
  const px = (x) => area.x + pad + (x - x0) * s;
  const py = (h) => area.y + area.h / 2 - (h - base) * s;
  const atoms = W <= ATOM_VIEW;
  const steps = Math.floor(area.w - pad * 2);
  const xs = Array.from({ length: steps + 1 }, (_, i) => x0 + (W * i) / steps);

  ctx.save();
  ctx.beginPath();
  ctx.rect(area.x, area.y, area.w, area.h);
  ctx.clip();
  const slab = (height, edge, fill) => {
    ctx.beginPath();
    ctx.moveTo(px(xs[0]), edge);
    xs.forEach((x) => ctx.lineTo(px(x), py(height(x))));
    ctx.lineTo(px(xs[steps]), edge);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.beginPath();
    xs.forEach((x, i) => (i ? ctx.lineTo(px(x), py(height(x))) : ctx.moveTo(px(x), py(height(x)))));
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
  };
  slab(lower, area.y + area.h + 4, atoms ? c.paper : c.fillB);
  slab(upper, area.y - 4, atoms ? c.paper : c.fillA);
  ctx.fillStyle = c.d;
  xs.forEach((x) => {
    const [yl, yu] = [py(lower(x)), py(upper(x))];
    if (yu > yl) ctx.fillRect(px(x), yl, 2, yu - yl);
  });
  if (atoms) {
    const r = ATOM_SPACING * s * 0.42;
    for (let i = Math.floor(x0 / ATOM_SPACING); i <= Math.ceil((x0 + W) / ATOM_SPACING); i++) {
      for (let k = 0; k < 6; k++) {
        dot(ctx, px(i * ATOM_SPACING), py(lower(i * ATOM_SPACING) - (k + 0.5) * ATOM_SPACING), r, c.b, c.ink, 1.5);
        dot(ctx, px((i + 0.5) * ATOM_SPACING), py(upper((i + 0.5) * ATOM_SPACING) + (k + 0.5) * ATOM_SPACING), r, c.a, c.ink, 1.5);
      }
    }
  }
  ctx.restore();

  label(ctx, 'n-slab', area.x + 8, area.y + 12, c, { size: 11, align: 'left', patch: false });
  label(ctx, 'p-slab', area.x + 8, area.y + area.h - 12, c, { size: 11, align: 'left', patch: false });
  label(ctx, atoms ? 'every circle is an atom' : 'zoom in until atoms show', area.x + area.w - 8, area.y + 12, c, { size: 10, align: 'right', bounds: stage });
  const bar = niceLength(W * 0.25);
  line(ctx, area.x + pad, area.y + area.h / 2 + 28, area.x + pad + bar * s, area.y + area.h / 2 + 28, { color: c.ink, width: 4 });
  label(ctx, lengthText(bar), area.x + pad, area.y + area.h / 2 + 42, c, { size: 11, align: 'left', bounds: stage });
}

function drawCrystal(ctx, c, area, stage) {
  const W = win(state);
  const mid = area.x + area.w / 2;
  if (W > ATOM_VIEW) {
    ctx.fillStyle = c.fillB;
    ctx.fillRect(area.x, area.y, area.w / 2, area.h);
    ctx.fillStyle = c.fillA;
    ctx.fillRect(mid, area.y, area.w / 2, area.h);
    label(ctx, 'zoom in until atoms show', area.x + area.w - 8, area.y + 12, c, { size: 10, align: 'right', bounds: stage });
  } else {
    const s = area.w / W;
    const step = ATOM_SPACING * s;
    const cols = Math.ceil(area.w / step);
    const rows = Math.floor(area.h / step);
    for (let i = 0; i < cols; i++) {
      for (let k = 0; k < rows; k++) {
        const x = area.x + (i + 0.5) * step;
        const y = area.y + (k + 0.5) * step;
        const p = x < mid;
        if ((i * 7 + k * 3) % 11 === 0) {
          ctx.fillStyle = c.d;
          ctx.fillRect(x - step * 0.4, y - step * 0.4, step * 0.8, step * 0.8);
          dot(ctx, x + step * 0.4, y, step * 0.22, p ? c.b : c.a, c.ink, 1.5);
        } else {
          dot(ctx, x, y, step * 0.42, p ? c.fillB : c.fillA, c.ink, 1.5);
        }
      }
    }
  }
  line(ctx, mid, area.y, mid, area.y + area.h, { color: c.ink, width: 3, dash: [6, 4] });
  label(ctx, 'p-type', area.x + 8, area.y + area.h - 12, c, { size: 11, align: 'left' });
  label(ctx, 'n-type', area.x + area.w - 8, area.y + area.h - 12, c, { size: 11, align: 'right' });
}

function drawMap(ctx, c, box, stage) {
  const p = press(state);
  const cell = box.w / CELLS;
  const limit = CONTACT_GAP + squashM(state);
  ctx.fillStyle = c.paper;
  ctx.fillRect(box.x, box.y, box.w, box.h);
  const mins = state.view === 'crystal' ? null : cells(p);
  for (let i = 0; i < CELLS; i++) {
    if (!mins || mins[i] <= limit) {
      ctx.fillStyle = c.c;
      ctx.fillRect(box.x + i * cell, box.y, Math.ceil(cell), box.h);
    }
  }
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(box.x, box.y, box.w, box.h);
  if (mins) {
    const [a, b] = [(p.at - win(state) / 2) / p.length, (p.at + win(state) / 2) / p.length];
    const left = box.x + Math.max(0, Math.min(1, a)) * box.w;
    const right = box.x + Math.max(0, Math.min(1, b)) * box.w;
    const width = Math.max(4, right - left);
    ctx.strokeStyle = c.a;
    ctx.lineWidth = 3;
    ctx.strokeRect((left + right) / 2 - width / 2, box.y - 4, width, box.h + 8);
  }
  label(ctx, state.view === 'crystal' ? 'every point of the junction is crystal' : `${lengthText(p.length)} of surface. Green: touching`, box.x, box.y - 14, c, { size: 10, align: 'left', bounds: stage, patch: false });
}

let fields = [];
const tool = createTool({
  state,
  label: 'Top: a side view of a p-slab below and an n-slab above, pressed together, zoomed by the slider; at the closest zoom every atom is drawn as a circle. Bottom: a strip for the whole surface, green where atoms of the two slabs are close enough to bond. The one-crystal view instead shows a single lattice with p-type atoms on the left and n-type on the right.',
  draw(ctx, stage, c) {
    const area = { x: 6, y: 6, w: stage.w - 12, h: stage.h * 0.8 };
    if (state.view === 'crystal') drawCrystal(ctx, c, area, stage);
    else drawSlabs(ctx, c, area, stage);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(area.x, area.y, area.w, area.h);
    drawMap(ctx, c, { x: 6, y: stage.h * 0.8 + 36, w: stage.w - 12, h: Math.min(28, stage.h * 0.12 - 24) }, stage);
  },
  controls: () => [
    { title: 'Two ways to make a junction' },
    { key: 'view', label: 'Method', options: [['slabs', 'Press two slabs'], ['crystal', 'Dope one crystal']] },
    { key: 'polish', label: 'Surface finish', options: [['filed', 'Filed'], ['ground', 'Ground'], ['polished', 'Polished']] },
    { key: 'zoom', label: 'Field of view', min: -8.5, max: -3.5, step: 0.1, format: (n) => lengthText(10 ** n) },
    { key: 'squash', label: 'Push slabs in by (× bump size)', min: 0, max: 6, step: 0.25, format: (n) => `${fixed(n, 2)}` },
    { readout: [
      ['A bump is about', (s) => (s.view === 'crystal' ? '—' : `${sig(atomsTall(rms(s)), 2)} atoms tall`)],
      ['Atoms touching', (s) => ({ text: shareText(share(s)), good: share(s) > 0.5 })],
      ['A typical gap', (s) => (s.view === 'crystal' ? 'none' : `${sig(medianGap(press(s)) / ATOM_SPACING, 2)} atoms`)],
    ] },
  ],
  tex: (s) => (s.view === 'crystal'
    ? '\\text{one crystal: no gap}'
    : `\\dfrac{\\text{bump}}{\\text{atom}}=\\dfrac{${texSci(rms(s), 1)}\\ \\text{m}}{2.5\\times10^{-10}\\ \\text{m}}=${sig(atomsTall(rms(s)), 2)}`),
  onChange: () => showFields(),
});

function showFields() {
  fields = [...document.querySelectorAll('#panel .nb-stack > .nb-field')];
  fields[1].hidden = state.view === 'crystal';
  fields[3].hidden = state.view === 'crystal';
}

showFields();
