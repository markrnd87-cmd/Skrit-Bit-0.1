// src/components/AstInspector.tsx
import React, { useState } from 'react';
import { Expr, AnuvrittiContext } from '../skrit/types';
import { GitBranch, Sparkles, Copy, Check, ArrowDown } from 'lucide-react';

interface AstInspectorProps {
  ast: Expr[];
  history: AnuvrittiContext['history'];
  rawAstString: string;
}

export const AstInspector: React.FC<AstInspectorProps> = ({ ast, history, rawAstString }) => {
  const [viewMode, setViewMode] = useState<'visual' | 'debug'>('visual');
  const [copied, setCopied] = useState(false);

  const copyAst = () => {
    navigator.clipboard.writeText(rawAstString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header with Anuvritti Summary and Tab toggle */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-neutral-200">
            Anuvṛtti Context-Propagating AST
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            ({ast.length} {ast.length === 1 ? 'Sūtra node' : 'Sūtra nodes'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-neutral-900 border border-neutral-800 rounded p-0.5 text-[11px]">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'visual'
                  ? 'bg-neutral-800 text-neutral-100 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Interactive Tree
            </button>
            <button
              onClick={() => setViewMode('debug')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'debug'
                  ? 'bg-neutral-800 text-neutral-100 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Rust Debug Text
            </button>
          </div>

          <button
            onClick={copyAst}
            className="p-1 text-neutral-400 hover:text-neutral-200 rounded hover:bg-neutral-800 transition-colors"
            title="Copy AST"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Anuvritti Context Audit Ribbon */}
      {history.length > 0 && (
        <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-lg p-3 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Anuvṛtti Context Stream Audit</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-neutral-300">
                <span className="text-neutral-500">Sūtra #{h.ruleIndex}:</span>
                {h.declaredVar && (
                  <span className="text-emerald-300">
                    Declared active subject <strong className="text-white">'{h.declaredVar}'</strong>
                  </span>
                )}
                {h.inheritedVar && (
                  <span className="text-amber-300 flex items-center gap-1">
                    <span>⚡ Incomplete rule dynamically inherited</span>
                    <strong className="text-white bg-amber-500/20 px-1 py-0.5 rounded border border-amber-500/40">
                      '{h.inheritedVar}'
                    </strong>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'visual' ? (
          <div className="space-y-4">
            {ast.length === 0 ? (
              <div className="text-xs text-neutral-500 font-mono italic p-4 text-center">
                Awaiting tokens to generate AST...
              </div>
            ) : (
              ast.map((node, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="border border-neutral-800 bg-neutral-900/60 rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono border-b border-neutral-800/80 pb-2">
                      <span className="text-amber-400 font-semibold">Node #{idx + 1}: {node.kind}</span>
                      <span className="text-neutral-500 text-[10px]">
                        {node.kind === 'Assign' ? 'Variable Binding' : 'Binary Operation'}
                      </span>
                    </div>

                    <AstNodeVisualizer node={node} />
                  </div>

                  {idx < ast.length - 1 && (
                    <div className="flex justify-center text-neutral-600">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <pre className="font-mono text-xs text-neutral-300 bg-neutral-950 p-4 rounded-lg border border-neutral-800 overflow-x-auto whitespace-pre leading-relaxed">
            {rawAstString || '// No AST generated'}
          </pre>
        )}
      </div>
    </div>
  );
};

const AstNodeVisualizer: React.FC<{ node: Expr }> = ({ node }) => {
  switch (node.kind) {
    case 'Assign':
      return (
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="bg-sky-950/60 border border-sky-800 text-sky-300 px-2 py-1 rounded">
              Subject: <strong>'{node.varName}'</strong>
            </span>
            <span className="text-neutral-500">=</span>
            <div className="flex-1 bg-neutral-950 border border-neutral-800 p-2 rounded text-neutral-300">
              <AstNodeVisualizer node={node.rhs} />
            </div>
          </div>
        </div>
      );

    case 'Add':
      return (
        <div className="space-y-2 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Left Branch */}
            <div className="bg-neutral-950 border border-neutral-800 p-2 rounded space-y-1">
              <span className="text-[10px] text-neutral-500 block">Left Operand (LHS):</span>
              <AstNodeVisualizer node={node.left} />
            </div>

            {/* Right Branch */}
            <div className="bg-neutral-950 border border-neutral-800 p-2 rounded space-y-1">
              <span className="text-[10px] text-neutral-500 block">Right Operand (RHS):</span>
              <AstNodeVisualizer node={node.right} />
            </div>
          </div>

          {node.inheritedVar && (
            <div className="text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-900/50 p-1.5 rounded flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>
                <strong>Anuvṛtti Active:</strong> LHS omitted in source code; dynamically inherited variable '{node.inheritedVar}'.
              </span>
            </div>
          )}
        </div>
      );

    case 'Var':
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-400">Var:</span>
          <span className="font-bold text-white bg-neutral-800 px-1.5 py-0.5 rounded">
            '{node.name}'
          </span>
          {node.inferredFromAnuvritti && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded">
              ⚡ Anuvṛtti Inferred
            </span>
          )}
        </div>
      );

    case 'Array':
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-400">Array:</span>
          <span className="text-emerald-400 font-bold">
            [{node.elements.join(', ')}]
          </span>
          <span className="text-[10px] text-neutral-500">
            ({node.elements.length} elements)
          </span>
        </div>
      );

    case 'Num':
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-400">Literal:</span>
          <span className="text-amber-400 font-bold">{node.value}</span>
        </div>
      );
  }
};
