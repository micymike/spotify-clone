import axios from 'axios';
import toast from 'react-hot-toast';

// Configure axios defaults with enhanced error handling
const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
axiosInstance.interceptors.request.use(
  config => {
    // Add any request modifications here
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout - please try again');
    } else if (!error.response) {
      // Network error
      toast.error('Network error - please check your connection');
    }
    return Promise.reject(error);
  }
);

// Simplified error handling
const handleError = (error, config = {}) => {
  const {
    message = 'An error occurred',
    toastMessage = message,
    defaultValue = null,
    throwError = false
  } = config;

  console.error(message, error);
  
  if (toastMessage) {
    toast.error(toastMessage);
  }

  if (throwError) {
    throw error;
  }

  return defaultValue;
};

// Utility to wrap loading state around async operations
const withLoading = async (asyncFn, loadingMessage = 'Loading...') => {
  try {
    const result = await asyncFn();
    return result;
  } catch (error) {
    console.error(loadingMessage, error);
    throw error;
  }
};

// Music search function
export const searchMusic = async (query) => {
  return withLoading(async () => {
    try {
      console.log('Searching for:', query);
      
      // Make API calls to both premium and community endpoints
      const [deezerResults, jamendoResults] = await Promise.all([
        axiosInstance.get('/mimo/premium/search', { params: { query } }),
        axiosInstance.get('/mimo/community/search', { params: { q: query } })
      ]);

      console.log('Search results:', {
        deezer: deezerResults.data.tracks?.length || 0,
        jamendo: jamendoResults.data.tracks?.length || 0
      });

      return {
        deezer: deezerResults.data.tracks || [],
        jamendo: jamendoResults.data.tracks || []
      };
    } catch (error) {
      console.error('Search error details:', error);
      
      return handleError(error, {
        message: 'Search error',
        toastMessage: 'Failed to search music. Please try again.',
        defaultValue: { deezer: [], jamendo: [] }
      });
    }
  }, 'Searching for music...');
};

// Trending tracks function
export const getTrendingTracks = async () => {
  return withLoading(async () => {
    try {
      const response = await axiosInstance.get('/music/trending');
      return response.data.results || [];
    } catch (error) {
      return handleError(error, {
        message: 'Trending tracks error',
        toastMessage: 'Failed to load trending tracks.',
        defaultValue: []
      });
    }
  }, 'Loading trending tracks...');
};

// Favorites functions
export const getFavorites = async () => {
  try {
    const response = await axiosInstance.get('/mimo/favorites');
    return response.data || [];
  } catch (error) {
    return handleError(error, {
      message: 'Get favorites error',
      toastMessage: 'Failed to load favorites.',
      defaultValue: []
    });
  }
};

export const addToFavorites = async (track) => {
  try {
    const response = await axiosInstance.post('/mimo/favorites', { track });
    return response.data || [];
  } catch (error) {
    return handleError(error, {
      message: 'Add to favorites error',
      toastMessage: 'Failed to add to favorites.',
      defaultValue: null
    });
  }
};

export const removeFromFavorites = async (trackId) => {
  try {
    const response = await axiosInstance.delete(`/mimo/favorites/${trackId}`);
    return response.data || [];
  } catch (error) {
    return handleError(error, {
      message: 'Remove from favorites error',
      toastMessage: 'Failed to remove from favorites.',
      defaultValue: null
    });
  }
};

// Listening history functions
export const getHistory = async () => {
  try {
    const response = await axiosInstance.get('/mimo/history');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
};

export const addToHistory = async (track) => {
  try {
    await axiosInstance.post('/mimo/history', { track });
  } catch (error) {
    console.error('Error adding to history:', error);
  }
};

// Playlist functions
export const getPlaylists = async () => {
  try {
    const response = await axiosInstance.get('/mimo/playlists');
    return response.data || [];
  } catch (error) {
    return handleError(error, {
      message: 'Get playlists error',
      toastMessage: 'Failed to load playlists.',
      defaultValue: []
    });
  }
};

export const createPlaylist = async (name, description) => {
  try {
    const response = await axiosInstance.post('/mimo/playlists', { name, description });
    return response.data;
  } catch (error) {
    return handleError(error, {
      message: 'Create playlist error',
      toastMessage: 'Failed to create playlist.',
      defaultValue: null
    });
  }
};

export const addTrackToPlaylist = async (playlistId, track) => {
  try {
    const response = await axiosInstance.post(`/mimo/playlists/${playlistId}/tracks`, { track });
    return response.data;
  } catch (error) {
    return handleError(error, {
      message: 'Add track to playlist error',
      toastMessage: 'Failed to add track to playlist.',
      defaultValue: null
    });
  }
};

export const removeTrackFromPlaylist = async (playlistId, trackId) => {
  try {
    const response = await axiosInstance.delete(`/mimo/playlists/${playlistId}/tracks/${trackId}`);
    return response.data;
  } catch (error) {
    return handleError(error, {
      message: 'Remove track from playlist error',
      toastMessage: 'Failed to remove track from playlist.',
      defaultValue: null
    });
  }
};

export { axiosInstance as axios, handleError, withLoading };
