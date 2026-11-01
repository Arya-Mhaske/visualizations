import { createTool } from '../../lib/tool.js';
import { arrow, label, line } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { afterTwo, rad } from './_diffraction-math.js';

// End-on views of the beam at three places. The first polaroid's axis is vertical.
const state = { wave: 'light', theta: 40 };
const N = 8;

const tool = createTool({
  state,
  label: 'Three end-on views of a beam: before the polaroids, after the first, and after the second. Light vibrates sideways, in every direction at first. The first polaroid lets only vertical vibrations through. The second lets through only the part along its own axis, so it can cut the light to nothing.',
  draw(ctx, stage, c) {
    const R = Math.min(stage.w / 6.4, stage.h / 3);
    const cy = stage.h * 0.38;
    const xs = [stage.w * 0.17, stage.w * 0.5, stage.w * 0.83];
    const names = ['unpolarised', 'after polaroid 1', 'after polaroid 2'];
    xs.forEach((x, k) => {
      ctx.beginPath();
      ctx.arc(x, cy, R * 1.05, 0, Math.PI * 2);
      ctx.strokeStyle = c.grid;
      ctx.lineWidth = 2;
      ctx.stroke();
      label(ctx, names[k], x, cy + R * 1.05 + 18, c, { color: c.ink, size: 11, bounds: stage });
    });
    if (state.wave === 'light') {
      for (let i = 0; i < N; i++) {
        const a = (Math.PI * i) / N;
        arrow(ctx, xs[0] - Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8, xs[0] + Math.cos(a) * R * 0.8, cy - Math.sin(a) * R * 0.8, { color: c.b, width: 2, head: 6 });
      }
      arrow(ctx, xs[1], cy + R * 0.8, xs[1], cy - R * 0.8, { color: c.b, width: 4, head: 9 });
      const t = rad(state.theta);
      const L = R * 0.8 * Math.cos(t);
      // polaroid 2 axis, and what gets through
      line(ctx, xs[2] - Math.sin(t) * R, cy + Math.cos(t) * R, xs[2] + Math.sin(t) * R, cy - Math.cos(t) * R, { color: c.d, width: 2, dash: [6, 5] });
      if (L > 2) arrow(ctx, xs[2] - Math.sin(t) * L, cy + Math.cos(t) * L, xs[2] + Math.sin(t) * L, cy - Math.cos(t) * L, { color: c.a, width: 4, head: 9 });
    } else {
      // sound: the air moves along the beam, so there is no sideways direction to filter
      for (const x of xs) {
        for (let i = 0; i < 5; i++) {
          const dx = (i - 2) * R * 0.3;
          ctx.beginPath();
          ctx.arc(x + dx, cy, 4, 0, Math.PI * 2);
          ctx.fillStyle = c.a;
          ctx.fill();
        }
      }
      label(ctx, 'vibration is along the beam, so a slot cannot pick a direction', stage.w / 2, stage.h * 0.8, c, { color: c.ink, size: 12, bounds: stage });
    }
    label(ctx, state.wave === 'light' ? `brightness out: ${sig(afterTwo(1, state.theta) * 100, 3)}% of the light in` : 'brightness out: no change with angle', stage.w / 2, stage.h * 0.9, c, { color: c.ink, size: 12, bounds: stage });
  },
  controls: () => [
    { title: 'Turn the second polaroid' },
    { key: 'wave', label: 'Wave', options: [['light', 'Light'], ['sound', 'Sound']] },
    { key: 'theta', label: 'Angle between the two axes', min: 0, max: 90, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Brightness out', (s) => (s.wave === 'light' ? `${sig(afterTwo(1, s.theta) * 100, 3)} %` : '100 % at every angle')],
      ['At 90°', (s) => (s.wave === 'light' ? 'dark' : 'unchanged')],
    ] },
  ],
  tex: (s) => (s.wave === 'light' ? `I=\\dfrac{I_0}{2}\\cos^2\\theta=${sig(afterTwo(1, s.theta), 3)}\\,I_0` : 'I=\\text{the same at every angle}'),
});
tool.update();
