// src/skrit/compiler.ts
// Tripādī Compiler: Flattens recursive AST into linear SSA Bytecode Chunk

import { Expr, OpCode, VMValue, DisassembledInstruction } from './types';

export class Chunk {
  public code: number[] = [];
  public constants: VMValue[] = [];

  public write(byte: number): number {
    this.code.push(byte);
    return this.code.length - 1;
  }

  public addConstant(val: VMValue): number {
    this.constants.push(val);
    return this.constants.length - 1;
  }

  public disassemble(): DisassembledInstruction[] {
    const list: DisassembledInstruction[] = [];
    let offset = 0;

    while (offset < this.code.length) {
      const byte = this.code[offset];
      const startOffset = offset;
      offset++;

      switch (byte) {
        case OpCode.Constant: {
          const constIdx = this.code[offset];
          offset++;
          const val = this.constants[constIdx];
          const valStr = this.formatConstant(val);
          list.push({
            offset: startOffset,
            byte,
            opcodeName: 'OP_CONSTANT',
            arg: `#${constIdx} (${valStr})`,
            comment: `Push constant '${valStr}' to stack`,
          });
          break;
        }

        case OpCode.Add: {
          list.push({
            offset: startOffset,
            byte,
            opcodeName: 'OP_ADD',
            comment: 'Pop b, pop a; apply add or Mokṣa array update; push result',
          });
          break;
        }

        case OpCode.StoreVar: {
          list.push({
            offset: startOffset,
            byte,
            opcodeName: 'OP_STORE_VAR',
            comment: 'Pop var_ident, pop val; store in symbol registry',
          });
          break;
        }

        case OpCode.LoadVar: {
          list.push({
            offset: startOffset,
            byte,
            opcodeName: 'OP_LOAD_VAR',
            comment: 'Pop var_ident; load bound value from registry onto stack',
          });
          break;
        }

        case OpCode.Return: {
          list.push({
            offset: startOffset,
            byte,
            opcodeName: 'OP_RETURN',
            comment: 'Halt execution; return top of stack value',
          });
          break;
        }

        default: {
          list.push({
            offset: startOffset,
            byte,
            opcodeName: `UNKNOWN (0x${byte.toString(16).padStart(2, '0')})`,
          });
          break;
        }
      }
    }

    return list;
  }

  private formatConstant(val?: VMValue): string {
    if (!val) return 'unknown';
    switch (val.type) {
      case 'Num': return String(val.val);
      case 'Array': return `[${val.rc.data.join(', ')}]`;
      case 'VarName': return `'${val.char}'`;
    }
  }
}

export class Compiler {
  public chunk: Chunk;
  private arrayIdCounter: number = 100;

  constructor() {
    this.chunk = new Chunk();
  }

  /**
   * The Tripādī Pass: Flattens an AST expression into strictly linear SSA bytecode.
   * Based on Pāṇini's meta-rule Pūrvatrāsiddham (earlier rule overrides/precedes later rule).
   */
  public compileExpr(expr: Expr): void {
    switch (expr.kind) {
      case 'Num': {
        const constIdx = this.chunk.addConstant({ type: 'Num', val: expr.value });
        this.chunk.write(OpCode.Constant);
        this.chunk.write(constIdx);
        break;
      }

      case 'Array': {
        // Instantiate array with initial strongCount = 1
        const rcArray = {
          id: ++this.arrayIdCounter,
          strongCount: 1,
          data: [...expr.elements],
          allocatedAtCycle: 0,
          mutatedInPlaceCount: 0,
          clonedCount: 0,
        };
        const constIdx = this.chunk.addConstant({ type: 'Array', rc: rcArray });
        this.chunk.write(OpCode.Constant);
        this.chunk.write(constIdx);
        break;
      }

      case 'Var': {
        const constIdx = this.chunk.addConstant({ type: 'VarName', char: expr.name });
        this.chunk.write(OpCode.Constant);
        this.chunk.write(constIdx);
        this.chunk.write(OpCode.LoadVar);
        break;
      }

      case 'Assign': {
        // 1. Compile the RHS (leaves result on operand stack)
        this.compileExpr(expr.rhs);

        // 2. Load the variable name identifier
        const constIdx = this.chunk.addConstant({ type: 'VarName', char: expr.varName });
        this.chunk.write(OpCode.Constant);
        this.chunk.write(constIdx);

        // 3. Emit Store Instruction
        this.chunk.write(OpCode.StoreVar);
        break;
      }

      case 'Add': {
        // Post-order traversal: left then right, then operator
        this.compileExpr(expr.left);
        this.compileExpr(expr.right);
        this.chunk.write(OpCode.Add);
        break;
      }
    }
  }

  /**
   * Finalizes the Pūrvatrāsiddham pass, terminating the bytecode chunk safely.
   */
  public finish(): Chunk {
    this.chunk.write(OpCode.Return);
    return this.chunk;
  }
}
