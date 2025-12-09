---
title: "Understanding Insecure Direct Object References (IDOR)"
description: "Learn about IDOR vulnerabilities, how attackers exploit them, and how to implement proper access control in your applications."
publishDate: 2024-01-15
author: "CodeGuard AI Team"
tags: ["security", "access-control", "idor", "vulnerabilities"]
---

# Understanding Insecure Direct Object References (IDOR)

Insecure Direct Object References (IDOR) is a critical access control vulnerability that occurs when an application exposes a reference to an internal implementation object, such as a file, directory, or database key, without proper authorization checks. This vulnerability consistently ranks in the OWASP Top 10 and can lead to unauthorized data access, modification, or deletion.

## What is IDOR?

IDOR vulnerabilities occur when attackers can access or modify objects by manipulating identifiers used in a web application's URLs or parameters. The application fails to verify that the user has permission to access the requested resource.

### Common IDOR Examples

Consider this vulnerable API endpoint:

```javascript
// Vulnerable code - No authorization check
app.get('/api/users/:userId/profile', async (req, res) => {
  const userId = req.params.userId;
  const profile = await db.users.findById(userId);
  res.json(profile);
});
```

An attacker authenticated as user `123` could simply change the URL from `/api/users/123/profile` to `/api/users/456/profile` to access another user's data.

## Real-World Impact

IDOR vulnerabilities can lead to:

- **Data Breaches**: Unauthorized access to sensitive user information
- **Privacy Violations**: Exposure of personal data, medical records, or financial information
- **Account Takeover**: Modification of user credentials or permissions
- **Business Logic Bypass**: Circumventing payment or subscription checks

A notable example is the 2019 Facebook vulnerability where attackers could view private photos by manipulating photo IDs, affecting millions of users.

## How to Prevent IDOR

### 1. Implement Proper Authorization Checks

Always verify that the authenticated user has permission to access the requested resource:

```javascript
// Secure code - Authorization check included
app.get('/api/users/:userId/profile', async (req, res) => {
  const requestedUserId = req.params.userId;
  const authenticatedUserId = req.user.id;

  // Check if user can access this profile
  if (requestedUserId !== authenticatedUserId && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const profile = await db.users.findById(requestedUserId);
  res.json(profile);
});
```

### 2. Use Indirect Reference Maps

Instead of exposing direct database IDs, use indirect references that map to the actual objects:

```javascript
// Create user-specific reference mapping
const referenceMap = new Map();

app.get('/api/documents/:reference', async (req, res) => {
  const reference = req.params.reference;
  const userId = req.user.id;

  // Get actual document ID from user-specific mapping
  const documentId = referenceMap.get(`${userId}:${reference}`);

  if (!documentId) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const document = await db.documents.findById(documentId);
  res.json(document);
});
```

### 3. Implement Access Control Lists (ACLs)

Use a robust ACL system to define who can access what:

```javascript
async function checkAccess(userId, resourceId, action) {
  const acl = await db.acls.findOne({
    userId,
    resourceId,
    actions: { $in: [action] }
  });

  return acl !== null;
}

app.get('/api/documents/:docId', async (req, res) => {
  const docId = req.params.docId;
  const userId = req.user.id;

  const hasAccess = await checkAccess(userId, docId, 'read');

  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const document = await db.documents.findById(docId);
  res.json(document);
});
```

### 4. Use UUIDs Instead of Sequential IDs

Sequential IDs make it easy for attackers to enumerate resources. Use UUIDs to make prediction harder:

```javascript
// Instead of sequential IDs: 1, 2, 3, 4...
// Use UUIDs: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

const { v4: uuidv4 } = require('uuid');

const newDocument = {
  id: uuidv4(),
  title: 'My Document',
  ownerId: req.user.id
};
```

Note: UUIDs alone are NOT a security measure - you still need proper authorization checks.

## Testing for IDOR Vulnerabilities

### Manual Testing

1. Authenticate as User A
2. Identify resource identifiers in URLs, forms, or API calls
3. Note the IDs of User A's resources
4. Authenticate as User B
5. Try to access User A's resources using the noted IDs

### Automated Detection

Tools like CodeGuard AI can automatically detect IDOR vulnerabilities in your codebase by analyzing:

- API endpoints that accept user-supplied IDs
- Missing authorization checks in route handlers
- Database queries that don't filter by authenticated user
- Inconsistent access control patterns across endpoints

## Best Practices Checklist

- ✅ Implement authorization checks on every endpoint
- ✅ Use indirect reference maps when possible
- ✅ Apply access control at the data layer, not just the UI
- ✅ Log and monitor unauthorized access attempts
- ✅ Conduct regular security audits and penetration testing
- ✅ Use established authorization frameworks (e.g., CASL, Casbin)
- ✅ Implement rate limiting to slow down enumeration attacks
- ✅ Validate that references belong to the authenticated user

## Conclusion

IDOR vulnerabilities represent a fundamental failure in access control that can have severe consequences. By implementing proper authorization checks, using indirect references, and following the principle of least privilege, you can protect your application from these common attacks.

Modern security tools like CodeGuard AI can help identify IDOR vulnerabilities early in development, allowing you to fix them before they reach production. Remember: never trust user input, always verify permissions, and implement defense in depth.

---

*Stay secure and keep your users' data protected. For automated IDOR detection in your codebase, check out [CodeGuard AI](https://codeguard.ai).*
