import { useMemo, useState } from 'react';
import { AlertTriangle, Shield, Users } from 'lucide-react';
import { STATUS_CONFIG, MEMBERS } from '../data/initialData';

const LEVEL_CONFIG = {
  'Cao':       { color: 'text-red-700',    bg: 'bg-red-100',    border: 'border-red-300',    order: 0 },
  'Trung bình':{ color: 'text-amber-700',  bg: 'bg-amber-100',  border: 'border-amber-300',  order: 1 },
  'Thấp':      { color: 'text-slate-600',  bg: 'bg-slate-100',  border: 'border-slate-300',  order: 2 },
};
const PROB_BG = { High: 'bg-red-100 text-red-700', Medium: 'bg-amber-100 text-amber-700', Low: 'bg-emerald-100 text-emerald-700' };

export default function RiskView({ projects, onView }) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Open');

  const memberMap = useMemo(() => Object.fromEntries(MEMBERS.map(m => [m.id, m])), []);

  const allRisks = useMemo(() => {
    const list = [];
    projects.forEach(p => {
      (p.risks || []).forEach(r => {
        list.push({ ...r, project: p, projectName: p.name, projectCode: p.code, projectStatus: p.status });
      });
    });
    return list.sort((a, b) => (LEVEL_CONFIG[a.level]?.order ?? 99) - (LEVEL_CONFIG[b.level]?.order ?? 99));
  }, [projects]);

  const filtered = useMemo(() => {
    let list = allRisks;
    if (filter) list = list.filter(r => r.level === filter);
    if (statusFilter) list = list.filter(r => (r.status || 'Open') === statusFilter);
    return list;
  }, [allRisks, filter, statusFilter]);

  const stats = useMemo(() => {
    const open = allRisks.filter(r => (r.status || 'Open') !== 'Closed');
    const high = open.filter(r => r.level === 'Cao').length;
    const med = open.filter(r => r.level === 'Trung bình').length;
    const low = open.filter(r => r.level === 'Thấp').length;
    const projectsAtRisk = new Set(open.filter(r => r.level === 'Cao').map(r => r.project.id)).size;
    return { high, med, low, total: open.length, projectsAtRisk, closed: allRisks.length - open.length };
  }, [allRisks]);

  const projectsWithNoRisk = projects.filter(p => (p.risks || []).length === 0 && p.status !== 'Hoàn thành');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Rủi ro</h1>
          <p className="text-sm text-slate-500 mt-1">Tổng hợp rủi ro từ toàn bộ portfolio</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Open risks', value: stats.total, color: 'text-slate-700', bg: 'bg-white' },
          { label: 'Mức Cao', value: stats.high, color: 'text-red-700', bg: 'bg-red-50' },
          { label: 'Mức Trung bình', value: stats.med, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Mức Thấp', value: stats.low, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Dự án ảnh hưởng', value: stats.projectsAtRisk, color: 'text-violet-700', bg: 'bg-violet-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 shadow-sm border border-slate-100`}>
            <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1">
          {['', 'Cao', 'Trung bình', 'Thấp'].map(l => (
            <button key={l} onClick={() => setFilter(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === l ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {l || 'Tất cả mức'}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {['', 'Open', 'Closed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {s || 'All status'}
            </button>
          ))}
        </div>
      </div>

      {/* Risk list */}
      <div className="space-y-3">
        {filtered.map((r, idx) => {
          const cfg = LEVEL_CONFIG[r.level] || {};
          const statusCfg = STATUS_CONFIG[r.projectStatus] || {};
          const owner = r.owner ? memberMap[r.owner] : null;
          const isClosed = (r.status || 'Open') === 'Closed';
          return (
            <div key={idx} className={`bg-white rounded-xl shadow-sm border-l-4 ${cfg.border} overflow-hidden ${isClosed ? 'opacity-50' : ''}`}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <AlertTriangle size={18} className={`${cfg.color} mt-0.5 shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">{r.desc}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <button onClick={() => onView(r.project)} className="text-xs text-blue-600 hover:underline font-medium">
                          {r.projectCode} · {r.projectName}
                        </button>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusCfg.color}`}>{r.projectStatus}</span>
                        {isClosed && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Closed</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {r.probability && <span className={`text-xs px-2 py-0.5 rounded font-medium ${PROB_BG[r.probability] || 'bg-slate-100 text-slate-600'}`}>Prob: {r.probability}</span>}
                        {r.impact && <span className={`text-xs px-2 py-0.5 rounded font-medium ${PROB_BG[r.impact] || 'bg-slate-100 text-slate-600'}`}>Impact: {r.impact}</span>}
                        {owner && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Users size={10} />{owner.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`}>{r.level}</span>
                </div>
                {r.mitigation && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                    <Shield size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-medium text-emerald-700">Giảm thiểu: </span>
                      <span className="text-xs text-slate-600">{r.mitigation}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
            <Shield size={40} className="text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-500">Không có rủi ro nào phù hợp với bộ lọc</p>
          </div>
        )}
      </div>

      {/* Projects with no risk */}
      {projectsWithNoRisk.length > 0 && (
        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              Dự án đang chạy chưa có rủi ro ghi nhận ({projectsWithNoRisk.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {projectsWithNoRisk.map(p => (
              <button key={p.id} onClick={() => onView(p)}
                className="text-xs bg-white text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition-colors font-medium">
                {p.code}
              </button>
            ))}
          </div>
          <p className="text-xs text-emerald-600 mt-2">* Cân nhắc thêm đánh giá rủi ro cho các dự án này</p>
        </div>
      )}
    </div>
  );
}
