# /document

Update project documentation to reflect current implementation state.

## Input

What to document or sync: $ARGUMENTS

## Instructions

1. Read the current state of:
   - `docs/PROJECT_PLAN.md` (architecture and decisions)
   - `docs/TASKS.md` (task status)
   - `CLAUDE.md` (development guide and status)

2. Determine what needs updating:
   - No arguments: audit all docs for staleness against the codebase.
   - "decision: <topic>": record an architecture decision.
   - "status": sync CLAUDE.md status section with TASKS.md.
   - A specific doc path: update that document.

3. For architecture decisions, add to PROJECT_PLAN.md:
   - **Context**: What situation prompted the decision.
   - **Decision**: What was decided.
   - **Rationale**: Why this approach over alternatives.
   - **Consequences**: What this means for future work.

4. For status sync:
   - Update the status section in CLAUDE.md to reflect completed tasks.
   - Update the NEXT line to point to the actual next task.

5. Rules:
   - Plain style prose, no em dashes.
   - Keep docs concise. Prefer bullet points over paragraphs.
   - Do not add speculative content. Document what IS, not what might be.
   - Do not create new documentation files unless explicitly asked.
