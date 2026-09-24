export type Genre =
  | 'Sci-Fi'
  | 'Drama'
  | 'Thriller'
  | 'Action'
  | 'Crime'
  | 'Mystery'
  | 'Adventure'
  | 'Animation'
  | 'Fantasy'
  | 'Comedy'
  | 'Horror'
  | 'Romance';

export interface Movie {
  id: string;
  title: string;
  year: number;
  director: string;
  genres: Genre[];
  rating: number; // IMDb score 0 - 10
  runtime: number; // in minutes
  synopsis: string;
  keywords: string[];
  cast: string[];
  streamingOn: string[];
  backdropGradient: string; // CSS gradient string for cinematic poster
  accentColor: string;
  youtubeId?: string; // YouTube trailer video ID
  slug: string;
}

export interface UserRating {
  movieId: string;
  rating: number; // 1 to 5
  timestamp: number;
}

export type WatchlistStatus = 'want_to_watch' | 'watching' | 'watched';

export interface WatchlistItem {
  movieId: string;
  status: WatchlistStatus;
  addedAt: number;
  personalNotes?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface CommunityUser {
  id: string;
  name: string;
  handle: string;
  avatarSeed: string;
  tagline: string;
  ratings: Record<string, number>; // movieId -> rating 1-5
}

export interface MatchingFactor {
  factor: string;
  contribution: number; // percentage 0 - 100
  type: 'genre' | 'director' | 'keyword' | 'peer';
}

export interface NeighborSimilarity {
  user: CommunityUser;
  similarity: number; // -1 to 1 (Pearson / Cosine)
  rating: number;
}

export interface RecommendationResult {
  movie: Movie;
  matchScore: number; // 0 - 100%
  contentScore: number; // 0 - 100%
  collaborativeScore: number; // 0 - 100%
  reasons: string[];
  topFactors: MatchingFactor[];
  similarNeighbors: NeighborSimilarity[];
}

export type AlgorithmMode = 'hybrid' | 'content' | 'collaborative';

export interface FilterState {
  searchQuery: string;
  selectedGenre: string;
  minRating: number;
  algorithmMode: AlgorithmMode;
  hybridWeight: number; // 0 (pure collaborative) to 1 (pure content)
  sortBy: 'match' | 'rating' | 'year' | 'runtime';
}
