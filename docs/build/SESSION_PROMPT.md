# Session prompt

Paste everything below the line into a new Claude Code session. Change only the `TARGET:` line. It can be one box
(`measurement-motion/units-measurement`), several boxes separated by commas, a whole subject (`optics`), or `next`
(the next unticked boxes in the queue). To run many unattended, see `docs/build/run_targets.py` and `targets.txt`.

---

TARGET: measurement-motion/units-measurement

Build the MuskMelon tools for TARGET.

1. Read `CLAUDE.md` and `docs/build/PLAN.md` in full, especially "How to continue" and "Learned so far". Switch to branch `build/tools`. If it is behind `main`, stop and tell me.
2. Run `python manage.py catalogue_status --todo`. Take the boxes in TARGET one at a time, in queue order, skipping any already live. If TARGET is `next`, keep taking the next unticked box until context runs short.
3. For each box, read its JSON in `catalogue/data/` and hand-review its entries in `docs/build/manifest.json`. Then build every tool in WHY, HOW, APP order.
   - Follow each tool's `summary` and `spec`. A WHY tool's picture must make the reason visible through what the student does; a slider beside a plotted result is not enough.
   - Use the engines in `static/viz/lib/`. If a box needs an engine or a helper that doesn't exist, add it to the library, documented, and say so in your report.
   - If a summary is wrong or can't be built well, log it in `docs/build/QUESTIONS.md` with a proposed fix and skip that tool. Never change a slug. Never remove or reorder tools.
4. Add `catalogue/tool_tests/test_<subject>_<box>.py`. Work out every number shown independently in Python, including facts in the `why` text, and check the JS module with `js()`.
5. Before committing a box, do all of these:
   - run `python manage.py smoke_tools --box <subject>/<box>`
   - run `python docs/build/sheet.py <subject>/<box>`, open `screenshots/sheet.png`, look at every stage, and fix what's wrong
   - do the same at 360 px: `python docs/build/sheet.py <subject>/<box> 360`
   - run `python manage.py check`, then the whole of `python manage.py test`, then `DEBUG=False SECRET_KEY=x python manage.py collectstatic --no-input` in the Bash tool
   Do not commit if any of these fails.
6. Tick the box in `PLAN.md`, add anything a later session should know to "Learned so far", and make one commit: `tools(<subject>/<box>): N tools live`. Never push.
   Run one command per tool call, with no `cd` and no `&&`: unattended sessions may only run allowlisted commands.
7. If context runs short, finish the current tool, leave the box uncommitted only if it is unfinished, and say exactly where to resume.

End with a short report: boxes finished, tools live, anything skipped, library changes, and anything you are unsure teaches well.
