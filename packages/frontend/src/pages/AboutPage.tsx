import { Link } from 'react-router-dom';
import { Target, Eye, Zap, Heart, Lock, Code2, Users, Shield } from 'lucide-react';
import Header from '../components/Header';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            About Us
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Security Experts Building the Future of{' '}
            <span className="text-emerald-600">Code Protection</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're a team of security professionals and AI enthusiasts on a mission to make
            application security accessible to every developer.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-white border-y border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To democratize application security by combining cutting-edge AI with deep security expertise.
                We believe every developer deserves access to the same caliber of security analysis that
                was once reserved for enterprises with dedicated security teams.
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                Security vulnerabilities shouldn't slip through because teams lack resources.
                CodeGuard AI levels the playing field.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                A world where security is built into the development process from day one—not bolted
                on as an afterthought. We envision developers shipping code with confidence, knowing
                that AI has their back against the ever-evolving threat landscape.
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                We're working toward a future where security breaches from preventable vulnerabilities
                become a thing of the past.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Background Section */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Who We Are</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built by security practitioners who've seen firsthand how vulnerabilities impact real systems.
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Security Background</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Years of experience in penetration testing, vulnerability research, and
                    application security. We've audited codebases, found zero-days, and helped
                    organizations build secure systems.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Code2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Developer-First Mindset</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    We're developers too. We understand the pressure to ship fast and the frustration
                    of security tools that cry wolf. CodeGuard AI is designed to help, not hinder.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">AI Enthusiasts</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    We've been exploring the intersection of AI and security since the early days
                    of large language models. CodeGuard AI represents the culmination of that research.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Community Driven</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    We believe in giving back. Our blog shares real security knowledge, and we're
                    committed to helping developers learn—not just selling them tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white border-y border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Accuracy First',
                description: 'We\'d rather miss a low-risk issue than flood you with false positives.',
                icon: Target,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50'
              },
              {
                title: 'Transparency',
                description: 'Every finding includes clear explanations and actionable remediation.',
                icon: Eye,
                color: 'text-blue-600',
                bg: 'bg-blue-50'
              },
              {
                title: 'Privacy',
                description: 'Your code is yours. We analyze it, protect it, and never share it.',
                icon: Lock,
                color: 'text-purple-600',
                bg: 'bg-purple-50'
              },
              {
                title: 'Continuous Learning',
                description: 'The threat landscape evolves. So do we—constantly improving our detection.',
                icon: Zap,
                color: 'text-orange-600',
                bg: 'bg-orange-50'
              }
            ].map((value) => (
              <div key={value.title} className="text-center p-6">
                <div className={`w-12 h-12 rounded-xl ${value.bg} flex items-center justify-center mx-auto mb-4`}>
                  <value.icon className={`w-6 h-6 ${value.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 md:p-12 border border-emerald-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Ready to Secure Your Code?
          </h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Join developers who trust CodeGuard AI to find vulnerabilities before attackers do.
            Start scanning for free today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-lg shadow-emerald-500/25"
            >
              Get Started Free
            </Link>
            <Link
              to="/blog"
              className="px-8 py-3 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
            >
              Read Our Blog
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">CodeGuard AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
              <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <a href="https://github.com/sderosiaux/codeguard-ai" className="hover:text-white transition-colors">GitHub</a>
            </div>
            <p className="text-sm">
              © 2024 CodeGuard AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
