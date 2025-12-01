import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Play, Heart, Star, List, ExternalLink, Loader, 
  Sparkles, Check, Eye, EyeOff, X, SkipBack, SkipForward 
} from 'lucide-react';
import axios from 'axios';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL 
  : 'http://localhost:8000/api';



/* ============================
   🎨 ANIMACIONES PREMIUM
   ============================ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  }
};

const floatingAnimation = {
  y: [-10, 10, -10],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
};

/* ======================================
   💠 COMPONENTE PRINCIPAL
   ====================================== */
function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [myList, setMyList] = useState([]);
  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null); // Faltaba esta línea

  // Player states
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(1);

  // Episodes watched per anime-list item
  const [episodeProgress, setEpisodeProgress] = useState({});

  /* ======================================
     🔍 BUSCAR ANIMES
     ====================================== */
  const searchAnimes = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setIsSearching(true);

    try {
      const response = await axios.get(`${API_BASE}/animes/search/?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error buscando animes:', error);
      showNotification('Error al buscar animes', 'error');
    } finally {
      setLoading(false);
      setTimeout(() => setIsSearching(false), 500);
    }
  };

  /* ======================================
     ➕ AGREGAR A MI LISTA (100% FUSIÓN)
     ====================================== */
  // SOLO reemplaza esta función en tu frontend existente:
const addToMyList = async (anime) => {
  try {
    // Datos simplificados
    const animeData = {
      titulo: anime.titulo,
      titulo_alternativo: anime.titulo_alternativo || '',
      animeflv_id: anime.animeflv_id,
      sinopsis: anime.sinopsis || 'Sin sinopsis',
      episodios_totales: anime.episodios || 12,
      estado: anime.estado || 'En emisión',
      puntuacion: 0,
      url_poster: anime.url_poster || '',
      categoria: 1  // Asegúrate que esta categoría exista
    };

    // 1. Crear anime (o obtener si ya existe)
    let animeResponse;
    try {
      animeResponse = await axios.post(`${API_BASE}/animes/`, animeData);
    } catch (error) {
      // Si falla, buscar el anime existente
      const searchResponse = await axios.get(`${API_BASE}/animes/?animeflv_id=${anime.animeflv_id}`);
      if (searchResponse.data.results && searchResponse.data.results.length > 0) {
        animeResponse = { data: searchResponse.data.results[0] };
      } else {
        throw error;
      }
    }

    // 2. Agregar a mi lista
    const listaData = {
      anime: animeResponse.data.id,
      usuario_nombre: 'rudy',
      episodio_actual: 0,
      episodios_vistos: [],
      visto_completo: false,
      mi_calificacion: 0,
      estado: 'Pendiente',
      notas: ''
    };

    await axios.post(`${API_BASE}/mi-lista/`, listaData);
    showNotification(`✅ ${anime.titulo} agregado a tu lista!`, 'success');
    loadMyList();
    
  } catch (error) {
    console.error('Error completo:', error);
    showNotification('Error al agregar. Intenta nuevamente.', 'error');
  }
};
  /* ======================================
     📥 CARGAR MI LISTA (FUSIÓN)
     ====================================== */
  const loadMyList = async () => {
    try {
      const response = await axios.get(`${API_BASE}/mi-lista/?usuario=rudy`);
      setMyList(response.data);

      // Registrar progreso local
      const progress = {};
      response.data.forEach(item => {
        progress[item.id] = item.episodios_vistos || [];
      });

      setEpisodeProgress(progress);

    } catch (error) {
      console.error('Error cargando lista:', error);
    }
  };

  /* ======================================
     ✔ MARCAR EPISODIO VISTO
     ====================================== */
  const markEpisodeAsWatched = async (itemId, episode) => {
    try {
      await axios.post(`${API_BASE}/mi-lista/${itemId}/marcar_episodio/`, {
        episodio: episode
      });

      setEpisodeProgress(prev => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), episode]
      }));

      showNotification(`Episodio ${episode} marcado como visto`, 'success');
      loadMyList();

    } catch (error) {
      console.error('Error marcando episodio:', error);
      showNotification('Error al marcar episodio', 'error');
    }
  };

  /* ======================================
     ↩ DESMARCAR EPISODIO
     ====================================== */
  const unmarkEpisodeAsWatched = async (itemId, episode) => {
    try {
      await axios.post(`${API_BASE}/mi-lista/${itemId}/desmarcar_episodio/`, {
        episodio: episode
      });

      setEpisodeProgress(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || []).filter(ep => ep !== episode)
      }));

      showNotification(`Episodio ${episode} desmarcado`, 'success');
      loadMyList();

    } catch (error) {
      console.error('Error desmarcando episodio:', error);
      showNotification('Error al desmarcar episodio', 'error');
    }
  };

  /* ======================================
     ▶ ABRIR REPRODUCTOR
     ====================================== */
  const openPlayer = (anime, episode = 1) => {
    setSelectedAnime(anime);
    setCurrentEpisode(episode);
    setShowPlayer(true);
  };

  /* ======================================
     🔔 NOTIFICACIONES PREMIUM
     ====================================== */
  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    notification.innerHTML = `
      <div class="notification-content">
        ${type === 'success' ? '🎉' : '⚠️'}
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  /* ======================================
     🔁 AUTO-CARGA LISTA
     ====================================== */
  useEffect(() => {
    if (activeTab === 'mylist') loadMyList();
  }, [activeTab]);

  return (
    <div className="app premium-theme">

      {/* ================================
          ✨ PARTICULAS DE FONDO PREMIUM
         ================================ */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* ================================
          💠 HEADER PREMIUM COMPLETO
         ================================ */}
      <motion.header 
        className="header premium-header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 100,
          damping: 15
        }}
      >
        <div className="header-content">

          {/* ---------- LOGO PREMIUM ---------- */}
          <motion.div 
            className="logo premium-logo"
            whileHover={{ 
              scale: 1.05,
              rotateZ: [0, -2, 2, -2, 0]
            }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="logo-icon"
              animate={floatingAnimation}
            >
              🎬
            </motion.div>

            <div>
              <h1>ANIME_FLV_API</h1>
              <div className="logo-subtitle">Premium Experience</div>
            </div>

            <motion.div
              className="sparkle"
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Sparkles size={16} />
            </motion.div>
          </motion.div>

          {/* ---------- NAV TABS ---------- */}
          <motion.nav 
            className="tabs premium-tabs"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >

            {/* TAB DE BUSQUEDA */}
            <motion.button
              onClick={() => setActiveTab('search')}
              className={`tab premium-tab ${activeTab === 'search' ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search size={18} />
              <span>Descubrir</span>

              {activeTab === 'search' && (
                <motion.div 
                  className="tab-glow"
                  layoutId="tabGlow"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>

            {/* TAB MI LISTA */}
            <motion.button
              onClick={() => setActiveTab('mylist')}
              className={`tab premium-tab ${activeTab === 'mylist' ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List size={18} />
              <span>Mi Colección</span>

              <motion.span 
                className="badge premium-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {myList.length}
              </motion.span>

              {activeTab === 'mylist' && (
                <motion.div 
                  className="tab-glow"
                  layoutId="tabGlow"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>

          </motion.nav>
        </div>

        {/* Glow de luz en el header */}
        <div className="header-glow"></div>
      </motion.header>

      {/* ================================
          🎪 CONTENIDO PRINCIPAL
         ================================ */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="search-section premium-search"
            >

              {/* ================================
                  🎇 HERO DE BUSQUEDA PREMIUM
                 ================================ */}
              <motion.div 
                className="hero-search premium-hero"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.h2 
                  className="hero-title premium-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Descubre tu próximo 
                  <motion.span 
                    className="gradient-text animated-gradient"
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    {' '}
                    anime favorito
                  </motion.span>
                </motion.h2>

                <motion.p 
                  className="hero-subtitle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Explora miles de animes y construye tu colección personal
                </motion.p>

                {/* ================================
                    🔍 BARRA DE BÚSQUEDA PREMIUM
                   ================================ */}
                <motion.div 
                  className="search-container premium-search-container"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
                >
                  <motion.div 
                    className="search-input-wrapper premium-input-wrapper"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <Search className="search-icon premium-icon" size={20} />

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchAnimes()}
                      placeholder="¿Qué anime buscas hoy? (Naruto, One Piece, Attack on Titan...)"
                      className="search-input premium-input"
                    />

                    {searchQuery && (
                      <motion.button
                        onClick={() => setSearchQuery('')}
                        className="clear-btn premium-clear"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ✕
                      </motion.button>
                    )}
                  </motion.div>

                  <motion.button
                    onClick={searchAnimes}
                    disabled={loading}
                    className="search-button premium-search-btn"
                    whileHover={{ scale: loading ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow: loading 
                        ? '0 4px 15px rgba(102, 126, 234, 0.4)'
                        : '0 8px 25px rgba(102, 126, 234, 0.6)'
                    }}
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Loader size={20} />
                      </motion.div>
                    ) : (
                      <Search size={20} />
                    )}
                    {loading ? 'Buscando...' : 'Descubrir'}
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* ================================
                  🦴 SKELETON LOADING PREMIUM
                 ================================ */}
              <AnimatePresence>
                {isSearching && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="loading-grid premium-loading"
                  >
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="skeleton-card premium-skeleton"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { delay: i * 0.1 }
                        }}
                      >
                        <motion.div 
                          className="skeleton-poster"
                          animate={{
                            background: [
                              'linear-gradient(90deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)',
                              'linear-gradient(90deg, #2d3748 0%, #4a5568 100%, #2d3748 100%)',
                              'linear-gradient(90deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)'
                            ]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                        <div className="skeleton-content">
                          <div className="skeleton-title"></div>
                          <div className="skeleton-subtitle"></div>
                          <div className="skeleton-tags">
                            <div className="skeleton-tag"></div>
                            <div className="skeleton-tag"></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ================================
                  🎴 GRID ULTRA PREMIUM DE RESULTS
                 ================================ */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="results-grid premium-grid"
              >
                {searchResults.map((anime) => (
                  <motion.div
                    key={anime.animeflv_id}
                    variants={itemVariants}
                    className="anime-card premium-card"
                    whileHover={{ 
                      y: -12,
                      scale: 1.03,
                      transition: { stiffness: 300, damping: 20 }
                    }}
                    onHoverStart={() => setHoveredCard(anime.animeflv_id)}
                    onHoverEnd={() => setHoveredCard(null)}
                  >
                    {/* Glow al hover */}
                    <div className="card-glow"></div>

                    {/* POSTER */}
                    <div className="card-image premium-card-image">
                      <motion.img 
                        src={anime.url_poster || 'https://via.placeholder.com/300x400/1a202c/2d3748?text=No+Image'} 
                        alt={anime.titulo}
                        className="anime-poster premium-poster"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* OVERLAY ACTIONS */}
                      <motion.div 
                        className="card-overlay premium-overlay"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <motion.button
                          className="action-btn watch-btn"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openPlayer(anime)}
                        >
                          <Play size={18} fill="white" />
                        </motion.button>

                        <motion.button
                          className="action-btn favorite-btn"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => addToMyList(anime)}
                        >
                          <Plus size={18} />
                        </motion.button>

                        <motion.button
                          className="action-btn external-btn"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            window.open(
                              `https://animeflv.net/anime/${anime.animeflv_id}`,
                              '_blank'
                            )
                          }
                        >
                          <ExternalLink size={16} />
                        </motion.button>
                      </motion.div>

                      {/* BADGE DE ESTADO */}
                      <motion.div 
                        className="card-badge premium-badge-status"
                        whileHover={{ scale: 1.1 }}
                      >
                        <span className={`status premium-status ${anime.estado === 'En emisión' ? 'airing' : 'completed'}`}>
                          {anime.estado}
                        </span>
                      </motion.div>

                      {/* PARTICULAS AL HOVER */}
                      <AnimatePresence>
                        {hoveredCard === anime.animeflv_id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover-particles"
                          >
                            {[...Array(8)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="hover-particle"
                                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                                animate={{
                                  scale: [0, 1, 0],
                                  opacity: [1, 0.5, 0],
                                  x: Math.cos((i * 45) * Math.PI / 180) * 40,
                                  y: Math.sin((i * 45) * Math.PI / 180) * 40
                                }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                              />
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* CARD CONTENT */}
                    <motion.div 
                      className="card-content premium-card-content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="anime-title premium-title-text">{anime.titulo}</h3>

                      {anime.titulo_alternativo && (
                        <motion.p 
                          className="anime-alt-title"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {anime.titulo_alternativo}
                        </motion.p>
                      )}

                      <motion.div 
                        className="anime-info premium-info"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <span className="info-item">{anime.tipo}</span>
                        <span className="info-divider">•</span>
                        <span className="info-item">{anime.episodios} episodios</span>
                      </motion.div>
                    </motion.div>

                  </motion.div>
                ))}
              </motion.div>

              {/* ================================
                  🌙 ESTADO VACÍO PREMIUM
                 ================================ */}
              {searchResults.length === 0 && !isSearching && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="empty-state premium-empty"
                >
                  <motion.div
                    className="empty-icon"
                    animate={floatingAnimation}
                  >
                    🔍
                  </motion.div>

                  <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    Tu aventura comienza aquí
                  </motion.h3>

                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    Busca tus animes favoritos para empezar tu colección
                  </motion.p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'mylist' && (
            <motion.div
              key="mylist"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="my-list-section premium-list"
            >
              
              {/* ================================
                  📚 ENCABEZADO DE LA COLECCIÓN
                 ================================ */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="list-header premium-list-header"
              >
                <h2 className="list-title premium-list-title">
                  Mi <span className="gradient-text">Colección Premium</span>
                </h2>

                <motion.p 
                  className="list-subtitle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {myList.length} animes en tu biblioteca •{' '}
                  {myList.reduce((total, item) => total + (item.episodios_vistos?.length || 0), 0)}
                  {' '}episodios vistos
                </motion.p>
              </motion.div>

              {/* ================================
                  📭 SI LA LISTA ESTÁ VACÍA
                 ================================ */}
              {myList.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="empty-list premium-empty-list"
                >
                  <motion.div
                    className="empty-list-icon"
                    animate={floatingAnimation}
                  >
                    📚
                  </motion.div>

                  <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    Tu biblioteca está esperando
                  </motion.h3>

                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    Descubre animes increíbles y agrégalos a tu colección
                  </motion.p>

                  <motion.button
                    onClick={() => setActiveTab('search')}
                    className="cta-button premium-cta"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Search size={18} />
                    Explorar Galería
                  </motion.button>
                </motion.div>
              ) : (
                
                /* ================================
                   🎴 GRID DE CARDS DE LA COLECCIÓN
                   ================================ */
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="list-grid premium-list-grid"
                >
                  {myList.map((item, index) => {
                    const totalEpisodes = item.anime_info?.episodios_totales || 12;
                    const watched = episodeProgress[item.id] || [];
                    const progressPct = ((item.episodio_actual || 0) / totalEpisodes) * 100;

                    return (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        className="list-item premium-list-item"
                        whileHover={{ y: -8, scale: 1.02 }}
                      >
                        
                        {/* POSTER + PROGRESO */}
                        <div className="list-item-image premium-list-image">
                          <img 
                            src={item.anime_info?.url_poster || 'https://via.placeholder.com/300x400/1a202c/2d3748?text=No+Image'} 
                            alt={item.anime_info?.titulo}
                          />

                          {/* BARRA DE PROGRESO */}
                          <div className="progress-overlay premium-progress">
                            <div className="progress-text">
                              Episodio {item.episodio_actual} de {totalEpisodes}
                            </div>

                            <motion.div 
                              className="progress-bar"
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPct}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>

                        {/* INFO DEL ANIME */}
                        <div className="list-item-content premium-list-content">
                          <h4>{item.anime_info?.titulo}</h4>

                          {/* ESTADO + CALIFICACIÓN */}
                          <div className="list-item-meta premium-list-meta">
                            <span className={`status-tag premium-status-tag ${item.estado.toLowerCase()}`}>
                              {item.estado}
                            </span>

                            {item.mi_calificacion > 0 && (
                              <motion.div 
                                className="rating premium-rating"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <Star size={14} fill="currentColor" />
                                <span>{item.mi_calificacion}</span>
                              </motion.div>
                            )}
                          </div>

                          {/* ================================
                              🎬 EPISODIOS CLICKABLE
                             ================================ */}
                          <div className="episodes-section">
                            <h5>Episodios:</h5>

                            <div className="episodes-grid">
                              {[...Array(Math.min(totalEpisodes, 50))].map((_, epIndex) => {
                                const episode = epIndex + 1;
                                const isWatched = watched.includes(episode);

                                return (
                                  <motion.button
                                    key={episode}
                                    className={`episode-btn ${isWatched ? 'watched' : 'unwatched'}`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      isWatched
                                        ? unmarkEpisodeAsWatched(item.id, episode)
                                        : markEpisodeAsWatched(item.id, episode)
                                    }
                                  >
                                    {isWatched ? <Check size={12} /> : <Play size={12} />}
                                    <span>{episode}</span>
                                  </motion.button>
                                );
                              })}
                            </div>

                            {/* CONTINUAR VIENDO */}
                            <motion.button
                              className="watch-all-btn"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => 
                                openPlayer(
                                  item.anime_info,
                                  (item.episodio_actual || 0) + 1
                                )
                              }
                            >
                              <Play size={16} />
                              Continuar viendo (Ep. {(item.episodio_actual || 0) + 1})
                            </motion.button>

                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ================================
          🎥 MODAL DEL REPRODUCTOR PREMIUM
         ================================ */}
      <AnimatePresence>
        {showPlayer && selectedAnime && (
          <motion.div
            className="player-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPlayer(false)}
          >
            <motion.div
              className="player-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* ========================
                  🔻 HEADER DEL PLAYER
                 ======================== */}
              <div className="player-header">
                <h3>
                  Viendo: {selectedAnime.titulo}  
                  <span className="ep-label">• Episodio {currentEpisode}</span>
                </h3>

                <motion.button
                  className="close-player"
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPlayer(false)}
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* ========================
                  🎬 VIDEO (Placeholder)
                 ======================== */}
              <div className="player-content">
                <div className="video-placeholder">
                  <div className="video-message">
                    <Play size={48} />
                    <p>Reproductor de video</p>
                    <small>Episodio {currentEpisode} – {selectedAnime.titulo}</small>
                  </div>
                </div>

                {/* ========================
                    🎛 CONTROLES DEL PLAYER
                   ======================== */}
                <div className="player-controls">

                  {/* ----- CONTROL EPISODIO ----- */}
                  <div className="episode-navigation">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setCurrentEpisode(prev => Math.max(1, prev - 1))
                      }
                    >
                      <SkipBack size={20} />
                      Anterior
                    </motion.button>

                    <span className="current-episode">
                      Episodio {currentEpisode}
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setCurrentEpisode(prev => prev + 1)
                      }
                    >
                      Siguiente
                      <SkipForward size={20} />
                    </motion.button>
                  </div>

                  {/* ----- MARCAR VISTO ----- */}
                  <motion.button
                    className="mark-watched-btn"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const listItem = myList.find(
                        item => item.anime_info?.animeflv_id === selectedAnime.animeflv_id
                      );
                      if (listItem) {
                        markEpisodeAsWatched(listItem.id, currentEpisode);
                      }
                    }}
                  >
                    <Check size={18} />
                    Marcar como visto
                  </motion.button>

                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================
          ✨ ELEMENTOS FLOTANTES PREMIUM
         ================================ */}
      <div className="floating-elements">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-element"
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 10 - 5, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {['🎬', '🌟', '✨', '🎭', '📺'][i]}
          </motion.div>
        ))}
      </div>

    </div>
  );
}

export default App;