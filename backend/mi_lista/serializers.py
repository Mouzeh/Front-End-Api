from rest_framework import serializers
from .models import MiLista
from animes.serializers import AnimeSerializer

class MiListaSerializer(serializers.ModelSerializer):
    anime_info = AnimeSerializer(source='anime', read_only=True)
    
    class Meta:
        model = MiLista
        fields = '__all__'