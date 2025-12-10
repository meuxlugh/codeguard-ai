import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Tag, Shield } from 'lucide-react';
import { getAllBlogPosts } from '../data/blogPosts';
import Header from '../components/Header';

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-b from-emerald-50 to-white py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block px-3 py-1 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-full mb-4">
              Security Insights
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              CodeGuard AI Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learn about application security, vulnerability prevention, and best practices
              to keep your code secure.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300"
            >
              {/* Category Header */}
              <div className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600" />

              <div className="p-6">
                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full">
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                  <Link to={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Read
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Don't Just Read About Security—Implement It
          </h2>
          <p className="text-emerald-100 text-lg mb-8">
            CodeGuard AI automatically scans your codebase for the vulnerabilities discussed in these articles.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-emerald-600 bg-white rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Start Scanning Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
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
