import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { relation, closest, scale, add } from './_lines-planes-math.js';

// Line 1 is fixed. Line 2 passes through b with direction v; "lift" raises line 2 off the floor.
const a = [-3, 0, 0];
const u = [1, 0, 0];
const state = { turn: 90, lift: 1 };
const dirV = (s) => [Math.cos((s.turn * Math.PI) / 180), Math.sin((s.turn * Math.PI) / 180), 0];
const dirV3 = (s) => [Math.round(dirV(s)[0] * 1000) / 1000, Math.round(dirV(s)[1] * 1000) / 1000, 0];
const origin2 = (s) => [0, -3, s.lift];
const rel = (s) => relation(a, u, origin2(s), dirV3(s));
const WORDS = { meet: 'They meet', parallel: 'Parallel', skew: 'Skew' };

const tool = createTool({
  state,
  label: 'Two lines in space. One lies along the x axis on the floor. The other can be turned in the floor plane and lifted above it. A small red marker shows the gap where they pass.',
  setup: (stage, c) => createCamera(stage, { extent: 6, yaw: 0.8, pitch: 0.5, c }),
  draw(ctx, stage, c, cam) {
    const v = dirV3(state);
    const b = origin2(state);
    cam.axes({ size: 5 });
    cam.faces([{ pts: [[-5, -5, 0], [5, -5, 0], [5, 5, 0], [-5, 5, 0]], fill: c.fillY, stroke: c.grid }]);
    cam.line(add(a, scale(u, -4)), add(a, scale(u, 12)), { color: c.a, width: 5 });
    cam.line(add(b, scale(v, -9)), add(b, scale(v, 9)), { color: c.b, width: 5 });
    const hit = closest(a, u, b, v);
    if (hit) {
      cam.line(hit.p, hit.q, { color: c.ink, width: 3, dash: [4, 3] });
      cam.point(hit.p, { fill: c.a, r: 5 });
      cam.point(hit.q, { fill: c.b, r: 5 });
    }
    cam.label('line 1', add(a, scale(u, 6)), { size: 11, color: c.a });
  },
  controls: [
    { title: 'Turn and lift the blue line' },
    { key: 'turn', label: 'Direction of blue', min: 0, max: 180, step: 15, format: (v) => `${v}°` },
    { key: 'lift', label: 'Lift above the floor', min: 0, max: 4, step: 1 },
    { readout: [
      ['Relation', (s) => WORDS[rel(s)]],
      ['Gap at closest', (s) => { const h = closest(a, u, origin2(s), dirV3(s)); return h ? fixed(h.dist, 3) : 'same distance everywhere'; }],
    ] },
  ],
  tex: (s) => {
    const r = rel(s);
    return r === 'skew' ? '\\text{not parallel, and } \\mathbf{r}_1 \\ne \\mathbf{r}_2 \\text{ for every } s, t'
      : r === 'meet' ? '\\mathbf{a}+s\\mathbf{u} = \\mathbf{b}+t\\mathbf{v}\\ \\text{has a solution}' : '\\mathbf{u}\\parallel\\mathbf{v}';
  },
});
tool.extra.orbit(tool.update);
