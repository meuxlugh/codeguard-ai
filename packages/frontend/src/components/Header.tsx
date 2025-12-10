import { Link, useLocation } from 'react-router-dom';
import { Shield, Github } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/#how-it-works', label: 'How it works', external: false, isAnchor: true },
    { path: '/compare', label: 'Compare', external: false },
    { path: '/docs/', label: 'Docs', external: true },
    { path: '/blog', label: 'Blog', external: false },
    { path: '/about', label: 'About', external: false },
  ];

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Shield className="w-5 h-5 text-white" />
              </div>
              {currentPath === '/' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
              )}
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              CodeGuard<span className="text-emerald-600">AI</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {/* Nav links - hidden on mobile */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const pathWithoutAnchor = item.path.split('#')[0] || '/';
                const isActive = currentPath === pathWithoutAnchor || currentPath.startsWith(pathWithoutAnchor.replace(/\/$/, '') + '/');
                const className = `px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-emerald-600 hover:text-emerald-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`;

                // Use regular <a> for external/static routes or anchor links, <Link> for SPA routes
                return item.external || item.isAnchor ? (
                  <a key={item.path} href={item.path} className={className}>
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.path} to={item.path} className={className}>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2 md:ml-2">
              <Link
                to="/app"
                className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                Dashboard
              </Link>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
