/**
 * Spikelog Metric Tracking Service
 *
 * Fire-and-forget metric tracking. Fails silently if API key is not set or API is down.
 * Each chart stores last 1,000 datapoints in a rolling window.
 */

const SPIKELOG_API_URL = 'https://api.spikelog.com/api/v1/ingest';
const API_KEY = process.env.SPIKELOG_API_KEY;

interface TrackOptions {
  tags?: Record<string, string>;
  timestamp?: string;
}

/**
 * Track a metric to Spikelog. Fire-and-forget - never blocks, never throws.
 *
 * @param chart - Chart name (e.g., "Analysis Duration", "OAuth Logins")
 * @param value - Numeric value to track
 * @param options - Optional tags and timestamp
 */
export function track(chart: string, value: number, options?: TrackOptions): void {
  // Skip if no API key configured
  if (!API_KEY) {
    return;
  }

  // Fire and forget - don't await
  sendMetric(chart, value, options).catch((err) => {
    // Log but don't crash
    console.error(`[Spikelog] Failed to track "${chart}":`, err.message);
  });
}

async function sendMetric(chart: string, value: number, options?: TrackOptions): Promise<void> {
  const body: Record<string, unknown> = {
    chart,
    value,
  };

  if (options?.tags) {
    body.tags = options.tags;
  }

  if (options?.timestamp) {
    body.timestamp = options.timestamp;
  }

  const response = await fetch(SPIKELOG_API_URL, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
}

// Convenience functions for common metrics
export const spikelog = {
  track,

  /** Track analysis duration in seconds */
  analysisDuration: (seconds: number, repoName: string) =>
    track('Analysis Duration', seconds, { tags: { repo: repoName } }),

  /** Track analysis success (1) or failure (0) */
  analysisResult: (success: boolean, repoName: string) =>
    track('Analysis Success', success ? 1 : 0, { tags: { repo: repoName } }),

  /** Track number of issues found */
  issuesFound: (count: number, repoName: string) =>
    track('Issues Found', count, { tags: { repo: repoName } }),

  /** Track total active repositories count */
  activeRepositories: (count: number) =>
    track('Active Repositories', count),

  /** Track OAuth login */
  oauthLogin: () =>
    track('OAuth Logins', 1),

  /** Track MCP tool call */
  mcpToolCall: (tool: string) =>
    track('MCP Tool Calls', 1, { tags: { tool } }),

  /** Track clone failure */
  cloneFailure: (repoUrl: string, error: string) =>
    track('Clone Failures', 1, { tags: { repo: repoUrl, error: error.substring(0, 100) } }),
};
