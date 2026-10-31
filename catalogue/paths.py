import os

from django.conf import settings


def tool_template_name(tile):
    return 'tools/' + '/'.join(tile.slug_path) + '.html'


class LiveChecker:
    """Is a tool live? True if templates/tools/<subject>/<box>/<tool>.html exists (CLAUDE.md §3).

    Create one per request: it lists each box folder once and remembers the answer only
    for that request, so adding a template file never needs a restart.
    """

    def __init__(self):
        self.root = settings.BASE_DIR / 'templates'
        self._folders = {}

    def __call__(self, tool):
        return self.is_live(*tool.slug_path)

    def is_live(self, subject, box, slug):
        key = (subject, box)
        if key not in self._folders:
            folder = self.root / 'tools' / subject / box
            self._folders[key] = set(os.listdir(folder)) if folder.is_dir() else set()
        return f'{slug}.html' in self._folders[key]
