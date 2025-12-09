---
title: "Secrets Management: Protecting API Keys and Sensitive Data"
description: "A comprehensive guide to managing secrets, API keys, and credentials securely in your applications."
publishDate: 2024-02-01
author: "CodeGuard AI Team"
tags: ["security", "secrets", "api-keys", "credentials", "environment-variables"]
---

# Secrets Management: Protecting API Keys and Sensitive Data

One of the most common security mistakes developers make is mishandling secrets - API keys, database passwords, encryption keys, and other sensitive credentials. Exposed secrets can lead to data breaches, unauthorized access, and significant financial damage. This guide covers best practices for managing secrets securely.

## What Are Secrets?

Secrets are sensitive values that should never be publicly exposed:

- API keys and tokens
- Database credentials
- Encryption keys
- OAuth client secrets
- Private certificates
- Session secrets
- Third-party service credentials
- Webhook signing secrets

## Common Mistakes

### 1. Hardcoding Secrets

```javascript
// ❌ NEVER do this
const apiKey = 'sk_live_YOUR_STRIPE_KEY_HERE';
const dbPassword = 'super_secret_password_123';

const db = new Database({
  host: 'localhost',
  user: 'admin',
  password: dbPassword
});
```

### 2. Committing Secrets to Git

```bash
# .env file accidentally committed
DATABASE_URL=postgresql://user:password@localhost/db
STRIPE_SECRET_KEY=sk_test_123456789
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### 3. Exposing Secrets in Client-Side Code

```javascript
// ❌ Secret exposed in browser
const stripe = Stripe('sk_live_real_secret_key');

// ❌ Secret in frontend code
const response = await fetch('https://api.service.com/data', {
  headers: {
    'Authorization': `Bearer ${ADMIN_API_KEY}`
  }
});
```

### 4. Logging Secrets

```javascript
// ❌ Secret logged to console
console.log('API Key:', process.env.API_KEY);

// ❌ Secret in error message
throw new Error(`Failed to connect with password: ${password}`);
```

## Proper Secrets Management

### 1. Use Environment Variables

Store secrets in environment variables, never in code:

```javascript
// ✅ Good - Read from environment
const apiKey = process.env.API_KEY;
const dbPassword = process.env.DB_PASSWORD;

if (!apiKey || !dbPassword) {
  throw new Error('Required environment variables not set');
}

const db = new Database({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: dbPassword
});
```

### 2. Use .env Files (Development Only)

For local development, use `.env` files:

```bash
# .env (NEVER commit this)
DATABASE_URL=postgresql://user:password@localhost/mydb
API_KEY=sk_test_development_key
JWT_SECRET=development_secret_change_in_production
STRIPE_SECRET_KEY=sk_test_123
```

Load with dotenv:

```javascript
// Load environment variables
require('dotenv').config();

// Access secrets
const dbUrl = process.env.DATABASE_URL;
const apiKey = process.env.API_KEY;
```

**Important**: Add `.env` to `.gitignore`:

```bash
# .gitignore
.env
.env.local
.env.*.local
*.pem
*.key
secrets/
```

### 3. Provide .env.example Template

Commit a template showing required variables:

```bash
# .env.example (safe to commit)
DATABASE_URL=postgresql://user:password@host:port/database
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
STRIPE_SECRET_KEY=sk_test_or_sk_live_your_key
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## Production Secrets Management

### 1. Use Secrets Management Services

#### AWS Secrets Manager

```javascript
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

async function getSecret(secretName) {
  const client = new SecretsManagerClient({ region: 'us-east-1' });

  try {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretName })
    );
    return JSON.parse(response.SecretString);
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
}

// Usage
const dbCredentials = await getSecret('prod/database/credentials');
const db = new Database({
  host: dbCredentials.host,
  user: dbCredentials.username,
  password: dbCredentials.password
});
```

#### HashiCorp Vault

```javascript
const vault = require('node-vault')({
  endpoint: 'http://vault.example.com:8200',
  token: process.env.VAULT_TOKEN
});

async function getSecret(path) {
  try {
    const result = await vault.read(path);
    return result.data;
  } catch (error) {
    console.error('Error reading from Vault:', error);
    throw error;
  }
}

// Usage
const secrets = await getSecret('secret/data/myapp/database');
```

#### Azure Key Vault

```javascript
const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

const credential = new DefaultAzureCredential();
const vaultName = process.env.KEY_VAULT_NAME;
const url = `https://${vaultName}.vault.azure.net`;

const client = new SecretClient(url, credential);

async function getSecret(secretName) {
  const secret = await client.getSecret(secretName);
  return secret.value;
}
```

### 2. Use Platform-Specific Secret Management

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Add secrets
vercel secrets add database-url "postgresql://..."
vercel secrets add api-key "sk_live_..."
```

```json
{
  "env": {
    "DATABASE_URL": "@database-url",
    "API_KEY": "@api-key"
  }
}
```

#### Heroku

```bash
# Set config vars
heroku config:set DATABASE_URL=postgresql://...
heroku config:set API_KEY=sk_live_...

# View config vars
heroku config

# Remove config var
heroku config:unset API_KEY
```

