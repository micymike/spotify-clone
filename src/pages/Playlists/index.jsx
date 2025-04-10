import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BsMusicNoteList, BsPlus } from 'react-icons/bs';

import { getPlaylists, createPlaylist } from '../../services/api';
import MusicCard from '../../components/MusicCard';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const fetchedPlaylists = await getPlaylists();
        setPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error('Failed to fetch playlists:', error);
      }
    };

    fetchPlaylists();
  }, []);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    try {
      const newPlaylist = await createPlaylist(newPlaylistName);
      setPlaylists([...playlists, newPlaylist]);
      setNewPlaylistName('');
      setIsCreatingPlaylist(false);
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-4">
          <BsMusicNoteList className="text-4xl text-green-500" />
          <h1 className="text-4xl font-bold">Your Playlists</h1>
        </div>

        <button 
          onClick={() => setIsCreatingPlaylist(!isCreatingPlaylist)}
          className="bg-green-500 text-black px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-green-600 transition"
        >
          <BsPlus size={24} />
          <span>Create Playlist</span>
        </button>
      </motion.div>

      {isCreatingPlaylist && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex space-x-4"
        >
          <input 
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Enter playlist name"
            className="flex-grow bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button 
            onClick={handleCreatePlaylist}
            className="bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Create
          </button>
        </motion.div>
      )}

      {playlists.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-400 mt-16"
        >
          <p>You haven't created any playlists yet.</p>
          <p>Click "Create Playlist" to get started!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <h2 className="text-xl font-semibold mb-4">{playlist.name}</h2>
              
              {playlist.tracks && playlist.tracks.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {playlist.tracks.slice(0, 3).map((track) => (
                    <MusicCard 
                      key={track.id} 
                      track={track} 
                      compact 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No tracks in this playlist</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;
