import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from catalogue.models import MAX_CHILDREN, Tile, TileAid
from catalogue.paths import LiveChecker

DATA_DIR = Path(__file__).resolve().parent.parent.parent / 'data'
TAG_RANK = {'WHY': 0, 'HOW': 1, 'APP': 2}
KINDS = [Tile.SUBJECT, Tile.BOX, Tile.TOOL]
REQUIRED = {
    Tile.SUBJECT: ('slug', 'title', 'source', 'order', 'children'),
    Tile.BOX: ('slug', 'title', 'order', 'children'),
    Tile.TOOL: ('slug', 'title', 'tag', 'summary', 'sections', 'extension', 'order', 'aids'),
}
FIELDS = ['title', 'kind', 'tag', 'summary', 'sections', 'extension', 'spec', 'order', 'source']


class Command(BaseCommand):
    help = 'Load catalogue/data/*.json into the Tile table (the JSON is the source of truth).'

    def handle(self, *args, **options):
        files = sorted(DATA_DIR.glob('*.json'))
        if not files:
            raise CommandError(f'No catalogue JSON files found in {DATA_DIR}')
        with transaction.atomic():
            nodes = self._read(files)
            self._check_aids(nodes)
            removed = self._sync_tiles(nodes)
            links = self._sync_aids(nodes)
        self._report(nodes, removed, links)

    def _read(self, files):
        """Validate every file with no DB access. Returns {slug path tuple: (file name, node)}."""
        nodes, subject_orders = {}, {}
        for path in files:
            try:
                data = json.loads(path.read_text(encoding='utf-8'))
            except json.JSONDecodeError as exc:
                raise CommandError(f'{path.name}: invalid JSON: {exc}')
            self._check(data, path.name, (), nodes)
            order = data['order']
            if order in subject_orders:
                raise CommandError(f'{path.name}: {data["slug"]}: subject order {order} is already '
                                   f'used by {subject_orders[order]}')
            subject_orders[order] = path.name
        return nodes

    def _check(self, node, fname, trail, nodes):
        if not isinstance(node, dict):
            raise CommandError(f'{fname}: {"/".join(trail) or "(root)"}: expected an object')
        if not node.get('slug'):
            raise CommandError(f'{fname}: {"/".join(trail) or "(root)"}: tile is missing a slug '
                               f'(title: {node.get("title")!r})')
        trail = trail + (node['slug'],)
        where = f'{fname}: {"/".join(trail)}'
        kind = KINDS[len(trail) - 1]
        if trail in nodes:
            raise CommandError(f'{where}: duplicate subject slug, also in {nodes[trail][0]}')
        if not node.get('title'):
            raise CommandError(f'{where}: tile is missing a title')
        for field in REQUIRED[kind]:
            if field not in node:
                raise CommandError(f'{where}: tile is missing a {field}')
        nodes[trail] = (fname, node)
        if kind == Tile.TOOL:
            if node['tag'] not in TAG_RANK:
                raise CommandError(f'{where}: tag {node["tag"]!r} must be one of WHY, HOW, APP')
            if node.get('children'):
                raise CommandError(f'{where}: tools cannot have children')
            return
        children = node['children']
        if len(children) > MAX_CHILDREN:
            raise CommandError(f'{where}: {len(children)} children; the maximum is {MAX_CHILDREN}')
        slugs = [c.get('slug') for c in children if isinstance(c, dict)]
        for slug in slugs:
            if slug and slugs.count(slug) > 1:
                raise CommandError(f'{where}: duplicate sibling slug "{slug}"')
        for child in children:
            self._check(child, fname, trail, nodes)
        if kind == Tile.BOX:
            tags = [c['tag'] for c in children]
            if [TAG_RANK[t] for t in tags] != sorted(TAG_RANK[t] for t in tags):
                raise CommandError(f'{where}: tools must run WHY, then HOW, then APP; got {", ".join(tags)}')

    def _check_aids(self, nodes):
        for trail, (fname, node) in nodes.items():
            if len(trail) != len(KINDS):
                continue
            where = f'{fname}: {"/".join(trail)}'
            aids = node['aids']
            for aid in aids:
                target = tuple(aid.split('/'))
                if target == trail:
                    raise CommandError(f'{where}: a tool cannot list itself as an aid')
                if target not in nodes:
                    raise CommandError(f'{where}: aid "{aid}" does not exist')
                if len(target) < 2:
                    raise CommandError(f'{where}: aid "{aid}" must be a tool or a box')
                if aids.count(aid) > 1:
                    raise CommandError(f'{where}: aid "{aid}" is listed twice')

    def _sync_tiles(self, nodes):
        """Upsert by slug path, parents first so children can point at them. Returns stale tiles removed."""
        by_pk = {t.pk: t for t in Tile.objects.all()}
        existing = {}
        for tile in by_pk.values():
            parts = [tile.slug]
            parent = by_pk.get(tile.parent_id)
            while parent is not None:
                parts.insert(0, parent.slug)
                parent = by_pk.get(parent.parent_id)
            existing[tuple(parts)] = tile

        stale = [t.pk for path, t in existing.items() if path not in nodes]
        if stale:
            Tile.objects.filter(pk__in=stale).delete()

        for depth in range(1, len(KINDS) + 1):
            new, changed = [], []
            for trail, (_, node) in nodes.items():
                if len(trail) != depth:
                    continue
                values = self._values(node, depth)
                tile = existing.get(trail)
                if tile is None:
                    tile = Tile(slug=trail[-1], parent=existing.get(trail[:-1]), **values)
                    existing[trail] = tile
                    new.append(tile)
                elif any(getattr(tile, k) != v for k, v in values.items()):
                    for k, v in values.items():
                        setattr(tile, k, v)
                    changed.append(tile)
            Tile.objects.bulk_create(new, batch_size=500)
            if changed:
                Tile.objects.bulk_update(changed, FIELDS, batch_size=200)
        self._tiles = existing
        return len(stale)

    @staticmethod
    def _values(node, depth):
        kind = KINDS[depth - 1]
        return dict(
            title=node['title'], kind=kind,
            tag=node['tag'] if kind == Tile.TOOL else '',
            summary=node.get('summary', ''), sections=node.get('sections', ''),
            extension=bool(node.get('extension', False)), spec=node.get('spec', ''),
            order=node['order'], source=node.get('source', ''))

    def _sync_aids(self, nodes):
        """A second pass, once every tile has a pk. Rebuilt whole, so it needs no diffing."""
        links = [
            TileAid(tile=self._tiles[trail], aid=self._tiles[tuple(aid.split('/'))], order=i)
            for trail, (_, node) in nodes.items() if len(trail) == len(KINDS)
            for i, aid in enumerate(node['aids'], start=1)]
        TileAid.objects.all().delete()
        TileAid.objects.bulk_create(links, batch_size=500)
        return len(links)

    def _report(self, nodes, removed, links):
        live = LiveChecker()
        boxes, tools, n_live = {}, {}, {}
        for trail in nodes:
            subject = trail[0]
            boxes.setdefault(subject, 0)
            tools.setdefault(subject, 0)
            n_live.setdefault(subject, 0)
            if len(trail) == 2:
                boxes[subject] += 1
            elif len(trail) == 3:
                tools[subject] += 1
                n_live[subject] += live.is_live(*trail)
        for subject in boxes:
            self.stdout.write(f'{subject}: {boxes[subject]} boxes, {tools[subject]} tools '
                              f'({n_live[subject]} live, {tools[subject] - n_live[subject]} placeholders)')
        if removed:
            self.stdout.write(f'removed {removed} stale tiles')
        total_live, total_tools = sum(n_live.values()), sum(tools.values())
        self.stdout.write(f'{len(boxes)} subjects, {sum(boxes.values())} boxes, {total_tools} tools '
                          f'({total_live} live, {total_tools - total_live} placeholders), '
                          f'{links} aid links, 0 broken aids')
