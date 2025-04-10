import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import rateLimit from 'express-rate-limit';
import User from './src/models/User.js';
import { errorHandler, APIError } from './src/middleware/errorHandler.js';

dotenv.config();

// API keys from environment variables
const RAPIDAPI_KEY = process.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.VITE_RAPIDAPI_HOST;
const JAMENDO_CLIENT_ID = process.env.VITE_JAMENDO_CLIENT_ID;

const app = express();

app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: { message: 'Too many requests from this IP, please try again later.' } }
});

// Apply rate limiting to all routes
app.use(limiter);

// More strict rate limiting for search endpoints
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: { message: 'Search limit exceeded, please try again later.' } }
});

// MongoDB Connection with improved options
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 50,
  retryWrites: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // Change to false to only create session when something is stored
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 14 * 24 * 60 * 60, // Session TTL of 14 days
    autoRemove: 'interval',
    autoRemoveInterval: 10 // Remove expired sessions every 10 minutes
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
    sameSite: 'lax' // Changed from 'strict' to improve compatibility
  }
}));

// Simplified user creation middleware
const ensureUser = async (req, res, next) => {
  try {
    // Create a generic user if no user exists
    const newUser = await User.findOne({ username: 'anonymous' }) || 
      await User.create({ 
        username: 'anonymous',
        email: 'anonymous@example.com',
        isAnonymous: true
      });
    
    req.user = newUser;
    next();
  } catch (error) {
    console.error('User creation error:', error);
    next(new APIError('Failed to create user', 500));
  }
};

app.use(ensureUser);

// Premium tracks endpoint
app.get('/api/mimo/premium/search', searchLimiter, async (req, res, next) => {
  try {
    const { query } = req.query;
    console.log('Searching premium tracks for:', query);
    
    // Fetch from Deezer API
    const options = {
      method: 'GET',
      url: 'https://deezerdevs-deezer.p.rapidapi.com/search',
      params: { q: query },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    };

    const response = await axios.request(options);
    
    // Format tracks
    const tracks = response.data.data.map(track => ({
      id: `deezer_${track.id}`,
      name: track.title,
      artist_name: track.artist.name,
      duration: track.duration,
      image: track.album.cover_medium,
      audio: track.preview,
      shareurl: track.link,
      source: 'premium'
    }));

    console.log(`Found ${tracks.length} premium tracks`);
    res.json({ tracks });
  } catch (error) {
    console.error('Premium search error:', error.message);
    next(new APIError('Failed to search premium tracks', 500, { 
      originalError: error.message 
    }));
  }
});

// Community tracks endpoint
app.get('/api/mimo/community/search', searchLimiter, async (req, res, next) => {
  try {
    const { q: query } = req.query;
    console.log('Searching community tracks for:', query);
    
    // Fetch from Jamendo API
    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: 20,
        search: query,
        include: 'musicinfo'
      }
    });
    
    // Format tracks
    const tracks = response.data.results.map(track => ({
      id: `jamendo_${track.id}`,
      name: track.name,
      artist_name: track.artist_name,
      duration: track.duration,
      image: track.image,
      audio: track.audio,
      shareurl: track.shareurl,
      source: 'community'
    }));

    console.log(`Found ${tracks.length} community tracks`);
    res.json({ tracks });
  } catch (error) {
    console.error('Community search error:', error.message);
    next(new APIError('Failed to search community tracks', 500, { 
      originalError: error.message 
    }));
  }
});

// Music API endpoints
app.get('/api/music/trending', async (req, res, next) => {
  try {
    console.log('Fetching trending tracks...');
    
    // Fetch trending tracks from both Deezer and Jamendo
    const [deezerResponse, jamendoResponse] = await Promise.all([
      axios.request({
        method: 'GET',
        url: 'https://deezerdevs-deezer.p.rapidapi.com/chart/0/tracks',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      }),
      axios.get('https://api.jamendo.com/v3.0/tracks', {
        params: {
          client_id: JAMENDO_CLIENT_ID,
          format: 'json',
          limit: 20,
          boost: 'popularity_total',
          include: 'musicinfo'
        }
      })
    ]);

    // Format tracks
    const deezerTracks = deezerResponse.data.data.map(track => ({
      id: `deezer_${track.id}`,
      name: track.title,
      artist_name: track.artist.name,
      duration: track.duration,
      image: track.album.cover_medium,
      audio: track.preview,
      shareurl: track.link,
      source: 'premium'
    }));

    const jamendoTracks = jamendoResponse.data.results.map(track => ({
      id: `jamendo_${track.id}`,
      name: track.name,
      artist_name: track.artist_name,
      duration: track.duration,
      image: track.image,
      audio: track.audio,
      shareurl: track.shareurl,
      source: 'community'
    }));

    // Combine and shuffle tracks
    const allTracks = [...deezerTracks, ...jamendoTracks]
      .sort(() => 0.5 - Math.random())
      .slice(0, 20);

    console.log(`Returning ${allTracks.length} trending tracks`);
    res.json({ results: allTracks });
  } catch (error) {
    console.error('Trending tracks error:', error.message);
    next(new APIError('Failed to load trending tracks', 500, { 
      originalError: error.message 
    }));
  }
});

