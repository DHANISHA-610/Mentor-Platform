import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const pathwayColors = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b'];
const statusColors = ['#f59e0b', '#3b82f6', '#6366f1', '#ec4899', '#10b981', '#ef4444'];

export function ActivityLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }} />
        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="newUsers" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="tasksCreated" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="tasksCompleted" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PathwayBarChart({ data }) {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={item.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-700">{item.name}</p>
              <p className="mt-1 text-xs text-slate-500">{item.count} interns</p>
            </div>
            <p className="text-sm font-semibold text-slate-900">{item.percentage}%</p>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${item.percentage}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TaskStatusPie({ data }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
          {data.map((entry, index) => (
            <Cell key={`cell-${entry.name}`} fill={statusColors[index % statusColors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyGrowthChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }} />
        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="newUsers" fill="#3b82f6" radius={[10, 10, 0, 0]} />
        <Bar dataKey="newMentors" fill="#10b981" radius={[10, 10, 0, 0]} />
        <Bar dataKey="newInterns" fill="#6366f1" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
