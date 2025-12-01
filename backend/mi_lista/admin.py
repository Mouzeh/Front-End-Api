from django.contrib import admin
from .models import MiLista

@admin.register(MiLista)
class MiListaAdmin(admin.ModelAdmin):
    list_display = ['usuario_nombre', 'anime', 'estado', 'episodio_actual', 'fecha_agregado']
    list_filter = ['estado', 'usuario_nombre']