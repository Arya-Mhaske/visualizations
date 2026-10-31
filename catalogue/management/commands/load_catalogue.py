import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from catalogue.models import MAX_CHILDREN, Tile
from catalogue.paths import LiveChecker

DATA_DIR = Path(__file__).resolve().parent.parent.parent / 'data'
TAGS = {'WHY', 'HOW', 'APP'}
KINDS = ['subject', 'box', 'tool']


class Command(BaseCommand):
    help = 'Load catalogue/data/*.json into the Tile table (the JSON is the source of truth).'

    def handle(self, *args, **options):
        files = sorted(DATA_DIR.glob('*.json'))
        if not files:
            raise CommandError(f'No catalogue JSON files found in {DATA_DIR}')
        with transaction.atomic():
            seen, top_slugs = set(), set()
            for path in files:
                try:
                    data = json.loads(path.read_text(encoding='utf-8'))
                except json.JSONDecodeError as exc:
                    raise CommandError(f'{path.name}: invalid JSON: {exc}')
                self._check(data, path.name, ())
                if data['slug'] in top_slugs:
                    raise CommandError(f'{path.name}: duplicate subject slug "{data["slug"]}"')
                top_slugs.add(data['slug'])
                self._upsert(data, None, 0, seen)
            stale = Tile.objects.exclude(pk__in=seen)
            removed = stale.count()
            stale.delete()
        live = LiveChecker()
        for subject in Tile.objects.filter(parent=None):
            tools = list(Tile.objects.filter(kind='tool', parent__parent=subject))
            n_live = sum(1 for t in tools if live(t))
            self.stdout.write(f'{subject.slug}: {subject.children.count()} boxes, {len(tools)} tools '
                              f'({n_live} live, {len(tools) - n_live} placeholders)')
        if removed:
            self.stdout.write(f'removed {removed} stale tiles')

    def _check(self, node, fname, trail):
        if not isinstance(node, dict):
            raise CommandError(f'{fname}: {"/".join(trail) or "(root)"}: expected an object')
        if not node.get('slug'):
            raise CommandError(f'{fname}: {"/".join(trail) or "(root)"}: tile is missing a slug '
                               f'(title: {node.get("title")!r})')
        trail = trail + (node['slug'],)
        where = f'{fname}: {"/".join(trail)}'
        if not node.get('title'):
            raise CommandError(f'{where}: tile is missing a title')
        if len(trail) == len(KINDS):
            if node.get('tag') not in TAGS:
                raise CommandError(f'{where}: tag {node.get("tag")!r} must be one of WHY, HOW, APP')
            if node.get('children'):
                raise CommandError(f'{where}: tools cannot have children')
        children = node.get('children', [])
        if len(children) > MAX_CHILDREN:
            raise CommandError(f'{where}: {len(children)} children; the maximum is {MAX_CHILDREN}')
        slugs = [c.get('slug') for c in children if isinstance(c, dict)]
        for slug in slugs:
            if slug and slugs.count(slug) > 1:
                raise CommandError(f'{where}: duplicate sibling slug "{slug}"')
        for child in children:
            self._check(child, fname, trail)

    def _upsert(self, node, parent, depth, seen):
        tile, _ = Tile.objects.update_or_create(
            parent=parent, slug=node['slug'],
            defaults=dict(
                title=node['title'], kind=KINDS[depth],
                tag=node.get('tag', '') if depth == 2 else '',
                summary=node.get('summary', ''), sections=node.get('sections', ''),
                extension=bool(node.get('extension', False)), spec=node.get('spec', ''),
                order=node.get('order', 0)))
        seen.add(tile.pk)
        for child in node.get('children', []):
            self._upsert(child, tile, depth + 1, seen)
