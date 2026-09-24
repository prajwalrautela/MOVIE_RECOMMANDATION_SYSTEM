import React from 'react';
import { Film, SlidersHorizontal, Bookmark, Sparkles, UserCheck, Flame } from 'lucide-react';
import { AlgorithmMode } from '../types/movie';

interface NavbarProps {
  activeTab: 'discover' | 'watchlist' | 'rate' | 'compass';
  setActiveTab: (tab: 'discover' | 'watchlist' | 'rate' | 'compass') => void;
  watchlistCount: number;
  ratedCount: number;
  onOpenAlgorithmLab: () => void;
  algorithmMode: AlgorithmMode;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  watchlistCount,
  ratedCount,
  onOpenAlgorithmLab,
  algorithmMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090D14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('discover')}
            className="group flex items-center gap-2.5 text-left focus-visible:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 shadow-md shadow-amber-500/20 transition-transform group-hover:scale-105">
              <Film className="h-5 w-5 fill-slate-950 stroke-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-wider text-slate-100 transition-colors group-hover:text-amber-400">
                CINEMATCH
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => setActiveTab('discover')}
            className={`transition-colors py-1 ${
              activeTab === 'discover'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Discover
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-1.5 transition-colors py-1 ${
              activeTab === 'watchlist'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <span>Watchlist</span>
            {watchlistCount > 0 && (
              <span className="rounded-full bg-slate-800 px-2 py-0.2 text-xs font-mono tabular-nums text-amber-300">
                {watchlistCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rate')}
            className={`flex items-center gap-1.5 transition-colors py-1 ${
              activeTab === 'rate'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <span>Rate Movies</span>
            {ratedCount > 0 && (
              <span className="rounded-full bg-slate-800 px-2 py-0.2 text-xs font-mono tabular-nums text-slate-300">
                {ratedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('compass')}
            className={`transition-colors py-1 ${
              activeTab === 'compass'
                ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Taste Compass
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAlgorithmLab}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3.5 py-1.5 text-xs font-medium text-slate-200 shadow-sm transition hover:border-amber-500/50 hover:bg-slate-800 hover:text-amber-300 focus-visible:outline-none"
            title="Configure recommendation algorithms & peer similarity"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
            <span className="capitalize">{algorithmMode} Engine</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar row */}
      <div className="flex md:hidden border-t border-slate-800/60 bg-[#090D14] px-4 py-2 justify-around text-xs font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('discover')}
          className={`py-1 ${activeTab === 'discover' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Discover
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`py-1 ${activeTab === 'watchlist' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Watchlist ({watchlistCount})
        </button>
        <button
          onClick={() => setActiveTab('rate')}
          className={`py-1 ${activeTab === 'rate' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Rate ({ratedCount})
        </button>
        <button
          onClick={() => setActiveTab('compass')}
          className={`py-1 ${activeTab === 'compass' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Compass
        </button>
      </div>
    </header>
  );
};
