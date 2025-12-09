---
title: "CSRF Protection: Defending Against Cross-Site Request Forgery Attacks"
description: "Learn how CSRF attacks work and implement robust protection mechanisms in your web applications."
publishDate: 2024-02-05
author: "CodeGuard AI Team"
tags: ["security", "csrf", "web-security", "authentication", "tokens"]
---

# CSRF Protection: Defending Against Cross-Site Request Forgery Attacks

Cross-Site Request Forgery (CSRF) is a web security vulnerability that tricks authenticated users into executing unwanted actions. Despite being well-known, CSRF vulnerabilities remain common and can lead to serious consequences including unauthorized transactions, data modification, and account takeover.

## What is CSRF?

CSRF exploits the trust that a website has in a user's browser. If a user is authenticated to your application, an attacker can craft malicious requests that the browser will automatically include credentials with (cookies, HTTP authentication).

### How CSRF Attacks Work

1. User logs into `bank.com` and receives authentication cookie
2. User visits malicious site `evil.com` (while still logged in)
3. `evil.com` contains hidden request to `bank.com/transfer`
4. Browser automatically includes authentication cookie
5. Bank processes the request as legitimate

## CSRF Attack Examples

### Example 1: GET-Based CSRF

```html
<!-- Malicious page that triggers unwanted action -->
<!DOCTYPE html>
<html>
<body>
  <h1>Check out these cute cats!</h1>

  <!-- Hidden image that makes malicious request -->
  <img src="https://bank.com/transfer?to=attacker&amount=1000"
       style="display:none">
</body>
</html>
```

When the user loads this page, their browser automatically makes the GET request with their authentication cookies.

### Example 2: POST-Based CSRF

```html
<!-- Malicious page with auto-submitting form -->
<!DOCTYPE html>
<html>
<body>
  <form id="csrf-form" action="https://bank.com/transfer" method="POST">
    <input type="hidden" name="to" value="attacker">
    <input type="hidden" name="amount" value="1000">
  </form>

  <script>
    // Automatically submit form when page loads
    document.getElementById('csrf-form').submit();
  </script>
</body>
</html>
```

### Example 3: JSON API CSRF

```html
<!-- Modern CSRF attack via fetch -->
<script>
  fetch('https://api.example.com/account/delete', {
    method: 'DELETE',
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ confirm: true })
  });
</script>
```

## Implementing CSRF Protection

### 1. Synchronizer Token Pattern

The most common CSRF protection mechanism uses unique tokens:

```javascript
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true, // HTTPS only
    sameSite: 'strict'
  }
}));

// Generate CSRF token
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware to set CSRF token
app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
});

// Middleware to verify CSRF token
function verifyCsrfToken(req, res, next) {
  const token = req.body.csrfToken ||
                req.headers['x-csrf-token'] ||
                req.query.csrfToken;

  if (!token || token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
}

// Protect state-changing routes
app.post('/transfer', verifyCsrfToken, async (req, res) => {
  // Process transfer
  res.json({ success: true });
});
```

### 2. Using CSRF Middleware

Use established libraries like `csurf`:

```javascript
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());

// Setup CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
});

// Generate token endpoint
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Protected routes
app.post('/api/transfer', csrfProtection, (req, res) => {
  // Safe from CSRF
  res.json({ success: true });
});

// Error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ error: 'Invalid CSRF token' });
  } else {
    next(err);
  }
});
```

### 3. Frontend Implementation

#### In HTML Forms

```html
<form action="/transfer" method="POST">
  <!-- Include CSRF token as hidden field -->
  <input type="hidden" name="csrfToken" value="<%= csrfToken %>">

  <input type="text" name="to" placeholder="Recipient">
  <input type="number" name="amount" placeholder="Amount">
  <button type="submit">Transfer</button>
</form>
```

#### In Single Page Applications

```javascript
// Fetch CSRF token on app load
let csrfToken;

async function initCsrf() {
  const response = await fetch('/csrf-token', {
    credentials: 'include'
  });
  const data = await response.json();
  csrfToken = data.csrfToken;
}

// Include token in requests
async function makeSecureRequest(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(data)
  });

  return response.json();
}

// Usage
await initCsrf();
await makeSecureRequest('/api/transfer', { to: 'user123', amount: 100 });
```

#### In React

```javascript
import { createContext, useContext, useEffect, useState } from 'react';

const CsrfContext = createContext();

export function CsrfProvider({ children }) {
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    fetch('/csrf-token', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken));
  }, []);

  return (
    <CsrfContext.Provider value={csrfToken}>
      {children}
    </CsrfContext.Provider>
  );
}

export function useCsrf() {
  return useContext(CsrfContext);
}

// Usage in component
function TransferForm() {
  const csrfToken = useCsrf();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch('/api/transfer', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ to: 'user123', amount: 100 })
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## SameSite Cookie Attribute

Modern browsers support the `SameSite` attribute for additional CSRF protection:

```javascript
// Set SameSite on session cookies
app.use(session({
  cookie: {
    sameSite: 'strict', // or 'lax'
    secure: true,
    httpOnly: true
  }
}));
```

### SameSite Values

- **`Strict`**: Cookie never sent in cross-site requests
- **`Lax`**: Cookie sent only on top-level navigations with GET
- **`None`**: Cookie sent with all requests (requires `Secure`)

```javascript
// Examples of when cookies are sent

// SameSite=Strict
res.cookie('session', token, { sameSite: 'strict' });
// ✅ user clicks link on example.com to example.com
// ❌ user clicks link on evil.com to example.com
// ❌ evil.com makes fetch() to example.com

