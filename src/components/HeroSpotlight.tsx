import React from 'react';
import { motion } from 'motion/react';
import { Play, Bookmark, Star, Sparkles, Clock, Check, Users } from 'lucide-react';
import { RecommendationResult, WatchlistStatus } from '../types/movie';

interface HeroSpotlightProps {
  topRec: RecommendationResult | null;
  onSelectMovie: (movie: RecommendationResult['movie']) => void;
  onOpenTrailer: (movie: RecommendationResult['movie']) => void;
  watchlistStatus?: WatchlistStatus;
  onToggleWatchlist: (movieId: string, status?: WatchlistStatus) => void;
  userRating?: number;
  onRateMovie: (movieId: string, rating: number) => void;
  onOpenAlgorithmLab: () => void;
}

export const HeroSpotlight: React.FC<HeroSpotlightProps> = ({
  topRec,
  onSelectMovie,
  onOpenTrailer,
  watchlistStatus,
  onToggleWatchlist,
  userRating,
  onRateMovie,
  onOpenAlgorithmLab,
}) => {
  if (!topRec) return null;

  const { movie, matchScore, reasons, topFactors, similarNeighbors } = topRec;
  const isBookmarked = !!watchlistStatus;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0d131f] shadow-2xl">
      {/* Background cinematic aura & subtle poster gradient */}
      <div
        className="absolute inset-0 opacity-40 transition-opacity duration-700"
        style={{ background: movie.backdropGradient }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090D14] via-[#090D14]/70 to-transparent" />
      <div className="absolute inset-0 bg-radial-at-t from-transparent via-[#090D14]/50 to-[#090D14]" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 lg:p-12 items-center">
        {/* Left Column: Movie Content */}
        <div className="lg:col-span-8 space-y-5">
          {/* Top Recommendation Header with Zero-Pill text separation */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              #1 Personalized Match
            </span>
            <span className="text-slate-600">·</span>
            <span>{movie.director}</span>
            <span className="text-slate-600">·</span>
            <span>{movie.year}</span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1 font-mono tabular-nums">
              <Clock className="h-3 w-3 text-slate-400" />
              {movie.runtime} min
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-300/90 font-mono tabular-nums">★ {movie.rating} IMDb</span>
          </div>

          {/* Title */}
          <h1
            onClick={() => onSelectMovie(movie)}
            className="cursor-pointer font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white transition-colors hover:text-amber-300"
          >
            {movie.title}
          </h1>

          {/* Synopsis */}
          <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-slate-300 line-clamp-3">
            {movie.synopsis}
          </p>

          {/* Why Recommended? Transparency Box */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Algorithm Match Reasoning
              </span>
              <button
                onClick={onOpenAlgorithmLab}
                className="text-xs text-slate-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
              >
                Inspect Vector Math
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              {reasons.slice(0, 2).map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onOpenTrailer(movie)}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              <span>Watch Trailer</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(movie.id)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                isBookmarked
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                  : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-slate-600 hover:bg-slate-700'
              }`}
            >
              {isBookmarked ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" />
                  <span>Add to Watchlist</span>
                </>
              )}
            </button>

            {/* Quick Rating in Hero */}
            <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
              <span className="text-xs text-slate-400">Your Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onRateMovie(movie.id, star)}
                    className="p-1 text-slate-500 transition-colors hover:text-amber-400"
                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
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
        </div>

        {/* Right Column: Cinematic Match Dial & Poster Card */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <div className="relative group cursor-pointer w-full max-w-[280px]" onClick={() => onSelectMovie(movie)}>
            {/* Glowing Backdrop Border */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/30 to-rose-500/30 blur-lg transition duration-500 group-hover:opacity-100 group-hover:blur-xl" />

            <div
              className="relative aspect-[2/3] w-full rounded-2xl border border-slate-700/80 p-6 flex flex-col justify-between overflow-hidden shadow-2xl"
              style={{ background: movie.backdropGradient }}
            >
              {/* Top Score Badge */}
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-black/60 px-3 py-1.5 backdrop-blur-md border border-amber-500/40">
                  <div className="font-mono text-xl font-extrabold text-amber-400 tabular-nums">
                    {matchScore}%
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-300">
                    Match Score
                  </div>
                </div>

                <div className="rounded-lg bg-black/60 px-2.5 py-1 text-xs text-slate-300 backdrop-blur-md">
                  {movie.genres[0]}
                </div>
              </div>

              {/* Center Artistic Iconography */}
              <div className="my-auto flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full border border-white/20 bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner group-hover:scale-110 transition-transform">
                  <Play className="h-7 w-7 text-white fill-white ml-0.5" />
                </div>
                <div className="mt-4 font-display text-lg font-bold text-white tracking-wide drop-shadow-md">
                  {movie.title}
                </div>
                <div className="text-xs text-slate-300 drop-shadow">
                  {movie.genres.slice(0, 2).join(' · ')}
                </div>
              </div>

              {/* Bottom Stream Indicator */}
              <div className="rounded-lg bg-black/70 px-3 py-1.5 backdrop-blur-md text-center border border-white/10">
                <div className="text-[10px] text-slate-400">Streaming On</div>
                <div className="text-xs font-semibold text-amber-300 truncate">
                  {movie.streamingOn.join(', ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
