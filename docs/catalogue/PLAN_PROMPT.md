# MuskMelon: final consolidation (paste this into Claude Code in plan mode)

You're in the repo root (`visualisations/`). **Read `CLAUDE.md` in full first.** It's the rulebook and it overrides anything
else in the repo that disagrees with it. I've just pasted in the final set of source files:

- `CLAUDE.md` (updated: the site is now called **MuskMelon**, plus the repo layout, brand rules and subject order ranges)
- `static/css/brutal.css` (updated: an orange `.nb-logo` with `.nb-logo__mark` and `.nb-logo__word`)
- `static/img/muskmelon.svg` (the brand mark, also used as the favicon)
- `catalogue/data/*.json`: **30 subject files, about 1,538 tools**. Every tool has `aids` (slug paths). This is the complete
  catalogue: Maths 1–19, Physics XI 20–25, Physics XII 26–30.
- `docs/catalogue/*.md`: human-readable catalogues for each book, plus this prompt

Most of the site already exists: Django is deployed on Render, there's a first tool (`trigonometry/angles-arcs/why-360-degrees`),
and everything else is a placeholder. This task makes the codebase match `CLAUDE.md` and the new catalogue, then rebrands it.
**Don't build any new visualisation tools in this task.**

## Phase 0: Audit (report this in the plan before changing anything)
1. Map what exists in `visualisations/`, `core/`, `catalogue/`, `templates/`, `static/`, `docs/`, `site/`, `screenshots/` against
   `CLAUDE.md` §2–§6, and list every gap.
2. `site/` and any older copies of `CLAUDE.md`, `brutal.css` or catalogue JSON (for example a top-level `trigonometry.json`, or
   JSON outside `catalogue/data/`) are leftovers from earlier rounds. List them and propose deleting or moving them. The root
   `CLAUDE.md`, `static/css/brutal.css` and `catalogue/data/` are the only sources of truth.
3. Check git hygiene. `db.sqlite3`, `staticfiles/`, `screenshots/`, `__pycache__/`, `.env` and `*.pyc` must be in `.gitignore`.
   If any of them are already tracked, plan `git rm --cached` for them (this keeps the local files).
4. Read `build.sh` and `render.yaml`. The build must run, in order: install requirements, `collectstatic --no-input`, `migrate`,
   then `load_catalogue`. Flag anything that breaks on a fresh Render container (Render's free tier keeps no disk between deploys).

## Phase 1: Model and loader (CLAUDE.md §3–§4)
- `Tile` needs `parent`, `slug`, `title`, `kind`, `tag`, `summary`, `sections`, `extension`, `spec`, `order`, `source` (subjects
  only), and an ordered, non-symmetrical `aids` M2M (a through model with an `order` field). Write migrations that apply cleanly
  to an empty database.
- `load_catalogue` reads every `catalogue/data/*.json` inside one `transaction.atomic()` and **fails loudly with the file and the
  path** when any of these is broken:
  - a subject or box has more than 12 children
  - tools in a box aren't ordered WHY, then HOW, then APP
  - two children of one parent share a slug
  - a required field is missing
  - two subjects share an `order`
  - an aid path doesn't exist, or a tool lists itself as an aid
- It upserts tiles by slug path, deletes tiles that are no longer in the JSON, and resolves aids in a second pass. It ends by
  printing counts (subjects, boxes, tools, aid links). The expected counts are 30 subjects and 1,538 tools, with 0 broken aids.
- Make it fast enough for every deploy: bulk operations and no per-tile queries where avoidable. Target under 10 s on Render.

## Phase 2: Pages
- **Landing:** subjects in `order`, with no padding slots. The first 12 fill the first screen and the rest scroll. Put a small
  jump bar at the top (`Maths · Physics XI · Physics XII`) with anchor links, because physics starts at subject 20 and would
  otherwise be hidden below the fold. Add any classes it needs to `brutal.css`; don't use inline styles.
- **Subject and box grids:** a 3×4 grid with dashed empty-slot tiles and `.is-soon` striping for placeholders. Tool tiles show
  their tag badge and an "N aids" badge.
- **Tool pages and placeholders** show the "Understand these first" aids strip under `.viz-head`: small tiles, coloured if the
  aid is live and striped if it's a placeholder, and they may link across subjects.
  - Placeholders also show the summary, the sections, and "(ext.)" when `extension` is true.
  - Render `spec` only in a collapsed "Build notes" panel, and only when `DEBUG=True`.
- Breadcrumbs and the `.nb-location` pill on every page below the landing page. Unknown paths return a 404.
- Queries: use `select_related`/`prefetch_related` so that no grid or tool page runs more than about 10 queries.
- The existing live tool must keep working at its current URL. If its slug path isn't in the new JSON, stop and tell me.
  Don't rename anything.

## Phase 3: Rebrand to MuskMelon (CLAUDE.md §6, Brand)
- Navbar: `.nb-logo` holds the SVG mark inline, plus the `.nb-logo__word` "MuskMelon".
- `<title>` is "<page> · MuskMelon" (just "MuskMelon" on the home page). Update the footer, the meta description and the Open
  Graph tags, and use `static/img/muskmelon.svg` as the favicon.
- Replace every user-facing "Visualisations"/"Visualizations" string. Keep the `visualisations` package, the folder and Render
  settings unchanged. The Render URL stays the same; I'll rename the service in the dashboard myself if I want to.

## Phase 4: Tests and checks (CLAUDE.md §8)
- Tests:
  - the loader succeeds on the real data and fails on each broken fixture (13 children, bad tag order, missing aid, self-aid,
    duplicate order)
  - **every catalogue URL returns 200**: loop over all tiles with the test client
  - a garbage path returns 404
  - every aid resolves
  - the landing page lists all 30 subjects in order
  - the 360° tool's maths facts
- `python manage.py check`, `test`, and `collectstatic --no-input` with `DEBUG=False`.
- Playwright screenshots at 360, 768 and 1280 px of the landing page, one subject, one box, one placeholder (one with aids) and
  the live tool, saved to `screenshots/`. Pass criteria: no console errors and no horizontal scroll.

## Rules
- Follow `CLAUDE.md` everywhere: no JS framework, no npm, pinned CDN versions only, and colours only from `brutal.css` tokens.
- Make small, logical commits as each phase is done. **Never push** and never touch remotes.
- In plan mode, give me: the Phase 0 findings, the files you'll change or delete, the migration plan, risks, and at most 3
  questions. Then wait for my approval.

Known gap to keep in mind (no action needed now):
- For Maths XII, the Chapter 3–13 section refs were written without the PDFs, so they need checking before those tools are built.
