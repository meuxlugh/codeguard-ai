import { Router } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { db, issues, repositories } from '../db/index.js';

const router = Router();

// GET /:id/issues - List all issues for repo
router.get('/:id/issues', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid repository ID' });
    }

    // Check if repo exists
    const [repo] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, id))
      .limit(1);

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Build filters
    const filters = [eq(issues.repositoryId, id)];

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

// GET /:id/issues/by-file - Issues grouped by file path
router.get('/:id/issues/by-file', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid repository ID' });
    }

    // Check if repo exists
    const [repo] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, id))
      .limit(1);

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Get all issues for this repo
    const allIssues = await db
      .select()
      .from(issues)
      .where(eq(issues.repositoryId, id))
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
