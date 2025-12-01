from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import permissions  # ← AGREGAR ESTA LÍNEA
from .models import Anime
from .serializers import AnimeSerializer
from .services import AnimeFLVService

class AnimeViewSet(viewsets.ModelViewSet):
    queryset = Anime.objects.all()
    serializer_class = AnimeSerializer
    permission_classes = [permissions.AllowAny]  # ← AGREGAR ESTA LÍNEA


    def create(self, request, *args, **kwargs):
        # Verificar si el anime ya existe por animeflv_id
        animeflv_id = request.data.get('animeflv_id')
        if animeflv_id:
            try:
                existing_anime = Anime.objects.filter(animeflv_id=animeflv_id).first()
                if existing_anime:
                    # Si ya existe, devolver el existente
                    serializer = self.get_serializer(existing_anime)
                    return Response(serializer.data, status=status.HTTP_200_OK)
            except Anime.DoesNotExist:
                pass
        
        # Si no existe, crear uno nuevo
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.GET.get('q', '')
        if not query:
            return Response({'error': 'Parámetro "q" requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        service = AnimeFLVService()
        resultados = service.buscar_animes(query)
        return Response(resultados)

    @action(detail=False, methods=['get'])
    def info(self, request):
        animeflv_id = request.GET.get('id', '')
        if not animeflv_id:
            return Response({'error': 'Parámetro "id" requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        service = AnimeFLVService()
        info_anime = service.obtener_info_anime(animeflv_id)
        
        if info_anime:
            return Response(info_anime)
        else:
            return Response({'error': 'Anime no encontrado'}, status=status.HTTP_404_NOT_FOUND)
