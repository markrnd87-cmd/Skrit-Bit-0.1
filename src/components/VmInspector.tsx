// src/components/VmInspector.tsx
import React from 'react';
import { VM } from '../skrit/vm';
import { VMLogEntry } from '../skrit/types';
import { Terminal, Zap, ShieldAlert, Cpu, Database, StepForward, RotateCcw } from 'lucide-react';

interface VmInspectorProps {
  vm: VM | null;
  logs: VMLogEntry[];
  finalResult: string;
  error?: string | null;
  isDebugging: boolean;
  onStep: () => void;
  onReset: () => void;
  onRunToEnd: () => void;
}

export const VmInspector: React.FC<VmInspectorProps> = ({
  vm,
  logs,
  finalResult,
  error,
  isDebugging,
  onStep,
  onReset,
  onRunToEnd,
}) => {
  const stack = vm ? vm.stack : [];
  const variables = vm ? Array.from(vm.variables.entries()) : [];
  const heap = vm ? Array.from(vm.memoryHeap.values()) : [];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-neutral-200">
            Tier-0 VM & Mokṣa Memory Mutation Inspector
          </span>
        </div>

        {isDebugging && vm && !vm.isHalted && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onStep}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded hover:bg-amber-500/30 transition-colors"
            >
              <StepForward className="w-3 h-3" />
              <span>Step</span>
            </button>
            <button
              onClick={onRunToEnd}
              className="px-2 py-1 text-[11px] font-medium bg-neutral-900 text-neutral-300 border border-neutral-800 rounded hover:bg-neutral-800 transition-colors"
            >
              Finish
            </button>
            <button
              onClick={onReset}
              className="p-1 text-neutral-400 hover:text-neutral-200 rounded hover:bg-neutral-800 transition-colors"
              title="Reset VM"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Error Banner if any */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-lg p-3 text-xs text-rose-300 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">[VM EXECUTION ERROR]</span>
            <span className="font-mono mt-0.5 block">{error}</span>
          </div>
        </div>
      )}

      {/* Final Result Banner */}
      {!error && finalResult && (
        <div className="bg-emerald-950/20 border border-emerald-900/60 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-neutral-400">Final Evaluated Output:</span>
            <span className="text-sm font-mono font-bold text-emerald-300">
              {finalResult}
            </span>
          </div>
          {vm && (
            <span className="text-[11px] font-mono text-neutral-500">
              {vm.cycle} cycles executed
            </span>
          )}
        </div>
      )}

      {/* VM Machine State Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Operand Stack */}
        <div className="border border-neutral-800 bg-neutral-900/40 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              Operand Stack ({stack.length})
            </span>
            <span className="text-[10px] text-neutral-500">LIFO</span>
          </div>

          <div className="bg-neutral-950 rounded p-2 border border-neutral-850 min-h-[70px] flex flex-col justify-end gap-1 font-mono text-[11px]">
            {stack.length === 0 ? (
              <span className="text-neutral-600 italic text-center py-2">Stack is empty</span>
            ) : (
              stack.map((item, idx) => {
                const isTop = idx === stack.length - 1;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between px-2 py-1 rounded ${
                      isTop
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200 font-semibold'
                        : 'bg-neutral-900 text-neutral-300'
                    }`}
                  >
                    <span className="text-[10px] text-neutral-500">
                      {isTop ? 'TOS ▶' : `[${idx}]`}
                    </span>
                    <span>
                      {item.type === 'Num' && <span className="text-amber-300">{item.val}</span>}
                      {item.type === 'VarName' && <span className="text-sky-300">'{item.char}'</span>}
                      {item.type === 'Array' && (
                        <span className="text-emerald-300">[{item.rc.data.join(', ')}]</span>
                      )}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Variables Registry */}
        <div className="border border-neutral-800 bg-neutral-900/40 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              Variables Registry ({variables.length})
            </span>
            <span className="text-[10px] text-neutral-500">Symbol Table</span>
          </div>

          <div className="bg-neutral-950 rounded p-2 border border-neutral-850 min-h-[70px] space-y-1 font-mono text-[11px]">
            {variables.length === 0 ? (
              <span className="text-neutral-600 italic text-center block py-2">No variables bound</span>
            ) : (
              variables.map(([name, val]) => (
                <div key={name} className="flex items-center justify-between px-2 py-1 bg-neutral-900 rounded">
                  <span className="text-purple-300 font-bold">'{name}'</span>
                  <span className="text-neutral-500">=</span>
                  <span className="text-neutral-200">
                    {val.type === 'Array' ? `[${val.rc.data.join(', ')}]` : val.type === 'Num' ? val.val : val.char}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Heap Memory & Mokṣa Allocation Monitor */}
      {heap.length > 0 && (
        <div className="border border-neutral-800 bg-neutral-900/50 rounded-lg p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Rc Heap Pointers (Mokṣa vs Nitya Status)
            </span>
            <span className="text-[11px] text-neutral-500 font-mono">
              std::rc::Rc tracking
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            {heap.map((h) => {
              const isMoksaEligible = h.strongCount <= 1;
              return (
                <div
                  key={h.id}
                  className={`p-2 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isMoksaEligible
                      ? 'bg-amber-950/20 border-amber-900/50 text-neutral-200'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">Ptr:</span>
                    <span className="text-sky-300 font-bold">0x{h.id.toString(16).toUpperCase()}</span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-neutral-400">strong_count:</span>
                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                      h.strongCount === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-neutral-800 text-neutral-300'
                    }`}>
                      {h.strongCount}
                    </span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-emerald-400 font-medium">[{h.data.join(', ')}]</span>
                  </div>

                  <div className="text-[10px]">
                    {isMoksaEligible ? (
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>Mokṣa (O(1) in-place enabled)</span>
                      </span>
                    ) : (
                      <span className="text-sky-400">Nitya (COW on mutation)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Execution Timeline Logs */}
      <div className="flex-1 border border-neutral-800 bg-neutral-950 rounded-lg p-3 flex flex-col space-y-2 overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-850 pb-1.5 text-xs text-neutral-400">
          <span>Execution Log & Mokṣa Triggers</span>
          <span className="text-[11px] font-mono text-neutral-500">{logs.length} entries</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px]">
          {logs.length === 0 ? (
            <div className="text-neutral-600 italic text-center py-4">
              Click 'Compile & Run' to execute bytecode in the Tier-0 VM.
            </div>
          ) : (
            logs.map((log, idx) => {
              let tagColor = 'text-neutral-400 bg-neutral-900 border-neutral-800';
              if (log.type === 'moksa') {
                tagColor = 'text-amber-300 bg-amber-950/40 border-amber-800/80 font-bold';
              } else if (log.type === 'nitya') {
                tagColor = 'text-sky-300 bg-sky-950/40 border-sky-800/80';
              } else if (log.type === 'return') {
                tagColor = 'text-emerald-300 bg-emerald-950/40 border-emerald-800/80 font-semibold';
              }

              return (
                <div
                  key={idx}
                  className={`p-1.5 rounded border text-xs leading-relaxed flex items-start gap-2 ${tagColor}`}
                >
                  <span className="text-[10px] text-neutral-500 shrink-0 font-normal">
                    [C:{log.cycle} IP:{log.ip}]
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold block text-[11px] text-neutral-300">
                      {log.instruction}
                    </span>
                    <span className="text-[11px] opacity-95">{log.message}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
