import { createSlice } from '@reduxjs/toolkit';
import { addToHistory } from '../../services/api';

// Helper function to normalize track data
const normalizeTrack = (track) => {
  if (!track) return null;
  
  return {
    id: track.id,
    title: track.title || track.name || 'Unknown Title',
    artist: track.artist || track.artist_name || 'Unknown Artist',
    albumArt: track.albumArt || track.image || 'https://via.placeholder.com/150',
    audioUrl: track.audioUrl || track.audio || track.preview,
    duration: track.duration || 0,
    shareUrl: track.shareUrl || track.shareurl || '',
    source: track.source || (track.audio?.includes('jamendo') ? 'community' : 'premium')
  };
};

const initialState = {
  currentTrack: null,
  isPlaying: false,
  queue: [],
  volume: 1,
  progress: 0,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action) => {
      const normalizedTrack = normalizeTrack(action.payload);
      state.currentTrack = normalizedTrack;
      
      // Add to history asynchronously
      if (normalizedTrack) {
        addToHistory(normalizedTrack);
      }
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    addToQueue: (state, action) => {
      state.queue.push(normalizeTrack(action.payload));
    },
    // New action to set entire queue
    setQueue: (state, action) => {
      state.queue = action.payload.map(normalizeTrack);
    },
    nextTrack: (state) => {
      if (state.queue.length > 0) {
        state.currentTrack = state.queue[0];
        state.queue = state.queue.slice(1);
        state.isPlaying = true;
        
        // Add to history asynchronously
        if (state.currentTrack) {
          addToHistory(state.currentTrack);
        }
      }
    },
    previousTrack: (state) => {
      // Basic implementation - could be enhanced with history tracking
      if (state.queue.length > 0) {
        state.currentTrack = state.queue[state.queue.length - 1];
        state.queue = state.queue.slice(0, -1);
        state.isPlaying = true;
      }
    },
    playNext: (state) => {
      if (state.queue.length > 0) {
        state.currentTrack = state.queue[0];
        state.queue = state.queue.slice(1);
        state.isPlaying = true;
      }
    },
    playPrevious: (state) => {
      // Implement previous track logic if needed
    },
  },
});

export const { 
  setCurrentTrack, 
  togglePlay, 
  setVolume, 
  setProgress, 
  addToQueue, 
  nextTrack, 
  previousTrack, 
  playNext,
  setQueue  // Added this export
} = playerSlice.actions;
export default playerSlice.reducer;
