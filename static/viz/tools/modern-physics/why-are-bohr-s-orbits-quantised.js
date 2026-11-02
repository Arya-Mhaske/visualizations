import { createTool } from '../../lib/tool.js';
import { dot, label, poly } from '../../lib/draw.js';
import { sig, fixed } from '../../lib/format.js';

// A de Broglie wave round a circular orbit closes on itself only when the circumference is N whole wavelengths:
// 2πr = Nλ = N h/(mv), so mvr = N h/2π. Radius r_n = 0.529 n² Å, v_n = 2.19e6 / n m/s.
const state = { N: 2.6 };
const whole = (N) => Math.abs(N - Math.round(N)) < 0.005;

const tool = createTool({
  state,
  label: 'A ring with a wave drawn round it, N wavelengths in one trip. When N is a whole number the wave meets itself smoothly at the start. When it is not, the end of the wave misses its start and a coral dot marks the clash.',
  draw(ctx, stage, c) {
    const R = Math.min(stage.w, stage.h) / 2 - 36;
    const cx = stage.w / 2;
    const cy = stage.h / 2;
    const A = Math.min(14, R * 0.12);
    const pts = [];
    for (let i = 0; i <= 720; i++) {
      const th = (i / 720) * 2 * Math.PI;
      const r = R + A * Math.sin(state.N * th);
      pts.push([cx + r * Math.cos(th), cy - r * Math.sin(th)]);
    }
    poly(ctx, pts, { stroke: whole(state.N) ? c.c : c.b, width: 3, closed: false });
    dot(ctx, cx, cy, 7, c.fillY, c.ink);
    const first = pts[0];
    const last = pts[pts.length - 1];
    if (!whole(state.N)) {
      dot(ctx, first[0], first[1], 6, c.a, c.ink);
      dot(ctx, last[0], last[1], 6, c.paper, c.a, 3);
      label(ctx, 'clash at the join', cx + R + 4, cy - 18, c, { size: 10, align: 'right', bounds: stage });
    } else {
      label(ctx, 'smooth join', cx, cy + R + 22, c, { size: 11, bounds: stage });
    }
  },
  controls: () => [
    { title: 'Wrap a wave round an orbit' },
    { key: 'N', label: 'Circumference ÷ λ', min: 1, max: 6, step: 0.05, format: (v) => fixed(v, 2) },
    { row: [{ button: 'Nearest whole number', onClick: () => { state.N = Math.round(state.N); tool.update(); } }] },
    { readout: [
      ['Fits?', (s) => ({ text: whole(s.N) ? 'yes, a stable orbit' : 'no, it cancels itself', good: whole(s.N) })],
      ['Angular momentum mvr', (s) => `${fixed(s.N, 2)} × h/2π`],
      ['Radius if allowed', (s) => (whole(s.N) ? `${sig(0.529 * Math.round(s.N) ** 2, 3)} Å` : '—')],
      ['Speed if allowed', (s) => (whole(s.N) ? `${sig(2.19 / Math.round(s.N), 3)} ×10⁶ m/s` : '—')],
    ] },
  ],
  tex: (s) => `2\\pi r=n\\lambda=\\dfrac{nh}{mv}\\ \\Rightarrow\\ mvr=\\dfrac{nh}{2\\pi}\\quad(n=${fixed(s.N, 2)})`,
});

tool.update();
