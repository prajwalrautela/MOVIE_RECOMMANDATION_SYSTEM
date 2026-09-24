import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Bookmark, Star, Clock, Sparkles, Check, Film, Tv, ShieldCheck } from 'lucide-react';
import { Movie, RecommendationResult, WatchlistStatus } from '../types/movie';

interface MovieDetailModalProps {
  movie: Movie | null;
  recResult?: RecommendationResult;
  onClose: () => void;
  onOpenTrailer: (movie: Movie) => void;
  watchlistStatus?: WatchlistStatus;
  onToggleWatchlist: (movieId: string, status?: WatchlistStatus) => void;
  userRating?: number;
  onRateMovie: (movieId: string, rating: number) => void;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  recResult,
  onClose,
  onOpenTrailer,
  watchlistStatus,
  onToggleWatchlist,
  userRating,
  onRateMovie,
}) => {
  if (!movie) return null;

  const isBookmarked = !!watchlistStatus;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-[#0d131f] shadow-2xl text-slate-100"
        >
          {/* Header Backdrop Banner */}
          <div
            className="relative aspect-[16/7] w-full p-6 flex flex-col justify-between overflow-hidden"
            style={{ background: movie.backdropGradient }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d131f] via-transparent to-black/40" />

            <div className="relative z-10 flex items-center justify-between">
              {recResult && (
                <div className="rounded-md bg-black/75 px-3 py-1 text-xs font-mono font-bold text-amber-300 backdrop-blur-md border border-white/10 tabular-nums">
                  {recResult.matchScore}% Match
                </div>
              )}
              <button
                onClick={onClose}
                className="ml-auto rounded-full bg-black/60 p-1.5 text-slate-300 hover:bg-black/80 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative z-10">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md">
                {movie.title}
              </h2>
              {/* Zero-Pill Unboxed Text Metadata */}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-200 font-mono tabular-nums">
                <span>{movie.year}</span>
                <span className="text-slate-400">·</span>
                <span>{movie.runtime} min</span>
                <span className="text-slate-400">·</span>
                <span className="text-amber-300">★ {movie.rating} IMDb</span>
                <span className="text-slate-400">·</span>
                <span>{movie.director}</span>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenTrailer(movie)}
                  className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
                >
                  <Play className="h-3.5 w-3.5 fill-slate-950" />
                  <span>Play Trailer</span>
                </button>

                <button
                  onClick={() => onToggleWatchlist(movie.id)}
                  className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition ${
                    isBookmarked
                      ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                      : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {isBookmarked ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>In Watchlist</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-3.5 w-3.5" />
                      <span>Add to Watchlist</span>
                    </>
                  )}
                </button>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => onRateMovie(movie.id, star)}
                      className="p-1 text-slate-600 hover:text-amber-400 transition"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          (userRating || 0) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-transparent'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Synopsis
              </h4>
              <p className="text-sm leading-relaxed text-slate-300">
                {movie.synopsis}
              </p>
            </div>

            {/* Why Recommended / Vector Factors */}
            {recResult && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Recommendation Engine Analysis
                  </span>
                  <span className="font-mono text-slate-400 tabular-nums">
                    Content: {recResult.contentScore}% · Collab: {recResult.collaborativeScore}%
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  {recResult.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                {recResult.topFactors.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[11px] text-slate-400 mb-1.5 font-medium">
                      Primary Matching Vectors:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {recResult.topFactors.map((f, i) => (
                        <div key={i} className="flex justify-between rounded bg-slate-800/60 px-2.5 py-1 text-slate-300">
                          <span className="truncate">{f.factor}</span>
                          <span className="font-mono text-amber-300 tabular-nums">+{f.contribution}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="text-slate-500">Starring Cast</div>
                <div className="text-slate-200 font-medium">
                  {movie.cast.join(', ')}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-500">Genres</div>
                <div className="text-slate-200 font-medium">
                  {movie.genres.join(' · ')}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-500">Available Streaming Channels</div>
                <div className="text-amber-300 font-medium flex items-center gap-1.5">
                  <Tv className="h-3.5 w-3.5" />
                  <span>{movie.streamingOn.join(', ')}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-500">Themes & Keywords</div>
                <div className="text-slate-300">
                  {movie.keywords.join(', ')}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
