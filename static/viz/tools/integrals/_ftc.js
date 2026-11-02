// Functions for the fundamental-theorem tools: f, with the area function A(x) = ∫₀ˣ f computed by Simpson.
import { simpson } from './_ig.js';

export const BANK = {
  wave: { name: '2 + sin t', f: (t) => 2 + Math.sin(t), y: [0, 3.4], A: [0, 14], tex: '2+\\sin t' },
  rise: { name: 't²/2', f: (t) => (t * t) / 2, y: [0, 20], A: [0, 45], tex: 't^2/2' },
  hump: { name: 'bell curve', f: (t) => 3 * Math.exp(-((t - 3) ** 2) / 2), y: [0, 3.4], A: [0, 8], tex: '3e^{-(t-3)^2/2}' },
  signed: { name: 'rises, flattens, falls', f: (t) => Math.sin(t) * 1.6, y: [-2, 2], A: [-1, 4], tex: '1.6\\sin t' },
};
export const area = (f, x0, x1) => simpson(f, x0, x1, 400);
