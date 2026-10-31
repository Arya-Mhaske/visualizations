"""Keeps docs/build honest: every tool has a manifest entry, every box is queued exactly once."""
import json
import re
from pathlib import Path

from django.conf import settings
from django.test import SimpleTestCase

from catalogue.management.commands.load_catalogue import DATA_DIR

BUILD = Path(settings.BASE_DIR) / 'docs/build'
ARCHETYPES = {'geometry', 'plot', 'sim', 'rays', 'phasor', 'space3d', 'chance', 'stepper', 'drill', 'table', 'discrete'}


def catalogue():
    tools, boxes = set(), set()
    for path in DATA_DIR.glob('*.json'):
        subject = json.loads(path.read_text(encoding='utf-8'))
        for box in subject['children']:
            boxes.add(f"{subject['slug']}/{box['slug']}")
            tools |= {f"{subject['slug']}/{box['slug']}/{tool['slug']}" for tool in box['children']}
    return tools, boxes


class ProgrammeTests(SimpleTestCase):
    def test_manifest_covers_every_tool(self):
        manifest = json.loads((BUILD / 'manifest.json').read_text(encoding='utf-8'))
        self.assertEqual(set(manifest), catalogue()[0])
        self.assertLessEqual({entry['archetype'] for entry in manifest.values()}, ARCHETYPES)

    def test_plan_queues_every_box_once(self):
        plan = (BUILD / 'PLAN.md').read_text(encoding='utf-8')
        queued = re.findall(r'^\| \S+ \| `([^`/]+/[^`/]+)` \|', plan, flags=re.M)
        self.assertEqual(len(queued), len(set(queued)))
        self.assertEqual(set(queued), catalogue()[1])
