// src/skrit/lexer.ts
// Pāṇinian Śiva Sūtra Bitmask Lexer with Dual-Script Invariance

import { Token, TokenType } from './types';

/**
 * Dual-Script Invariance: Maps both Devanagari and Latin ASCII to the exact same bit index (0..63).
 * Evaluated at compile/runtime using constant bit arithmetic.
 */
export function startIdx(c: string): number {
  switch (c) {
    // --- SŪTRAS 1-4: VOWELS (अच् / AC) ---
    case 'अ': case 'a': return 0;
    case 'इ': case 'i': return 1;
    case 'उ': case 'u': return 2;
    case 'ऋ': case 'f': return 3; // SLP1 uses 'f' for ṛ
    case 'ऌ': return 4;          // Sanskrit vocalic l (ḷ)
    case 'ए': case 'e': return 5;
    case 'ओ': case 'o': return 6;
    case 'ऐ': case 'E': return 7; // SLP1 uses 'E' for ai
    case 'औ': case 'O': return 8; // SLP1 uses 'O' for au

    // --- SŪTRAS 5-14: CONSONANTS (हल् / HAL) ---
    case 'ह': case 'h': return 9;
    case 'य': case 'y': return 10;
    case 'व': case 'v': return 11;
    case 'र': case 'r': return 12;
    case 'ल': case 'l': return 13;
    case 'क': case 'k': return 14;
    case 'ख': return 15;
    case 'ग': case 'g': return 16;
    case 'घ': return 17;
    case 'च': return 18;
    case 'छ': return 19;
    case 'ज': case 'j': return 20;
    case 'झ': return 21;
    case 'ट': return 22;
    case 'ठ': return 23;
    case 'ड': return 24;
    case 'ढ': return 25;
    case 'ण': return 26;
    case 'त': case 't': return 27;
    case 'थ': return 28;
    case 'द': case 'd': return 29;
    case 'ध': return 30;
    case 'न': case 'n': return 31;
    case 'प': case 'p': return 32;
    case 'फ': return 33;
    case 'ब': case 'b': return 34;
    case 'भ': return 35;
    case 'म': case 'm': return 36;
    case 'श': return 37;
    case 'ष': return 38;
    case 'स': case 's': return 39;
    // Common algebraic Latin variables mapped to HAL consonant spectrum
    case 'x': return 40;
    case 'z': return 41;

    default: return 255;
  }
}

/**
 * Universal Anubandhas (Markers / IT letters) defining Pratyāhāra boundaries.
 */
export function endIdx(c: string): number {
  switch (c) {
    case 'ण्': case 'N': return 3;  // End of Sūtra 1 (a-i-u-ṇ)
    case 'क्': case 'K': return 5;  // End of Sūtra 2 (ṛ-ḷ-k)
    case 'ङ्': case 'W': return 7;  // End of Sūtra 3 (e-o-ṅ)
    case 'च्': case 'c': return 9;  // End of Sūtra 4 (ai-au-c: completes AC / Vowels)
    case 'ट्': case 'w': return 13; // End of Sūtra 5 (ha-ya-va-ra-ṭ)
    case 'ल्': case 'L': return 42; // End of Sūtra 14 (completes HAL / Consonants)
    default: return 255;
  }
}

/**
 * The Core Pratyāhāra Generator:
 * Generates a 64-bit mask for any Pāṇinian range [start, end)
 */
export function generatePratyahara(startChar: string, endChar: string): bigint {
  const s = BigInt(startIdx(startChar));
  const e = BigInt(endIdx(endChar));
  if (s === 255n || e === 255n || e <= s) {
    return 0n;
  }
  return (1n << e) - (1n << s);
}

// Global 64-bit constant bitmasks
export const MASK_AC: bigint = generatePratyahara('अ', 'च्');   // 0x0000_0000_0000_01FFn (bits 0..8)
export const MASK_HAL: bigint = generatePratyahara('ह', 'ल्');  // (bits 9..41)

/**
 * Parse numeric digit from both Latin ASCII ('0'-'9') and Devanagari ('०'-'९')
 */
