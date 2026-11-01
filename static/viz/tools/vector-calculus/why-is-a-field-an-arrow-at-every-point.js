import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { FIELDS, vec2 } from './_vector-calculus-math.js';
import { WINDOW, fieldArrows, arrowAt } from './_vector-calculus-view.js';

const state = { field: 'wind', px: 1, py: 2, grid: 1 };
const CHOICES = ['wind', 'swirl', 'source', 'shear'];

const tool = createTool({
  state,
  label: 'A wind map: a grid of arrows, one at every point, showing the wind there. The coral arrow is the wind at the probe point.',
  setup: (stage, c) => createPlot(stage, { ...WINDOW, c }),
  draw(ctx, stage, c, plot) {
    const F = FIELDS[state.field];
    plot.axes();
    fieldArrows(ctx, plot, (x, y) => vec2(F, x, y), c, { step: Number(state.grid), color: c.grid, width: 2 });
    const v = vec2(F, state.px, state.py);
    arrowAt(ctx, plot, state.px, state.py, v[0], v[1], { k: 40, cap: 90, color: c.a, width: 4, head: 12 });
    plot.point(state.px, state.py, { fill: c.ink, r: 5 });
    plot.text(`(${state.px}, ${state.py})`, state.px, state.py - 0.55, { size: 11 });
  },
  controls: [
    { title: 'Read the map' },
    { key: 'field', label: 'Wind', options: CHOICES.map((k) => [k, FIELDS[k].name]) },
    { key: 'px', label: 'Probe x', min: -4, max: 4, step: 1 },
    { key: 'py', label: 'Probe y', min: -4, max: 4, step: 1 },
    { key: 'grid', label: 'Arrows shown', options: [[1, 'Every 1 unit'], [2, 'Every 2 units']] },
    { readout: [
      ['Wind at probe F', (s) => `(${vec2(FIELDS[s.field], s.px, s.py).map((v) => fixed(v, 2)).join(', ')})`],
      ['Speed |F|', (s) => fixed(Math.hypot(...vec2(FIELDS[s.field], s.px, s.py)), 2)],
    ] },
  ],
  tex: (s) => {
    const v = vec2(FIELDS[s.field], s.px, s.py).map((x) => fixed(x, 2));
    return `\\mathbf{F}(${s.px}, ${s.py}) = (P, Q) = (${v[0]}, ${v[1]})`;
  },
});
