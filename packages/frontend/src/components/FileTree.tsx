import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File, FileCode, List, FolderTree } from 'lucide-react';
import { Badge } from './ui/Badge';
import Toggle from './ui/Toggle';
import type { FileNode, IssuesByFile } from '../lib/api';

interface FileTreeProps {
  files: FileNode[];
  issuesByFile: IssuesByFile;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}

interface FileTreeNodeProps {
  node: FileNode;
  issuesByFile: IssuesByFile;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  level?: number;
  showOnlyIssues?: boolean;
}

// Get file icon based on extension
function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const codeExtensions = ['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'go', 'rs', 'rb', 'php', 'c', 'cpp', 'cs'];
  if (ext && codeExtensions.includes(ext)) {
    return FileCode;
  }
  return File;
}

function FileTreeNode({
  node,
  issuesByFile,
  selectedFile,
  onSelectFile,
  level = 0,
  showOnlyIssues = false,
}: FileTreeNodeProps) {
  // Only auto-expand folders that contain issues
  const [isExpanded, setIsExpanded] = useState(() => {
    if (node.type === 'file') return false;
    return hasAnyIssues(node, issuesByFile);
  });

  // Skip rendering if showOnlyIssues is enabled and this node has no issues
  const nodeHasIssues = hasAnyIssues(node, issuesByFile);
  if (showOnlyIssues && !nodeHasIssues) {
    return null;
  }

  const getIssueCount = (node: FileNode): number => {
    if (node.type === 'file') {
      return issuesByFile[node.path]?.length || 0;
    }

    // For directories, count all issues in children
    let count = 0;
    if (node.children) {
      for (const child of node.children) {
        count += getIssueCount(child);
      }
    }
    return count;
  };

  const getHighestSeverity = (
    node: FileNode
  ): 'critical' | 'high' | 'medium' | 'low' | null => {
    const severityOrder = ['critical', 'high', 'medium', 'low'] as const;

    if (node.type === 'file') {
      const issues = issuesByFile[node.path];
      if (!issues || issues.length === 0) return null;

      for (const severity of severityOrder) {
        if (issues.some((i) => i.severity === severity)) return severity;
      }
      return null;
    }

    // For directories, get highest severity from children
    let highestIndex = -1;
    if (node.children) {
      for (const child of node.children) {
        const childSeverity = getHighestSeverity(child);
        if (!childSeverity) continue;

        const childIndex = severityOrder.indexOf(childSeverity);
        if (childIndex === 0) return 'critical'; // Early return for critical
        if (highestIndex === -1 || childIndex < highestIndex) {
          highestIndex = childIndex;
        }
      }
    }
    return highestIndex >= 0 ? severityOrder[highestIndex] : null;
  };

  const issueCount = getIssueCount(node);
  const highestSeverity = getHighestSeverity(node);
  const isSelected = node.type === 'file' && selectedFile === node.path;
  const hasIssues = issueCount > 0;

  const handleClick = () => {
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded);
    } else {
      onSelectFile(node.path);
    }
  };

  const FileIcon = node.type === 'file' ? getFileIcon(node.name) : (isExpanded ? FolderOpen : Folder);

  return (
    <div>
      <div
        onClick={handleClick}
        className={`group flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 transition-all duration-100 cursor-pointer ${
          isSelected ? 'bg-blue-50 border-l-2 border-blue-600' : 'border-l-2 border-transparent'
        } ${hasIssues && !isSelected ? 'bg-red-50/50' : ''}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {node.type === 'directory' ? (
          <span className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-400" />
            )}
          </span>
        ) : (
          <span className="w-4" />
        )}

        <FileIcon className={`w-4 h-4 flex-shrink-0 ${
          node.type === 'directory'
            ? 'text-blue-500'
            : hasIssues
              ? highestSeverity === 'critical' ? 'text-red-500' :
                highestSeverity === 'high' ? 'text-orange-500' :
                highestSeverity === 'medium' ? 'text-yellow-600' : 'text-green-500'
              : 'text-gray-400'
        }`} />

        <span className={`flex-1 text-sm truncate ${
          isSelected ? 'text-blue-700 font-medium' :
          hasIssues ? 'text-gray-800' : 'text-gray-600'
        }`}>
          {node.name}
        </span>

        {issueCount > 0 && (
          <Badge
            variant={highestSeverity || 'default'}
            className={`text-xs px-1.5 py-0 min-w-[20px] justify-center ${
              node.type === 'directory' ? 'opacity-50' : ''
            }`}
          >
            {issueCount}
          </Badge>
        )}
      </div>

      {node.type === 'directory' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              issuesByFile={issuesByFile}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              level={level + 1}
              showOnlyIssues={showOnlyIssues}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({
  files,
  issuesByFile,
  selectedFile,
  onSelectFile,
}: FileTreeProps) {
  const [showOnlyIssues, setShowOnlyIssues] = useState(true); // Default to showing only issues
  const [flatView, setFlatView] = useState(false); // Default to tree view

  // Get flattened list of files with issues
  const flattenedFiles = useMemo(
    () => flattenFilesWithIssues(files, issuesByFile),
    [files, issuesByFile]
  );

  // Sort files: directories first, then by name, files with issues first within each category
  const sortedFiles = [...files].sort((a, b) => {
    // Directories first
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    // Within same type, files with issues first
    const aHasIssues = hasAnyIssues(a, issuesByFile);
    const bHasIssues = hasAnyIssues(b, issuesByFile);
    if (aHasIssues !== bHasIssues) {
      return aHasIssues ? -1 : 1;
    }
    // Finally, alphabetically
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Toggle filters */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between gap-2">
        <Toggle
          enabled={showOnlyIssues}
          onChange={setShowOnlyIssues}
          enabledLabel="Issues only"
          disabledLabel="All files"
          size="sm"
        />
        {/* View toggle buttons */}
        <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
          <button
            onClick={() => setFlatView(false)}
            className={`p-1 transition-colors ${
              !flatView
                ? 'bg-gray-100 text-gray-700'
                : 'bg-white text-gray-400 hover:text-gray-600'
            }`}
            title="Tree view"
          >
            <FolderTree className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setFlatView(true)}
            className={`p-1 transition-colors ${
              flatView
                ? 'bg-gray-100 text-gray-700'
                : 'bg-white text-gray-400 hover:text-gray-600'
            }`}
            title="Flat view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* File tree or flat list */}
      <div className="flex-1 overflow-auto py-1">
        {flatView ? (
          // Flat view - show all files with issues
          flattenedFiles.map((path) => (
            <FlatFileItem
              key={path}
              path={path}
              issuesByFile={issuesByFile}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          ))
        ) : (
          // Tree view
          sortedFiles.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              issuesByFile={issuesByFile}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              showOnlyIssues={showOnlyIssues}
            />
          ))
        )}
      </div>
    </div>
  );
}

function hasAnyIssues(node: FileNode, issuesByFile: IssuesByFile): boolean {
  if (node.type === 'file') {
    return (issuesByFile[node.path]?.length || 0) > 0;
  }
  if (node.children) {
    return node.children.some(child => hasAnyIssues(child, issuesByFile));
  }
  return false;
}

// Flatten file tree to get all files with issues
function flattenFilesWithIssues(nodes: FileNode[], issuesByFile: IssuesByFile): string[] {
  const result: string[] = [];

  function traverse(node: FileNode) {
    if (node.type === 'file') {
      if ((issuesByFile[node.path]?.length || 0) > 0) {
        result.push(node.path);
      }
    } else if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  for (const node of nodes) {
    traverse(node);
  }

  return result.sort((a, b) => a.localeCompare(b));
}

// Flat file item component
interface FlatFileItemProps {
  path: string;
  issuesByFile: IssuesByFile;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}

function FlatFileItem({ path, issuesByFile, selectedFile, onSelectFile }: FlatFileItemProps) {
  const issues = issuesByFile[path] || [];
  const issueCount = issues.length;
  const isSelected = selectedFile === path;

  const severityOrder = ['critical', 'high', 'medium', 'low'] as const;
  let highestSeverity: 'critical' | 'high' | 'medium' | 'low' | null = null;
  for (const severity of severityOrder) {
    if (issues.some((i) => i.severity === severity)) {
      highestSeverity = severity;
      break;
    }
  }

  const filename = path.split('/').pop() || path;
  const FileIcon = getFileIcon(filename);

  return (
    <div
      onClick={() => onSelectFile(path)}
      className={`group flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 transition-all duration-100 cursor-pointer ${
        isSelected ? 'bg-blue-50 border-l-2 border-blue-600' : 'border-l-2 border-transparent'
      } ${!isSelected ? 'bg-red-50/50' : ''}`}
      style={{ paddingLeft: '8px' }}
    >
      <span className="w-4" />

      <FileIcon className={`w-4 h-4 flex-shrink-0 ${
        highestSeverity === 'critical' ? 'text-red-500' :
        highestSeverity === 'high' ? 'text-orange-500' :
        highestSeverity === 'medium' ? 'text-yellow-600' : 'text-green-500'
      }`} />

      <span className={`flex-1 text-sm truncate ${
        isSelected ? 'text-blue-700 font-medium' : 'text-gray-800'
      }`} title={path}>
        {path}
      </span>

      {issueCount > 0 && (
        <Badge
          variant={highestSeverity || 'default'}
          className="text-xs px-1.5 py-0 min-w-[20px] justify-center"
        >
          {issueCount}
        </Badge>
      )}
    </div>
  );
}
