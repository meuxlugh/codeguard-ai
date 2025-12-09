# CodeGuard AI - Autonomous Implementation

## Mission

You are Claude Code acting as a **full-stack product team** building CodeGuard AI from scratch.
This is an **autonomous overnight task** - work without interruption until done.

### Autonomy Rules
- **NEVER pause or ask for decisions** - make informed choices and document them
- **NEVER get stuck** - max 30 min per task, max 3 attempts per problem, then skip and move on
- **NEVER ask for API keys or credentials** - use env vars placeholders, test with mocks
- **Better 80% working than 20% perfect**

---

## Context

### Specification
- **Read SPEC.md first** - contains full product spec, database schema, API endpoints, prompts

### What You're Building
CodeGuard AI is a security and reliability analysis platform:
1. User adds a public GitHub repo URL
2. System clones the repo locally
3. Claude Code CLI runs security + reliability analysis (in parallel)
4. Results stored in PostgreSQL
5. User browses code in Monaco editor with issues highlighted on specific lines
6. User can trigger re-analysis

### Output
- **All code in this directory**: `/Users/sderosiaux/Desktop/ai-projects/codeguard-ai/`
- **PROGRESS.md**: Log of completed work, issues, remaining TODOs
- **Working app** that starts with `pnpm dev`

---

## Technical Stack

```
# Monorepo
pnpm workspaces (packages/backend, packages/frontend)

# Backend
Node.js 20+ / Express / TypeScript
Drizzle ORM + PostgreSQL 16
Claude Code CLI spawned via child_process

# Frontend
React 18 + TypeScript + Vite
TanStack Query v5
React Router v6
Tailwind CSS + shadcn/ui
Monaco Editor (@monaco-editor/react)

# Dev
Docker Compose (PostgreSQL only)
```

Use stable versions. If bleeding-edge causes issues, downgrade.

---

## Project Structure

```
codeguard-ai/
├── package.json                 # Workspace root
├── pnpm-workspace.yaml
├── docker-compose.yml           # PostgreSQL
├── .env.example
├── SPEC.md                      # Product specification
├── PROGRESS.md                  # Your progress log
│
├── packages/
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── drizzle.config.ts
│   │   └── src/
│   │       ├── index.ts         # Express entry
│   │       ├── db/
│   │       │   ├── schema.ts    # Drizzle schema
│   │       │   └── index.ts     # Connection
│   │       ├── routes/
│   │       │   ├── repos.ts
│   │       │   ├── files.ts
│   │       │   └── issues.ts
│   │       ├── services/
│   │       │   ├── github.ts    # Clone repos
│   │       │   ├── analyzer.ts  # Claude Code orchestration
│   │       │   └── parser.ts    # Parse JSON reports
│   │       └── prompts/
│   │           ├── security.ts
│   │           └── reliability.ts
│   │
│   └── frontend/
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── components/
│           │   ├── ui/          # shadcn components
│           │   ├── RepoList.tsx
│           │   ├── RepoCard.tsx
│           │   ├── AddRepoDialog.tsx
│           │   ├── CodeBrowser.tsx
│           │   ├── FileTree.tsx
│           │   ├── CodeEditor.tsx
│           │   └── IssuePanel.tsx
│           ├── pages/
│           │   ├── HomePage.tsx
│           │   └── RepoBrowserPage.tsx
│           ├── hooks/
│           │   └── useApi.ts
│           └── lib/
│               ├── api.ts
│               └── utils.ts
```

---

## Sub-Agents & Parallelization

**Use the Task tool extensively** to spawn sub-agents for parallel work.

**Rules:**
- Always parallelize independent tasks
- Each agent should be self-contained with clear inputs/outputs
- Spawn multiple agents simultaneously when possible

**Examples of parallel work:**
- Backend setup + Frontend setup (after monorepo init)
- Security prompt file + Reliability prompt file
- Multiple UI components simultaneously
- API routes can be built in parallel

---

## Execution Plan

### Phase 1: Foundation (Sequential)

1. **Initialize Monorepo**
   ```bash
   pnpm init
   # Create pnpm-workspace.yaml
   # Create root package.json with workspace scripts
   ```

2. **Create docker-compose.yml**
   - PostgreSQL 16 on port 5432
   - Credentials: codeguard/codeguard/codeguard

3. **Create .env.example**
   ```
   DATABASE_URL=postgresql://codeguard:codeguard@localhost:5432/codeguard
   ANTHROPIC_API_KEY=sk-ant-xxx
   REPOS_BASE_PATH=/tmp/codeguard-repos
   PORT=3001
   ```

### Phase 2: Backend (Can parallelize internally)

**Spawn agents for:**

1. **Database Setup Agent**
   - Initialize packages/backend with TypeScript + Express
   - Setup Drizzle ORM with schema from SPEC.md
   - Create db:push script for migrations

