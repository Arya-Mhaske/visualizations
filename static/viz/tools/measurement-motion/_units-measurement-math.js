// Pure maths for the Units & Measurement box. No DOM, so Node can test it.
// Decimals are kept exact as { n, e }: the value is n × 10^e with n a whole number, so 2.745 is { n: 2745, e: -3 }.
// Rounding on these never goes through floating point, which is why 2.735 and 2.745 behave.

export const C = 299792458; // m/s, exact since 1983 and the basis of the metre
export const PLANCK = '6.62607015 ×10⁻³⁴ J s'; // exact since 2019
export const CAESIUM_HZ = 9192631770; // exact; one second is this many periods

// ---------- Why agreed units: hands, arms and feet of three people (centimetres) ----------
export const PEOPLE = [
  { name: 'Asha', span: 20, cubit: 44, foot: 24 },
  { name: 'Bilal', span: 23, cubit: 48, foot: 27 },
  { name: 'Chen', span: 17, cubit: 40, foot: 22 },
];
export const METRE_CM = 100;
export const unitLength = (person, unit) => (unit === 'metre' ? METRE_CM : person[unit]);
export const unitsAcross = (lengthCm, unitCm) => lengthCm / unitCm;

// ---------- The kilogram artefact against constants ----------
// Illustrative rate; the real drift against its copies was of the order of 50 µg in a century.
export const DRIFT_UG_PER_YEAR = 0.5;
export const artefactDrift = (years) => DRIFT_UG_PER_YEAR * years;
export const lightTimeNs = (metres) => (metres / C) * 1e9;
export const lightDistance = (ns) => C * ns * 1e-9;

// ---------- Derived units from kg, m, s ----------
export const BASES = [
  ['m', 'length', 'metre'], ['kg', 'mass', 'kilogram'], ['s', 'time', 'second'], ['A', 'electric current', 'ampere'],
  ['K', 'temperature', 'kelvin'], ['mol', 'amount of substance', 'mole'], ['cd', 'luminous intensity', 'candela'],
];
// exponents of kg, m, s
export const DERIVED = [
  { key: 'speed', name: 'speed', unit: 'm/s', kg: 0, m: 1, s: -1, recipe: 'v = distance ÷ time' },
  { key: 'acceleration', name: 'acceleration', unit: 'm/s²', kg: 0, m: 1, s: -2, recipe: 'a = v ÷ time' },
  { key: 'newton', name: 'force', unit: 'newton (N)', kg: 1, m: 1, s: -2, recipe: 'F = m × a' },
  { key: 'joule', name: 'energy', unit: 'joule (J)', kg: 1, m: 2, s: -2, recipe: 'W = F × distance' },
  { key: 'watt', name: 'power', unit: 'watt (W)', kg: 1, m: 2, s: -3, recipe: 'P = W ÷ time' },
  { key: 'pascal', name: 'pressure', unit: 'pascal (Pa)', kg: 1, m: -1, s: -2, recipe: 'p = F ÷ area' },
  { key: 'hertz', name: 'frequency', unit: 'hertz (Hz)', kg: 0, m: 0, s: -1, recipe: 'f = 1 ÷ period' },
];
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = (text) => String(text).replace(/[-0-9]/g, (ch) => SUP[ch]);

export function unitString({ kg, m, s }) {
  const parts = [['kg', kg], ['m', m], ['s', s]].filter(([, p]) => p !== 0)
    .map(([name, p]) => (p === 1 ? name : `${name}${sup(p)}`));
  return parts.length ? parts.join(' ') : '1 (no unit)';
}
export const derivedName = ({ kg, m, s }) => DERIVED.find((d) => d.kg === kg && d.m === m && d.s === s) || null;

// ---------- Radian and steradian ----------
export const arcLength = (r, theta) => r * theta;
export const solidAngle = (halfAngleRad) => 2 * Math.PI * (1 - Math.cos(halfAngleRad));
export const capArea = (r, halfAngleRad) => solidAngle(halfAngleRad) * r * r;

// ---------- Exact decimals ----------
export function parseDecimal(text) {
  const [whole, frac = ''] = String(text).split('.');
  return { n: Number(`${whole}${frac}` || '0'), e: -frac.length };
}
export const decimalValue = ({ n, e }) => n * 10 ** e;
export const decimalsOf = (text) => (String(text).split('.')[1] || '').length;

// Significant figures by the NCERT rules (§1.3.1): leading zeros never count; zeros after a decimal point do;
// terminal zeros of a number written without a point do not.
export function sigFigs(text) {
  const t = String(text).replace(/^[-+−]/, '');
  const hasPoint = t.includes('.');
  let digits = t.replace('.', '').replace(/^0+/, '');
  if (!hasPoint) digits = digits.replace(/0+$/, '');
  return digits.length;
}

