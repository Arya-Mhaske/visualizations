import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { label } from '../../lib/draw.js';
import { createBench } from '../../lib/rays.js';
import { fixed } from '../../lib/format.js';
import { describe, imageOf, region, signedF } from './_mirrors-math.js';
import { drawBench, drawScene } from './_mirrors-view.js';

const state = { u: -15, kind: 'concave', fSize: 5, h: 3, parallel: true, focus: true, centre: true };
const f = (s = state) => signedF(s.kind, s.fSize);
const image = (s = state) => imageOf(s.u, f(s));
const cm = (x) => (Number.isFinite(x) ? `${fixed(x, 2)} cm` : 'infinity');

const tool = createTool({
  state,
  label: 'A ray diagram for a curved mirror. Rays from the tip of an arrow reflect from the mirror and meet at the tip of the image. Drag the arrow along the axis to see the image change.',
  setup: (stage, c) => createBench(stage, { x: [-20, 12], c }),
  draw(ctx, stage, c, bench) {
    drawBench(bench, stage, c, { f: f() });
    const colors = { parallel: state.parallel && c.b, focus: state.focus && c.d, centre: state.centre && c.ink };
    drawScene(bench, stage, ctx, c, { u: state.u, h: state.h, f: f(), colors });
    label(ctx, 'Drag the arrow', 8, stage.h - 14, c, { size: 11, align: 'left', bounds: stage });
  },
  controls: () => [
    { title: 'Build the image' },
    { key: 'u', label: 'Object position u', min: -18, max: -1, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'kind', label: 'Mirror', options: [['concave', 'Concave'], ['convex', 'Convex']] },
    { key: 'fSize', label: 'Focal length, size', min: 3, max: 8, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'h', label: 'Object height', min: 1, max: 5, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'parallel', label: 'Blue: comes in parallel, leaves through F', toggle: true },
    { key: 'focus', label: 'Purple: comes through F, leaves parallel', toggle: true },
    { key: 'centre', label: 'Black: through C, back on itself', toggle: true },
    { readout: [
      ['Object is', (s) => region(s.u, f(s))],
      ['f', (s) => cm(f(s))],
      ['Image at v', (s) => cm(image(s).v)],
      ['Magnification m', (s) => (image(s).atInfinity ? 'none' : fixed(image(s).m, 2))],
      ['Image height', (s) => (image(s).atInfinity ? 'none' : cm(image(s).m * s.h))],
      ['Image is', (s) => describe(image(s))],
    ] },
  ],
  tex(s) {
    const { v, m, atInfinity } = image(s);
    if (atInfinity) return `\\frac1v=\\frac1{${fixed(f(s), 1)}}-\\frac1{${fixed(s.u, 1)}}=0`;
    return `\\frac1v+\\frac1{${fixed(s.u, 1)}}=\\frac1{${fixed(f(s), 1)}}\\Rightarrow v=${fixed(v, 2)},\\ m=-\\frac vu=${fixed(m, 2)}`;
  },
});

const clampU = (u) => Math.max(-18, Math.min(-1, Math.round(u * 2) / 2));
handles(tool.stage, [{
  at: () => tool.extra.toPx(state.u, state.h / 2),
  move(px) { state.u = clampU(tool.extra.toWorld(px, 0)[0]); },
  nudge(direction) { state.u = clampU(state.u + direction * 0.5); },
}], { onChange: () => tool.update(), radius: 30 });
