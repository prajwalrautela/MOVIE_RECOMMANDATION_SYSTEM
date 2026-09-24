import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bookmark, Star, Info, Play, Check, ChevronDown, Sparkles } from 'lucide-react';
import { RecommendationResult, WatchlistStatus } from '../types/movie';

interface MovieCardProps {
  rec: RecommendationResult;
  onSelectMovie: (movie: RecommendationResult['movie']) => void;
  onOpenTrailer: (movie: RecommendationResult['movie']) => void;
  watchlistStatus?: WatchlistStatus;
  onToggleWatchlist: (movieId: string, status?: WatchlistStatus) => void;
  userRating?: number;
  onRateMovie: (movieId: string, rating: number) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  rec,
  onSelectMovie,
  onOpenTrailer,
  watchlistStatus,
  onToggleWatchlist,
  userRating,
  onRateMovie,
}) => {
  const { movie, matchScore, reasons, topFactors, similarNeighbors } = rec;
  const [showExplanation, setShowExplanation] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const isBookmarked = !!watchlistStatus;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-[#0d131f] hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5"
    >
      {/* Top Poster Art Block */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden cursor-pointer flex flex-col justify-between p-3.5"
        style={{ background: movie.backdropGradient }}
        onClick={() => onSelectMovie(movie)}
      >
        {/* Film grain vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d131f] via-transparent to-black/40" />

        {/* Top Badges / Indicators */}
        <div className="relative z-10 flex items-center justify-between">
          {/* Match Score Display */}
          <div className="flex items-center gap-1.5 rounded-md bg-black/75 px-2.5 py-1 backdrop-blur-md border border-white/10">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
              {matchScore}% Match
            </span>
          </div>

          {/* Quick Watchlist Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(movie.id);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-md backdrop-blur-md transition-all ${
              isBookmarked
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-black/60 text-slate-300 hover:bg-black/80 hover:text-white border border-white/10'
            }`}
            title={isBookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            {isBookmarked ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>

        {/* Center Hover Play Trailer Affordance */}
        <div className="relative z-10 my-auto flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            onClick={(e) => {
              e.stopPropagation();
              onOpenTrailer(movie);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 hover:scale-110 transition-transform"
            title="Watch Trailer"
          >
            <Play className="h-5 w-5 fill-slate-950 ml-0.5" />
          </div>
        </div>

        {/* Bottom Bar: Title & Year Over Gradient */}
        <div className="relative z-10">
          <h3 className="font-display text-base font-bold text-white group-hover:text-amber-300 transition-colors truncate drop-shadow-md">
            {movie.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono tabular-nums">
            <span>{movie.year}</span>
            <span className="text-slate-500">·</span>
            <span>{movie.runtime}m</span>
            <span className="text-slate-500">·</span>
            <span className="text-amber-300">★ {movie.rating}</span>
          </div>
        </div>
      </div>

      {/* Body Metadata Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Zero-Pill Unboxed Text Metadata */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
          <span>{movie.director}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 truncate">{movie.genres.join(', ')}</span>
        </div>

        {/* Brief 1-line Recommendation Reason */}
        <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-medium text-slate-200 truncate flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
              <span className="truncate">{reasons[0] || 'Matches your viewing taste vector'}</span>
            </span>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-[11px] text-amber-400/80 hover:text-amber-300 shrink-0 ml-1 flex items-center"
              title="Toggle detailed match explanation"
            >
              <Info className="h-3 w-3" />
            </button>
          </div>

          {/* Expandable Explanation Breakdown */}
          {showExplanation && (
            <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-300">
              <div className="font-semibold text-slate-400">Match Breakdown:</div>
              {topFactors.slice(0, 3).map((f, i) => (
                <div key={i} className="flex justify-between items-center text-slate-400">
                  <span className="truncate">{f.factor}</span>
                  <span className="font-mono text-amber-300 tabular-nums">+{f.contribution}%</span>
                </div>
              ))}
              {similarNeighbors.length > 0 && (
                <div className="pt-1 text-slate-400 italic">
                  Peer match: {similarNeighbors[0].user.name} ({Math.round(similarNeighbors[0].similarity * 100)}% overlap)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive Star Rating Strip */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400">Rate:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => onRateMovie(movie.id, star)}
                className="p-0.5 text-slate-600 hover:text-amber-400 transition-colors"
                title={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`h-4 w-4 ${
                    (hoverRating !== null ? hoverRating >= star : (userRating || 0) >= star)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-transparent text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>

          {userRating ? (
            <span className="font-mono text-amber-400 font-semibold tabular-nums text-[11px]">
              {userRating}★
            </span>
          ) : (
            <span className="text-slate-500 text-[11px] italic">unrated</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
