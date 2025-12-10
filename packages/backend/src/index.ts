// Load environment variables FIRST (before any imports that use them)
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createRequire } from 'module';
import reposRouter from './routes/repos.js';
import filesRouter from './routes/files.js';
import issuesRouter from './routes/issues.js';
import cliRouter from './routes/cli.js';
import authRouter from './routes/auth.js';
import workspacesRouter from './routes/workspaces.js';
import tokensRouter from './routes/tokens.js';
import mcpRouter from './routes/mcp.js';
import sharesRouter from './routes/shares.js';

// Load build info (generated at build time)
const require = createRequire(import.meta.url);
let buildInfo = { commit: 'dev', commitShort: 'dev', branch: 'local', buildTime: 'dev' };
try {
  buildInfo = require('./build-info.json');
} catch {
  // Running in dev mode without build
}

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, 'https://security-guard-ai.vercel.app'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health check with build info
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), build: buildInfo });
});

// Build info endpoint
app.get('/api/build-info', (req, res) => {
  res.json(buildInfo);
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/workspaces', workspacesRouter);
app.use('/api/repos', reposRouter);
app.use('/api/repos', filesRouter);
app.use('/api/repos', issuesRouter);
app.use('/api/cli', cliRouter);
app.use('/api/tokens', tokensRouter);
app.use('/api/mcp', mcpRouter);
app.use('/api/share', sharesRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Database: ${process.env.DATABASE_URL || 'postgresql://codeguard:codeguard@localhost:5432/codeguard'}`);
});
