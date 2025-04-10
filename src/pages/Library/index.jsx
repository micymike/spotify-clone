import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFavorites } from '../../services/api';
import MusicCard from '../../components/MusicCard';
import { useDispatch } from 'react-redux';
import { setCurrentTrack, togglePlay } from '../../store/slices/playerSlice';
import { BsFilter, BsGrid, BsList, BsSortDown, BsSortUp } from 'react-icons/bs';
import PageTransition from '../../components/PageTransition';

const Library = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('dateAdded'); // 'dateAdded', 'title', 'artist'
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all'); // 'all', 'premium', 'community'
  const dispatch = useDispatch();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favs = await getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track) => {
    dispatch(setCurrentTrack(track));
    dispatch(togglePlay());
  };

  const sortedAndFilteredFavorites = favorites
    .filter(track => filterType === 'all' || track.type === filterType)
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'title':
          return order * a.title.localeCompare(b.title);
        case 'artist':
          return order * a.artist.localeCompare(b.artist);
        case 'dateAdded':
        default:
          return order * (new Date(b.addedAt) - new Date(a.addedAt));
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl p-6 sm:p-8 text-white"
        >
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">Your Library</h1>
          <p className="text-sm sm:text-base opacity-80">
            {favorites.length} favorite {favorites.length === 1 ? 'track' : 'tracks'}
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg ${view === 'grid' ? 'bg-green-500 text-black' : 'text-gray-400'}`}
            >
              <BsGrid size={20} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg ${view === 'list' ? 'bg-green-500 text-black' : 'text-gray-400'}`}
            >
              <BsList size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="premium">Premium</option>
              <option value="community">Community</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="dateAdded">Date Added</option>
              <option value="title">Title</option>
              <option value="artist">Artist</option>
            </select>

            <button
              onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-lg text-gray-400 hover:text-white"
            >
              {sortOrder === 'asc' ? <BsSortUp size={20} /> : <BsSortDown size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {sortedAndFilteredFavorites.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MusicCard
                    track={track}
                    onPlay={() => handlePlayTrack(track)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {sortedAndFilteredFavorites.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-800/80 cursor-pointer"
                  onClick={() => handlePlayTrack(track)}
                >
                  <img
                    src={track.albumArt}
                    alt={track.title}
                    className="w-12 h-12 rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{track.title}</h3>
                    <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                  </div>
                  {track.type === 'premium' && (
                    <span className="px-2 py-1 text-xs bg-green-500 text-black rounded-full">
                      Premium
                    </span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg">No favorites yet</p>
            <p className="text-sm mt-2">Start adding some tracks to your library!</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Library;
