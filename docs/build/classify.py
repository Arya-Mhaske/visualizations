"""Rebuild docs/build/manifest.json and print the box queue. Run from the repo root.

The first run sorted every tool with the keyword heuristic below. Entries with "reviewed": true were
checked by hand and are kept as they are on a re-run, so this script never undoes a review.
    python docs/build/classify.py           writes the manifest, prints archetype counts
    python docs/build/classify.py --queue   prints the queue as Markdown table rows for PLAN.md
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / 'docs/build/manifest.json'
PHYSICS_LAST, TIER1_LAST = 11, 25

RULES = [
    ('discrete', r'venn|relation|subset|de morgan|sample space|two.dice|grid of|tree|pascal|cayley|permutation'
                 r'|combination|choices|arrange|counting|\bc\(n|matrix|matrices|determinant|row |pivot|group|subgroup'
                 r'|coset|modular|mod \d|remainder|prime|gcd|euclid|induction|rsa|isomorph|homomorph|symmetries'
                 r'|bijection|mapping|digits?|decimal|rational number|fraction|partial fraction'),
    ('chance', r'probab|random|dice|coin|sampl|simulat|expect|bayes|shuffl|lottery|birthday|monte carlo|\bstatistic'
               r'|variance|standard deviation|mean\b|median|spread'),
    ('phasor', r'phasor|alternating|\bac\b|lcr|rms|impedance|reactance|transformer'),
    ('rays', r'\bray|mirror|lens|refract|prism|field line|huygens|wavefront|fibre|snell|telescope|microscope'
             r'|interference|diffraction|polari[sz]|equipotential|flux'),
    ('space3d', r'\b3d\b|three[- ]dimension|in space|cross product|×|solid|sphere|cylind|\bcone|volume|quadric|skew'
                r'|surface|octant|torus|helix|revolution|gradient|partial deriv|tangent plane|saddle|curl'
                r'|divergence|stokes'),
    ('table', r'spectrum|spectra|orders? of magnitude|convert|periodic table|library|chart|\bunits?\b'
              r'|significant figure|rounding|prefix|dimension'),
]
TABLE_SUBJECTS = {'measurement-motion', 'modern-physics', 'heat-thermodynamics', 'induction-ac-em',
                  'properties-of-matter', 'exponentials-logs'}
DEFAULTS = {'optics': 'rays', 'numbers-algebra': 'discrete', 'functions-graphs': 'plot', 'trigonometry': 'geometry',
            'exponentials-logs': 'plot', 'sequences-probability': 'discrete', 'conics-curves': 'geometry',
            'systems-matrices': 'discrete', 'limits-continuity': 'plot', 'derivatives': 'plot',
            'derivative-applications': 'plot', 'integrals': 'plot', 'integral-applications': 'plot',
            'differential-equations': 'plot', 'vectors-3d': 'space3d', 'infinite-series': 'plot',
            'multivariable': 'space3d', 'vector-calculus': 'space3d', 'linear-algebra': 'discrete',
            'abstract-algebra': 'discrete'}

# NCERT maths chapter order, as boxes. The pilots are left out: they are built first.
MATHS_XI = """numbers-algebra/sets functions-graphs/coordinate-plane functions-graphs/what-is-a-function
functions-graphs/properties-library trigonometry/similar-triangles trigonometry/right-triangle-ratios
trigonometry/unit-circle trigonometry/sine-cosine-graphs trigonometry/tan-cot-sec-csc trigonometry/identities
numbers-algebra/complex-numbers numbers-algebra/quadratic-equations numbers-algebra/inequalities-absolute-value
sequences-probability/counting sequences-probability/binomial-theorem sequences-probability/sequences
sequences-probability/arithmetic-sequences sequences-probability/geometric-sequences-series functions-graphs/lines-slope
conics-curves/what-are-conics conics-curves/parabola conics-curves/ellipse conics-curves/hyperbola
limits-continuity/why-calculus limits-continuity/the-limit-idea limits-continuity/limit-laws
derivatives/what-is-a-derivative derivatives/differentiation-rules derivatives/trig-derivatives
sequences-probability/statistics-measuring-spread sequences-probability/probability""".split()
MATHS_XII = """functions-graphs/combining-inverting trigonometry/inverses-equations systems-matrices/matrices-row-reduction
systems-matrices/matrix-algebra systems-matrices/determinants-cramer limits-continuity/continuity derivatives/chain-rule
derivatives/implicit-differentiation derivatives/exp-log-inverse-derivatives derivatives/rates-in-science
derivative-applications/maxima-minima derivative-applications/mean-value-theorem derivative-applications/shape-of-a-graph
derivative-applications/optimisation derivative-applications/antiderivatives integrals/area-distance
integrals/the-definite-integral integrals/fundamental-theorem integrals/substitution integrals/integration-by-parts
integrals/trig-integrals-substitution integrals/partial-fractions-strategy integral-applications/area-between-curves
differential-equations/what-is-a-differential-equation differential-equations/separable-equations
differential-equations/linear-first-order vectors-3d/vectors-in-space vectors-3d/cross-product vectors-3d/lines-planes
systems-matrices/inequalities-linear-programming sequences-probability/random-variables-expectation""".split()
PILOTS = ['trigonometry/angles-arcs', 'measurement-motion/motion-in-a-straight-line', 'vectors-3d/3d-coordinates',
          'sequences-probability/conditional-probability-bayes']


def load():
    subjects = [json.loads(p.read_text(encoding='utf-8')) for p in (ROOT / 'catalogue/data').glob('*.json')]
    return sorted(subjects, key=lambda s: s['order'])


def archetype(tool, subject):
    text = f"{tool['title']} {tool['summary']}".lower()
    if tool['tag'] == 'HOW' and re.search(r'practice|drill|quiz|identify|spot |classify|which graph', text):
        return 'drill'
    for name, pattern in RULES:
        if name == 'table' and subject['slug'] not in TABLE_SUBJECTS:
            continue
        if name == 'discrete' and subject['order'] <= PHYSICS_LAST:
            continue
        if re.search(pattern, text):
            return name
    if tool['tag'] == 'HOW':
        return 'stepper'
    return DEFAULTS.get(subject['slug'], 'sim')


def alternate(physics, maths, support):
    """One physics box, one maths box. When maths runs out its slot takes a supporting box."""
    out, maths = [], list(maths)
    for box in physics:
        out.append(box)
        if maths:
            out.append(maths.pop(0))
        elif support:
            out.append(support.pop(0))
    return out + maths


def queue(subjects):
    paths = [(s, f"{s['slug']}/{b['slug']}") for s in subjects for b in s['children']]
    class_xi = [p for s, p in paths if s['order'] <= 6 and p not in PILOTS]
    class_xii = [p for s, p in paths if 7 <= s['order'] <= PHYSICS_LAST and p not in PILOTS]
    named = set(MATHS_XI) | set(MATHS_XII) | set(PILOTS)
    support = [p for s, p in paths if PHYSICS_LAST < s['order'] <= TIER1_LAST and p not in named]
    ordered = alternate(class_xi, MATHS_XI, support) + alternate(class_xii, MATHS_XII, support) + support
    ordered += [p for s, p in paths if s['order'] > TIER1_LAST]
    assert len(ordered) == len(set(ordered)) == len(paths) - len(PILOTS), 'queue must hold every box once'
    return ordered


def main():
    subjects = load()
    if '--queue' in sys.argv:
        sizes = {f"{s['slug']}/{b['slug']}": len(b['children']) for s in subjects for b in s['children']}
        for i, path in enumerate(queue(subjects), 1):
            order = next(s for s in subjects if s['slug'] == path.split('/')[0])['order']
            print(f"| {i} | `{path}` | {sizes[path]} | {2 if order > TIER1_LAST else 1} | |")
        return
    old = json.loads(MANIFEST.read_text(encoding='utf-8')) if MANIFEST.exists() else {}
    rank = {path: i for i, path in enumerate(PILOTS + queue(subjects))}
    manifest = {}
    for subject in subjects:
        for box in subject['children']:
            box_path = f"{subject['slug']}/{box['slug']}"
            for tool in box['children']:
                path = f"{box_path}/{tool['slug']}"
                manifest[path] = old[path] if old.get(path, {}).get('reviewed') else {
                    'archetype': archetype(tool, subject), 'priority': rank[box_path],
                    'notes': '', 'reviewed': False}
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=0) + '\n', encoding='utf-8')
    counts = Counter(entry['archetype'] for entry in manifest.values())
    print(sum(counts.values()), counts.most_common())


if __name__ == '__main__':
    main()