// SameSite=Lax
res.cookie('session', token, { sameSite: 'lax' });
// ✅ user clicks link on example.com to example.com
// ✅ user clicks link on evil.com to example.com (GET only)
// ❌ evil.com makes fetch() to example.com

// SameSite=None (requires Secure)
res.cookie('session', token, { sameSite: 'none', secure: true });
// ✅ All requests include cookie (not recommended for CSRF protection)
```

## Additional CSRF Protections

### 1. Double Submit Cookie Pattern

```javascript
function setDoubleCsrfCookie(res) {
  const token = crypto.randomBytes(32).toString('hex');

  // Set cookie
  res.cookie('csrf-token', token, {
    httpOnly: false, // Readable by JavaScript
    secure: true,
    sameSite: 'strict'
  });

  return token;
}

function verifyDoubleCsrf(req) {
  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

  return cookieToken && headerToken && cookieToken === headerToken;
}
```

### 2. Custom Request Headers

Require custom header that CORS will block:

```javascript
// Backend
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const customHeader = req.headers['x-requested-with'];

    if (customHeader !== 'XMLHttpRequest') {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }
  next();
});

// Frontend
fetch('/api/data', {
  method: 'POST',
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
});
```

### 3. Referer/Origin Validation

Check request origin matches your domain:

```javascript
function validateOrigin(req) {
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = [
    'https://example.com',
    'https://app.example.com'
  ];

  if (!origin) {
    return false;
  }

  const originUrl = new URL(origin);
  return allowedOrigins.includes(originUrl.origin);
}

app.post('/api/transfer', (req, res) => {
  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }

  // Process request
});
```

## CSRF Protection for APIs

### Token-Based Authentication

APIs using token-based auth (JWT) in Authorization header are naturally protected:

```javascript
// ✅ Safe from CSRF - token not automatically sent
fetch('/api/data', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

**Why it's safe**: Attacker's malicious site cannot read localStorage or add custom headers due to CORS.

### API Keys

API keys in headers are also CSRF-resistant:

```javascript
fetch('/api/data', {
  headers: {
    'X-API-Key': apiKey
  }
});
```

## Common CSRF Mistakes

### 1. Protecting Only POST Requests

```javascript
// ❌ GET endpoints can be vulnerable too
app.get('/delete-account', (req, res) => {
  deleteAccount(req.user.id);
  res.redirect('/');
});

// ✅ Use POST/DELETE for state changes
app.delete('/account', csrfProtection, (req, res) => {
  deleteAccount(req.user.id);
  res.json({ success: true });
});
```

### 2. Not Validating Token Properly

```javascript
// ❌ Weak validation
if (req.body.csrfToken) {
  // Token exists but not validated!
  next();
}

// ✅ Proper validation
if (req.body.csrfToken === req.session.csrfToken) {
  next();
} else {
  res.status(403).send('Invalid CSRF token');
}
```

### 3. Exposing CSRF Token in URL

```javascript
// ❌ Token in URL (visible in logs, referer headers)
<form action="/transfer?csrf=abc123">

// ✅ Token in hidden field or header
<input type="hidden" name="csrfToken" value="abc123">
```

## Testing CSRF Protection

### Manual Testing

1. Authenticate to your application
2. Create HTML file with malicious form
3. Open file in browser (while authenticated)
4. Verify request is blocked

```html
<!-- test-csrf.html -->
<form action="http://localhost:3000/api/transfer" method="POST">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="1000">
  <button type="submit">Test CSRF</button>
</form>
```

### Automated Testing

```javascript
// Test suite
describe('CSRF Protection', () => {
  it('should reject requests without CSRF token', async () => {
    const response = await request(app)
      .post('/api/transfer')
      .send({ to: 'user123', amount: 100 });

    expect(response.status).toBe(403);
  });

  it('should accept requests with valid CSRF token', async () => {
    const tokenResponse = await request(app).get('/csrf-token');
    const csrfToken = tokenResponse.body.csrfToken;

    const response = await request(app)
      .post('/api/transfer')
      .set('X-CSRF-Token', csrfToken)
      .send({ to: 'user123', amount: 100 });

    expect(response.status).toBe(200);
  });
});
```

## CSRF Protection Checklist

- ✅ Implement CSRF tokens for state-changing operations
- ✅ Use SameSite cookie attribute
- ✅ Validate tokens on server-side
- ✅ Use POST/PUT/DELETE for state changes, never GET
- ✅ Set secure, httpOnly cookies
- ✅ Implement proper CORS configuration
- ✅ Validate Origin/Referer headers
- ✅ Use HTTPS in production
- ✅ Token-based APIs use Authorization header
- ✅ Test CSRF protection regularly
- ✅ Log and monitor CSRF violations
- ✅ Educate developers about CSRF risks

## Automated CSRF Detection

Security tools like **CodeGuard AI** can automatically identify:
- Missing CSRF protection on state-changing endpoints
- Improperly implemented CSRF validation
- GET endpoints that modify state
- Missing SameSite attributes on cookies
- Weak token generation patterns

## Conclusion

CSRF is a serious vulnerability that can lead to unauthorized actions on behalf of authenticated users. By implementing proper CSRF protection using synchronizer tokens, SameSite cookies, and following best practices, you can effectively defend against these attacks.

Remember: CSRF protection is just one layer of defense. Combine it with other security measures like proper authentication, authorization, input validation, and regular security audits for comprehensive application security.

---

*Protect your applications from CSRF attacks. Try [CodeGuard AI](https://codeguard.ai) for automated CSRF vulnerability detection.*
