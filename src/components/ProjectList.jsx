import { useState, useMemo } from 'react';
import { Search, Plus, Filter, ChevronUp, ChevronDown, Eye, Edit2, Trash2 } from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG, DEPARTMENTS } from '../data/initialData';
import { formatCurrency, formatDate, daysLeftLabel, calcBudgetPct } from '../utils/format';

function Avatar({ initials, size = 'sm' }) {
  const colors = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-cyan-500'];
  let h = 0; for (const c of initials) h += c.charCodeAt(0);
  const cls = `${size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'} ${colors[h % colors.length]} rounded-full flex items-center justify-center text-white font-semibold shrink-0`;
  return <div className={cls}>{initials.slice(0,2).toUpperCase()}</div>;
}

function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || {};
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function PriBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || {};
  return <span className={`text-xs px-2 py-0.5 rounded font-medium ${cfg.color}`}>{priority}</span>;
}

function ProgressBar({ value }) {
  const color = value >= 75 ? 'bg-emerald-500' : value >= 40 ? 'bg-blue-500' : 'bg-amber-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{value}%</span>
    </div>
  );
}

const SORT_FIELDS = {
  code: 'Mã',
  name: 'Tên',
  status: 'Trạng thái',
  priority: 'Ưu tiên',
  progress: 'Tiến độ',
  endDate: 'Deadline',
  budget: 'Ngân sách',
};

export default function ProjectList({ projects, members, onView, onEdit, onAdd, onDelete }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [sort, setSort] = useState({ field: 'code', dir: 'asc' });
  const [showFilters, setShowFilters] = useState(false);

  const toggleSort = (field) => {
    setSort(s => s.field === field ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'asc' });
  };

  const filtered = useMemo(() => {
    let list = [...projects];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (filterStatus) list = list.filter(p => p.status === filterStatus);
    if (filterPriority) list = list.filter(p => p.priority === filterPriority);
    if (filterDept) list = list.filter(p => p.dept === filterDept);
    list.sort((a, b) => {
      let av = a[sort.field], bv = b[sort.field];
      if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return list;
  }, [projects, search, filterStatus, filterPriority, filterDept, sort]);

  const memberMap = useMemo(() => Object.fromEntries(members.map(m => [m.id, m])), [members]);

  const SortIcon = ({ field }) => {
    if (sort.field !== field) return <ChevronUp size={12} className="opacity-20" />;
    return sort.dir === 'asc' ? <ChevronUp size={12} className="text-blue-500" /> : <ChevronDown size={12} className="text-blue-500" />;
  };

  const Th = ({ field, children, className = '' }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:bg-slate-50 select-none ${className}`}
      onClick={() => toggleSort(field)}
    >
      <div className="flex items-center gap-1">{children}<SortIcon field={field} /></div>
    </th>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Danh sách dự án</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} / {projects.length} dự án</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          Thêm dự án
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mã, tag..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter size={15} />
            Bộ lọc
          </button>
        </div>
        {showFilters && (
          <div className="flex gap-3 flex-wrap">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tất cả trạng thái</option>
              {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tất cả ưu tiên</option>
              {Object.keys(PRIORITY_CONFIG).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tất cả phòng ban</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {(filterStatus || filterPriority || filterDept) && (
              <button onClick={() => { setFilterStatus(''); setFilterPriority(''); setFilterDept(''); }} className="text-sm text-red-500 hover:text-red-700 px-2">
                Xóa lọc
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <Th field="code" className="w-28">Mã</Th>
                <Th field="name">Tên dự án</Th>
                <Th field="status" className="w-36">Trạng thái</Th>
                <Th field="priority" className="w-28">Ưu tiên</Th>
                <Th field="progress" className="w-36">Tiến độ</Th>
                <Th field="endDate" className="w-32">Deadline</Th>
                <Th field="budget" className="w-36">Ngân sách</Th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Team</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => {
                const owner = memberMap[p.owner];
                const budgetPct = calcBudgetPct(p.budget, p.spent);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-medium text-slate-400">{p.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <button
                          onClick={() => onView(p)}
                          className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors text-left"
                        >
                          {p.name}
                        </button>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.tags.slice(0, 3).map(t => (
                            <span key={t} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge status={p.status} /></td>
                    <td className="px-4 py-3"><PriBadge priority={p.priority} /></td>
                    <td className="px-4 py-3"><ProgressBar value={p.progress} /></td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-600">{formatDate(p.endDate)}</div>
                      <div className={`text-xs mt-0.5 ${daysLeftLabel(p.endDate).startsWith('Quá') ? 'text-red-500' : 'text-slate-400'}`}>
                        {daysLeftLabel(p.endDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-slate-700">{formatCurrency(p.budget)}</div>
                      <div className={`text-xs mt-0.5 ${budgetPct > 90 ? 'text-red-500' : 'text-slate-400'}`}>
                        Đã dùng {budgetPct}%
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-2">
                        {p.team.slice(0, 3).map(mid => {
                          const m = memberMap[mid];
                          return m ? <Avatar key={mid} initials={m.avatar} size="sm" /> : null;
                        })}
                        {p.team.length > 3 && (
                          <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium text-slate-600 border-2 border-white">
                            +{p.team.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onView(p)} className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-500 rounded transition-colors" title="Xem chi tiết">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => onEdit(p)} className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-500 rounded transition-colors" title="Chỉnh sửa">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => onDelete(p.id)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors" title="Xóa">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg">Không tìm thấy dự án nào</p>
              <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
