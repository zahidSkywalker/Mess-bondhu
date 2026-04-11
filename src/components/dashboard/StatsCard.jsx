import { useState } from 'react';
import Card from '../ui/Card';

/**
 * StatsCard — Single metric display card for the dashboard.
 * Supports 3D flip to show detailed breakdown on tap.
 *
 * Props:
 *   label: string — metric name
 *   value: string — formatted display value (e.g., "৳5,000")
 *   icon: JSX — icon element
 *   color: 'baltic' | 'teal' | 'emerald' | 'amber' | 'red' | 'slate'
 *   subtitle: string — optional secondary text
 *   flippable: boolean — enable 3D flip on tap
 *   backContent: JSX — content shown on the back face
 */
export default function StatsCard({ label, value, icon, color = 'baltic', subtitle, flippable = false, backContent = null }) {
  const [flipped, setFlipped] = useState(false);

  const colorMap = {
    baltic: {
      iconBg: 'bg-baltic/10',
      iconText: 'text-baltic dark:text-baltic-300',
      valueText: 'text-slate-800 dark:text-white',
    },
    teal: {
      iconBg: 'bg-teal/10',
      iconText: 'text-teal dark:text-teal-400',
      valueText: 'text-slate-800 dark:text-white',
    },
    emerald: {
      iconBg: 'bg-emerald/10',
      iconText: 'text-emerald-600 dark:text-emerald-400',
      valueText: 'text-slate-800 dark:text-white',
    },
    amber: {
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconText: 'text-amber-600 dark:text-amber-400',
      valueText: 'text-slate-800 dark:text-white',
    },
    red: {
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconText: 'text-red-500 dark:text-red-400',
      valueText: 'text-red-600 dark:text-red-400',
    },
    slate: {
      iconBg: 'bg-slate-100 dark:bg-slate-700',
      iconText: 'text-slate-500 dark:text-slate-400',
      valueText: 'text-slate-800 dark:text-white',
    },
  };

  const colors = colorMap[color] || colorMap.baltic;

  const handleFlip = () => {
    if (flippable) setFlipped((prev) => !prev);
  };

  const frontInner = (
    <div className="flex items-start gap-3">
      {icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.iconBg}`}>
          <span className={colors.iconText}>{icon}</span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide font-medium truncate">
          {label}
        </p>
        <p className={`text-xl font-bold mt-0.5 leading-tight ${colors.valueText}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  // ---- Non-flippable: render exactly as before ----
  if (!flippable) {
    return (
      <Card hover={false} padding={true}>
        {frontInner}
      </Card>
    );
  }

  // ---- Flippable: wrap in 3D flip container ----
  return (
    <div className="flip-card" onClick={handleFlip}>
      <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
        {/* Front face */}
        <div className="flip-card-front">
          <Card hover={false} padding={true}>
            {frontInner}
            <p className="text-[9px] text-slate-300 dark:text-slate-600 mt-2 text-center select-none">
              ↑ {typeof window !== 'undefined' && document.documentElement.lang === 'bn' ? 'ট্যাপ করুন' : 'Tap for details'}
            </p>
          </Card>
        </div>

        {/* Back face */}
        <div className="flip-card-back">
          <Card hover={false} padding={true} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              {backContent || (
                <p className="text-xs text-slate-400">No details</p>
              )}
            </div>
            <p className="text-[9px] text-slate-300 dark:text-slate-600 mt-2 text-center select-none">
              ↑ {typeof window !== 'undefined' && document.documentElement.lang === 'bn' ? 'ফিরে যান' : 'Tap to go back'}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
