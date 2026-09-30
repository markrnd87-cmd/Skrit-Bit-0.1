// src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { TopNav } from './components/TopNav';
import { SivaSutraVisualizer } from './components/SivaSutraVisualizer';
import { AstInspector } from './components/AstInspector';
import { BytecodeViewer } from './components/BytecodeViewer';
import { VmInspector } from './components/VmInspector';
import { RustWorkspaceViewer } from './components/RustWorkspaceModal';
import { PaniniDocViewer } from './components/PaniniDocViewer';
import { runSkritBit, SkritBitRunResult } from './skrit/engine';
import { VM } from './skrit/vm';
import { Chunk } from './skrit/compiler';
import {
  Sparkles,
  Zap,
  Cpu,
  Binary,
  GitBranch,
  Terminal,
  Languages,
  Maximize2,
  Grid2X2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  code: string;
  description: string;
  concept: string;
}

const PRESETS: Preset[] = [
  {
    id: 'moksa',
    name: 'Mokṣa (In-Place Mutation)',
    code: `k = [1, 2, 3]\n+ 5`,
    description: "Notice how '+ 5' has no left-hand subject. The parser dynamically infers 'k' via Anuvṛtti. Because Rc::strong_count == 1, the VM triggers destructive in-place append (O(1) time).",
    concept: 'Anuvṛtti + Mokṣa (Rc == 1)',
  },
  {
    id: 'nitya',
    name: 'Nitya (Aliased COW)',
    code: `a = [1, 2, 3]\nb = a\n+ 99`,
    description: "Variable 'a' is aliased to 'b', raising the reference count to 2. Appending 99 triggers Nitya (Copy-On-Write) to preserve referential transparency.",
    concept: 'Nitya Immutability (Rc > 1)',
  },
  {
    id: 'devanagari',
    name: 'Dual-Script (Devanagari)',
    code: `क = [१, २, ३]\n+ ५`,
    description: "Full Devanagari script representation. The Śiva Sūtra bitmask engine maps 'क' and 'k' to identical bit 14, yielding an identical AST and bytecode.",
    concept: 'Dual-Script Invariance',
  },
  {
    id: 'cascade',
    name: 'Cascading Anuvṛtti',
    code: `x = 10\n+ 5\n+ 20`,
    description: "Multiple chained incomplete rules. 'x' flows continuously across Sūtras 2 and 3 without repeated declarations.",
    concept: 'Multi-Sūtra Context Flow',
  },
  {
    id: 'math',
    name: 'Numeric Addition',
    code: `क = २५\n+ ७५`,
    description: "Devanagari numerals (२५ + ७५) parsed and evaluated in the Tier-0 Stack VM.",
    concept: 'Devanagari Arithmetic',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'siva' | 'rust' | 'panini'>('studio');
  const [activePreset, setActivePreset] = useState<string>('moksa');
  const [sourceCode, setSourceCode] = useState<string>(PRESETS[0].code);

  // Compiler results state
  const [runResult, setRunResult] = useState<SkritBitRunResult | null>(null);

  // Active panel focus in studio: 'grid' (2x2) or individual panel name
  const [activePanel, setActivePanel] = useState<'grid' | 'lexer' | 'ast' | 'bytecode' | 'vm'>('grid');

  // Interactive VM Step Debugger state
  const [isDebugging, setIsDebugging] = useState<boolean>(false);
  const [stepVm, setStepVm] = useState<VM | null>(null);
  const [canStep, setCanStep] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Run compiler on mount or preset switch
  useEffect(() => {
    handleCompileAndRun();
  }, []);

  const handleCompileAndRun = () => {
    const res = runSkritBit(sourceCode);
    setRunResult(res);
    setIsDebugging(false);
    setStepVm(null);
    setCanStep(false);
  };

  const handleStartDebugging = () => {
    const res = runSkritBit(sourceCode);
    setRunResult(res);

    if (res.bytecode.length > 0 && !res.error) {
      // Create fresh VM from compiled chunk
      const chunk = new Chunk();
      chunk.code = [...res.bytecode];
      chunk.constants = res.vmInstance ? res.vmInstance.chunk.constants : [];
      const newVm = new VM(chunk);
      setStepVm(newVm);
      setIsDebugging(true);
      setCanStep(true);
      setActivePanel('vm');
    }
  };

  const handleStepVm = () => {
    if (!stepVm || stepVm.isHalted) {
      setCanStep(false);
      return;
    }

    const outcome = stepVm.step();
    // Force re-render of VM state
    setStepVm(Object.assign(Object.create(Object.getPrototypeOf(stepVm)), stepVm));
    if (outcome.halted) {
      setCanStep(false);
    }
  };

  const handleResetVm = () => {
    if (stepVm) {
      stepVm.reset();
      setStepVm(Object.assign(Object.create(Object.getPrototypeOf(stepVm)), stepVm));
      setCanStep(true);
    }
  };

  const handleRunToEnd = () => {
    if (stepVm) {
      while (!stepVm.isHalted && stepVm.cycle < 10000) {
        stepVm.step();
      }
      setStepVm(Object.assign(Object.create(Object.getPrototypeOf(stepVm)), stepVm));
      setCanStep(false);
    }
  };

  const handleSelectPreset = (p: Preset) => {
    setActivePreset(p.id);
    setSourceCode(p.code);
    const res = runSkritBit(p.code);
    setRunResult(res);
    setIsDebugging(false);
    setStepVm(null);
    setCanStep(false);
  };

  // Dual-Script Invariance Toggle: Convert ASCII <-> Devanagari
  const handleToggleScript = () => {
    // Check if current text contains Devanagari
    const hasDevanagari = /[\u0900-\u097F]/.test(sourceCode);

    if (hasDevanagari) {
      // Convert Devanagari to Latin ASCII
      let converted = sourceCode;
      const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      devanagariDigits.forEach((d, i) => {
        converted = converted.replaceAll(d, String(i));
      });
      converted = converted.replaceAll('क', 'k');
      converted = converted.replaceAll('अ', 'a');
      converted = converted.replaceAll('x', 'x');
      setSourceCode(converted);
      setRunResult(runSkritBit(converted));
    } else {
      // Convert Latin ASCII to Devanagari
      let converted = sourceCode;
      const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
      devanagariDigits.forEach((d, i) => {
        converted = converted.replaceAll(String(i), d);
      });
      converted = converted.replaceAll('k', 'क');
      converted = converted.replaceAll('a', 'अ');
      setSourceCode(converted);
      setRunResult(runSkritBit(converted));
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to run
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCompileAndRun();
    }
  };

  const activeVm = stepVm || (runResult ? runResult.vmInstance || null : null);
  const activeLogs = stepVm ? stepVm.executionLog : (runResult ? runResult.executionLog : []);
  const activeResult = stepVm ? (stepVm.isHalted ? stepVm.finalResult : 'In Progress...') : (runResult ? runResult.vmResult : '');
  const activeCurrentIp = stepVm ? stepVm.ip : undefined;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar following contract */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRun={handleCompileAndRun}
        onStep={handleStepVm}
        onReset={handleResetVm}
        isDebugging={isDebugging}
        canStep={canStep}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 flex flex-col">
        {activeTab === 'siva' && (
          <SivaSutraVisualizer currentTokens={runResult ? runResult.tokens : []} />
        )}

        {activeTab === 'rust' && <RustWorkspaceViewer />}

        {activeTab === 'panini' && <PaniniDocViewer />}

        {activeTab === 'studio' && (
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch min-h-[calc(100vh-120px)]">
            {/* LEFT COLUMN: Source Editor, Presets & Script Converter (5 cols) */}
            <section className="xl:col-span-5 flex flex-col gap-4">
              {/* Presets Bar */}
              <div className="border border-neutral-800 bg-neutral-900/60 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Pāṇinian Architectural Presets
                  </span>
                  <span className="text-[11px] text-neutral-500 hidden sm:inline">Select test script</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                  {PRESETS.map((p) => {
                    const isSelected = activePreset === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPreset(p)}
                        className={`px-2.5 py-1.5 rounded-lg text-left truncate border transition-all ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 font-semibold shadow-sm'
                            : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                        }`}
                      >
                        <span className="block truncate">{p.name}</span>
                        <span className="block text-[10px] text-neutral-500 truncate mt-0.5">{p.concept}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Code Editor Box */}
              <div className="border border-neutral-800 bg-neutral-900/40 rounded-xl p-4 flex-1 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                      Skrit-bit Source
                    </h2>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      (Dual-Script Invariant)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={handleToggleScript}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-amber-300 transition-colors"
                      title="Convert script between Latin ASCII and Devanagari"
                    >
                      <Languages className="w-3.5 h-3.5 text-amber-400" />
                      <span>Latin ⇄ Devanagari</span>
                    </button>
                  </div>
                </div>

                {/* Textarea */}
                <div className="flex-1 relative flex flex-col">
                  <textarea
                    ref={textareaRef}
                    value={sourceCode}
                    onChange={(e) => setSourceCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    spellCheck="false"
                    className="w-full flex-1 min-h-[190px] font-mono text-base bg-neutral-950 text-amber-300/90 border border-neutral-800 rounded-lg p-4 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-none leading-relaxed selection:bg-amber-500/30 selection:text-amber-100"
                    placeholder="Enter Skrit-bit rules, e.g.&#10;k = [1, 2, 3]&#10;+ 5"
                  />
                  <div className="absolute bottom-2.5 right-3 text-[10px] text-neutral-600 font-mono pointer-events-none">
                    ⌘+Enter to Run
                  </div>
                </div>

                {/* Run / Step Controls */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCompileAndRun}
                    className="flex-1 py-2 px-4 bg-amber-500 text-neutral-950 font-semibold text-xs rounded-lg hover:bg-amber-400 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-amber-500/20"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Compile & Evaluate</span>
                  </button>

                  <button
                    onClick={handleStartDebugging}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                      isDebugging
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-850'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span>{isDebugging ? 'Debugging Active' : 'Step Debug'}</span>
                  </button>
                </div>
              </div>

              {/* Architectural Explanation Card */}
              <div className="border border-neutral-800 bg-neutral-900/50 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-neutral-200 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pāṇinian Mechanisms In This Script</span>
                </div>
                <ul className="space-y-1.5 text-neutral-400 leading-relaxed text-[11px] list-disc list-inside">
                  <li>
                    <strong className="text-neutral-200">Anuvṛtti (Context Flow):</strong> Incomplete Sūtras like <code className="text-amber-300 font-mono">+ 5</code> lack a subject operand; the parser dynamically binds the active subject from the preceding rule.
                  </li>
                  <li>
                    <strong className="text-neutral-200">Mokṣa (Liberation):</strong> If reference count is 1, the VM triggers destructive in-place append at hardware speed ($O(1)$) instead of reallocating.
                  </li>
                  <li>
                    <strong className="text-neutral-200">Tripādī Pass:</strong> The compiler lowers recursive syntax trees into non-recursive linear bytecode based on <em>Pūrvatrāsiddham</em>.
                  </li>
                </ul>
              </div>
            </section>

            {/* RIGHT COLUMN: 4 Pipeline Panels (7 cols) */}
            <section className="xl:col-span-7 flex flex-col gap-3 min-h-[640px]">
              {/* Panel Switcher Strip */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setActivePanel('grid')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                      activePanel === 'grid'
                        ? 'bg-neutral-800 text-neutral-100 font-medium'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Grid2X2 className="w-3.5 h-3.5" />
                    <span>2x2 Pipeline</span>
                  </button>

                  <button
                    onClick={() => setActivePanel('lexer')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                      activePanel === 'lexer'
                        ? 'bg-neutral-800 text-sky-300 font-medium'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>1. Lexer</span>
                  </button>

                  <button
                    onClick={() => setActivePanel('ast')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                      activePanel === 'ast'
                        ? 'bg-neutral-800 text-emerald-300 font-medium'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>2. AST</span>
                  </button>

                  <button
                    onClick={() => setActivePanel('bytecode')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                      activePanel === 'bytecode'
                        ? 'bg-neutral-800 text-purple-300 font-medium'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Binary className="w-3.5 h-3.5" />
                    <span>3. Bytecode</span>
                  </button>

                  <button
                    onClick={() => setActivePanel('vm')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                      activePanel === 'vm'
                        ? 'bg-neutral-800 text-amber-300 font-medium'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>4. VM Result</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
                  {runResult?.error ? (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Syntax / Runtime Error
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Compiled Cleanly
                    </span>
                  )}
                </div>
              </div>

              {/* Panels Display: 2x2 Grid or Single Expanded Panel */}
              {activePanel === 'grid' ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Panel 1: Lexer */}
                  <div className="border border-neutral-800 bg-neutral-900/40 rounded-xl p-3.5 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
                      <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5" />
                        1. Lexer (Śiva Sūtras)
                      </span>
                      <button
                        onClick={() => setActivePanel('lexer')}
                        className="text-neutral-500 hover:text-neutral-300"
                        title="Expand panel"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px]">
                      {(!runResult || runResult.tokens.length === 0) ? (
                        <div className="text-neutral-600 italic py-4 text-center">No tokens.</div>
                      ) : (
                        runResult.tokens.map((t, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between px-2 py-1 rounded bg-neutral-950/80 border border-neutral-850 hover:border-neutral-700 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-600 w-4 text-[10px]">{idx}</span>
                              <span className="text-sky-300 font-bold font-mono">
                                '{t.rawChar}'
                              </span>
                              <span className="text-neutral-500 text-[10px]">
                                (L{t.line}:C{t.col})
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {t.sivaBit !== undefined && (
                                <span className="text-amber-400/90 text-[10px] bg-amber-950/40 px-1 py-0.5 rounded border border-amber-900/50">
                                  Bit {t.sivaBit}
                                </span>
                              )}
                              <span className="text-[10px] text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded">
                                {t.type}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Panel 2: AST */}
                  <div className="border border-neutral-800 bg-neutral-900/40 rounded-xl p-3.5 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5" />
                        2. AST (Anuvṛtti Propagation)
                      </span>
                      <button
                        onClick={() => setActivePanel('ast')}
                        className="text-neutral-500 hover:text-neutral-300"
                        title="Expand panel"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <AstInspector
                        ast={runResult ? runResult.ast : []}
                        history={runResult ? runResult.anuvrittiHistory : []}
                        rawAstString={runResult ? runResult.astString : ''}
                      />
                    </div>
                  </div>

                  {/* Panel 3: Bytecode */}
                  <div className="border border-neutral-800 bg-neutral-900/40 rounded-xl p-3.5 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
                      <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                        <Binary className="w-3.5 h-3.5" />
                        3. VM Bytecode (Tripādī Pass)
                      </span>
                      <button
                        onClick={() => setActivePanel('bytecode')}
                        className="text-neutral-500 hover:text-neutral-300"
                        title="Expand panel"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <BytecodeViewer
                        bytecode={runResult ? runResult.bytecode : []}
                        disassembly={runResult ? runResult.disassembly : []}
                        currentIp={activeCurrentIp}
                      />
                    </div>
                  </div>

                  {/* Panel 4: VM Execution & Moksa */}
                  <div className="border border-neutral-800 bg-neutral-900/40 rounded-xl p-3.5 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
                      <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        4. Execution & Mokṣa Result
                      </span>
                      <button
                        onClick={() => setActivePanel('vm')}
                        className="text-neutral-500 hover:text-neutral-300"
                        title="Expand panel"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <VmInspector
                        vm={activeVm}
                        logs={activeLogs}
                        finalResult={activeResult}
                        error={runResult ? runResult.error : null}
                        isDebugging={isDebugging}
                        onStep={handleStepVm}
                        onReset={handleResetVm}
                        onRunToEnd={handleRunToEnd}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Single Expanded Panel Mode */
                <div className="flex-1 border border-neutral-800 bg-neutral-900/40 rounded-xl p-4 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-200">
                        {activePanel === 'lexer' && '1. Lexer (Śiva Sūtras - Dual-Script Tokenizer)'}
                        {activePanel === 'ast' && '2. AST (Anuvṛtti Context Flow Engine)'}
                        {activePanel === 'bytecode' && '3. VM Bytecode (Tripādī Flattening Pass)'}
                        {activePanel === 'vm' && '4. VM Execution & Mokṣa Memory Mutation'}
                      </span>
                    </div>
                    <button
                      onClick={() => setActivePanel('grid')}
                      className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 font-mono"
                    >
                      <Grid2X2 className="w-3.5 h-3.5" />
                      <span>Back to 2x2 Grid</span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {activePanel === 'lexer' && (
                      <div className="space-y-2 font-mono text-xs">
                        <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 mb-3 flex items-center justify-between">
                          <span className="text-neutral-400">Total Tokens Parsed:</span>
                          <span className="text-amber-400 font-bold">{runResult?.tokens.length || 0}</span>
                        </div>
                        {runResult?.tokens.map((t, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded bg-neutral-950 border border-neutral-850"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-neutral-500 w-6">#{idx + 1}</span>
                              <span className="text-sky-300 font-bold text-sm">'{t.rawChar}'</span>
                              <span className="text-neutral-400">Type: <strong className="text-neutral-200">{t.type}</strong></span>
                              <span className="text-neutral-500">Pos: {t.line}:{t.col}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {t.sivaBit !== undefined && (
                                <span className="bg-amber-950/60 border border-amber-900/60 text-amber-300 px-2 py-0.5 rounded text-[11px]">
                                  Siva Bit {t.sivaBit}
                                </span>
                              )}
                              <span className="text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded text-[11px]">
                                {t.bitCategory}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activePanel === 'ast' && (
                      <AstInspector
                        ast={runResult ? runResult.ast : []}
                        history={runResult ? runResult.anuvrittiHistory : []}
                        rawAstString={runResult ? runResult.astString : ''}
                      />
                    )}

                    {activePanel === 'bytecode' && (
                      <BytecodeViewer
                        bytecode={runResult ? runResult.bytecode : []}
                        disassembly={runResult ? runResult.disassembly : []}
                        currentIp={activeCurrentIp}
                      />
                    )}

                    {activePanel === 'vm' && (
                      <VmInspector
                        vm={activeVm}
                        logs={activeLogs}
                        finalResult={activeResult}
                        error={runResult ? runResult.error : null}
                        isDebugging={isDebugging}
                        onStep={handleStepVm}
                        onReset={handleResetVm}
                        onRunToEnd={handleRunToEnd}
                      />
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Footer following Anti-Slop Guidelines (Quiet copyright & links, no ornamental tickers) */}
      <footer className="border-t border-neutral-900 px-6 py-4 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-400">Skrit-bit Compiler & VM</span>
          <span>·</span>
          <span>Pāṇinian Algorithmic Grammar Architecture</span>
        </div>
        <div className="flex items-center gap-4 text-neutral-500">
          <span>Dual-Script Invariant (Devanagari / ASCII)</span>
          <span>·</span>
          <span>Tripādī SSA Lowering</span>
          <span>·</span>
          <span>Mokṣa In-Place Mutation</span>
        </div>
      </footer>
    </div>
  );
}
