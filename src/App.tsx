import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { DepthSelectorModal } from './components/DepthSelectorModal';
import { RoadmapGraphView } from './components/RoadmapGraphView';
import { Navigation } from './components/Navigation';
import { ResumeBanner } from './components/ResumeBanner';
import { RoadmapGraph, DepthOption, UserHistoryItem, UserBookmark, UserProfile } from './types';
import { generateClientFallbackGraph } from './lib/fallbackGenerator';

const LOCAL_STORAGE_HISTORY_KEY = 'tmiktb_learning_history_v1';
const LOCAL_STORAGE_BOOKMARKS_KEY = 'tmiktb_user_bookmarks_v1';
const LOCAL_STORAGE_PROFILE_KEY = 'tmiktb_user_profile_v1';
const LOCAL_STORAGE_ACTIVE_GRAPH_KEY = 'tmiktb_active_graph_v1';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'roadmap'>('landing');
  const [searchTopic, setSearchTopic] = useState<string>('');
  const [isDepthModalOpen, setIsDepthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [activeGraph, setActiveGraph] = useState<RoadmapGraph | null>(null);
  const [history, setHistory] = useState<UserHistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user_1',
    name: 'Curious Learner',
    email: 'learner@example.com',
    isLoggedIn: false,
    savedRoadmapIds: [],
    bookmarks: []
  });

  const [resumeBannerItem, setResumeBannerItem] = useState<UserHistoryItem | null>(null);
  const [isResumeBannerVisible, setIsResumeBannerVisible] = useState(false);

  // Load persisted user state from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (savedHistory) {
        const parsed: UserHistoryItem[] = JSON.parse(savedHistory);
        setHistory(parsed);

        // Check if there's a recent history item to offer Resume Learning
        if (parsed.length > 0) {
          const mostRecent = parsed[0];
          setResumeBannerItem(mostRecent);
          setIsResumeBannerVisible(true);
        }
      }

      const savedBookmarks = localStorage.getItem(LOCAL_STORAGE_BOOKMARKS_KEY);
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }

      const savedProfile = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

      const savedActiveGraph = localStorage.getItem(LOCAL_STORAGE_ACTIVE_GRAPH_KEY);
      if (savedActiveGraph) {
        setActiveGraph(JSON.parse(savedActiveGraph));
      }
    } catch (e) {
      console.warn("Failed to read localStorage state:", e);
    }
  }, []);

  // Save history helper
  const saveHistoryState = (updatedHistory: UserHistoryItem[]) => {
    setHistory(updatedHistory);
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn("Failed to write history:", e);
    }
  };

  // Save active graph helper
  const saveActiveGraphState = (graph: RoadmapGraph) => {
    setActiveGraph(graph);
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_GRAPH_KEY, JSON.stringify(graph));
    } catch (e) {
      console.warn("Failed to write active graph:", e);
    }

    // Update history entry for this topic
    const completedCount = graph.nodes.filter(n => n.completed).length;
    const lastNode = graph.nodes.find(n => n.completed) || graph.nodes[0];

    const historyItem: UserHistoryItem = {
      id: `hist_${graph.topic.toLowerCase()}`,
      topic: graph.topic,
      depth: graph.depth,
      lastVisitedNodeId: lastNode?.id,
      lastVisitedNodeTitle: lastNode?.title,
      lastVisitedAt: new Date().toISOString(),
      progressPercentage: graph.progress.percentage,
      nodesCount: graph.nodes.length,
      completedNodesCount: completedCount
    };

    const filtered = history.filter(h => h.topic.toLowerCase() !== graph.topic.toLowerCase());
    const newHistory = [historyItem, ...filtered];
    saveHistoryState(newHistory);
  };

  // Trigger search topic -> open Depth modal
  const handleInitiateSearch = (topic: string) => {
    setSearchTopic(topic);
    setIsDepthModalOpen(true);
    setIsResumeBannerVisible(false);
  };

  // Generate or fetch roadmap graph from API with explicit topic override
  const handleSelectDepth = async (depth: DepthOption, overrideTopic?: string) => {
    const topicToUse = (overrideTopic || searchTopic).trim();
    if (!topicToUse) {
      console.warn("No topic provided for roadmap generation.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicToUse, depth })
      });

      let graph: RoadmapGraph;

      if (!response.ok) {
        console.warn('API returned non-200, using client fallback roadmap');
        graph = generateClientFallbackGraph(topicToUse, depth);
      } else {
        const data = await response.json();
        graph = data.graph || generateClientFallbackGraph(topicToUse, depth);
      }

      saveActiveGraphState(graph);
      setIsDepthModalOpen(false);
      setCurrentView('roadmap');
    } catch (err) {
      console.warn("Error fetching roadmap API, using client fallback graph:", err);
      const fallback = generateClientFallbackGraph(topicToUse, depth);
      saveActiveGraphState(fallback);
      setIsDepthModalOpen(false);
      setCurrentView('roadmap');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle graph state updates (check items, notes, progress)
  const handleUpdateGraph = (updatedGraph: RoadmapGraph) => {
    saveActiveGraphState(updatedGraph);
  };

  // Switch Depth on active graph
  const handleChangeDepth = (depth: DepthOption) => {
    if (activeGraph) {
      setSearchTopic(activeGraph.topic);
      handleSelectDepth(depth, activeGraph.topic);
    }
  };

  // Resume learning from history banner
  const handleContinueFromBanner = (item: UserHistoryItem) => {
    setIsResumeBannerVisible(false);
    // If we have active graph for this topic, view it
    if (activeGraph && activeGraph.topic.toLowerCase() === item.topic.toLowerCase()) {
      setCurrentView('roadmap');
    } else {
      setSearchTopic(item.topic);
      handleSelectDepth(item.depth, item.topic);
    }
  };

  // Bookmark toggle handler
  const handleToggleBookmark = (nodeId: string) => {
    if (!activeGraph) return;

    const node = activeGraph.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const exists = bookmarks.some(b => b.nodeId === nodeId && b.topic === activeGraph.topic);
    let updated: UserBookmark[];

    if (exists) {
      updated = bookmarks.filter(b => !(b.nodeId === nodeId && b.topic === activeGraph.topic));
    } else {
      updated = [
        ...bookmarks,
        {
          nodeId,
          topic: activeGraph.topic,
          nodeTitle: node.title,
          savedAt: new Date().toISOString()
        }
      ];
    }

    setBookmarks(updated);
    localStorage.setItem(LOCAL_STORAGE_BOOKMARKS_KEY, JSON.stringify(updated));
  };

  const isBookmarked = (nodeId: string) => {
    if (!activeGraph) return false;
    return bookmarks.some(b => b.nodeId === nodeId && b.topic === activeGraph.topic);
  };

  // Delete history item
  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    saveHistoryState(updated);
  };

  // Login simulation
  const handleLogin = () => {
    const updatedProfile: UserProfile = {
      ...profile,
      isLoggedIn: true,
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com'
    };
    setProfile(updatedProfile);
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updatedProfile));
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* View Router */}
      {currentView === 'landing' ? (
        <LandingPage
          onSearchSubmit={handleInitiateSearch}
          onOpenMenu={() => setIsMenuOpen(true)}
        />
      ) : (
        activeGraph && (
          <RoadmapGraphView
            graph={activeGraph}
            onBackToSearch={() => setCurrentView('landing')}
            onOpenMenu={() => setIsMenuOpen(true)}
            onUpdateGraph={handleUpdateGraph}
            onChangeDepth={handleChangeDepth}
            isBookmarked={isBookmarked}
            onToggleBookmark={handleToggleBookmark}
          />
        )
      )}

      {/* Depth Selector Modal */}
      <DepthSelectorModal
        topic={searchTopic}
        isOpen={isDepthModalOpen}
        onSelectDepth={handleSelectDepth}
        onClose={() => setIsDepthModalOpen(false)}
        isLoading={isLoading}
      />

      {/* Navigation & Dashboard Drawer */}
      <Navigation
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        history={history}
        bookmarks={bookmarks}
        profile={profile}
        onOpenRoadmap={(topic, depth) => {
          setSearchTopic(topic);
          handleSelectDepth(depth || 'learn', topic);
        }}
        onLogin={handleLogin}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onNewSearch={() => {
          setCurrentView('landing');
        }}
      />

      {/* Resume Learning Welcome Back Banner */}
      <ResumeBanner
        lastItem={resumeBannerItem}
        isOpen={isResumeBannerVisible && currentView === 'landing'}
        onContinue={handleContinueFromBanner}
        onDismiss={() => setIsResumeBannerVisible(false)}
      />
    </div>
  );
}
