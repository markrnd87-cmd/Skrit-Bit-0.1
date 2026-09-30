// src/components/SivaSutraVisualizer.tsx
import React, { useState } from 'react';
import { startIdx, endIdx, generatePratyahara, MASK_AC, MASK_HAL, formatBitmask64 } from '../skrit/lexer';
import { Token } from '../skrit/types';
import { Cpu, Binary, CheckCircle2, XCircle } from 'lucide-react';

interface SivaSutraVisualizerProps {
  currentTokens?: Token[];
}

const SIVA_SUTRAS = [
  { no: 1, text: 'अइउण्', latin: 'a-i-u-N', it: 'ण् / N', itIdx: 3, desc: 'Vowels 1' },
  { no: 2, text: 'ऋऌक्', latin: 'f-x-K', it: 'क् / K', itIdx: 5, desc: 'Vowels 2' },
  { no: 3, text: 'एओङ्', latin: 'e-o-W', it: 'ङ् / W', itIdx: 7, desc: 'Diphthongs 1' },
  { no: 4, text: 'ऐऔच्', latin: 'E-O-c', it: 'च् / c', itIdx: 9, desc: 'Diphthongs 2 (completes AC: 0..8)' },
  { no: 5, text: 'हयवरट्', latin: 'h-y-v-r-w', it: 'ट् / w', itIdx: 13, desc: 'Semivowels' },
  { no: 6, text: 'लण्', latin: 'l-N', it: 'ण् / N', itIdx: 14, desc: 'Liquid consonant' },
  { no: 7, text: 'ञमङणनम्', latin: 'ñ-m-ṅ-ṇ-n-m', it: 'म् / m', itIdx: 19, desc: 'Nasals (5th)' },
  { no: 8, text: 'झभञ्', latin: 'jh-bh-ñ', it: 'ञ् / ñ', itIdx: 21, desc: 'Aspirated voiced stops (4th)' },
  { no: 9, text: 'घढधष्', latin: 'gh-ḍh-dh-ṣ', it: 'ष् / ṣ', itIdx: 24, desc: 'Aspirated voiced stops' },
  { no: 10, text: 'जबगडदश्', latin: 'j-b-g-ḍ-d-ś', it: 'श् / ś', itIdx: 29, desc: 'Unvoiced stops (3rd)' },
  { no: 11, text: 'खफछठथचटतव्', latin: 'kh-ph-ch-ṭh-th-c-ṭ-t-v', it: 'व् / v', itIdx: 37, desc: 'Voiceless stops (2nd & 1st)' },
  { no: 12, text: 'कपय्', latin: 'k-p-y', it: 'य् / y', itIdx: 39, desc: 'Unvoiced stops' },
  { no: 13, text: 'शषसर्', latin: 'ś-ṣ-s-r', it: 'र् / r', itIdx: 42, desc: 'Sibilants' },
  { no: 14, text: 'हल्', latin: 'h-L', it: 'ल् / L', itIdx: 43, desc: 'Aspirate (completes HAL: 9..41)' },
];

