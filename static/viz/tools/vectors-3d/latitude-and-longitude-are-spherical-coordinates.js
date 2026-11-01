import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { CITIES, EARTH_RADIUS_KM, phiFromLatitude, thetaFromLongitude, fromSpherical, rad } from './_cylindrical-spherical-math.js';
import { sphereWire, arcPhi, arcXY } from './_cylindrical-spherical-view.js';

const state = { city: 'pune', lat: CITIES.pune.lat, lon: CITIES.pune.lon };
const R = 3.6;
const phi = (s) => phiFromLatitude(s.lat);
const theta = (s) => thetaFromLongitude(s.lon);
const km = (s) => fromSpherical(EARTH_RADIUS_KM, rad(theta(s)), rad(phi(s)));
let applied = state.city;

const tool = createTool({
  state,
  label: 'A globe with a grid of meridians and parallels, and a marker at a place. Its angle down from the north pole is φ and its angle east of the Greenwich plane is θ.',
  setup: (stage, c) => createCamera(stage, { extent: 5.2, yaw: 0.4, pitch: 0.3, c }),
  draw(ctx, stage, c, cam) {
    cam.axes({ size: 4.6 });
    sphereWire(cam, R, { color: c.grid, width: 1 });
    const t = rad(theta(state));
    const f = rad(phi(state));
    const p = fromSpherical(R, t, f);
    arcXY(cam, R, t, 0, { color: c.b, width: 4 });
    arcPhi(cam, R, t, f, { color: c.a, width: 4 });
    cam.line([0, 0, 0], p, { color: c.ink, width: 3 });
    cam.point(p, { fill: c.a, r: 8 });
    cam.label(CITIES[state.city]?.name ?? 'Here', fromSpherical(R * 1.15, t, f), { size: 12 });
    cam.label('Greenwich', fromSpherical(R * 1.12, 0, Math.PI / 2), { size: 10 });
  },
  controls: [
    { title: 'Pick a place' },
    { key: 'city', label: 'Place', options: [...Object.entries(CITIES).map(([key, v]) => [key, v.name]), ['custom', 'My own']] },
    { key: 'lat', label: 'Latitude (° N)', min: -90, max: 90, step: 0.5 },
    { key: 'lon', label: 'Longitude (° E)', min: -180, max: 180, step: 0.5 },
    { readout: [
      ['φ = 90° − lat', (s) => `${fixed(phi(s), 2)}°`],
      ['θ = east longitude', (s) => `${fixed(theta(s), 2)}°`],
      ['ρ', () => `${EARTH_RADIUS_KM} km`],
      ['(x, y, z) in km', (s) => `(${km(s).map((v) => fixed(v, 0)).join(', ')})`],
    ] },
  ],
  tex: (s) => `(\\rho,\\theta,\\phi) = (${EARTH_RADIUS_KM},\\ ${fixed(theta(s), 2)}^\\circ,\\ ${fixed(phi(s), 2)}^\\circ)`,
  onChange: (s) => {
    if (s.city !== applied) {
      applied = s.city;
      if (CITIES[s.city]) {
        s.lat = CITIES[s.city].lat;
        s.lon = CITIES[s.city].lon;
        queueMicrotask(() => tool.update());
      }
    } else if (CITIES[s.city] && (s.lat !== CITIES[s.city].lat || s.lon !== CITIES[s.city].lon)) {
      s.city = 'custom';
      applied = 'custom';
      queueMicrotask(() => tool.update());
    }
  },
});
tool.extra.orbit(tool.update);
