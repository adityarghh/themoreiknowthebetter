import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles, Menu } from 'lucide-react';

interface LandingPageProps {
  onSearchSubmit: (topic: string) => void;
  onOpenMenu: () => void;
}

const SURPRISE_TOPICS = [
  'Psychology',
  'Quantum Computing',
  'Chess Openings',
  'Astronomy',
  'Behavioral Economics',
  'Photography',
  'Horoscopes',
  'Java',
  'Synthetic Biology',
  'Woodworking',
  'Philosophy of Mind',
  'Machine Learning',
  'Renaissance Art',
  'Financial Markets',
  'Cryptographic Systems'
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onSearchSubmit,
  onOpenMenu
}) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSearchSubmit(topic.trim());
    }
  };

  const handleSurpriseMe = () => {
    const randomTopic = SURPRISE_TOPICS[Math.floor(Math.random() * SURPRISE_TOPICS.length)];
    setTopic(randomTopic);
    onSearchSubmit(randomTopic);
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none">
      {/* Outer Hand-Drawn Frame Overlay */}
      <div className="absolute inset-4 sm:inset-6 border-[1px] border-white pointer-events-none opacity-30 sketch-frame z-0" />

      {/* Navigation Header */}
      <nav className="z-10 flex justify-between items-center mb-12 sm:mb-20">
        <button
          onClick={onOpenMenu}
          title="Open Menu & Dashboard"
          className="w-10 h-10 flex flex-col justify-center items-start gap-1.5 group cursor-pointer hover:scale-105 transition-transform"
        >
          <div className="w-8 h-[1px] bg-white" />
          <div className="w-5 h-[1px] bg-white group-hover:w-8 transition-all" />
          <div className="w-7 h-[1px] bg-white" />
        </button>
        <span className="text-[10px] sm:text-xs tracking-[0.4em] uppercase opacity-40 font-light font-mono">
          themoreiknowthebetter
        </span>
      </nav>

      {/* Main Centered Minimal Search Experience */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full text-center px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full space-y-10"
        >
          {/* Centered Handwritten Title */}
          <h1 className="font-hand text-4xl sm:text-6xl md:text-7xl font-light italic tracking-tight text-center leading-tight">
            What are you curious about?
          </h1>

          {/* Minimal Underline Search Bar */}
          <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto group">
            <div className="relative flex items-center border-b border-white border-opacity-30 focus-within:border-opacity-100 py-3 sm:py-4 transition-all">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Type any topic (e.g. Psychology, Java, Astronomy)..."
                className="w-full bg-transparent px-2 text-2xl sm:text-3xl font-light placeholder:text-zinc-700 focus:outline-none font-sans text-white"
                autoFocus
              />
              <button
                type="submit"
                disabled={!topic.trim()}
                title="Search Topic"
                className="p-3 text-white/80 hover:text-white disabled:opacity-30 transition-opacity shrink-0 cursor-pointer"
              >
                <Search className="h-6 w-6 stroke-[1.5]" />
              </button>
            </div>
          </form>

          {/* Small "Surprise Me" Button Underneath */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSurpriseMe}
              className="px-8 py-3 border border-white border-opacity-20 hover:border-opacity-100 rounded-full text-[11px] uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-all cursor-pointer font-mono flex items-center gap-2"
            >
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span>Surprise Me</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Footer Decorative Labels */}
      <div className="z-10 mt-auto flex justify-between items-end opacity-30 text-[9px] sm:text-[10px] uppercase tracking-widest font-mono">
        <div className="flex flex-col gap-1 text-left">
          <span>Curiosity driven</span>
          <span>Visual Dependency Graphs</span>
        </div>
        <div className="text-right flex flex-col gap-1">
          <span>EST. 2026</span>
          <span>Knowledge Mapping System</span>
        </div>
      </div>

      {/* Subtle Sketch Background Vectors */}
      <div className="absolute -bottom-20 -right-20 opacity-10 pointer-events-none z-0">
        <svg width="400" height="400" viewBox="0 0 400 400">
          <path d="M10,200 Q150,10 390,200 T10,390" fill="none" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
          <circle cx="200" cy="200" r="150" fill="none" stroke="white" strokeWidth="0.5" />
          <path d="M50,50 L350,350 M350,50 L50,350" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
        </svg>
      </div>

      <div className="absolute top-1/4 -left-10 opacity-10 rotate-12 pointer-events-none z-0">
        <div className="w-32 h-32 border border-white" style={{ borderRadius: '44% 56% 67% 33% / 46% 34% 66% 54%' }} />
      </div>
    </div>
  );
};
