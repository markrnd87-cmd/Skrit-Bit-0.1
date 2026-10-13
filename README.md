# Skrit-Bit

Skrit-bit is a dependently typed functional programming language and Interactive Theorem Prover (ITP) built on the architectural blueprint of Pāṇini's Aṣṭādhyāyī.[cite: 1, 2, 4] By mapping ancient Sanskrit grammatical algorithms directly to modern compiler theory, Skrit-bit achieves mathematical rigor, order-independent pattern matching, and highly optimized bare-metal execution.[cite: 1, 2, 4]

## Core Architecture

Skrit-Bit maps standard compiler pipelines directly to Vedic logic frameworks:

* **Lexical Engine (Śiva Sūtras):** The lexer classifies characters using Śiva Sūtra–derived bitmasks, treating vowels (AC) and consonants (HAL) as ranges over a 64-bit index.[cite: 3] Both Devanagari and Latin characters map to identical bit positions, enabling true dual-script invariance.[cite: 3] This constant-time O(1) bitmask engine replaces traditional regex state machines.[cite: 4]
* **Context-Propagating Parser (Anuvṛtti):** The parser utilizes an `AnuvrittiContext` to track rule history and an active subject variable.[cite: 3] Structurally incomplete expressions (such as `+ 5`) automatically inherit the current subject, reflecting Pāṇini’s economy principle of omitting redundant material.[cite: 3]
* **Type Checker (Utsarga-Apavāda):** Skrit-Bit evaluates pattern matching based on mathematical specificity (Vyāpti) rather than sequential order.[cite: 4] An exception (Apavāda) automatically blocks a general rule (Utsarga) if it is mathematically proven to be a strict subset.[cite: 4]
* **Memory Management (Mokṣa vs Nitya):** The stack VM employs an explicit memory discipline akin to reference-counted copy-on-write semantics.[cite: 3] "Nitya" enforces eternal immutability through structural sharing, while "Mokṣa" permits destructive, in-place hardware mutation when a reference count reaches exactly one.[cite: 3, 4]
* **Compiler & Tier-0 VM (Tripādī):** The compilation pass lowers the Abstract Syntax Tree (AST) into a flat SSA chunk, representing the "Tripādī" phase where rules execute linearly and cannot recursively feed back into earlier states.[cite: 3, 4] This Tier-0 stack VM operates with a reference-counted array heap.[cite: 3, 4]

## Repository Structure

The current repository is a Tier-0 experimental language and stack VM written predominantly in TypeScript (98.7%).[cite: 2, 3] It operates as both a research artifact and an interactive laboratory.[cite: 3]

* `src/lexer.ts`: Contains the Śiva Sūtra bitmask logic and dual-script invariance engine.[cite: 3]
* `src/ast.ts`: Defines the Abstract Syntax Tree and the `AnuvrittiContext` propagation.[cite: 3]
* `src/compiler.ts`: Handles the Tripādī AST-to-bytecode lowering phase.[cite: 3]
* `src/vm.ts`: Implements the Tier-0 stack VM and the Mokṣa/Nitya reference-counted heap.[cite: 3]
* `src/engine.ts`: Orchestrates the execution pipeline via `runSkritBit`.[cite: 3]
* `App.tsx`: A React-based multi-panel studio UI that allows users to type Skrit code, visualize Śiva Sūtra bitmasks, inspect AST/bytecode, and step through VM execution.[cite: 3]
* **Configuration:** The project utilizes standard modern web tooling, including `package.json`, `tsconfig.json`, and `vite.config.ts`.[cite: 1]

## Research & Expansion Goals

Skrit-Bit-0.1 is currently an operational prototype with strong semantic motivations.[cite: 3] Future development aims to expand the Interactive Theorem Prover (ITP) capabilities by integrating formal context-extension judgements and exploring a Rust back-end to implement a verified subset of the VM using native `Rc` and `Arc` memory disciplines.[cite: 3]
