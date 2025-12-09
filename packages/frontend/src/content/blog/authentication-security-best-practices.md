## Why Authentication Security Matters

Authentication is the front door to your application. A weak authentication system exposes every user to account takeover, data theft, and identity fraud. In 2023, credential-based attacks accounted for over 80% of web application breaches.

## Common Authentication Vulnerabilities

### 1. Weak Password Storage

**Never do this:**
```javascript
// VULNERABLE - Plain text storage
await db.query('INSERT INTO users (email, password) VALUES (?, ?)',
  [email, password]);

// VULNERABLE - Simple hashing without salt
const hash = crypto.createHash('md5').update(password).digest('hex');
```

### 2. Brute Force Susceptibility

Without rate limiting, attackers can try millions of password combinations.

### 3. Session Fixation

Accepting session IDs from URL parameters or failing to regenerate sessions after login.

### 4. Insecure Password Reset

Using predictable reset tokens or sending passwords via email.

## How CodeGuard AI Detects Auth Issues

Our scanner identifies:

```javascript
// We flag weak password hashing:
crypto.createHash('md5').update(password);
crypto.createHash('sha1').update(password);

// We detect missing salt:
bcrypt.hashSync(password); // Missing rounds parameter

// We identify exposed credentials:
const password = 'hardcoded_secret';
```

## Secure Password Storage

### Use bcrypt or Argon2

```javascript
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
```

### Why bcrypt?

1. **Built-in salt**: Each hash is unique
2. **Configurable cost**: Adjustable work factor
3. **Slow by design**: Resistant to brute force
4. **Battle-tested**: Decades of cryptographic review

## Implement Rate Limiting

```javascript
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
```

### Advanced: Account Lockout

```javascript
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
```

## Secure Session Management

### Generate Cryptographically Secure Session IDs

```javascript
import crypto from 'crypto';

function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}
```

### Set Secure Cookie Attributes

```javascript
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
```

### Regenerate Session After Login

```javascript
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
```

## Multi-Factor Authentication (MFA)

### TOTP Implementation

```javascript
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
```

## Secure Password Reset

```javascript
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
  await sendEmail(email, `Reset link: /reset-password?token=${token}`);

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
```

## OAuth 2.0 Best Practices

When implementing OAuth:

```javascript
// Use state parameter to prevent CSRF
const state = crypto.randomBytes(16).toString('hex');
req.session.oauthState = state;

const authUrl = `https://accounts.google.com/oauth?
  client_id=${CLIENT_ID}&
  redirect_uri=${REDIRECT_URI}&
  response_type=code&
  scope=email profile&
  state=${state}`;

// Verify state on callback
app.get('/oauth/callback', (req, res) => {
  if (req.query.state !== req.session.oauthState) {
    return res.status(403).send('Invalid state parameter');
  }
  // Continue with token exchange...
});
```

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