// Which characters of a written number are significant: an array of true/false, null for the point.
export function sigMask(text) {
  const chars = [...String(text)];
  const hasPoint = chars.includes('.');
  const digits = chars.map((ch, i) => (ch === '.' ? -1 : i)).filter((i) => i >= 0);
  const first = digits.find((i) => chars[i] !== '0');
  const last = hasPoint ? digits[digits.length - 1] : [...digits].reverse().find((i) => chars[i] !== '0');
  return chars.map((ch, i) => (ch === '.' ? null : first !== undefined && i >= first && i <= last));
}

// Round half to even at a power of ten. drop = how many digits of n to remove.
function roundDigits(n, drop) {
  if (drop <= 0) return n * 10 ** -drop;
  const q = 10 ** drop;
  const keep = Math.floor(n / q);
  const rest = n % q;
  const up = rest * 2 > q || (rest * 2 === q && keep % 2 === 1);
  return keep + (up ? 1 : 0);
}
export function roundDecimals(value, decimals) {
  return { n: roundDigits(value.n, -decimals - value.e), e: -decimals };
}
// Returns { digits: 'ddd', lead: exponent of the first digit }
export function roundSig(value, sf) {
  if (value.n === 0) return { digits: '0'.repeat(sf), lead: 0 };
  const length = String(value.n).length;
  let lead = length - 1 + value.e;
  let kept = roundDigits(value.n, length - sf);
  if (String(kept).length > sf) { kept = Math.round(kept / 10); lead += 1; }
  return { digits: String(kept).padStart(sf, '0'), lead };
}
export function showSig({ digits, lead }) {
  const sf = digits.length;
  const last = lead - sf + 1;
  if (last >= 1) return `${digits[0]}${sf > 1 ? `.${digits.slice(1)}` : ''} ×10${sup(lead)}`;
  const intDigits = lead + 1;
  if (intDigits >= 1) return digits.slice(0, intDigits) + (last < 0 ? `.${digits.slice(intDigits)}` : '');
  return `0.${'0'.repeat(-lead - 1)}${digits}`;
}
export const showDecimal = (value) => {
  const { n, e } = value;
  if (e >= 0) return String(n * 10 ** e);
  const text = String(n).padStart(-e + 1, '0');
  return `${text.slice(0, text.length + e)}.${text.slice(text.length + e)}`;
};
export const addDecimals = (a, b) => {
  const e = Math.min(a.e, b.e);
  return { n: a.n * 10 ** (a.e - e) + b.n * 10 ** (b.e - e), e };
};
export const multiplyDecimals = (a, b) => ({ n: a.n * b.n, e: a.e + b.e });

// ---------- Why bother with significant figures ----------
export const LENGTH_CM = 2.30812; // the true length the tools measure (cm)
export const INSTRUMENTS = [
  { name: 'Ruler', decimals: 1 }, { name: 'Vernier', decimals: 2 }, { name: 'Screw gauge', decimals: 3 }, { name: 'Fine gauge', decimals: 4 },
];
// units: shift = power of ten from centimetres to the unit
export const LENGTH_UNITS = [['km', -5], ['m', -2], ['cm', 0], ['mm', 1], ['µm', 4]];
export const readingCounts = (decimals, lengthCm = LENGTH_CM) => Math.round(lengthCm * 10 ** decimals); // in least counts
// The reading written in a unit. Digits come from exact integers, never from float formatting.
export function readingIn(decimals, shift, lengthCm = LENGTH_CM) {
  return showDecimal(shiftDecimal({ n: readingCounts(decimals, lengthCm), e: -decimals }, shift));
}
export const shiftDecimal = ({ n, e }, shift) => ({ n, e: e + shift });

// ---------- Sums versus products ----------
export const TRUE_A = 12.4837;
export const TRUE_B = 3.2561;
export const measure = (truth, decimals) => showDecimal(roundDecimals(parseDecimal(String(truth)), decimals));
export const leastCount = (decimals) => 10 ** -decimals;
export function combine(op, aText, bText) {
  const a = parseDecimal(aText);
  const b = parseDecimal(bText);
  const da = decimalsOf(aText);
  const db = decimalsOf(bText);
  const errA = leastCount(da);
  const errB = leastCount(db);
  if (op === 'sum') {
    const exact = addDecimals(a, b);
    const decimals = Math.min(da, db);
    const error = errA + errB;
    return {
      exact: showDecimal(exact), error, relative: error / decimalValue(exact), ruleText: showDecimal(roundDecimals(exact, decimals)),
      ruleDecimals: decimals, errorDecimals: Math.max(0, -Math.floor(Math.log10(error) + 1e-12)),
    };
  }
  const exact = multiplyDecimals(a, b);
  const sf = Math.min(sigFigs(aText), sigFigs(bText));
  const value = decimalValue(exact);
  const relative = errA / decimalValue(a) + errB / decimalValue(b);
  const error = relative * value;
  const rounded = roundSig(exact, sf);
  const last = rounded.lead - sf + 1;
  return {
    exact: showDecimal(exact), error, relative, ruleText: showSig(rounded), sf,
    ruleDecimals: Math.max(0, -last), errorDecimals: Math.max(0, -Math.floor(Math.log10(error) + 1e-12)),
  };
}

