# GitHub Actions

Complete guide for integrating CodeGuard AI with GitHub Actions.

## GitHub Code Scanning (Recommended)

Upload SARIF results to GitHub's Security tab for inline issue annotations:

```yaml
name: CodeGuard Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  security-events: write

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - name: Install CodeGuard CLI
        run: |
          git clone --depth 1 https://github.com/sderosiaux/codeguard-ai.git /tmp/codeguard
          cd /tmp/codeguard/packages/cli
          go build -o /usr/local/bin/codeguard .

      - name: Run Security Scan
        env:
          CODEGUARD_API_KEY: ${{ secrets.CODEGUARD_API_KEY }}
        run: |
          codeguard auth login <<< "$CODEGUARD_API_KEY"
          codeguard scan --format sarif > results.sarif

      - name: Upload to GitHub Code Scanning
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
```

This workflow:
- Scans your code on every push and PR
- Uploads results to GitHub's Security tab
- Shows issues inline in PR diffs
- Tracks issue history over time

## Basic Workflow

Create `.github/workflows/security.yml`:

```yaml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - name: Install CodeGuard CLI
        run: |
          git clone --depth 1 https://github.com/sderosiaux/codeguard-ai.git /tmp/codeguard
          cd /tmp/codeguard/packages/cli
          go build -o /usr/local/bin/codeguard .

      - name: Run Security Scan
        env:
          CODEGUARD_API_KEY: ${{ secrets.CODEGUARD_API_KEY }}
        run: |
          codeguard auth login <<< "$CODEGUARD_API_KEY"
          codeguard scan --format json > results.json

      - name: Upload Results
        uses: actions/upload-artifact@v4
        with:
          name: security-report
          path: results.json
```

## With Grade Gate

Fail the build if grade is below threshold:

```yaml
name: Security Scan

on:
  pull_request:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - name: Install CodeGuard CLI
        run: |
          git clone --depth 1 https://github.com/sderosiaux/codeguard-ai.git /tmp/codeguard
          cd /tmp/codeguard/packages/cli
          go build -o /usr/local/bin/codeguard .

      - name: Run Security Scan
        env:
          CODEGUARD_API_KEY: ${{ secrets.CODEGUARD_API_KEY }}
        run: |
          codeguard auth login <<< "$CODEGUARD_API_KEY"
          codeguard scan --format json > results.json

          GRADE=$(cat results.json | jq -r '.grade')
          echo "grade=$GRADE" >> $GITHUB_OUTPUT
          echo "Security Grade: $GRADE"

          if [[ "$GRADE" == "D" || "$GRADE" == "F" ]]; then
            echo "::error::Security grade $GRADE is below threshold"
            exit 1
          fi
        id: scan

      - name: Upload Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: security-report
          path: results.json
```

## PR Comment Integration

Post scan results as a PR comment:

```yaml
name: Security Scan

on:
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - name: Install CodeGuard CLI
        run: |
          git clone --depth 1 https://github.com/sderosiaux/codeguard-ai.git /tmp/codeguard
          cd /tmp/codeguard/packages/cli
          go build -o /usr/local/bin/codeguard .

      - name: Run Security Scan
        env:
          CODEGUARD_API_KEY: ${{ secrets.CODEGUARD_API_KEY }}
        run: |
          codeguard auth login <<< "$CODEGUARD_API_KEY"
          codeguard scan --format json > results.json

      - name: Post PR Comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('results.json', 'utf8'));

            const gradeEmoji = {
              'A': ':white_check_mark:',
              'B': ':large_blue_circle:',
              'C': ':yellow_circle:',
              'D': ':orange_circle:',
              'F': ':red_circle:'
            };

            const severityCounts = {
              critical: results.issues.filter(i => i.severity === 'critical').length,
              high: results.issues.filter(i => i.severity === 'high').length,
              medium: results.issues.filter(i => i.severity === 'medium').length,
              low: results.issues.filter(i => i.severity === 'low').length
            };

            let issuesList = '';
            if (results.issues.length > 0) {
              const topIssues = results.issues.slice(0, 5);
              issuesList = '\n### Top Issues\n\n' + topIssues.map(i =>
                `- **[${i.severity.toUpperCase()}]** ${i.title} - \`${i.file}:${i.line}\``
              ).join('\n');

              if (results.issues.length > 5) {
                issuesList += `\n\n*...and ${results.issues.length - 5} more*`;
              }
            }

            const body = `## ${gradeEmoji[results.grade]} Security Scan: Grade ${results.grade}

            | Metric | Value |
            |--------|-------|
            | Files Scanned | ${results.filesScanned} |
            | Total Issues | ${results.issueCount} |
            | Score | ${results.score} |

            ### Issues by Severity

            | Severity | Count |
            |----------|-------|
            | :red_circle: Critical | ${severityCounts.critical} |
            | :orange_circle: High | ${severityCounts.high} |
            | :yellow_circle: Medium | ${severityCounts.medium} |
            | :white_circle: Low | ${severityCounts.low} |
            ${issuesList}

            ---
            *Powered by [CodeGuard AI](https://security-guard-ai.vercel.app)*`;

            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body
            });
```

## Scheduled Scans

Run security scans on a schedule:

```yaml
name: Scheduled Security Scan

on:
  schedule:
    - cron: '0 0 * * 1'  # Every Monday at midnight
  workflow_dispatch:  # Allow manual trigger

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - name: Install CodeGuard CLI
        run: |
          git clone --depth 1 https://github.com/sderosiaux/codeguard-ai.git /tmp/codeguard
          cd /tmp/codeguard/packages/cli
          go build -o /usr/local/bin/codeguard .

      - name: Run Security Scan
        env:
          CODEGUARD_API_KEY: ${{ secrets.CODEGUARD_API_KEY }}
        run: |
          codeguard auth login <<< "$CODEGUARD_API_KEY"
          codeguard scan --format json > results.json

      - name: Check for Critical Issues
        run: |
          CRITICAL=$(cat results.json | jq '.issues | map(select(.severity == "critical")) | length')
          if [ "$CRITICAL" -gt 0 ]; then
            echo "::warning::Found $CRITICAL critical security issues!"
          fi

      - name: Upload Results
        uses: actions/upload-artifact@v4
        with:
          name: weekly-security-report
          path: results.json
          retention-days: 30
```

## Setup Instructions

### 1. Create API Token

1. Go to [Settings → API Tokens](https://security-guard-ai.vercel.app/app/settings)
2. Click "Create Token"
3. Name it (e.g., "GitHub Actions")
4. Copy the token (starts with `cg_`)

### 2. Add Secret to GitHub

1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `CODEGUARD_API_KEY`
4. Value: Your API token
5. Click "Add secret"

### 3. Create Workflow File

Add one of the workflow examples above to `.github/workflows/security.yml`

### 4. Test

Push a commit or open a PR to trigger the workflow.
