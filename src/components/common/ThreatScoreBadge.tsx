import React from 'react';

interface ThreatScoreBadgeProps {
  score: number;
  level: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ThreatScoreBadge: React.FC<ThreatScoreBadgeProps> = ({
  score,
  level,
  showScore = true,
  size = 'md',
}) => {
  const normalizedLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();

  let colorClasses = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
  let dotColor = 'bg-emerald-400';

  if (normalizedLevel === 'Critical' || score >= 75) {
    colorClasses = 'bg-rose-950/70 text-rose-300 border-rose-700/80 shadow-rose-950/30';
    dotColor = 'bg-rose-500 animate-pulse';
  } else if (normalizedLevel === 'High' || score >= 50) {
    colorClasses = 'bg-amber-950/70 text-amber-300 border-amber-700/70';
    dotColor = 'bg-amber-400';
  } else if (normalizedLevel === 'Medium' || score >= 25) {
    colorClasses = 'bg-yellow-950/60 text-yellow-300 border-yellow-700/60';
    dotColor = 'bg-yellow-400';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono tracking-wider transition-all duration-150 ${sizeClasses} ${colorClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{normalizedLevel}</span>
      {showScore && <span className="font-bold opacity-90">({Math.round(score)})</span>}
    </span>
  );
};

