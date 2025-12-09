import fs from 'fs/promises';
import { z } from 'zod';

// Schema for validating report JSON
const issueSchema = z.object({
  id: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  category: z.string(),
  title: z.string(),
  description: z.string(),
  file_path: z.string().optional(),
  line_start: z.number().optional(),
  line_end: z.number().optional(),
  code_snippet: z.string().optional(),
  remediation: z.string().optional(),
});

const reportSchema = z.object({
  repository: z.string().optional(),
  timestamp: z.string().optional(),
  summary: z.object({
    total_issues: z.number(),
    critical: z.number(),
    high: z.number(),
    medium: z.number(),
    low: z.number(),
  }).optional(),
  issues: z.array(issueSchema),
});

export type ReportData = z.infer<typeof reportSchema>;
export type IssueData = z.infer<typeof issueSchema>;

export async function parseReportFile(reportPath: string): Promise<ReportData> {
  try {
    const content = await fs.readFile(reportPath, 'utf-8');
    const jsonData = JSON.parse(content);

    // Validate against schema
    const validated = reportSchema.parse(jsonData);

    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Report validation failed:', error.errors);
      throw new Error(`Invalid report format: ${error.errors.map(e => e.message).join(', ')}`);
    }

    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in report file: ${error.message}`);
    }

    throw error;
  }
}

export function validateIssue(issue: unknown): IssueData {
  return issueSchema.parse(issue);
}
