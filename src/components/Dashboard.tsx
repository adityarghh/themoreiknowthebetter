import React, { useState } from 'react';
import {
  Play,
  Bookmark as BookmarkIcon,
  Clock,
  CheckCircle2,
  TrendingUp,
  Search,
  Trash2,
  Sparkles,
  BookOpen,
  User,
  ArrowRight
} from 'lucide-react';
import { UserHistoryItem, UserProfile, UserBookmark } from '../types';

interface DashboardProps {
  history: UserHistoryItem[];
  bookmarks: UserBookmark[];
  profile: UserProfile;
  onOpenRoadmap: (topic: string, depth?: any) => void;
  onLogin: () => void;
  onDeleteHistoryItem: (id: string) => void;
  onCloseMenu: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  history,
  bookmarks,
  profile,
  onOpenRoadmap,
  onLogin,
  onDeleteHistoryItem,
  onCloseMenu
}) => {
  const [activeTab, setActiveTab] = useState<'continue' | 'recent' | 'bookmarks' | 'stats'>('continue');
  const [filterQuery, setFilterQuery] = useState('');

  // Stats Calculations
  const totalCompletedNodes = history.reduce((acc, item) => acc + item.completedNodesCount, 0);
  const totalNodesCount = history.reduce((acc, item) => acc + item.nodesCount, 0);
  const totalTopicsCount = history.length;
  const totalHoursLearned = (totalCompletedNodes * 0.5).toFixed(1);

  const filteredHistory = history.filter(item =>
    item.topic.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-8 text-white font-sans select-none">
      {/* Top Profile Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-zinc-950 sketch-border border-white/60">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full sketch-border bg-black flex items-center justify-center font-hand text-xl font-bold text-white">
            {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="font-hand text-2xl text-white">
              {profile.isLoggedIn ? profile.name : 'Curious Learner'}
            </h2>
            <p className="text-xs font-mono text-zinc-400">
              {profile.isLoggedIn ? profile.email : 'Explore knowledge visual roadmaps'}
            </p>
          </div>
        </div>

        {!profile.isLoggedIn ? (
          <button
            onClick={onLogin}
            className="px-4 py-2 sketch-border-sm bg-white text-black font-mono text-xs font-bold hover:bg-zinc-200 transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]"
          >
            Sign In / Sync Progress
          </button>
        ) : (
          <span className="text-xs font-mono px-3 py-1 sketch-border-sm text-emerald-400 border-emerald-500/50">
            ✓ Account Connected
          </span>
        )}
      </div>

      {/* Quick Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-black sketch-border-sm text-center space-y-1">
          <span className="text-[10px] uppercase font-mono text-zinc-400 block">Topics Explored</span>
          <span className="font-hand text-3xl font-bold text-white">{totalTopicsCount}</span>
        </div>
        <div className="p-4 bg-black sketch-border-sm text-center space-y-1">
          <span className="text-[10px] uppercase font-mono text-zinc-400 block">Nodes Completed</span>
          <span className="font-hand text-3xl font-bold text-white">{totalCompletedNodes}</span>
        </div>
        <div className="p-4 bg-black sketch-border-sm text-center space-y-1">
          <span className="text-[10px] uppercase font-mono text-zinc-400 block">Hours Learned</span>
          <span className="font-hand text-3xl font-bold text-white">≈ {totalHoursLearned}h</span>
        </div>
        <div className="p-4 bg-black sketch-border-sm text-center space-y-1">
          <span className="text-[10px] uppercase font-mono text-zinc-400 block">Bookmarks</span>
          <span className="font-hand text-3xl font-bold text-white">{bookmarks.length}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/30 overflow-x-auto gap-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('continue')}
          className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'continue' ? 'border-white text-white font-hand text-base' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Play className="h-3.5 w-3.5" /> Continue Learning
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'recent' ? 'border-white text-white font-hand text-base' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Clock className="h-3.5 w-3.5" /> Recent Roadmaps
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'bookmarks' ? 'border-white text-white font-hand text-base' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <BookmarkIcon className="h-3.5 w-3.5" /> Bookmarks ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'stats' ? 'border-white text-white font-hand text-base' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" /> Learning Stats
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-4">
        {/* Search filter for history */}
        {activeTab !== 'stats' && activeTab !== 'bookmarks' && history.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search history & saved roadmaps..."
              className="w-full pl-9 pr-4 py-2.5 bg-black sketch-border-sm text-white font-mono text-xs focus:outline-none placeholder:text-zinc-600"
            />
          </div>
        )}

        {/* Tab 1: Continue Learning */}
        {activeTab === 'continue' && (
          <div className="space-y-3">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-black sketch-border hover:bg-zinc-950 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] uppercase font-mono sketch-border-sm border-white/40 text-zinc-300">
                        {item.depth} depth
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        Visited {new Date(item.lastVisitedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-hand text-2xl text-white group-hover:underline">
                      {item.topic}
                    </h3>

                    {item.lastVisitedNodeTitle && (
                      <p className="text-xs text-zinc-400 font-mono">
                        Last Concept: <span className="text-white">{item.lastVisitedNodeTitle}</span>
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="w-full max-w-md bg-zinc-900 sketch-border-sm h-3 overflow-hidden mt-2">
                      <div
                        className="bg-white h-full transition-all duration-300"
                        style={{ width: `${item.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        onOpenRoadmap(item.topic, item.depth);
                        onCloseMenu();
                      }}
                      className="px-4 py-2.5 sketch-border bg-white text-black font-mono text-xs font-bold hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.7)]"
                    >
                      <Play className="h-3.5 w-3.5 fill-black" />
                      Resume
                    </button>
                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      title="Remove from history"
                      className="p-2.5 sketch-border-sm bg-black text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center sketch-border border-dashed border-white/30 space-y-3">
                <BookOpen className="h-8 w-8 mx-auto text-zinc-600" />
                <h4 className="font-hand text-xl text-zinc-300">No active roadmaps yet</h4>
                <p className="text-xs font-mono text-zinc-500">Search any topic on the home screen to start exploring!</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Recent Roadmaps */}
        {activeTab === 'recent' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onOpenRoadmap(item.topic, item.depth);
                  onCloseMenu();
                }}
                className="p-4 bg-black sketch-border hover:bg-zinc-950 transition-all cursor-pointer flex flex-col justify-between group space-y-3 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.6)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono border border-white/30 px-2 py-0.5 rounded-full text-zinc-400 uppercase">
                      {item.depth}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {item.completedNodesCount}/{item.nodesCount} completed
                    </span>
                  </div>

                  <h3 className="font-hand text-xl text-white group-hover:underline">
                    {item.topic}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-2 border-t border-white/20">
                  <span>{item.progressPercentage}% Progress</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-3">
            {bookmarks.length > 0 ? (
              bookmarks.map((bm, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-black sketch-border-sm flex items-center justify-between gap-4 hover:bg-zinc-950 transition-colors"
                >
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block">{bm.topic}</span>
                    <h4 className="font-hand text-lg text-white">{bm.nodeTitle}</h4>
                  </div>
                  <button
                    onClick={() => {
                      onOpenRoadmap(bm.topic);
                      onCloseMenu();
                    }}
                    className="px-3 py-1.5 sketch-border-sm bg-white text-black font-mono text-xs hover:bg-zinc-200"
                  >
                    Go to Concept →
                  </button>
                </div>
              ))
            ) : (
              <div className="p-12 text-center sketch-border border-dashed border-white/30 space-y-2">
                <BookmarkIcon className="h-8 w-8 mx-auto text-zinc-600" />
                <h4 className="font-hand text-xl text-zinc-300">No bookmarked concepts</h4>
                <p className="text-xs font-mono text-zinc-500">Click the bookmark icon in any concept drawer to save it here.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Learning Stats */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="p-6 bg-zinc-950 sketch-border space-y-4">
              <h3 className="font-hand text-2xl text-white">Your Curiosity Breakdown</h3>
              <div className="space-y-3 font-mono text-xs">
                {history.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex justify-between text-zinc-300">
                      <span>{item.topic}</span>
                      <span>{item.completedNodesCount} / {item.nodesCount} nodes ({item.progressPercentage}%)</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2 sketch-border-sm overflow-hidden">
                      <div className="bg-white h-full" style={{ width: `${item.progressPercentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
