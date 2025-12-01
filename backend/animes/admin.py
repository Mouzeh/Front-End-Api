from django.contrib import admin
from .models import Anime

@admin.register(Anime)
class AnimeAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'categoria', 'estado', 'puntuacion', 'fecha_agregado']
    list_filter = ['estado', 'categoria']
    search_fields = ['titulo', 'titulo_alternativo']