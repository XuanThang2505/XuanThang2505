import { X, Edit2, Calendar, DollarSign, Users, AlertTriangle, CheckCircle, Circle, Link2, Tag } from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../data/initialData';
import { formatCurrency, formatDate, calcBudgetPct, daysLeftLabel } from '../utils/format';

function Avatar({ initials, name }) {
  const colors = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-cyan-500'];
  let h = 0; for (const c of initials) h += c.charCodeAt(0);
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 ${colors[h % colors.length]} rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
        {initials.slice(0,2).toUpperCase()}
      </div>
      <span className="text-sm text-slate-700">{name}</span>
    </div>
  );
}

export default function ProjectDetail({ project, projects, members, onClose, onEdit }) {
  if (!project) return null;
  const memberMap = Object.fromEntries(members.map(m => [m.id, m]));
  const owner = memberMap[project.owner];
  const cfg = STATUS_CONFIG[project.status] || {};
  const priCfg = PRIORITY_CONFIG[project.priority] || {};
  const budgetPct = calcBudgetPct(project.budget, project.spent);
  const depProjects = project.dependencies.map(id => projects.find(p => p.id === id)).filter(Boolean);
  const dependants = projects.filter(p => p.dependencies.includes(project.id));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-end">
      <div className="w-full max-w-2xl bg-white h-screen overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-400">{project.code}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{project.status}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${priCfg.color}`}>{project.priority}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">{project.name}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => onEdit(project)} className="p-2 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-lg transition-colors">
              <Edit2 size={16} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">{project.description}</p>

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map(t => (
                <span key={t} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                  <Tag size={10} />{t}
                </span>
              ))}
            </div>
          )}

          {/* Progress */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Tiến độ tổng thể</span>
              <span className="text-2xl font-bold text-blue-600">{project.progress}%</span>
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${project.progress >= 75 ? 'bg-emerald-500' : project.progress >= 40 ? 'bg-blue-500' : 'bg-amber-400'}`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <p className="text-xs text-slate-400">Bắt đầu</p>
                <p className="text-sm font-medium text-slate-700">{formatDate(project.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Kết thúc</p>
                <p className={`text-sm font-medium ${daysLeftLabel(project.endDate).startsWith('Quá') ? 'text-red-600' : 'text-slate-700'}`}>
                  {formatDate(project.endDate)} · {daysLeftLabel(project.endDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={16} className="text-amber-500" />
              <span className="text-sm font-semibold text-slate-700">Ngân sách</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-xs text-slate-400">Tổng</p>
                <p className="text-sm font-bold text-slate-700">{formatCurrency(project.budget)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Đã chi</p>
                <p className="text-sm font-bold text-amber-600">{formatCurrency(project.spent)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Còn lại</p>
                <p className={`text-sm font-bold ${project.budget - project.spent < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatCurrency(project.budget - project.spent)}
                </p>
              </div>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(budgetPct, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">{budgetPct}% ngân sách đã sử dụng</p>
          </div>

          {/* Team */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-blue-500" />
              <span className="text-sm font-semibold text-slate-700">Nhân sự ({project.team.length} người)</span>
            </div>
            {owner && (
              <div className="mb-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                <Avatar initials={owner.avatar} name={owner.name} />
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Project Owner</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {project.team.filter(id => id !== project.owner).map(mid => {
                const m = memberMap[mid];
                return m ? (
                  <div key={mid} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                    <Avatar initials={m.avatar} name={m.name} />
                    <span className="text-xs text-slate-400">{m.role}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Systems */}
          {project.systems.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Hệ thống liên quan</p>
              <div className="flex flex-wrap gap-1.5">
                {project.systems.map(s => (
                  <span key={s} className="text-xs bg-violet-50 text-violet-600 px-2 py-1 rounded font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Milestones ({project.milestones.filter(m => m.done).length}/{project.milestones.length})</p>
            <div className="space-y-2">
              {project.milestones.map(m => (
                <div key={m.id} className={`flex items-center gap-3 p-3 rounded-lg ${m.done ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                  {m.done
                    ? <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    : <Circle size={16} className="text-slate-300 shrink-0" />
                  }
                  <span className={`text-sm flex-1 ${m.done ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>{m.name}</span>
                  <span className="text-xs text-slate-400">{formatDate(m.date)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dependencies */}
          {(depProjects.length > 0 || dependants.length > 0) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={16} className="text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Phụ thuộc</span>
              </div>
              {depProjects.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-slate-400 mb-1.5">Dự án này phụ thuộc vào:</p>
                  <div className="space-y-1.5">
                    {depProjects.map(d => (
                      <div key={d.id} className="flex items-center gap-2 text-sm p-2 bg-orange-50 rounded-lg">
                        <span className="text-xs font-mono text-slate-400">{d.code}</span>
                        <span className="text-slate-700">{d.name}</span>
                        <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_CONFIG[d.status]?.color}`}>{d.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {dependants.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1.5">Các dự án phụ thuộc vào dự án này:</p>
                  <div className="space-y-1.5">
                    {dependants.map(d => (
                      <div key={d.id} className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded-lg">
                        <span className="text-xs font-mono text-slate-400">{d.code}</span>
                        <span className="text-slate-700">{d.name}</span>
                        <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_CONFIG[d.status]?.color}`}>{d.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Risks */}
          {project.risks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="text-sm font-semibold text-slate-700">Rủi ro ({project.risks.length})</span>
              </div>
              <div className="space-y-2">
                {project.risks.map(r => (
                  <div key={r.id} className={`p-3 rounded-lg border-l-4 ${r.level === 'Cao' ? 'border-red-400 bg-red-50' : r.level === 'Trung bình' ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{r.desc}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${r.level === 'Cao' ? 'bg-red-100 text-red-700' : r.level === 'Trung bình' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {r.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Giảm thiểu: {r.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
