const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface PublicRepository {
  id: number;
  workspaceId: string;
  githubUrl: string;
  owner: string;
  name: string;
  status: 'pending' | 'cloning' | 'analyzing' | 'completed' | 'failed' | 'error';
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  issueCounts?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export interface Issue {
  id: number;
  repositoryId: number;
  analysisRunId: number;
  type: 'security' | 'reliability';
  issueId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  filePath: string | null;
  lineStart: number | null;
  lineEnd: number | null;
  codeSnippet: string | null;
  remediation: string | null;
  createdAt: string;
}

export interface FileIssues {
  filePath: string;
  issueCount: number;
  issues: Issue[];
}

// Public API functions (no authentication required)

export async function fetchPublicRepo(token: string): Promise<PublicRepository> {
  const response = await fetch(`${API_BASE}/share/${token}/repo`);
  if (!response.ok) {
    if (response.status === 404) throw new Error('Share link not found');
    if (response.status === 410) throw new Error('Share link has expired');
    throw new Error('Failed to fetch repository');
  }
  return response.json();
}

export async function fetchPublicFiles(token: string): Promise<FileNode[]> {
  const response = await fetch(`${API_BASE}/share/${token}/files`);
  if (!response.ok) throw new Error('Failed to fetch files');
  return response.json();
}

export async function fetchPublicFileContent(
  token: string,
  path: string
): Promise<string> {
  const response = await fetch(
    `${API_BASE}/share/${token}/files/${encodeURIComponent(path)}`
  );
  if (!response.ok) throw new Error('Failed to fetch file content');
  const data = await response.json();
  return data.content;
}

export async function fetchPublicIssues(token: string): Promise<Issue[]> {
  const response = await fetch(`${API_BASE}/share/${token}/issues`);
  if (!response.ok) throw new Error('Failed to fetch issues');
  return response.json();
}

export async function fetchPublicIssuesByFile(token: string): Promise<FileIssues[]> {
  const response = await fetch(`${API_BASE}/share/${token}/issues/by-file`);
  if (!response.ok) throw new Error('Failed to fetch issues by file');
  return response.json();
}
