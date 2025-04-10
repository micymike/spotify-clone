import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import { BsPlayFill, BsPauseFill, BsSkipStartFill, BsSkipEndFill, BsVolumeUp, BsVolumeMute } from 'react-icons/bs';
import { setCurrentTrack, togglePlay, setProgress, nextTrack, previousTrack } from '../../store/slices/playerSlice';
import { addToHistory } from '../../services/api';
import toast from 'react-hot-toast';

const Player = () => {
  const playerRef = useRef(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, queue } = useSelector((state) => state.player);

  useEffect(() => {
    const handleTrackPlay = async () => {
      if (currentTrack) {
        try {
          // Add track to history
          await addToHistory(currentTrack);
        } catch (error) {
          console.error('Failed to add track to history:', error);
        }
      }
    };

    handleTrackPlay();
  }, [currentTrack]);

  const handlePlayPause = () => {
    dispatch(togglePlay());
  };

  const handleProgress = (progress) => {
    dispatch(setProgress(progress.played));
  };

  const handleEnded = async () => {
    if (currentTrack) {
      await addToHistory(currentTrack);
    }
    
    if (queue.length > 0) {
      dispatch(nextTrack());
    } else {
      dispatch(togglePlay());
    }
  };

  const handlePrevious = () => {
    dispatch(previousTrack());
  };

  const handleNext = () => {
    dispatch(nextTrack());
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-black p-3 sm:p-4 backdrop-blur-lg border-t border-gray-800"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        {/* Track Info */}
        <div className="flex items-center w-full sm:w-1/3 min-w-0">
          <AnimatePresence mode="wait">
            {currentTrack && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-3 min-w-0"
              >
                <img
                  src={currentTrack.albumArt}
                  alt={currentTrack.title}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-md"
                />
                <div className="min-w-0">
                  <h3 className="text-white font-medium text-sm truncate">{currentTrack.title}</h3>
                  <p className="text-gray-400 text-xs truncate">{currentTrack.artist}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 sm:space-x-6 w-full sm:w-1/3">
          <button
            onClick={handlePrevious}
            className="text-gray-400 hover:text-white transition p-2"
          >
            <BsSkipStartFill size={20} />
          </button>
          <button
            onClick={handlePlayPause}
            className="bg-white rounded-full p-3 hover:scale-105 transition"
          >
            {isPlaying ? <BsPauseFill size={24} /> : <BsPlayFill size={24} />}
          </button>
          <button
            onClick={handleNext}
            className="text-gray-400 hover:text-white transition p-2"
          >
            <BsSkipEndFill size={20} />
          </button>
        </div>

        {/* Volume and Streak */}
        <div className="flex items-center justify-end space-x-4 w-full sm:w-1/3">
          <div className="hidden sm:flex items-center space-x-2">
            <button onClick={toggleMute} className="text-gray-400 hover:text-white">
              {isMuted ? <BsVolumeMute size={20} /> : <BsVolumeUp size={20} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 accent-green-500"
            />
          </div>
        </div>

        {currentTrack && (
          <ReactPlayer
            ref={playerRef}
            url={currentTrack.audioUrl}
            playing={isPlaying}
            volume={isMuted ? 0 : volume}
            onProgress={handleProgress}
            onEnded={handleEnded}
            width={0}
            height={0}
          />
        )}
      </div>
    </motion.div>
  );
};

export default Player;
