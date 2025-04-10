import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { BsPlayFill, BsPauseFill, BsHeart, BsHeartFill } from 'react-icons/bs';
import { toggleFavorite, getFavorites } from '../../services/api';

const MusicCard = ({ track, onPlay }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { currentTrack, isPlaying } = useSelector((state) => state.player);
  const isCurrentTrack = currentTrack?.id === track.id;

  useEffect(() => {
    const checkFavorite = async () => {
      const favorites = await getFavorites();
      setIsFavorite(favorites.some(f => f.id === track.id));
    };
    checkFavorite();
  }, [track.id]);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    const result = await toggleFavorite(track);
    setIsFavorite(result);
  };

  // Handle different track data structures
  const title = track.title || track.name || 'Unknown Title';
  const artist = track.artist || track.artist_name || 'Unknown Artist';
  const albumArt = track.albumArt || track.image || 'https://via.placeholder.com/150';
  const source = track.source || (track.audio?.includes('jamendo') ? 'community' : 'premium');

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 hover:bg-gray-800/80 transition cursor-pointer group touch-none"
      onClick={onPlay}
    >
      <div className="relative aspect-square mb-3">
        <img 
          src={albumArt} 
          alt={title}
          className="w-full h-full object-cover rounded-md"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
          <button
            className={`p-3 rounded-full 
              ${isCurrentTrack && isPlaying ? 'bg-green-500' : 'bg-green-500'} 
              shadow-lg transform transition-transform group-hover:scale-105`}
          >
            {isCurrentTrack && isPlaying ? (
              <BsPauseFill className="text-black w-6 h-6 sm:w-8 sm:h-8" />
            ) : (
              <BsPlayFill className="text-black w-6 h-6 sm:w-8 sm:h-8" />
            )}
          </button>
        </div>
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
        >
          {isFavorite ? (
            <BsHeartFill className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <BsHeart className="text-white w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
        {source === 'premium' && (
          <span className="absolute top-2 left-2 px-2 py-1 text-xs bg-green-500 text-black rounded-full">
            Premium
          </span>
        )}
      </div>

      <div className="space-y-1 min-h-[3rem]">
        <h3 className="text-white font-medium text-sm sm:text-base line-clamp-1">{title}</h3>
        <p className="text-gray-400 text-xs sm:text-sm line-clamp-1">{artist}</p>
      </div>
    </motion.div>
  );
};

export default MusicCard;
