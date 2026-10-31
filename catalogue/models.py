from django.core.exceptions import ValidationError
from django.db import models

MAX_CHILDREN = 12


class Tile(models.Model):
    SUBJECT, BOX, TOOL = 'subject', 'box', 'tool'
    KIND_CHOICES = [(SUBJECT, 'Subject'), (BOX, 'Box'), (TOOL, 'Tool')]
    TAG_CHOICES = [('WHY', 'WHY'), ('HOW', 'HOW'), ('APP', 'APP')]

    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE,
                               related_name='children')
    slug = models.SlugField(max_length=100)
    title = models.CharField(max_length=200)
    kind = models.CharField(max_length=10, choices=KIND_CHOICES)
    tag = models.CharField(max_length=3, choices=TAG_CHOICES, blank=True)
    summary = models.TextField(blank=True)
    sections = models.CharField(max_length=200, blank=True)
    extension = models.BooleanField(default=False)
    spec = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    source = models.CharField(max_length=300, blank=True)
    aids = models.ManyToManyField('self', through='TileAid', through_fields=('tile', 'aid'),
                                  symmetrical=False, blank=True, related_name='aided_tiles')

    class Meta:
        ordering = ['order']
        constraints = [
            models.UniqueConstraint(fields=['parent', 'slug'], name='unique_slug_per_parent'),
            models.UniqueConstraint(fields=['slug'], condition=models.Q(parent__isnull=True),
                                    name='unique_top_level_slug'),
        ]

    def __str__(self):
        return self.title

    def clean(self):
        if self.parent_id:
            siblings = Tile.objects.filter(parent_id=self.parent_id).exclude(pk=self.pk)
            if siblings.count() >= MAX_CHILDREN:
                raise ValidationError(
                    f'"{self.parent}" already has {MAX_CHILDREN} children; the maximum is {MAX_CHILDREN}.')

    @property
    def slug_path(self):
        parts, tile = [], self
        while tile is not None:
            parts.append(tile.slug)
            tile = tile.parent
        return list(reversed(parts))

    @property
    def url(self):
        return '/' + '/'.join(self.slug_path) + '/'


class TileAid(models.Model):
    """One "understand this first" link: `aid` helps with `tile`, shown in `order`."""
    tile = models.ForeignKey(Tile, on_delete=models.CASCADE, related_name='aid_links')
    aid = models.ForeignKey(Tile, on_delete=models.CASCADE, related_name='+')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        constraints = [
            models.UniqueConstraint(fields=['tile', 'aid'], name='unique_aid_per_tile'),
            models.CheckConstraint(condition=~models.Q(tile=models.F('aid')), name='no_self_aid'),
        ]

    def __str__(self):
        return f'{self.aid} helps {self.tile}'
