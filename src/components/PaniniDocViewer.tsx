// src/components/PaniniDocViewer.tsx
import React from 'react';
import { BookOpen, Sparkles, Cpu, Zap, ArrowRight, Layers } from 'lucide-react';

export const PaniniDocViewer: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="border border-neutral-800 bg-neutral-900/60 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Pāṇini’s Aṣṭādhyāyī (c. 500 BCE) ➔ Tier-0 Compiler Architecture</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 font-serif">
          The Algorithmic Foundations of Skrit-bit
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-3xl">
          Skrit-bit is a programming language and virtual machine directly modeling the computational
          architecture invented by Pāṇini in the <em>Aṣṭādhyāyī</em>—the world's first formal generative grammar.
          Rather than viewing Sanskrit grammar as an artifact of antiquity, Skrit-bit maps its core meta-rules
          directly into compiler passes, hardware bitmasks, and reference-counted memory liberation.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Siva Sutras */}
        <div className="border border-neutral-800 bg-neutral-900/40 rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>1. Śiva Sūtras & Dual-Script Invariance</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Pāṇini sorted phonemes into 14 sequences terminated by dummy markers (<em>Anubandhas</em>). A range
              is addressed concisely as a <em>Pratyāhāra</em> (e.g. <strong>अच् / AC</strong> for all vowels, <strong>हल् / HAL</strong> for all consonants).
            </p>
            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 font-mono text-[11px] text-sky-300 space-y-1">
              <div>// Compile-time bitmask generation in Rust:</div>
              <div className="text-neutral-400">const fn generate_pratyahara(s, e) -&gt; u64</div>
              <div className="text-emerald-400">MASK_AC:  (1 &lt;&lt; 9) - (1 &lt;&lt; 0) = 0x01FF</div>
              <div className="text-amber-400">MASK_HAL: (1 &lt;&lt; 42) - (1 &lt;&lt; 9)</div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              <strong>Dual-Script Invariance:</strong> Whether the developer writes <code className="text-emerald-300 font-mono">'क'</code> or <code className="text-emerald-300 font-mono">'k'</code>,
              the lexer indexes to the exact same bit position (14). The entire AST, compiler, and VM remain completely script-agnostic.
            </p>
          </div>
        </div>

        {/* 2. Anuvritti */}
        <div className="border border-neutral-800 bg-neutral-900/40 rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>2. Anuvṛtti (Context-Flowing AST)</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              In traditional grammars, repeating words in every rule produces unmanageable verbosity.
              Pāṇini invented <em>Anuvṛtti</em>: grammatical context that silently cascades downstream across rules until explicitly canceled.
            </p>
            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 font-mono text-[11px] text-emerald-300 space-y-1">
              <div className="text-neutral-500">// Line 1: Explicit subject declaration</div>
              <div className="text-white">k = [1, 2, 3] <span className="text-emerald-400">// active_var = Some('k')</span></div>
              <div className="text-neutral-500 mt-1">// Line 2: Incomplete rule! Left subject omitted</div>
              <div className="text-amber-300">+ 5 <span className="text-emerald-400">// Injects Var('k') dynamically!</span></div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              In Skrit-bit, the parser implements <code className="text-amber-300 font-mono">AnuvrittiContext</code>. Writing <code className="text-amber-300 font-mono">+ 5</code> does
              not throw a syntax error; instead, it automatically resolves to <code className="text-emerald-300 font-mono">k + 5</code>.
            </p>
          </div>
        </div>

        {/* 3. Tripadi Pass */}
        <div className="border border-neutral-800 bg-neutral-900/40 rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
              <Layers className="w-4 h-4" />
              <span>3. The Tripādī Pass (SSA Bytecode Lowering)</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              The last three sections of the Aṣṭādhyāyī (the Tripādī) operate under the meta-rule <em>Pūrvatrāsiddham</em> (8.2.1):
              rules in this section cannot trigger earlier rules recursively.
            </p>
            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 font-mono text-[11px] text-purple-300 space-y-1">
              <div>AST Tree (Recursive Branching)</div>
              <div className="text-neutral-500">  └─▶ Lowered via Post-Order Traversal</div>
              <div className="text-white">Chunk Bytecode: [OP_CONSTANT #0, OP_CONSTANT #1, OP_ADD, OP_RETURN]</div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              In our compiler backend, the Tripādī pass destroys all recursive AST branches and emits a purely linear,
              flat Static Single Assignment (SSA) bytecode chunk suitable for a Tier-0 stack machine.
            </p>
          </div>
        </div>

        {/* 4. Moksa Memory */}
        <div className="border border-neutral-800 bg-neutral-900/40 rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Zap className="w-4 h-4" />
              <span>4. Mokṣa (Functional But In-Place Mutation)</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Pure functional languages incur heavy garbage collection and cloning overhead. Skrit-bit implements
              <strong>Mokṣa (Liberation)</strong> using Rust's reference counting (<code className="text-amber-300 font-mono">Rc::strong_count</code>).
            </p>
            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 font-mono text-[11px] text-amber-300 space-y-1">
              <div className="text-emerald-400">if rc.strong_count == 1:</div>
              <div className="text-white">  ⚡ MOKṢA: In-place destructive append (O(1) time)</div>
              <div className="text-sky-400">else:</div>
              <div className="text-white">  ❄️ NITYA: Copy-on-write clone (O(n) time)</div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              When a variable is the sole owner of an array, appending an element executes directly in hardware memory
              without re-allocation, retaining mathematical purity while achieving bare-metal performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
