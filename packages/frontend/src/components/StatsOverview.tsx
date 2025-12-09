import { Shield } from 'lucide-react';

interface StatsOverviewProps {
  title: string;
  subtitle: string;
  stats: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  /** Optional: show repos count as first column */
  reposCount?: number;
  /** Optional: currently selected severity for filtering */
  selectedSeverity?: string | null;
  /** Optional: callback when a severity is clicked */
  onSeverityClick?: (severity: string | null) => void;
}

export default function StatsOverview({
  title,
  subtitle,
  stats,
  reposCount,
  selectedSeverity,
  onSeverityClick,
}: StatsOverviewProps) {
  const total = stats.critical + stats.high + stats.medium + stats.low;

  // Design system: Severity color palette with gradients for selected states
  const statItems = [
    ...(reposCount !== undefined
      ? [{
          label: 'Repos',
          value: reposCount,
          textColor: 'text-gray-700',
          selectedTextColor: 'text-gray-900',
          accent: 'bg-gray-400',
          selectedBg: 'bg-gradient-to-b from-gray-100 to-gray-50',
          key: 'repos'
        }]
      : []),
    {
      label: 'Critical',
      value: stats.critical,
      textColor: 'text-red-600',
      selectedTextColor: 'text-red-700',
      accent: 'bg-red-500',
      selectedBg: 'bg-gradient-to-b from-red-100 to-red-50',
      key: 'critical'
    },
    {
      label: 'High',
      value: stats.high,
      textColor: 'text-orange-600',
      selectedTextColor: 'text-orange-700',
      accent: 'bg-orange-500',
      selectedBg: 'bg-gradient-to-b from-orange-100 to-orange-50',
      key: 'high'
    },
    {
      label: 'Medium',
      value: stats.medium,
      textColor: 'text-yellow-600',
      selectedTextColor: 'text-yellow-700',
      accent: 'bg-yellow-500',
      selectedBg: 'bg-gradient-to-b from-yellow-100 to-yellow-50',
      key: 'medium'
    },
    {
      label: 'Low',
      value: stats.low,
      textColor: 'text-emerald-600',
      selectedTextColor: 'text-emerald-700',
      accent: 'bg-emerald-500',
      selectedBg: 'bg-gradient-to-b from-emerald-100 to-emerald-50',
      key: 'low'
    },
  ];

  const handleClick = (key: string) => {
    if (!onSeverityClick) return;
    if (key === 'repos') return;
    onSeverityClick(selectedSeverity === key ? null : key);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>
          {total > 0 && (
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-xs text-gray-400 mr-2">Severity</span>
              <div className="flex h-2 w-32 rounded-full overflow-hidden bg-gray-100">
                {stats.critical > 0 && (
                  <div className="bg-red-500" style={{ width: `${(stats.critical / total) * 100}%` }} />
                )}
                {stats.high > 0 && (
                  <div className="bg-orange-500" style={{ width: `${(stats.high / total) * 100}%` }} />
                )}
                {stats.medium > 0 && (
                  <div className="bg-yellow-500" style={{ width: `${(stats.medium / total) * 100}%` }} />
                )}
                {stats.low > 0 && (
                  <div className="bg-emerald-500" style={{ width: `${(stats.low / total) * 100}%` }} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid divide-x divide-gray-100 ${reposCount !== undefined ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {statItems.map((stat, index) => {
          const isClickable = onSeverityClick && stat.key !== 'repos';
          const isSelected = selectedSeverity === stat.key;

          return (
            <button
              key={stat.key}
              onClick={() => handleClick(stat.key)}
              disabled={!isClickable}
              className={`relative p-4 transition-all duration-200 group ${
                index === 0 && reposCount !== undefined ? 'bg-gray-50/30' : ''
              } ${isClickable ? 'hover:bg-gray-50/50 cursor-pointer' : 'cursor-default'} ${
                isSelected ? `${stat.selectedBg} shadow-inner` : ''
              }`}
            >
              {/* Accent line - thicker when selected */}
              <div
                className={`absolute bottom-0 left-0 right-0 ${stat.accent} transition-all duration-200 ${
                  isSelected ? 'h-1 scale-x-100' : 'h-0.5 scale-x-0 group-hover:scale-x-100'
                } origin-left`}
              />

              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 transition-all duration-200 ${isSelected ? `${stat.selectedTextColor} scale-110` : stat.textColor}`}>{stat.value}</div>
                <div className={`text-xs font-medium uppercase tracking-wider transition-colors ${isSelected ? stat.selectedTextColor : 'text-gray-500'}`}>{stat.label}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
