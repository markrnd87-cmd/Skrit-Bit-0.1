// src/skrit/vm.ts
// Tier-0 Stack Virtual Machine with Mokṣa (Functional But In-Place Mutation)

import { Chunk } from './compiler';
import { OpCode, VMValue, VMLogEntry, RcArray, char } from './types';

export class VM {
  public chunk: Chunk;
  public stack: VMValue[] = [];
  public ip: number = 0;
  public variables: Map<char, VMValue> = new Map();
  public executionLog: VMLogEntry[] = [];
  public cycle: number = 0;
  public isHalted: boolean = false;
  public finalResult: string = '';
  public memoryHeap: Map<number, RcArray> = new Map();
  private nextHeapId: number = 200;

  constructor(chunk: Chunk) {
    this.chunk = chunk;
    this.reset();
  }

  public reset(): void {
    this.stack = [];
    this.ip = 0;
    this.variables = new Map();
    this.executionLog = [];
    this.cycle = 0;
    this.isHalted = false;
    this.finalResult = '';
    this.memoryHeap = new Map();

    // Register initial constants in the heap if they are arrays
    for (const c of this.chunk.constants) {
      if (c.type === 'Array') {
        const freshRc: RcArray = {
          id: c.rc.id,
          strongCount: 1,
          data: [...c.rc.data],
          allocatedAtCycle: 0,
          mutatedInPlaceCount: 0,
          clonedCount: 0,
        };
        this.memoryHeap.set(freshRc.id, freshRc);
      }
    }
  }

