#!/bin/bash
set -euo pipefail

# =============================================================================
# CodeGuard AI - Test MCP Server on VM
# =============================================================================
# Usage: ./scripts/test-mcp-vm.sh [--token <API_TOKEN>]
# =============================================================================

VM_NAME="codeguard-ai"
ZONE="us-central1-a"
TOKEN=""

# Parse arguments
for arg in "$@"; do
    case $arg in
        --token=*)
            TOKEN="${arg#*=}"
            ;;
        --token)
            shift
            TOKEN="$1"
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --token=TOKEN   API token for authenticated tests"
            exit 0
            ;;
    esac
done

echo "=========================================="
echo "CodeGuard AI - MCP Test on VM"
echo "=========================================="

gcloud compute ssh "$VM_NAME" --zone="$ZONE" -- bash -s -- "$TOKEN" <<'REMOTE_SCRIPT'
TOKEN="$1"

cd /opt/codeguard-ai/packages/backend

echo ""
echo "Running MCP tests on VM..."
echo ""

if [ -n "$TOKEN" ]; then
    npx tsx scripts/test-mcp.ts --token "$TOKEN"
else
    npx tsx scripts/test-mcp.ts
fi
REMOTE_SCRIPT

echo ""
echo "=========================================="
echo "MCP Test Complete"
echo "=========================================="
