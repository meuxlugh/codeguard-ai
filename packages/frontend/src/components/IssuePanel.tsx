import { useState, useRef, useCallback, useEffect } from 'react';
import { AlertCircle, X, Shield, Zap, FileCode, Lightbulb } from 'lucide-react';
import { Badge } from './ui/Badge';
import type { Issue } from '../lib/api';

interface IssuePanelProps {
  issue: Issue;
  onClose?: () => void;
  floating?: boolean;
  position?: { x: number; y: number };
  onPositionChange?: (pos: { x: number; y: number }) => void;
}

// Format text - detect numbered lists and format them properly
function formatAsListItems(text: string): { isList: boolean; items: string[] } {
  // Split by numbered patterns like "1. ", "2. ", etc.
  const parts = text.split(/(?=\d+\.\s)/);
  const items = parts.map(part => part.trim()).filter(Boolean);
  const isList = items.length > 1 && items[0].match(/^\d+\./);
  return { isList: !!isList, items };
}

export default function IssuePanel({
  issue,
  onClose,
  floating = false,
  position,
  onPositionChange,
}: IssuePanelProps) {
  const dragRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!floating || !position || !onPositionChange) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { ...position };
  }, [floating, position, onPositionChange]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!onPositionChange) return;
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      onPositionChange({
        x: Math.max(0, Math.min(window.innerWidth - 400, initialPos.current.x + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 200, initialPos.current.y + dy)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onPositionChange]);

  return (
    <div className="h-full overflow-auto bg-white">
      {/* Header */}
      <div
        ref={dragRef}
        className={`sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-start justify-between ${
          floating ? 'cursor-move' : ''
        }`}
        onMouseDown={floating ? handleDragStart : undefined}
      >
        <div className="flex items-start gap-3">
          <div className={`p-1.5 rounded-lg mt-0.5 ${
            issue.severity === 'critical' ? 'bg-red-100' :
            issue.severity === 'high' ? 'bg-orange-100' :
            issue.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
          }`}>
            <AlertCircle className={`w-4 h-4 ${
              issue.severity === 'critical' ? 'text-red-600' :
              issue.severity === 'high' ? 'text-orange-600' :
              issue.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={issue.severity as 'critical' | 'high' | 'medium' | 'low'}>
                {issue.severity.toUpperCase()}
              </Badge>
              <Badge variant={issue.type === 'security' ? 'default' : 'medium'} className="text-xs">
                {issue.type === 'security' ? (
                  <><Shield className="w-3 h-3 mr-1" />Security</>
                ) : (
                  <><Zap className="w-3 h-3 mr-1" />Reliability</>
                )}
              </Badge>
              <span className="text-xs font-mono text-gray-400">{issue.issueId}</span>
            </div>
            <h2 className="font-semibold text-gray-900">{issue.title}</h2>
            {issue.filePath && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <FileCode className="w-3 h-3" />
                <span className="font-mono">{issue.filePath}</span>
                {issue.lineStart && (
                  <span className="text-gray-400">
                    :{issue.lineStart}
                    {issue.lineEnd && issue.lineEnd !== issue.lineStart && `-${issue.lineEnd}`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Category */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Category:</span>
          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{issue.category}</span>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Description
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Code Snippet */}
        {issue.codeSnippet && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Code Snippet
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100 font-mono">
                <code>{issue.codeSnippet}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Remediation */}
        {issue.remediation && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              Recommended Fix
            </h3>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              {(() => {
                const { isList, items } = formatAsListItems(issue.remediation);
                if (isList) {
                  return (
                    <ol className="text-sm text-gray-700 leading-relaxed space-y-2 list-decimal list-inside">
                      {items.map((item, i) => {
                        // Remove the leading number and period since we're using list-decimal
                        const text = item.replace(/^\d+\.\s*/, '');
                        return <li key={i}>{text}</li>;
                      })}
                    </ol>
                  );
                }
                return (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {issue.remediation}
                  </p>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
