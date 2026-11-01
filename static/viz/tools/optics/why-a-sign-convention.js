import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { arrow, dot, label } from '../../lib/draw.js';
import { createBench } from '../../lib/rays.js';
import { fixed } from '../../lib/format.js';
import { describe, imageOf, signedF, unsignedV } from './_mirrors-math.js';
import { drawBench, drawScene } from './_mirrors-view.js';

const state = { u: -15, kind: 'convex', fSize: 5, drop: true };
const f = (s = state) => signedF(s.kind, s.fSize);
const image = (s = state) => imageOf(s.u, f(s));
const cm = (x) => (Number.isFinite(x) ? `${fixed(x, 2)} cm` : 'infinity');
const signed = (x) => (x > 0 ? `+${fixed(x, 2)}` : fixed(x, 2));

function verdict(s) {
  if (image(s).atInfinity) return { text: 'No image here', good: true };
  const wrong = unsignedV(s.u, f(s));
  if (Math.abs(Math.abs(wrong) - Math.abs(image(s).v)) > 0.005) return { text: 'Wrong size of v', good: false };
  return { text: 'Right size, but no side', good: false };
}

// Signed lengths, each drawn as an arrow leaving the pole. The arrow's direction is its sign.
function drawMeasures(ctx, stage, c, bench) {
  const rows = [['u', state.u, c.a], ['f', f(), c.d]];
  if (!image().atInfinity) rows.push(['v', image().v, c.c]);
  const y0 = bench.toPx(0, 0)[1];
  const { left, right } = bench.view();
  rows.forEach(([name, value, color], i) => {
    const y = y0 + stage.h * (0.26 + i * 0.065);
    const end = bench.toPx(Math.max(left, Math.min(right, value)), 0)[0];
    const start = bench.toPx(0, 0)[0];
    if (Math.abs(end - start) > 3) arrow(ctx, start, y, end, y, { color, width: 3 });
    label(ctx, `${name} = ${signed(value)}`, value < 0 ? start + 6 : start - 6, y, c, { size: 12, align: value < 0 ? 'left' : 'right', color, bounds: stage });
  });
  arrow(ctx, stage.w * 0.08, 14, stage.w * 0.34, 14, { color: c.ink, width: 3 });
  label(ctx, 'Light goes this way: +', stage.w * 0.08, 30, c, { size: 11, align: 'left', bounds: stage });
}

function drawGhost(ctx, stage, c, bench) {
  if (!state.drop || image().atInfinity) return;
  const wrong = unsignedV(state.u, f());
  if (Math.abs(Math.abs(wrong) - Math.abs(image().v)) < 0.005 || !bench.inView(-wrong, 0)) return;
  const [x, y] = bench.toPx(-wrong, 0);
  dot(ctx, x, y, 8, c.paper, c.ink, 3);
  label(ctx, 'No signs', x, y + 18, c, { size: 12, bounds: stage });
}

const tool = createTool({
  state,
  label: 'A mirror on a marked axis with the pole at zero. Arrows from the pole show u, v and f with their signs. A ring shows where the formula puts the image if the signs are dropped.',
  setup: (stage, c) => createBench(stage, { x: [-24, 14], cy: 0.42, c }),
  draw(ctx, stage, c, bench) {
    drawBench(bench, stage, c, { f: f() });
    drawScene(bench, stage, ctx, c, { u: state.u, h: 3, f: f(), colors: { parallel: c.b, pole: c.d } });
    drawGhost(ctx, stage, c, bench);
    drawMeasures(ctx, stage, c, bench);
  },
  controls: () => [
    { title: 'One formula, every mirror' },
    { key: 'u', label: 'Object position u', min: -22, max: -1, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'kind', label: 'Mirror', options: [['concave', 'Concave'], ['convex', 'Convex']] },
    { key: 'fSize', label: 'Focal length, size', min: 2, max: 8, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'drop', label: 'Show the answer with no signs', toggle: true },
    { readout: [
      ['With signs, v', (s) => cm(image(s).v)],
      ['Image', (s) => describe(image(s))],
      ['No signs, v', (s) => cm(unsignedV(s.u, f(s)))],
      ['No signs verdict', verdict],
    ] },
  ],
  tex(s) {
    const v = image(s).v;
    const top = `\\frac1v=\\frac1f-\\frac1u=\\frac1{${fixed(f(s), 1)}}-\\frac1{${fixed(s.u, 1)}}`;
    return Number.isFinite(v) ? `${top}\\Rightarrow v=${fixed(v, 2)}\\ \\text{cm}` : top;
  },
});

const clampU = (u) => Math.max(-22, Math.min(-1, Math.round(u * 2) / 2));
handles(tool.stage, [{
  at: () => tool.extra.toPx(state.u, 1.5),
  move(px) { state.u = clampU(tool.extra.toWorld(px, 0)[0]); },
  nudge(direction) { state.u = clampU(state.u + direction * 0.5); },
}], { onChange: () => tool.update(), radius: 30 });
