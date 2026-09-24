import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sliders, Users, Layers, Sparkles, Check, Cpu, HelpCircle, Activity } from 'lucide-react';
import { AlgorithmMode, CommunityUser } from '../types/movie';
import { COMMUNITY_USERS } from '../data/communityUsers';

interface AlgorithmLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  algorithmMode: AlgorithmMode;
  setAlgorithmMode: (mode: AlgorithmMode) => void;
  hybridWeight: number; // 0 to 1
  setHybridWeight: (weight: number) => void;
  userRatings: Record<string, number>;
}

export const AlgorithmLabModal: React.FC<AlgorithmLabModalProps> = ({
  isOpen,
  onClose,
  algorithmMode,
  setAlgorithmMode,
  hybridWeight,
  setHybridWeight,
  userRatings,
}) => {
  if (!isOpen) return null;

  const ratedCount = Object.keys(userRatings).length;

  // Calculate quick similarity preview with community users
  const communitySimilarities = COMMUNITY_USERS.map((user) => {
    let matches = 0;
    let totalDiff = 0;
    for (const [movieId, rating] of Object.entries(userRatings)) {
      if (movieId in user.ratings) {
        matches++;
        totalDiff += Math.abs(rating - user.ratings[movieId]);
      }
    }
    const overlapScore = matches > 0 ? Math.max(0, Math.round((1 - totalDiff / (matches * 4)) * 100)) : 50;
    return {
      user,
      coRatedCount: matches,
      similarityScore: overlapScore,
    };
  }).sort((a, b) => b.similarityScore - a.similarityScore);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-[#0d131f] shadow-2xl text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Recommendation Algorithm Lab
                </h3>
                <p className="text-xs text-slate-400">
                  Inspect and toggle between Collaborative & Content-Based filtering techniques
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Algorithm Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Select Active Recommendation Engine
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Hybrid */}
                <button
                  onClick={() => setAlgorithmMode('hybrid')}
                  className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                    algorithmMode === 'hybrid'
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-md'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Hybrid Blend</span>
                    {algorithmMode === 'hybrid' && (
                      <Check className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <span className="mt-1 text-xs text-slate-400">
                    Weighted combination of content feature vectors and peer collaborative consensus.
                  </span>
                </button>

                {/* 2. Content-Based */}
                <button
                  onClick={() => setAlgorithmMode('content')}
                  className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                    algorithmMode === 'content'
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-md'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Content-Based</span>
                    {algorithmMode === 'content' && (
                      <Check className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <span className="mt-1 text-xs text-slate-400">
                    Cosine similarity over movie attribute vectors (genres, director style, keywords).
                  </span>
                </button>

                {/* 3. Collaborative */}
                <button
                  onClick={() => setAlgorithmMode('collaborative')}
                  className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                    algorithmMode === 'collaborative'
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-md'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Collaborative</span>
                    {algorithmMode === 'collaborative' && (
                      <Check className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <span className="mt-1 text-xs text-slate-400">
                    Pearson correlation with community cinephile ratings matrix ($k$-NN).
                  </span>
                </button>
              </div>
            </div>

            {/* Hybrid Slider (If hybrid is active) */}
            {algorithmMode === 'hybrid' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">
                    Hybrid Weighting Ratio ($\alpha$)
                  </span>
                  <span className="font-mono text-amber-400 font-semibold tabular-nums">
                    {Math.round(hybridWeight * 100)}% Content / {Math.round((1 - hybridWeight) * 100)}% Collaborative
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={hybridWeight}
                  onChange={(e) => setHybridWeight(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>← Pure Collaborative (Crowd)</span>
                  <span>Pure Content (Vectors) →</span>
                </div>
              </div>
            )}

            {/* Mathematical Formulas Section */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-amber-400" />
                <span>Mathematical Foundations</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Content-Based Formula */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 space-y-2">
                  <div className="font-semibold text-amber-300">1. Cosine Vector Similarity</div>
                  <div className="font-mono text-[11px] text-slate-300 bg-black/40 p-2 rounded-lg overflow-x-auto">
                    sim(u, m) = (V_u · V_m) / (||V_u|| × ||V_m||)
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    User taste vector V_u is synthesized from rating-weighted movie feature dimensions (genres, directors, plot tags).
                  </p>
                </div>

                {/* Collaborative Formula */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 space-y-2">
                  <div className="font-semibold text-sky-300">2. Pearson k-NN Collaborative</div>
                  <div className="font-mono text-[11px] text-slate-300 bg-black/40 p-2 rounded-lg overflow-x-auto">
                    r̂(u,i) = r̄_u + Σ sim(u,v)(r_v,i - r̄_v) / Σ|sim|
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Predicts preference based on rating deviations of nearest peer cinephiles with highest taste correlation.
                  </p>
                </div>
              </div>
            </div>

            {/* Peer Cinephiles Network Overview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-amber-400" />
                  <span>Peer Cinephile Matrix Alignment</span>
                </span>
                <span className="text-slate-500 font-mono tabular-nums">
                  {ratedCount} movies in your vector
                </span>
              </div>

              <div className="space-y-2">
                {communitySimilarities.slice(0, 4).map(({ user, similarityScore, coRatedCount }) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 font-mono font-bold text-amber-400">
                        {user.avatarSeed}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{user.name}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                          {user.tagline}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-amber-400 font-semibold tabular-nums">
                        {similarityScore}% Match
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {coRatedCount > 0 ? `${coRatedCount} co-rated` : 'Prior alignment'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-800 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
            >
              Apply & Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
