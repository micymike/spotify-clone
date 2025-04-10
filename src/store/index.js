import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './slices/playerSlice';
import playlistReducer from './slices/playlistSlice';
import loadingReducer from './slices/loadingSlice';

export const store = configureStore({
  reducer: {
    player: playerReducer,
    playlist: playlistReducer,
    loading: loadingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
