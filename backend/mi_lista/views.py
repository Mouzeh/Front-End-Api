from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import permissions  # ← AGREGAR ESTA LÍNEA

from .models import MiLista
from .serializers import MiListaSerializer

class MiListaViewSet(viewsets.ModelViewSet):
    queryset = MiLista.objects.all()
    serializer_class = MiListaSerializer
    permission_classes = [permissions.AllowAny]  # ← AGREGAR ESTA LÍNEA

    def get_queryset(self):
        usuario = self.request.GET.get('usuario', 'rudy')
        return MiLista.objects.filter(usuario_nombre=usuario)
    
    def create(self, request, *args, **kwargs):
        # Verificar si ya existe en la lista del usuario
        anime_id = request.data.get('anime')
        usuario_nombre = request.data.get('usuario_nombre', 'rudy')
        
        if anime_id and usuario_nombre:
            existing_item = MiLista.objects.filter(
                anime_id=anime_id, 
                usuario_nombre=usuario_nombre
            ).first()
            
            if existing_item:
                serializer = self.get_serializer(existing_item)
                return Response(
                    {'detail': 'Este anime ya está en tu lista', 'data': serializer.data},
                    status=status.HTTP_200_OK
                )
        
        return super().create(request, *args, **kwargs)