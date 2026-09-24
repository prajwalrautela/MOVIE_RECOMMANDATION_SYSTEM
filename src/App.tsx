import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Film,
  Search,
  Sparkles,
  SlidersHorizontal,
  Bookmark,
  Compass,
  Star,
  Layers,
  ArrowUpDown,
  Filter,
  Check,
  RefreshCw
} from 'lucide-react';

import {
  Movie,
  WatchlistItem,
  WatchlistStatus,
  AlgorithmMode,
  RecommendationResult
} from './types/movie';
import { MOVIES_DATABASE, ALL_GENRES } from './data/movies';
import { PRESET_TASTE_PROFILES } from './data/communityUsers';
import { generateRecommendations } from './services/recommendationEngine';

import { Navbar } from './components/Navbar';
import { HeroSpotlight } from './components/HeroSpotlight';
import { MovieCard } from './components/MovieCard';
import { WatchlistDashboard } from './components/WatchlistDashboard';
import { QuickRateDeck } from './components/QuickRateDeck';
import { GenreCompass } from './components/GenreCompass';
import { AlgorithmLabModal } from './components/AlgorithmLabModal';
import { MovieDetailModal } from './components/MovieDetailModal';
import { TrailerModal } from './components/TrailerModal';
import { Toast, ToastMessage } from './components/Toast';

// Default initial ratings seed for rich first impression
const INITIAL_RATINGS_SEED: Record<string, number> = {
  'interstellar-2014': 5,
  'inception-2010': 5,
  'blade-runner-2049-2017': 5,
  'arrival-2016': 4,
};

