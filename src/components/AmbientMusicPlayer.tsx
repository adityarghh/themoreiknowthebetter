import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Play, Pause, SkipForward, ChevronUp, ChevronDown, Sliders } from 'lucide-react';
import {
  AMBIENT_TRACKS,
  ambientEngine,
  loadAudioSettings,
  saveAudioSettings,
  AmbientTrack
} from '../lib/ambientAudio';

interface AmbientMusicPlayerProps {
  showPrompt?: boolean;
  onPromptResponse?: (play: boolean) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  noise: 'Noises',
  solfeggio: 'Solfeggio (Hz)',
  binaural: 'Brainwaves',
  nature: 'Nature',
  music: 'Ambient'
};

export const AmbientMusicPlayer: React.FC<AmbientMusicPlayerProps> = ({
  showPrompt = false,
  onPromptResponse
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState('pink_noise');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load saved settings on mount
  useEffect(() => {
    const settings = loadAudioSettings();
    setVolume(settings.volume);
    setIsMuted(settings.muted);
    setCurrentTrackId(settings.trackId || 'pink_noise');
    
    ambientEngine.setVolume(settings.volume);
    ambientEngine.setMuted(settings.muted);
  }, []);

  const currentTrack =
    AMBIENT_TRACKS.find((t) => t.id === currentTrackId) || AMBIENT_TRACKS[0];

  const filteredTracks = selectedCategory === 'all'
    ? AMBIENT_TRACKS
    : AMBIENT_TRACKS.filter((t) => t.category === selectedCategory);

  const handleTogglePlay = () => {
    if (isPlaying) {
      ambientEngine.stop();
      setIsPlaying(false);
    } else {
      ambientEngine.start(currentTrackId);
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    const currentIndex = AMBIENT_TRACKS.findIndex((t) => t.id === currentTrackId);
    const nextIndex = (currentIndex + 1) % AMBIENT_TRACKS.length;
    const nextTrack = AMBIENT_TRACKS[nextIndex];

    setCurrentTrackId(nextTrack.id);
    if (isPlaying) {
      ambientEngine.switchTrack(nextTrack.id);
    } else {
      saveAudioSettings({ trackId: nextTrack.id });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (isMuted && newVol > 0) {
      setIsMuted(false);
      ambientEngine.setMuted(false);
    }
    ambientEngine.setVolume(newVol);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    ambientEngine.setMuted(nextMuted);
  };

  const handlePromptAccept = () => {
    if (!isPlaying) {
      const randomTrack = AMBIENT_TRACKS[Math.floor(Math.random() * AMBIENT_TRACKS.length)];
      setCurrentTrackId(randomTrack.id);
      ambientEngine.start(randomTrack.id, 2);
      setIsPlaying(true);
    }
    if (onPromptResponse) onPromptResponse(true);
  };

  const handlePromptDecline = () => {
    if (onPromptResponse) onPromptResponse(false);
  };

  return (
    <>
      {/* Subtle Generation Prompt */}
      <AnimatePresence>
        {showPrompt && !isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="mt-6 p-3.5 sketch-border-sm bg-zinc-950 text-left flex flex-col sm:flex-row items-center justify-between gap-3 text-white z-20 shadow-lg"
          >
            <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-300">
              <span className="text-base">🎵</span>
              <span>Play ambient focus music (Pink Noise, 432 Hz, 528 Hz, Lofi) while generating?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 font-mono text-xs w-full sm:w-auto justify-end">
              <button
                onClick={handlePromptAccept}
                className="px-4 py-1.5 sketch-border-sm bg-white text-black hover:bg-zinc-200 transition-all font-bold cursor-pointer"
              >
                Play
              </button>
              <button
                onClick={handlePromptDecline}
                className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Not now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Ambient Music Control Widget (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-40 select-none">
        <motion.div
          layout
          className={`bg-black sketch-border p-3 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] text-white transition-all ${
            isExpanded ? 'w-[340px] sm:w-[380px]' : 'w-72'
          }`}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2.5">
            <button
              onClick={handleTogglePlay}
              className="p-2 sketch-border-sm bg-black hover:bg-zinc-900 transition-transform active:scale-95 cursor-pointer shrink-0"
              title={isPlaying ? 'Pause Sound' : 'Play Sound'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-white text-white" />
              ) : (
                <Play className="h-4 w-4 fill-white text-white ml-0.5" />
              )}
            </button>

            <div
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-1 min-w-0 cursor-pointer flex items-center gap-2 group"
            >
              <span className="text-base">{currentTrack.emoji}</span>
              <div className="flex flex-col truncate">
                <span className="text-xs font-mono font-bold truncate text-white group-hover:underline">
                  {currentTrack.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 truncate">
                  {isPlaying ? 'Playing • High Boost Gain' : 'Paused • Tap to view options'}
                </span>
              </div>
            </div>

            <button
              onClick={handleNextTrack}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer shrink-0"
              title="Next Sound"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </div>

          {/* Expanded Controls Drawer */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 mt-3 border-t border-white/20 space-y-3 overflow-hidden"
              >
                {/* Track Description */}
                <div className="p-2 bg-zinc-950 sketch-border-sm text-[11px] text-zinc-300 font-mono leading-snug">
                  <span className="text-white font-bold">{currentTrack.emoji} {currentTrack.name}: </span>
                  {currentTrack.description}
                </div>

                {/* Volume Slider & Boost Display */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Sliders className="h-3 w-3" /> Master Output Volume (Boosted Gain)
                    </span>
                    <span className="font-bold text-white">
                      {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleMute}
                      className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-4 w-4 text-zinc-500" />
                      ) : (
                        <Volume2 className="h-4 w-4 text-white" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex flex-wrap gap-1 border-t border-white/10 pt-2.5">
                  {Object.keys(CATEGORY_LABELS).map((catKey) => (
                    <button
                      key={catKey}
                      onClick={() => setSelectedCategory(catKey)}
                      className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                        selectedCategory === catKey
                          ? 'bg-white text-black font-bold'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {CATEGORY_LABELS[catKey]}
                    </button>
                  ))}
                </div>

                {/* Sound Options Grid */}
                <div className="max-h-48 overflow-y-auto pr-1 grid grid-cols-2 gap-1.5 pt-1 custom-scrollbar">
                  {filteredTracks.map((track: AmbientTrack) => {
                    const active = track.id === currentTrackId;
                    return (
                      <button
                        key={track.id}
                        onClick={() => {
                          setCurrentTrackId(track.id);
                          if (isPlaying) {
                            ambientEngine.switchTrack(track.id);
                          } else {
                            saveAudioSettings({ trackId: track.id });
                          }
                        }}
                        className={`text-left text-[10px] font-mono p-1.5 sketch-border-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                          active
                            ? 'bg-white text-black font-bold'
                            : 'bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-900'
                        }`}
                      >
                        <span className="text-xs shrink-0">{track.emoji}</span>
                        <span className="truncate">{track.name}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};
