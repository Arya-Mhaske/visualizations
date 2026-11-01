import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { label, poly } from '../../lib/draw.js';
import { createBench } from '../../lib/rays.js';
import { fixed } from '../../lib/format.js';
import { imageOf, triangles } from './_mirrors-math.js';
import { drawBench, drawScene } from './_mirrors-view.js';

const state = { step: 'pole', u: -10, fSize: 6, h: 3 };
const n2 = (x) => fixed(x, 2);
const f = (s = state) => -s.fSize;
const nearest = (s) => -1.4 * s.fSize; // keeps the real image on the drawing
const sizes = (s = state) => triangles(s.u, f(s), s.h);
const image = (s = state) => imageOf(s.u, f(s));

function shade(ctx, bench, c) {
  const { u, h } = state;
  const { v, m } = image();
  const [A, B, P, F] = [[u, h], [u, 0], [0, 0], [f(), 0]];
  const [imageTip, imageFoot, M] = [[v, m * h], [v, 0], [0, h]];
  const fill = (points, colour) => poly(ctx, points.map((p) => bench.toPx(...p)), { fill: colour, stroke: colour === c.fillA ? c.a : c.b, width: 2 });
  if (state.step !== 'focus') {
    fill([A, B, P], c.fillA);
    fill([imageTip, imageFoot, P], c.fillA);
  }
  if (state.step !== 'pole') {
    fill([M, P, F], c.fillB);
    fill([imageTip, imageFoot, F], c.fillB);
  }
}

const tool = createTool({
  state,
  label: 'A concave mirror forms a real inverted image of an arrow. Two pairs of similar triangles are shaded: one pair meets at the pole and the other at the focus. Drag the arrow along the axis and the ratios stay equal.',
  setup: (stage, c) => createBench(stage, { x: [-27, 4], cy: 0.48, c }),
  draw(ctx, stage, c, bench) {
    shade(ctx, bench, c);
    drawBench(bench, stage, c, { f: f() });
    const colors = { parallel: state.step === 'pole' ? c.grid : c.b, pole: state.step === 'focus' ? c.grid : c.d };
    drawScene(bench, stage, ctx, c, { u: state.u, h: state.h, f: f(), colors });
    const { v, m } = image();
    const [ax, ay] = bench.toPx(state.u, state.h);
    label(ctx, 'A', ax, ay - 12, c, { size: 12, bounds: stage });
    label(ctx, 'B', bench.toPx(state.u, 0)[0], bench.toPx(0, 0)[1] + 15, c, { size: 12, bounds: stage });
    label(ctx, 'B′', bench.toPx(v, 0)[0], bench.toPx(0, 0)[1] - 15, c, { size: 12, bounds: stage });
    const [tx, ty] = bench.toPx(v, m * state.h);
    label(ctx, 'A′', tx, ty + 14, c, { size: 12, bounds: stage });
    const [mx, my] = bench.toPx(0, state.h);
    if (state.step !== 'pole') label(ctx, 'M', mx - 12, my - 8, c, { size: 12, bounds: stage });
    label(ctx, 'Drag the arrow', 8, 14, c, { size: 11, align: 'left', bounds: stage });
  },
  controls: () => [
    { title: 'Two pairs of triangles' },
    { key: 'u', label: 'Object position u', min: -24, max: -4.2, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'step', label: 'Look at', options: [['pole', '1 At P'], ['focus', '2 At F'], ['join', '3 Join them']] },
    { key: 'fSize', label: 'Focal length, size', min: 3, max: 6, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'h', label: 'Object height', min: 1, max: 3, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { readout: [
      ['BP, B′P', (s) => `${n2(sizes(s).BP)}, ${n2(sizes(s).BPimage)} cm`],
      ['B′F, FP', (s) => `${n2(sizes(s).BF)}, ${n2(sizes(s).FP)} cm`],
      ['AB, A′B′', (s) => `${n2(sizes(s).AB)}, ${n2(sizes(s).imageH)} cm`],
      ['A′B′/AB', (s) => n2(sizes(s).poleLeft)],
      ['B′P/BP', (s) => n2(sizes(s).poleRight)],
      ['B′F/FP', (s) => n2(sizes(s).focusRight)],
      ['1/v + 1/u', (s) => n2(1 / image(s).v + 1 / s.u)],
      ['1/f', (s) => n2(1 / f(s))],
    ] },
  ],
  tex(s) {
    const t = sizes(s);
    if (s.step === 'pole') return `\\frac{A'B'}{AB}=\\frac{B'P}{BP}=\\frac{${n2(t.BPimage)}}{${n2(t.BP)}}=${n2(t.poleRight)}`;
    if (s.step === 'focus') return `\\frac{A'B'}{PM}=\\frac{B'F}{FP}=\\frac{${n2(t.BF)}}{${n2(t.FP)}}=${n2(t.focusRight)}`;
    return '\\frac{B\'P}{BP}=\\frac{B\'F}{FP}\\ \\Rightarrow\\ \\frac{v}{u}=\\frac{v-f}{f}\\ \\Rightarrow\\ \\frac1v+\\frac1u=\\frac1f';
  },
  onChange() { state.u = Math.min(state.u, nearest(state)); },
});

const clampU = (u) => Math.min(nearest(state), Math.max(-24, Math.round(u * 2) / 2));
handles(tool.stage, [{
  at: () => tool.extra.toPx(state.u, state.h / 2),
  move(px) { state.u = clampU(tool.extra.toWorld(px, 0)[0]); },
  nudge(direction) { state.u = clampU(state.u + direction * 0.5); },
}], { onChange: () => tool.update(), radius: 30 });
