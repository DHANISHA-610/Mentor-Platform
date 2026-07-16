const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-100' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
  yellow: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', ring: 'ring-red-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'ring-purple-100' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-100' },
};

export default function StatCard({ icon: Icon, label, value, change, color = 'blue', compact = false }) {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${compact ? 'p-3' : 'p-5'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`font-medium text-slate-500 ${compact ? 'truncate text-xs' : 'text-sm'}`}>{label}</p>
          <p className={`font-bold text-slate-900 ${compact ? 'mt-1 text-xl' : 'mt-2 text-3xl'}`}>{value}</p>
          {change && (
            <p className="mt-1 text-xs text-slate-400">{change}</p>
          )}
        </div>
        {Icon && (
          <div className={`shrink-0 rounded-lg ring-1 ${colors.bg} ${colors.ring} ${compact ? 'p-2' : 'p-2.5'}`}>
            <Icon className={`${colors.icon} ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </div>
        )}
      </div>
    </div>
  );
}
