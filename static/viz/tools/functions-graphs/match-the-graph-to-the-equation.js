import { createDrill } from '../../lib/drill.js';

const PARENTS = [
  { tex: 'x^2', name: 'x²', f: (x) => x * x, view: [[-6, 6], [-4, 10]] },
  { tex: '|x|', name: '|x|', f: Math.abs, view: [[-6, 6], [-4, 8]] },
  { tex: '\\sqrt x', name: '√x', f: (x) => (x < 0 ? NaN : Math.sqrt(x)), view: [[-3, 9], [-3, 7]] },
];
const word = (n) => (n === 0 ? '' : n > 0 ? `+ ${n}` : `− ${-n}`);
const eqn = (p, a, h, k) => `${a === 1 ? '' : a === -1 ? '−' : a}${p.name.replace('x', h === 0 ? 'x' : `(x ${h > 0 ? '−' : '+'} ${Math.abs(h)})`)} ${word(k)}`.trim();

createDrill({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  seed: 11,
  generate(rng) {
    const p = rng.pick(PARENTS);
    const a = rng.pick([1, 1, -1, 2]);
    const h = rng.int(-2, 2);
    const k = rng.int(-2, 2);
    const right = eqn(p, a, h, k);
    const wrong = new Set();
    while (wrong.size < 3) {
      const w = eqn(p, rng.pick([1, -1, 2]), rng.int(-2, 2), rng.int(-2, 2));
      if (w !== right) wrong.add(w);
    }
    const options = rng.shuffle([right, ...wrong]);
    return {
      prompt: 'Which equation matches the coral graph? The grey graph is the parent.',
      options,
      answer: options.indexOf(right),
      alt: `A graph of ${right}`,
      figure(ctx, stage, c) {
        const [[x0, x1], [y0, y1]] = p.view;
        const px = (x) => ((x - x0) / (x1 - x0)) * stage.w;
        const py = (y) => stage.h - ((y - y0) / (y1 - y0)) * stage.h;
        ctx.lineWidth = 1;
        ctx.strokeStyle = c.grid;
        for (let x = Math.ceil(x0); x <= x1; x++) { ctx.beginPath(); ctx.moveTo(px(x), 0); ctx.lineTo(px(x), stage.h); ctx.stroke(); }
        for (let y = Math.ceil(y0); y <= y1; y++) { ctx.beginPath(); ctx.moveTo(0, py(y)); ctx.lineTo(stage.w, py(y)); ctx.stroke(); }
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(px(0), 0); ctx.lineTo(px(0), stage.h); ctx.moveTo(0, py(0)); ctx.lineTo(stage.w, py(0)); ctx.stroke();
        const draw = (g, colour, w) => {
          ctx.strokeStyle = colour;
          ctx.lineWidth = w;
          ctx.beginPath();
          let pen = false;
          for (let i = 0; i <= 300; i++) {
            const x = x0 + ((x1 - x0) * i) / 300;
            const y = g(x);
            if (!Number.isFinite(y)) { pen = false; continue; }
            if (pen) ctx.lineTo(px(x), py(y)); else { ctx.moveTo(px(x), py(y)); pen = true; }
          }
          ctx.stroke();
        };
        draw(p.f, c.grid, 3);
        draw((x) => a * p.f(x - h) + k, c.a, 4);
      },
      hint: 'Check where the corner or vertex has moved, then whether the graph is flipped or stretched.',
      explain: `The answer is y = ${right}: shifted ${h > 0 ? 'right' : h < 0 ? 'left' : 'not sideways'}, ${k > 0 ? 'up' : k < 0 ? 'down' : 'not up or down'}${a < 0 ? ', and flipped over the x-axis' : a === 2 ? ', and stretched by 2' : ''}.`,
    };
  },
});
