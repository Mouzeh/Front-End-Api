from django.db import models
from animes.models import Anime

class MiLista(models.Model):
    ESTADO_OPCIONES = [
        ('Viendo', 'Viendo'),
        ('Completado', 'Completado'),
        ('Pendiente', 'Pendiente'),
        ('Abandonado', 'Abandonado'),
    ]
    
    anime = models.ForeignKey(Anime, on_delete=models.CASCADE)
    usuario_nombre = models.CharField(max_length=100)
    episodio_actual = models.IntegerField(default=0)
    episodios_vistos = models.JSONField(default=list, blank=True)  # Lista de episodios vistos
    visto_completo = models.BooleanField(default=False)
    mi_calificacion = models.IntegerField(default=0, choices=[(i, i) for i in range(1, 11)])
    estado = models.CharField(max_length=20, choices=ESTADO_OPCIONES, default='Pendiente')
    notas = models.TextField(blank=True, null=True)
    fecha_agregado = models.DateTimeField(auto_now_add=True)
    ultimo_episodio_visto = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.usuario_nombre} - {self.anime.titulo}"
    
    class Meta:
        db_table = 'mi_lista'
        verbose_name_plural = 'Mi Lista'
        unique_together = ['anime', 'usuario_nombre']