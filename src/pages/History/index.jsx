import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { getHistory } from '../../services/api';
import MusicCard from '../../components/MusicCard';
import { useDispatch } from 'react-redux';
import { setCurrentTrack, togglePlay } from '../../store/slices/playerSlice';
import PageTransition from '../../components/PageTransition';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadHistory = async () => {
      const historyData = await getHistory();
      setHistory(historyData);
      setLoading(false);
    };
    loadHistory();
  }, []);

  const handlePlayTrack = (track) => {
    dispatch(setCurrentTrack(track));
    dispatch(togglePlay());
  };

  // Group tracks by day
  const groupedHistory = history.reduce((groups, track) => {
    const date = format(new Date(track.playedAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(track);
    return groups;
  }, {});

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
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Your Listening History</h1>
          <p className="text-sm sm:text-base opacity-80">
            Tracks you've enjoyed recently
          </p>
        </motion.div>

        {Object.entries(groupedHistory).map(([date, tracks]) => (
          <section key={date} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {isSameDay(new Date(date), new Date()) 
                  ? 'Today' 
                  : format(new Date(date), 'MMMM d, yyyy')}
              </h2>
              <span className="text-gray-400 text-sm">
                {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {tracks.map((track, index) => (
                <motion.div
                  key={`${track.id}-${track.playedAt}`}
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
          </section>
        ))}

        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg">No listening history yet</p>
            <p className="text-sm mt-2">Start playing some tracks to see them here!</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default History;