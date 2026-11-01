import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { elevation, heightFromAngle, rad } from './_right-triangle-math.js';

const EYE = 1.6;
const state = { mode: 'elevation', H: 30, d: 40 };
const rise = (s = state) => s.H - EYE;
const angle = (s = state) => elevation(rise(s), s.d);

createTool({
  state,
  label: 'A building seen from the side. In the first view, an observer on the ground looks up at the top of the building along a line of sight, and the angle above the horizontal is the angle of elevation. In the second view, someone on the roof looks down at the observer, and the angle below the horizontal is the angle of depression. The two angles are equal.',
  draw(ctx, stage, c) {
    const ground = stage.h * 0.86;
    const k = Math.min((stage.w * 0.78) / 70, (stage.h * 0.74) / 60);
    const bx = stage.w * 0.9 - 8 * k;
    const ox = bx - state.d * k;
    const top = ground - state.H * k;
    const eyeY = ground - EYE * k;
    line(ctx, 0, ground, stage.w, ground, { color: c.ink, width: 4 });
    poly(ctx, [[bx, ground], [bx + 8 * k, ground], [bx + 8 * k, top], [bx, top]], { fill: c.fillB, stroke: c.ink, width: 3 });
    line(ctx, ox, eyeY, bx, eyeY, { color: c.grid, width: 1, dash: [5, 4] });
    const th = rad(angle());
    if (state.mode === 'elevation') {
      line(ctx, ox, eyeY, bx, top, { color: c.a, width: 3 });
      arc(ctx, ox, eyeY, 40, -th, 0, { color: c.a, width: 4 });
      label(ctx, `${fixed(angle(), 1)}° elevation`, ox + 46, eyeY - 14, c, { size: 11, align: 'left', color: c.a, bounds: stage, patch: false });
      dot(ctx, ox, eyeY, 6, c.fillY, c.ink);
    } else {
      line(ctx, bx, top, ox, eyeY, { color: c.a, width: 3 });
      line(ctx, bx, top, ox, top, { color: c.grid, width: 1, dash: [5, 4] });
      arc(ctx, bx, top, 40, Math.PI - th, Math.PI, { color: c.a, width: 4 });
      label(ctx, `${fixed(angle(), 1)}° depression`, bx - 46, top + 22, c, { size: 11, align: 'right', color: c.a, bounds: stage, patch: false });
      dot(ctx, bx, top, 6, c.fillY, c.ink);
      dot(ctx, ox, eyeY, 5, c.paper, c.ink);
    }
    line(ctx, bx + 4 * k, ground + 8, bx + 4 * k, top, { color: c.c, width: 2, dash: [3, 3] });
    label(ctx, `${fixed(state.d, 0)} m`, (ox + bx) / 2, ground + 14, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `${fixed(state.H, 0)} m`, bx + 4 * k, top - 10, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Look at the building' },
    { key: 'mode', label: 'From where?', options: [['elevation', 'Ground, looking up'], ['depression', 'Roof, looking down']] },
    { key: 'd', label: 'Distance from the building', min: 5, max: 60, step: 1, format: (n) => `${n} m` },
    { key: 'H', label: 'Building height', min: 8, max: 50, step: 1, format: (n) => `${n} m` },
    { readout: [
      ['Angle', (s) => `${fixed(angle(s), 2)}°`],
      ['Rise = d tan θ', (s) => `${fixed(s.d * Math.tan(rad(angle(s))), 2)} m`],
      ['Height = rise + 1.6', (s) => `${fixed(heightFromAngle(s.d, angle(s), EYE), 2)} m`],
    ] },
  ],
  tex: (s) => `H=d\\tan\\theta+1.6=${s.d}\\tan ${fixed(angle(s), 1)}^\\circ+1.6=${fixed(heightFromAngle(s.d, angle(s), EYE), 1)}\\text{ m}`,
});
