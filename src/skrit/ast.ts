// src/skrit/ast.ts
// Context-Propagating AST Parser (Pāṇinian Anuvṛtti Engine)

import { Token, Expr, AnuvrittiContext, char } from './types';

export class Parser {
  private tokens: Token[];
  private pos: number = 0;
  public context: AnuvrittiContext;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.context = {
      activeVar: null,
      history: [],
    };
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private advance(): Token | undefined {
    const t = this.tokens[this.pos];
    this.pos++;
    return t;
  }

  /**
   * Parses a sequence of Skrit-bit rules, propagating context across statements.
   */
  public parseAll(): { ast: Expr[]; context: AnuvrittiContext } {
    const ast: Expr[] = [];

    while (this.pos < this.tokens.length) {
      const expr = this.parseSutra();
      if (expr) {
        ast.push(expr);
      } else {
        // Advance on unexpected tokens to avoid infinite loops
        this.advance();
      }
    }

    return { ast, context: this.context };
  }

  /**
   * Evaluates a single Sūtra (Rule) and resolves implicit context via Anuvṛtti.
   */
  private parseSutra(): Expr | null {
    const token = this.advance();
    if (!token) return null;

    // RULE TYPE 1: Explicit Declarations (e.g. "क = ५" or "k = [1, 2, 3]" or "x = 10")
    if (token.type === 'Ident') {
      const varName = String(token.value || token.rawChar);
      const next = this.peek();

      if (next && next.type === 'Assign') {
        this.advance(); // consume '='
        const rhs = this.parseExpression();

        // UPDATE ANUVṚTTI CONTEXT: Store this variable as the active subject.
        // Any following incomplete rule will automatically inherit this subject!
        this.context.activeVar = varName;
        this.context.history.push({
          ruleIndex: this.context.history.length + 1,
          declaredVar: varName,
          sourceExpr: `${varName} = ${this.formatExpr(rhs)}`,
        });

        return {
          kind: 'Assign',
          varName,
          rhs,
        };
      }

      // If just variable name followed by an operator, handle as expression
      if (next && next.type === 'Add') {
        this.advance(); // consume '+'
        const rhs = this.parseExpression();
        this.context.activeVar = varName;
        return {
          kind: 'Add',
          left: { kind: 'Var', name: varName },
          right: rhs,
        };
      }

      throw new Error(`Apabhraṃśa (Grammar Error): Expected '=' or operator after variable '${varName}' at line ${token.line}`);
    }

    // RULE TYPE 2: Incomplete Operations (e.g. "+ 5" or "+ ३")
    if (token.type === 'Add') {
      const rhs = this.parseExpression();

      // ANUVṚTTI IN ACTION: Left-hand side operand is omitted.
      // Dynamic context injection: Inherit active variable from running state.
      if (this.context.activeVar) {
        const inherited = this.context.activeVar;
        this.context.history.push({
          ruleIndex: this.context.history.length + 1,
          inheritedVar: inherited,
          sourceExpr: `+ ${this.formatExpr(rhs)} (inherited '${inherited}')`,
        });

        return {
          kind: 'Add',
          left: {
            kind: 'Var',
            name: inherited,
            inferredFromAnuvritti: true,
            contextSource: `Sūtra #${this.context.history.length}: inherited active subject '${inherited}'`,
          },
          right: rhs,
          inheritedVar: inherited,
        };
      } else {
        throw new Error(
          `Anuvṛtti Error: No active context available to inherit for '+' operation at line ${token.line}. Declare a subject first (e.g. 'k = [1, 2, 3]').`
        );
      }
    }

    // Numbers or standalone literals at top level
    if (token.type === 'Num') {
      const val = Number(token.value);
      const next = this.peek();
      if (next && next.type === 'Add') {
        this.advance();
        const rhs = this.parseExpression();
        return {
          kind: 'Add',
          left: { kind: 'Num', value: val },
          right: rhs,
        };
      }
      return { kind: 'Num', value: val };
    }

    return null;
  }

  /**
   * Helper to parse the Right-Hand Side (RHS) of an assignment or operation.
   */
  private parseExpression(): Expr {
    const token = this.advance();
    if (!token) {
      throw new Error('Unexpected end of tokens while parsing expression');
    }

    if (token.type === 'Num') {
      return { kind: 'Num', value: Number(token.value) };
    }

    if (token.type === 'Ident') {
      return { kind: 'Var', name: String(token.value || token.rawChar) };
    }

    if (token.type === 'LBracket') {
      // Parse array literal like [1, 2, 3] for Mokṣa mutation testing
      const elements: number[] = [];

      while (true) {
        const next = this.peek();
        if (!next) {
          throw new Error("Unclosed array bracket: expected ']'");
        }

        if (next.type === 'RBracket') {
          this.advance(); // consume ']'
          break;
        }

        const elemTok = this.advance();
        if (elemTok?.type === 'Num') {
          elements.push(Number(elemTok.value));
        } else {
          throw new Error(`Array elements must be numeric literals in Tier-0 prototype, received: ${elemTok?.type}`);
        }

        const afterElem = this.peek();
        if (afterElem?.type === 'Comma') {
          this.advance(); // consume ','
        } else if (afterElem?.type === 'RBracket') {
          // Handled in next loop iteration
        } else {
          throw new Error("Expected ',' or ']' in array definition");
        }
      }

      return { kind: 'Array', elements };
    }

    throw new Error(`Unexpected token in expression: ${token.type} ('${token.rawChar}') at line ${token.line}`);
  }

  private formatExpr(expr: Expr): string {
    switch (expr.kind) {
      case 'Num': return String(expr.value);
      case 'Var': return expr.name;
      case 'Array': return `[${expr.elements.join(', ')}]`;
      case 'Assign': return `${expr.varName} = ${this.formatExpr(expr.rhs)}`;
      case 'Add': return `(${this.formatExpr(expr.left)} + ${this.formatExpr(expr.right)})`;
    }
  }
}
