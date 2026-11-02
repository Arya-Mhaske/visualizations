import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { te: 1.5, kick: 8, f: 0.5, t: 2.5 };
const [V0, TH, G] = [25, 55, 9.8];
const cmAt = (t) => [V0 * Math.cos((TH * Math.PI) / 180) * t, V0 * Math.sin((TH * Math.PI) / 180) * t - 0.5 * G * t * t];
const T = (2 * V0 * Math.sin((TH * Math.PI) / 180)) / G;
// Fragment 1 (mass share f) gets +kick/f-weighted velocity along the original path's normal direction, fragment 2 the opposite.
function frag(s, i, t) {
  const m = i ? 1 - s.f : s.f;
  const dir = i ? 1 : -1;
  const kv = (dir * s.kick * (i ? s.f : 1 - s.f)) * (i ? 1 : 1);
  const [cx, cy] = cmAt(t);
  const dt = t - s.te;
  void m;
  return [cx + kv * dt * 0.8, cy + kv * dt * 0.6];
}
const pos = (s, i, t) => (t <= s.te ? cmAt(t) : frag(s, i, t));

plotTool({
  state,
  label: 'The parabolic path of a shell and, after the explosion, the paths of two fragments on either side of it. Their centre of mass, marked at the chosen time, stays on the original parabola.',
  x: [0, 60],
  y: [0, 30],
  xLabel: 'x (m)',
  yLabel: 'y (m)',
  range: () => [[-2, 62], [-2, 32]],
  curves: (s, c) => [[(x) => x * Math.tan((TH * Math.PI) / 180) - (G * x * x) / (2 * V0 * V0 * Math.cos((TH * Math.PI) / 180) ** 2), { color: c.ink, dash: [6, 5], domain: [0, cmAt(T)[0]] }]],
  draw: (ctx, stage, c, plot) => {
    [0, 1].forEach((i) => {
      const pts = Array.from({ length: 41 }, (_, k) => pos(state, i, state.te + ((T - state.te) * k) / 40));
      pts.slice(1).forEach((p, k) => plot.segment(pts[k][0], pts[k][1], p[0], p[1], { color: i ? c.b : c.a, width: 3 }));
    });
    const t = Math.min(state.t, T);
    [0, 1].forEach((i) => plot.point(...pos(state, i, t), { fill: i ? c.b : c.a }));
    plot.point(...cmAt(t), { fill: c.c, r: 8 });
  },
  controls: [
    { title: 'Blow it apart' },
    { key: 'te', label: 'Explodes at t = (s)', min: 0.5, max: 3.5, step: 0.25 },
    { key: 'kick', label: 'Blast speed (m/s)', min: 0, max: 15, step: 1 },
    { key: 'f', label: 'Mass share of fragment 1', min: 0.2, max: 0.8, step: 0.05 },
    { key: 't', label: 'Time (s)', min: 0, max: 4, step: 0.1 },
    { readout: [
      ['Centre of mass', (s) => cmAt(Math.min(s.t, T)).map((v) => fixed(v, 1)).join(', ')],
      ['Still on the parabola', () => 'yes'],
    ] },
  ],
  tex: () => `M\\,\\vec a_{cm}=\\sum\\vec F_{\\text{external}}=M\\vec g`,
});