export const SivaSutraVisualizer: React.FC<SivaSutraVisualizerProps> = ({ currentTokens = [] }) => {
  const [testChar, setTestChar] = useState<string>('k');

  // Compute test character bitmask
  const idx = startIdx(testChar);
  const isValid = idx !== 255;
  const sivaBit = isValid ? 1n << BigInt(idx) : 0n;
  const isHal = (sivaBit & MASK_HAL) !== 0n;
  const isAc = (sivaBit & MASK_AC) !== 0n;

  // Active bits from tokens
  const activeTokenBits = new Set<number>();
  for (const t of currentTokens) {
    if (t.sivaBit !== undefined) {
      activeTokenBits.add(t.sivaBit);
    }
  }

  return (
    <div className="space-y-6">
      {/* Intro section */}
      <div className="border border-neutral-800 bg-neutral-900/60 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              Śiva Sūtras 64-Bit Constant-Time Lexer Engine
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Pāṇini arranged Sanskrit phonemes into 14 Māheśvara Sūtras with boundary marker characters (Anubandhas).
              In Skrit-bit, these boundaries are computed as compile-time 64-bit integers (<code className="text-amber-300 font-mono">const fn</code>).
              Both Devanagari and Latin ASCII map to identical bit positions—guaranteeing Dual-Script Invariance in $O(1)$ operations.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-neutral-950 p-2.5 rounded-md border border-neutral-800 text-xs font-mono">
            <span className="text-neutral-500">Dual-Script:</span>
            <span className="text-emerald-400 font-bold">'क'</span>
            <span className="text-neutral-600">=</span>
            <span className="text-emerald-400 font-bold">'k'</span>
            <span className="text-neutral-600">→</span>
            <span className="text-amber-400">Bit 14</span>
          </div>
        </div>
      </div>

      {/* Interactive Bit Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border border-neutral-800 bg-neutral-900/40 rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
            <Binary className="w-4 h-4 text-amber-400" />
            Interactive Character Bit-Tester
          </h3>

          <div className="space-y-2">
            <label className="text-xs text-neutral-400">Type or select a character to probe its 64-bit shift:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={2}
                value={testChar}
                onChange={(e) => setTestChar(e.target.value.slice(0, 1))}
                className="w-16 text-center text-xl font-bold font-mono bg-neutral-950 border border-neutral-700 rounded-md p-2 text-amber-400 focus:outline-none focus:border-amber-400"
              />
              <div className="flex-1 flex flex-wrap gap-1">
                {['क', 'k', 'अ', 'a', 'x', 'i', 'h', 'm', 't', 'p'].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => setTestChar(sample)}
                    className={`px-2 py-1 text-xs font-mono rounded border transition-colors ${
                      testChar === sample
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-neutral-800/80 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Siva Index (start_idx):</span>
              <span className="font-semibold text-neutral-200">
                {isValid ? `Bit ${idx} (0x${idx.toString(16)})` : '255 (Unmapped)'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Shifted u64 Mask:</span>
              <span className="font-semibold text-amber-300">
                {isValid ? `0x${sivaBit.toString(16).toUpperCase()}` : '0x0'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-400">HAL Check (& MASK_HAL):</span>
              <span className={`flex items-center gap-1 font-semibold ${isHal ? 'text-emerald-400' : 'text-neutral-600'}`}>
                {isHal ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {isHal ? 'Ident (Variable)' : 'False'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-400">AC Check (& MASK_AC):</span>
              <span className={`flex items-center gap-1 font-semibold ${isAc ? 'text-emerald-400' : 'text-neutral-600'}`}>
                {isAc ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {isAc ? 'Type (Vowel/Op)' : 'False'}
              </span>
            </div>
          </div>
        </div>

        {/* 64-Bit Register Grid Display */}
        <div className="lg:col-span-2 border border-neutral-800 bg-neutral-900/40 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-200">
              64-Bit Machine Register View (Bits 0..63)
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-sky-500/30 border border-sky-400" />
                <span className="text-neutral-400">AC (Vowels 0..8)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-400" />
                <span className="text-neutral-400">HAL (Consonants 9..41)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-amber-400 animate-pulse" />
                <span className="text-neutral-300 font-medium">Active Probed Bit</span>
              </div>
            </div>
          </div>

          {/* 64-bit cells */}
          <div className="grid grid-cols-16 gap-1 p-3 bg-neutral-950 rounded-md border border-neutral-800 font-mono text-[10px]">
            {Array.from({ length: 64 }).map((_, bit) => {
              const isSelected = bit === idx;
              const isTokenActive = activeTokenBits.has(bit);
              const isAcBit = bit >= 0 && bit <= 8;
              const isHalBit = bit >= 9 && bit <= 41;

              let bgClass = 'bg-neutral-900 border-neutral-800 text-neutral-600';
              if (isSelected) {
                bgClass = 'bg-amber-400 border-amber-300 text-neutral-950 font-bold scale-110 shadow-md shadow-amber-500/50 z-10';
              } else if (isTokenActive) {
                bgClass = 'bg-purple-600/40 border-purple-400 text-purple-200 font-semibold';
              } else if (isAcBit) {
                bgClass = 'bg-sky-950/50 border-sky-800/60 text-sky-400';
              } else if (isHalBit) {
                bgClass = 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400';
              }

              return (
                <div
                  key={bit}
                  className={`h-7 flex flex-col items-center justify-center rounded-sm border transition-all ${bgClass}`}
                  title={`Bit ${bit}`}
                >
                  <span className="leading-none">{bit}</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 text-xs font-mono text-neutral-400 pt-1">
            <div className="flex-1 bg-neutral-950 p-2.5 rounded border border-neutral-800">
              <span className="text-neutral-500 block text-[11px] mb-1">MASK_AC (Vowels / Types):</span>
              <span className="text-sky-400 font-semibold">0x{MASK_AC.toString(16).toUpperCase()}</span>
              <span className="text-neutral-600 block text-[10px] mt-0.5 truncate">{formatBitmask64(MASK_AC)}</span>
            </div>

            <div className="flex-1 bg-neutral-950 p-2.5 rounded border border-neutral-800">
              <span className="text-neutral-500 block text-[11px] mb-1">MASK_HAL (Consonants / Identifiers):</span>
              <span className="text-emerald-400 font-semibold">0x{MASK_HAL.toString(16).toUpperCase()}</span>
              <span className="text-neutral-600 block text-[10px] mt-0.5 truncate">{formatBitmask64(MASK_HAL)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Śiva Sūtra Pratyāhāra Reference Table */}
      <div className="border border-neutral-800 bg-neutral-900/40 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-200">
          The 14 Māheśvara Sūtras (Phonemic Alphabet & Boundary Markers)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="py-2 px-3 font-medium">Sūtra</th>
                <th className="py-2 px-3 font-medium">Devanagari</th>
                <th className="py-2 px-3 font-medium">Roman / SLP1</th>
                <th className="py-2 px-3 font-medium">Anubandha (Boundary IT)</th>
                <th className="py-2 px-3 font-medium">Pratyāhāra Function</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 font-mono text-neutral-300">
              {SIVA_SUTRAS.map((s) => (
                <tr key={s.no} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="py-2 px-3 text-amber-400 font-semibold">Sūtra #{s.no}</td>
                  <td className="py-2 px-3 font-sans text-sm text-neutral-100">{s.text}</td>
                  <td className="py-2 px-3 text-neutral-300">{s.latin}</td>
                  <td className="py-2 px-3 text-amber-300">{s.it}</td>
                  <td className="py-2 px-3 text-neutral-400 font-sans">{s.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
