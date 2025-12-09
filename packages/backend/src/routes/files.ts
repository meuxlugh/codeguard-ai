import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db, repositories } from '../db/index.js';
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

// GET /:id/files - Get file tree
router.get('/:id/files', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid repository ID' });
    }

    const [repo] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, id))
      .limit(1);

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

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

// GET /:id/files/*path - Get file content
router.get('/:id/files/*', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid repository ID' });
    }

    // Get the path after /files/
    const filePath = (req.params as Record<string, string>)[0];
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const [repo] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, id))
      .limit(1);

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    if (!repo.localPath) {
      return res.status(400).json({ error: 'Repository not cloned yet' });
    }

    // Construct full path and ensure it's within the repo directory
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

export default router;
