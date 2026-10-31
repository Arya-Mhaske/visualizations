import { createDrill } from '../../lib/drill.js';
import { line, label } from '../../lib/draw.js';

// A graph is one or more polylines in unit coordinates (0 to 1 across, −1 to 1 up).
const CASES = [
  { axis: 'x', real: false, paths: [[[0, 0], [0.5, 0.6], [0.3, 0.8], [0.7, 0.9], [1, 0.9]]],
    why: 'Time runs backwards in the middle, so the object would be in two places at once.' },
  { axis: 'x', real: false, paths: [[[0, 0.2], [0.45, 0.3]], [[0.45, 0.8], [1, 0.9]]],
    why: 'x jumps with no time passing. That would need infinite velocity.' },
  { axis: 'speed', real: false, paths: [[[0, 0.6], [0.4, 0.1], [0.7, -0.5], [1, -0.7]]],
    why: 'Speed is a size, so it can never be negative. Velocity could be; speed can\'t.' },
  { axis: 'x', real: false, paths: [[[0.1, 0.3], [0.1, 0.8]], [[0.1, 0.8], [1, 0.8]]],
    why: 'A vertical line means x changes in no time at all.' },
  { axis: 'x', real: true, paths: [[[0, -0.6], [0.3, -0.2], [0.6, 0.1], [1, 0.2]]],
    why: 'A negative position only means the object is behind the origin.' },
  { axis: 'v', real: true, paths: [[[0, 0.7], [0.5, 0], [1, -0.7]]],
    why: 'Negative velocity is fine: the object is moving the other way, as a ball does after its peak.' },
  { axis: 'x', real: true, paths: [[[0, 0.1], [0.3, 0.7], [0.5, 0.8], [0.7, 0.7], [1, 0.1]]],
    why: 'One x for each t, with no jumps. This is a there-and-back trip.' },
  { axis: 'x', real: true, paths: [[[0, 0.5], [1, 0.5]]],
    why: 'A flat line is simply an object at rest.' },
];

const figure = (item) => (ctx, stage, c) => {
  const mid = stage.h / 2;
  const toPx = ([x, y]) => [24 + x * (stage.w - 44), mid - y * (mid - 16)];
  line(ctx, 24, 8, 24, stage.h - 8, { color: c.ink, width: 2 });
  line(ctx, 24, mid, stage.w - 12, mid, { color: c.ink, width: 2 });
  label(ctx, 't', stage.w - 14, mid + 12, c, { size: 12 });
  label(ctx, item.axis, 34, 14, c, { size: 12 });
  for (const path of item.paths) {
    for (let i = 1; i < path.length; i++) line(ctx, ...toPx(path[i - 1]), ...toPx(path[i]), { color: c.a, width: 4 });
  }
};

createDrill({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  seed: 1,
  generate(rng) {
    const item = rng.pick(CASES);
    return {
      prompt: 'Could this graph describe a real object?',
      alt: `A graph of ${item.axis} against time.`,
      figure: figure(item),
      options: ['Yes, it could', 'No, impossible'],
      answer: item.real ? 0 : 1,
      hint: 'Is there one value for each time? Any jumps? Can this quantity be negative?',
      explain: item.why,
    };
  },
});
