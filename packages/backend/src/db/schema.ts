import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const repositories = pgTable('repositories', {
  id: serial('id').primaryKey(),
  githubUrl: text('github_url').notNull().unique(),
  name: text('name').notNull(),
  owner: text('owner').notNull(),
  defaultBranch: text('default_branch').default('main'),
  status: text('status').notNull().default('pending'), // pending, cloning, analyzing, completed, error
  errorMessage: text('error_message'),
  localPath: text('local_path'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const analysisRuns = pgTable('analysis_runs', {
  id: serial('id').primaryKey(),
  repositoryId: integer('repository_id')
    .notNull()
    .references(() => repositories.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // security, reliability, full
  status: text('status').notNull().default('pending'), // pending, running, completed, error
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const issues = pgTable('issues', {
  id: serial('id').primaryKey(),
  repositoryId: integer('repository_id')
    .notNull()
    .references(() => repositories.id, { onDelete: 'cascade' }),
  analysisRunId: integer('analysis_run_id')
    .references(() => analysisRuns.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // security, reliability
  issueId: text('issue_id').notNull(), // e.g., SEC-001, REL-003
  severity: text('severity').notNull(), // critical, high, medium, low
  category: text('category').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  filePath: text('file_path'),
  lineStart: integer('line_start'),
  lineEnd: integer('line_end'),
  codeSnippet: text('code_snippet'),
  remediation: text('remediation'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const repositoriesRelations = relations(repositories, ({ many }) => ({
  analysisRuns: many(analysisRuns),
  issues: many(issues),
}));

export const analysisRunsRelations = relations(analysisRuns, ({ one, many }) => ({
  repository: one(repositories, {
    fields: [analysisRuns.repositoryId],
    references: [repositories.id],
  }),
  issues: many(issues),
}));

export const issuesRelations = relations(issues, ({ one }) => ({
  repository: one(repositories, {
    fields: [issues.repositoryId],
    references: [repositories.id],
  }),
  analysisRun: one(analysisRuns, {
    fields: [issues.analysisRunId],
    references: [analysisRuns.id],
  }),
}));
