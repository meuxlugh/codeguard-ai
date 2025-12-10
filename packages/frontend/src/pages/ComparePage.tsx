import { Link } from 'react-router-dom';
import {
  Shield,
  Check,
  X,
  Minus,
  Github,
  ArrowRight,
  Zap,
  Brain,
  DollarSign,
  Clock,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import Header from '../components/Header';

const competitors = [
  {
    name: 'CodeGuard AI',
    logo: Shield,
    isUs: true,
    pricing: 'Free & Open Source',
    features: {
      aiPowered: true,
      contextualAnalysis: true,
      multiLanguage: true,
      cicdIntegration: true,
      selfHosted: true,
      dependencyScanning: false,
      containerScanning: false,
      secretsDetection: true,
      codeQuality: true,
      fixSuggestions: true,
      mcpIntegration: true,
      unlimitedScans: true,
    },
  },
  {
    name: 'Snyk',
    pricing: 'Free tier, paid from $98/mo',
    features: {
      aiPowered: false,
      contextualAnalysis: false,
      multiLanguage: true,
      cicdIntegration: true,
      selfHosted: false,
      dependencyScanning: true,
      containerScanning: true,
      secretsDetection: true,
      codeQuality: false,
      fixSuggestions: true,
      mcpIntegration: false,
      unlimitedScans: false,
    },
  },
  {
    name: 'SonarQube',
    pricing: 'Free Community, paid from $150/mo',
    features: {
      aiPowered: false,
      contextualAnalysis: false,
      multiLanguage: true,
      cicdIntegration: true,
      selfHosted: true,
      dependencyScanning: false,
      containerScanning: false,
      secretsDetection: false,
      codeQuality: true,
      fixSuggestions: false,
      mcpIntegration: false,
      unlimitedScans: true,
    },
  },
  {
    name: 'Checkmarx',
    pricing: 'Enterprise pricing',
    features: {
      aiPowered: false,
      contextualAnalysis: false,
      multiLanguage: true,
      cicdIntegration: true,
      selfHosted: true,
      dependencyScanning: true,
      containerScanning: true,
      secretsDetection: true,
      codeQuality: false,
      fixSuggestions: true,
      mcpIntegration: false,
      unlimitedScans: false,
    },
  },
  {
    name: 'GitHub Advanced Security',
    pricing: '$49/user/mo',
    features: {
      aiPowered: true,
      contextualAnalysis: false,
      multiLanguage: true,
      cicdIntegration: true,
      selfHosted: false,
      dependencyScanning: true,
      containerScanning: false,
      secretsDetection: true,
      codeQuality: false,
      fixSuggestions: true,
      mcpIntegration: false,
      unlimitedScans: true,
    },
  },
];

const featureLabels: Record<string, { label: string; description: string }> = {
  aiPowered: {
    label: 'AI-Powered Analysis',
    description: 'Uses advanced AI models to understand code context',
  },
  contextualAnalysis: {
    label: 'Contextual Understanding',
    description: 'Understands code intent, not just patterns',
  },
  multiLanguage: {
    label: 'Multi-Language Support',
    description: 'Supports multiple programming languages',
  },
  cicdIntegration: {
    label: 'CI/CD Integration',
    description: 'Integrates with CI/CD pipelines',
  },
  selfHosted: {
    label: 'Self-Hosted Option',
    description: 'Can be deployed on your own infrastructure',
  },
  dependencyScanning: {
    label: 'Dependency Scanning',
    description: 'Scans third-party dependencies for vulnerabilities',
  },
  containerScanning: {
    label: 'Container Scanning',
    description: 'Scans Docker/container images',
  },
  secretsDetection: {
    label: 'Secrets Detection',
    description: 'Detects hardcoded secrets and credentials',
  },
  codeQuality: {
    label: 'Code Quality Analysis',
    description: 'Analyzes code quality beyond security',
  },
  fixSuggestions: {
    label: 'Fix Suggestions',
    description: 'Provides actionable remediation guidance',
  },
  mcpIntegration: {
    label: 'MCP Integration',
    description: 'Works with Claude Desktop, Cursor, and other MCP clients',
  },
  unlimitedScans: {
    label: 'Unlimited Scans',
    description: 'No limits on number of scans',
  },
};

function FeatureIcon({ value }: { value: boolean | 'partial' }) {
  if (value === true) {
    return <Check className="w-5 h-5 text-emerald-500" />;
  }
  if (value === 'partial') {
    return <Minus className="w-5 h-5 text-yellow-500" />;
  }
  return <X className="w-5 h-5 text-gray-300" />;
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How CodeGuard AI{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Compares
              </span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              See how our AI-powered security scanner stacks up against other solutions in the market.
            </p>
          </div>
        </div>
      </div>

      {/* Key Differentiators */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Choose CodeGuard AI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Brain,
              title: 'True AI Understanding',
              description: 'AI understands your code context, finding vulnerabilities that pattern-based tools miss.',
              color: 'text-purple-500',
              bg: 'bg-purple-50',
            },
            {
              icon: DollarSign,
              title: 'Free & Open Source',
              description: 'No per-seat pricing, no scan limits. Self-host or use our cloud service.',
              color: 'text-emerald-500',
              bg: 'bg-emerald-50',
            },
            {
              icon: Zap,
              title: 'MCP Integration',
              description: 'Works directly in Claude Desktop, Cursor, and other MCP-compatible tools.',
              color: 'text-yellow-500',
              bg: 'bg-yellow-50',
            },
            {
              icon: Clock,
              title: 'Fast Setup',
              description: 'Paste a GitHub URL and start scanning in seconds. No complex configuration.',
              color: 'text-blue-500',
              bg: 'bg-blue-50',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white border-y border-gray-200 py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 w-64">Feature</th>
                  {competitors.map((comp) => (
                    <th
                      key={comp.name}
                      className={`py-4 px-4 text-center text-sm font-medium ${
                        comp.isUs ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {comp.isUs && <Shield className="w-5 h-5 text-emerald-500" />}
                        <span>{comp.name}</span>
                        <span className="text-xs font-normal text-gray-400">{comp.pricing}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(featureLabels).map(([key, { label, description }]) => (
                  <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{label}</div>
                        <div className="text-xs text-gray-400">{description}</div>
                      </div>
                    </td>
                    {competitors.map((comp) => (
                      <td
                        key={comp.name}
                        className={`py-4 px-4 text-center ${comp.isUs ? 'bg-emerald-50/50' : ''}`}
                      >
                        <div className="flex justify-center">
                          <FeatureIcon value={comp.features[key as keyof typeof comp.features]} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to secure your code?</h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-xl mx-auto">
            Start scanning your repositories for free. No credit card required, no usage limits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => (window.location.href = '/app')}
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 gap-2"
            >
              <Github className="w-5 h-5" />
              Start Scanning Free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Link
              to="https://github.com/sderosiaux/codeguard-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-100 hover:text-white font-medium flex items-center gap-2 transition-colors"
            >
              View on GitHub
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">
                  CodeGuard<span className="text-emerald-600">AI</span>
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="/#how-it-works" className="hover:text-gray-700 transition-colors">
                How it works
              </a>
              <Link to="/compare" className="text-emerald-600 font-medium">
                Compare
              </Link>
              <a href="/docs/" className="hover:text-gray-700 transition-colors">
                Docs
              </a>
              <Link to="/blog" className="hover:text-gray-700 transition-colors">
                Blog
              </Link>
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
              <p className="text-sm text-gray-500">© 2025 CodeGuard AI</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
