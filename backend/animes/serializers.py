from rest_framework import serializers
from .models import Anime
from categorias.serializers import CategoriaSerializer

class AnimeSerializer(serializers.ModelSerializer):
    categoria_info = CategoriaSerializer(source='categoria', read_only=True)
    
    class Meta:
        model = Anime
        fields = '__all__'