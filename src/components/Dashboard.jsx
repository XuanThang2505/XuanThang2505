import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign, Users, Zap } from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../data/initialData';
import { formatCurrency, daysLeftLabel } from '../utils/format';

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${color.replace('text-', 'bg-').replace('-700', '-100').replace('-600', '-100')}`}>
          <Icon size={20} className={color} />
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value, color = 'bg-blue-500' }) {
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

const STATUS_COLORS = {
  'Đúng tiến độ': '#10b981',
  'Chậm tiến độ': '#f59e0b',
  'Nguy hiểm':    '#ef4444',
  'Hoàn thành':   '#3b82f6',
  'Tạm dừng':     '#94a3b8',
};

export default function Dashboard({ projects, members, onSelectProject }) {
  const stats = useMemo(() => {
    const total = projects.length;
    const done = projects.filter(p => p.status === 'Hoàn thành').length;
    const danger = projects.filter(p => p.status === 'Nguy hiểm').length;
    const late = projects.filter(p => p.status === 'Chậm tiến độ').length;
    const paused = projects.filter(p => p.status === 'Tạm dừng').length;
    const onTrack = projects.filter(p => p.status === 'Đúng tiến độ').length;
    const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
    const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
    const avgProgress = Math.round(projects.reduce((s, p) => s + p.progress, 0) / total);
    const totalRisks = projects.reduce((s, p) => s + p.risks.length, 0);
    const highRisks = projects.reduce((s, p) => s + p.risks.filter(r => r.level === 'Cao').length, 0);
    return { total, done, danger, late, paused, onTrack, totalBudget, totalSpent, avgProgress, totalRisks, highRisks };
  }, [projects]);

  const statusData = useMemo(() => {
    const map = {};
    projects.forEach(p => { map[p.status] = (map[p.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const deptData = useMemo(() => {
    const map = {};
    projects.forEach(p => { map[p.dept] = (map[p.dept] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name: name.split(' ').slice(-1)[0], count }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  const atRisk = useMemo(() =>
    projects
      .filter(p => p.status === 'Nguy hiểm' || p.status === 'Chậm tiến độ')
      .sort((a, b) => (a.status === 'Nguy hiểm' ? -1 : 1))
      .slice(0, 6),
    [projects]
  );

  const recentMilestones = useMemo(() => {
    const all = [];
    projects.forEach(p => {
      p.milestones.forEach(m => {
        if (!m.done) all.push({ ...m, project: p.name, projectId: p.id, code: p.code });
      });
    });
    return all.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 8);
  }, [projects]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tổng quan Portfolio</h1>
          <p className="text-sm text-slate-500 mt-1">
            Cập nhật: {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Tổng dự án" value={stats.total} sub={`${stats.done} hoàn thành`} icon={FolderIcon} color="text-blue-600" />
        <StatCard label="Đúng tiến độ" value={stats.onTrack} sub={`${stats.late} chậm, ${stats.paused} tạm dừng`} icon={CheckCircle} color="text-emerald-600" />
        <StatCard label="Nguy hiểm" value={stats.danger} sub={`${stats.highRisks} rủi ro cao`} icon={AlertTriangle} color="text-red-600" />
        <StatCard label="Tiến độ TB" value={`${stats.avgProgress}%`} sub="Toàn bộ portfolio" icon={TrendingUp} color="text-violet-600" />
        <StatCard label="Tổng ngân sách" value={formatCurrency(stats.totalBudget)} sub="Ngân sách toàn portfolio" icon={DollarSign} color="text-amber-600" />
        <StatCard label="Đã chi" value={formatCurrency(stats.totalSpent)} sub={`${Math.round((stats.totalSpent/stats.totalBudget)*100)}% ngân sách`} icon={Zap} color="text-orange-600" />
        <StatCard label="Nhân sự" value={members.length} sub="Thành viên tham gia" icon={Users} color="text-cyan-600" />
        <StatCard label="Tổng rủi ro" value={stats.totalRisks} sub={`${stats.highRisks} mức độ cao`} icon={AlertTriangle} color="text-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-700 mb-4">Trạng thái dự án</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v + ' dự án', n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {statusData.map(({ name, value }) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[name] }} />
                  <span className="text-slate-600">{name}</span>
                </div>
                <span className="font-semibold text-slate-700">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart by dept */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 col-span-2">
          <h3 className="font-semibold text-slate-700 mb-4">Dự án theo phòng ban</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" name="Số dự án" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At-risk projects */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            Dự án cần chú ý
          </h3>
          <div className="space-y-3">
            {atRisk.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => onSelectProject(p)}
              >
                <div className={`w-2 h-8 rounded-full ${p.status === 'Nguy hiểm' ? 'bg-red-500' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{p.code}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_CONFIG[p.status]?.color}`}>{p.status}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                  <ProgressBar value={p.progress} color={p.status === 'Nguy hiểm' ? 'bg-red-500' : 'bg-amber-400'} />
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-700">{p.progress}%</p>
                  <p className="text-xs text-slate-400">{daysLeftLabel(p.endDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming milestones */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            Mốc quan trọng sắp tới
          </h3>
          <div className="space-y-2">
            {recentMilestones.map(m => {
              const days = Math.ceil((new Date(m.date) - new Date()) / 86400000);
              const urgent = days < 14;
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => onSelectProject(projects.find(p => p.id === m.projectId))}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${urgent ? 'bg-red-50' : 'bg-blue-50'}`}>
                    <Clock size={16} className={urgent ? 'text-red-500' : 'text-blue-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{m.name}</p>
                    <p className="text-xs text-slate-400 truncate">{m.code} · {m.project}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-semibold ${urgent ? 'text-red-600' : 'text-slate-600'}`}>
                      {days < 0 ? `Quá ${Math.abs(days)}N` : days === 0 ? 'Hôm nay' : `${days} ngày`}
                    </p>
                    <p className="text-xs text-slate-400">{new Date(m.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function FolderIcon({ size, className }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
