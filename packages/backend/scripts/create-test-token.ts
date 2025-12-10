import { db } from '../src/db/index.js';
import { apiTokens } from '../src/db/schema.js';
import crypto from 'crypto';

async function main() {
  // Generate a new token
  const token = 'cg_test_' + crypto.randomBytes(24).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const tokenPrefix = token.slice(0, 12);

  // Get the first user and workspace
  const existingToken = await db.select().from(apiTokens).limit(1);

  if (!existingToken.length) {
    console.error('No existing tokens found to get user/workspace IDs');
    process.exit(1);
  }

  const { userId, workspaceId } = existingToken[0];

  // Create a test token
  await db.insert(apiTokens).values({
    id: crypto.randomUUID(),
    userId,
    workspaceId,
    name: 'MCP Test Token',
    tokenHash,
    tokenPrefix,
    expiresAt: null,
    createdAt: new Date(),
  });

  console.log('Test token created successfully!');
  console.log('');
  console.log('Token (save this - shown only once):');
  console.log(token);
  console.log('');
  console.log('Run MCP test with:');
  console.log(`./scripts/test-mcp-vm.sh --token=${token}`);

  process.exit(0);
}

main();
