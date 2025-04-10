import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    default: 'anonymous',
    unique: true
  },
  email: {
    type: String,
    default: 'anonymous@example.com',
    unique: true
  },
  favorites: [{
    id: String,
    name: String,
    artist_name: String,
    duration: Number,
    image: String,
    audio: String,
    shareurl: String,
    source: String
  }],
  history: [{
    id: String,
    name: String,
    artist_name: String,
    duration: Number,
    image: String,
    audio: String,
    shareurl: String,
    source: String,
    playedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  playlists: [{
    name: { 
      type: String, 
      required: true 
    },
    description: String,
    tracks: [{
      id: String,
      name: String,
      artist_name: String,
      duration: Number,
      image: String,
      audio: String,
      shareurl: String,
      source: String
    }],
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Ensure unique username and email
UserSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Add timestamp to username to ensure uniqueness
    this.username = this.username + '_' + Date.now().toString().slice(-4);
  }
  next();
});

const User = mongoose.model('User', UserSchema);

export default User;