  /**
   * Single-step execution for interactive VM debugger.
   */
  public step(): { halted: boolean; log?: VMLogEntry } {
    if (this.isHalted || this.ip >= this.chunk.code.length) {
      this.isHalted = true;
      return { halted: true };
    }

    this.cycle++;
    const currentIp = this.ip;
    const rawByte = this.chunk.code[this.ip];
    this.ip++;

    let logEntry: VMLogEntry | null = null;

    switch (rawByte) {
      case OpCode.Constant: {
        const constIdx = this.chunk.code[this.ip];
        this.ip++;
        const originalVal = this.chunk.constants[constIdx];
        let valToPush: VMValue;

        if (originalVal.type === 'Array') {
          // Look up active heap instance
          let heapObj = this.memoryHeap.get(originalVal.rc.id);
          if (!heapObj) {
            heapObj = {
              id: originalVal.rc.id,
              strongCount: 1,
              data: [...originalVal.rc.data],
              allocatedAtCycle: this.cycle,
              mutatedInPlaceCount: 0,
              clonedCount: 0,
            };
            this.memoryHeap.set(heapObj.id, heapObj);
          }
          valToPush = { type: 'Array', rc: heapObj };
        } else if (originalVal.type === 'Num') {
          valToPush = { type: 'Num', val: originalVal.val };
        } else {
          valToPush = { type: 'VarName', char: originalVal.char };
        }

        this.stack.push(valToPush);
        logEntry = {
          cycle: this.cycle,
          ip: currentIp,
          instruction: `OP_CONSTANT #${constIdx}`,
          message: `Pushed ${this.formatValue(valToPush)} onto operand stack`,
          type: 'info',
        };
        break;
      }

      case OpCode.StoreVar: {
        const varNameVal = this.stack.pop();
        const valueToStore = this.stack.pop();

        if (!varNameVal || !valueToStore || varNameVal.type !== 'VarName') {
          throw new Error('Stack underflow or invalid operand for OP_STORE_VAR');
        }

        const vName = varNameVal.char;

        // If storing an Array that is already held in another variable, strongCount increases
        if (valueToStore.type === 'Array') {
          const heapObj = this.memoryHeap.get(valueToStore.rc.id);
          if (heapObj) {
            // Count total references across existing variables
            let refs = 0;
            for (const [, stored] of this.variables.entries()) {
              if (stored.type === 'Array' && stored.rc.id === heapObj.id) {
                refs++;
              }
            }
            heapObj.strongCount = refs + 1;
          }
        }

        this.variables.set(vName, valueToStore);
        logEntry = {
          cycle: this.cycle,
          ip: currentIp,
          instruction: `OP_STORE_VAR '${vName}'`,
          message: `Stored ${this.formatValue(valueToStore)} into variable '${vName}'`,
          type: 'info',
        };
        break;
      }

      case OpCode.LoadVar: {
        const varNameVal = this.stack.pop();
        if (!varNameVal || varNameVal.type !== 'VarName') {
          throw new Error('Stack underflow or invalid operand for OP_LOAD_VAR');
        }

        const vName = varNameVal.char;
        const val = this.variables.get(vName);
        if (!val) {
          throw new Error(`Variable '${vName}' not found in active scope`);
        }

        // Clone reference onto stack
        this.stack.push(val);
        logEntry = {
          cycle: this.cycle,
          ip: currentIp,
          instruction: `OP_LOAD_VAR '${vName}'`,
          message: `Loaded variable '${vName}' (${this.formatValue(val)}) onto stack`,
          type: 'info',
        };
        break;
      }

      case OpCode.Add: {
        const b = this.stack.pop();
        const a = this.stack.pop();

        if (!a || !b) {
          throw new Error('Stack underflow on OP_ADD');
        }

        // Case 1: Standard Numeric Addition
        if (a.type === 'Num' && b.type === 'Num') {
          const sum = a.val + b.val;
          const res: VMValue = { type: 'Num', val: sum };
          this.stack.push(res);
          logEntry = {
            cycle: this.cycle,
            ip: currentIp,
            instruction: 'OP_ADD (Num + Num)',
            message: `Computed ${a.val} + ${b.val} = ${sum}`,
            type: 'info',
          };
        }
        // Case 2: Array + Num -> MOKṢA (Functional But In-Place Mutation)
        else if (a.type === 'Array' && b.type === 'Num') {
          const heapObj = this.memoryHeap.get(a.rc.id);
          const currentCount = heapObj ? heapObj.strongCount : a.rc.strongCount;
          const item = b.val;

          if (currentCount <= 1) {
            // =================================================================
            // ⚡ MOKṢA TRIGGER (Liberation: In-place hardware mutation)
            // =================================================================
            if (heapObj) {
              heapObj.data.push(item);
              heapObj.mutatedInPlaceCount++;
              this.stack.push({ type: 'Array', rc: heapObj });
            } else {
              a.rc.data.push(item);
              a.rc.mutatedInPlaceCount++;
              this.stack.push(a);
            }

            logEntry = {
              cycle: this.cycle,
              ip: currentIp,
              instruction: 'OP_ADD (Array + Num)',
              message: `⚡ MOKṢA (Liberation) GRANTED: Reference Count was 1. Array [ptr: 0x${a.rc.id.toString(16).toUpperCase()}] mutated destructively in-place in O(1) time. -> [${a.rc.data.join(', ')}]`,
              type: 'moksa',
            };
          } else {
            // =================================================================
            // ❄️ NITYA TRIGGER (Immutability: Copy-On-Write fallback)
            // =================================================================
            const newId = ++this.nextHeapId;
            const clonedData = [...a.rc.data, item];
            const newRc: RcArray = {
              id: newId,
              strongCount: 1,
              data: clonedData,
              allocatedAtCycle: this.cycle,
              mutatedInPlaceCount: 0,
              clonedCount: (a.rc.clonedCount || 0) + 1,
            };

            // Decrement old count
            if (heapObj) {
              heapObj.strongCount = Math.max(0, heapObj.strongCount - 1);
            }

            this.memoryHeap.set(newId, newRc);
            this.stack.push({ type: 'Array', rc: newRc });

            logEntry = {
              cycle: this.cycle,
              ip: currentIp,
              instruction: 'OP_ADD (Array + Num)',
              message: `❄️ NITYA (Immutability) ENFORCED: Reference Count was ${currentCount}. Array was copied to new memory pointer [ptr: 0x${newId.toString(16).toUpperCase()}] in O(n) time. -> [${clonedData.join(', ')}]`,
              type: 'nitya',
            };
          }
        } else {
          throw new Error(`Invalid operands for Add operation: ${a.type} + ${b.type}`);
        }
        break;
      }

      case OpCode.Return: {
        const top = this.stack.length > 0 ? this.stack[this.stack.length - 1] : { type: 'Num' as const, val: 0 };
        this.finalResult = this.formatValue(top);
        this.isHalted = true;

        logEntry = {
          cycle: this.cycle,
          ip: currentIp,
          instruction: 'OP_RETURN',
          message: `Execution halted. Final Stack Output: ${this.finalResult}`,
          type: 'return',
        };
        break;
      }

      default:
        throw new Error(`Apabhraṃśa: Invalid OpCode 0x${rawByte.toString(16)} at IP ${currentIp}`);
    }

    if (logEntry) {
      this.executionLog.push(logEntry);
    }

    return { halted: this.isHalted, log: logEntry || undefined };
  }

  /**
   * Run entire bytecode sequence to completion.
   */
  public run(): { result: string; log: VMLogEntry[]; error?: string } {
    this.reset();
    const maxCycles = 10000;

    try {
      while (!this.isHalted && this.cycle < maxCycles) {
        this.step();
      }
      return {
        result: this.finalResult,
        log: this.executionLog,
      };
    } catch (err: any) {
      return {
        result: '',
        log: this.executionLog,
        error: err.message || String(err),
      };
    }
  }

  public formatValue(v?: VMValue): string {
    if (!v) return 'nil';
    switch (v.type) {
      case 'Num': return String(v.val);
      case 'Array': return `[${v.rc.data.join(', ')}]`;
      case 'VarName': return `'${v.char}'`;
    }
  }
}
