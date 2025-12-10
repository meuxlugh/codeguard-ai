import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Github,
  Scan,
  Lock,
  CheckCircle2,
  ArrowRight,
  Zap,
  Eye,
  FileCode,
  AlertTriangle,
  Code2,
  Plug,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import Header from '../components/Header';

const faqs = [
  {
    question: 'What types of vulnerabilities can CodeGuard AI detect?',
    answer: 'CodeGuard AI detects a wide range of security issues including SQL injection, XSS, authentication flaws, insecure data handling, hardcoded secrets, path traversal, command injection, and many other OWASP Top 10 vulnerabilities. Our AI-powered analysis goes beyond pattern matching to understand code context and logic.',
  },
  {
    question: 'How is this different from traditional static analysis tools?',
    answer: 'Traditional tools rely on predefined rules and patterns. CodeGuard AI uses Claude to understand your code\'s intent and context, catching vulnerabilities that pattern-based scanners miss. It also provides more accurate results with fewer false positives and actionable remediation guidance.',
  },
  {
    question: 'Is my code stored or used for training?',
    answer: 'Your code is never stored permanently or used for AI training. We clone repositories temporarily for analysis, process them securely, and you can delete your data at any time. All scans are performed in isolated environments.',
  },
  {
    question: 'Can I scan private repositories?',
    answer: 'Yes! You can scan private GitHub repositories by providing a personal access token during the repository setup. The token is used only for cloning and is never stored. Your private code remains private.',
  },
  {
    question: 'Which programming languages are supported?',
    answer: 'CodeGuard AI supports all major programming languages including TypeScript, JavaScript, Python, Java, Go, Rust, C/C++, Ruby, PHP, and more. The AI analysis adapts to each language\'s specific patterns and vulnerabilities.',
  },
  {
    question: 'How do I integrate CodeGuard AI into my workflow?',
    answer: 'You can use our web dashboard for on-demand scans, install the CLI tool for local and CI/CD integration, or connect via MCP to analyze code directly from Claude Desktop or Cursor. Choose the method that fits your workflow best.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scanProgress, setScanProgress] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Animated scan progress for hero
  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-[120px] animate-pulse-subtle" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[100px] animate-pulse-subtle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-teal-100/40 rounded-full blur-[80px] animate-pulse-subtle" style={{ animationDelay: '2s' }} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `linear-gradient(rgb(16 185 129 / 0.03) 1px, transparent 1px), linear-gradient(90deg, rgb(16 185 129 / 0.03) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-emerald-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10">
        <Header />
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            {/* Animated Shield */}
            <div className="relative inline-flex mb-8">
              <div className="relative">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-300/50 animate-ping" style={{ animationDuration: '3s' }} />
                {/* Shield container */}
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 flex items-center justify-center shadow-xl shadow-emerald-500/10">
                  <Shield className="w-16 h-16 text-emerald-500" />
                  {/* Scan line */}
                  <div
                    className="absolute inset-0 rounded-full overflow-hidden"
                    style={{
                      background: `linear-gradient(180deg, transparent ${scanProgress}%, rgba(16, 185, 129, 0.15) ${scanProgress}%, rgba(16, 185, 129, 0.15) ${scanProgress + 2}%, transparent ${scanProgress + 2}%)`,
                    }}
                  />
                </div>
                {/* Floating icons */}
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-lg flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
                  <Lock className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-lg flex items-center justify-center animate-bounce" style={{ animationDuration: '2.5s' }}>
                  <Scan className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Code Security
              </span>
            </h1>

            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
              Deep vulnerability scanning powered by Claude AI. Find security flaws,
              reliability issues, and get actionable fixes in minutes.
            </p>

            {/* CTA */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => navigate('/app')}
                  size="lg"
                  className="gap-3 text-lg px-8 py-4 shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 hover:scale-105"
                >
                  <Github className="w-6 h-6" />
                  Start Scanning Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 text-lg px-8 py-4"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
              <p className="text-sm text-gray-500">Free & Open Source</p>
            </div>
          </div>

          {/* UI Preview */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-gray-200/50 bg-white">
              {/* Window header */}
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-gray-500 font-mono">CodeGuard AI — Security Analysis</span>
                </div>
              </div>

              {/* App content - split view */}
              <div className="flex h-[360px]">
                {/* Code panel */}
                <div className="flex-1 bg-gray-900 overflow-hidden">
                  <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-300 font-mono">src/auth/login.ts</span>
                  </div>
                  <div className="p-4 font-mono text-xs">
                    <div className="flex">
                      <div className="text-gray-600 pr-4 select-none text-right w-8">1</div>
                      <span className="text-purple-400">async </span><span className="text-blue-400">function </span><span className="text-yellow-300">authenticateUser</span><span className="text-gray-300">(req) {'{'}</span>
                    </div>
                    <div className="flex">
                      <div className="text-gray-600 pr-4 select-none text-right w-8">2</div>
                      <span className="text-gray-300">  </span><span className="text-purple-400">const </span><span className="text-gray-300">userId = req.body.userId;</span>
                    </div>
                    <div className="flex bg-red-500/20 -mx-4 px-4 border-l-2 border-red-500">
                      <div className="text-gray-600 pr-4 select-none text-right w-8">3</div>
                      <span className="text-gray-300">  </span><span className="text-purple-400">const </span><span className="text-gray-300">query = </span><span className="text-emerald-300">`SELECT * FROM users WHERE id = ${'$'}{'{'}userId{'}'}`</span><span className="text-gray-300">;</span>
                    </div>
                    <div className="flex">
                      <div className="text-gray-600 pr-4 select-none text-right w-8">4</div>
                      <span className="text-gray-300">  </span><span className="text-purple-400">const </span><span className="text-gray-300">user = </span><span className="text-purple-400">await </span><span className="text-gray-300">db.query(query);</span>
                    </div>
                    <div className="flex bg-orange-500/20 -mx-4 px-4 border-l-2 border-orange-500">
                      <div className="text-gray-600 pr-4 select-none text-right w-8">5</div>
                      <span className="text-gray-300">  </span><span className="text-purple-400">if </span><span className="text-gray-300">(!user) </span><span className="text-purple-400">throw new </span><span className="text-gray-300">Error(</span><span className="text-emerald-300">"User not found"</span><span className="text-gray-300">);</span>
                    </div>
                    <div className="flex">
                      <div className="text-gray-600 pr-4 select-none text-right w-8">6</div>
                      <span className="text-gray-300">  </span><span className="text-purple-400">return </span><span className="text-gray-300">user;</span>
                    </div>
                    <div className="flex">
                      <div className="text-gray-600 pr-4 select-none text-right w-8">7</div>
                      <span className="text-gray-300">{'}'}</span>
                    </div>
                  </div>
                </div>

                {/* Issues panel */}
                <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
                  <div className="px-4 py-2 bg-white border-b border-gray-200">
                    <span className="text-xs font-medium text-gray-900">Issues Found</span>
                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">3</span>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {/* Issue 1 */}
                    <div className="p-3 bg-white hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">CRITICAL</span>
                        <span className="text-[10px] text-gray-400 font-mono">Line 3</span>
                      </div>
                      <p className="text-xs font-medium text-gray-900">SQL Injection Vulnerability</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">User input directly interpolated into SQL query</p>
                    </div>
                    {/* Issue 2 */}
                    <div className="p-3 bg-white hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">HIGH</span>
                        <span className="text-[10px] text-gray-400 font-mono">Line 5</span>
                      </div>
                      <p className="text-xs font-medium text-gray-900">Information Disclosure</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Error message may reveal database structure</p>
                    </div>
                    {/* Issue 3 */}
                    <div className="p-3 bg-white hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">MEDIUM</span>
                        <span className="text-[10px] text-gray-400 font-mono">Line 2</span>
                      </div>
                      <p className="text-xs font-medium text-gray-900">Missing Input Validation</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">userId should be validated before use</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="bg-white border-y border-gray-200 py-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Features</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                Everything you need for secure code
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: 'Lightning Fast',
                  description: 'Scan entire repositories in minutes, not hours. AI-powered analysis works at scale.',
                  color: 'text-yellow-500',
                  bg: 'bg-yellow-50',
                },
                {
                  icon: Eye,
                  title: 'Deep Analysis',
                  description: 'Claude AI understands context, not just patterns. Find vulnerabilities static tools miss.',
                  color: 'text-blue-500',
                  bg: 'bg-blue-50',
                },
                {
                  icon: FileCode,
                  title: 'Multi-Language',
                  description: 'TypeScript, Python, Java, Go, Rust, and more. One tool for your entire stack.',
                  color: 'text-purple-500',
                  bg: 'bg-purple-50',
                },
                {
                  icon: AlertTriangle,
                  title: 'Priority Scoring',
                  description: 'Issues ranked by severity. Fix critical vulnerabilities first, tackle low-risk later.',
                  color: 'text-red-500',
                  bg: 'bg-red-50',
                },
                {
                  icon: CheckCircle2,
                  title: 'Actionable Fixes',
                  description: 'Get remediation guidance with each issue. Know exactly how to fix problems.',
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-50',
                },
                {
                  icon: Code2,
                  title: 'Code Navigation',
                  description: 'Jump directly to vulnerable code. Syntax highlighting and inline issue markers.',
                  color: 'text-cyan-500',
                  bg: 'bg-cyan-50',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">How it works</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                Three steps to secure code
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  icon: Github,
                  title: 'Connect',
                  description: 'Paste your GitHub repository URL. Public or private repos supported.',
                  gradient: 'from-blue-500 to-cyan-500',
                  bg: 'bg-blue-50',
                  iconColor: 'text-blue-500',
                },
                {
                  step: '02',
                  icon: Scan,
                  title: 'Analyze',
                  description: 'Claude AI performs deep contextual analysis using advanced prompting techniques to understand code intent and detect subtle vulnerabilities.',
                  gradient: 'from-emerald-500 to-teal-500',
                  bg: 'bg-emerald-50',
                  iconColor: 'text-emerald-500',
                },
                {
                  step: '03',
                  icon: CheckCircle2,
                  title: 'Fix',
                  description: 'Get prioritized issues with detailed remediation steps and code suggestions.',
                  gradient: 'from-emerald-500 to-teal-500',
                  bg: 'bg-emerald-50',
                  iconColor: 'text-emerald-500',
                },
              ].map((item, index) => (
                <div key={item.step} className="group relative">
                  {/* Connection line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-gray-200 to-transparent" />
                  )}

                  <div className="relative p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:transform hover:scale-105 hover:-translate-y-1">
                    {/* Step number */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-400">{item.step}</span>
                    </div>

                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                      <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Final CTA */}
            <div className="text-center mt-12">
              <Button
                onClick={() => navigate('/app')}
                size="lg"
                className="gap-3 text-lg px-8 py-4 shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 hover:scale-105"
              >
                <Shield className="w-6 h-6" />
                Start Scanning Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* MCP Integration Section */}
        <div className="bg-white border-y border-gray-200 py-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
                  <Plug className="w-4 h-4" />
                  MCP Integration
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Scan code directly from Claude
                </h2>
                <p className="text-lg text-gray-500 mb-6">
                  Connect CodeGuard AI to Claude Desktop, Cursor, or any MCP-compatible tool.
                  Get real-time security analysis while you code.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Analyze code snippets for vulnerabilities instantly',
                    'Query your repository security issues from chat',
                    'No context switching — security insights where you work',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/docs/integrations/mcp"
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Read the MCP documentation
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Code Preview */}
              <div className="relative">
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-white">
                  {/* Terminal header */}
                  <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-xs text-gray-500 font-mono">Claude Desktop — MCP</span>
                    </div>
                  </div>

                  {/* Chat content */}
                  <div className="bg-gray-50 p-5 space-y-4">
                    {/* User message */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-medium">U</span>
                      </div>
                      <div className="flex-1 bg-white rounded-xl p-3 border border-gray-200 text-sm text-gray-700">
                        Scan this code for security issues:
                        <code className="block mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-600">
                          {`const q = \`SELECT * FROM users WHERE id = \${userId}\``}
                        </code>
                      </div>
                    </div>

                    {/* AI response */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 bg-white rounded-xl p-3 border border-gray-200 text-sm text-gray-700">
                        <div className="flex items-center gap-2 text-red-600 font-medium mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          Critical: SQL Injection
                        </div>
                        <p className="text-gray-600 mb-2">
                          User input is directly interpolated into the SQL query without sanitization.
                        </p>
                        <p className="text-emerald-600 text-xs">
                          Fix: Use parameterized queries or an ORM.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -z-10 -top-4 -right-4 w-72 h-72 bg-emerald-100/50 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="py-20">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">FAQ</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:border-gray-300"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left gap-4"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`px-6 overflow-hidden transition-all duration-200 ${
                      openFaq === index ? 'pb-4 max-h-96' : 'max-h-0'
                    }`}
                  >
                    <p className="text-gray-500 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">
                  CodeGuard<span className="text-emerald-600">AI</span>
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <a href="#how-it-works" className="hover:text-gray-700 transition-colors">
                  How it works
                </a>
                <a href="/compare" className="hover:text-gray-700 transition-colors">
                  Compare
                </a>
                <a href="/docs/" className="hover:text-gray-700 transition-colors">
                  Docs
                </a>
                <a href="/blog" className="hover:text-gray-700 transition-colors">
                  Blog
                </a>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/sderosiaux/codeguard-ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <p className="text-sm text-gray-500">
                  © 2025 CodeGuard AI
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
