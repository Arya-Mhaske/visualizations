import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { arc, dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { anglesOf, rad, sidesOf } from './_triangle-math.js';
import { TAU, angleArc, eqFrame } from './_kit.js';

const state = { R: 3, t: [100, 335, 215], centre: false };
let f = null;
const sinD = (d) => Math.sin(rad(d));
const pt = (i) => [state.R * Math.cos(rad(state.t[i])), state.R * Math.sin(rad(state.t[i]))];
const info = () => { const s = sidesOf(pt(0), pt(1), pt(2)); return { ...s, ...anglesOf(s) }; };

const tool = createTool({
  state,
  label: 'A circle with a triangle drawn inside it, its three corners on the circle. Drag the corners round the circle. Each side divided by the sine of the angle opposite to it always equals the circle diameter, 2R. A switch draws the radii to the ends of one side, showing the angle at the centre is double the angle at the corner.',
  draw(ctx, stage, c) {
    f = eqFrame(stage, [-4.4, 4.4], [-4.4, 4.4], 10);
    const O = f.px([0, 0]);
    const [A, B, C] = [0, 1, 2].map((i) => f.px(pt(i)));
    arc(ctx, ...O, state.R * f.k, 0, TAU, { color: c.ink, width: 3 });
    poly(ctx, [A, B, C], { fill: c.fillC, stroke: c.ink, width: 3 });
    if (state.centre) {
      line(ctx, ...O, ...B, { color: c.d, width: 3, dash: [6, 4] });
      line(ctx, ...O, ...C, { color: c.d, width: 3, dash: [6, 4] });
      angleArc(ctx, O, B, C, 22, { color: c.d, width: 4 });
      label(ctx, info().A <= 90 ? `2A = ${fixed(2 * info().A, 1)}°` : `360° − 2A = ${fixed(360 - 2 * info().A, 1)}°`, O[0], O[1] + 38, c, { size: 11, color: c.d, bounds: stage, patch: false });
    }
    line(ctx, ...B, ...C, { color: c.a, width: 6 });
    angleArc(ctx, A, B, C, 26, { color: c.a, width: 4 });
    dot(ctx, ...O, 4, c.ink, c.ink);
    [[A, 'A'], [B, 'B'], [C, 'C']].forEach(([p, text], i) => {
      dot(ctx, ...p, 9, i ? c.b : c.a, c.ink);
      label(ctx, text, p[0] + (p[0] - O[0]) * 0.14, p[1] + (p[1] - O[1]) * 0.14, c, { size: 13, bounds: stage, patch: false });
    });
  },
  controls: [
    { title: 'Drag the corners round the circle' },
    { key: 'R', label: 'Radius, R', min: 1.5, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { toggle: true, key: 'centre', label: 'Show the centre and the central angle' },
    { readout: [
      ['a ÷ sin A', () => fixed(info().a / sinD(info().A), 3)],
      ['b ÷ sin B', () => fixed(info().b / sinD(info().B), 3)],
      ['c ÷ sin C', () => fixed(info().c / sinD(info().C), 3)],
      ['Diameter, 2R', () => fixed(2 * state.R, 3)],
    ] },
  ],
  tex: () => `\\dfrac{a}{\\sin A}=\\dfrac{b}{\\sin B}=\\dfrac{c}{\\sin C}=2R=${fixed(2 * state.R, 1)}`,
});

handles(tool.stage, [0, 1, 2].map((i) => ({
  at: () => f.px(pt(i)),
  move(px, py) { const [x, y] = f.inv(px, py); state.t[i] = Math.round((Math.atan2(y, x) * 180) / Math.PI + 360) % 360; },
  nudge(direction) { state.t[i] = (state.t[i] + direction * 5 + 360) % 360; },
})), { onChange: () => tool.update(), radius: 30 });
