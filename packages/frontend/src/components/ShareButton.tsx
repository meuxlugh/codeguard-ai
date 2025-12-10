import { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Check, Trash2, Link, Loader2, ChevronDown } from 'lucide-react';
import { Button } from './ui/Button';
import { useRepoShares, useCreateShare, useDeleteShare } from '../hooks/useApi';
import type { ShareExpiration, RepositoryShare } from '../lib/api';

interface ShareButtonProps {
  repoId: number;
}

const expirationOptions: { value: ShareExpiration; label: string }[] = [
  { value: 'never', label: 'Never expires' },
  { value: '1d', label: '1 day' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
];

function formatExpiration(expiresAt: string | null): string {
  if (!expiresAt) return 'Never';
  const date = new Date(expiresAt);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  if (diffMs < 0) return 'Expired';

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return 'Today';
  if (diffDays <= 7) return `${diffDays} days`;
  return date.toLocaleDateString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

export default function ShareButton({ repoId }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedExpiration, setSelectedExpiration] = useState<ShareExpiration>('never');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: shares, isLoading } = useRepoShares(repoId);
  const createMutation = useCreateShare();
  const deleteMutation = useDeleteShare();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateShare = () => {
    createMutation.mutate({
      repoId,
      params: { expiresIn: selectedExpiration },
    });
  };

  const handleDeleteShare = (share: RepositoryShare) => {
    deleteMutation.mutate({ repoId, shareId: share.id });
  };

  const handleCopyLink = async (share: RepositoryShare) => {
    const url = `${window.location.origin}/share/${share.token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(share.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeShares = shares?.filter((s) => {
    if (!s.expiresAt) return true;
    return new Date(s.expiresAt) > new Date();
  }) || [];

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share
        {activeShares.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
            {activeShares.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900 mb-1">Share Repository Analysis</h3>
            <p className="text-xs text-gray-500">
              Anyone with the link can view the analysis results
            </p>
          </div>

          {/* Create new share */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedExpiration}
                  onChange={(e) => setSelectedExpiration(e.target.value as ShareExpiration)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {expirationOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <Button
                onClick={handleCreateShare}
                disabled={createMutation.isPending}
                size="sm"
                className="whitespace-nowrap"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Link className="w-4 h-4 mr-1" />
                    Create Link
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Existing shares */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              </div>
            ) : activeShares.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No active share links
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {activeShares.map((share) => (
                  <li key={share.id} className="p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-mono text-gray-700 truncate">
                          /share/{share.token.slice(0, 8)}...
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Created {formatDate(share.createdAt)}
                          {share.expiresAt && (
                            <span className="ml-2">
                              Expires: {formatExpiration(share.expiresAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyLink(share)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Copy link"
                        >
                          {copiedId === share.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteShare(share)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Delete share link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
