import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG, DEPARTMENTS, SYSTEMS, PROGRAMS, PHASES, MEMBERS } from '../data/initialData';
import { genId } from '../utils/format';

const DEFAULT_FORM = {
  code: '', name: '', description: '',
  status: 'Đúng tiến độ', priority: 'P2 - High',
  phase: 'Planning', program: PROGRAMS[0],
  progress: 0,
  startDate: '', endDate: '',
  baselineStart: '', baselineEnd: '', actualStart: '',
  statusComment: '',
  budget: { approved: '', actual: '', forecast: '', revised: '', currency: 'VND' },
  fte: { approved: '', actual: '', forecast: '' },
  owner: '', sponsor: '', team: [],
  systems: [], dept: DEPARTMENTS[0],
  dependencies: { projects: [], systems: [], external: '' },
  tags: '',
  risks: [], issues: [], milestones: [],
  parentId: null, isProgram: false,
};

function toFormBudget(b) {
  if (!b || typeof b !== 'object') return { approved: String(b || ''), actual: '', forecast: '', revised: '', currency: 'VND' };
  return { approved: String(b.approved || ''), actual: String(b.actual || ''), forecast: String(b.forecast || ''), revised: String(b.revised || ''), currency: b.currency || 'VND' };
}
function toFormFte(f) {
  if (!f || typeof f !== 'object') return { approved: '', actual: '', forecast: '' };
  return { approved: String(f.approved || ''), actual: String(f.actual || ''), forecast: String(f.forecast || '') };
}
function toFormDeps(d) {
  if (!d || typeof d !== 'object') return { projects: Array.isArray(d) ? d : [], systems: [], external: '' };
  return { projects: d.projects || [], systems: d.systems || [], external: (d.external || []).join(', ') };
}

