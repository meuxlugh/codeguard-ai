import { Router } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { db, repositories, repositoryShares, issues } from '../db/index.js';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

// Helper to build file tree
async function buildFileTree(dirPath: string, basePath: string): Promise<FileNode[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nodes: FileNode[] = [];

  for (const entry of entries) {
    // Skip .git and node_modules
    if (entry.name === '.git' || entry.name === 'node_modules') {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(basePath, fullPath);

    if (entry.isDirectory()) {
      const children = await buildFileTree(fullPath, basePath);
      nodes.push({
        name: entry.name,
        path: relativePath,
        type: 'directory',
        children,
      });
    } else {
      nodes.push({
        name: entry.name,
        path: relativePath,
        type: 'file',
      });
    }
  }

  return nodes.sort((a, b) => {
    // Directories first, then alphabetically
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

// Middleware to validate share token and attach repo
async function validateShareToken(req: any, res: any, next: any) {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ error: 'Share token is required' });
  }

  // Find the share and its associated repository
  const [share] = await db
    .select()
    .from(repositoryShares)
    .where(eq(repositoryShares.token, token))
    .limit(1);

  if (!share) {
    return res.status(404).json({ error: 'Share link not found or expired' });
  }

  // Check expiration
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return res.status(410).json({ error: 'Share link has expired' });
  }

  // Get the repository
  const [repo] = await db
    .select()
    .from(repositories)
    .where(eq(repositories.id, share.repositoryId))
    .limit(1);

  if (!repo) {
    return res.status(404).json({ error: 'Repository not found' });
  }

  // Attach to request
  req.share = share;
  req.repo = repo;
  next();
}

// GET /:token/repo - Get repository metadata
router.get('/:token/repo', validateShareToken, async (req: any, res, next) => {
  try {
    const repo = req.repo;

    // Get issue counts by severity
    const issueCounts = await db
      .select({
        severity: issues.severity,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(issues)
      .where(eq(issues.repositoryId, repo.id))
      .groupBy(issues.severity);

    const repoWithCounts = {
      ...repo,
      issueCounts: issueCounts.reduce((acc, { severity, count }) => {
        acc[severity] = count;
        return acc;
      }, {} as Record<string, number>),
    };

    // Remove sensitive fields
    const { localPath, ...safeRepo } = repoWithCounts;

    res.json(safeRepo);
  } catch (error) {
    next(error);
  }
});

// GET /:token/files - Get file tree
router.get('/:token/files', validateShareToken, async (req: any, res, next) => {
  try {
    const repo = req.repo;

    if (!repo.localPath) {
      return res.status(400).json({ error: 'Repository not cloned yet' });
    }

    // Check if directory exists
    try {
      await fs.access(repo.localPath);
    } catch {
      return res.status(404).json({ error: 'Repository directory not found' });
    }

    const fileTree = await buildFileTree(repo.localPath, repo.localPath);
    res.json(fileTree);
  } catch (error) {
    next(error);
  }
});

// GET /:token/files/*path - Get file content
router.get('/:token/files/*', validateShareToken, async (req: any, res, next) => {
  try {
    const repo = req.repo;

    // Get the path after /files/
    const filePath = (req.params as Record<string, string>)[0];
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    if (!repo.localPath) {
      return res.status(400).json({ error: 'Repository not cloned yet' });
    }

    // Construct full path and ensure it's within the repo directory (path traversal protection)
    const fullPath = path.join(repo.localPath, filePath);
    const normalizedPath = path.normalize(fullPath);
    const normalizedRepoPath = path.normalize(repo.localPath);

    if (!normalizedPath.startsWith(normalizedRepoPath)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    // Read file content
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      res.json({
        path: filePath,
        content,
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return res.status(404).json({ error: 'File not found' });
      }
      if ((error as NodeJS.ErrnoException).code === 'EISDIR') {
        return res.status(400).json({ error: 'Path is a directory, not a file' });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

// GET /:token/issues - List all issues for repo
router.get('/:token/issues', validateShareToken, async (req: any, res, next) => {
  try {
    const repo = req.repo;

    // Build filters
    const filters = [eq(issues.repositoryId, repo.id)];

    // Optional severity filter
    if (req.query.severity) {
      const severities = Array.isArray(req.query.severity)
        ? req.query.severity
        : [req.query.severity];
      filters.push(sql`${issues.severity} = ANY(${severities})`);
    }

    // Optional category filter
    if (req.query.category) {
      const categories = Array.isArray(req.query.category)
        ? req.query.category
        : [req.query.category];
      filters.push(sql`${issues.category} = ANY(${categories})`);
    }

    // Optional type filter (security/reliability)
    if (req.query.type) {
      filters.push(eq(issues.type, req.query.type as string));
    }

    const allIssues = await db
      .select()
      .from(issues)
      .where(and(...filters))
      .orderBy(
        sql`CASE ${issues.severity}
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END`,
        issues.createdAt
      );

    res.json(allIssues);
  } catch (error) {
    next(error);
  }
});

// GET /:token/issues/by-file - Issues grouped by file path
router.get('/:token/issues/by-file', validateShareToken, async (req: any, res, next) => {
  try {
    const repo = req.repo;

    // Get all issues for this repo
    const allIssues = await db
      .select()
      .from(issues)
      .where(eq(issues.repositoryId, repo.id))
      .orderBy(
        sql`CASE ${issues.severity}
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END`,
        issues.filePath,
        issues.lineStart
      );

    // Group by file path
    const groupedByFile = allIssues.reduce((acc, issue) => {
      const filePath = issue.filePath || 'No file specified';
      if (!acc[filePath]) {
        acc[filePath] = [];
      }
      acc[filePath].push(issue);
      return acc;
    }, {} as Record<string, typeof allIssues>);

    // Convert to array format
    const result = Object.entries(groupedByFile).map(([filePath, fileIssues]) => ({
      filePath,
      issueCount: fileIssues.length,
      issues: fileIssues,
    }));

    // Sort by issue count (descending)
    result.sort((a, b) => b.issueCount - a.issueCount);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
