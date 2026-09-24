import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play } from 'lucide-react';
import { Movie } from '../types/movie';

interface TrailerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ movie, onClose }) => {
  if (!movie) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-[#090D14] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-3.5">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="font-display font-bold text-white text-base">
                {movie.title} — Official Trailer
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Video Container */}
          <div className="relative aspect-video w-full bg-black">
            {movie.youtubeId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${movie.youtubeId}?autoplay=1&rel=0`}
                title={`${movie.title} Trailer`}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-slate-400">
                <Play className="h-12 w-12 text-slate-600 mb-2" />
                <p>Trailer stream preview not available for this title.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