const INITIAL_WATCHLIST_SEED: WatchlistItem[] = [
  {
    movieId: 'dune-part-two-2024',
    status: 'want_to_watch',
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    personalNotes: 'IMAX screening on weekend',
    priority: 'high',
  },
  {
    movieId: 'oppenheimer-2023',
    status: 'watching',
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    personalNotes: 'Watch second half tonight',
  },
  {
    movieId: 'the-dark-knight-2008',
    status: 'watched',
    addedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    personalNotes: 'All-time classic villain performance',
  },
];

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'discover' | 'watchlist' | 'rate' | 'compass'>('discover');

  // Persistence: User Ratings
  const [userRatings, setUserRatings] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('cinematch_ratings');
      return saved ? JSON.parse(saved) : INITIAL_RATINGS_SEED;
    } catch {
      return INITIAL_RATINGS_SEED;
    }
  });

  // Persistence: Watchlist
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('cinematch_watchlist');
      return saved ? JSON.parse(saved) : INITIAL_WATCHLIST_SEED;
    } catch {
      return INITIAL_WATCHLIST_SEED;
    }
  });

  // Persistence: Genre Mood Preferences
  const [genrePreferences, setGenrePreferences] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('cinematch_genre_prefs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Algorithm configuration
  const [algorithmMode, setAlgorithmMode] = useState<AlgorithmMode>('hybrid');
  const [hybridWeight, setHybridWeight] = useState<number>(0.55); // 55% content, 45% collab

  // Discovery Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'year' | 'runtime'>('match');

  // Modals & Drawers
  const [isAlgorithmLabOpen, setIsAlgorithmLabOpen] = useState(false);
  const [selectedMovieForDetail, setSelectedMovieForDetail] = useState<Movie | null>(null);
  const [selectedMovieForTrailer, setSelectedMovieForTrailer] = useState<Movie | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('cinematch_ratings', JSON.stringify(userRatings));
  }, [userRatings]);

  useEffect(() => {
    localStorage.setItem('cinematch_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('cinematch_genre_prefs', JSON.stringify(genrePreferences));
  }, [genrePreferences]);

  const addToast = (text: string, type: ToastMessage['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev.slice(-3), { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const moviesMap = useMemo(() => {
    const map = new Map<string, Movie>();
    for (const movie of MOVIES_DATABASE) {
      map.set(movie.id, movie);
    }
    return map;
  }, []);

  // Compute live recommendations whenever ratings, preferences, or algorithm settings change
  const allRecommendations = useMemo(() => {
    return generateRecommendations(userRatings, genrePreferences, algorithmMode, hybridWeight);
  }, [userRatings, genrePreferences, algorithmMode, hybridWeight]);

  const recResultMap = useMemo(() => {
    const map = new Map<string, RecommendationResult>();
    for (const rec of allRecommendations) {
      map.set(rec.movie.id, rec);
    }
    return map;
  }, [allRecommendations]);

  // Top #1 recommendation for Spotlight
  const topSpotlightRec = useMemo(() => {
    if (allRecommendations.length === 0) return null;
    return allRecommendations[0];
  }, [allRecommendations]);

  // Filtered and sorted movie recommendations for feed
  const filteredRecommendations = useMemo(() => {
    return allRecommendations.filter(rec => {
      const movie = rec.movie;
      if (selectedGenre !== 'all' && !movie.genres.includes(selectedGenre as any)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = movie.title.toLowerCase().includes(q);
        const matchDirector = movie.director.toLowerCase().includes(q);
        const matchKeyword = movie.keywords.some(k => k.toLowerCase().includes(q));
        const matchCast = movie.cast.some(c => c.toLowerCase().includes(q));
        if (!matchTitle && !matchDirector && !matchKeyword && !matchCast) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.movie.rating - a.movie.rating;
      if (sortBy === 'year') return b.movie.year - a.movie.year;
      if (sortBy === 'runtime') return b.movie.runtime - a.movie.runtime;
      return b.matchScore - a.matchScore;
    });
  }, [allRecommendations, selectedGenre, searchQuery, sortBy]);

  // Watchlist lookup helper
  const getWatchlistStatus = (movieId: string): WatchlistStatus | undefined => {
    const item = watchlist.find(w => w.movieId === movieId);
    return item?.status;
  };

  // Handlers
  const handleRateMovie = (movieId: string, rating: number) => {
    setUserRatings(prev => ({
      ...prev,
      [movieId]: rating,
    }));
    const movie = moviesMap.get(movieId);
    addToast(`Rated "${movie?.title || 'Movie'}" ${rating}★ — taste vector updated`, 'rating');
  };

  const handleToggleWatchlist = (movieId: string, desiredStatus?: WatchlistStatus) => {
    const movie = moviesMap.get(movieId);
    const existing = watchlist.find(w => w.movieId === movieId);

    if (existing) {
      setWatchlist(prev => prev.filter(w => w.movieId !== movieId));
      addToast(`Removed "${movie?.title}" from watchlist`, 'info');
    } else {
      const newItem: WatchlistItem = {
        movieId,
        status: desiredStatus || 'want_to_watch',
        addedAt: Date.now(),
      };
      setWatchlist(prev => [newItem, ...prev]);
      addToast(`Added "${movie?.title}" to watchlist`, 'success');
    }
  };

  const handleUpdateWatchlistStatus = (movieId: string, status: WatchlistStatus) => {
    setWatchlist(prev =>
      prev.map(item => (item.movieId === movieId ? { ...item, status } : item))
    );
    const movie = moviesMap.get(movieId);
    addToast(`Updated status for "${movie?.title}" to ${status.replace(/_/g, ' ')}`, 'info');
  };

  const handleRemoveFromWatchlist = (movieId: string) => {
    setWatchlist(prev => prev.filter(w => w.movieId !== movieId));
    const movie = moviesMap.get(movieId);
    addToast(`Removed "${movie?.title}" from watchlist`, 'info');
  };

  const handleUpdateWatchlistNotes = (movieId: string, notes: string) => {
    setWatchlist(prev =>
      prev.map(item => (item.movieId === movieId ? { ...item, personalNotes: notes } : item))
    );
    addToast('Watchlist note updated', 'success');
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = PRESET_TASTE_PROFILES.find(p => p.id === presetId);
    if (!preset) return;
    setUserRatings(preset.sampleRatings);
    addToast(`Applied preset: ${preset.title}`, 'success');
  };

  const handleClearAllRatings = () => {
    setUserRatings({});
    addToast('All personal movie ratings cleared', 'info');
  };

  const handleUpdateGenrePreference = (genre: string, value: number) => {
    setGenrePreferences(prev => ({
      ...prev,
      [genre]: value,
    }));
  };

  const handleResetGenrePreferences = () => {
    setGenrePreferences({});
    addToast('Genre sliders reset to neutral', 'info');
  };

  const handleApplyMood = (moodId: string) => {
    const moods: Record<string, Record<string, number>> = {
      cosmic_mindbender: { 'Sci-Fi': 1.0, 'Mystery': 0.8, 'Adventure': 0.7 },
      dark_neon_noir: { 'Crime': 1.0, 'Thriller': 0.9, 'Drama': 0.6 },
      poetic_indie: { 'Animation': 0.9, 'Fantasy': 0.8, 'Comedy': 0.6, 'Romance': 0.5 },
      visceral_action: { 'Action': 1.0, 'Thriller': 0.7, 'Sci-Fi': 0.6 },
    };
    if (moods[moodId]) {
      setGenrePreferences(moods[moodId]);
      addToast('Mood vector applied', 'success');
    }
  };

  const unratedMovies = useMemo(() => {
    return MOVIES_DATABASE.filter(m => !(m.id in userRatings));
  }, [userRatings]);

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 flex flex-col">
      {/* Top Bar Contract Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        watchlistCount={watchlist.length}
        ratedCount={Object.keys(userRatings).length}
        onOpenAlgorithmLab={() => setIsAlgorithmLabOpen(true)}
        algorithmMode={algorithmMode}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* DISCOVER TAB */}
        {activeTab === 'discover' && (
          <div className="space-y-10">
            {/* Top Spotlight Recommendation */}
            <HeroSpotlight
              topRec={topSpotlightRec}
              onSelectMovie={(movie) => setSelectedMovieForDetail(movie)}
              onOpenTrailer={(movie) => setSelectedMovieForTrailer(movie)}
              watchlistStatus={topSpotlightRec ? getWatchlistStatus(topSpotlightRec.movie.id) : undefined}
              onToggleWatchlist={handleToggleWatchlist}
              userRating={topSpotlightRec ? userRatings[topSpotlightRec.movie.id] : undefined}
              onRateMovie={handleRateMovie}
              onOpenAlgorithmLab={() => setIsAlgorithmLabOpen(true)}
            />

            {/* Filter & Control Bar */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                    Recommended For You
                  </h2>
                  <p className="text-xs text-slate-400">
                    Calculated using <span className="text-amber-400 capitalize font-medium">{algorithmMode}</span> algorithm over {Object.keys(userRatings).length} calibrated ratings
                  </p>
                </div>

                {/* Search & Sort Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, director, theme..."
                      className="w-full sm:w-56 rounded-lg border border-slate-800 bg-[#0d131f] pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>

                  {/* Sort By Dropdown */}
                  <div className="flex items-center gap-1.5 bg-[#0d131f] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
                    <ArrowUpDown className="h-3 w-3 text-slate-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent focus:outline-none text-slate-200 cursor-pointer"
                    >
                      <option value="match" className="bg-[#090D14]">Match Score</option>
                      <option value="rating" className="bg-[#090D14]">IMDb Rating</option>
                      <option value="year" className="bg-[#090D14]">Release Year</option>
                      <option value="runtime" className="bg-[#090D14]">Duration</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Functional Genre Filter Segmented Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedGenre('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedGenre === 'all'
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  All Genres ({MOVIES_DATABASE.length})
                </button>

                {ALL_GENRES.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => setSelectedGenre(g.name)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                      selectedGenre === g.name
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                        : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Movie Recommendation Grid */}
            {filteredRecommendations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 py-16 text-center text-slate-400">
                <Film className="h-10 w-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-300">No movies match your current search or genre filter.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGenre('all');
                  }}
                  className="mt-3 text-xs text-amber-400 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredRecommendations.map((rec) => (
                  <MovieCard
                    key={rec.movie.id}
                    rec={rec}
                    onSelectMovie={(movie) => setSelectedMovieForDetail(movie)}
                    onOpenTrailer={(movie) => setSelectedMovieForTrailer(movie)}
                    watchlistStatus={getWatchlistStatus(rec.movie.id)}
                    onToggleWatchlist={handleToggleWatchlist}
                    userRating={userRatings[rec.movie.id]}
                    onRateMovie={handleRateMovie}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* WATCHLIST TAB */}
        {activeTab === 'watchlist' && (
          <WatchlistDashboard
            watchlist={watchlist}
            moviesMap={moviesMap}
            userRatings={userRatings}
            onUpdateStatus={handleUpdateWatchlistStatus}
            onRemoveItem={handleRemoveFromWatchlist}
            onUpdateNotes={handleUpdateWatchlistNotes}
            onRateMovie={handleRateMovie}
            onSelectMovie={(movie) => setSelectedMovieForDetail(movie)}
            onOpenTrailer={(movie) => setSelectedMovieForTrailer(movie)}
            onNavigateToDiscover={() => setActiveTab('discover')}
          />
        )}

        {/* RATE & DISCOVER TAB */}
        {activeTab === 'rate' && (
          <QuickRateDeck
            unratedMovies={unratedMovies}
            userRatings={userRatings}
            onRateMovie={handleRateMovie}
            onApplyPreset={handleApplyPreset}
            onClearAllRatings={handleClearAllRatings}
            onViewRecommendations={() => setActiveTab('discover')}
          />
        )}

        {/* TASTE COMPASS TAB */}
        {activeTab === 'compass' && (
          <GenreCompass
            genrePreferences={genrePreferences}
            onUpdatePreference={handleUpdateGenrePreference}
            onResetPreferences={handleResetGenrePreferences}
            onApplyMood={handleApplyMood}
            onViewRecommendations={() => setActiveTab('discover')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090D14] py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-300">CINEMATCH</span>
            <span>·</span>
            <span>Vector & Collaborative Recommendation Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Cosine Vector Similarity</span>
            <span>·</span>
            <span>Pearson k-NN Collaborative</span>
            <span>·</span>
            <span>Personalized Watchlists</span>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <AlgorithmLabModal
        isOpen={isAlgorithmLabOpen}
        onClose={() => setIsAlgorithmLabOpen(false)}
        algorithmMode={algorithmMode}
        setAlgorithmMode={setAlgorithmMode}
        hybridWeight={hybridWeight}
        setHybridWeight={setHybridWeight}
        userRatings={userRatings}
      />

      <MovieDetailModal
        movie={selectedMovieForDetail}
        recResult={selectedMovieForDetail ? recResultMap.get(selectedMovieForDetail.id) : undefined}
        onClose={() => setSelectedMovieForDetail(null)}
        onOpenTrailer={(movie) => setSelectedMovieForTrailer(movie)}
        watchlistStatus={selectedMovieForDetail ? getWatchlistStatus(selectedMovieForDetail.id) : undefined}
        onToggleWatchlist={handleToggleWatchlist}
        userRating={selectedMovieForDetail ? userRatings[selectedMovieForDetail.id] : undefined}
        onRateMovie={handleRateMovie}
      />

      <TrailerModal
        movie={selectedMovieForTrailer}
        onClose={() => setSelectedMovieForTrailer(null)}
      />

      {/* Floating Toast System */}
      <Toast toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
}
