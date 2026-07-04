const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-100' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
  yellow: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', ring: 'ring-red-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'ring-purple-100' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-100' },
};

export default function StatCard({ icon: Icon, label, value, change, color = 'blue' }) {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {change && (
            <p className="mt-1 text-xs text-slate-400">{change}</p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-lg p-2.5 ring-1 ${colors.bg} ${colors.ring}`}>
            <Icon className={`h-5 w-5 ${colors.icon}`} />
          </div>
        )}
      </div>
    </div>
  );
}
