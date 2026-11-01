import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { DOPANTS, dopeKind } from './_intrinsic-extrinsic-semiconductors-math.js';

const state = { i: 1, reveal: true };
const now = () => DOPANTS[state.i];
const DIRS = [[-1, -1], [1, -1], [-1, 1], [1, 1]];

const tool = createTool({
  state,
  label: 'A dopant atom in the middle of a silicon lattice, joined to four silicon neighbours by bonds. Each bond holds a coral electron from the dopant and one from silicon. If the dopant has five valence electrons, one is left over and floats free. If it has three, one bond has an empty green ring, a hole.',
  draw(ctx, stage, c) {
    const d = now();
    const kind = dopeKind(d.valence);
    const cx = stage.w / 2;
    const cy = stage.h / 2;
    const reach = Math.min(stage.w, stage.h) * 0.3;
    DIRS.forEach(([sx, sy], k) => {
      const nx = cx + sx * reach;
      const ny = cy + sy * reach;
      line(ctx, cx, cy, nx, ny, { color: c.ink, width: 3 });
      dot(ctx, nx, ny, 14, c.fillB, c.ink);
      label(ctx, 'Si', nx, ny, c, { size: 10, patch: false });
      const mx = cx + sx * reach * 0.55;
      const my = cy + sy * reach * 0.55;
      const missing = kind === 'p' && k === 3;
      if (missing) {
        if (state.reveal) dot(ctx, mx, my, 7, c.paper, c.c, 3);
      } else {
        dot(ctx, mx, my, 5, c.a, c.ink, 2);
      }
    });
    dot(ctx, cx, cy, 20, c.fillY, c.ink);
    label(ctx, d.sym, cx, cy, c, { size: 14, patch: false });
    if (kind === 'n' && state.reveal) {
      dot(ctx, cx + reach * 0.15, cy - reach * 0.95, 8, c.a, c.ink, 2);
      label(ctx, 'free electron', cx + reach * 0.15, cy - reach * 0.95 - 16, c, { size: 10, bounds: stage, patch: false });
    }
    if (kind === 'p' && state.reveal) label(ctx, 'hole', cx + reach * 0.55, cy + reach * 0.55 + 20, c, { size: 10, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Pick a dopant' },
    { key: 'i', label: 'Dopant atom', options: DOPANTS.map((d, i) => [i, d.sym]) },
    { key: 'reveal', label: 'Show the answer', toggle: true },
    { readout: [
      ['Name', () => now().name],
      ['Group', () => String(now().group)],
      ['Valence electrons', () => String(now().valence)],
      ['Type', () => (state.reveal ? { text: `${dopeKind(now().valence)}-type`, good: true } : '?')],
      ['Majority carrier', () => (state.reveal ? (dopeKind(now().valence) === 'n' ? 'electrons' : 'holes') : '?')],
      ['Minority carrier', () => (state.reveal ? (dopeKind(now().valence) === 'n' ? 'holes' : 'electrons') : '?')],
    ] },
  ],
  tex: () => `${now().valence}\\ \\text{valence electrons}-4\\ \\text{bonds}=${now().valence - 4}`,
});

tool.update();
