"""Print live/placeholder counts per subject and box, read from the JSON and the templates.

Live status is derived from the template files (CLAUDE.md §3); nothing is stored. Needs no database.
Use --todo to list only boxes that aren't finished.
"""
import json
from collections import Counter

from django.core.management.base import BaseCommand

from catalogue.management.commands.load_catalogue import DATA_DIR
from catalogue.paths import LiveChecker

TAGS = ('WHY', 'HOW', 'APP')


def load_subjects():
    subjects = [json.loads(path.read_text(encoding='utf-8')) for path in sorted(DATA_DIR.glob('*.json'))]
    return sorted(subjects, key=lambda s: s['order'])


def describe(tools):
    """One summary line for a list of (tag, is_live) pairs."""
    total, live = Counter(), Counter()
    for tag, is_live in tools:
        total[tag] += 1
        live[tag] += is_live
    count, done = sum(total.values()), sum(live.values())
    detail = '  '.join(f'{tag} {live[tag]}/{total[tag]}' for tag in TAGS)
    return f'{done:>4}/{count:<4} live, {count - done:>4} placeholders   {detail}'


class Command(BaseCommand):
    help = 'Show how many tools are live and how many are placeholders, by subject and box, with tags.'

    def add_arguments(self, parser):
        parser.add_argument('--todo', action='store_true', help='hide boxes that are fully live')

    def handle(self, *args, todo=False, **options):
        checker = LiveChecker()
        everything = []
        for subject in load_subjects():
            rows, in_subject = [], []
            for box in subject['children']:
                tools = [(tool['tag'], checker.is_live(subject['slug'], box['slug'], tool['slug']))
                         for tool in box['children']]
                in_subject += tools
                if not (todo and all(is_live for _, is_live in tools)):
                    rows.append(f"  {box['slug']:<42} {describe(tools)}")
            everything += in_subject
            self.stdout.write(f"{subject['order']:>2} {subject['slug']:<43} {describe(in_subject)}")
            for row in rows:
                self.stdout.write(row)
        self.stdout.write(f'\nTOTAL {describe(everything)}')
