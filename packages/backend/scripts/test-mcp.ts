/**
 * MCP Client Test Script
 *
 * Tests the MCP server at /api/mcp to verify JSON-RPC 2.0 protocol works correctly.
 *
 * Usage:
 *   npx tsx scripts/test-mcp.ts [--token <API_TOKEN>] [--url <SERVER_URL>]
 *
 * Default URL: http://localhost:3001/api/mcp
 *
 * To run on VM:
 *   ./scripts/test-mcp-vm.sh [--token <API_TOKEN>]
 */

const DEFAULT_URL = 'http://localhost:3001/api/mcp';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

class MCPClient {
  private url: string;
  private token: string;
  private requestId = 0;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  private async request(method: string, params?: Record<string, unknown>): Promise<JsonRpcResponse> {
    const payload: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: ++this.requestId,
      method,
      params,
    };

    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  }

  async initialize(): Promise<JsonRpcResponse> {
    return this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'mcp-test-client', version: '1.0.0' },
    });
  }

  async listTools(): Promise<JsonRpcResponse> {
    return this.request('tools/list');
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<JsonRpcResponse> {
    return this.request('tools/call', { name, arguments: args });
  }

  async ping(): Promise<JsonRpcResponse> {
    return this.request('ping');
  }
}

function printResult(label: string, response: JsonRpcResponse) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${label}`);
  console.log('='.repeat(60));

  if (response.error) {
    console.log(`  Status: FAILED`);
    console.log(`  Error Code: ${response.error.code}`);
    console.log(`  Error Message: ${response.error.message}`);
    if (response.error.data) {
      console.log(`  Error Data:`, response.error.data);
    }
  } else {
    console.log(`  Status: OK`);
    console.log(`  Result:`, JSON.stringify(response.result, null, 2).split('\n').map((l, i) => i === 0 ? l : '          ' + l).join('\n'));
  }
}

async function testGetServerInfo(url: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('GET /api/mcp (Server Info)');
  console.log('='.repeat(60));

  const response = await fetch(url);
  const data = await response.json();
  console.log('  Status:', response.ok ? 'OK' : 'FAILED');
  console.log('  Server Info:', JSON.stringify(data, null, 2).split('\n').map((l, i) => i === 0 ? l : '              ' + l).join('\n'));
  return response.ok;
}

async function testUnauthorized(url: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('POST /api/mcp without token (should fail)');
  console.log('='.repeat(60));

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize' }),
  });

  const data = await response.json();
  const isUnauthorized = response.status === 401 || data.error?.code === -32000;
  console.log('  Status:', isUnauthorized ? 'OK (correctly rejected)' : 'FAILED (should have rejected)');
  console.log('  HTTP Status:', response.status);
  console.log('  Response:', JSON.stringify(data, null, 2).split('\n').map((l, i) => i === 0 ? l : '            ' + l).join('\n'));
  return isUnauthorized;
}

async function main() {
  const args = process.argv.slice(2);
  let url = DEFAULT_URL;
  let token = '';

  // Parse args
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      url = args[++i];
    } else if (args[i] === '--token' && args[i + 1]) {
      token = args[++i];
    }
  }

  console.log('\n' + '╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' MCP Client Test'.padEnd(58) + '║');
  console.log('╠' + '═'.repeat(58) + '╣');
  console.log('║' + ` URL: ${url}`.padEnd(58) + '║');
  console.log('║' + ` Token: ${token ? token.slice(0, 8) + '...' : '(not provided)'}`.padEnd(58) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');

  const results: { test: string; passed: boolean }[] = [];

  // Test 1: GET server info (no auth required)
  try {
    const passed = await testGetServerInfo(url);
    results.push({ test: 'GET Server Info', passed });
  } catch (e) {
    console.log('  Error:', e instanceof Error ? e.message : e);
    results.push({ test: 'GET Server Info', passed: false });
  }

  // Test 2: Unauthorized request
  try {
    const passed = await testUnauthorized(url);
    results.push({ test: 'Unauthorized Rejection', passed });
  } catch (e) {
    console.log('  Error:', e instanceof Error ? e.message : e);
    results.push({ test: 'Unauthorized Rejection', passed: false });
  }

  // Tests requiring token
  if (token) {
    const client = new MCPClient(url, token);

    // Test 3: Initialize
    try {
      const response = await client.initialize();
      printResult('Initialize', response);
      results.push({ test: 'Initialize', passed: !response.error });
    } catch (e) {
      console.log('  Error:', e instanceof Error ? e.message : e);
      results.push({ test: 'Initialize', passed: false });
    }

    // Test 4: Ping
    try {
      const response = await client.ping();
      printResult('Ping', response);
      results.push({ test: 'Ping', passed: !response.error });
    } catch (e) {
      console.log('  Error:', e instanceof Error ? e.message : e);
      results.push({ test: 'Ping', passed: false });
    }

    // Test 5: List Tools
    try {
      const response = await client.listTools();
      printResult('Tools List', response);
      results.push({ test: 'Tools List', passed: !response.error });
    } catch (e) {
      console.log('  Error:', e instanceof Error ? e.message : e);
      results.push({ test: 'Tools List', passed: false });
    }

    // Test 6: List Repositories
    try {
      const response = await client.callTool('list_repositories', {});
      printResult('Tool: list_repositories', response);
      results.push({ test: 'Tool: list_repositories', passed: !response.error });
    } catch (e) {
      console.log('  Error:', e instanceof Error ? e.message : e);
      results.push({ test: 'Tool: list_repositories', passed: false });
    }

    // Test 7: Scan Code (simple test)
    try {
      const testCode = `
function login(user, password) {
  const query = "SELECT * FROM users WHERE username = '" + user + "' AND password = '" + password + "'";
  return db.execute(query);
}`;
      const response = await client.callTool('scan_code', {
        code: testCode,
        language: 'javascript',
        filename: 'auth.js',
      });
      printResult('Tool: scan_code', response);
      results.push({ test: 'Tool: scan_code', passed: !response.error });
    } catch (e) {
      console.log('  Error:', e instanceof Error ? e.message : e);
      results.push({ test: 'Tool: scan_code', passed: false });
    }
  } else {
    console.log('\n⚠️  Skipping authenticated tests (no token provided)');
    console.log('   Provide a token with: --token <YOUR_API_TOKEN>');
  }

  // Summary
  console.log('\n' + '╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' Test Summary'.padEnd(58) + '║');
  console.log('╠' + '═'.repeat(58) + '╣');

  for (const { test, passed } of results) {
    const status = passed ? '✓ PASS' : '✗ FAIL';
    const statusColored = passed ? status : status;
    console.log('║' + ` ${statusColored.padEnd(8)} ${test}`.padEnd(58) + '║');
  }

  const passedCount = results.filter(r => r.passed).length;
  console.log('╠' + '═'.repeat(58) + '╣');
  console.log('║' + ` Total: ${passedCount}/${results.length} tests passed`.padEnd(58) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');

  process.exit(passedCount === results.length ? 0 : 1);
}

main().catch(console.error);