// ---------- Rounding a tie ----------
// A tie is 2.7d5 (d = 0..9) held as whole thousandths. Results are in hundredths.
export const tieThousandths = (digit) => 2705 + 10 * digit;
export const roundUp = (thousandths) => Math.floor((thousandths + 5) / 10);
export function roundEven(thousandths) {
  const kept = Math.floor(thousandths / 10);
  return thousandths % 10 === 5 ? (kept % 2 === 0 ? kept : kept + 1) : Math.round(thousandths / 10);
}
export const tieError = (digit, rule) => {
  const t = tieThousandths(digit);
  return ((rule === 'even' ? roundEven(t) : roundUp(t)) * 10 - t) / 1000; // in the units of the number
};
export const totalBias = (rule, count = 10) => {
  let total = 0;
  for (let d = 0; d < count; d++) total += Math.round(tieError(d, rule) * 1000);
  return total / 1000;
};

// ---------- The significant-figure drill ----------
// rng is a lib/rng.js generator. Every question is built from exact decimals, and no answer is a tie.
const digitsOf = (rng, length, lastNonzero = true) => {
  let text = String(rng.int(1, 9));
  for (let i = 1; i < length; i++) text += String(rng.int(lastNonzero && i === length - 1 ? 1 : 0, 9));
  return text;
};
const isTie = (value, drop) => drop > 0 && value.n % 10 ** drop * 2 === 10 ** drop;
// A rounded { digits, lead } with its last digit moved by `step` (overflow, e.g. 99 → 100, moves the lead).
const nudge = ({ digits, lead }, step) => {
  const moved = String(Number(digits) + step);
  return moved.length > digits.length ? { digits: moved.slice(0, digits.length), lead: lead + 1 } : { digits: moved.padStart(digits.length, '0'), lead };
};
const unique = (list, taken) => {
  const out = [];
  for (const item of list) if (![...taken, ...out].includes(item)) out.push(item);
  return out;
};

function countQuestion(rng) {
  const patterns = [
    () => `0.${'0'.repeat(rng.int(1, 3))}${digitsOf(rng, rng.int(1, 4))}`,
    () => `${digitsOf(rng, rng.int(1, 3))}${'0'.repeat(rng.int(1, 3))}`,
    () => `${digitsOf(rng, rng.int(1, 3))}.${digitsOf(rng, rng.int(0, 2) || 1, false)}0`.replace(/0{2,}$/, '0'),
    () => `${rng.int(1, 9)}0${rng.int(1, 9)}${rng.next() < 0.5 ? `.${rng.int(1, 9)}` : ''}`,
    () => `${digitsOf(rng, rng.int(1, 2))}.${digitsOf(rng, rng.int(1, 3))}`,
  ];
  const text = rng.pick(patterns)();
  const answer = sigFigs(text);
  return {
    prompt: `How many significant figures does ${text} have?`,
    answer,
    hint: 'Leading zeros never count. Zeros after a decimal point do. Zeros at the end of a number with no point do not.',
    explain: `${text} has ${answer} significant figure${answer === 1 ? '' : 's'}.`,
  };
}

function roundQuestion(rng) {
  let n;
  let sf;
  let drop;
  do {
    n = Number(digitsOf(rng, 5));
    sf = rng.int(2, 4);
    drop = 5 - sf;
  } while (isTie({ n }, drop));
  const e = -rng.int(1, 4);
  const value = { n, e };
  const right = roundSig(value, sf);
  const truncated = { digits: String(n).slice(0, sf), lead: 4 + e };
  const shown = [right, truncated, nudge(truncated, 1), roundSig(value, sf + 1), roundSig(value, Math.max(1, sf - 1)), roundSig(value, 5)]
    .map(showSig);
  const correct = shown[0];
  const wrong = unique(shown.slice(1), [correct]).slice(0, 3);
  const options = rng.shuffle([correct, ...wrong]);
  return {
    prompt: `Round ${showDecimal(value)} to ${sf} significant figures.`,
    options,
    answer: options.indexOf(correct),
    hint: 'Count the figures from the first non-zero digit. Look at the next digit to decide whether to round up.',
    explain: `${showDecimal(value)} to ${sf} significant figures is ${correct}.`,
  };
}

