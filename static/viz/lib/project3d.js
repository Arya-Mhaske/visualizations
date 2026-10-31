// 3D scenes on a canvas stage, with no library. z is up and the axes are right-handed, as in NCERT.
//   const cam = createCamera(stage, { extent: 6, yaw: 0.6, pitch: 0.45, mode: 'orthographic', c });
//   cam.project([x, y, z]) -> [px, py, depth]; a larger depth is nearer the viewer.
//   Inside draw: cam.axes({ size }); cam.line(a, b, opts); cam.arrow(a, b, opts); cam.point(p, opts);
//   cam.label(text, p, opts); cam.faces([{ pts, fill, stroke }, ...]) paints back to front.
//   cam.rotate(dx, dy) orbits; pass it as the `pan` option of handles(), or call cam.orbit(onChange)
//   when the scene has no draggable points.
// Faces are sorted by mean depth, so faces that cut each other must be split first (see splitQuad).
import { enableDrag } from './stage.js';
import { arrow as arrow2, dot, label as label2, line as line2, poly } from './draw.js';

const PITCH_LIMIT = 1.45;

export function rotation(yaw, pitch) {
  const [cy, sy, cp, sp] = [Math.cos(yaw), Math.sin(yaw), Math.cos(pitch), Math.sin(pitch)];
  // Returns view coordinates: u to the right, v up, d towards the viewer.
  return ([x, y, z]) => {
    const u = y * cy - x * sy;
    const d0 = x * cy + y * sy;
    return [u, z * cp - d0 * sp, d0 * cp + z * sp];
  };
}

// Cuts a quad into n × n smaller quads, so depth sorting holds where large faces intersect.
export function splitQuad([a, b, c, d], n) {
  const at = (s, t) => a.map((_, i) => {
    const top = a[i] + (b[i] - a[i]) * s;
    const low = d[i] + (c[i] - d[i]) * s;
    return top + (low - top) * t;
  });
  const out = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out.push([at(i / n, j / n), at((i + 1) / n, j / n), at((i + 1) / n, (j + 1) / n), at(i / n, (j + 1) / n)]);
    }
  }
  return out;
}

export function createCamera(stage, { extent = 6, yaw = 0.7, pitch = 0.45, mode = 'orthographic', c }) {
  const ctx = stage.ctx;
  const view = { yaw, pitch };
  const project = (p) => {
    const [u, v, d] = rotation(view.yaw, view.pitch)(p);
    const near = mode === 'perspective' ? extent * 4 / (extent * 4 - d) : 1;
    const scale = (stage.size / (2 * extent)) * near;
    return [stage.w / 2 + u * scale, stage.h / 2 - v * scale, d];
  };
  const flat = (p) => project(p).slice(0, 2);
  const cam = {
    view,
    project,
    rotate(dx, dy) {
      view.yaw -= dx * 0.01;
      view.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, view.pitch + dy * 0.01));
    },
    orbit(onChange) {
      let last = null;
      enableDrag(stage.canvas, {
        start(x, y) { last = [x, y]; return true; },
        move(x, y) {
          cam.rotate(x - last[0], y - last[1]);
          last = [x, y];
          onChange();
        },
        key(name) {
          const turn = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[name];
          if (!turn) return false;
          cam.rotate(...turn);
          onChange();
          return true;
        },
      });
    },
    line(a, b, options = {}) { line2(ctx, ...flat(a), ...flat(b), { color: c.ink, ...options }); },
    arrow(a, b, options = {}) { arrow2(ctx, ...flat(a), ...flat(b), { color: c.ink, ...options }); },
    point(p, { fill = c.a, r = 7 } = {}) { dot(ctx, ...flat(p), r, fill, c.ink); },
    label(text, p, options = {}) { label2(ctx, text, ...flat(p), c, { bounds: stage, ...options }); },
    faces(list) {
      const sorted = list
        .map((face) => ({ face, depth: face.pts.reduce((sum, p) => sum + project(p)[2], 0) / face.pts.length }))
        .sort((a, b) => a.depth - b.depth);
      for (const { face } of sorted) poly(ctx, face.pts.map(flat), { fill: face.fill, stroke: face.stroke, width: face.width ?? 2 });
    },
    axes({ size = extent * 0.85, names = ['x', 'y', 'z'] } = {}) {
      const ends = [[size, 0, 0], [0, size, 0], [0, 0, size]];
      ends.forEach((end, i) => {
        cam.line(end.map((v) => -v), [0, 0, 0], { color: c.grid, width: 2 });
        cam.arrow([0, 0, 0], end, { width: 2 });
        cam.label(names[i], end.map((v) => v * 1.1));
      });
    },
  };
  return cam;
}
