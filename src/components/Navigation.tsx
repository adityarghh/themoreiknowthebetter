import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Sparkles } from 'lucide-react';
import { Dashboard } from './Dashboard';
import { UserHistoryItem, UserProfile, UserBookmark } from '../types';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
  history: UserHistoryItem[];
  bookmarks: UserBookmark[];
  profile: UserProfile;
  onOpenRoadmap: (topic: string, depth?: any) => void;
  onLogin: () => void;
  onDeleteHistoryItem: (id: string) => void;
  onNewSearch: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isOpen,
  onClose,
  history,
  bookmarks,
  profile,
  onOpenRoadmap,
  onLogin,
  onDeleteHistoryItem,
  onNewSearch
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md overflow-y-auto">
        {/* Navigation Top Header */}
        <div className="sticky top-0 bg-black/90 border-b border-white/20 p-5 flex items-center justify-between z-10 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onNewSearch();
                onClose();
              }}
              className="flex items-center gap-2 px-3 py-1.5 sketch-border-sm bg-black hover:bg-zinc-900 text-white font-mono text-xs"
            >
              <Search className="h-3.5 w-3.5" />
              <span>New Search</span>
            </button>
            <span className="font-hand text-xl text-white">themoreiknowthebetter</span>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 sketch-border-sm bg-black text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dashboard Content Container */}
        <div className="flex-1 p-4 sm:p-6">
          <Dashboard
            history={history}
            bookmarks={bookmarks}
            profile={profile}
            onOpenRoadmap={onOpenRoadmap}
            onLogin={onLogin}
            onDeleteHistoryItem={onDeleteHistoryItem}
            onCloseMenu={onClose}
          />
        </div>
      </div>
    </AnimatePresence>
  );
};
