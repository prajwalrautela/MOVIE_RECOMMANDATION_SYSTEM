import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronRight, RotateCcw, Check, Sparkles, Film, ArrowRight } from 'lucide-react';
import { Movie } from '../types/movie';
import { PRESET_TASTE_PROFILES } from '../data/communityUsers';

interface QuickRateDeckProps {
  unratedMovies: Movie[];
  userRatings: Record<string, number>;
  onRateMovie: (movieId: string, rating: number) => void;
  onApplyPreset: (presetId: string) => void;
  onClearAllRatings: () => void;
  onViewRecommendations: () => void;
}

export const QuickRateDeck: React.FC<QuickRateDeckProps> = ({
  unratedMovies,
  userRatings,
  onRateMovie,
  onApplyPreset,
  onClearAllRatings,
  onViewRecommendations,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoverStar, setHoverStar] = useState<number | null>(null);

  const ratedCount = Object.keys(userRatings).length;
  const currentMovie = unratedMovies[currentIndex % Math.max(1, unratedMovies.length)];

  const handleRate = (rating: number) => {
    if (!currentMovie) return;
    onRateMovie(currentMovie.id, rating);
    // Auto advance to next card
    setCurrentIndex(prev => prev + 1);
  };

  const handleSkip = () => {
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="font-display text-3xl font-bold text-white tracking-tight">
          Rate & Calibrate Your Engine
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Every movie you rate refines your mathematical taste vector and aligns you with peer cinephiles. Rate at least 3 movies to unlock high-precision recommendations.
        </p>

        {/* Training Progress Bar */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono tabular-nums">
            <span>Taste Calibrated: {ratedCount} rated</span>
            <span className="text-amber-400">{Math.min(100, Math.round((ratedCount / 5) * 100))}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (ratedCount / 5) * 100)}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Rating Card Deck */}
      {unratedMovies.length > 0 && currentMovie ? (
        <div className="relative flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMovie.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-[#0d131f] shadow-2xl"
            >
              {/* Card Poster Artwork */}
              <div
                className="relative aspect-[16/9] w-full p-6 flex flex-col justify-between"
                style={{ background: currentMovie.backdropGradient }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d131f] via-transparent to-black/30" />

                <div className="relative z-10 flex justify-between items-center text-xs text-white">
                  <span className="rounded-md bg-black/60 px-2.5 py-1 backdrop-blur-md border border-white/10">
                    {currentMovie.genres.join(' · ')}
                  </span>
                  <span className="font-mono tabular-nums text-amber-300 font-semibold bg-black/60 px-2 py-1 rounded-md">
                    ★ {currentMovie.rating} IMDb
                  </span>
                </div>

                <div className="relative z-10">
                  <h3 className="font-display text-2xl font-bold text-white drop-shadow-md">
                    {currentMovie.title}
                  </h3>
                  <div className="text-xs text-slate-300 font-mono tabular-nums">
                    {currentMovie.director} · {currentMovie.year} · {currentMovie.runtime} min
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-6">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {currentMovie.synopsis}
                </p>

                {/* Star Rating Strip */}
                <div className="flex flex-col items-center space-y-3 pt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {hoverStar
                      ? `Give ${hoverStar} Star${hoverStar > 1 ? 's' : ''}`
                      : 'How would you rate this film?'}
                  </span>

                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverStar(star)}
                        onMouseLeave={() => setHoverStar(null)}
                        onClick={() => handleRate(star)}
                        className="group p-2 transition-transform hover:scale-125 focus:outline-none"
                        title={`Rate ${star} / 5`}
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            (hoverStar !== null ? hoverStar >= star : false)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-800 text-slate-600 group-hover:text-amber-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Skip affordance */}
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      onClick={handleSkip}
                      className="text-xs text-slate-500 hover:text-slate-300 transition"
                    >
                      Haven't seen it / Skip
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Quick jump to results */}
          {ratedCount >= 3 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onViewRecommendations}
              className="mt-6 flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>See Your Updated Recommendations</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-[#0d131f] p-8 text-center max-w-md mx-auto space-y-4">
          <Film className="h-10 w-10 text-amber-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">All Movies Rated!</h3>
          <p className="text-xs text-slate-400">
            You have rated all available films in this catalog. Your recommendation engine is operating at maximum precision.
          </p>
          <button
            onClick={onViewRecommendations}
            className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400"
          >
            Explore Recommendations
          </button>
        </div>
      )}

      {/* Instant Taste Presets */}
      <div className="border-t border-slate-800 pt-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-display text-lg font-bold text-white">
              Instant Taste Archetypes
            </h4>
            <p className="text-xs text-slate-400">
              Want to see how recommendations morph instantaneously? Test drive pre-configured cinephile vectors.
            </p>
          </div>

          {ratedCount > 0 && (
            <button
              onClick={onClearAllRatings}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset All Ratings</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_TASTE_PROFILES.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onApplyPreset(preset.id)}
              className="group cursor-pointer rounded-xl border border-slate-800 bg-[#0d131f] p-4 transition-all hover:border-amber-500/50 hover:bg-slate-900/60"
            >
              <div className="font-semibold text-sm text-slate-200 group-hover:text-amber-300 transition-colors">
                {preset.title}
              </div>
              <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                {preset.description}
              </p>
              <div className="mt-3 text-[11px] text-amber-400/80 group-hover:text-amber-300 flex items-center gap-1">
                <span>Load Profile</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
