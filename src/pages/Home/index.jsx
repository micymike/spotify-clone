import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { getTrendingTracks, getFavorites, getHistory } from '../../services/api';
import { setCurrentTrack, togglePlay } from '../../store/slices/playerSlice';
import MusicCard from '../../components/MusicCard';
import PageTransition from '../../components/PageTransition';

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

const Home = () => {
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trending, favs, history] = await Promise.all([
          getTrendingTracks(),
          getFavorites(),
          getHistory()
        ]);

        setTrendingTracks(trending || []);
        setFavorites(favs || []);
        setRecentlyPlayed((history || []).slice(0, 10));
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePlayTrack = (track) => {
    dispatch(setCurrentTrack(track));
    dispatch(togglePlay());
  };

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
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-black"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to MiMo Music Hub</h1>
          <p className="text-sm sm:text-base opacity-80">Your personal music companion</p>
        </motion.div>

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Recently Played</h2>
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {recentlyPlayed.map((item) => (
                <motion.div key={`recent-${item.track.id}`} variants={item}>
                  <MusicCard
                    track={item.track}
                    onPlay={() => handlePlayTrack(item.track)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Your Favorites</h2>
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {favorites.map((track) => (
                <motion.div key={`favorite-${track.id}`} variants={item}>
                  <MusicCard
                    track={track}
                    onPlay={() => handlePlayTrack(track)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Trending Now */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Trending Now</h2>
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {trendingTracks.map((track) => (
              <motion.div key={`trending-${track.id}`} variants={item}>
                <MusicCard
                  track={track}
                  onPlay={() => handlePlayTrack(track)}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Home;
