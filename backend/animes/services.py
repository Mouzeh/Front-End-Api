from animeflv import AnimeFLV  # ← minúsculas, no mayúsculas

class AnimeFLVService:
    def __init__(self):
        self.api = AnimeFLV()
    
    def buscar_animes(self, query):
        try:
            resultados = self.api.search(query)
            animes_formateados = []
            
            for anime in resultados:
                animes_formateados.append({
                    'animeflv_id': anime.id,
                    'titulo': anime.title,
                    'titulo_alternativo': getattr(anime, 'alt_title', ''),
                    'url_poster': anime.poster,
                    'sinopsis': getattr(anime, 'synopsis', ''),
                    'tipo': getattr(anime, 'type', ''),
                    'episodios': getattr(anime, 'episodes', 0),
                    'estado': getattr(anime, 'status', ''),
                    'generos': getattr(anime, 'genres', [])
                })
            
            return animes_formateados
        except Exception as e:
            print(f"Error buscando animes: {e}")
            return []
    
    def obtener_info_anime(self, animeflv_id):
        try:
            anime_info = self.api.get_anime_info(animeflv_id)
            
            return {
                'animeflv_id': animeflv_id,
                'titulo': anime_info.title,
                'titulo_alternativo': getattr(anime_info, 'alt_title', ''),
                'sinopsis': getattr(anime_info, 'synopsis', ''),
                'episodios_totales': len(getattr(anime_info, 'episodes', [])),
                'estado': getattr(anime_info, 'status', 'En emisión'),
                'puntuacion': getattr(anime_info, 'rating', 0.0),
                'url_poster': anime_info.poster,
                'generos': getattr(anime_info, 'genres', [])
            }
        except Exception as e:
            print(f"Error obteniendo info anime: {e}")
            return None