import { useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface ResizerProps {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
  onCollapse: () => void;
  onExpand: () => void;
  isCollapsed: boolean;
  collapseDirection: 'left' | 'right' | 'up' | 'down';
}

export default function Resizer({
  direction,
  onResize,
  onCollapse,
  onExpand,
  isCollapsed,
  collapseDirection,
}: ResizerProps) {
  const resizerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isCollapsed) return;
    isDragging.current = true;
    startPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }, [direction, isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - startPos.current;
      startPos.current = currentPos;
      onResize(delta);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [direction, onResize]);

  const getCollapseIcon = () => {
    if (isCollapsed) {
      switch (collapseDirection) {
        case 'left': return <ChevronRight className="w-3 h-3" />;
        case 'right': return <ChevronLeft className="w-3 h-3" />;
        case 'up': return <ChevronDown className="w-3 h-3" />;
        case 'down': return <ChevronUp className="w-3 h-3" />;
      }
    } else {
      switch (collapseDirection) {
        case 'left': return <ChevronLeft className="w-3 h-3" />;
        case 'right': return <ChevronRight className="w-3 h-3" />;
        case 'up': return <ChevronUp className="w-3 h-3" />;
        case 'down': return <ChevronDown className="w-3 h-3" />;
      }
    }
  };

  const handleToggle = () => {
    if (isCollapsed) {
      onExpand();
    } else {
      onCollapse();
    }
  };

  if (direction === 'horizontal') {
    return (
      <div
        ref={resizerRef}
        className="relative flex-shrink-0 w-1 bg-gray-200 hover:bg-emerald-400 transition-colors group"
        style={{ cursor: isCollapsed ? 'default' : 'col-resize' }}
        onMouseDown={handleMouseDown}
      >
        {/* Wider hit area */}
        <div className="absolute inset-y-0 -left-1 -right-1 z-10" />

        {/* Collapse/Expand button */}
        <button
          onClick={handleToggle}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 z-20 w-5 h-8 bg-white border border-gray-300 rounded-md shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all opacity-0 group-hover:opacity-100"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {getCollapseIcon()}
        </button>
      </div>
    );
  }

  return (
    <div
      ref={resizerRef}
      className="relative flex-shrink-0 h-1 bg-gray-200 hover:bg-emerald-400 transition-colors group"
      style={{ cursor: isCollapsed ? 'default' : 'row-resize' }}
      onMouseDown={handleMouseDown}
    >
      {/* Wider hit area */}
      <div className="absolute inset-x-0 -top-1 -bottom-1 z-10" />

      {/* Collapse/Expand button */}
      <button
        onClick={handleToggle}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-5 w-8 bg-white border border-gray-300 rounded-md shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all opacity-0 group-hover:opacity-100"
        title={isCollapsed ? 'Expand' : 'Collapse'}
      >
        {getCollapseIcon()}
      </button>
    </div>
  );
}
