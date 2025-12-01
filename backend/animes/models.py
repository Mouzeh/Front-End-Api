from django.db import models
from categorias.models import Categoria

class Anime(models.Model):
    ESTADO_OPCIONES = [
        ('En emisión', 'En emisión'),
        ('Finalizado', 'Finalizado'),
        ('Próximamente', 'Próximamente'),
    ]
    
    titulo = models.CharField(max_length=255)
    titulo_alternativo = models.CharField(max_length=255, blank=True, null=True)
    animeflv_id = models.CharField(max_length=100, unique=True)
    sinopsis = models.TextField(blank=True, null=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    episodios_totales = models.IntegerField(default=0)
    estado = models.CharField(max_length=20, choices=ESTADO_OPCIONES, default='En emisión')
    puntuacion = models.FloatField(default=0.0)
    url_poster = models.URLField(blank=True, null=True)
    fecha_agregado = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.titulo
    
    class Meta:
        db_table = 'animes'
        verbose_name_plural = 'Animes'