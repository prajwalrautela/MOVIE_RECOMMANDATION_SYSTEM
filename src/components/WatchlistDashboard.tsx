import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Trash2,
  Play,
  Star,
  Film,
  Sparkles,
  Download,
  Share2,
  Edit3,
  Search,
  Filter
} from 'lucide-react';
import { Movie, WatchlistItem, WatchlistStatus } from '../types/movie';

interface WatchlistDashboardProps {
  watchlist: WatchlistItem[];
  moviesMap: Map<string, Movie>;
  userRatings: Record<string, number>;
  onUpdateStatus: (movieId: string, status: WatchlistStatus) => void;
  onRemoveItem: (movieId: string) => void;
  onUpdateNotes: (movieId: string, notes: string) => void;
  onRateMovie: (movieId: string, rating: number) => void;
  onSelectMovie: (movie: Movie) => void;
  onOpenTrailer: (movie: Movie) => void;
  onNavigateToDiscover: () => void;
}

export const WatchlistDashboard: React.FC<WatchlistDashboardProps> = ({
  watchlist,
  moviesMap,
  userRatings,
  onUpdateStatus,
  onRemoveItem,
  onUpdateNotes,
  onRateMovie,
  onSelectMovie,
  onOpenTrailer,
  onNavigateToDiscover,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | WatchlistStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  // Compute metrics
  const totalMinutes = watchlist.reduce((acc, item) => {
    const movie = moviesMap.get(item.movieId);
    return acc + (movie ? movie.runtime : 0);
  }, 0);

  const hours = (totalMinutes / 60).toFixed(1);
  const completedCount = watchlist.filter(item => item.status === 'watched').length;
  const watchingCount = watchlist.filter(item => item.status === 'watching').length;
  const planToWatchCount = watchlist.filter(item => item.status === 'want_to_watch').length;

  // Filter items
  const filteredItems = watchlist.filter(item => {
    const movie = moviesMap.get(item.movieId);
    if (!movie) return false;

    if (selectedFilter !== 'all' && item.status !== selectedFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = movie.title.toLowerCase().includes(q);
      const matchDirector = movie.director.toLowerCase().includes(q);
      const matchGenre = movie.genres.some(g => g.toLowerCase().includes(q));
      if (!matchTitle && !matchDirector && !matchGenre) return false;
    }

    return true;
  });

  const handleExportJSON = () => {
    const data = watchlist.map(item => {
      const movie = moviesMap.get(item.movieId);
      return {
        title: movie?.title,
        year: movie?.year,
        director: movie?.director,
        status: item.status,
        personalNotes: item.personalNotes,
        rating: userRatings[item.movieId] || null,
        addedAt: new Date(item.addedAt).toISOString(),
      };
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinematch-watchlist-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareSummary = () => {
    const text = watchlist
      .map(item => {
        const movie = moviesMap.get(item.movieId);
        return `• ${movie?.title} (${movie?.year}) - ${item.status.replace(/_/g, ' ')}`;
      })
      .join('\n');
    navigator.clipboard.writeText(`My CineMatch Watchlist (${watchlist.length} titles):\n\n${text}`);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header & Stats Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Personalized Watchlist
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Curate, organize, track progress, and review films recommended by your taste vector.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShareSummary}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
            title="Copy text list to clipboard"
          >
            <Share2 className="h-3.5 w-3.5 text-amber-400" />
            <span>{copiedShare ? 'Copied to Clipboard!' : 'Share List'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
            title="Download JSON export"
          >
            <Download className="h-3.5 w-3.5 text-amber-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner (Single Elevation Math, Zero-Pill) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4">
          <div className="text-xs font-medium text-slate-400">Total Saved</div>
          <div className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
            {watchlist.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Across all categories</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4">
          <div className="text-xs font-medium text-slate-400">Screen Time</div>
          <div className="mt-1 font-mono text-2xl font-bold text-amber-400 tabular-nums">
            {hours} <span className="text-sm font-sans font-normal text-slate-400">hrs</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Total runtime backlog</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4">
          <div className="text-xs font-medium text-slate-400">Currently Watching</div>
          <div className="mt-1 font-mono text-2xl font-bold text-sky-400 tabular-nums">
            {watchingCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">In-progress streams</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4">
          <div className="text-xs font-medium text-slate-400">Completed & Watched</div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
            {completedCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Watched films</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({watchlist.length})
          </button>
          <button
            onClick={() => setSelectedFilter('want_to_watch')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedFilter === 'want_to_watch'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Want to Watch ({planToWatchCount})
          </button>
          <button
            onClick={() => setSelectedFilter('watching')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedFilter === 'watching'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Watching ({watchingCount})
          </button>
          <button
            onClick={() => setSelectedFilter('watched')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedFilter === 'watched'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Watched ({completedCount})
          </button>
        </div>

        {/* Search inside Watchlist */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search watchlist..."
            className="w-full rounded-lg border border-slate-800 bg-[#0d131f] pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Watchlist Items List */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-16 px-4 text-center">
          <Film className="h-10 w-10 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            {watchlist.length === 0
              ? 'Your watchlist is empty'
              : 'No movies match your filter query'}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            {watchlist.length === 0
              ? 'Explore personalized recommendations from the Discover tab and click "Add to Watchlist" to start curating your queue.'
              : 'Try switching status tabs or clearing your search term.'}
          </p>
          {watchlist.length === 0 && (
            <button
              onClick={onNavigateToDiscover}
              className="mt-4 flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Explore Discover Feed</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredItems.map(item => {
              const movie = moviesMap.get(item.movieId)!;
              const rating = userRatings[item.movieId];
              const isEditingNote = editingNotesId === item.movieId;

              return (
                <motion.div
                  key={item.movieId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-[#0d131f] p-4 transition-all hover:border-slate-700"
                >
                  {/* Left Section: Poster thumbnail & Movie info */}
                  <div className="flex items-start md:items-center gap-4 flex-1">
                    {/* Compact Poster Artwork */}
                    <div
                      onClick={() => onSelectMovie(movie)}
                      className="relative h-20 w-14 shrink-0 rounded-lg overflow-hidden cursor-pointer shadow-md flex items-center justify-center"
                      style={{ background: movie.backdropGradient }}
                    >
                      <Play className="h-4 w-4 text-white opacity-80" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4
                          onClick={() => onSelectMovie(movie)}
                          className="font-display text-base font-bold text-white hover:text-amber-300 cursor-pointer transition-colors"
                        >
                          {movie.title}
                        </h4>
                        <span className="text-xs text-slate-500 font-mono tabular-nums">
                          ({movie.year})
                        </span>
                      </div>

                      {/* Zero-Pill Metadata */}
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{movie.director}</span>
                        <span className="text-slate-600">·</span>
                        <span>{movie.genres.join(', ')}</span>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono tabular-nums">{movie.runtime}m</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-amber-400 font-mono tabular-nums">
                          ★ {movie.rating}
                        </span>
                      </div>

                      {/* Streaming services */}
                      <div className="text-[11px] text-slate-500">
                        Available on: <span className="text-slate-300">{movie.streamingOn.join(', ')}</span>
                      </div>

                      {/* User Personal Notes */}
                      {item.personalNotes && !isEditingNote && (
                        <div className="mt-1 text-xs text-amber-200/80 italic flex items-center gap-1.5">
                          <Edit3 className="h-3 w-3 text-amber-400 shrink-0" />
                          <span>"{item.personalNotes}"</span>
                        </div>
                      )}

                      {/* Inline Note Editor */}
                      {isEditingNote && (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="text"
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            placeholder="Add personal note (e.g., watch with Sam)..."
                            className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              onUpdateNotes(item.movieId, tempNotes);
                              setEditingNotesId(null);
                            }}
                            className="rounded bg-amber-500 px-2.5 py-1 text-xs font-semibold text-slate-950 hover:bg-amber-400"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section: Interactive Controls */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                    {/* Status Dropdown / Selector */}
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                      <button
                        onClick={() => onUpdateStatus(item.movieId, 'want_to_watch')}
                        className={`px-2.5 py-1 rounded transition-colors ${
                          item.status === 'want_to_watch'
                            ? 'bg-amber-500 text-slate-950 font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Plan
                      </button>
                      <button
                        onClick={() => onUpdateStatus(item.movieId, 'watching')}
                        className={`px-2.5 py-1 rounded transition-colors ${
                          item.status === 'watching'
                            ? 'bg-sky-500 text-slate-950 font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Watching
                      </button>
                      <button
                        onClick={() => onUpdateStatus(item.movieId, 'watched')}
                        className={`px-2.5 py-1 rounded transition-colors ${
                          item.status === 'watched'
                            ? 'bg-emerald-500 text-slate-950 font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Watched
                      </button>
                    </div>

                    {/* Star Rater */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => onRateMovie(item.movieId, star)}
                          className="p-0.5 text-slate-600 hover:text-amber-400 transition"
                          title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              (rating || 0) >= star
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-transparent'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenTrailer(movie)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-300 transition"
                        title="Watch Trailer"
                      >
                        <Play className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          setEditingNotesId(item.movieId);
                          setTempNotes(item.personalNotes || '');
                        }}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-300 transition"
                        title="Add/Edit Note"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onRemoveItem(item.movieId)}
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition"
                        title="Remove from Watchlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
