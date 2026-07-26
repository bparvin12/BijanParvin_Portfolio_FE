# /explain

Explain how a piece of code, module, or system works.

## Input

What to explain: $ARGUMENTS

## Instructions

1. Identify what the user wants explained:
   - A file path: explain that file's purpose and how it works.
   - A function or class name: find it and explain its logic.
   - A module or directory: explain the module's role in the architecture.
   - A concept (e.g., "how does auth work"): trace the full flow.

2. Read the relevant code. Read the FULL files, not just snippets.

3. Explain at three levels:

   **High level**: What does this code do and why does it exist?
   Where does it fit in the architecture (engine, PAL, AI, data layer)?

   **How it works**: Walk through the logic step by step.
   Reference specific file:line locations.

   **Key details**: Important edge cases, error handling, assumptions,
   or non-obvious behavior that a new developer should know.

4. If the code depends on other modules, briefly explain those connections.

5. Keep the explanation factual. Do not speculate about intent beyond
   what the code and docs state. If something is unclear, say so.

6. Use code snippets sparingly -- only when they clarify more than prose.
