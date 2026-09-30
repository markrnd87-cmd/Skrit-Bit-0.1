// src/skrit/types.ts

export type TokenType =
  | 'Ident'     // Variable (Consonant) - HAL
  | 'Type'      // Type/Operator (Vowel) - AC
  | 'Num'       // Numeric literal
  | 'Assign'    // '='
  | 'Add'       // '+'
  | 'LBracket'  // '['
  | 'RBracket'  // ']'
  | 'Comma';    // ','

export interface Token {
  type: TokenType;
  value?: string | number | char;
  rawChar: string;
  charIndex: number;
  sivaBit?: number;
  bitCategory?: 'HAL (Consonant/Var)' | 'AC (Vowel/Type)' | 'Symbol' | 'Numeral';
  line: number;
  col: number;
}

export type char = string;

// AST Expression Nodes
export type Expr =
  | { kind: 'Num'; value: number }
  | { kind: 'Var'; name: char; inferredFromAnuvritti?: boolean; contextSource?: string }
  | { kind: 'Array'; elements: number[] }
  | { kind: 'Assign'; varName: char; rhs: Expr }
  | { kind: 'Add'; left: Expr; right: Expr; inheritedVar?: char };

export interface AnuvrittiContext {
  activeVar: char | null;
  history: Array<{
    ruleIndex: number;
    declaredVar?: char;
    inheritedVar?: char;
    sourceExpr: string;
  }>;
}

// Bytecode VM Instructions
export enum OpCode {
  Constant = 0x01,
  Add = 0x02,
  StoreVar = 0x03,
  LoadVar = 0x04,
  Return = 0x05,
}

export interface DisassembledInstruction {
  offset: number;
  byte: number;
  opcodeName: string;
  arg?: number | string;
  comment?: string;
}

// Memory Reference Counting for Mokṣa
export interface RcArray {
  id: number;
  strongCount: number;
  data: number[];
  allocatedAtCycle: number;
  mutatedInPlaceCount: number;
  clonedCount: number;
}

export type VMValue =
  | { type: 'Num'; val: number }
  | { type: 'Array'; rc: RcArray }
  | { type: 'VarName'; char: char };

export interface VMLogEntry {
  cycle: number;
  ip: number;
  instruction: string;
  message: string;
  type: 'info' | 'moksa' | 'nitya' | 'return';
}

export interface CompilationResult {
  tokens: Token[];
  ast: Expr[];
  anuvrittiHistory: AnuvrittiContext['history'];
  bytecode: number[];
  disassembly: DisassembledInstruction[];
  constants: VMValue[];
  error?: string;
}
