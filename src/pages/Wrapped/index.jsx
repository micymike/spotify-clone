import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getHistory, getFavorites } from '../../services/api';
import { BsPlayFill, BsHeart, BsFire, BsCalendarCheck } from 'react-icons/bs';
import PageTransition from '../../components/PageTransition';

const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.05 }}
    className={`p-6 rounded-xl ${gradient} text-white`}
  >
    <Icon size={32} className="mb-4" />
    <p className="text-sm opacity-80">{label}</p>
    <h3 className="text-3xl font-bold mt-1">{value}</h3>
  </motion.div>
);

const Wrapped = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [history, favorites] = await Promise.all([
          getHistory(),
          getFavorites()
        ]);

        // Calculate statistics
        const totalPlays = history.length;
        const uniqueTracks = new Set(history.map(track => track.id)).size;
        const favoriteArtists = history.reduce((acc, track) => {
          acc[track.artist] = (acc[track.artist] || 0) + 1;
          return acc;
        }, {});
        const topArtists = Object.entries(favoriteArtists)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5);

        setStats({
          totalPlays,
          uniqueTracks,
          topArtists,
          favorites: favorites.length
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

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
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 sm:p-8 text-white"
        >
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">Your MiMo Wrapped</h1>
          <p className="text-sm sm:text-base opacity-80">
            Discover your listening trends and favorites
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BsPlayFill}
            label="Total Plays"
            value={stats.totalPlays}
            gradient="bg-gradient-to-r from-green-500 to-emerald-600"
          />
          <StatCard
            icon={BsHeart}
            label="Favorites"
            value={stats.favorites}
            gradient="bg-gradient-to-r from-red-500 to-pink-600"
          />
          <StatCard
            icon={BsCalendarCheck}
            label="Unique Tracks"
            value={stats.uniqueTracks}
            gradient="bg-gradient-to-r from-blue-500 to-indigo-600"
          />
        </div>

        {/* Top Artists */}
        {stats.topArtists.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Your Top Artists</h2>
            <div className="space-y-4">
              {stats.topArtists.map(([artist, plays], index) => (
                <motion.div
                  key={artist}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-gray-500">
                      #{index + 1}
                    </span>
                    <span className="text-white">{artist}</span>
                  </div>
                  <span className="text-gray-400">{plays} plays</span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </PageTransition>
  );
};

export default Wrapped;
