import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';

import { searchMusic } from '../../services/api';
import { searchYouTubeMusic } from '../../services/api';
import { setCurrentTrack, setQueue } from '../../store/slices/playerSlice';

import MusicCard from '../../components/MusicCard';
import SearchInput from '../../components/SearchInput';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    youtube: [],
    deezer: [],
    jamendo: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    try {
      // Perform parallel searches with YouTube as primary
      const [youtubeResults, musicResults] = await Promise.all([
        searchYouTubeMusic(searchQuery),
        searchMusic(searchQuery)
      ]);

      // Combine results, prioritizing YouTube
      const combinedResults = {
        youtube: youtubeResults.youtube || [],
        deezer: musicResults.deezer || [],
        jamendo: musicResults.jamendo || []
      };

      setSearchResults(combinedResults);

      if (
        combinedResults.youtube.length === 0 &&
        combinedResults.deezer.length === 0 &&
        combinedResults.jamendo.length === 0
      ) {
        toast.error('No results found');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to perform search');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayTrack = (track) => {
    dispatch(setCurrentTrack(track));
    dispatch(setQueue([track]));
  };

  // Source color mapping
  const sourceColors = {
    youtube: 'bg-red-600',
    deezer: 'bg-purple-600',
    jamendo: 'bg-green-600'
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Search Music
        </h1>
        
        <SearchInput 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          placeholder="Search songs, artists, albums..."
          loading={isLoading}
        />

        {/* Search Results Sections */}
        {Object.entries(searchResults).map(([source, tracks]) => (
          tracks.length > 0 && (
            <div key={source} className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4 capitalize flex items-center">
                {source} Results
                <span 
                  className={`ml-2 px-2 py-1 rounded-full text-xs text-white ${sourceColors[source]}`}
                >
                  {tracks.length} tracks
                </span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tracks.map((track) => (
                  <MusicCard 
                    key={track.id} 
                    track={{
                      ...track,
                      source: source // Explicitly set source for display
                    }} 
                    onPlay={() => handlePlayTrack(track)}
                  />
                ))}
              </div>
            </div>
          )
        ))}

        {/* No Results State */}
        {!isLoading && Object.values(searchResults).every(arr => arr.length === 0) && (
          <div className="text-center text-gray-400 mt-12">
            <p>Start searching for music...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Search;
