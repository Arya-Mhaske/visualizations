import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { spheroidArea, sphereArea } from './_surface-tension-math.js';

const state = { j: 10 };
const kOf = (s) => 2 ** ((s.j - 10) / 8);
const ratio = (k) => spheroidArea(k) / sphereArea();

createTool({
  state,
  label: 'Above, the silhouette of a spheroid with the same volume as the sphere. Below, a graph of surface area against stretch, with a minimum at the sphere.',
  setup: (stage, c) => createPlot(stage, { x: [-1.25, 1.25], y: [0.98, 1.3], c, box: (st) => ({ x: 0, y: st.h * 0.4, w: st.w, h: st.h * 0.6 }) }),
  draw(ctx, stage, c, plot) {
    const k = kOf(state);
    const R = Math.min(stage.w / 2 - 20, stage.h * 0.2) / 1.6;
    const [a, b] = [R * k, R / Math.sqrt(k)];
    const [cx, cy] = [stage.w / 2, stage.h * 0.2];
    const pts = [];
    for (let i = 0; i < 80; i++) pts.push([cx + a * Math.cos((i / 80) * 6.2832), cy + b * Math.sin((i / 80) * 6.2832)]);
    poly(ctx, pts, { fill: c.fillB, stroke: c.ink });
    plot.axes({ xLabel: 'stretch (log₂)', yLabel: 'A / A₀' });
    plot.fn((x) => ratio(2 ** x), { color: c.b });
    plot.point(Math.log2(k), ratio(k));
    label(ctx, `area = ${fixed(ratio(k), 3)} × sphere`, stage.w / 2, stage.h * 0.37, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Squash or stretch' },
    { key: 'j', label: 'Stretch (left flat, right long)', min: 0, max: 20, step: 1, format: (v) => (v === 10 ? 'sphere' : v < 10 ? 'flat' : 'long') },
    { readout: [
      ['Axis ratio', (s) => fixed(kOf(s) ** 1.5, 2)],
      ['Area ÷ sphere area', (s) => fixed(ratio(kOf(s)), 3)],
      ['Surface energy', (s) => `${fixed(ratio(kOf(s)), 3)} × minimum`],
    ] },
  ],
  tex: (s) => `E=S\\times A\\quad A/A_{\\text{sphere}}=${fixed(ratio(kOf(s)), 3)}`,
});
