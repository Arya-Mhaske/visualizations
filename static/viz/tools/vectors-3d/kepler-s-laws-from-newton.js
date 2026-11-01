import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { eccentricAnomaly, orbitPoint, sweptArea, speedAt } from './_space-curves-math.js';

// Orbit with semi-major axis 1, the Sun at the focus (the origin). Times are fractions of a period.
const state = { e: 0.6, t0: 0.05, dt: 0.1 };
const TAU = Math.PI * 2;
const flat = ([x, y]) => [x * 3.4, y * 3.4, 0];
const anomalies = (t, dt, e) => [eccentricAnomaly(TAU * t, e), eccentricAnomaly(TAU * (t + dt), e)];

function wedge(e, t, dt) {
  const [E1, E2] = anomalies(t, dt, e);
  const pts = [[0, 0, 0]];
  for (let i = 0; i <= 24; i++) pts.push(flat(orbitPoint(E1 + ((E2 - E1) * i) / 24, e)));
  return pts;
}

const tool = createTool({
  state,
  label: 'An elliptical orbit with the Sun at one focus. Two shaded wedges are swept in the same time at different places on the orbit. They have equal area.',
  setup: (stage, c) => createCamera(stage, { extent: 6, yaw: 0.0, pitch: 1.2, c }),
  draw(ctx, stage, c, cam) {
    const { e, t0, dt } = state;
    cam.axes({ size: 4.2 });
    let last = flat(orbitPoint(0, e));
    for (let i = 1; i <= 96; i++) {
      const p = flat(orbitPoint((i / 96) * TAU, e));
      cam.line(last, p, { color: c.grid, width: 3 });
      last = p;
    }
    cam.faces([
      { pts: wedge(e, t0, dt), fill: c.fillA, stroke: c.a, width: 2 },
      { pts: wedge(e, t0 + 0.5, dt), fill: c.fillB, stroke: c.b, width: 2 },
    ]);
    cam.point([0, 0, 0], { fill: c.d, r: 9 });
    cam.label('Sun', [0.3, -0.6, 0], { size: 11 });
    cam.point(flat(orbitPoint(eccentricAnomaly(TAU * t0, e), e)), { fill: c.a, r: 7 });
    cam.point(flat(orbitPoint(eccentricAnomaly(TAU * (t0 + 0.5), e), e)), { fill: c.b, r: 7 });
  },
  controls: [
    { title: 'Shape and timing' },
    { key: 'e', label: 'Eccentricity e', min: 0, max: 0.9, step: 0.1 },
    { key: 't0', label: 'Start of the first wedge', min: 0, max: 1, step: 0.01, format: (v) => `${fixed(v, 2)} of a period` },
    { key: 'dt', label: 'Time swept', min: 0.02, max: 0.25, step: 0.01, format: (v) => `${fixed(v, 2)} of a period` },
    { readout: [
      ['Area, coral wedge', (s) => fixed(sweptArea(...anomalies(s.t0, s.dt, s.e), s.e), 4)],
      ['Area, blue wedge', (s) => fixed(sweptArea(...anomalies(s.t0 + 0.5, s.dt, s.e), s.e), 4)],
      ['Speed, coral', (s) => fixed(speedAt(anomalies(s.t0, 0, s.e)[0], s.e), 3)],
      ['Speed, blue', (s) => fixed(speedAt(anomalies(s.t0 + 0.5, 0, s.e)[0], s.e), 3)],
    ] },
  ],
  tex: (s) => `\\dfrac{dA}{dt} = \\dfrac{L}{2m} = \\text{constant}:\\ A = ${fixed(sweptArea(...anomalies(s.t0, s.dt, s.e), s.e), 4)}`,
});
tool.extra.orbit(tool.update);
