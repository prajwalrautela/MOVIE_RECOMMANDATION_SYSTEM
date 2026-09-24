import React from 'react';
import { motion } from 'motion/react';
import { Compass, RotateCcw, Sparkles, Sliders } from 'lucide-react';
import { ALL_GENRES } from '../data/movies';

interface GenreCompassProps {
  genrePreferences: Record<string, number>;
  onUpdatePreference: (genre: string, value: number) => void;
  onResetPreferences: () => void;
  onApplyMood: (mood: string) => void;
  onViewRecommendations: () => void;
}

export const GenreCompass: React.FC<GenreCompassProps> = ({
  genrePreferences,
  onUpdatePreference,
  onResetPreferences,
  onApplyMood,
  onViewRecommendations,
}) => {
  const MOOD_PRESETS = [
    {
      id: 'cosmic_mindbender',
      name: 'Cosmic Mind-Bender',
      description: 'High Sci-Fi, Mystery & Adventure',
      genres: { 'Sci-Fi': 1.0, 'Mystery': 0.8, 'Adventure': 0.7 },
    },
    {
      id: 'dark_neon_noir',
      name: 'Dark Neo-Noir',
      description: 'Crime, Psychological Thriller & Drama',
      genres: { 'Crime': 1.0, 'Thriller': 0.9, 'Drama': 0.6 },
    },
    {
      id: 'poetic_indie',
      name: 'Poetic & Whimsical',
      description: 'Animation, Fantasy, Comedy & Romance',
      genres: { 'Animation': 0.9, 'Fantasy': 0.8, 'Comedy': 0.6, 'Romance': 0.5 },
    },
    {
      id: 'visceral_action',
      name: 'Visceral Spectacle',
      description: 'Action, Thriller & Sci-Fi',
      genres: { 'Action': 1.0, 'Thriller': 0.7, 'Sci-Fi': 0.6 },
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Compass className="h-6 w-6 text-amber-400" />
            <span>Genre Mood Compass</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Fine-tune explicit weights in your Content-Based vector. As you move these sliders, candidate cosine scores recalculate dynamically.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetPreferences}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Sliders</span>
          </button>

          <button
            onClick={onViewRecommendations}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>View Matches</span>
          </button>
        </div>
      </div>

      {/* Quick Mood Presets */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Quick Mood Injections
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MOOD_PRESETS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => onApplyMood(mood.id)}
              className="group text-left rounded-xl border border-slate-800 bg-[#0d131f] p-3.5 transition-all hover:border-amber-500/50 hover:bg-slate-900/60"
            >
              <div className="font-semibold text-xs text-white group-hover:text-amber-300 transition-colors">
                {mood.name}
              </div>
              <div className="mt-1 text-[11px] text-slate-400 truncate">
                {mood.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Fine-Grained Vector Dimensions
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ALL_GENRES.map((genre) => {
            const val = genrePreferences[genre.name] || 0;
            const pct = Math.round(val * 100);

            return (
              <div
                key={genre.name}
                className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 space-y-2.5 transition-colors hover:border-slate-700"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{genre.name}</span>
                  <span className="font-mono text-amber-400 tabular-nums">
                    {pct > 0 ? `+${pct}%` : 'Neutral'}
                  </span>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={val}
                  onChange={(e) => onUpdatePreference(genre.name, parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />

                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Neutral (0%)</span>
                  <span>Strong Preference (100%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
