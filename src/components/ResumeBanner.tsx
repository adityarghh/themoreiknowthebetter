import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Clock, Play } from 'lucide-react';
import { UserHistoryItem } from '../types';

interface ResumeBannerProps {
  lastItem: UserHistoryItem | null;
  isOpen: boolean;
  onContinue: (item: UserHistoryItem) => void;
  onDismiss: () => void;
}

export const ResumeBanner: React.FC<ResumeBannerProps> = ({
  lastItem,
  isOpen,
  onContinue,
  onDismiss
}) => {
  if (!isOpen || !lastItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 max-w-md w-full p-5 bg-black sketch-border-thick shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] text-white select-none"
      >
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 sketch-border-sm bg-black hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Welcome back</span>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-mono">Last time you stopped here:</p>
            <h4 className="font-hand text-xl text-white flex items-center gap-1.5 leading-snug">
              <span>{lastItem.topic}</span>
              {lastItem.lastVisitedNodeTitle && (
                <>
                  <span className="text-zinc-500 font-sans text-xs">→</span>
                  <span className="underline decoration-dashed text-zinc-200">{lastItem.lastVisitedNodeTitle}</span>
                </>
              )}
            </h4>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Estimated session: 25 mins
            </span>
            <span className="text-white border-b border-white/40">{lastItem.progressPercentage}% done</span>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => onContinue(lastItem)}
              className="flex-1 py-2.5 px-4 sketch-border bg-white text-black font-mono text-xs font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]"
            >
              <Play className="h-3.5 w-3.5 fill-black" />
              <span>Continue Learning?</span>
            </button>
            <button
              onClick={onDismiss}
              className="py-2.5 px-3 sketch-border-sm bg-black text-zinc-400 hover:text-white hover:bg-zinc-900 font-mono text-xs transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
