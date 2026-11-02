import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { det2, rad, solve } from './_la-math.js';
import { plane, vec } from './_la-view.js';

// Basis q1, q2. Coordinates of b are the c with c1 q1 + c2 q2 = b. If the q's are orthonormal, c_i = q_i · b with no solving.
const B = [3, 2];
const state = { theta: 20, angle: 90 };
const q = (s) => [[Math.cos(rad(s.theta)), Math.sin(rad(s.theta))], [Math.cos(rad(s.theta + s.angle)), Math.sin(rad(s.theta + s.angle))]];
const dots = (s) => q(s).map((v) => v[0] * B[0] + v[1] * B[1]);
const exact = (s) => { const [a, b] = q(s); return solve([[a[0], b[0]], [a[1], b[1]]], B); };
const ok = (s) => Math.abs(det2(q(s))) > 1e-6;

createTool({
  state,
  label: 'A basis of two unit vectors q1 and q2 and a point b. The dashed lines drop perpendiculars from b onto each basis direction, giving the dot products q1 dot b and q2 dot b. When the two unit vectors are at 90 degrees these dot products are exactly the coordinates of b. When the angle between them is changed, they no longer are.',
  setup: (stage, c) => plane(stage, c, 4.5),
  draw(ctx, stage, c, plot) {
    const [a, b] = q(state);
    const d = dots(state);
    plot.axes({ grid: false });
    for (const [v, k, color] of [[a, d[0], c.a], [b, d[1], c.b]]) {
      plot.segment(-6 * v[0], -6 * v[1], 6 * v[0], 6 * v[1], { color: c.grid, width: 2 });
      plot.segment(B[0], B[1], k * v[0], k * v[1], { color: c.grid, width: 2, dash: [5, 4] });
      plot.segment(0, 0, k * v[0], k * v[1], { color, width: 8 });
    }
    vec(ctx, plot, c, [0, 0], a, { color: c.a, width: 3, text: 'q1' });
    vec(ctx, plot, c, [0, 0], b, { color: c.b, width: 3, text: 'q2' });
    plot.point(B[0], B[1], { fill: c.fillY, r: 8 });
    plot.text('b', B[0] + 0.5, B[1] + 0.4, { size: 13, patch: false });
  },
  controls: [
    { title: 'Choose a basis' },
    { key: 'angle', label: 'Angle between q1 and q2', min: 30, max: 150, step: 5, format: (n) => `${n}°` },
    { key: 'theta', label: 'Turn the pair', min: 0, max: 175, step: 5, format: (n) => `${n}°` },
    { readout: [
      ['q₁·b and q₂·b', (s) => `${fixed(dots(s)[0], 3)}, ${fixed(dots(s)[1], 3)}`],
      ['True coordinates', (s) => (ok(s) ? `${fixed(exact(s)[0], 3)}, ${fixed(exact(s)[1], 3)}` : 'none')],
      ['Do they agree?', (s) => { const good = ok(s) && Math.abs(dots(s)[0] - exact(s)[0]) < 1e-9 && Math.abs(dots(s)[1] - exact(s)[1]) < 1e-9; return { text: good ? 'yes: orthonormal' : 'no: you must solve', good }; }],
      ['q₁·q₂', (s) => fixed(q(s)[0][0] * q(s)[1][0] + q(s)[0][1] * q(s)[1][1], 3)],
    ] },
  ],
  tex: () => 'Q^{\\mathsf T}Q=I\\ \\Rightarrow\\ Q^{-1}=Q^{\\mathsf T},\\qquad \\mathbf c=Q^{\\mathsf T}\\mathbf b=(\\mathbf q_1\\cdot\\mathbf b,\\ \\mathbf q_2\\cdot\\mathbf b)',
});
