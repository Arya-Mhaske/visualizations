from django.contrib import admin

from .models import Tile


@admin.register(Tile)
class TileAdmin(admin.ModelAdmin):
    """Read-only: catalogue/data/*.json is the source of truth (see load_catalogue)."""
    list_display = ('title', 'kind', 'tag', 'parent', 'order')
    list_filter = ('kind', 'tag')
    search_fields = ('title', 'slug')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['title'] = 'Tiles (read-only: edit catalogue/data/*.json, then run load_catalogue)'
        return super().changelist_view(request, extra_context)
