#!/usr/bin/env node
/**
 * Generate build info JSON file with git commit, timestamp, etc.
 * Run this as part of the build process.
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getGitInfo() {
  try {
    const commit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    const commitShort = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    const commitDate = execSync('git log -1 --format=%ci', { encoding: 'utf-8' }).trim();
    const commitMessage = execSync('git log -1 --format=%s', { encoding: 'utf-8' }).trim();
    return { commit, commitShort, branch, commitDate, commitMessage };
  } catch (error) {
    console.warn('Could not get git info:', error.message);
    return {
      commit: 'unknown',
      commitShort: 'unknown',
      branch: 'unknown',
      commitDate: 'unknown',
      commitMessage: 'unknown',
    };
  }
}

const gitInfo = getGitInfo();
const buildInfo = {
  ...gitInfo,
  buildTime: new Date().toISOString(),
  nodeVersion: process.version,
  platform: process.platform,
};

// Write to dist folder (where compiled JS lives)
const distDir = join(__dirname, '..', 'dist');
try { mkdirSync(distDir, { recursive: true }); } catch {}

const outputPath = join(distDir, 'build-info.json');
writeFileSync(outputPath, JSON.stringify(buildInfo, null, 2));

console.log('Generated build-info.json:', buildInfo);
