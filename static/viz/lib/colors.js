// Reads the --viz-* tokens from brutal.css so canvas drawing uses the site palette.
const NAMES = {
  ink: '--viz-ink', grid: '--viz-grid', paper: '--viz-paper',
  a: '--viz-a', b: '--viz-b', c: '--viz-c', d: '--viz-d',
  fillA: '--viz-fill-a', fillB: '--viz-fill-b', fillC: '--viz-fill-c', fillY: '--viz-fill-y',
};

export function readColors() {
  const style = getComputedStyle(document.documentElement);
  const out = {};
  for (const [key, name] of Object.entries(NAMES)) out[key] = style.getPropertyValue(name).trim();
  out.line = parseFloat(style.getPropertyValue('--viz-line')) || 3;
  out.fontMono = style.getPropertyValue('--font-mono').trim();
  out.fontHead = style.getPropertyValue('--font-head').trim();
  return out;
}