export default function ProjectForm({ project, projects, members, onSave, onClose }) {
  const isEdit = !!project;
  const [form, setForm] = useState(() => {
    if (!project) return { ...DEFAULT_FORM };
    return {
      ...project,
      budget: toFormBudget(project.budget),
      fte: toFormFte(project.fte),
      dependencies: toFormDeps(project.dependencies),
      tags: (project.tags || []).join(', '),
    };
  });
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState('basic');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setBgt = (key, val) => setForm(f => ({ ...f, budget: { ...f.budget, [key]: val } }));
  const setFte = (key, val) => setForm(f => ({ ...f, fte: { ...f.fte, [key]: val } }));
  const setDep = (key, val) => setForm(f => ({ ...f, dependencies: { ...f.dependencies, [key]: val } }));

  const toggleArr = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }));
  };
  const toggleDepProjects = (id) => {
    setForm(f => ({
      ...f,
      dependencies: {
        ...f.dependencies,
        projects: f.dependencies.projects.includes(id)
          ? f.dependencies.projects.filter(x => x !== id)
          : [...f.dependencies.projects, id],
      },
    }));
  };
  const toggleDepSystems = (s) => {
    setForm(f => ({
      ...f,
      dependencies: {
        ...f.dependencies,
        systems: f.dependencies.systems.includes(s)
          ? f.dependencies.systems.filter(x => x !== s)
          : [...f.dependencies.systems, s],
      },
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = 'Bắt buộc';
    if (!form.name.trim()) e.name = 'Bắt buộc';
    if (!form.startDate) e.startDate = 'Bắt buộc';
    if (!form.endDate) e.endDate = 'Bắt buộc';
    if (form.startDate && form.endDate && form.startDate > form.endDate) e.endDate = 'Phải sau ngày bắt đầu';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const saved = {
      ...form,
      id: project?.id || genId('p'),
      progress: Number(form.progress) || 0,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      budget: {
        approved: Number(form.budget.approved) || 0,
        actual: Number(form.budget.actual) || 0,
        forecast: Number(form.budget.forecast) || 0,
        revised: form.budget.revised ? Number(form.budget.revised) : null,
        currency: form.budget.currency || 'VND',
      },
      fte: {
        approved: Number(form.fte.approved) || 0,
        actual: Number(form.fte.actual) || 0,
        forecast: Number(form.fte.forecast) || 0,
      },
      dependencies: {
        projects: form.dependencies.projects,
        systems: form.dependencies.systems,
        milestones: form.dependencies.milestones || [],
        external: form.dependencies.external.split(',').map(s => s.trim()).filter(Boolean),
      },
      resources: project?.resources || [],
      kpi: project?.kpi || null,
    };
    onSave(saved);
  };

  const addMilestone = () => set('milestones', [...form.milestones, { id: genId('ms'), name: '', date: '', baselineDate: '', done: false, owner: '', deliverable: '' }]);
  const updMs = (i, key, val) => { const a = [...form.milestones]; a[i] = { ...a[i], [key]: val }; set('milestones', a); };
  const delMs = (i) => set('milestones', form.milestones.filter((_, idx) => idx !== i));

  const addRisk = () => set('risks', [...form.risks, { id: genId('r'), desc: '', level: 'Trung bình', probability: 'Medium', impact: 'Medium', mitigation: '', owner: '', status: 'Open' }]);
  const updRisk = (i, key, val) => { const a = [...form.risks]; a[i] = { ...a[i], [key]: val }; set('risks', a); };
  const delRisk = (i) => set('risks', form.risks.filter((_, idx) => idx !== i));

  const addIssue = () => set('issues', [...(form.issues || []), { id: genId('iss'), desc: '', priority: 'P2', status: 'Open', owner: '', raisedDate: new Date().toISOString().slice(0,10), dueDate: '' }]);
  const updIssue = (i, key, val) => { const a = [...(form.issues || [])]; a[i] = { ...a[i], [key]: val }; set('issues', a); };
  const delIssue = (i) => set('issues', (form.issues || []).filter((_, idx) => idx !== i));

  const Field = ({ label, error, children }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );

  const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const otherProjects = projects.filter(p => p.id !== project?.id);

  const TABS = [
    { key: 'basic', label: 'Thông tin' },
    { key: 'budget', label: 'Budget / FTE' },
    { key: 'team', label: 'Team' },
    { key: 'deps', label: 'Dependencies' },
    { key: 'milestones', label: 'Milestones' },
    { key: 'risks', label: 'Risks / Issues' },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-end overflow-hidden">
      <div className="w-full max-w-2xl bg-white h-screen overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">{isEdit ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="sticky top-[65px] bg-white border-b border-slate-100 px-6 z-10 shrink-0">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  tab === t.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">

            {/* === BASIC === */}
            {tab === 'basic' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Mã dự án *" error={errors.code}>
                    <input className={inp} value={form.code} onChange={e => set('code', e.target.value)} placeholder="PRJ-026" />
                  </Field>
                  <Field label="Phòng ban">
                    <select className={inp} value={form.dept} onChange={e => set('dept', e.target.value)}>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Tên dự án *" error={errors.name}>
                  <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nhập tên dự án..." />
                </Field>

                <Field label="Mô tả">
                  <textarea className={`${inp} resize-none`} rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Mô tả ngắn về dự án..." />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Program">
                    <select className={inp} value={form.program} onChange={e => set('program', e.target.value)}>
                      {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                  <Field label="Phase">
                    <select className={inp} value={form.phase} onChange={e => set('phase', e.target.value)}>
                      {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Trạng thái">
                    <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
                      {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Ưu tiên">
                    <select className={inp} value={form.priority} onChange={e => set('priority', e.target.value)}>
                      {['P1 - Critical','P2 - High','P3 - Medium','P4 - Low'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Field label="Bắt đầu *" error={errors.startDate}>
                    <input className={inp} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
                  </Field>
                  <Field label="Kết thúc *" error={errors.endDate}>
                    <input className={inp} type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
                  </Field>
                  <Field label="Tiến độ (%)">
                    <input className={inp} type="number" min="0" max="100" value={form.progress} onChange={e => set('progress', e.target.value)} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Baseline Start">
                    <input className={inp} type="date" value={form.baselineStart || form.startDate} onChange={e => set('baselineStart', e.target.value)} />
                  </Field>
                  <Field label="Baseline End">
                    <input className={inp} type="date" value={form.baselineEnd || form.endDate} onChange={e => set('baselineEnd', e.target.value)} />
                  </Field>
                </div>

                <Field label="Status Comment (update tuần này)">
                  <textarea className={`${inp} resize-none`} rows={2} value={form.statusComment || ''} onChange={e => set('statusComment', e.target.value)} placeholder="Narrative update cho steering committee..." />
                </Field>

                <Field label="Tags (cách nhau bởi dấu phẩy)">
                  <input className={inp} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="ERP, Digital, Cloud" />
                </Field>

                <Field label="Hệ thống liên quan">
                  <div className="flex flex-wrap gap-1.5">
                    {SYSTEMS.map(s => (
                      <button key={s} type="button" onClick={() => toggleArr('systems', s)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${form.systems.includes(s) ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </Field>
              </>
            )}

            {/* === BUDGET / FTE === */}
            {tab === 'budget' && (
              <>
                <div className="bg-amber-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Budget (Cost Approved Model)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Cost Approved (VND)">
                      <input className={inp} type="number" value={form.budget.approved} onChange={e => setBgt('approved', e.target.value)} placeholder="2500000000" />
                    </Field>
                    <Field label="Actual Spend YTD (VND)">
                      <input className={inp} type="number" value={form.budget.actual} onChange={e => setBgt('actual', e.target.value)} placeholder="1200000000" />
                    </Field>
                    <Field label="Forecast EAC (VND)">
                      <input className={inp} type="number" value={form.budget.forecast} onChange={e => setBgt('forecast', e.target.value)} placeholder="2550000000" />
                    </Field>
                    <Field label="Revised Budget (nếu có)">
                      <input className={inp} type="number" value={form.budget.revised || ''} onChange={e => setBgt('revised', e.target.value)} placeholder="Để trống nếu không có" />
                    </Field>
                  </div>
                </div>

                <div className="bg-cyan-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">FTE Headcount</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="FTE Approved">
                      <input className={inp} type="number" step="0.5" value={form.fte.approved} onChange={e => setFte('approved', e.target.value)} placeholder="8.0" />
                    </Field>
                    <Field label="FTE Actual">
                      <input className={inp} type="number" step="0.5" value={form.fte.actual} onChange={e => setFte('actual', e.target.value)} placeholder="6.5" />
                    </Field>
                    <Field label="FTE Forecast">
                      <input className={inp} type="number" step="0.5" value={form.fte.forecast} onChange={e => setFte('forecast', e.target.value)} placeholder="7.0" />
                    </Field>
                  </div>
                </div>
              </>
            )}

            {/* === TEAM === */}
            {tab === 'team' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Exec Sponsor">
                    <select className={inp} value={form.sponsor || ''} onChange={e => set('sponsor', e.target.value)}>
                      <option value="">-- Chọn sponsor --</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                    </select>
                  </Field>
                  <Field label="Project Owner / PM">
                    <select className={inp} value={form.owner} onChange={e => set('owner', e.target.value)}>
                      <option value="">-- Chọn PM --</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Team Members">
                  <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto p-2 border border-slate-200 rounded-lg">
                    {members.map(m => (
                      <label key={m.id} className="flex items-center gap-2 text-sm p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                        <input type="checkbox" checked={(form.team || []).includes(m.id)} onChange={() => toggleArr('team', m.id)} className="accent-blue-600" />
                        <span className="text-slate-700">{m.name}</span>
                        <span className="text-xs text-slate-400">{m.role}</span>
                      </label>
                    ))}
                  </div>
                </Field>
              </>
            )}

            {/* === DEPENDENCIES === */}
            {tab === 'deps' && (
              <>
                <Field label="Project Dependencies (dự án phụ thuộc)">
                  <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg">
                    {otherProjects.map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-xs p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                        <input type="checkbox" checked={(form.dependencies.projects || []).includes(p.id)} onChange={() => toggleDepProjects(p.id)} className="accent-blue-600" />
                        <span className="font-mono text-slate-400">{p.code}</span>
                        <span className="text-slate-700 truncate">{p.name}</span>
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="System Dependencies">
                  <div className="flex flex-wrap gap-1.5">
                    {SYSTEMS.map(s => (
                      <button key={s} type="button" onClick={() => toggleDepSystems(s)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${(form.dependencies.systems || []).includes(s) ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="External Gates / Điều kiện ngoài (cách nhau bởi dấu phẩy)">
                  <input className={inp} value={form.dependencies.external || ''} onChange={e => setDep('external', e.target.value)} placeholder="Vendor contract sign, Board approval" />
                </Field>
              </>
            )}

            {/* === MILESTONES === */}
            {tab === 'milestones' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-600">Milestones ({form.milestones.length})</p>
                  <button type="button" onClick={addMilestone} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    <Plus size={12} /> Thêm milestone
                  </button>
                </div>
                <div className="space-y-3">
                  {form.milestones.map((m, i) => (
                    <div key={m.id} className="p-3 bg-slate-50 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <input className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none bg-white"
                          placeholder="Tên milestone" value={m.name} onChange={e => updMs(i, 'name', e.target.value)} />
                        <button type="button" onClick={() => delMs(i)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={14} /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Baseline Date</p>
                          <input className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none bg-white" type="date"
                            value={m.baselineDate || ''} onChange={e => updMs(i, 'baselineDate', e.target.value)} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Planned Date</p>
                          <input className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none bg-white" type="date"
                            value={m.date} onChange={e => updMs(i, 'date', e.target.value)} />
                        </div>
                      </div>
                      <input className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none bg-white"
                        placeholder="Deliverable / Sign-off" value={m.deliverable || ''} onChange={e => updMs(i, 'deliverable', e.target.value)} />
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 text-xs text-slate-500">
                          <input type="checkbox" checked={m.done} onChange={e => updMs(i, 'done', e.target.checked)} className="accent-emerald-600" />
                          Done
                        </label>
                        <select className="border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                          value={m.owner || ''} onChange={e => updMs(i, 'owner', e.target.value)}>
                          <option value="">Owner</option>
                          {members.map(mem => <option key={mem.id} value={mem.id}>{mem.name}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* === RISKS / ISSUES === */}
            {tab === 'risks' && (
              <>
                {/* Risks */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-600">Rủi ro ({form.risks.length})</p>
                    <button type="button" onClick={addRisk} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium">
                      <Plus size={12} /> Thêm rủi ro
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.risks.map((r, i) => (
                      <div key={r.id} className="p-3 bg-red-50 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <input className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none bg-white"
                            placeholder="Mô tả rủi ro" value={r.desc} onChange={e => updRisk(i, 'desc', e.target.value)} />
                          <button type="button" onClick={() => delRisk(i)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={14} /></button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <select className="border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                            value={r.probability || 'Medium'} onChange={e => updRisk(i, 'probability', e.target.value)}>
                            <option value="High">Prob: High</option>
                            <option value="Medium">Prob: Medium</option>
                            <option value="Low">Prob: Low</option>
                          </select>
                          <select className="border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                            value={r.impact || 'Medium'} onChange={e => updRisk(i, 'impact', e.target.value)}>
                            <option value="High">Impact: High</option>
                            <option value="Medium">Impact: Medium</option>
                            <option value="Low">Impact: Low</option>
                          </select>
                          <select className="border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                            value={r.status || 'Open'} onChange={e => updRisk(i, 'status', e.target.value)}>
                            <option>Open</option>
                            <option>Closed</option>
                          </select>
                        </div>
                        <input className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none bg-white"
                          placeholder="Biện pháp giảm thiểu..." value={r.mitigation} onChange={e => updRisk(i, 'mitigation', e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Issues */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-600">Issues ({(form.issues || []).length})</p>
                    <button type="button" onClick={addIssue} className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium">
                      <Plus size={12} /> Thêm issue
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(form.issues || []).map((iss, i) => (
                      <div key={iss.id} className="p-3 bg-amber-50 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <input className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none bg-white"
                            placeholder="Mô tả issue" value={iss.desc} onChange={e => updIssue(i, 'desc', e.target.value)} />
                          <button type="button" onClick={() => delIssue(i)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={14} /></button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <select className="border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                            value={iss.priority || 'P2'} onChange={e => updIssue(i, 'priority', e.target.value)}>
                            <option>P1</option><option>P2</option><option>P3</option>
                          </select>
                          <select className="border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                            value={iss.status || 'Open'} onChange={e => updIssue(i, 'status', e.target.value)}>
                            <option>Open</option><option>In Progress</option><option>Closed</option>
                          </select>
                          <input className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none bg-white"
                            type="date" placeholder="Due date" value={iss.dueDate || ''} onChange={e => updIssue(i, 'dueDate', e.target.value)} />
                        </div>
                        <select className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                          value={iss.owner || ''} onChange={e => updIssue(i, 'owner', e.target.value)}>
                          <option value="">Owner</option>
                          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              Hủy
            </button>
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              {isEdit ? 'Lưu thay đổi' : 'Tạo dự án'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
