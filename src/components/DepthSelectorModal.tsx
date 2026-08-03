import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DepthOption, DepthOptionInfo } from '../types';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface DepthSelectorModalProps {
  topic: string;
  isOpen: boolean;
  onSelectDepth: (depth: DepthOption) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const DEPTH_OPTIONS: DepthOptionInfo[] = [
  {
    id: 'curious',
    label: 'Just Curious',
    emoji: '🌱',
    estimatedTime: '≈ 30 mins',
    description: 'Crisp foundational overview of the core essential concepts.',
    nodeCountEstimate: '5-7 nodes'
  },
  {
    id: 'learn',
    label: 'Learn',
    emoji: '📖',
    estimatedTime: '≈ 12 hrs',
    description: 'Structured practical roadmap to achieve real working proficiency.',
    nodeCountEstimate: '10-15 nodes'
  },
  {
    id: 'master',
    label: 'Master',
    emoji: '🎓',
    estimatedTime: '≈ 80 hrs',
    description: 'Comprehensive pathway covering advanced principles, theory & practice.',
    nodeCountEstimate: '18-25 nodes'
  },
  {
    id: 'rabbithole',
    label: 'Rabbit Hole',
    emoji: '🐇',
    estimatedTime: 'Everything',
    description: 'Exhaustive complete dependency graph with every prerequisite & niche topic.',
    nodeCountEstimate: '30+ nodes'
  }
];

export const DepthSelectorModal: React.FC<DepthSelectorModalProps> = ({
  topic,
  isOpen,
  onSelectDepth,
  onClose,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-black sketch-border-thick p-6 sm:p-8 shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] text-white"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 sketch-border-sm bg-black hover:bg-zinc-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Heading */}
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Select Learning Depth
            </span>
            <h2 className="font-hand text-3xl sm:text-4xl text-white">
              How deep into <span className="underline decoration-wavy decoration-white/60">{topic}</span>?
            </h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
              Choose your depth. We will automatically generate your complete dependency graph.
            </p>
          </div>

          {/* Loading Indicator */}
          {isLoading ? (
            <div className="py-12 text-center space-y-4">
              <div className="inline-block p-4 sketch-border animate-spin rounded-full">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-hand text-2xl animate-pulse">
                Building Knowledge Graph for "{topic}"...
              </h3>
              <p className="text-xs font-mono text-zinc-400">
                Resolving concept dependencies & mapping optimal learning path...
              </p>
            </div>
          ) : (
            /* Depth Options Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEPTH_OPTIONS.map((opt, idx) => {
                const radiusClass = `depth-radius-${(idx % 4) + 1}`;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onSelectDepth(opt.id)}
                    className={`group relative text-left p-6 bg-black border border-white border-opacity-30 hover:border-opacity-100 transition-all duration-200 hover:bg-white/5 cursor-pointer ${radiusClass} flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{opt.emoji}</span>
                        <span className="text-[10px] font-mono border border-white/30 px-2 py-0.5 rounded-full text-zinc-300">
                          {opt.estimatedTime}
                        </span>
                      </div>

                      <h3 className="font-hand text-xl text-white mb-1 uppercase tracking-widest font-medium group-hover:underline flex items-center justify-between">
                        {opt.label}
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>

                      <p className="text-xs text-zinc-300 leading-relaxed font-sans mb-3 opacity-80">
                        {opt.description}
                      </p>
                    </div>

                    <div className="text-[10px] font-mono text-zinc-400 pt-2 border-t border-white/20 flex justify-between">
                      <span>{opt.nodeCountEstimate}</span>
                      <span className="opacity-60 uppercase">Select →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
