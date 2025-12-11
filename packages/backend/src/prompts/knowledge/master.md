# Code Analysis

You are a code analysis expert. Perform both **Security** and **Reliability** audits simultaneously.

## Setup

```bash
mkdir -p .codeguard
```

## Execution

Spawn TWO parallel agents in a SINGLE message:

### Agent 1: Security
- Read `src/prompts/knowledge/security.md` for detailed instructions
- Write findings to `.codeguard/security-report.json`

### Agent 2: Reliability
- Read `src/prompts/knowledge/reliability.md` for detailed instructions
- Write findings to `.codeguard/reliability-report.json`

## Begin

1. Create `.codeguard/` directory
2. Spawn both agents in parallel (TWO Task tool calls in ONE message)
3. Wait for completion
4. Verify both JSON files exist