// Listening History endpoints
app.get('/api/mimo/history', async (req, res, next) => {
  try {
    const user = req.user;
    res.json(user.history || []);
  } catch (error) {
    next(new APIError('Failed to get history', 500));
  }
});

app.post('/api/mimo/history', async (req, res, next) => {
  try {
    const { track } = req.body;
    const user = req.user;
    
    // Add track to history if not already present
    if (!user.history) user.history = [];
    
    const existingTrackIndex = user.history.findIndex(
      historyTrack => historyTrack.id === track.id
    );
    
    if (existingTrackIndex === -1) {
      user.history.unshift(track);
      // Limit history to last 50 tracks
      user.history = user.history.slice(0, 50);
      await user.save();
    }
    
    res.json(user.history);
  } catch (error) {
    next(new APIError('Failed to add to history', 500));
  }
});

// Favorites endpoints
app.get('/api/mimo/favorites', async (req, res, next) => {
  try {
    const user = req.user;
    res.json(user.favorites || []);
  } catch (error) {
    next(new APIError('Failed to get favorites', 500));
  }
});

app.post('/api/mimo/favorites', async (req, res, next) => {
  try {
    const { track } = req.body;
    const user = req.user;
    
    if (!user.favorites) user.favorites = [];
    
    const existingTrackIndex = user.favorites.findIndex(
      favTrack => favTrack.id === track.id
    );
    
    if (existingTrackIndex === -1) {
      user.favorites.push(track);
      await user.save();
      res.json(user.favorites);
    } else {
      res.json(user.favorites);
    }
  } catch (error) {
    next(new APIError('Failed to add to favorites', 500));
  }
});

app.delete('/api/mimo/favorites/:trackId', async (req, res, next) => {
  try {
    const { trackId } = req.params;
    const user = req.user;
    
    if (user.favorites) {
      user.favorites = user.favorites.filter(track => track.id !== trackId);
      await user.save();
    }
    
    res.json(user.favorites || []);
  } catch (error) {
    next(new APIError('Failed to remove from favorites', 500));
  }
});

// Playlist endpoints
app.get('/api/mimo/playlists', async (req, res, next) => {
  try {
    const user = req.user;
    res.json(user.playlists);
  } catch (error) {
    next(new APIError('Failed to get playlists', 500));
  }
});

app.post('/api/mimo/playlists', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const user = req.user;

    user.playlists.push({
      name,
      description,
      tracks: []
    });

    await user.save();
    res.json(user.playlists[user.playlists.length - 1]);
  } catch (error) {
    next(new APIError('Failed to create playlist', 500));
  }
});

app.put('/api/mimo/playlists/:playlistId', async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const { name, description, tracks } = req.body;
    const user = req.user;

    const playlist = user.playlists.id(playlistId);
    if (!playlist) {
      throw new APIError('Playlist not found', 404);
    }

    if (name) playlist.name = name;
    if (description) playlist.description = description;
    if (tracks) playlist.tracks = tracks;
    playlist.updatedAt = new Date();

    await user.save();
    res.json(playlist);
  } catch (error) {
    next(error instanceof APIError ? error : new APIError('Failed to update playlist', 500));
  }
});

app.delete('/api/mimo/playlists/:playlistId', async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const user = req.user;

    user.playlists = user.playlists.filter(p => p._id.toString() !== playlistId);
    await user.save();
    
    res.json({ success: true });
  } catch (error) {
    next(new APIError('Failed to delete playlist', 500));
  }
});

app.post('/api/mimo/playlists/:playlistId/tracks', async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const { track } = req.body;
    const user = req.user;

    const playlist = user.playlists.id(playlistId);
    if (!playlist) {
      throw new APIError('Playlist not found', 404);
    }

    if (!playlist.tracks.some(t => t.id === track.id)) {
      playlist.tracks.push(track);
      playlist.updatedAt = new Date();
      await user.save();
    }

    res.json(playlist);
  } catch (error) {
    next(error instanceof APIError ? error : new APIError('Failed to add track to playlist', 500));
  }
});

app.delete('/api/mimo/playlists/:playlistId/tracks/:trackId', async (req, res, next) => {
  try {
    const { playlistId, trackId } = req.params;
    const user = req.user;

    const playlist = user.playlists.id(playlistId);
    if (!playlist) {
      throw new APIError('Playlist not found', 404);
    }

    playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);
    playlist.updatedAt = new Date();
    await user.save();

    res.json(playlist);
  } catch (error) {
    next(error instanceof APIError ? error : new APIError('Failed to remove track from playlist', 500));
  }
});

// Custom error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MiMo Music Hub server running on port ${PORT}`);
});
