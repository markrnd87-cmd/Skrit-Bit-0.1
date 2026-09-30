// src/skrit/engine.ts
// Skrit-bit Compiler Pipeline Orchestrator

import { lex } from './lexer';
import { Parser } from './ast';
import { Compiler } from './compiler';
import { VM } from './vm';
import { Token, Expr, DisassembledInstruction, VMLogEntry, AnuvrittiContext } from './types';

export interface SkritBitRunResult {
  tokens: Token[];
  ast: Expr[];
  astString: string;
  anuvrittiHistory: AnuvrittiContext['history'];
  bytecode: number[];
  disassembly: DisassembledInstruction[];
  vmResult: string;
  executionLog: VMLogEntry[];
  error?: string | null;
  vmInstance?: VM;
}

export function runSkritBit(source: string): SkritBitRunResult {
  const result: SkritBitRunResult = {
    tokens: [],
    ast: [],
    astString: '',
    anuvrittiHistory: [],
    bytecode: [],
    disassembly: [],
    vmResult: '',
    executionLog: [],
    error: null,
  };

  try {
    // ---------------------------------------------------------
    // 1. LEXER (Śiva Sūtras - Dual-Script Invariant Bitmasking)
    // ---------------------------------------------------------
    const tokens = lex(source);
    result.tokens = tokens;

    if (tokens.length === 0) {
      result.error = 'No valid Skrit-bit tokens found in input.';
      return result;
    }

    // ---------------------------------------------------------
    // 2. PARSER (Anuvṛtti Context-Propagating AST)
    // ---------------------------------------------------------
    const parser = new Parser(tokens);
    const { ast, context } = parser.parseAll();
    result.ast = ast;
    result.anuvrittiHistory = context.history;
    result.astString = JSON.stringify(ast, null, 2);

    if (ast.length === 0) {
      result.error = 'No statements could be parsed from the token stream.';
      return result;
    }

    // ---------------------------------------------------------
    // 3. COMPILER (Tripādī Bytecode Lowering)
    // ---------------------------------------------------------
    const compiler = new Compiler();
    for (const node of ast) {
      compiler.compileExpr(node);
    }
    const chunk = compiler.finish();
    result.bytecode = [...chunk.code];
    result.disassembly = chunk.disassemble();

    // ---------------------------------------------------------
    // 4. VIRTUAL MACHINE (Execution & Mokṣa In-Place Mutation)
    // ---------------------------------------------------------
    const vm = new VM(chunk);
    const vmOutcome = vm.run();
    result.vmResult = vmOutcome.result;
    result.executionLog = vmOutcome.log;
    result.vmInstance = vm;

    if (vmOutcome.error) {
      result.error = `Runtime Error: ${vmOutcome.error}`;
    }

    return result;
  } catch (err: any) {
    result.error = err.message || String(err);
    return result;
  }
}
