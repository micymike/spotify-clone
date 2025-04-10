export interface JamendoTrack {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  url: string;
}

export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
}

export interface SearchResults {
  youtube: YouTubeVideo[];
  jamendo: JamendoTrack[];
}

export interface ApiError {
  message: string;
  status?: number;
}
