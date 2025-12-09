import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Issue } from '../lib/api';

interface IssueHoverCardProps {
  issue: Issue;
  position: { x: number; y: number };
  onClose: () => void;
  onClick: () => void;
  onMouseEnter: () => void;
  shareUrl?: string;
}

export default function IssueHoverCard({ issue, position, onClose, onClick, onMouseEnter, shareUrl }: IssueHoverCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const severityConfig = {
    critical: {
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      badge: 'bg-red-500',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    high: {
      gradient: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      badge: 'bg-orange-500',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    medium: {
      gradient: 'from-yellow-500 to-amber-500',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      badge: 'bg-yellow-500',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    low: {
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      badge: 'bg-green-500',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const config = severityConfig[issue.severity] || severityConfig.medium;
  const isSecurityIssue = issue.type === 'security';

  // Truncate description
  const maxLen = 350;
  const desc = issue.description || '';
  const truncatedDesc = desc.length > maxLen
    ? desc.substring(0, maxLen).replace(/\s+\S*$/, '') + '...'
    : desc;

  // Smart positioning: check if card fits below, otherwise show above
  const cardWidth = 480;
  const estimatedCardHeight = 280; // Approximate card height
  const margin = 10;

  const spaceBelow = window.innerHeight - position.y - margin;
  const spaceAbove = position.y - margin;

  // Position above if not enough space below and more space above
  const showAbove = spaceBelow < estimatedCardHeight && spaceAbove > spaceBelow;

  const left = Math.min(position.x, window.innerWidth - cardWidth - margin);
  const top = showAbove
    ? position.y - estimatedCardHeight - margin
    : position.y + margin;

  return (
    <div
      className="fixed z-[9999] pointer-events-auto"
      style={{ left, top }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onClose}
    >
      {/* Card */}
      <div
        className={`w-[480px] rounded-xl shadow-2xl overflow-hidden border ${config.border} bg-white cursor-pointer transition-transform hover:scale-[1.02]`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
      >
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${config.gradient} px-4 py-3 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {config.icon}
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                {issue.severity}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isSecurityIssue ? (
                <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Security
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Reliability
                </span>
              )}
            </div>
          </div>
          <h3 className="mt-2 font-semibold text-sm leading-tight">{issue.title}</h3>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Category & ID */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
              {issue.category}
            </span>
            <span className="text-xs text-gray-400 font-mono">{issue.issueId}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            {truncatedDesc}
          </p>

          {/* Fix preview */}
          {issue.remediation && (
            <div className={`${config.bg} rounded-lg p-3 border ${config.border}`}>
              <div className="flex items-center gap-2 mb-1">
                <svg className={`w-4 h-4 ${config.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className={`text-xs font-semibold ${config.text}`}>Quick Fix</span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {issue.remediation.substring(0, 100)}...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {issue.lineStart === issue.lineEnd || !issue.lineEnd
              ? `Line ${issue.lineStart}`
              : `Lines ${issue.lineStart}-${issue.lineEnd}`}
          </span>
          <div className="flex items-center gap-3">
            {shareUrl && (
              <button
                onClick={handleShare}
                className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                  copied
                    ? 'text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Copy link to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-3 h-3" />
                    Share
                  </>
                )}
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800 hover:underline transition-colors"
            >
              View details
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
