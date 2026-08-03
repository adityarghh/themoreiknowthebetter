import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  Circle,
  ExternalLink,
  BookOpen,
  Youtube,
  FileText,
  Bookmark,
  ChevronRight,
  Clock,
  Sparkles,
  Save,
  Check,
  Code
} from 'lucide-react';
import { RoadmapNodeData } from '../types';

interface NodeDetailDrawerProps {
  node: RoadmapNodeData | null;
  allNodes: RoadmapNodeData[];
  topicName: string;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete: (nodeId: string) => void;
  onSaveNotes: (nodeId: string, notes: string) => void;
  onSelectNode: (nodeId: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (nodeId: string) => void;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  node,
  allNodes,
  topicName,
  isOpen,
  onClose,
  onToggleComplete,
  onSaveNotes,
  onSelectNode,
  isBookmarked = false,
  onToggleBookmark
}) => {
  if (!node) return null;

  const [notesText, setNotesText] = useState(node.userNotes || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setNotesText(node.userNotes || '');
    setSaveStatus('idle');
  }, [node.id, node.userNotes]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotesText(val);
    setSaveStatus('saving');
    
    // Auto-save debounce
    const timer = setTimeout(() => {
      onSaveNotes(node.id, val);
      setSaveStatus('saved');
    }, 600);

    return () => clearTimeout(timer);
  };

  // Find prerequisite nodes objects
  const prereqNodes = (node.prerequisites || [])
    .map(pId => allNodes.find(n => n.id === pId))
    .filter(Boolean) as RoadmapNodeData[];

  // Resource Icon map
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return <Youtube className="h-4 w-4 text-red-400" />;
      case 'docs':
        return <FileText className="h-4 w-4 text-blue-400" />;
      case 'book':
        return <BookOpen className="h-4 w-4 text-emerald-400" />;
      case 'practice':
        return <Code className="h-4 w-4 text-amber-400" />;
      default:
        return <ExternalLink className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40"
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-black border-l-2 border-white z-50 overflow-y-auto flex flex-col shadow-[-10px_0px_30px_rgba(255,255,255,0.08)]"
          >
            {/* Header */}
            <div className="sticky top-0 bg-black/95 backdrop-blur border-b border-white/20 p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span>{topicName}</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-white border-b border-dashed border-white/50 font-hand text-sm">{node.title}</span>
              </div>

              <div className="flex items-center gap-2">
                {onToggleBookmark && (
                  <button
                    onClick={() => onToggleBookmark(node.id)}
                    title={isBookmarked ? "Remove Bookmark" : "Bookmark Node"}
                    className={`p-2 rounded sketch-border-sm transition-colors ${
                      isBookmarked ? 'bg-white text-black' : 'bg-black text-white hover:bg-zinc-900'
                    }`}
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded sketch-border-sm bg-black text-white hover:bg-zinc-900 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 space-y-8 flex-1">
              {/* Title & Complete Action Row */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-mono bg-zinc-900 sketch-border-sm text-white">
                    {node.difficulty}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-mono bg-zinc-900 sketch-border-sm text-zinc-300 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {node.estimatedTime}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-mono bg-zinc-900 sketch-border-sm text-zinc-300 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {node.importance}
                  </span>
                </div>

                <h1 className="text-3xl font-hand text-white leading-tight">
                  {node.title}
                </h1>

                <p className="text-zinc-300 text-sm leading-relaxed font-sans">
                  {node.shortDescription}
                </p>

                {/* Mark as Complete Toggle */}
                <button
                  onClick={() => onToggleComplete(node.id)}
                  className={`w-full py-3 px-4 rounded flex items-center justify-center gap-3 font-mono text-sm transition-all sketch-border ${
                    node.completed
                      ? 'bg-white text-black font-bold shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]'
                      : 'bg-black text-white hover:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.9)]'
                  }`}
                >
                  {node.completed ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                      Concept Completed! (Click to toggle)
                    </>
                  ) : (
                    <>
                      <Circle className="h-5 w-5" />
                      Mark Concept as Complete
                    </>
                  )}
                </button>
              </div>

              {/* Prerequisites Checklist */}
              {prereqNodes.length > 0 && (
                <div className="space-y-3 p-4 bg-zinc-950 sketch-border-sm border-white/40">
                  <h3 className="font-hand text-lg text-white flex items-center gap-2">
                    <span>Prerequisites Required</span>
                    <span className="text-xs font-mono text-zinc-400 font-normal">({prereqNodes.filter(p => p.completed).length}/{prereqNodes.length} completed)</span>
                  </h3>
                  <div className="space-y-2">
                    {prereqNodes.map((prereq) => (
                      <div
                        key={prereq.id}
                        onClick={() => onSelectNode(prereq.id)}
                        className="flex items-center justify-between p-2.5 rounded border border-white/20 bg-black hover:bg-zinc-900 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          {prereq.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-zinc-500 shrink-0" />
                          )}
                          <span className={`text-xs font-mono ${prereq.completed ? 'line-through text-zinc-500' : 'text-white'}`}>
                            {prereq.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">Jump →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overview / Study Guide */}
              <div className="space-y-3">
                <h3 className="font-hand text-xl text-white border-b border-white/30 pb-1">
                  Study Guide & Key Concepts
                </h3>
                <div className="prose prose-invert prose-sm max-w-none font-sans text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-950 p-4 rounded sketch-border-sm border-white/30">
                  {node.studyGuideMarkdown || node.shortDescription}
                </div>
              </div>

              {/* Best Curated Resources */}
              <div className="space-y-3">
                <h3 className="font-hand text-xl text-white border-b border-white/30 pb-1 flex items-center justify-between">
                  <span>Curated Learning Resources</span>
                  <span className="text-xs font-mono text-zinc-400">Quality over quantity</span>
                </h3>
                
                <div className="space-y-2.5">
                  {node.resources && node.resources.length > 0 ? (
                    node.resources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start justify-between p-3.5 rounded sketch-border-sm bg-black hover:bg-zinc-900 border-white/40 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded bg-zinc-900 sketch-border-sm shrink-0 mt-0.5">
                            {getResourceIcon(res.type)}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white group-hover:underline flex items-center gap-1.5">
                              {res.title}
                              <ExternalLink className="h-3.0 w-3.0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h4>
                            {res.description && (
                              <p className="text-xs text-zinc-400 mt-0.5">{res.description}</p>
                            )}
                            <span className="inline-block text-[10px] uppercase font-mono text-zinc-500 mt-1">
                              {res.type} resource
                            </span>
                          </div>
                        </div>
                      </a>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500 italic">Search queries & references configured automatically.</p>
                  )}
                </div>
              </div>

              {/* Personal Notes (Autosaved) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-white/30 pb-1">
                  <h3 className="font-hand text-xl text-white">
                    Personal Study Notes
                  </h3>
                  <div className="flex items-center gap-1 text-xs font-mono text-zinc-400">
                    {saveStatus === 'saving' && <span className="animate-pulse">Saving...</span>}
                    {saveStatus === 'saved' && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Check className="h-3 w-3" /> Saved
                      </span>
                    )}
                  </div>
                </div>

                <textarea
                  value={notesText}
                  onChange={handleNotesChange}
                  placeholder="Write your study notes, insights, key questions or code snippets here... (Autosaved)"
                  rows={6}
                  className="w-full p-4 bg-black text-white sketch-border-sm border-white/50 focus:border-white focus:outline-none font-mono text-xs leading-relaxed resize-y placeholder:text-zinc-600"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
