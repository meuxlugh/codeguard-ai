---
title: "Secure API Design: Best Practices for Modern Applications"
description: "A comprehensive guide to designing secure APIs, covering authentication, authorization, rate limiting, input validation, and more."
publishDate: 2024-01-20
author: "CodeGuard AI Team"
tags: ["security", "api", "rest", "authentication", "authorization"]
---

# Secure API Design: Best Practices for Modern Applications

APIs are the backbone of modern applications, connecting frontend interfaces to backend services and enabling third-party integrations. However, poorly designed APIs are a prime target for attackers. This guide covers essential security practices for building robust, secure APIs.

## 1. Authentication and Authorization

### Use Industry-Standard Authentication

Always use proven authentication mechanisms rather than rolling your own:

```javascript
// ❌ Vulnerable: Custom authentication
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.users.findOne({ username, password }); // Plain text!
  if (user) {
    res.json({ token: user.id }); // Predictable token!
  }
});

// ✅ Secure: JWT with bcrypt
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.users.findOne({ username });

  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});
```

### Implement Proper Authorization

Authentication confirms identity; authorization controls access:

```javascript
// Middleware for role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Protected endpoint
app.delete('/api/users/:id',
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    await db.users.delete(req.params.id);
    res.json({ success: true });
  }
);
```

## 2. Input Validation and Sanitization

Never trust user input. Always validate and sanitize:

```javascript
const { body, param, validationResult } = require('express-validator');

app.post('/api/users',
  [
    body('email').isEmail().normalizeEmail(),
    body('age').isInt({ min: 13, max: 120 }),
    body('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .trim()
      .escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Proceed with validated data
    const user = await createUser(req.body);
    res.status(201).json(user);
  }
);
```

### Prevent SQL Injection

Use parameterized queries or ORMs:

```javascript
// ❌ Vulnerable to SQL injection
app.get('/api/users', async (req, res) => {
  const name = req.query.name;
  const query = `SELECT * FROM users WHERE name = '${name}'`;
  const users = await db.raw(query);
  res.json(users);
});

// ✅ Secure: Parameterized query
app.get('/api/users', async (req, res) => {
  const name = req.query.name;
  const users = await db('users').where({ name });
  res.json(users);
});
```

## 3. Rate Limiting and Throttling

Protect your API from abuse and DDoS attacks:

```javascript
const rateLimit = require('express-rate-limit');

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

## 4. Secure Data Exposure

### Filter Sensitive Data

Never expose sensitive information in API responses:

```javascript
// ❌ Exposes sensitive data
app.get('/api/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  res.json(user); // Includes passwordHash, ssn, etc.
});

// ✅ Filter sensitive fields
app.get('/api/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);

  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };

  res.json(safeUser);
});

// ✅ Even better: Use a serializer
class UserSerializer {
  static serialize(user, includeEmail = false) {
    const data = {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    };

    if (includeEmail) {
      data.email = user.email;
    }

    return data;
  }
}
```

### Use HTTPS Only

Force HTTPS in production:

```javascript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Set security headers
const helmet = require('helmet');
app.use(helmet());
```

## 5. Error Handling

Don't leak implementation details in error messages:

```javascript
// ❌ Exposes internal details
app.get('/api/data', async (req, res) => {
  try {
    const data = await db.query('SELECT * FROM sensitive_table');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message }); // Leaks SQL error!
  }
});

// ✅ Generic error messages
app.get('/api/data', async (req, res) => {
  try {
    const data = await db.query('SELECT * FROM sensitive_table');
    res.json(data);
  } catch (error) {
    // Log the actual error internally
    logger.error('Database query failed', { error, userId: req.user?.id });

    // Return generic message to client
    res.status(500).json({ error: 'An internal error occurred' });
  }
});
```

## 6. API Versioning

Implement versioning to manage breaking changes:

```javascript
// URL-based versioning
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

// Header-based versioning
app.use((req, res, next) => {
  const version = req.headers['api-version'] || '1';
  req.apiVersion = version;
  next();
});
```

## 7. CORS Configuration

Configure CORS properly to prevent unauthorized access:

```javascript
const cors = require('cors');

// ❌ Too permissive
app.use(cors({ origin: '*' }));

// ✅ Specific origins
const allowedOrigins = [
  'https://yourdomain.com',
  'https://app.yourdomain.com',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

## 8. API Documentation and Security

Document your API with security in mind:

```javascript
/**
 * @api {get} /api/users/:id Get User
 * @apiName GetUser
 * @apiGroup Users
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {String} id User's unique ID
 *
 * @apiSuccess {String} id User ID
 * @apiSuccess {String} username Username
 * @apiSuccess {String} email Email address
 *
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (403) Forbidden Insufficient permissions
 * @apiError (404) NotFound User not found
 */
```

## 9. Logging and Monitoring

Implement comprehensive logging for security events:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log', level: 'warn' }),
  ],
});

// Log security events
app.use((req, res, next) => {
  logger.info('API Request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  });
  next();
});

// Log authentication failures
app.post('/api/login', async (req, res) => {
  const user = await authenticateUser(req.body);

  if (!user) {
    logger.warn('Failed login attempt', {
      username: req.body.username,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Success path...
});
```

## Security Checklist for APIs

- ✅ Use HTTPS everywhere
- ✅ Implement proper authentication (JWT, OAuth 2.0)
- ✅ Enforce authorization on all endpoints
- ✅ Validate and sanitize all inputs
- ✅ Use parameterized queries to prevent SQL injection
- ✅ Implement rate limiting
- ✅ Filter sensitive data from responses
- ✅ Use security headers (Helmet.js)
- ✅ Configure CORS properly
- ✅ Handle errors without leaking information
- ✅ Log security events
- ✅ Keep dependencies updated
- ✅ Use API versioning
- ✅ Implement request/response size limits

## Automated Security Analysis

Tools like CodeGuard AI can automatically analyze your API code to detect:

- Missing authentication/authorization checks
- SQL injection vulnerabilities
- Sensitive data exposure
- Missing input validation
- Insecure configurations
- Rate limiting gaps

## Conclusion

Secure API design requires a multi-layered approach combining authentication, authorization, input validation, rate limiting, and proper error handling. By following these best practices and using automated security tools, you can build APIs that are both functional and secure.

Remember: security is not a one-time task but an ongoing process. Regular audits, testing, and updates are essential to maintaining a secure API.

---

*Build secure APIs with confidence. Try [CodeGuard AI](https://codeguard.ai) for automated API security analysis.*
