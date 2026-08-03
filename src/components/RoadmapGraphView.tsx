import React, { useMemo, useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft,
  Menu,
  Clock,
  CheckCircle2,
  Share2,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';
import { HandDrawnNode } from './HandDrawnNode';
import { NodeDetailDrawer } from './NodeDetailDrawer';
import { RoadmapGraph, RoadmapNodeData, DepthOption } from '../types';
import { getLayoutedGraph } from '../lib/graphLayout';

interface RoadmapGraphViewProps {
  graph: RoadmapGraph;
  onBackToSearch: () => void;
  onOpenMenu: () => void;
  onUpdateGraph: (updatedGraph: RoadmapGraph) => void;
  onChangeDepth: (depth: DepthOption) => void;
  isBookmarked?: (nodeId: string) => boolean;
  onToggleBookmark?: (nodeId: string) => void;
}

export const RoadmapGraphView: React.FC<RoadmapGraphViewProps> = ({
  graph,
  onBackToSearch,
  onOpenMenu,
  onUpdateGraph,
  onChangeDepth,
  isBookmarked,
  onToggleBookmark
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showDepthMenu, setShowDepthMenu] = useState(false);
  const [copyShareStatus, setCopyShareStatus] = useState(false);

  // Custom Node Types map
  const nodeTypes = useMemo(() => ({ handDrawnNode: HandDrawnNode }), []);

  // Handlers for node interaction
  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleToggleComplete = useCallback((nodeId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();

    const updatedNodes = graph.nodes.map(n => {
      if (n.id === nodeId) {
        return { ...n, completed: !n.completed };
      }
      return n;
    });

    const completedCount = updatedNodes.filter(n => n.completed).length;
    const totalCount = updatedNodes.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    const updatedGraph: RoadmapGraph = {
      ...graph,
      nodes: updatedNodes,
      progress: {
        ...graph.progress,
        completedCount,
        totalCount,
        percentage
      }
    };

    onUpdateGraph(updatedGraph);
  }, [graph, onUpdateGraph]);

  const handleSaveNotes = useCallback((nodeId: string, notes: string) => {
    const updatedNodes = graph.nodes.map(n => {
      if (n.id === nodeId) {
        return { ...n, userNotes: notes };
      }
      return n;
    });

    onUpdateGraph({
      ...graph,
      nodes: updatedNodes
    });
  }, [graph, onUpdateGraph]);

  // Compute Layout nodes & edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return getLayoutedGraph(
      graph.nodes,
      handleSelectNode,
      handleToggleComplete
    );
  }, [graph.nodes, handleSelectNode, handleToggleComplete]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as any);

  // Sync state when graph updates
  React.useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getLayoutedGraph(
      graph.nodes,
      handleSelectNode,
      handleToggleComplete
    );
    setNodes(newNodes as any);
    setEdges(newEdges as any);
  }, [graph.nodes, handleSelectNode, handleToggleComplete, setNodes, setEdges]);

  const activeSelectedNode = graph.nodes.find(n => n.id === selectedNodeId) || null;

  // Depth Option Badges
  const getDepthLabel = (d: DepthOption) => {
    switch (d) {
      case 'curious': return '🌱 Just Curious';
      case 'learn': return '📖 Learn';
      case 'master': return '🎓 Master';
      case 'rabbithole': return '🐇 Rabbit Hole';
    }
  };

  const handleShareRoadmap = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopyShareStatus(true);
    setTimeout(() => setCopyShareStatus(false), 2000);
  };

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden select-none">
      {/* Top Header Bar over React Flow Canvas */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/90 backdrop-blur-md border-b border-white/20 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-[0px_4px_20px_rgba(0,0,0,0.8)]">
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMenu}
            title="Open Menu"
            className="p-2 sm:p-2.5 sketch-border-sm bg-black hover:bg-zinc-900 text-white transition-colors"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <button
            onClick={onBackToSearch}
            className="flex items-center gap-1.5 px-3 py-2 sketch-border-sm bg-black hover:bg-zinc-900 text-white font-mono text-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Search Topic</span>
          </button>
        </div>

        {/* Center Topic Title & Depth Selector */}
        <div className="flex items-center gap-3">
          <h1 className="font-hand text-xl sm:text-2xl text-white font-bold leading-none">
            {graph.topic}
          </h1>

          <div className="relative">
            <button
              onClick={() => setShowDepthMenu(!showDepthMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono sketch-border-sm bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
            >
              <span>{getDepthLabel(graph.depth)}</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {/* Depth Selector Dropdown */}
            {showDepthMenu && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-black sketch-border p-2 z-30 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] space-y-1">
                {(['curious', 'learn', 'master', 'rabbithole'] as DepthOption[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setShowDepthMenu(false);
                      if (d !== graph.depth) {
                        onChangeDepth(d);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-mono sketch-border-sm transition-colors ${
                      d === graph.depth ? 'bg-white text-black font-bold' : 'bg-black text-white hover:bg-zinc-900'
                    }`}
                  >
                    {getDepthLabel(d)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Progress Stats & Share */}
        <div className="flex items-center gap-3">
          {/* Progress Bar Badge */}
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 sketch-border-sm bg-zinc-950 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              <span>{graph.progress.completedCount}/{graph.progress.totalCount} ({graph.progress.percentage}%)</span>
            </div>
            <div className="w-24 bg-zinc-800 h-2 sketch-border-sm overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${graph.progress.percentage}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleShareRoadmap}
            className="flex items-center gap-1.5 px-3 py-2 sketch-border-sm bg-black hover:bg-zinc-900 text-white font-mono text-xs transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">{copyShareStatus ? "Link Copied!" : "Share"}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Flow Canvas */}
      <div className="w-full h-full pt-16">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          className="bg-black"
        >
          {/* Hand-drawn sketch dots background */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.5}
            color="#333333"
          />

          <Controls className="sketch-border bg-black border-white text-white" />

          {/* Bottom Left Floating Legend / Hint */}
          <Panel position="bottom-left" className="m-4">
            <div className="p-3 bg-black/90 backdrop-blur sketch-border-sm text-xs font-mono text-zinc-400 space-y-1">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Click any node to view concept study guide & resources</span>
              </div>
              <p className="text-[10px] text-zinc-500">Pan and scroll to explore complete dependency graph</p>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Slide-over Node Detail Drawer */}
      <NodeDetailDrawer
        node={activeSelectedNode}
        allNodes={graph.nodes}
        topicName={graph.topic}
        isOpen={!!selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
        onToggleComplete={handleToggleComplete}
        onSaveNotes={handleSaveNotes}
        onSelectNode={handleSelectNode}
        isBookmarked={selectedNodeId ? isBookmarked?.(selectedNodeId) : false}
        onToggleBookmark={onToggleBookmark}
      />
    </div>
  );
};
