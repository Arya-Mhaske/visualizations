import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';

// Two real functions of two variables. Wind chill (US formula): W = 35.74 + 0.6215T − 35.75 v^0.16 + 0.4275 T v^0.16, T in °F, v in mph.
// Heat index (Rothfusz regression): a polynomial in T (°F) and relative humidity RH (%).
export const windChill = (T, v) => 35.74 + 0.6215 * T - 35.75 * v ** 0.16 + 0.4275 * T * v ** 0.16;
export const heatIndex = (T, RH) => -42.379 + 2.04901523 * T + 10.14333127 * RH - 0.22475541 * T * RH - 0.00683783 * T * T - 0.05481717 * RH * RH + 0.00122874 * T * T * RH + 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
const MODES = {
  chill: { name: 'Wind chill', a: 'Air temperature T (°F)', b: 'Wind speed v (mph)', ar: [-20, 40], br: [5, 60], f: windChill, a0: 10, b0: 20, unit: '°F' },
  heat: { name: 'Heat index', a: 'Air temperature T (°F)', b: 'Relative humidity (%)', ar: [80, 110], br: [40, 100], f: heatIndex, a0: 95, b0: 70, unit: '°F' },
};
const state = { mode: 'chill', a: 10, b: 20 };
const M = () => MODES[state.mode];
const FLAT = 3;

const tool = createTool({
  state,
  label: 'A surface showing the felt temperature as a function of air temperature and wind speed or humidity, with a probe point on it. The height of the surface above the base is the felt temperature.',
  setup: (stage, c) => createCamera(stage, { extent: 5, yaw: 0.9, pitch: 0.5, c }),
  draw(ctx, stage, c, cam) {
    const { ar, br, f } = M();
    const sx = (v) => -FLAT + (2 * FLAT * (v - ar[0])) / (ar[1] - ar[0]);
    const sy = (v) => -FLAT + (2 * FLAT * (v - br[0])) / (br[1] - br[0]);
    const vals = [];
    for (let i = 0; i <= 14; i++) for (let j = 0; j <= 14; j++) vals.push(f(ar[0] + ((ar[1] - ar[0]) * i) / 14, br[0] + ((br[1] - br[0]) * j) / 14));
    const [lo, hi] = [Math.min(...vals), Math.max(...vals)];
    const sz = (z) => ((z - lo) / (hi - lo)) * 4 - 2;
    const P = (i, j) => { const a = ar[0] + ((ar[1] - ar[0]) * i) / 14; const b = br[0] + ((br[1] - br[0]) * j) / 14; return [sx(a), sy(b), sz(f(a, b))]; };
    const faces = [];
    for (let i = 0; i < 14; i++) for (let j = 0; j < 14; j++) {
      const t = (f(ar[0] + ((ar[1] - ar[0]) * (i + 0.5)) / 14, br[0] + ((br[1] - br[0]) * (j + 0.5)) / 14) - lo) / (hi - lo);
      faces.push({ pts: [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)], fill: t < 0.25 ? c.fillB : t < 0.5 ? c.fillC : t < 0.75 ? c.fillY : c.fillA, stroke: c.grid, width: 1 });
    }
    cam.faces(faces);
    cam.axes({ size: 3.4, names: ['T', state.mode === 'chill' ? 'v' : 'RH', 'felt'] });
    const z = f(state.a, state.b);
    cam.line([sx(state.a), sy(state.b), -2], [sx(state.a), sy(state.b), sz(z)], { color: c.a, width: 2 });
    cam.point([sx(state.a), sy(state.b), sz(z)]);
  },
  controls: [
    { title: 'Read the surface' },
    { key: 'mode', label: 'Formula', options: Object.entries(MODES).map(([k, v]) => [k, v.name]) },
    { key: 'a', label: 'Air temperature T (°F)', min: -20, max: 110, step: 1, format: (v) => `${Math.max(M().ar[0], Math.min(M().ar[1], v))}` },
    { key: 'b', label: 'Wind (mph) or humidity (%)', min: 5, max: 100, step: 1, format: (v) => `${Math.max(M().br[0], Math.min(M().br[1], v))}` },
    { readout: [['Valid range', () => `T from ${M().ar[0]} to ${M().ar[1]}, second from ${M().br[0]} to ${M().br[1]}`], ['Feels like', () => `${felt().toFixed(0)} °F`]] },
  ],
  onChange: (s) => { const m = MODES[s.mode]; s.a = Math.max(m.ar[0], Math.min(m.ar[1], s.a)); s.b = Math.max(m.br[0], Math.min(m.br[1], s.b)); },
  tex: () => (state.mode === 'chill' ? `W(${state.a},${state.b})=${felt().toFixed(0)}` : `HI(${state.a},${state.b})=${felt().toFixed(0)}`),
});
function felt() { return M().f(state.a, state.b); }
tool.extra.orbit(tool.update);
