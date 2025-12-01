from django.db import models

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    color_hex = models.CharField(max_length=7, default='#000000')
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        db_table = 'categorias'
        verbose_name_plural = 'Categorías'