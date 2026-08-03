import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Check, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { RoadmapNodeData } from '../types';

interface HandDrawnNodeProps {
  data: RoadmapNodeData & {
    onSelectNode?: (nodeId: string) => void;
    onToggleComplete?: (nodeId: string, event: React.MouseEvent) => void;
  };
}

export const HandDrawnNode: React.FC<HandDrawnNodeProps> = ({ data }) => {
  const {
    id,
    title,
    shortDescription,
    estimatedTime,
    difficulty,
    importance,
    completed,
    sketchRotation = 0,
    onSelectNode,
    onToggleComplete
  } = data;

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectNode) {
      onSelectNode(id);
    }
  };

  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(id, e);
    }
  };

  // Border and badge color scheme (monochrome/sketch)
  const isCompleted = completed;

  return (
    <div
      onClick={handleCardClick}
      style={{ transform: `rotate(${sketchRotation}deg)` }}
      className={`relative w-[260px] cursor-pointer p-4 transition-all duration-200 hover:scale-[1.03] select-none ${
        isCompleted
          ? 'bg-zinc-950/90 text-zinc-400 sketch-border-dashed border-zinc-500/70'
          : 'bg-black text-white sketch-border hover:border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]'
      }`}
    >
      {/* Top Handle for incoming edges */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-white !w-3 !h-3 !border-2 !border-black"
      />

      {/* Top Header Row: Checkbox + Badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <button
          onClick={handleCheckClick}
          title={isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded transition-transform active:scale-95 sketch-border-sm ${
            isCompleted
              ? 'bg-white text-black font-bold'
              : 'bg-black text-white hover:bg-zinc-900 border-white/80'
          }`}
        >
          {isCompleted && <Check className="h-4 w-4 stroke-[3]" />}
        </button>

        <div className="flex flex-wrap items-center justify-end gap-1">
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono border border-white/40 px-1.5 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300">
            <Clock className="h-2.5 w-2.5" />
            {estimatedTime}
          </span>
        </div>
      </div>

      {/* Concept Title */}
      <h3 className={`font-hand text-lg leading-tight mb-1.5 ${isCompleted ? 'line-through text-zinc-500' : 'text-white'}`}>
        {title}
      </h3>

      {/* Short Description */}
      <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed mb-3 font-sans">
        {shortDescription}
      </p>

      {/* Footer Meta Row */}
      <div className="flex items-center justify-between border-t border-white/20 pt-2 text-[10px] font-mono text-zinc-400">
        <span className="px-1.5 py-0.5 rounded sketch-border-sm border-white/30 text-white/90">
          {difficulty}
        </span>
        <span className="flex items-center gap-1 text-zinc-300">
          <Sparkles className="h-2.5 w-2.5 text-white/70" />
          {importance}
        </span>
      </div>

      {/* Bottom Handle for outgoing edges */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-white !w-3 !h-3 !border-2 !border-black"
      />
    </div>
  );
};
