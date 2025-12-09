// Import markdown files as raw strings (Vite feature)
import sqlInjectionContent from '../content/blog/sql-injection-prevention-guide.md?raw';
import xssContent from '../content/blog/xss-attacks-complete-guide.md?raw';
import authenticationContent from '../content/blog/authentication-security-best-practices.md?raw';
import idorContent from '../content/blog/insecure-direct-object-references.md?raw';
import apiSecurityContent from '../content/blog/secure-api-design.md?raw';
import npmSecurityContent from '../content/blog/npm-dependency-security.md?raw';
import secretsContent from '../content/blog/secrets-management-guide.md?raw';
import csrfContent from '../content/blog/csrf-protection-guide.md?raw';
import fileUploadContent from '../content/blog/secure-file-upload-guide.md?raw';

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
    content: sqlInjectionContent
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
    content: xssContent
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
    content: authenticationContent
  },
  {
    slug: 'insecure-direct-object-references',
    title: 'IDOR Vulnerabilities: When Access Controls Fail',
    excerpt: 'Insecure Direct Object References (IDOR) allow attackers to access unauthorized data by manipulating object identifiers. Learn how to detect and prevent this common vulnerability.',
    category: 'Security',
    tags: ['IDOR', 'Access Control', 'Authorization', 'OWASP Top 10'],
    author: 'CodeGuard AI',
    date: '2024-12-06',
    readTime: '9 min read',
    content: idorContent
  },
  {
    slug: 'secure-api-design',
    title: 'Secure API Design: Building APIs That Resist Attack',
    excerpt: 'APIs are the backbone of modern applications—and a prime target for attackers. Learn how to design APIs that are secure by default.',
    category: 'Security',
    tags: ['API Security', 'REST', 'Authentication', 'Rate Limiting'],
    author: 'CodeGuard AI',
    date: '2024-12-05',
    readTime: '11 min read',
    content: apiSecurityContent
  },
  {
    slug: 'npm-dependency-security',
    title: 'NPM Security: Managing Dependencies Without Getting Hacked',
    excerpt: 'Your application is only as secure as its dependencies. Learn how to audit, monitor, and secure your NPM packages against supply chain attacks.',
    category: 'Security',
    tags: ['NPM', 'Supply Chain', 'Dependencies', 'Node.js'],
    author: 'CodeGuard AI',
    date: '2024-12-04',
    readTime: '10 min read',
    content: npmSecurityContent
  },
  {
    slug: 'secrets-management-guide',
    title: 'Secrets Management: Stop Committing Your API Keys',
    excerpt: 'Exposed secrets are one of the most common causes of data breaches. Learn how to properly manage API keys, passwords, and credentials in your applications.',
    category: 'Security',
    tags: ['Secrets', 'API Keys', 'Environment Variables', 'DevSecOps'],
    author: 'CodeGuard AI',
    date: '2024-12-03',
    readTime: '8 min read',
    content: secretsContent
  },
  {
    slug: 'csrf-protection-guide',
    title: 'CSRF Attacks: Protecting Users from Forged Requests',
    excerpt: 'Cross-Site Request Forgery tricks users into performing unwanted actions. Learn how CSRF works and the modern techniques to prevent it.',
    category: 'Security',
    tags: ['CSRF', 'Web Security', 'Cookies', 'OWASP Top 10'],
    author: 'CodeGuard AI',
    date: '2024-12-02',
    readTime: '9 min read',
    content: csrfContent
  },
  {
    slug: 'secure-file-upload-guide',
    title: 'Secure File Uploads: Preventing Malicious File Attacks',
    excerpt: 'File upload functionality is a common attack vector. Learn how to validate, sanitize, and securely store user-uploaded files.',
    category: 'Security',
    tags: ['File Upload', 'Validation', 'Malware', 'Web Security'],
    author: 'CodeGuard AI',
    date: '2024-12-01',
    readTime: '10 min read',
    content: fileUploadContent
  }
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
