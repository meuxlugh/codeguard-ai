import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { users, sessions, workspaceMembers, workspaces } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        avatarUrl: string | null;
      };
      workspaceId?: string;
      workspaceRole?: string;
    }
  }
}

// Require authentication
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies?.session;

  if (!sessionId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Find session
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId));

    if (!session || session.expiresAt < new Date()) {
      res.clearCookie('session');
      return res.status(401).json({ error: 'Session expired' });
    }

    // Get user
    const [user] = await db.select().from(users).where(eq(users.id, session.userId));

    if (!user) {
      res.clearCookie('session');
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Require workspace membership
export async function requireWorkspace(req: Request, res: Response, next: NextFunction) {
  // First ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Get workspace from header, query param, or URL path param
  const workspaceId = req.headers['x-workspace-id'] as string
    || req.query.workspaceId as string
    || req.params.id as string;

  if (!workspaceId) {
    return res.status(400).json({ error: 'Workspace ID required' });
  }

  try {
    // Check workspace membership
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, req.user.id)
        )
      );

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this workspace' });
    }

    req.workspaceId = workspaceId;
    req.workspaceRole = membership.role;

    next();
  } catch (error) {
    console.error('Workspace middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Require workspace admin or owner role
export async function requireWorkspaceAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.workspaceRole || !['owner', 'admin'].includes(req.workspaceRole)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Require workspace owner role
export async function requireWorkspaceOwner(req: Request, res: Response, next: NextFunction) {
  if (req.workspaceRole !== 'owner') {
    return res.status(403).json({ error: 'Owner access required' });
  }
  next();
}

// Require write access (owner, admin, or member - not viewer)
export async function requireWriteAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.workspaceRole || req.workspaceRole === 'viewer') {
    return res.status(403).json({ error: 'Write access required. Viewers have read-only access.' });
  }
  next();
}
