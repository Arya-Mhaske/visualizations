// Live KaTeX. Nothing loads unless a tool calls this, so pages without formulas stay light.
//   const formula = liveFormula(el, (state) => 's = r\\theta = ' + value);
//   formula.update(state)   renders now, or as soon as KaTeX arrives
//   renderTex(el, tex)      one-off render, used by the stepper and drill engines
// If the CDN can't be reached the formula shows as plain text, so the tool still works.
const BASE = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/';
let loading = null;

function loadKatex() {
  if (window.katex) return Promise.resolve(window.katex);
  if (loading) return loading;
  loading = new Promise((resolve) => {
    const sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = `${BASE}katex.min.css`;
    document.head.appendChild(sheet);
    const script = document.createElement('script');
    script.src = `${BASE}katex.min.js`;
    script.onload = () => resolve(window.katex);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
  return loading;
}

const GREEK = { theta: 'θ', pi: 'π', omega: 'ω', Delta: 'Δ', cdot: '·', times: '×', approx: '≈', pm: '±', cap: '∩', cup: '∪', mid: '|' };

// Readable stand-in for TeX when KaTeX isn't available.
export function plainTex(tex) {
  return tex
    .replace(/\\(?:d?frac)\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^{}]*)\}/g, '√($1)')
    .replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/\\([a-zA-Z]+)/g, (all, name) => GREEK[name] || name)
    .replace(/\\[,;! ]/g, ' ')
    .replace(/[{}]/g, '');
}

export function renderTex(el, tex, { display = false } = {}) {
  el.textContent = plainTex(tex);
  loadKatex().then((katex) => {
    if (katex) katex.render(tex, el, { throwOnError: false, displayMode: display });
  });
}

export function liveFormula(el, build) {
  let latest = null;
  let katex = null;
  const paint = () => {
    if (latest === null) return;
    if (katex) katex.render(latest, el, { throwOnError: false, displayMode: false });
    else el.textContent = plainTex(latest);
  };
  loadKatex().then((loaded) => {
    katex = loaded;
    paint();
  });
  return {
    update(state) {
      latest = build(state);
      paint();
    },
  };
}
