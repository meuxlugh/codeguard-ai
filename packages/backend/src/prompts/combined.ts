import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Knowledge files location (from dist/prompts to src/prompts/knowledge)
const knowledgeDir = path.join(__dirname, '..', '..', 'src', 'prompts', 'knowledge');
const securityPath = path.join(knowledgeDir, 'security.md');
const reliabilityPath = path.join(knowledgeDir, 'reliability.md');

// Master prompt with absolute paths injected
export const combinedAnalysisPrompt = `# Code Analysis

You are a code analysis expert. Perform both **Security** and **Reliability** audits simultaneously.

## Setup

\`\`\`bash
mkdir -p .codeguard
\`\`\`

## Execution

Spawn TWO parallel agents in a SINGLE message:

### Agent 1: Security
- Read \`${securityPath}\` for detailed instructions and examples
- Write findings to \`.codeguard/security-report.json\`

### Agent 2: Reliability
- Read \`${reliabilityPath}\` for detailed instructions and examples
- Write findings to \`.codeguard/reliability-report.json\`

## Begin

1. Create \`.codeguard/\` directory
2. Spawn both agents in parallel (TWO Task tool calls in ONE message)
3. Wait for completion
4. Verify both JSON files exist
`;

// Export individual prompts for standalone use
export const securityPrompt = fs.readFileSync(securityPath, 'utf-8');
export const reliabilityPrompt = fs.readFileSync(reliabilityPath, 'utf-8');
