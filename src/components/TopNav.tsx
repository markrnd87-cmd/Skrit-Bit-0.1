// src/components/TopNav.tsx
import React from 'react';
import { Play, RotateCcw, StepForward, Code2, Cpu, BookOpen, Layers } from 'lucide-react';

interface TopNavProps {
  activeTab: 'studio' | 'siva' | 'rust' | 'panini';
  setActiveTab: (tab: 'studio' | 'siva' | 'rust' | 'panini') => void;
  onRun: () => void;
  onStep: () => void;
  onReset: () => void;
  isDebugging: boolean;
  canStep: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onRun,
  onStep,
  onReset,
  isDebugging,
  canStep,
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#studio"
          onClick={(e) => { e.preventDefault(); setActiveTab('studio'); }}
          className="text-lg font-bold tracking-tight text-neutral-100 flex items-center gap-2 group"
        >
          <span className="font-serif text-amber-400 group-hover:text-amber-300 transition-colors">Ś</span>
          <span>Skrit-bit</span>
          <span className="text-xs font-mono font-normal text-neutral-500 hidden sm:inline">Pāṇinian ITP</span>
        </a>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
        <button
          onClick={() => setActiveTab('studio')}
          className={`flex items-center gap-1.5 transition-colors pb-0.5 border-b-2 ${
            activeTab === 'studio'
              ? 'text-amber-400 border-amber-400 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200 border-transparent'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Compiler Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('siva')}
          className={`flex items-center gap-1.5 transition-colors pb-0.5 border-b-2 ${
            activeTab === 'siva'
              ? 'text-amber-400 border-amber-400 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200 border-transparent'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Śiva Sūtras 64-Bit</span>
        </button>

        <button
          onClick={() => setActiveTab('rust')}
          className={`flex items-center gap-1.5 transition-colors pb-0.5 border-b-2 ${
            activeTab === 'rust'
              ? 'text-amber-400 border-amber-400 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200 border-transparent'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Rust Crates & WASM</span>
        </button>

        <button
          onClick={() => setActiveTab('panini')}
          className={`flex items-center gap-1.5 transition-colors pb-0.5 border-b-2 ${
            activeTab === 'panini'
              ? 'text-amber-400 border-amber-400 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200 border-transparent'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Pāṇinian Architecture</span>
        </button>
      </nav>

      {/* Zone 3: 1-2 primary execution actions */}
      <div className="flex items-center gap-2.5">
        {isDebugging ? (
          <>
            <button
              onClick={onStep}
              disabled={!canStep}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                canStep
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
              }`}
            >
              <StepForward className="w-3.5 h-3.5" />
              <span>Step IP</span>
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 transition-colors"
              title="Reset VM"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </>
        ) : null}

        <button
          onClick={onRun}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-amber-500 text-neutral-950 hover:bg-amber-400 active:scale-[0.98] transition-all shadow-sm shadow-amber-500/20 whitespace-nowrap"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Compile & Run</span>
        </button>
      </div>
    </header>
  );
};
