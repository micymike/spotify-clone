import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  playlists: [],
  currentPlaylist: null,
  isCreatingPlaylist: false,
};

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setPlaylists: (state, action) => {
      state.playlists = action.payload;
    },
    setCurrentPlaylist: (state, action) => {
      state.currentPlaylist = action.payload;
    },
    addPlaylist: (state, action) => {
      state.playlists.push(action.payload);
    },
    updatePlaylist: (state, action) => {
      const index = state.playlists.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.playlists[index] = action.payload;
        if (state.currentPlaylist?._id === action.payload._id) {
          state.currentPlaylist = action.payload;
        }
      }
    },
    deletePlaylist: (state, action) => {
      state.playlists = state.playlists.filter(p => p._id !== action.payload);
      if (state.currentPlaylist?._id === action.payload) {
        state.currentPlaylist = null;
      }
    },
    setCreatingPlaylist: (state, action) => {
      state.isCreatingPlaylist = action.payload;
    },
  },
});

export const {
  setPlaylists,
  setCurrentPlaylist,
  addPlaylist,
  updatePlaylist,
  deletePlaylist,
  setCreatingPlaylist,
} = playlistSlice.actions;

export default playlistSlice.reducer;
