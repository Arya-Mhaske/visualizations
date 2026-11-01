import { createTool } from '../../lib/tool.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { createBench } from '../../lib/rays.js';
import { fixed, sig } from '../../lib/format.js';
import { CAR, SHAVING_R, describe, fieldEdge, firstSeen, imageOf, isSeen } from './_mirrors-math.js';
import { drawBench, drawScene } from './_mirrors-view.js';

const state = { view: 'shave', d: 15, R: 1.2, car: 15 };
const RANGE = { shave: [-42, 72], rear: [-42, 3] };
const fShave = -SHAVING_R / 2;
const face = (s) => imageOf(-s.d, fShave);
const flat = () => fieldEdge(CAR.eye, CAR.w, Infinity);
const curved = (s) => fieldEdge(CAR.eye, CAR.w, s.R);
const carAt = (s) => [-s.car, CAR.lane];
const degrees = (a) => (a * 180) / Math.PI;
const seenText = (yes) => ({ text: yes ? 'Seen' : 'Missed', good: yes });
const carSize = (s) => imageOf(-s.car, s.R / 2).m;

function wedge(ctx, bench, stage, edge, fill, color) {
  const { left } = bench.view();
  const at = (sign) => {
    const t = (left - edge.M[0]) / edge.out[0];
    return [left, sign * (edge.M[1] + edge.out[1] * t)];
  };
  poly(ctx, [bench.toPx(0, CAR.w), bench.toPx(...at(1)), bench.toPx(...at(-1)), bench.toPx(0, -CAR.w)], { fill });
  for (const sign of [1, -1]) bench.ray([0, sign * CAR.w], at(sign), { color, arrow: false });
}

function drawRear(ctx, stage, c, bench) {
  const lane = bench.toPx(0, CAR.lane / 2)[1];
  const laneLow = bench.toPx(0, -CAR.lane / 2)[1];
  wedge(ctx, bench, stage, curved(state), c.fillC, c.c);
  wedge(ctx, bench, stage, flat(), c.fillB, c.b);
  line(ctx, 0, lane, stage.w, lane, { color: c.ink, width: 2, dash: [14, 10] });
  line(ctx, 0, laneLow, stage.w, laneLow, { color: c.ink, width: 2, dash: [14, 10] });
  const [mx, my] = bench.toPx(0, 0);
  line(ctx, mx, my - 12, mx, my + 12, { color: c.ink, width: 5 });
  dot(ctx, ...bench.toPx(-CAR.eye - 1.2, 0), 6, c.paper, c.ink, 2);
  label(ctx, 'You', bench.toPx(-CAR.eye - 1.2, 0)[0], my + 16, c, { size: 11, bounds: stage });
  const [cx, cy] = bench.toPx(...carAt(state));
  poly(ctx, [[cx - 12, cy - 7], [cx + 12, cy - 7], [cx + 12, cy + 7], [cx - 12, cy + 7]], { fill: c.a, stroke: c.ink });
  label(ctx, 'Car in the next lane', cx, cy - 18, c, { size: 11, bounds: stage });
  label(ctx, 'Seen from above', 8, 14, c, { size: 11, align: 'left', bounds: stage });
  label(ctx, 'Green: convex', stage.w - 8, 14, c, { size: 12, align: 'right', color: c.c, bounds: stage });
  label(ctx, 'Blue: flat', stage.w - 8, 32, c, { size: 12, align: 'right', color: c.b, bounds: stage });
}

function drawShave(ctx, stage, c, bench) {
  drawBench(bench, stage, c, { f: fShave });
  drawScene(bench, stage, ctx, c, { u: -state.d, h: 6, f: fShave, colors: { parallel: c.b, pole: c.d } });
  label(ctx, 'Your face', bench.toPx(-state.d, 0)[0], bench.toPx(0, 0)[1] + 32, c, { size: 11, color: c.a, bounds: stage });
}

const tool = createTool({
  state,
  label: 'Two uses of a curved mirror. A concave shaving mirror forms an enlarged upright image of a face held inside the focus. A convex rear-view mirror, seen from above, shows a wider wedge of road than a flat mirror of the same size.',
  setup: (stage, c) => createBench(stage, { x: RANGE.shave, c }),
  draw(ctx, stage, c, bench) {
    bench.setRange(RANGE[state.view]);
    if (state.view === 'shave') drawShave(ctx, stage, c, bench);
    else drawRear(ctx, stage, c, bench);
  },
  controls: () => [
    { title: 'Two mirrors, two jobs' },
    { key: 'view', label: 'Mirror', options: [['shave', 'Shaving'], ['rear', 'Rear-view']] },
    { key: 'd', label: 'Face from the mirror', min: 4, max: 36, step: 1, format: (n) => `${n} cm` },
    { key: 'car', label: 'Car behind you', min: 6, max: 38, step: 1, format: (n) => `${n} m` },
    { key: 'R', label: 'Mirror radius R', min: 0.6, max: 3, step: 0.1, format: (n) => `${fixed(n, 1)} m` },
    { readout: [
      ['Image', (s) => describe(face(s))],
      ['Magnification', (s) => (face(s).atInfinity ? 'none' : fixed(face(s).m, 2))],
      ['Image at v', (s) => (face(s).atInfinity ? 'infinity' : `${fixed(face(s).v, 1)} cm`)],
    ] },
    { readout: [
      ['View, flat', () => `${fixed(degrees(flat().angle) * 2, 1)}°`],
      ['View, convex', (s) => `${fixed(degrees(curved(s).angle) * 2, 1)}°`],
      ['Flat mirror', (s) => seenText(isSeen(carAt(s), flat()))],
      ['Convex mirror', (s) => seenText(isSeen(carAt(s), curved(s)))],
      ['Lane seen from, flat', () => `${fixed(firstSeen(CAR.lane, flat()), 1)} m`],
      ['Lane seen from, convex', (s) => `${fixed(firstSeen(CAR.lane, curved(s)), 1)} m`],
      ['Car looks, in convex', (s) => `${sig(carSize(s), 2)} × true size`],
    ] },
  ],
  tex(s) {
    if (s.view === 'shave') {
      const { atInfinity, m } = face(s);
      return atInfinity ? '\\frac1v=\\frac1f-\\frac1u=0' : `m=\\frac{f}{f-u}=\\frac{${fShave}}{${fShave}+${s.d}}=${fixed(m, 2)}`;
    }
    return `m=\\frac{f}{f-u}=\\frac{${fixed(s.R / 2, 2)}}{${fixed(s.R / 2, 2)}+${s.car}}=${sig(carSize(s), 2)}`;
  },
  onChange: () => show(),
});

const items = [...document.querySelector('#panel').firstElementChild.children];
function show() {
  const shave = state.view === 'shave';
  items[2].hidden = !shave;
  items[3].hidden = shave;
  items[4].hidden = shave;
  items[5].hidden = !shave;
  items[6].hidden = shave;
}
show();
tool.update();
