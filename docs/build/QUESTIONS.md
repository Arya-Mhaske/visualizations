# Questions and doubts

Log anything a tool can't follow from the catalogue: tool path, the problem, a proposed fix. Skip that tool until answered.

## Open

- **`measurement-motion/motion-in-a-straight-line/why-is-velocity-at-an-instant-a-limit`: table layout unchecked against the book.**
  The tool centres the interval on t = 4 s (Δt = 2 s gives 3.92 m/s). That is from memory of NCERT Table 2.1; the summary gives only
  the end values. Fix: compare with the 2026-27 reprint, and change `centredVelocity` if the book differs.
- **`induction-ac-em/ac-basics/phasor-diagram-builder`: two aids don't help.** They point to `heat-thermodynamics/change-of-state/phase-diagram-why-does-dry-ice-sublime`
  and `forces-energy/potential-energy-conservation/read-an-energy-diagram`, which look like matches on the word "diagram" and have nothing to do with phasors.
  Students would see them under "Understand these first". The tool is built; the aids are unchanged. Fix: replace both with
  `induction-ac-em/ac-basics/why-draw-ac-as-rotating-phasors` and `induction-ac-em/ac-basics/why-does-current-lag-in-an-inductor-and-lead-in-a-capacitor`.
- **`induction-ac-em/ac-basics/phasor-diagram-builder`: "any combination" is built as series only.** All seven mixes of R, L and C in series, which is what NCERT covers.
  Fix: none unless parallel is wanted; it would draw V first and add the currents.
- **`induction-ac-em/ac-basics`: notation.** The `why-use-rms-values` summary writes I₀, and NCERT writes i_m, with I for rms. The pages use i_m and a note mentions I₀.
  Fix: change the summary to i_m (it isn't shown on the live page).

- **Orbit stages on phones.** On 3D stages a swipe turns the scene and does not scroll the page, and the stage fills the width at
  360 px. Students scroll from the panel or heading. Proposed: keep this unless it annoys students in class.

- **Maths XII Ch. 3–13 section refs are unverified.** They were catalogued without the PDFs (docs/catalogue/maths-xii.md).
  Boxes built so far that cite them: `sequences-probability/conditional-probability-bayes` (MXII 13.1–13.5).
  Fix: check against the NCERT PDFs when available, and correct the `sections` values in the JSON.

- **`measurement-motion/units-measurement/why-are-si-units-now-defined-by-constants-of-nature`: drift rate is invented.**
  The kilogram artefact drifts at an illustrative 0.5 µg a year, labelled as such in a note (the figure often quoted is about
  50 µg in a century against its copies). Fix: replace with a sourced figure if one is wanted, and keep the label until then.
- **`measurement-motion/units-measurement/why-do-we-need-agreed-units-at-all`: span, cubit and foot sizes are made up.**
  Asha, Bilal and Chen have invented hand and arm sizes; the summary only says "three different numbers". Fix: none needed
  unless a historical set of values is preferred, but it must not be presented as a real record.
- **`measurement-motion/units-measurement/why-do-products-keep-the-fewest-sig-figs-but-sums-the-fewest`: the rules are shortcuts.**
  Each reading's uncertainty is taken as one unit in its last digit. The rule matches the error bar's last digit for sums
  always, and is tested to be within one digit for products (it can be off by one). The tool says so in a note. Check this is
  the message you want for Class 11.
- **`measurement-motion/units-measurement/measure-a-hair-or-a-thread-with-simple-tools`: no microscope view.**
  The summary says "or uses a microscope". Only winding is built; the microscope is a one-line note. Fix: add a second view
  (vernier microscope with a least count of 0.01 mm) if wanted.
- **`functions-graphs/transformations/match-the-graph-to-the-equation`: no timer.** The summary says "timed matching game". The drill has no clock, so the tool is untimed practice with a score, and a note says so. Fix: add an optional countdown to `lib/drill.js` if a timed version is wanted.
- **`functions-graphs/modelling-with-data/diamond-price-versus-carat`: the book's data are not in the repo.** The summary asks for the book's Hope-diamond style data. The tool uses eight made-up prices and says so in a note. Fix: replace the `DATA` array with the book's table when available.
- **`functions-graphs/modelling-with-data/model-picker`: the logistic fit is approximate.** It fixes the ceiling a little above the largest value and fits a straight line to ln(L/y − 1). That is not a true least-squares logistic fit. The note on the page says the method is simple. Fix: a Gauss–Newton fit if exact R² values matter.
- **Data sets and rates in several tools are made up for practice:** the shop and taxi stories, the bridge, dish and can numbers, the cost figures and the exchange rate. Each page says so in a note.

## optics/optical-instruments/why-are-big-telescopes-reflectors
The summary says "heavy glass". A single thin lens is usually lighter than a mirror blank of the same diameter, so a mass comparison would mislead. Built with the true reasons: colour (shown by computing the foci) and support (a lens can only be held by its rim and sags; a mirror is held from behind). Proposed summary: "Avoids chromatic aberration and the problem of supporting a huge lens."