#### Docker

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    image: myapp
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    file: ./secrets/api_key.txt
```

## Secrets Rotation

Regularly rotate secrets to minimize damage from potential exposure:

```javascript
// Example: API key rotation system
class SecretManager {
  constructor() {
    this.currentKey = null;
    this.previousKey = null;
    this.rotationInterval = 90 * 24 * 60 * 60 * 1000; // 90 days
  }

  async rotateApiKey() {
    // Store current key as previous
    this.previousKey = this.currentKey;

    // Generate new key
    this.currentKey = await this.generateNewKey();

    // Update in secrets manager
    await this.updateSecretInVault('api_key', this.currentKey);
    await this.updateSecretInVault('previous_api_key', this.previousKey);

    // Schedule next rotation
    setTimeout(() => this.rotateApiKey(), this.rotationInterval);
  }

  async verifyKey(providedKey) {
    // Accept both current and previous key during rotation period
    return providedKey === this.currentKey ||
           providedKey === this.previousKey;
  }
}
```

## Detecting Exposed Secrets

### 1. Git History Scanning

Use tools to scan git history for exposed secrets:

```bash
# Install gitleaks
brew install gitleaks

# Scan repository
gitleaks detect --source . --verbose

# Scan with custom rules
gitleaks detect --config .gitleaks.toml
```

### 2. Pre-commit Hooks

Prevent secrets from being committed:

```bash
# Install pre-commit
pip install pre-commit

# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.15.0
    hooks:
      - id: gitleaks

# Install hooks
pre-commit install
```

### 3. GitHub Secret Scanning

Enable GitHub's secret scanning (automatic for public repos):

- Automatically detects known secret formats
- Notifies you of exposed secrets
- Works with partner services to revoke exposed tokens

### 4. CI/CD Secret Detection

```yaml
# .github/workflows/security.yml
name: Secret Scanning

on: [push, pull_request]

jobs:
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Gitleaks scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## What To Do If Secrets Are Exposed

### Immediate Actions

1. **Revoke the exposed secret immediately**
2. **Generate a new secret**
3. **Update all systems using the secret**
4. **Review access logs for unauthorized use**
5. **Notify security team and affected parties**

### Removing Secrets from Git History

```bash
# Use BFG Repo-Cleaner
java -jar bfg.jar --replace-text passwords.txt repo.git

# Or use git-filter-repo
git filter-repo --path-glob '**/.env' --invert-paths

# Force push (coordinate with team)
git push origin --force --all
```

**Note**: Once pushed to a remote repository, consider the secret compromised even after removal.

## Best Practices

### 1. Principle of Least Privilege

Grant minimum necessary access:

```javascript
// ❌ Using root database credentials
const db = new Database({
  user: 'root',
  password: process.env.ROOT_PASSWORD
});

// ✅ Using application-specific credentials with limited permissions
const db = new Database({
  user: 'app_readonly',
  password: process.env.APP_DB_PASSWORD
});
```

### 2. Separate Secrets by Environment

```javascript
// Development
DATABASE_URL=postgresql://localhost/myapp_dev

// Staging
DATABASE_URL=postgresql://staging-db.example.com/myapp_staging

// Production
DATABASE_URL=postgresql://prod-db.example.com/myapp_prod
```

### 3. Never Log Secrets

```javascript
// Sanitize logs
function sanitizeLogs(data) {
  const sensitiveKeys = ['password', 'apiKey', 'secret', 'token'];
  const sanitized = { ...data };

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

// Usage
console.log('User data:', sanitizeLogs(userData));
```

### 4. Encrypt Secrets at Rest

```javascript
const crypto = require('crypto');

function encryptSecret(secret, masterKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);

  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}
```

## Secrets Management Checklist

- ✅ Never commit secrets to version control
- ✅ Use environment variables for all secrets
- ✅ Add .env to .gitignore
- ✅ Provide .env.example template
- ✅ Use secrets management service in production
- ✅ Rotate secrets regularly
- ✅ Implement secret scanning in CI/CD
- ✅ Use different secrets per environment
- ✅ Apply principle of least privilege
- ✅ Encrypt secrets at rest
- ✅ Never log secrets
- ✅ Revoke exposed secrets immediately
- ✅ Use pre-commit hooks to prevent exposure
- ✅ Monitor for unauthorized access
- ✅ Document secret rotation procedures

## Automated Secret Detection

Tools like **CodeGuard AI** can automatically:
- Scan codebase for hardcoded secrets
- Detect secrets in git history
- Identify insecure secret storage patterns
- Flag secrets exposed in client-side code
- Monitor for secret exposure in dependencies

## Conclusion

Proper secrets management is fundamental to application security. By using environment variables, secrets management services, automated scanning, and following best practices, you can protect your sensitive credentials from exposure.

Remember: a single exposed secret can compromise your entire application. Treat all secrets as highly sensitive and implement defense in depth to protect them.

---

*Keep your secrets secure with automated detection. Try [CodeGuard AI](https://codeguard.ai) for comprehensive secrets scanning.*
