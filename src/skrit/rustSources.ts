// src/skrit/rustSources.ts
// Complete production Rust workspace files for Skrit-bit

export interface RustFile {
  path: string;
  name: string;
  category: 'core' | 'wasm' | 'config' | 'script';
  description: string;
  content: string;
}

export const RUST_WORKSPACE_FILES: RustFile[] = [
  {
    path: 'Cargo.toml',
    name: 'Cargo.toml (Workspace Root)',
    category: 'config',
    description: 'Root workspace configuration tying skrit-core and skrit-wasm',
    content: `[workspace]
members = [
    "skrit-core",
    "skrit-wasm"
]
resolver = "2"
`
  },
  {
    path: 'skrit-core/Cargo.toml',
    name: 'skrit-core/Cargo.toml',
    category: 'config',
    description: 'Core compiler package definition',
    content: `[package]
name = "skrit-core"
version = "0.1.0"
edition = "2021"

[lib]
name = "skrit_core"
path = "src/lib.rs"

[dependencies]
# Zero heavy dependencies for the Tier-0 core
`
  },
  {
    path: 'skrit-core/src/lib.rs',
    name: 'skrit-core/src/lib.rs',
    category: 'core',
    description: 'Core crate module declarations',
    content: `// skrit-core/src/lib.rs

pub mod lexer;
pub mod ast;
pub mod compiler;
pub mod vm;
`
  },
  {
    path: 'skrit-core/src/lexer.rs',
    name: 'skrit-core/src/lexer.rs',
    category: 'core',
    description: 'Śiva Sūtras const fn bitmask generator with Dual-Script Invariance',
    content: `// skrit-core/src/lexer.rs

#[derive(Debug, PartialEq, Clone)]
pub enum Token {
    Ident(char),    // Variable (Consonant) - HAL
    Type(char),     // Type/Operator (Vowel) - AC
    Num(i32),       // Number literal
    Assign,         // '='
    Add,            // '+'
    LBracket,       // '[' (Used for Mokṣa array examples)
    RBracket,       // ']' 
    Comma,          // ','
}

// =====================================================================
// PĀṆINIAN MACRO ENGINE (Compile-Time Pratyāhāra)
// =====================================================================

/// Dual-Script Invariance: Maps both Devanagari and SLP1/ASCII to the exact same bit.
/// Evaluated completely at compile time.
pub const fn start_idx(c: char) -> u8 {
    match c {
        // --- SUTRAS 1-4: VOWELS (अच्) ---
        'अ' | 'a' => 0,
        'इ' | 'i' => 1,
        'उ' | 'u' => 2,
        'ऋ' | 'f' => 3,  // SLP1 uses 'f' for ṛ
        'ऌ' | 'x' => 4,  // SLP1 uses 'x' for ḷ
        'ए' | 'e' => 5,
        'ओ' | 'o' => 6,
        'ऐ' | 'E' => 7,  // SLP1 uses 'E' for ai
        'औ' | 'O' => 8,  // SLP1 uses 'O' for au
        
        // --- SUTRAS 5-14: CONSONANTS (हल्) ---
        'ह' | 'h' => 9,
        'य' | 'y' => 10,
        'व' | 'v' => 11,
        'र' | 'r' => 12,
        'ल' | 'l' => 13,
        'क' | 'k' => 14,
        
        // 255 represents an unmapped / non-phonemic character
        _ => 255, 
    }
}

/// Universal Anubandhas (Pointers). Used as the bounds for generating macros.
pub const fn end_idx(c: char) -> u8 {
    match c {
        'ण्' | 'N' => 3,   // End of Sutra 1
        'क्' | 'K' => 5,   // End of Sutra 2
        'ङ्' | 'W' => 7,   // End of Sutra 3
        'च्' | 'c' => 9,   // End of Sutra 4 (Completes AC / Vowels)
        'ट्' | 'w' => 13,  // End of Sutra 5
        'ल्' | 'L' => 42,  // End of Sutra 14 (Completes HAL / Consonants)
        _ => 255,
    }
}

/// The core macro generator. Derives the Pratyāhāra bitmask at compile time.
pub const fn generate_pratyahara(start: char, end: char) -> u64 {
    let s = start_idx(start);
    let e = end_idx(end);
    (1 << e) - (1 << s)
}

// These constants exist in the final binary as hardcoded raw u64 integers.
pub const MASK_AC: u64 = generate_pratyahara('अ', 'च्');   // All Vowels / Types
pub const MASK_HAL: u64 = generate_pratyahara('ह', 'ल्'); // All Consonants / Variables

// =====================================================================
// THE LEXER (Constant-Time Tokenization)
// =====================================================================

fn get_siva_bit_index(c: char) -> Option<u8> {
    let idx = start_idx(c);
    if idx == 255 { None } else { Some(idx) }
}

/// Parses both ASCII and Devanagari numerals
fn parse_digit(c: char) -> Option<i32> {
    if c.is_ascii_digit() {
        Some(c.to_digit(10).unwrap() as i32)
    } else {
        let code = c as u32;
        if (0x0966..=0x096F).contains(&code) {
            Some((code - 0x0966) as i32)
        } else {
            None
        }
    }
}

/// O(1) bitwise categorization engine
pub fn lex(source: &str) -> Vec<Token> {
    let mut tokens = Vec::new();
    let mut chars = source.chars().peekable();

    while let Some(&c) = chars.peek() {
        // Skip whitespace
        if c.is_whitespace() {
            chars.next();
            continue;
        }

        // Handle numeric literals (can be multiple digits)
        if c.is_ascii_digit() || parse_digit(c).is_some() {
            let mut num_val = 0;
            while let Some(&d) = chars.peek() {
                if let Some(digit) = parse_digit(d) {
                    num_val = num_val * 10 + digit;
                    chars.next();
                } else {
                    break;
                }
            }
            tokens.push(Token::Num(num_val));
            continue;
        }

        // Direct symbol matching
        match c {
            '=' => { tokens.push(Token::Assign); chars.next(); },
            '+' => { tokens.push(Token::Add); chars.next(); },
            '[' => { tokens.push(Token::LBracket); chars.next(); },
            ']' => { tokens.push(Token::RBracket); chars.next(); },
            ',' => { tokens.push(Token::Comma); chars.next(); },
            _ => {
                chars.next(); // Consume character
                if let Some(idx) = get_siva_bit_index(c) {
                    let siva_bit: u64 = 1 << idx;
                    
                    // Categorize instantly using bitwise AND
                    if (siva_bit & MASK_HAL) != 0 {
                        tokens.push(Token::Ident(c));
                    } else if (siva_bit & MASK_AC) != 0 {
                        tokens.push(Token::Type(c));
                    }
                }
            }
        }
    }
    tokens
}
`
  },
  {
    path: 'skrit-core/src/ast.rs',
    name: 'skrit-core/src/ast.rs',
    category: 'core',
    description: 'Anuvṛtti stateful parser propagating subject context across rules',
    content: `// skrit-core/src/ast.rs

use crate::lexer::Token;

/// The Abstract Syntax Tree nodes for Skrit-bit
#[derive(Debug, Clone, PartialEq)]
pub enum Expr {
    Var(char),
    Num(i32),
    Array(Vec<i32>),             // Array representation required for Mokṣa (Mutation) tests
    Assign(char, Box<Expr>),
    Add(Box<Expr>, Box<Expr>),
}

/// The running state passed sequentially between Sūtras (rules).
/// This represents Pāṇini's concept of Anuvṛtti (flowing context).
#[derive(Default, Debug)]
pub struct AnuvrittiContext {
    pub active_var: Option<char>, // The most recently declared variable in the block
}

pub struct Parser {
    tokens: Vec<Token>,
    pos: usize,
    context: AnuvrittiContext,
}

impl Parser {
    pub fn new(tokens: Vec<Token>) -> Self {
        Parser {
            tokens,
            pos: 0,
            context: AnuvrittiContext::default(),
        }
    }

    fn peek(&self) -> Option<&Token> {
        self.tokens.get(self.pos)
    }

    fn advance(&mut self) -> Option<Token> {
        let t = self.tokens.get(self.pos).cloned();
        self.pos += 1;
        t
    }

    /// Parses a sequence of Skrit-bit rules, propagating context across statements
    pub fn parse_all(&mut self) -> Result<Vec<Expr>, String> {
        let mut ast = Vec::new();
        while self.pos < self.tokens.len() {
            if let Some(expr) = self.parse_sutra()? {
                ast.push(expr);
            } else {
                self.advance(); 
            }
        }
        Ok(ast)
    }

    /// Evaluates a single Sūtra (Rule) and resolves implicit context
    fn parse_sutra(&mut self) -> Result<Option<Expr>, String> {
        let token = match self.advance() {
            Some(t) => t,
            None => return Ok(None),
        };

        match token {
            // RULE TYPE 1: Explicit Declarations (e.g., "क = ५" or "k = [1,2,3]")
            Token::Ident(var_name) => {
                if let Some(Token::Assign) = self.peek() {
                    self.advance(); // Consume '='
                    let rhs = self.parse_expression()?;
                    
                    // UPDATE CONTEXT: Store this variable for Anuvṛtti flow.
                    self.context.active_var = Some(var_name);
                    
                    return Ok(Some(Expr::Assign(var_name, Box::new(rhs))));
                }
                Err(format!("Apabhraṃśa (Grammar Error): Expected '=' after variable '{}'", var_name))
            }

            // RULE TYPE 2: Incomplete Operations (e.g., "+ ५" or "+ 5")
            Token::Add => {
                let rhs = self.parse_expression()?;
                
                // ANUVṚTTI IN ACTION: Inherit active variable from running state
                if let Some(inherited_var) = self.context.active_var {
                    return Ok(Some(Expr::Add(
                        Box::new(Expr::Var(inherited_var)),
                        Box::new(rhs)
                    )));
                } else {
                    return Err("Anuvṛtti Error: No active context available to inherit for '+' operation".to_string());
                }
            }
            _ => Ok(None),
        }
    }
    
    /// Helper to parse the Right-Hand Side (RHS) of an assignment or operation
    fn parse_expression(&mut self) -> Result<Expr, String> {
        let token = match self.advance() {
            Some(t) => t,
            None => return Err("Unexpected end of tokens while parsing expression".to_string()),
        };
        
        match token {
            Token::Num(val) => Ok(Expr::Num(val)),
            Token::Ident(var_name) => Ok(Expr::Var(var_name)),
            Token::LBracket => {
                let mut elements = Vec::new();
                loop {
                    if let Some(Token::RBracket) = self.peek() {
                        self.advance(); // Consume ']'
                        break;
                    }
                    
                    match self.advance() {
                        Some(Token::Num(val)) => elements.push(val),
                        _ => return Err("Arrays currently only support numeric literals in the prototype".to_string()),
                    }
                    
                    match self.peek() {
                        Some(Token::Comma) => { self.advance(); }
                        Some(Token::RBracket) => {}
                        _ => return Err("Expected ',' or ']' in array definition".to_string()),
                    }
                }
                Ok(Expr::Array(elements))
            }
            _ => Err(format!("Unexpected token in expression: {:?}", token)),
        }
    }
}
`
  },
  {
    path: 'skrit-core/src/compiler.rs',
    name: 'skrit-core/src/compiler.rs',
    category: 'core',
    description: 'Tripādī pass lowering AST into sequential SSA bytecode',
    content: `// skrit-core/src/compiler.rs

use crate::ast::Expr;
use crate::vm::{Chunk, OpCode, Value};
use std::rc::Rc;

pub struct Compiler {
    chunk: Chunk,
}

impl Compiler {
    pub fn new() -> Self {
        Compiler {
            chunk: Chunk::new(),
        }
    }

    /// The Tripādī Pass: Flattens an AST expression into strictly linear SSA bytecode
    pub fn compile_expr(&mut self, expr: &Expr) -> Result<(), String> {
        match expr {
            Expr::Num(value) => {
                let const_idx = self.chunk.add_constant(Value::Num(*value));
                self.chunk.write(OpCode::Constant as u8);
                self.chunk.write(const_idx);
            }
            Expr::Array(elements) => {
                let arr_val = Value::Array(Rc::new(elements.clone()));
                let const_idx = self.chunk.add_constant(arr_val);
                self.chunk.write(OpCode::Constant as u8);
                self.chunk.write(const_idx);
            }
            Expr::Var(var_name) => {
                let const_idx = self.chunk.add_constant(Value::VarName(*var_name));
                self.chunk.write(OpCode::Constant as u8);
                self.chunk.write(const_idx);
                self.chunk.write(OpCode::LoadVar as u8);
            }
            Expr::Assign(var_name, rhs) => {
                self.compile_expr(rhs)?;
                let const_idx = self.chunk.add_constant(Value::VarName(*var_name));
                self.chunk.write(OpCode::Constant as u8);
                self.chunk.write(const_idx);
                self.chunk.write(OpCode::StoreVar as u8);
            }
            Expr::Add(left, right) => {
                self.compile_expr(left)?;
                self.compile_expr(right)?;
                self.chunk.write(OpCode::Add as u8);
            }
        }
        Ok(())
    }

    /// Finalizes the Pūrvatrāsiddham pass, terminating the sequence
    pub fn finish(&mut self) {
        self.chunk.write(OpCode::Return as u8);
    }

    pub fn get_chunk(self) -> Chunk {
        self.chunk
    }
}
`
  },
  {
    path: 'skrit-core/src/vm.rs',
    name: 'skrit-core/src/vm.rs',
    category: 'core',
    description: 'Tier-0 Stack VM with Rc::make_mut Mokṣa in-place mutation',
    content: `// skrit-core/src/vm.rs

use std::collections::HashMap;
use std::rc::Rc;

#[derive(Debug, Clone, PartialEq)]
pub enum Value {
    Num(i32),
    Array(Rc<Vec<i32>>), // Foundation of the Mokṣa (Functional But In-Place) memory system
    VarName(char),
}

impl std::fmt::Display for Value {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Value::Num(n) => write!(f, "{}", n),
            Value::Array(arr) => write!(f, "{:?}", arr),
            Value::VarName(c) => write!(f, "Variable('{}')", c),
        }
    }
}

#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum OpCode {
    Constant = 0x01,
    Add = 0x02,
    StoreVar = 0x03,
    LoadVar = 0x04,
    Return = 0x05,
}

impl From<u8> for OpCode {
    fn from(byte: u8) -> Self {
        match byte {
            0x01 => OpCode::Constant,
            0x02 => OpCode::Add,
            0x03 => OpCode::StoreVar,
            0x04 => OpCode::LoadVar,
            0x05 => OpCode::Return,
            _ => panic!("Apabhraṃśa: Invalid OpCode {:#04x}", byte),
        }
    }
}

#[derive(Default)]
pub struct Chunk {
    pub code: Vec<u8>,
    pub constants: Vec<Value>,
}

impl Chunk {
    pub fn new() -> Self {
        Chunk {
            code: Vec::new(),
            constants: Vec::new(),
        }
    }

    pub fn write(&mut self, byte: u8) {
        self.code.push(byte);
    }

    pub fn add_constant(&mut self, value: Value) -> u8 {
        self.constants.push(value);
        (self.constants.len() - 1) as u8
    }
}

pub struct VM {
    pub chunk: Chunk,
    stack: Vec<Value>,
    ip: usize,
    variables: HashMap<char, Value>,
    pub execution_log: Vec<String>,
}

impl VM {
    pub fn new(chunk: Chunk) -> Self {
        VM {
            chunk,
            stack: Vec::with_capacity(256),
            ip: 0,
            variables: HashMap::new(),
            execution_log: Vec::new(),
        }
    }

    pub fn run(&mut self) -> Result<String, String> {
        loop {
            let instruction = OpCode::from(self.chunk.code[self.ip]);
            self.ip += 1;

            match instruction {
                OpCode::Constant => {
                    let const_idx = self.chunk.code[self.ip] as usize;
                    self.ip += 1;
                    let value = self.chunk.constants[const_idx].clone();
                    self.stack.push(value);
                }
                OpCode::StoreVar => {
                    let var_name_val = self.stack.pop().unwrap();
                    let value = self.stack.pop().unwrap();
                    if let Value::VarName(c) = var_name_val {
                        self.variables.insert(c, value);
                    }
                }
                OpCode::LoadVar => {
                    let var_name_val = self.stack.pop().unwrap();
                    if let Value::VarName(c) = var_name_val {
                        if let Some(val) = self.variables.get(&c) {
                            self.stack.push(val.clone());
                        } else {
                            return Err(format!("Variable '{}' not found in scope", c));
                        }
                    }
                }
                OpCode::Add => {
                    let b = self.stack.pop().unwrap();
                    let a = self.stack.pop().unwrap();

                    match (a, b) {
                        (Value::Num(x), Value::Num(y)) => {
                            self.stack.push(Value::Num(x + y));
                        }
                        
                        // MOKṢA TRIGGER (Functional But In-Place Array Mutation)
                        (Value::Array(mut rc_array), Value::Num(item)) => {
                            let rc_count = Rc::strong_count(&rc_array);
                            let mutable_array = Rc::make_mut(&mut rc_array);
                            mutable_array.push(item);

                            if rc_count == 1 {
                                self.execution_log.push(format!(
                                    "⚡ MOKṢA (Liberation) GRANTED: Reference Count was 1. Array was mutated destructively in-place in O(1) time. -> {:?}", 
                                    mutable_array
                                ));
                            } else {
                                self.execution_log.push(format!(
                                    "❄️ NITYA (Immutability) ENFORCED: Reference Count was {}. Array was copied to a new memory address in O(n) time. -> {:?}", 
                                    rc_count, mutable_array
                                ));
                            }

                            self.stack.push(Value::Array(rc_array));
                        }
                        _ => return Err("Invalid operands for Add operation".to_string()),
                    }
                }
                OpCode::Return => {
                    let final_val = self.stack.pop().unwrap_or(Value::Num(0));
                    self.execution_log.push(format!("Final Stack Output: {}", final_val));
                    return Ok(self.execution_log.join("\\n"));
                }
            }
        }
    }
}
`
  },
  {
    path: 'skrit-wasm/Cargo.toml',
    name: 'skrit-wasm/Cargo.toml',
    category: 'wasm',
    description: 'WebAssembly crate dependencies and cdylib setup',
    content: `[package]
name = "skrit-wasm"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
skrit-core = { path = "../skrit-core" }
wasm-bindgen = "0.2"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
console_error_panic_hook = "0.1"
`
  },
  {
    path: 'skrit-wasm/src/lib.rs',
    name: 'skrit-wasm/src/lib.rs',
    category: 'wasm',
    description: 'WebAssembly bridge function run_skrit_bit(source) -> String',
    content: `// skrit-wasm/src/lib.rs

use wasm_bindgen::prelude::*;
use serde::Serialize;
use skrit_core::{lexer, ast, compiler, vm};

#[derive(Serialize)]
pub struct CompilerPayload {
    pub tokens: Vec<String>,
    pub ast: String,
    pub bytecode: Vec<String>,
    pub vm_result: String,
    pub error: Option<String>,
}

#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn run_skrit_bit(source: &str) -> String {
    let mut payload = CompilerPayload {
        tokens: Vec::new(),
        ast: String::new(),
        bytecode: Vec::new(),
        vm_result: String::new(),
        error: None,
    };

    // 1. LEXER (Śiva Sūtras - Dual-Script Invariance)
    let tokens = lexer::lex(source);
    payload.tokens = tokens.iter().map(|t| format!("{:?}", t)).collect();

    if tokens.is_empty() {
        payload.error = Some("No valid Skrit-bit tokens found.".to_string());
        return serde_json::to_string(&payload).unwrap();
    }

    // 2. PARSER (Anuvṛtti Context Propagation)
    let mut parser = ast::Parser::new(tokens);
    let ast_nodes = match parser.parse_all() {
        Ok(nodes) => nodes,
        Err(e) => {
            payload.error = Some(format!("Apabhraṃśa (Grammar Error): {}", e));
            return serde_json::to_string(&payload).unwrap();
        }
    };
    
    payload.ast = ast_nodes.iter()
        .map(|node| format!("{:#?}", node))
        .collect::<Vec<String>>()
        .join("\\n\\n");

    // 3. COMPILER (Tripādī Bytecode Lowering)
    let mut compiler = compiler::Compiler::new();
    for node in &ast_nodes {
        if let Err(e) = compiler.compile_expr(node) {
            payload.error = Some(format!("Lowering Error: {}", e));
            return serde_json::to_string(&payload).unwrap();
        }
    }
    compiler.finish();
    
    let chunk = compiler.get_chunk();
    payload.bytecode = chunk.code.iter()
        .enumerate()
        .map(|(i, byte)| format!("{:04} | {:#04x}", i, byte))
        .collect();

    // 4. VIRTUAL MACHINE (Execution & Mokṣa In-Place Mutation)
    let mut vm = vm::VM::new(chunk);
    match vm.run() {
        Ok(result_val) => {
            payload.vm_result = result_val;
        }
        Err(e) => {
            payload.error = Some(format!("Runtime Error: {}", e));
        }
    }

    serde_json::to_string(&payload).unwrap_or_else(|_| {
        r#"{"error": "Failed to serialize compiler payload"}"#.to_string()
    })
}
`
  },
  {
    path: 'skrit-web/build.sh',
    name: 'skrit-web/build.sh',
    category: 'script',
    description: 'Bash automation script to compile WASM via wasm-pack and serve locally',
    content: `#!/bin/bash
set -e

echo "🔨 Compiling Skrit-bit core to WebAssembly..."
cd ../skrit-wasm

# Build the WASM module and output it directly into the web folder
wasm-pack build --target web --out-dir ../skrit-web/pkg

echo "✅ WASM compiled successfully."
cd ../skrit-web

echo "🚀 Starting local server at http://localhost:8080"
python3 -m http.server 8080
`
  }
];
