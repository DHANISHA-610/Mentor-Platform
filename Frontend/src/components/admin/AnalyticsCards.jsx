import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';

export function AnalyticsStatCard({ icon: Icon, label, value, description, trend = 0 }) {
  const positive = trend >= 0;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>
        {Icon && (
          <div className="rounded-2xl bg-slate-50 p-3 text-slate-600 shadow-sm">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="mt-5 flex items-center gap-2 text-sm font-medium">
        <span className={`${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
          {positive ? <FiArrowUpRight className="inline-block h-4 w-4" /> : <FiArrowDownRight className="inline-block h-4 w-4" />}
          {Math.abs(trend)}%
        </span>
        <span className="text-slate-500">from previous period</span>
      </div>
    </div>
  );
}

export function DataCard({ title, subtitle, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex flex-col gap-1">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{title}</p>
        <h3 className="text-xl font-semibold text-slate-900">{subtitle}</h3>
      </div>
      {children}
    </div>
  );
}
