// src/components/RustWorkspaceModal.tsx
import React, { useState } from 'react';
import { RUST_WORKSPACE_FILES, RustFile } from '../skrit/rustSources';
import { FileCode, Copy, Check, Terminal, FolderTree, FileText } from 'lucide-react';

export const RustWorkspaceViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<RustFile>(RUST_WORKSPACE_FILES[3]); // skrit-core/src/lexer.rs by default
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Intro ribbon */}
      <div className="border border-neutral-800 bg-neutral-900/50 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            Pristine Rust Compiler Workspace (`skrit_bit_project`)
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Complete, production-ready Rust crates: <code className="text-amber-300 font-mono">skrit-core</code>, <code className="text-amber-300 font-mono">skrit-wasm</code>, and the <code className="text-amber-300 font-mono">build.sh</code> deployment pipeline.
          </p>
        </div>

        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied File!' : 'Copy Current File'}</span>
        </button>
      </div>

      {/* Workspace Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[580px]">
        {/* Left Sidebar: File Tree */}
        <div className="border border-neutral-800 bg-neutral-900/40 rounded-lg p-3 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 pb-2 border-b border-neutral-800">
            <FolderTree className="w-4 h-4 text-amber-400" />
            <span>Workspace Files</span>
          </div>

          <div className="space-y-1 text-xs font-mono">
            {RUST_WORKSPACE_FILES.map((f) => {
              const isSelected = f.path === selectedFile.path;
              return (
                <button
                  key={f.path}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left px-2.5 py-2 rounded flex items-center gap-2 transition-colors ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                      : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
                  }`}
                >
                  {f.path.endsWith('.rs') ? (
                    <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  ) : f.path.endsWith('.toml') ? (
                    <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className="truncate">{f.path}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Display */}
        <div className="lg:col-span-3 border border-neutral-800 bg-neutral-950 rounded-lg flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-amber-400">{selectedFile.path}</span>
              <span className="text-xs text-neutral-500 hidden sm:inline">·</span>
              <span className="text-xs text-neutral-400 hidden sm:inline">{selectedFile.description}</span>
            </div>
            <button
              onClick={copyCode}
              className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 font-mono"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-auto">
            <pre className="font-mono text-xs text-neutral-200 leading-relaxed whitespace-pre">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