2. **API Routes Agent**
   - Implement all routes from SPEC.md
   - GET/POST/DELETE /api/repos
   - GET /api/repos/:id/files, /api/repos/:id/files/*path
   - GET /api/repos/:id/issues

3. **Services Agent**
   - github.ts: Clone public repos using simple-git
   - analyzer.ts: Spawn Claude Code CLI, manage processes
   - parser.ts: Parse JSON reports from .codeguard/ folder

4. **Prompts Agent**
   - Extract security prompt from SPEC.md → security.ts
   - Extract reliability prompt from SPEC.md → reliability.ts
   - Export as template strings

### Phase 3: Frontend (Can parallelize internally)

**Spawn agents for:**

1. **Frontend Setup Agent**
   - Initialize Vite + React + TypeScript
   - Configure Tailwind + shadcn/ui
   - Setup React Router with 2 routes: / and /repos/:id

2. **UI Components Agent**
   - Install shadcn components: button, card, dialog, badge, tooltip
   - Create RepoCard, AddRepoDialog components

3. **Code Browser Agent**
   - Setup Monaco Editor with @monaco-editor/react
   - FileTree component (recursive, shows issue counts)
   - CodeEditor with line decorations for issues
   - IssuePanel for issue details

4. **API Integration Agent**
   - Setup TanStack Query
   - Create hooks: useRepos, useRepo, useFiles, useIssues
   - Implement polling for status updates

### Phase 4: Integration & Polish

1. **Wire Everything Together**
   - Test full flow: add repo → clone → analyze → view results
   - Ensure status updates work (polling every 2s during analysis)

2. **Error Handling**
   - Handle clone failures
   - Handle analysis failures
   - Display error states in UI

3. **Final Checks**
   - `pnpm build` passes for both packages
   - `pnpm dev` starts both backend and frontend
   - TypeScript has no errors (or use @ts-expect-error)

---

## Claude Code Integration Details

### Spawning Claude Code

```typescript
import { spawn } from 'child_process';

export async function runAnalysis(repoPath: string, type: 'security' | 'reliability'): Promise<void> {
  const prompt = type === 'security' ? securityPrompt : reliabilityPrompt;

  return new Promise((resolve, reject) => {
    const claude = spawn('claude', ['-p', prompt, '--print'], {
      cwd: repoPath,
      env: {
        ...process.env,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    claude.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Claude exited with code ${code}`));
    });

    claude.on('error', reject);
  });
}
```

### Expected Output Files

After analysis, Claude Code creates:
- `.codeguard/security-report.json`
- `.codeguard/reliability-report.json`
- `.codeguard/attack-surface.json` (optional)
- `.codeguard/architecture-recon.json` (optional)

Parse the report JSONs and insert findings into the issues table.

---

## Monaco Editor Integration

### Highlighting Issues

```typescript
import { editor } from 'monaco-editor';

// Create decorations for issues
const decorations = issues
  .filter(issue => issue.file_path === currentFile)
  .map(issue => ({
    range: new monaco.Range(issue.line_start, 1, issue.line_end || issue.line_start, 1),
    options: {
      isWholeLine: true,
      className: `issue-${issue.severity}`, // issue-critical, issue-high, etc.
      glyphMarginClassName: `glyph-${issue.severity}`,
      hoverMessage: { value: `**${issue.title}**\n\n${issue.description}` }
    }
  }));

editorInstance.deltaDecorations([], decorations);
```

### CSS for Severity Colors

```css
.issue-critical { background: rgba(239, 68, 68, 0.2); }
.issue-high { background: rgba(249, 115, 22, 0.2); }
.issue-medium { background: rgba(234, 179, 8, 0.2); }
.issue-low { background: rgba(34, 197, 94, 0.2); }

.glyph-critical { background: #ef4444; }
.glyph-high { background: #f97316; }
.glyph-medium { background: #eab308; }
.glyph-low { background: #22c55e; }
```

---

## Hard Constraints

1. **Light theme only** - no dark mode for MVP
2. **No authentication** - public access
3. **Public repos only** - no GitHub OAuth
4. **PostgreSQL only** - no SQLite, no other DBs
5. **pnpm only** - no npm, no yarn
6. **Keep code buildable at ALL times** - commit working states

---

## Escape Hatches

To avoid getting stuck overnight:

| Problem | Action |
|---------|--------|
| `pnpm install` fails | Delete node_modules + lockfile, retry. If still fails, use alternative package |
| Drizzle issues | Fallback to raw SQL with pg client |
| Monaco editor issues | Use simple `<pre>` with highlighted lines as fallback |
| Claude CLI not found | Mock the analyzer service, return fake results |
| TypeScript won't compile | `@ts-expect-error` after 3 attempts |
| shadcn install fails | Copy component code manually from shadcn docs |
| Any single task > 30 min | Skip, document in PROGRESS.md, continue |

---

## Progress Tracking

Create and maintain `PROGRESS.md`:

```markdown
# CodeGuard AI - Progress Log

## Completed
- [x] Task description (timestamp)

## In Progress
- [ ] Current task

## Blocked / Skipped
- [ ] Task - reason skipped

## Issues Encountered
- Issue description and resolution

## TODO (if not completed)
- Remaining work
```

Update this file after each major task completion.

---

## Design Guidelines

From SPEC.md - key points:

- **Professional, minimalist UI** (Linear/Stripe style)
- **Severity colors**:
  - Critical: red-500 (#ef4444)
  - High: orange-500 (#f97316)
  - Medium: yellow-500 (#eab308)
  - Low: green-500 (#22c55e)
- **Smooth hover transitions** (150ms)
- **File tree** shows issue count badges per file/folder
- **Collapsible panels**

---

## Testing the App

When done, the app should work like this:

```bash
# Terminal 1: Start PostgreSQL
docker-compose up -d

# Terminal 2: Run migrations
pnpm --filter backend db:push

# Terminal 3: Start backend
pnpm --filter backend dev
# → http://localhost:3001

# Terminal 4: Start frontend
pnpm --filter frontend dev
# → http://localhost:5173

# In browser:
# 1. Click "Add Repository"
# 2. Enter: https://github.com/expressjs/express
# 3. Watch status change: pending → cloning → analyzing → completed
# 4. Click on repo to open code browser
# 5. See file tree with issue counts
# 6. Click file to see code with highlighted lines
# 7. Hover on highlighted line to see issue details
```

---

## GO

Start now. Read SPEC.md, then execute the plan.

```bash
cd /Users/sderosiaux/Desktop/ai-projects/codeguard-ai
```

Build this product autonomously. Document your progress. Don't stop until it's done or you've exhausted all options.
