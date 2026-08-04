import React, { useState, useEffect, useRef } from 'react';
import { LandingPage } from './components/LandingPage';
import { DepthSelectorModal } from './components/DepthSelectorModal';
import { RoadmapGraphView } from './components/RoadmapGraphView';
import { Navigation } from './components/Navigation';
import { ResumeBanner } from './components/ResumeBanner';
import { AmbientMusicPlayer } from './components/AmbientMusicPlayer';
import { ErrorDisplayCard, RoadmapError } from './components/ErrorDisplayCard';
import { RoadmapGraph, DepthOption, UserHistoryItem, UserBookmark, UserProfile } from './types';

const LOCAL_STORAGE_HISTORY_KEY = 'tmiktb_learning_history_v1';
const LOCAL_STORAGE_BOOKMARKS_KEY = 'tmiktb_user_bookmarks_v1';
const LOCAL_STORAGE_PROFILE_KEY = 'tmiktb_user_profile_v1';
const LOCAL_STORAGE_ACTIVE_GRAPH_KEY = 'tmiktb_active_graph_v1';

function getFrontendErrorObj(status: number, data?: any): RoadmapError {
  const timestamp = new Date().toISOString();
  const model = "gemini-2.5-flash";

  if (data && data.title && data.message) {
    return {
      title: data.title,
      message: data.message,
      details: data.details || {
        status: data.status || status,
        code: data.code || `HTTP_${status}`,
        model,
        timestamp,
      },
    };
  }

  if (status === 429) {
    return {
      title: "Daily AI Generation Limit Reached",
      message: "Today's AI generation quota has been exhausted. Please try again after the daily quota refreshes.",
      details: { status: 429, code: "RESOURCE_EXHAUSTED", model, timestamp },
    };
  }

  if (status === 503) {
    return {
      title: "AI Service Busy",
      message: "Gemini is currently experiencing unusually high demand. Please try again in a few minutes.",
      details: { status: 503, code: "SERVICE_UNAVAILABLE", model, timestamp },
    };
  }

  if (status === 401) {
    return {
      title: "Authentication Failed",
      message: "Authentication with the AI service failed.",
      details: { status: 401, code: "UNAUTHENTICATED", model, timestamp },
    };
  }

  if (status === 403) {
    return {
      title: "Access Forbidden",
      message: "The configured AI model cannot be accessed.",
      details: { status: 403, code: "PERMISSION_DENIED", model, timestamp },
    };
  }

  if (status === 404) {
    return {
      title: "Model Not Found",
      message: "The requested AI model or endpoint could not be found.",
      details: { status: 404, code: "NOT_FOUND", model, timestamp },
    };
  }

  if (status === 422) {
    return {
      title: "Invalid AI Response",
      message: "The AI returned an invalid response. Please try generating again.",
      details: { status: 422, code: "INVALID_AI_RESPONSE", model, timestamp },
    };
  }

  if (status === 0) {
    return {
      title: "Connection Error",
      message: "Unable to reach the AI service. Check your connection and try again.",
      details: { status: 0, code: "NETWORK_ERROR", model, timestamp },
    };
  }

  return {
    title: "Unexpected Server Error",
    message: "An unexpected server error occurred while generating the roadmap.",
    details: { status: status || 500, code: "INTERNAL_ERROR", model, timestamp },
  };
}

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'roadmap'>('landing');
  const [searchTopic, setSearchTopic] = useState<string>('');
  const [isDepthModalOpen, setIsDepthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorState, setErrorState] = useState<RoadmapError | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastAttemptedRef = useRef<{ depth: DepthOption; topic: string } | null>(null);
  
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

  // Close modal and cancel active request
  const handleCloseModal = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setIsDepthModalOpen(false);
    setLoadingProgress(0);
  };

  // Generate or fetch roadmap graph from API with explicit topic override
  const handleSelectDepth = async (depth: DepthOption, overrideTopic?: string) => {
    const topicToUse = (overrideTopic || searchTopic).trim();
    if (!topicToUse) {
      console.warn("No topic provided for roadmap generation.");
      return;
    }

    lastAttemptedRef.current = { depth, topic: topicToUse };

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setErrorState(null);
    setLoadingProgress(0);
    setIsLoading(true);
    setIsDepthModalOpen(true);

    try {
      const response = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicToUse, depth }),
        signal: controller.signal
      });

      if (controller.signal.aborted) return;

      const data = await response.json().catch(() => null);

      if (controller.signal.aborted) return;

      if (!response.ok || !data || data.success === false || !data.graph) {
        const errorObj = getFrontendErrorObj(response.status, data);
        setIsLoading(false);
        setIsDepthModalOpen(false);
        setLoadingProgress(0);
        setErrorState(errorObj);
        return;
      }

      setLoadingProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (controller.signal.aborted) return;

      saveActiveGraphState(data.graph);
      setIsDepthModalOpen(false);
      setCurrentView('roadmap');
    } catch (err: any) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        console.log("Roadmap generation cancelled.");
        return;
      }

      console.warn("Error fetching roadmap API:", err);
      const errorObj = getFrontendErrorObj(0, null);
      setIsLoading(false);
      setIsDepthModalOpen(false);
      setLoadingProgress(0);
      setErrorState(errorObj);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsLoading(false);
      setLoadingProgress(0);
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
      {errorState ? (
        <ErrorDisplayCard
          error={errorState}
          onRetry={() => {
            if (lastAttemptedRef.current) {
              setErrorState(null);
              handleSelectDepth(lastAttemptedRef.current.depth, lastAttemptedRef.current.topic);
            }
          }}
          onBackToSearch={() => {
            setErrorState(null);
            setCurrentView('landing');
          }}
        />
      ) : currentView === 'landing' ? (
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
        onClose={handleCloseModal}
        isLoading={isLoading}
        progress={loadingProgress}
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

      {/* Floating Ambient Background Music Player */}
      <AmbientMusicPlayer />
    </div>
  );
}
