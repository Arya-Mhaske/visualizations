import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { tiltFlux } from './_vector-calculus-math.js';

const state = { tilt: 30, speed: 3, side: 2 };
const rad = (d) => (d * Math.PI) / 180;

const tool = createTool({
  state,
  label: 'A square net in a stream that flows along the x axis. The net can be turned. A dashed rectangle shows the shadow of the net as seen from upstream, and the water that goes through is the water that goes through that shadow.',
  setup: (stage, c) => createCamera(stage, { extent: 4.4, yaw: 0.9, pitch: 0.35, c }),
  draw(ctx, stage, c, cam) {
    const a = rad(state.tilt);
    const s = state.side / 2;
    const n = [Math.cos(a), Math.sin(a), 0];
    const u = [-Math.sin(a), Math.cos(a), 0];
    const net = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) => [u[0] * i * s, u[1] * i * s, j * s]);
    cam.axes({ size: 3.4 });
    // Stream: arrows along +x, with length growing with speed.
    for (const y of [-1.5, -0.5, 0.5, 1.5]) for (const z of [-1, 0, 1]) {
      cam.arrow([-3.4, y, z], [-3.4 + state.speed * 0.35, y, z], { color: c.b, width: 2 });
    }
    // Shadow of the net on the plane x = 0, seen along the stream.
    const shadow = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) => [0, u[1] * i * s, j * s]);
    cam.faces([{ pts: shadow, fill: c.fillB, stroke: c.b, width: 2 }]);
    cam.faces([{ pts: net, fill: c.fillY, stroke: c.ink, width: 3 }]);
    cam.arrow([0, 0, 0], n.map((v) => v * 1.8), { color: c.a, width: 5 });
    cam.label('n', n.map((v) => v * 2.1), { size: 13, color: c.a });
  },
  controls: [
    { title: 'Tilt the net' },
    { key: 'tilt', label: 'Tilt θ of the net', min: 0, max: 90, step: 5, format: (v) => `${v}°` },
    { key: 'speed', label: 'Stream speed (m/s)', min: 1, max: 6, step: 1 },
    { key: 'side', label: 'Net side (m)', min: 1, max: 3, step: 0.5 },
    { readout: [
      ['cos θ', (s) => fixed(Math.cos(rad(s.tilt)), 3)],
      ['Shadow area A cos θ', (s) => `${fixed(s.side * s.side * Math.cos(rad(s.tilt)), 3)} m²`],
      ['Flux through the net', (s) => `${fixed(tiltFlux(s.speed, s.side, rad(s.tilt)), 3)} m³/s`],
    ] },
  ],
  tex: (s) => `\\Phi = \\mathbf{F}\\cdot\\mathbf{n}\\,A = ${s.speed}\\times ${fixed(s.side * s.side, 2)}\\times\\cos ${s.tilt}^\\circ = ${fixed(tiltFlux(s.speed, s.side, rad(s.tilt)), 3)}`,
});
tool.extra.orbit(tool.update);