export function parseDigit(c: string): number | null {
  const code = c.charCodeAt(0);
  if (code >= 0x30 && code <= 0x39) {
    return code - 0x30;
  }
  // Devanagari numerals: U+0966 ('०') to U+096F ('९')
  if (code >= 0x0966 && code <= 0x096F) {
    return code - 0x0966;
  }
  return null;
}

/**
 * O(1) Bitwise Categorization Lexer
 */
export function lex(source: string): Token[] {
  const tokens: Token[] = [];
  const chars = Array.from(source);
  let i = 0;
  let line = 1;
  let col = 1;

  while (i < chars.length) {
    const c = chars[i];

    // Handle newlines
    if (c === '\n') {
      line++;
      col = 1;
      i++;
      continue;
    }

    // Skip whitespace
    if (/\s/.test(c)) {
      col++;
      i++;
      continue;
    }

    // Handle comments (e.g. // or #)
    if (c === '/' && chars[i + 1] === '/') {
      while (i < chars.length && chars[i] !== '\n') {
        i++;
      }
      continue;
    }

    // Numeric literals (supports multi-digit ASCII and Devanagari)
    const initialDigit = parseDigit(c);
    if (initialDigit !== null) {
      const startCol = col;
      let numVal = 0;
      let rawStr = '';

      while (i < chars.length) {
        const d = parseDigit(chars[i]);
        if (d !== null) {
          numVal = numVal * 10 + d;
          rawStr += chars[i];
          i++;
          col++;
        } else {
          break;
        }
      }

      tokens.push({
        type: 'Num',
        value: numVal,
        rawChar: rawStr,
        charIndex: i - rawStr.length,
        bitCategory: 'Numeral',
        line,
        col: startCol,
      });
      continue;
    }

    // Direct symbol matching
    const startCol = col;
    switch (c) {
      case '=':
        tokens.push({ type: 'Assign', rawChar: '=', charIndex: i, bitCategory: 'Symbol', line, col: startCol });
        i++; col++;
        continue;
      case '+':
        tokens.push({ type: 'Add', rawChar: '+', charIndex: i, bitCategory: 'Symbol', line, col: startCol });
        i++; col++;
        continue;
      case '[':
        tokens.push({ type: 'LBracket', rawChar: '[', charIndex: i, bitCategory: 'Symbol', line, col: startCol });
        i++; col++;
        continue;
      case ']':
        tokens.push({ type: 'RBracket', rawChar: ']', charIndex: i, bitCategory: 'Symbol', line, col: startCol });
        i++; col++;
        continue;
      case ',':
        tokens.push({ type: 'Comma', rawChar: ',', charIndex: i, bitCategory: 'Symbol', line, col: startCol });
        i++; col++;
        continue;
    }

    // Siva Sutra Character Classification
    const bitIdx = startIdx(c);
    if (bitIdx !== 255) {
      const sivaBit = 1n << BigInt(bitIdx);

      if ((sivaBit & MASK_HAL) !== 0n) {
        tokens.push({
          type: 'Ident',
          value: c,
          rawChar: c,
          charIndex: i,
          sivaBit: bitIdx,
          bitCategory: 'HAL (Consonant/Var)',
          line,
          col: startCol,
        });
      } else if ((sivaBit & MASK_AC) !== 0n) {
        tokens.push({
          type: 'Type',
          value: c,
          rawChar: c,
          charIndex: i,
          sivaBit: bitIdx,
          bitCategory: 'AC (Vowel/Type)',
          line,
          col: startCol,
        });
      }
    } else {
      // Fallback for single-letter Latin ASCII variables if not in basic table
      if (/^[a-zA-Z]$/.test(c)) {
        tokens.push({
          type: 'Ident',
          value: c,
          rawChar: c,
          charIndex: i,
          sivaBit: 14, // default consonant slot
          bitCategory: 'HAL (Consonant/Var)',
          line,
          col: startCol,
        });
      }
    }

    i++;
    col++;
  }

  return tokens;
}

/**
 * Format a 64-bit integer into an 8-byte binary layout for display
 */
export function formatBitmask64(mask: bigint): string {
  let bin = mask.toString(2);
  bin = bin.padStart(64, '0');
  const chunks: string[] = [];
  for (let i = 0; i < 64; i += 8) {
    chunks.push(bin.slice(i, i + 8));
  }
  return chunks.join(' ');
}
