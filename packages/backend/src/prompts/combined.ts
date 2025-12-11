export const combinedAnalysisPrompt = `You are a code analysis expert. Your task is to perform both SECURITY and RELIABILITY audits of this codebase.

## IMPORTANT: Use Parallel Agents

You MUST use the Task tool to spawn TWO parallel agents to complete both analyses simultaneously:

1. **Security Agent** - Analyzes for vulnerabilities, writes to \`.codeguard/security-report.json\`
2. **Reliability Agent** - Analyzes for reliability issues, writes to \`.codeguard/reliability-report.json\`

First, create the output directory:
\`\`\`bash
mkdir -p .codeguard
\`\`\`

Then spawn BOTH agents in a SINGLE message with TWO Task tool calls (this runs them in parallel):

---

## Security Agent Task

Spawn an agent with subagent_type="Explore" and this prompt:

"Perform a security audit of this codebase. Analyze for:
- Authentication & Authorization vulnerabilities
- Input Validation (SQL injection, XSS, command injection, path traversal)
- Cryptography issues (weak algorithms, hardcoded secrets)
- API Security (missing rate limiting, excessive data exposure)
- Dependency vulnerabilities
- Insecure configurations

Write results to \`.codeguard/security-report.json\` with this structure:
{
  "repository": "repo-name",
  "timestamp": "ISO-8601",
  "summary": { "total_issues": 0, "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "issues": [{
    "id": "SEC-001",
    "severity": "critical|high|medium|low",
    "category": "Authentication|Input Validation|Cryptography|API Security|Dependencies|Configuration",
    "title": "Brief title",
    "description": "Detailed description",
    "file_path": "path/to/file",
    "line_start": 10,
    "line_end": 15,
    "code_snippet": "code",
    "remediation": "Fix instructions"
  }]
}

SKIP test files (test/, tests/, __tests__/, *.test.*, *.spec.*, etc.)
Focus on real vulnerabilities with specific line numbers and remediation steps."

---

## Reliability Agent Task

Spawn an agent with subagent_type="Explore" and this prompt:

"Perform a reliability audit of this codebase. Analyze for:
- Error Handling (missing try-catch, unhandled promises, silent failures)
- Resource Management (memory leaks, unclosed connections)
- Async Operations (race conditions, missing await)
- Type Safety issues
- Performance (N+1 queries, inefficient loops, blocking operations)
- Scalability (hardcoded limits, missing pagination)

Write results to \`.codeguard/reliability-report.json\` with this structure:
{
  "repository": "repo-name",
  "timestamp": "ISO-8601",
  "summary": { "total_issues": 0, "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "issues": [{
    "id": "REL-001",
    "severity": "critical|high|medium|low",
    "category": "Error Handling|Resource Management|Async Operations|Type Safety|Performance|Scalability",
    "title": "Brief title",
    "description": "Detailed description",
    "file_path": "path/to/file",
    "line_start": 10,
    "line_end": 15,
    "code_snippet": "code",
    "remediation": "Fix instructions"
  }]
}

SKIP test files (test/, tests/, __tests__/, *.test.*, *.spec.*, etc.)
Focus on real reliability issues with specific line numbers and remediation steps."

---

## Severity Guidelines

For both analyses:
- **Critical**: System failures, data loss, RCE, authentication bypass
- **High**: Serious issues requiring immediate attention
- **Medium**: Issues requiring specific conditions
- **Low**: Best practice violations

## Execution

1. Run \`mkdir -p .codeguard\`
2. Spawn BOTH agents in parallel using TWO Task tool calls in a SINGLE message
3. Wait for both to complete
4. Confirm both JSON files were created

Begin now.`;
