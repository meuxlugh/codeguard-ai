import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface FileContent {
  path: string;
  content: string;
}

interface ScanRequest {
  files: FileContent[];
}

interface Issue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  suggestion: string;
}

interface ScanResponse {
  issues: Issue[];
  grade: string;
  score: number;
  filesScanned: number;
}

// Calculate grade from issue counts
function calculateGrade(issues: Issue[]): { grade: string; score: number } {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const issue of issues) {
    counts[issue.severity]++;
  }

  const score = counts.critical * 10 + counts.high * 5 + counts.medium * 2 + counts.low * 1;

  let grade: string;
  if (score === 0) grade = 'A';
  else if (score <= 5) grade = 'A';
  else if (score <= 15) grade = 'B';
  else if (score <= 30) grade = 'C';
  else if (score <= 60) grade = 'D';
  else grade = 'F';

  return { grade, score };
}

// Build the analysis prompt with file contents
function buildAnalysisPrompt(files: FileContent[]): string {
  const fileList = files.map(f => `### ${f.path}\n\`\`\`\n${f.content.substring(0, 10000)}\n\`\`\``).join('\n\n');

  return `You are a security auditor analyzing code for potential vulnerabilities.

## Files to Analyze

${fileList}

## Your Task

Analyze these files for security vulnerabilities and code quality issues. Focus on:

1. **Security Issues**
   - SQL/NoSQL injection
   - XSS vulnerabilities
   - Authentication/authorization flaws
   - Hardcoded secrets
   - Command injection
   - Path traversal
   - Insecure cryptography

2. **Code Quality**
   - Error handling issues
   - Resource leaks
   - Race conditions
   - Null pointer risks

## Output Format

Return ONLY a JSON object with this exact structure (no markdown, no explanation):

{
  "issues": [
    {
      "id": "SEC-001",
      "severity": "critical|high|medium|low",
      "category": "Security|Input Validation|Authentication|Cryptography|Error Handling|Code Quality",
      "title": "Brief title",
      "description": "Detailed description of the issue",
      "filePath": "path/to/file.ext",
      "lineStart": 10,
      "lineEnd": 15,
      "suggestion": "How to fix this issue"
    }
  ]
}

## Severity Guidelines

- **critical**: Easily exploitable, high impact (RCE, SQL injection, auth bypass)
- **high**: Serious issues requiring attention (XSS, CSRF, data exposure)
- **medium**: Issues requiring specific conditions (weak crypto, missing validation)
- **low**: Best practice violations (info disclosure, missing headers)

Return ONLY valid JSON. No markdown code blocks, no explanations.`;
}

// POST /api/cli/scan - Analyze files sent from CLI
router.post('/scan', async (req, res) => {
  try {
    const { files } = req.body as ScanRequest;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    console.log(`CLI scan request: ${files.length} files`);

    // Build prompt with file contents
    const prompt = buildAnalysisPrompt(files);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text content
    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse JSON response
    let analysisResult: { issues: Issue[] };
    try {
      // Try to extract JSON from the response (handle potential markdown wrapping)
      let jsonStr = textContent.text.trim();

      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', textContent.text);
      // Return empty issues if parsing fails
      analysisResult = { issues: [] };
    }

    // Calculate grade
    const { grade, score } = calculateGrade(analysisResult.issues || []);

    const response: ScanResponse = {
      issues: analysisResult.issues || [],
      grade,
      score,
      filesScanned: files.length,
    };

    console.log(`CLI scan complete: ${response.issues.length} issues found, grade: ${grade}`);

    res.json(response);
  } catch (error) {
    console.error('CLI scan error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
