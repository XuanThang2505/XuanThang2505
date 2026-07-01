import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { User, Briefcase } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { STATUS_CONFIG } from '../data/initialData';

function Avatar({ initials }) {
  const colors = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-cyan-500','bg-pink-500','bg-indigo-500'];
  let h = 0; for (const c of initials) h += c.charCodeAt(0);
  return (
    <div className={`w-10 h-10 ${colors[h % colors.length]} rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0`}>
      {initials.slice(0,2).toUpperCase()}
    </div>
  );
}

const SYSTEM_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16','#a855f7'];

export default function ResourceView({ projects, members }) {
  const memberLoad = useMemo(() => {
    return members.map(m => {
      const assigned = projects.filter(p => p.team.includes(m.id));
      const active = assigned.filter(p => p.status !== 'Hoàn thành' && p.status !== 'Tạm dừng');
      const budgetManagedProjects = assigned.filter(p => p.owner === m.id);
      const totalBudget = budgetManagedProjects.reduce((s, p) => s + (p.budget?.approved || 0), 0);
      return {
        ...m,
        assignedCount: assigned.length,
        activeCount: active.length,
        activeProjects: active,
        allProjects: assigned,
        totalBudget,
        isOwner: budgetManagedProjects.length > 0,
        load: active.length >= 4 ? 'Quá tải' : active.length >= 3 ? 'Cao' : active.length >= 2 ? 'Vừa' : 'Thấp',
      };
    }).sort((a, b) => b.activeCount - a.activeCount);
  }, [projects, members]);

  const loadColors = { 'Quá tải': 'bg-red-100 text-red-700', 'Cao': 'bg-amber-100 text-amber-700', 'Vừa': 'bg-blue-100 text-blue-700', 'Thấp': 'bg-emerald-100 text-emerald-700' };

  const systemData = useMemo(() => {
    const map = {};
    projects.forEach(p => {
      p.systems.forEach(s => { map[s] = (map[s] || 0) + 1; });
    });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [projects]);

  const deptBudget = useMemo(() => {
    const map = {};
    projects.forEach(p => {
      if (!map[p.dept]) map[p.dept] = { budget: 0, spent: 0, count: 0 };
      map[p.dept].budget += (p.budget?.approved || 0);
      map[p.dept].spent += (p.budget?.actual || 0);
      map[p.dept].count++;
    });
    return Object.entries(map)
      .map(([dept, data]) => ({ dept: dept.split(' ').slice(-1)[0], ...data }))
      .sort((a, b) => b.budget - a.budget);
  }, [projects]);

  const totalBudget = projects.reduce((s, p) => s + (p.budget?.approved || 0), 0);
  const totalSpent = projects.reduce((s, p) => s + (p.budget?.actual || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Nhân sự & Nguồn lực</h1>
        <p className="text-sm text-slate-500 mt-1">Phân bổ nhân lực và ngân sách toàn portfolio</p>
      </div>

      {/* Budget summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 col-span-1">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Ngân sách Portfolio</p>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalBudget)}</p>
          <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min((totalSpent/totalBudget)*100, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Đã chi: {formatCurrency(totalSpent)}</span>
            <span>{Math.round((totalSpent/totalBudget)*100)}%</span>
          </div>
        </div>

        {/* System usage chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 col-span-2">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">Hệ thống được dùng nhiều nhất</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={systemData.slice(0, 10)} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
              <Tooltip formatter={(v) => [v + ' dự án', 'Số lần dùng']} />
              <Bar dataKey="count" radius={[0,3,3,0]}>
                {systemData.slice(0,10).map((_, i) => <Cell key={i} fill={SYSTEM_COLORS[i % SYSTEM_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget by dept */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Ngân sách theo phòng ban</p>
        <div className="space-y-3">
          {deptBudget.map(({ dept, budget, spent, count }) => {
            const pct = Math.round((spent / budget) * 100);
            return (
              <div key={dept}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">{dept}</span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{count} dự án</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-slate-600">{formatCurrency(spent)}</span>
                    <span className="text-xs text-slate-400"> / {formatCurrency(budget)}</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-400' : 'bg-blue-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="text-xs text-slate-400 mt-0.5 text-right">{pct}% đã dùng</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Member load */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User size={16} className="text-blue-500" />
            Tải công việc nhân sự ({members.length} người)
          </p>
          <div className="flex gap-2 text-xs">
            {Object.entries(loadColors).map(([l, c]) => (
              <span key={l} className={`px-2 py-0.5 rounded font-medium ${c}`}>{l}</span>
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {memberLoad.map(m => (
            <div key={m.id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
              <Avatar initials={m.avatar} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800">{m.name}</span>
                  <span className="text-xs text-slate-400">{m.role}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${loadColors[m.load]}`}>{m.load}</span>
                </div>
                <p className="text-xs text-slate-400">{m.dept}</p>
                {m.activeProjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {m.activeProjects.map(p => (
                      <span key={p.id} className={`text-xs px-1.5 py-0.5 rounded ${STATUS_CONFIG[p.status]?.color}`}>
                        {p.code}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-slate-700">{m.activeCount} <span className="font-normal text-slate-400 text-xs">dự án đang chạy</span></div>
                <div className="text-xs text-slate-400">{m.assignedCount} tổng cộng</div>
                {m.totalBudget > 0 && (
                  <div className="text-xs text-amber-600 font-medium mt-0.5">
                    <Briefcase size={10} className="inline mr-1" />
                    {formatCurrency(m.totalBudget)}
                  </div>
                )}
              </div>
              <div className="w-24 shrink-0">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${m.load === 'Quá tải' ? 'bg-red-500' : m.load === 'Cao' ? 'bg-amber-400' : m.load === 'Vừa' ? 'bg-blue-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((m.activeCount / 5) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-400 mt-0.5 text-center">{m.activeCount}/5</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
