import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Play, Check, Star, List, X, Heart, ExternalLink, Loader } from 'lucide-react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:8000/api';

// Animaciones
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const modalVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    y: -50
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2
    }
  }
};

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [myList, setMyList] = useState([]);
  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Buscar animes en AnimeFLV
  const searchAnimes = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setIsSearching(true);
    try {
      const response = await axios.get(`${API_BASE}/animes/search/?q=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error buscando animes:', error);
      alert('Error al buscar animes');
    } finally {
      setLoading(false);
      setTimeout(() => setIsSearching(false), 500);
    }
  };

  // Agregar anime a mi lista
  const addToMyList = async (anime) => {
    try {
      const animeData = {
        titulo: anime.titulo,
        titulo_alternativo: anime.titulo_alternativo,
        animeflv_id: anime.animeflv_id,
        sinopsis: anime.sinopsis,
        episodios_totales: anime.episodios || 0,
        estado: anime.estado || 'En emisión',
        puntuacion: 0,
        url_poster: anime.url_poster,
        categoria: 1
      };

      await axios.post(`${API_BASE}/animes/`, animeData);
      
      // Mostrar notificación de éxito
      const notification = document.createElement('div');
      notification.className = 'success-notification';
      notification.innerHTML = `
        <div class="notification-content">
          <Check size={20} />
          <span>¡${anime.titulo} agregado a tu lista!</span>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
      
    } catch (error) {
      console.error('Error agregando a lista:', error);
      alert('Error al agregar a lista');
    }
  };

  // Cargar mi lista
  const loadMyList = async () => {
    try {
      const response = await axios.get(`${API_BASE}/mi-lista/?usuario=rudy`);
      setMyList(response.data);
    } catch (error) {
      console.error('Error cargando lista:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'mylist') {
      loadMyList();
    }
  }, [activeTab]);

  return (
    <div className="app">
      {/* Header con Glassmorphism */}
      <motion.header 
        className="header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="header-content">
          <motion.div 
            className="logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="logo-icon">🎬</div>
            <h1>ANIME_FLV_API</h1>
          </motion.div>
          
          {/* Navigation Tabs */}
          <motion.div className="tabs" layout>
            <motion.button
              onClick={() => setActiveTab('search')}
              className={`tab ${activeTab === 'search' ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search size={18} />
              <span>Descubrir</span>
              {activeTab === 'search' && (
                <motion.div 
                  className="tab-indicator"
                  layoutId="tabIndicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('mylist')}
              className={`tab ${activeTab === 'mylist' ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List size={18} />
              <span>Mi Lista</span>
              <span className="badge">{myList.length}</span>
              {activeTab === 'mylist' && (
                <motion.div 
                  className="tab-indicator"
                  layoutId="tabIndicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="search-section"
            >
              {/* Hero Search */}
              <motion.div 
                className="hero-search"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="hero-title">
                  Descubre tu próximo 
                  <span className="gradient-text"> anime favorito</span>
                </h2>
                <p className="hero-subtitle">
                  Explora miles de animes y construye tu colección personal
                </p>
                
                <motion.div 
                  className="search-container"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="search-input-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchAnimes()}
                      placeholder="Buscar animes... (Naruto, One Piece, Attack on Titan)"
                      className="search-input"
                    />
                    {searchQuery && (
                      <motion.button
                        onClick={() => setSearchQuery('')}
                        className="clear-btn"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={16} />
                      </motion.button>
                    )}
                  </div>
                  <motion.button
                    onClick={searchAnimes}
                    disabled={loading}
                    className="search-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      background: loading 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    {loading ? (
                      <Loader className="spinner" size={20} />
                    ) : (
                      <Search size={20} />
                    )}
                    {loading ? 'Buscando...' : 'Buscar'}
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Search Results */}
              <AnimatePresence>
                {isSearching && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="loading-grid"
                  >
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="skeleton-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="skeleton-poster"></div>
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

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="results-grid"
              >
                {searchResults.map((anime, index) => (
                  <motion.div
                    key={anime.animeflv_id}
                    variants={itemVariants}
                    className="anime-card"
                    whileHover={{ 
                      y: -8,
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="card-image">
                      <img 
                        src={anime.url_poster || 'https://via.placeholder.com/300x400/1a202c/2d3748?text=No+Image'} 
                        alt={anime.titulo}
                        className="poster"
                      />
                      <div className="card-overlay">
                        <motion.button
                          className="action-btn watch-btn"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => window.open(`https://animeflv.net/anime/${anime.animeflv_id}`, '_blank')}
                        >
                          <ExternalLink size={16} />
                        </motion.button>
                        <motion.button
                          className="action-btn add-btn"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => addToMyList(anime)}
                        >
                          <Plus size={16} />
                        </motion.button>
                      </div>
                      <div className="card-badge">
                        <span className={`status-badge ${anime.estado === 'En emisión' ? 'airing' : 'completed'}`}>
                          {anime.estado}
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-content">
                      <h3 className="anime-title">{anime.titulo}</h3>
                      {anime.titulo_alternativo && (
                        <p className="anime-alt-title">{anime.titulo_alternativo}</p>
                      )}
                      <div className="anime-meta">
                        <span className="meta-item">{anime.tipo}</span>
                        <span className="meta-divider">•</span>
                        <span className="meta-item">{anime.episodios} episodios</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {searchResults.length === 0 && !isSearching && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="empty-state"
                >
                  <div className="empty-icon">🔍</div>
                  <h3>Comienza tu búsqueda</h3>
                  <p>Encuentra tus animes favoritos usando la barra de búsqueda</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'mylist' && (
            <motion.div
              key="mylist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="my-list-section"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="list-header"
              >
                <h2 className="list-title">
                  Mi <span className="gradient-text">Colección</span>
                </h2>
                <p className="list-subtitle">
                  {myList.length} animes en tu lista personal
                </p>
              </motion.div>

              {myList.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="empty-list"
                >
                  <div className="empty-list-icon">📋</div>
                  <h3>Tu lista está vacía</h3>
                  <p>Agrega algunos animes desde la pestaña de descubrimiento</p>
                  <motion.button
                    onClick={() => setActiveTab('search')}
                    className="cta-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Search size={18} />
                    Explorar Animes
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="list-grid"
                >
                  {myList.map((item, index) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      className="list-item"
                      whileHover={{ y: -4 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="list-item-image">
                        <img 
                          src={item.anime_info?.url_poster || 'https://via.placeholder.com/300x400/1a202c/2d3748?text=No+Image'} 
                          alt={item.anime_info?.titulo}
                        />
                        <div className="progress-overlay">
                          <div className="progress-text">
                            Episodio {item.episodio_actual}
                          </div>
                        </div>
                      </div>
                      <div className="list-item-content">
                        <h4>{item.anime_info?.titulo}</h4>
                        <div className="list-item-meta">
                          <span className={`status-tag ${item.estado.toLowerCase()}`}>
                            {item.estado}
                          </span>
                          {item.mi_calificacion > 0 && (
                            <div className="rating">
                              <Star size={14} fill="currentColor" />
                              <span>{item.mi_calificacion}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal de detalles */}
      <AnimatePresence>
        {showModal && selectedAnime && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Contenido del modal igual que antes */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;