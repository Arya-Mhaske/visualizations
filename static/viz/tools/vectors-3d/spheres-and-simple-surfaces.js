import { createTool } from '../../lib/tool.js';
import { createCamera, splitQuad } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { expandSphere } from './_3d-coordinates-math.js';

const state = { shape: 'sphere', a: 1, b: 2, c: 1, r: 3 };
const BANDS = 18;
const signed = (v, letter) => (v === 0 ? '' : `${v < 0 ? '-' : '+'} ${Math.abs(v)}${letter}`);
const inner = (name, v) => (v === 0 ? `${name}^2` : `(${name} ${v < 0 ? '+' : '-'} ${Math.abs(v)})^2`);

function sphereFaces(s, c) {
  const at = (u, v) => [
    s.a + s.r * Math.cos(v) * Math.cos(u),
    s.b + s.r * Math.cos(v) * Math.sin(u),
    s.c + s.r * Math.sin(v),
  ];
  const faces = [];
  for (let i = 0; i < BANDS * 2; i++) {
    for (let j = 0; j < BANDS; j++) {
      const [u0, u1] = [(i * Math.PI) / BANDS, ((i + 1) * Math.PI) / BANDS];
      const [v0, v1] = [-Math.PI / 2 + (j * Math.PI) / BANDS, -Math.PI / 2 + ((j + 1) * Math.PI) / BANDS];
      faces.push({ pts: [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)], fill: c.fillB, stroke: c.grid, width: 1 });
    }
  }
  return faces;
}

function planeFaces(s, c) {
  const R = 5;
  return splitQuad([[-R, -R, s.c], [R, -R, s.c], [R, R, s.c], [-R, R, s.c]], 3)
    .map((pts) => ({ pts, fill: c.fillY, stroke: c.grid, width: 1 }));
}

function cylinderFaces(s, c) {
  const faces = [];
  for (let i = 0; i < 36; i++) {
    const [u0, u1] = [(i * Math.PI) / 18, ((i + 1) * Math.PI) / 18];
    const rim = (u, z) => [s.r * Math.cos(u), s.r * Math.sin(u), z];
    faces.push({ pts: [rim(u0, -4), rim(u1, -4), rim(u1, 4), rim(u0, 4)], fill: c.fillC, stroke: c.grid, width: 1 });
  }
  return faces;
}

const SHAPES = { sphere: sphereFaces, plane: planeFaces, cylinder: cylinderFaces };

function worked(s) {
  if (s.shape === 'plane') return `z = ${s.c}\\ \\text{is a flat plane: } x, y \\text{ are free}`;
  if (s.shape === 'cylinder') return `x^2 + y^2 = ${s.r ** 2}\\ \\text{in space: } z \\text{ is free, so a circle sweeps a cylinder}`;
  const { D, E, F, G } = expandSphere(s.a, s.b, s.c, s.r);
  return `x^2 + y^2 + z^2 ${signed(D, 'x')} ${signed(E, 'y')} ${signed(F, 'z')} ${signed(G, '')} = 0 \\;\\Rightarrow\\; ${inner('x', s.a)} + ${inner('y', s.b)} + ${inner('z', s.c)} = ${s.r ** 2}`;
}

const tool = createTool({
  state,
  label: 'A surface in 3D: a sphere, a plane or a cylinder, set by the sliders.',
  setup: (stage, c) => createCamera(stage, { extent: 8, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    cam.axes({ size: 6 });
    cam.faces(SHAPES[state.shape](state, c));
    if (state.shape === 'sphere') {
      cam.point([state.a, state.b, state.c], { r: 5 });
      cam.line([state.a, state.b, state.c], [state.a + state.r, state.b, state.c], { color: c.a, width: 3 });
    }
  },
  controls: [
    { title: 'Read the equation' },
    { key: 'shape', label: 'Surface', options: [['sphere', 'Sphere'], ['plane', 'Plane z = k'], ['cylinder', 'Cylinder']] },
    { key: 'a', label: 'Centre a', min: -3, max: 3, step: 1 },
    { key: 'b', label: 'Centre b', min: -3, max: 3, step: 1 },
    { key: 'c', label: 'Centre c (or k)', min: -3, max: 3, step: 1 },
    { key: 'r', label: 'Radius, r', min: 1, max: 4, step: 1 },
    { readout: [
      ['Centre', (s) => (s.shape === 'sphere' ? `(${s.a}, ${s.b}, ${s.c})` : s.shape === 'plane' ? 'none' : 'the z-axis')],
      ['Radius', (s) => (s.shape === 'plane' ? 'none' : String(s.r))],
      ['Free variable', (s) => ({ sphere: 'none', plane: 'x and y', cylinder: 'z' }[s.shape])],
      ['Area of sphere, 4πr²', (s) => (s.shape === 'sphere' ? fixed(4 * Math.PI * s.r ** 2, 2) : '—')],
    ] },
  ],
  tex: worked,
});
tool.extra.orbit(tool.update);
