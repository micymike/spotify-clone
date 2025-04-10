import React from 'react';
import { useSelector } from 'react-redux';
import { FaPlay, FaPause, FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { addToFavorites, removeFromFavorites } from '../services/api';

const MusicCard = ({ track, onPlay }) => {
  const { currentTrack, isPlaying } = useSelector(state => state.player);
  const authState = useSelector(state => state.auth);
  const isCurrentTrack = currentTrack && currentTrack.id === track.id;
  const isAnonymous = authState?.user?.isAnonymous || true; // Default to true if auth state not loaded

  // Default image if none provided
  const defaultImage = 'https://placehold.co/400x400/1e293b/ffffff?text=No+Image';
  
  const handleFavoriteClick = async () => {
    try {
      if (isAnonymous) {
        toast.error('Please log in to use favorites');
        return;
      }
      
      if (track.isFavorite) {
        await removeFromFavorites(track.id);
        toast.success('Removed from favorites');
      } else {
        await addToFavorites(track);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Favorite error:', error);
      toast.error('Failed to update favorites');
    }
  };

  // Determine source badge text and color
  const sourceBadges = {
    youtube: { text: 'YouTube', color: 'bg-red-600' },
    premium: { text: 'Premium', color: 'bg-purple-600' },
    deezer: { text: 'Deezer', color: 'bg-purple-600' },
    community: { text: 'Community', color: 'bg-green-600' },
    jamendo: { text: 'Jamendo', color: 'bg-green-600' }
  };

  const sourceBadge = sourceBadges[track.source] || { 
    text: 'Unknown', 
    color: 'bg-gray-600' 
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:bg-gray-700 transition-colors duration-300">
      <div className="relative group">
        <img 
          src={track.image || defaultImage} 
          alt={track.name} 
          className="w-full aspect-square object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => onPlay(track)}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 transform transition-transform duration-300 hover:scale-110"
          >
            {isCurrentTrack && isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
          </button>
        </div>
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${sourceBadge.color}`}>
            {sourceBadge.text}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">{track.name}</h3>
            <p className="text-gray-400 text-sm truncate">{track.artist_name}</p>
          </div>
          <button 
            onClick={handleFavoriteClick}
            className="text-gray-400 hover:text-red-500 transition-colors ml-2"
            aria-label={track.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {track.isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicCard;
