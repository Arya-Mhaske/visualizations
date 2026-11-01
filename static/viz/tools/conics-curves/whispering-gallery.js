import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { dist, ellipseHit, ellipseNormal, ellipsePoint, focalC, reflect } from './_conics-math.js';
import { curve, trace } from './_conics-view.js';

const state = { a: 5.5, b: 3.5, n: 5, offset: 0 };
const R = 7;
const f = (s = state) => focalC(s.a, s.b);
const paths = (s = state) => {
  const F1 = [-f(s), 0];
  const F2 = [f(s), 0];
  return Array.from({ length: s.n }, (_, i) => {
    const ang = ((s.offset + (360 * i) / s.n + 8) * Math.PI) / 180;
    const d = [Math.cos(ang), Math.sin(ang)];
    const hit = ellipseHit(s.a, s.b, F1, d);
    const out = reflect(d, ellipseNormal(s.a, s.b, hit));
    // the reflected ray reaches F2 if F2 lies on it
    const miss = Math.abs((F2[0] - hit[0]) * out[1] - (F2[1] - hit[1]) * out[0]) / Math.hypot(...out);
    return { hit, length: dist(F1, hit) + dist(hit, F2), miss };
  });
};

createTool({
  state,
  label: 'An elliptical room with a speaker at one focus. Sound rays leave in several directions and bounce off the wall. Every reflected ray passes through the other focus, and every ray travels the same total distance, so all the sound arrives there at the same moment.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '', yLabel: '' });
    curve(plot, trace((u) => ellipsePoint(state.a, state.b, u), 0, Math.PI * 2, 200), { color: c.ink, width: 5 });
    const F2 = [f(), 0];
    paths().forEach(({ hit }) => {
      plot.segment(-f(), 0, hit[0], hit[1], { color: c.a, width: 2 });
      plot.segment(hit[0], hit[1], F2[0], F2[1], { color: c.b, width: 2 });
    });
    plot.point(-f(), 0, { fill: c.a, r: 9 });
    plot.point(F2[0], F2[1], { fill: c.c, r: 9 });
    plot.text('whisper', -f(), -0.9, { size: 11, patch: false });
    plot.text('listen', F2[0], -0.9, { size: 11, patch: false });
  },
  controls: [
    { title: 'Whisper at one focus' },
    { key: 'n', label: 'Number of rays', min: 1, max: 12, step: 1 },
    { key: 'offset', label: 'Turn the fan', min: 0, max: 90, step: 1, format: (v) => `${v}°` },
    { key: 'a', label: 'Semi-major axis, a', min: 4, max: 6.5, step: 0.5 },
    { key: 'b', label: 'Semi-minor axis, b', min: 2, max: 5.5, step: 0.5 },
    { readout: [
      ['Path lengths', (s) => paths(s).map((p) => fixed(p.length, 2)).join(', ')],
      ['2a', (s) => fixed(2 * s.a, 2)],
      ['Largest miss of the focus', (s) => ({ text: fixed(Math.max(...paths(s).map((p) => p.miss)), 6), good: true })],
    ] },
  ],
  onChange(s) { if (s.b >= s.a) s.b = s.a - 0.5; },
  tex: (s) => `d(F_1,P)+d(P,F_2)=2a=${fixed(2 * s.a, 1)}\\ \\text{for every ray}`,
});