function sumQuestion(rng) {
  let da;
  let db;
  let a;
  let b;
  let low;
  do {
    da = rng.int(0, 3);
    db = rng.int(0, 3);
    a = { n: Number(digitsOf(rng, rng.int(2, 4))), e: -da };
    b = { n: Number(digitsOf(rng, rng.int(2, 4))), e: -db };
    low = Math.min(da, db);
  } while (da === db || decimalValue(addDecimals(a, b)) < 1 || isTie(addDecimals(a, b), Math.max(da, db) - low));
  const exact = addDecimals(a, b);
  const rounded = roundDecimals(exact, low);
  const right = showDecimal(rounded);
  const more = [showDecimal(exact), showDecimal(roundDecimals(exact, low + 1)), showDecimal(roundDecimals(exact, Math.max(0, low - 1))),
    showDecimal({ n: rounded.n + 1, e: rounded.e }), showDecimal({ n: Math.max(0, rounded.n - 1), e: rounded.e }),
    showDecimal({ n: rounded.n + 2, e: rounded.e })];
  const options = rng.shuffle([right, ...unique(more, [right]).slice(0, 3)]);
  return {
    prompt: `${showDecimal(a)} + ${showDecimal(b)} = ? Give the sum with the right number of decimals.`,
    options,
    answer: options.indexOf(right),
    hint: 'In a sum, count decimal places, not significant figures. Keep as many as the number with the fewest.',
    explain: `The exact sum is ${showDecimal(exact)}. The numbers have ${da} and ${db} decimals, so keep ${low}: ${right}.`,
  };
}

function productQuestion(rng) {
  let a;
  let b;
  let sfa;
  let sfb;
  let low;
  let exact;
  do {
    sfa = rng.int(2, 4);
    sfb = rng.int(2, 4);
    a = { n: Number(digitsOf(rng, sfa)), e: -rng.int(0, 2) };
    b = { n: Number(digitsOf(rng, sfb)), e: -rng.int(0, 2) };
    low = Math.min(sfa, sfb);
    exact = multiplyDecimals(a, b);
  } while (sfa === sfb || isTie(exact, String(exact.n).length - low));
  const rounded = roundSig(exact, low);
  const right = showSig(rounded);
  const more = [showDecimal(exact), showSig(roundSig(exact, low + 1)), showSig(roundSig(exact, Math.max(1, low - 1))),
    showSig(nudge(rounded, 1)), showSig(nudge(rounded, -1)), showSig(nudge(rounded, 2))];
  const options = rng.shuffle([right, ...unique(more, [right]).slice(0, 3)]);
  return {
    prompt: `${showDecimal(a)} × ${showDecimal(b)} = ? Give the product with the right number of significant figures.`,
    options,
    answer: options.indexOf(right),
    hint: 'In a product, count significant figures. Keep as many as the number with the fewest.',
    explain: `The exact product is ${showDecimal(exact)}. The numbers have ${sfa} and ${sfb} significant figures, so keep ${low}: ${right}.`,
  };
}

export function drillQuestion(rng) {
  return rng.pick([countQuestion, roundQuestion, sumQuestion, productQuestion])(rng);
}

// ---------- Relative errors in an area ----------
export const rel = (value, error) => error / value;
export function box(length, width, dl, dw) {
  const area = length * width;
  const strips = { long: width * dl, wide: length * dw, corner: dl * dw };
  const error = strips.long + strips.wide + strips.corner;
  return { area, strips, error, relative: error / area, simple: dl / length + dw / width };
}

// ---------- Orders of magnitude ----------
export const OBJECTS = [
  ['Proton', 8.8e-16], ['Hydrogen atom', 5.3e-11], ['Virus', 1e-7], ['Red blood cell', 8e-6], ['Hair thickness', 7e-5],
  ['Human height', 1.7], ['Mount Everest', 8.8e3], ['Earth radius', 6.4e6], ['Sun radius', 7e8], ['Earth–Sun distance', 1.5e11],
  ['Nearest star', 4e16], ['Milky Way', 1e21],
];
export const orderOf = (size) => Math.round(Math.log10(size));

// ---------- Hair on a pencil ----------
export const windLength = (turns, diameterMm) => turns * diameterMm;
export const ruleReading = (lengthMm, leastCountMm) => Math.round(lengthMm / leastCountMm) * leastCountMm;
export const diameterEstimate = (turns, readingMm) => readingMm / turns;
export const diameterError = (turns, leastCountMm) => leastCountMm / turns;
