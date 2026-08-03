export type DepthOption = 'curious' | 'learn' | 'master' | 'rabbithole';

export interface ResourceItem {
  type: 'youtube' | 'article' | 'docs' | 'book' | 'practice';
  title: string;
  url: string;
  description?: string;
}

export interface RoadmapNodeData {
  id: string;
  title: string;
  shortDescription: string;
  estimatedTime: string; // e.g. "45 mins", "2 hrs"
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  importance: 'Core Foundation' | 'Essential' | 'Specialized' | 'Deep Dive';
  prerequisites: string[]; // Node IDs required before learning this
  children?: string[]; // Node IDs that follow this
  resources: ResourceItem[];
  studyGuideMarkdown?: string;
  completed?: boolean;
  userNotes?: string;
  // Node rotation angle for sketch effect (-1.5deg to 1.5deg)
  sketchRotation?: number;
}

export interface RoadmapProgress {
  completedCount: number;
  totalCount: number;
  percentage: number;
  timeSpentMins: number;
  estimatedRemainingTime: string;
}

export interface RoadmapGraph {
  id: string;
  topic: string;
  depth: DepthOption;
  estimatedTotalTime: string;
  createdAt: string;
  nodes: RoadmapNodeData[];
  progress: RoadmapProgress;
  summaryOverview?: string;
}

export interface UserHistoryItem {
  id: string;
  topic: string;
  depth: DepthOption;
  lastVisitedNodeId?: string;
  lastVisitedNodeTitle?: string;
  lastVisitedAt: string;
  progressPercentage: number;
  nodesCount: number;
  completedNodesCount: number;
}

export interface UserBookmark {
  nodeId: string;
  topic: string;
  nodeTitle: string;
  savedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
  savedRoadmapIds: string[];
  bookmarks: UserBookmark[];
}

export interface DepthOptionInfo {
  id: DepthOption;
  label: string;
  emoji: string;
  estimatedTime: string;
  description: string;
  nodeCountEstimate: string;
}
