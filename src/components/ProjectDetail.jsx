import { X, Edit2, Calendar, DollarSign, Users, AlertTriangle, CheckCircle, Circle, Link2, Tag, TrendingUp, Layers, Activity } from 'lucide-react';
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

function KpiGauge({ label, value, good, warn }) {
  const color = value >= good ? 'text-emerald-600' : value >= warn ? 'text-amber-600' : 'text-red-600';
  const bg = value >= good ? 'bg-emerald-50' : value >= warn ? 'bg-amber-50' : 'bg-red-50';
  return (
    <div className={`${bg} rounded-lg p-3 text-center`}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value?.toFixed(2)}</p>
    </div>
  );
}

const PROB_COLORS = { High: 'bg-red-100 text-red-700', Medium: 'bg-amber-100 text-amber-700', Low: 'bg-emerald-100 text-emerald-700' };
const ISSUE_COLORS = { P1: 'bg-red-100 text-red-700', P2: 'bg-amber-100 text-amber-700', P3: 'bg-blue-100 text-blue-700' };
const ISSUE_STATUS = { 'Open': 'bg-red-50 text-red-600', 'In Progress': 'bg-amber-50 text-amber-600', 'Closed': 'bg-emerald-50 text-emerald-600' };

export default function ProjectDetail({ project, projects, members, onClose, onEdit }) {
  if (!project) return null;
  const memberMap = Object.fromEntries(members.map(m => [m.id, m]));
  const owner = memberMap[project.owner];
  const sponsor = memberMap[project.sponsor];
  const cfg = STATUS_CONFIG[project.status] || {};
  const priCfg = PRIORITY_CONFIG[project.priority] || {};

  const depProjects = (project.dependencies?.projects || []).map(id => projects.find(p => p.id === id)).filter(Boolean);
  const dependants = projects.filter(p => (p.dependencies?.projects || []).includes(project.id));
  const depSystems = project.dependencies?.systems || [];
  const depExternal = project.dependencies?.external || [];

  const bgt = project.budget || {};
  const budgetPct = calcBudgetPct(bgt.approved, bgt.actual);
  const forecastPct = calcBudgetPct(bgt.approved, bgt.forecast);
  const fteData = project.fte || {};

  const openIssues = (project.issues || []).filter(i => i.status !== 'Closed');
  const openRisks = (project.risks || []).filter(r => r.status !== 'Closed');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-end">
      <div className="w-full max-w-2xl bg-white h-screen overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono text-slate-400">{project.code}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{project.status}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${priCfg.color}`}>{project.priority}</span>
              {project.phase && <span className="text-xs px-2 py-0.5 rounded bg-violet-50 text-violet-600 font-medium">{project.phase}</span>}
            </div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">{project.name}</h2>
            {project.program && <p className="text-xs text-slate-400 mt-0.5">{project.program}</p>}
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
          {/* Status comment */}
          {project.statusComment && (
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg px-4 py-3">
              <p className="text-xs font-semibold text-blue-700 mb-0.5">Status Update</p>
              <p className="text-sm text-blue-800 leading-relaxed">{project.statusComment}</p>
              {project.lastStatusUpdate && (
                <p className="text-xs text-blue-500 mt-1">Updated: {formatDate(project.lastStatusUpdate)} · Next review: {formatDate(project.nextReviewDate)}</p>
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">{project.description}</p>

          {/* Tags */}
          {project.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map(t => (
                <span key={t} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                  <Tag size={10} />{t}
                </span>
              ))}
            </div>
          )}

          {/* Progress & Schedule */}
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
                <p className="text-xs text-slate-400">Baseline Start → End</p>
                <p className="text-xs font-medium text-slate-500">{formatDate(project.baselineStart)} → {formatDate(project.baselineEnd)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Actual Start / Deadline</p>
                <p className={`text-xs font-medium ${daysLeftLabel(project.endDate).startsWith('Quá') ? 'text-red-600' : 'text-slate-600'}`}>
                  {formatDate(project.actualStart || project.startDate)} → {formatDate(project.endDate)} · {daysLeftLabel(project.endDate)}
                </p>
              </div>
            </div>
          </div>

          {/* KPIs */}
          {project.kpi && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className="text-violet-500" />
                <span className="text-sm font-semibold text-slate-700">Earned Value / KPIs</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <KpiGauge label="SPI" value={project.kpi.spi} good={1.0} warn={0.9} />
                <KpiGauge label="CPI" value={project.kpi.cpi} good={1.0} warn={0.9} />
                <div className={`rounded-lg p-3 text-center ${project.kpi.scheduleVariance <= 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                  <p className="text-xs text-slate-500 mb-1">Schedule Var.</p>
                  <p className={`text-lg font-bold ${project.kpi.scheduleVariance <= 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {project.kpi.scheduleVariance > 0 ? '+' : ''}{project.kpi.scheduleVariance}d
                  </p>
                </div>
                <div className={`rounded-lg p-3 text-center ${project.kpi.costVariance >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <p className="text-xs text-slate-500 mb-1">Cost Var.</p>
                  <p className={`text-lg font-bold ${project.kpi.costVariance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {project.kpi.costVariance >= 0 ? '+' : ''}{formatCurrency(project.kpi.costVariance)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Budget */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={16} className="text-amber-500" />
              <span className="text-sm font-semibold text-slate-700">Budget (Cost Approved)</span>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div>
                <p className="text-xs text-slate-400">Approved</p>
                <p className="text-sm font-bold text-slate-700">{formatCurrency(bgt.approved)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Actual (YTD)</p>
                <p className="text-sm font-bold text-amber-600">{formatCurrency(bgt.actual)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Forecast (EAC)</p>
                <p className={`text-sm font-bold ${(bgt.forecast || 0) > (bgt.approved || 0) ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatCurrency(bgt.forecast)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Variance</p>
                <p className={`text-sm font-bold ${(bgt.approved - (bgt.forecast || bgt.actual)) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(bgt.approved - (bgt.forecast || bgt.actual || 0))}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                  <span>Actual spend</span><span>{budgetPct}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(budgetPct, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                  <span>Forecast vs Approved</span><span>{forecastPct}%</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${forecastPct > 100 ? 'bg-red-400' : 'bg-blue-400'}`}
                    style={{ width: `${Math.min(forecastPct, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* FTE */}
          {project.fte && (
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-cyan-500" />
                <span className="text-sm font-semibold text-slate-700">FTE Headcount</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[['Approved', fteData.approved, 'text-slate-700'], ['Actual', fteData.actual, 'text-amber-600'], ['Forecast', fteData.forecast, 'text-blue-600']].map(([label, val, color]) => (
                  <div key={label} className="text-center">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className={`text-2xl font-bold ${color}`}>{val}</p>
                    <p className="text-xs text-slate-400">FTE</p>
                  </div>
                ))}
              </div>
              {project.resources?.length > 0 && (
                <div className="mt-3 border-t border-slate-200 pt-3 space-y-1.5">
                  {project.resources.map((r, i) => {
                    const m = memberMap[r.memberId];
                    return m ? (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="font-medium text-slate-700 w-32 truncate">{m.name}</span>
                        <span className="text-slate-400 w-24">{r.role}</span>
                        <span className="text-blue-600 font-semibold w-12">{r.fteAllocation} FTE</span>
                        <span className="text-slate-400">{formatDate(r.startDate)} → {formatDate(r.endDate)}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}

          {/* Team */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-blue-500" />
              <span className="text-sm font-semibold text-slate-700">Nhân sự ({project.team?.length || 0} người)</span>
            </div>
            {sponsor && (
              <div className="mb-2 p-2 bg-violet-50 rounded-lg flex items-center justify-between">
                <Avatar initials={sponsor.avatar} name={sponsor.name} />
                <span className="text-xs font-medium text-violet-600 bg-violet-100 px-2 py-0.5 rounded">Exec Sponsor</span>
              </div>
            )}
            {owner && (
              <div className="mb-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                <Avatar initials={owner.avatar} name={owner.name} />
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Project Owner</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {(project.team || []).filter(id => id !== project.owner && id !== project.sponsor).map(mid => {
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
          {project.systems?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Hệ thống liên quan</p>
              <div className="flex flex-wrap gap-1.5">
                {project.systems.map(s => (
                  <span key={s} className="text-xs bg-violet-50 text-violet-600 px-2 py-1 rounded font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies (multi-type) */}
          {(depProjects.length > 0 || depSystems.length > 0 || depExternal.length > 0 || dependants.length > 0) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={16} className="text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Dependencies</span>
              </div>
              <div className="space-y-3">
                {depProjects.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1.5">Project dependencies:</p>
                    <div className="space-y-1.5">
                      {depProjects.map(d => (
                        <div key={d.id} className="flex items-center gap-2 text-sm p-2 bg-orange-50 rounded-lg">
                          <span className="text-xs font-mono text-slate-400">{d.code}</span>
                          <span className="text-slate-700 flex-1">{d.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_CONFIG[d.status]?.color}`}>{d.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {depSystems.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1.5">System dependencies:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {depSystems.map(s => <span key={s} className="text-xs bg-violet-50 text-violet-700 px-2 py-1 rounded border border-violet-200">{s}</span>)}
                    </div>
                  </div>
                )}
                {depExternal.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1.5">External gates:</p>
                    <div className="space-y-1">
                      {depExternal.map((e, i) => <div key={i} className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded border border-amber-200">{e}</div>)}
                    </div>
                  </div>
                )}
                {dependants.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1.5">Projects depending on this:</p>
                    <div className="space-y-1.5">
                      {dependants.map(d => (
                        <div key={d.id} className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded-lg">
                          <span className="text-xs font-mono text-slate-400">{d.code}</span>
                          <span className="text-slate-700 flex-1">{d.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_CONFIG[d.status]?.color}`}>{d.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Milestones */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">
              Milestones ({(project.milestones || []).filter(m => m.done).length}/{(project.milestones || []).length})
            </p>
            <div className="space-y-2">
              {(project.milestones || []).map(m => (
                <div key={m.id} className={`p-3 rounded-lg border ${m.done ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-start gap-3">
                    {m.done
                      ? <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      : <Circle size={16} className="text-slate-300 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${m.done ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>{m.name}</p>
                      {m.deliverable && <p className="text-xs text-slate-400 mt-0.5">{m.deliverable}</p>}
                      <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-slate-400">
                        <span>Baseline: {formatDate(m.baselineDate)}</span>
                        <span>Plan: {formatDate(m.date)}</span>
                        {m.actualDate && <span className="text-emerald-600">Actual: {formatDate(m.actualDate)}</span>}
                        {m.owner && memberMap[m.owner] && <span>Owner: {memberMap[m.owner].name}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issues */}
          {(project.issues || []).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers size={16} className="text-red-500" />
                <span className="text-sm font-semibold text-slate-700">Issues ({openIssues.length} open)</span>
              </div>
              <div className="space-y-2">
                {(project.issues || []).map(iss => (
                  <div key={iss.id} className={`p-3 rounded-lg border-l-4 ${iss.status === 'Closed' ? 'border-slate-300 bg-slate-50 opacity-60' : iss.priority === 'P1' ? 'border-red-400 bg-red-50' : 'border-amber-400 bg-amber-50'}`}>
                    <div className="flex items-start gap-2">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${ISSUE_COLORS[iss.priority] || ''}`}>{iss.priority}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${ISSUE_STATUS[iss.status] || ''}`}>{iss.status}</span>
                      <p className="text-xs text-slate-700 flex-1">{iss.desc}</p>
                    </div>
                    <div className="flex gap-3 mt-1.5 text-xs text-slate-400">
                      {iss.owner && memberMap[iss.owner] && <span>Owner: {memberMap[iss.owner].name}</span>}
                      {iss.dueDate && <span>Due: {formatDate(iss.dueDate)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {openRisks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="text-sm font-semibold text-slate-700">Rủi ro ({openRisks.length} open)</span>
              </div>
              <div className="space-y-2">
                {openRisks.map(r => (
                  <div key={r.id} className={`p-3 rounded-lg border-l-4 ${r.level === 'Cao' ? 'border-red-400 bg-red-50' : r.level === 'Trung bình' ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-slate-50'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-700 flex-1">{r.desc}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded shrink-0 ${r.level === 'Cao' ? 'bg-red-100 text-red-700' : r.level === 'Trung bình' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {r.level}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-1">
                      {r.probability && <span className={`text-xs px-1.5 py-0.5 rounded ${PROB_COLORS[r.probability] || 'bg-slate-100 text-slate-600'}`}>P: {r.probability}</span>}
                      {r.impact && <span className={`text-xs px-1.5 py-0.5 rounded ${PROB_COLORS[r.impact] || 'bg-slate-100 text-slate-600'}`}>I: {r.impact}</span>}
                      {r.owner && memberMap[r.owner] && <span className="text-xs text-slate-400">Owner: {memberMap[r.owner].name}</span>}
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
