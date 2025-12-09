interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  enabledLabel?: string;
  disabledLabel?: string;
  size?: 'sm' | 'md';
}

export default function Toggle({
  enabled,
  onChange,
  label,
  enabledLabel,
  disabledLabel,
  size = 'md',
}: ToggleProps) {
  const sizes = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-10 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-5',
    },
  };

  const s = sizes[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className="flex items-center gap-2 group"
    >
      {/* Track */}
      <div
        className={`relative ${s.track} rounded-full transition-colors duration-200 ${
          enabled
            ? 'bg-emerald-500'
            : 'bg-gray-300'
        }`}
      >
        {/* Thumb */}
        <div
          className={`absolute top-0.5 left-0.5 ${s.thumb} bg-white rounded-full shadow-sm transition-transform duration-200 ${
            enabled ? s.translate : 'translate-x-0'
          }`}
        />
      </div>

      {/* Label */}
      {(label || enabledLabel || disabledLabel) && (
        <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
          {label || (enabled ? enabledLabel : disabledLabel)}
        </span>
      )}
    </button>
  );
}
