// src/components/BytecodeViewer.tsx
import React from 'react';
import { DisassembledInstruction } from '../skrit/types';
import { Binary, Box } from 'lucide-react';

interface BytecodeViewerProps {
  bytecode: number[];
  disassembly: DisassembledInstruction[];
  currentIp?: number;
}

export const BytecodeViewer: React.FC<BytecodeViewerProps> = ({
  bytecode,
  disassembly,
  currentIp,
}) => {
  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-neutral-200">
            Tripādī Linear Bytecode (Non-Recursive SSA)
          </span>
        </div>
        <span className="text-[11px] font-mono text-neutral-500">
          {bytecode.length} total {bytecode.length === 1 ? 'byte' : 'bytes'}
        </span>
      </div>

      {/* Disassembled instructions table */}
      <div className="flex-1 overflow-y-auto">
        {disassembly.length === 0 ? (
          <div className="text-xs text-neutral-500 font-mono italic p-4 text-center">
            Awaiting compilation to generate bytecode chunk...
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-[11px]">
                <th className="py-1.5 px-2 font-medium w-16">Offset</th>
                <th className="py-1.5 px-2 font-medium w-20">Hex</th>
                <th className="py-1.5 px-2 font-medium">Instruction</th>
                <th className="py-1.5 px-2 font-medium">Operands / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {disassembly.map((inst) => {
                const isCurrent = currentIp !== undefined && inst.offset === currentIp;
                return (
                  <tr
                    key={inst.offset}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-amber-500/20 text-amber-200 font-bold border-l-2 border-amber-400'
                        : 'hover:bg-neutral-900/60 text-neutral-300'
                    }`}
                  >
                    <td className="py-1.5 px-2 text-neutral-500 text-[11px]">
                      {isCurrent ? '▶ ' : ''}{inst.offset.toString().padStart(4, '0')}
                    </td>
                    <td className="py-1.5 px-2 text-sky-400">
                      0x{inst.byte.toString(16).padStart(2, '0').toUpperCase()}
                    </td>
                    <td className="py-1.5 px-2 font-semibold text-neutral-100">
                      {inst.opcodeName}
                    </td>
                    <td className="py-1.5 px-2 text-neutral-400 text-[11px]">
                      {inst.arg && (
                        <span className="text-amber-300 font-medium mr-2">
                          {inst.arg}
                        </span>
                      )}
                      <span className="text-neutral-500">{inst.comment}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Raw Byte Array footer strip */}
      {bytecode.length > 0 && (
        <div className="pt-2 border-t border-neutral-800 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
            <Box className="w-3 h-3" />
            <span>Raw Byte Stream:</span>
          </div>
          <div className="bg-neutral-950 p-2 rounded border border-neutral-800 flex flex-wrap gap-1 text-sky-400">
            {bytecode.map((b, idx) => (
              <span
                key={idx}
                className={`px-1 py-0.5 rounded text-[10px] ${
                  currentIp === idx
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'bg-neutral-900 text-neutral-300'
                }`}
                title={`Offset ${idx}`}
              >
                {b.toString(16).padStart(2, '0').toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
