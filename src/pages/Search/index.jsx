import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { searchMusic } from '../../services/api';
import { setCurrentTrack, togglePlay } from '../../store/slices/playerSlice';
import MusicCard from '../../components/MusicCard';
import { useDebounce } from '../../hooks/useDebounce';
import PageTransition from '../../components/PageTransition';
import toast from 'react-hot-toast';
import { BsSearch } from 'react-icons/bs';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ deezer: [], jamendo: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  
  const debouncedSearch = useDebounce(async (term) => {
    if (!term.trim()) {
      setSearchResults({ deezer: [], jamendo: [] });
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log('Starting search for term:', term);
      
      const results = await searchMusic(term);
      console.log('Raw search results:', results);

      // Validate and normalize results
      const deezerTracks = Array.isArray(results.deezer) ? results.deezer : [];
      const jamendoTracks = Array.isArray(results.jamendo) ? results.jamendo : [];

      // Detailed logging of tracks
      console.log('Deezer tracks:', deezerTracks.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artist_name
      })));
      console.log('Jamendo tracks:', jamendoTracks.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artist_name
      })));

      setSearchResults({
        deezer: deezerTracks,
        jamendo: jamendoTracks
      });

      // Show toast if no results found
      if (deezerTracks.length === 0 && jamendoTracks.length === 0) {
        toast.error(`No results found for "${term}"`, {
          duration: 3000,
          position: 'top-center'
        });
      }
    } catch (error) {
      // Comprehensive error logging
      console.error('Comprehensive search error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response object'
      });

      // Set user-friendly error message
      const errorMessage = error.response?.data?.message || 
        error.message || 
        'An unexpected error occurred while searching';

      setError(errorMessage);
      
      // Show error toast
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center'
      });

      // Reset search results
      setSearchResults({ deezer: [], jamendo: [] });
    } finally {
      setLoading(false);
    }
  }, 500);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handlePlayTrack = (track) => {
    dispatch(setCurrentTrack(track));
    dispatch(togglePlay());
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 min-h-screen bg-gray-900">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-6">Search Music</h1>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BsSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search for songs, artists..."
              className="w-full pl-10 pr-4 py-3 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-10">
            <p className="text-xl font-semibold mb-2">Search Error</p>
            <p>{error}</p>
          </div>
        ) : searchTerm && searchResults.deezer.length === 0 && searchResults.jamendo.length === 0 ? (
          <div className="text-gray-400 text-center py-10">
            No results found for "{searchTerm}"
          </div>
        ) : searchTerm ? (
          <div className="space-y-8">
            {searchResults.deezer.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 max-w-6xl mx-auto">Premium Music</h2>
                <motion.div 
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-6xl mx-auto"
                >
                  {searchResults.deezer.map((track) => (
                    <motion.div key={`deezer-${track.id}`} variants={item}>
                      <MusicCard
                        track={track}
                        onPlay={() => handlePlayTrack(track)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            )}

            {searchResults.jamendo.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 max-w-6xl mx-auto">Community Music</h2>
                <motion.div 
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-6xl mx-auto"
                >
                  {searchResults.jamendo.map((track) => (
                    <motion.div key={`jamendo-${track.id}`} variants={item}>
                      <MusicCard
                        track={track}
                        onPlay={() => handlePlayTrack(track)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-gray-400 mb-4">Start typing to search for music</p>
            <p className="text-gray-500">Search across premium and community tracks</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Search;
