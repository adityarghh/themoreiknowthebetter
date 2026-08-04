import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, ArrowLeft, ChevronDown, ChevronUp, Terminal } from 'lucide-react';

export interface RoadmapErrorDetails {
  status: number | string;
  code?: string;
  model?: string;
  timestamp: string;
}

export interface RoadmapError {
  title: string;
  message: string;
  details?: RoadmapErrorDetails;
}

interface ErrorDisplayCardProps {
  error: RoadmapError;
  onRetry: () => void;
  onBackToSearch: () => void;
}

export const ErrorDisplayCard: React.FC<ErrorDisplayCardProps> = ({
  error,
  onRetry,
  onBackToSearch,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  return (
    <div className="min-h-screen w-full bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg sketch-border bg-zinc-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative flex flex-col gap-6">
        {/* Header Icon + Title */}
        <div className="flex items-start gap-4">
          <div className="p-3 sketch-border-sm bg-red-950/80 border-red-500/50 text-red-400 shrink-0 mt-1">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
              {error.title}
            </h2>
            <p className="mt-2 text-sm font-mono text-zinc-300 leading-relaxed">
              {error.message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 font-mono text-sm">
          <button
            onClick={onRetry}
            className="flex-1 py-3 px-4 sketch-border-sm bg-white text-black hover:bg-zinc-200 transition-all font-bold cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retry Generation</span>
          </button>
          <button
            onClick={onBackToSearch}
            className="flex-1 py-3 px-4 sketch-border-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-2 border border-zinc-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Search</span>
          </button>
        </div>

        {/* Collapsible Technical Details */}
        {error.details && (
          <div className="border-t border-zinc-800 pt-4">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center justify-between w-full text-xs font-mono text-zinc-400 hover:text-zinc-200 cursor-pointer py-1"
            >
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5" />
                <span>Technical Details</span>
              </div>
              {showTechnicalDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showTechnicalDetails && (
              <div className="mt-3 p-3 sketch-border-sm bg-black/80 font-mono text-xs space-y-2 text-zinc-300 border border-zinc-800">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">HTTP Status:</span>
                  <span className="font-semibold text-zinc-200">{error.details.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Error Code:</span>
                  <span className="font-semibold text-zinc-200">{error.details.code || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Model Name:</span>
                  <span className="font-semibold text-zinc-200">{error.details.model || 'gemini-2.5-flash'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Timestamp:</span>
                  <span className="font-semibold text-zinc-200 text-[11px]">{error.details.timestamp}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
