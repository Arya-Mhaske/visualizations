import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { dot, label, poly } from '../../lib/draw.js';
import { createBench } from '../../lib/rays.js';
import { fixed } from '../../lib/format.js';
import { crossingFormula, exactRay } from './_mirrors-math.js';

const state = { h: 3, R: 10, kind: 'concave', fan: true };
const RANGE = { concave: [-16.5, 2.5], convex: [-8, 15] };
const FAN = 7; // rays each side of the axis
const maxH = (s) => s.R * 0.8;
const ray = (s = state) => exactRay(s.kind, s.R, s.h);
const degrees = (a) => (a * 180) / Math.PI;
const focusX = (s) => (s.kind === 'concave' ? -s.R / 2 : s.R / 2);

function drawMirror(ctx, bench, c) {
  const { kind, R } = state;
  const top = maxH(state) * 1.04;
  bench.mirror(kind === 'concave' ? R : -R, top);
}

function drawFan(bench, c) {
  const { left } = bench.view();
  for (let i = -FAN; i <= FAN; i++) {
    if (i === 0) continue;
    const h = (i / FAN) * maxH(state);
    const { M, out, cross } = exactRay(state.kind, state.R, h);
    bench.ray([left, h], M, { color: c.grid, arrow: false, width: 1 });
    if (state.kind === 'concave') bench.ray(M, [cross, 0], { color: c.b, arrow: false, width: 1 });
    else {
      bench.rayTo(M, out, { color: c.b, arrow: false, width: 1 });
      bench.ray(M, [cross, 0], { color: c.b, arrow: false, width: 1, dash: [3, 4] });
    }
  }
}

function drawTriangle(ctx, bench, c, { M, C, cross }) {
  poly(ctx, [bench.toPx(...M), bench.toPx(...C), bench.toPx(cross, 0)], { fill: c.fillY });
  bench.ray(M, C, { color: c.d, dash: [6, 5], arrow: false });
}

const tool = createTool({
  state,
  label: 'A parallel beam strikes a curved mirror. Rays near the axis cross it halfway between the mirror and its centre. A shaded triangle formed by one ray, the radius and the axis has two equal sides. Drag the point where the ray meets the mirror.',
  setup: (stage, c) => createBench(stage, { x: RANGE.concave, c }),
  draw(ctx, stage, c, bench) {
    bench.setRange(RANGE[state.kind]);
    const hit = ray();
    const { M, C, out, cross } = hit;
    const { left } = bench.view();
    if (state.fan) drawFan(bench, c);
    drawTriangle(ctx, bench, c, hit);
    bench.axis();
    drawMirror(ctx, bench, c);
    bench.ray([left, M[1]], M, { color: c.a, width: 3 });
    if (state.kind === 'concave') bench.ray(M, [cross, 0], { color: c.a, width: 3 });
    else {
      bench.rayTo(M, out, { color: c.a, width: 3 });
      bench.ray(M, [cross, 0], { color: c.a, dash: [6, 5], arrow: false });
    }
    bench.mark('P', 0, { below: false });
    if (bench.inView(C[0], 0)) bench.mark('C', C[0], { color: c.d });
    bench.mark('R/2', focusX(state), { color: c.b });
    dot(ctx, ...bench.toPx(cross, 0), 6, c.c, c.ink, 2);
    dot(ctx, ...bench.toPx(...M), 11, c.a, c.ink);
    label(ctx, `θ = ${fixed(degrees(hit.theta), 1)}°`, 8, 14, c, { size: 12, align: 'left', bounds: stage });
    label(ctx, 'Drag the coral dot on the mirror', 8, stage.h - 14, c, { size: 11, align: 'left', bounds: stage });
  },
  controls: () => [
    { title: 'One ray, one mirror' },
    { key: 'h', label: 'Ray height', min: 0.2, max: 8, step: 0.1, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'R', label: 'Radius R', min: 6, max: 14, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'kind', label: 'Mirror', options: [['concave', 'Concave'], ['convex', 'Convex']] },
    { key: 'fan', label: 'Show the whole beam', toggle: true },
    { readout: [
      ['Angle θ', (s) => `${fixed(degrees(ray(s).theta), 1)}°`],
      ['Sides of the triangle', (s) => `${fixed(s.R - ray(s).fromPole, 2)} and ${fixed(s.R - ray(s).fromPole, 2)} cm`],
      ['Crossing, from P', (s) => `${fixed(ray(s).fromPole, 2)} cm`],
      ['R/2', (s) => `${fixed(s.R / 2, 2)} cm`],
      ['Miss', (s) => { const miss = Math.abs(ray(s).fromPole - s.R / 2); return { text: `${fixed(miss, 2)} cm`, good: miss < 0.05 }; }],
    ] },
  ],
  tex: (s) => `PF=R-\\frac{R}{2\\cos\\theta}=${fixed(s.R, 1)}-\\frac{${fixed(s.R, 1)}}{2\\cos ${fixed(degrees(ray(s).theta), 1)}^\\circ}=${fixed(crossingFormula(s.R, ray(s).theta), 2)}\\ \\text{cm}`,
  onChange() { state.h = Math.min(state.h, maxH(state)); },
});

const clampH = (h) => Math.max(0.2, Math.min(maxH(state), Math.round(h * 10) / 10));
handles(tool.stage, [{
  at: () => tool.extra.toPx(...ray().M),
  move(px, py) { state.h = clampH(tool.extra.toWorld(px, py)[1]); },
  nudge(direction) { state.h = clampH(state.h + direction * 0.1); },
}], { onChange: () => tool.update(), radius: 30 });
