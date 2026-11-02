import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// Each problem has a disc/washer integral and a shell integral. Both give the same volume; one is easier.
const P = {
  p1: { name: 'y = x², 0 ≤ x ≤ 2, about the x-axis', h: (x) => x * x, b: 2, easy: 'disc', why: 'Slices at right angles to the axis: one clean integral π∫x⁴ dx.',
    disc: () => simpson((x) => Math.PI * x ** 4, 0, 2, 400), shell: () => simpson((y) => 2 * Math.PI * y * (2 - Math.sqrt(y)), 0, 4, 4000), dTex: '\\pi\\int_0^2 x^4\\,dx', sTex: '2\\pi\\int_0^4 y(2-\\sqrt y)\\,dy' },
  p2: { name: 'y = x², 0 ≤ x ≤ 2, about the y-axis', h: (x) => x * x, b: 2, easy: 'shell', why: 'Strips parallel to the axis: 2π∫x·x² dx. Discs need x = √y and a washer.',
    disc: () => simpson((y) => Math.PI * (4 - y), 0, 4, 400), shell: () => simpson((x) => 2 * Math.PI * x * x * x, 0, 2, 400), dTex: '\\pi\\int_0^4 (4-y)\\,dy', sTex: '2\\pi\\int_0^2 x\\cdot x^2\\,dx' },
  p3: { name: 'y = x(2 − x), about the y-axis', h: (x) => x * (2 - x), b: 2, easy: 'shell', why: 'Shells: 2π∫x·x(2−x) dx. Discs would need both branches x = 1 ± √(1−y).',
    disc: () => simpson((y) => Math.PI * ((1 + Math.sqrt(1 - y)) ** 2 - (1 - Math.sqrt(1 - y)) ** 2), 0, 1, 20000), shell: () => simpson((x) => 2 * Math.PI * x * x * (2 - x), 0, 2, 400), dTex: '\\pi\\int_0^1\\left[(1+\\sqrt{1-y})^2-(1-\\sqrt{1-y})^2\\right]dy', sTex: '2\\pi\\int_0^2 x^2(2-x)\\,dx' },
  p4: { name: 'y = sin x, 0 ≤ x ≤ π, about the x-axis', h: Math.sin, b: Math.PI, easy: 'disc', why: 'Discs: π∫sin²x dx. Shells would need arcsin y for both sides.',
    disc: () => simpson((x) => Math.PI * Math.sin(x) ** 2, 0, Math.PI, 400), shell: () => simpson((y) => 2 * Math.PI * y * (Math.PI - 2 * Math.asin(y)), 0, 1, 40000), dTex: '\\pi\\int_0^\\pi\\sin^2x\\,dx', sTex: '2\\pi\\int_0^1 y(\\pi-2\\arcsin y)\\,dy' },
  p5: { name: 'y = sin x, 0 ≤ x ≤ π, about the y-axis', h: Math.sin, b: Math.PI, easy: 'shell', why: 'Shells: 2π∫x sin x dx. Discs need x = arcsin y and π − arcsin y.',
    disc: () => simpson((y) => Math.PI * ((Math.PI - Math.asin(y)) ** 2 - Math.asin(y) ** 2), 0, 1, 40000), shell: () => simpson((x) => 2 * Math.PI * x * Math.sin(x), 0, Math.PI, 400), dTex: '\\pi\\int_0^1\\left[(\\pi-\\arcsin y)^2-(\\arcsin y)^2\\right]dy', sTex: '2\\pi\\int_0^\\pi x\\sin x\\,dx' },
};
const state = { which: 'p1', pick: 'disc' };
const K = () => P[state.which];

createTool({
  state,
  label: 'The flat region under a curve. A readout compares the volumes found by the disc or washer method and by the shell method, and says which one needs the simpler integral.',
  setup: (stage, c) => createPlot(stage, { x: [0, 4], y: [0, 4], c }),
  draw(ctx, stage, c, plot) {
    const k = K();
    const top = Math.max(...Array.from({ length: 50 }, (_, i) => k.h((k.b * i) / 49)));
    plot.setRange([-0.2, k.b * 1.1], [-0.1, top * 1.15]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.shade(k.h, null, 0, k.b, c.fillB);
    plot.fn(k.h, { color: c.ink, width: 3, domain: [0, k.b] });
  },
  controls: [
    { title: 'Pick a problem and a method' },
    { key: 'which', label: 'Region and axis', options: Object.entries(P).map(([k, v]) => [k, v.name]) },
    { key: 'pick', label: 'Your method', options: [['disc', 'Disc / washer'], ['shell', 'Shell']] },
    { readout: [
      ['Volume by discs/washers', () => num(K().disc(), 7)],
      ['Volume by shells', () => num(K().shell(), 7)],
      ['The easier method', () => ({ text: K().easy === 'disc' ? 'disc / washer' : 'shell', good: K().easy === state.pick })],
      ['Why', () => K().why],
    ] },
  ],
  tex: () => '\\text{disc: }\\pi\\int(R^2-r^2)\\,dx\\qquad\\text{shell: }2\\pi\\int(\\text{radius})(\\text{height})\\,dx',
});
