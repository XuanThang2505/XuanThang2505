import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG, DEPARTMENTS, SYSTEMS } from '../data/initialData';
import { genId } from '../utils/format';

const DEFAULT_FORM = {
  code: '', name: '', description: '', status: 'Đúng tiến độ', priority: 'Trung bình',
  progress: 0, startDate: '', endDate: '', budget: '', spent: '',
  owner: '', team: [], systems: [], dept: DEPARTMENTS[0],
  dependencies: [], tags: '', risks: [], milestones: [],
};

export default function ProjectForm({ project, projects, members, onSave, onClose }) {
  const isEdit = !!project;
  const [form, setForm] = useState(() => {
    if (!project) return { ...DEFAULT_FORM };
    return {
      ...project,
      budget: String(project.budget),
      spent: String(project.spent),
      tags: project.tags.join(', '),
    };
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggleArr = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = 'Bắt buộc';
    if (!form.name.trim()) e.name = 'Bắt buộc';
    if (!form.startDate) e.startDate = 'Bắt buộc';
    if (!form.endDate) e.endDate = 'Bắt buộc';
    if (form.startDate && form.endDate && form.startDate > form.endDate) e.endDate = 'Phải sau ngày bắt đầu';
    if (form.budget && isNaN(Number(form.budget))) e.budget = 'Phải là số';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const saved = {
      ...form,
      id: project?.id || genId('p'),
      budget: Number(form.budget) || 0,
      spent: Number(form.spent) || 0,
      progress: Number(form.progress) || 0,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    onSave(saved);
  };

  const addMilestone = () => {
    set('milestones', [...form.milestones, { id: genId('ms'), name: '', date: '', done: false }]);
  };
  const updateMilestone = (i, key, val) => {
    const ms = [...form.milestones];
    ms[i] = { ...ms[i], [key]: val };
    set('milestones', ms);
  };
  const removeMilestone = (i) => set('milestones', form.milestones.filter((_, idx) => idx !== i));

  const addRisk = () => {
    set('risks', [...form.risks, { id: genId('r'), desc: '', level: 'Trung bình', mitigation: '' }]);
  };
  const updateRisk = (i, key, val) => {
    const rs = [...form.risks];
    rs[i] = { ...rs[i], [key]: val };
    set('risks', rs);
  };
  const removeRisk = (i) => set('risks', form.risks.filter((_, idx) => idx !== i));

  const Field = ({ label, error, children }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );

  const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  const otherProjects = projects.filter(p => p.id !== project?.id);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-end overflow-hidden">
      <div className="w-full max-w-2xl bg-white h-screen overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-800">{isEdit ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
            <textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Mô tả ngắn về dự án..." />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Trạng thái">
              <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
                {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Ưu tiên">
              <select className={inp} value={form.priority} onChange={e => set('priority', e.target.value)}>
                {Object.keys(PRIORITY_CONFIG).map(p => <option key={p} value={p}>{p}</option>)}
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
            <Field label="Ngân sách (VNĐ)" error={errors.budget}>
              <input className={inp} type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="1000000000" />
            </Field>
            <Field label="Đã chi (VNĐ)">
              <input className={inp} type="number" value={form.spent} onChange={e => set('spent', e.target.value)} placeholder="0" />
            </Field>
          </div>

          <Field label="Project Owner">
            <select className={inp} value={form.owner} onChange={e => set('owner', e.target.value)}>
              <option value="">-- Chọn owner --</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
            </select>
          </Field>

          <Field label="Team (chọn nhiều)">
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-lg">
              {members.map(m => (
                <label key={m.id} className="flex items-center gap-2 text-sm p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.team.includes(m.id)}
                    onChange={() => toggleArr('team', m.id)}
                    className="accent-blue-600"
                  />
                  <span className="text-slate-700">{m.name}</span>
                  <span className="text-xs text-slate-400">{m.role}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Hệ thống liên quan">
            <div className="flex flex-wrap gap-1.5">
              {SYSTEMS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleArr('systems', s)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    form.systems.includes(s)
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Phụ thuộc dự án">
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-lg">
              {otherProjects.map(p => (
                <label key={p.id} className="flex items-center gap-2 text-xs p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.dependencies.includes(p.id)}
                    onChange={() => toggleArr('dependencies', p.id)}
                    className="accent-blue-600"
                  />
                  <span className="font-mono text-slate-400">{p.code}</span>
                  <span className="text-slate-700 truncate">{p.name}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Tags (cách nhau bởi dấu phẩy)">
            <input className={inp} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="ERP, Digital, Cloud" />
          </Field>

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600">Milestones</label>
              <button type="button" onClick={addMilestone} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                <Plus size={12} /> Thêm milestone
              </button>
            </div>
            <div className="space-y-2">
              {form.milestones.map((m, i) => (
                <div key={m.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <input
                    className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
                    placeholder="Tên milestone"
                    value={m.name}
                    onChange={e => updateMilestone(i, 'name', e.target.value)}
                  />
                  <input
                    className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
                    type="date"
                    value={m.date}
                    onChange={e => updateMilestone(i, 'date', e.target.value)}
                  />
                  <label className="flex items-center gap-1 text-xs text-slate-500">
                    <input type="checkbox" checked={m.done} onChange={e => updateMilestone(i, 'done', e.target.checked)} className="accent-emerald-600" />
                    Xong
                  </label>
                  <button type="button" onClick={() => removeMilestone(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Risks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600">Rủi ro</label>
              <button type="button" onClick={addRisk} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium">
                <Plus size={12} /> Thêm rủi ro
              </button>
            </div>
            <div className="space-y-2">
              {form.risks.map((r, i) => (
                <div key={r.id} className="p-3 bg-red-50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none bg-white"
                      placeholder="Mô tả rủi ro"
                      value={r.desc}
                      onChange={e => updateRisk(i, 'desc', e.target.value)}
                    />
                    <select
                      className="border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                      value={r.level}
                      onChange={e => updateRisk(i, 'level', e.target.value)}
                    >
                      <option>Cao</option>
                      <option>Trung bình</option>
                      <option>Thấp</option>
                    </select>
                    <button type="button" onClick={() => removeRisk(i)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none bg-white"
                    placeholder="Biện pháp giảm thiểu..."
                    value={r.mitigation}
                    onChange={e => updateRisk(i, 'mitigation', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-100">
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
