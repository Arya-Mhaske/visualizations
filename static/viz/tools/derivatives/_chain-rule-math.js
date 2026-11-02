// Nested functions for the chain rule. Layers are listed outside in; the innermost layer takes x.
// Each layer: tex(u) writes the layer around the inside text u, f and d are the layer and its slope as functions of its own input,
// and dtex(u) writes the slope with the inside text u left alone.
const P = (u) => (u === 'x' ? 'x' : `\\left(${u}\\right)`);

export const ONIONS = {
  sinsq: { name: 'sin(x²)', layers: [
    { name: 'sin', tex: (u) => `\\sin ${P(u)}`, f: Math.sin, d: Math.cos, dtex: (u) => `\\cos ${P(u)}` },
    { name: 'square', tex: (u) => `${P(u)}^2`, f: (u) => u * u, d: (u) => 2 * u, dtex: (u) => `2${P(u)}` },
  ] },
  power: { name: '(3x + 2)⁵', layers: [
    { name: 'fifth power', tex: (u) => `${P(u)}^5`, f: (u) => u ** 5, d: (u) => 5 * u ** 4, dtex: (u) => `5${P(u)}^4` },
    { name: '3x + 2', tex: (u) => `3${P(u)}+2`, f: (u) => 3 * u + 2, d: () => 3, dtex: () => '3' },
  ] },
  expsin: { name: 'e^(sin x)', layers: [
    { name: 'exponential', tex: (u) => `e^{${u}}`, f: Math.exp, d: Math.exp, dtex: (u) => `e^{${u}}` },
    { name: 'sin', tex: (u) => `\\sin ${P(u)}`, f: Math.sin, d: Math.cos, dtex: (u) => `\\cos ${P(u)}` },
  ] },
  lncos: { name: 'ln(cos x²)', layers: [
    { name: 'natural log', tex: (u) => `\\ln ${P(u)}`, f: Math.log, d: (u) => 1 / u, dtex: (u) => `\\dfrac{1}{${u}}` },
    { name: 'cos', tex: (u) => `\\cos ${P(u)}`, f: Math.cos, d: (u) => -Math.sin(u), dtex: (u) => `-\\sin ${P(u)}` },
    { name: 'square', tex: (u) => `${P(u)}^2`, f: (u) => u * u, d: (u) => 2 * u, dtex: (u) => `2${P(u)}` },
  ] },
};

// Text of the inside of layer i (what it is applied to), as TeX.
export function insideTex(layers, i) {
  let text = 'x';
  for (let j = layers.length - 1; j > i; j--) text = layers[j].tex(text);
  return text;
}

export const wholeTex = (layers) => layers[0].tex(insideTex(layers, 0));

// The value each layer receives, outermost first.
export function inputs(layers, x) {
  const out = new Array(layers.length);
  out[layers.length - 1] = x;
  for (let i = layers.length - 2; i >= 0; i--) out[i] = layers[i + 1].f(out[i + 1]);
  return out;
}

export const compose = (layers, x) => layers.reduceRight((value, layer) => layer.f(value), x);

// Slopes of the layers at x, and their product (the chain rule).
export function chain(layers, x) {
  const ins = inputs(layers, x);
  const slopes = layers.map((layer, i) => layer.d(ins[i]));
  return { ins, slopes, total: slopes.reduce((a, b) => a * b, 1) };
}
