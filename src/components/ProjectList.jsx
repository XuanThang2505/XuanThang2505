import { useState, useMemo } from 'react';
import { Search, Plus, Filter, ChevronUp, ChevronDown, Eye, Edit2, Trash2, X } from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG, DEPARTMENTS } from '../data/initialData';
import { formatCurrency, formatDate, daysLeftLabel, calcBudgetPct } from '../utils/format';

function Avatar({ initials }) {
  const colors = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-cyan-500'];
  let h = 0; for (const c of initials) h += c.charCodeAt(0);
  return (
    <div className={`w-7 h-7 text-xs ${colors[h % colors.length]} rounded-full flex items-center justify-center text-white font-semibold shrink-0 border-2 border-white`}>
      {initials.slice(0,2).toUpperCase()}
    </div>
  );
}

function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || {};
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cfg.color}`}>
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

function DeleteConfirm({ projectName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Xóa dự án?</p>
            <p className="text-sm text-slate-500 mt-0.5">Hành động này không thể hoàn tác.</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg px-4 py-2.5 mb-5">
          <p className="text-sm font-medium text-slate-700">{projectName}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Xóa dự án
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectList({ projects, members, onView, onEdit, onAdd, onDelete }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [sort, setSort] = useState({ field: 'code', dir: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }

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
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
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
      className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:bg-slate-100 select-none ${className}`}
      onClick={() => toggleSort(field)}
    >
      <div className="flex items-center gap-1">{children}<SortIcon field={field} /></div>
    </th>
  );

  const handleDeleteClick = (p) => setConfirmDelete({ id: p.id, name: p.name });
  const handleDeleteConfirm = () => {
    onDelete(confirmDelete.id);
    setConfirmDelete(null);
  };

  const activeFilterCount = [filterStatus, filterPriority, filterDept].filter(Boolean).length;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Danh sách dự án</h1>
          <p className="text-sm text-slate-500 mt-1">
            Hiển thị <span className="font-semibold text-slate-700">{filtered.length}</span> / {projects.length} dự án
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} />
          Thêm dự án mới
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã dự án, tag..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors relative ${
              showFilters || activeFilterCount > 0
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={15} />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-3 flex-wrap items-center pt-1 border-t border-slate-100">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Tất cả trạng thái</option>
              {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Tất cả ưu tiên</option>
              {Object.keys(PRIORITY_CONFIG).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Tất cả phòng ban</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setFilterStatus(''); setFilterPriority(''); setFilterDept(''); }}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium px-2"
              >
                <X size={13} /> Xóa bộ lọc
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide w-12">No.</th>
                <Th field="code" className="w-28">Mã</Th>
                <Th field="name">Tên dự án</Th>
                <Th field="status" className="w-40">Trạng thái</Th>
                <Th field="priority" className="w-28">Ưu tiên</Th>
                <Th field="progress" className="w-36">Tiến độ</Th>
                <Th field="endDate" className="w-32">Deadline</Th>
                <Th field="budget" className="w-36">Ngân sách</Th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Team</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p, index) => {
                const budgetPct = calcBudgetPct(p.budget, p.spent);
                return (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                    {/* STT */}
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 w-6 h-6 rounded-full inline-flex items-center justify-center">
                        {index + 1}
                      </span>
                    </td>
                    {/* Code */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{p.code}</span>
                    </td>
                    {/* Name */}
                    <td className="px-4 py-3 max-w-[280px]">
                      <button
                        onClick={() => onView(p)}
                        className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors text-left leading-snug"
                      >
                        {p.name}
                      </button>
                      {p.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{t}</span>
                          ))}
                          {p.tags.length > 2 && (
                            <span className="text-xs text-slate-400">+{p.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3"><Badge status={p.status} /></td>
                    {/* Priority */}
                    <td className="px-4 py-3"><PriBadge priority={p.priority} /></td>
                    {/* Progress */}
                    <td className="px-4 py-3"><ProgressBar value={p.progress} /></td>
                    {/* Deadline */}
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-600">{formatDate(p.endDate)}</div>
                      <div className={`text-xs mt-0.5 ${daysLeftLabel(p.endDate).startsWith('Quá') ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                        {daysLeftLabel(p.endDate)}
                      </div>
                    </td>
                    {/* Budget */}
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-slate-700">{formatCurrency(p.budget)}</div>
                      <div className={`text-xs mt-0.5 ${budgetPct > 90 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                        Đã dùng {budgetPct}%
                      </div>
                    </td>
                    {/* Team */}
                    <td className="px-4 py-3">
                      <div className="flex -space-x-2">
                        {p.team?.slice(0, 3).map(mid => {
                          const m = memberMap[mid];
                          return m ? <Avatar key={mid} initials={m.avatar} /> : null;
                        })}
                        {(p.team?.length || 0) > 3 && (
                          <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-xs font-semibold text-slate-600 border-2 border-white">
                            +{p.team.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onView(p)}
                          className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={13} />
                          Xem
                        </button>
                        <button
                          onClick={() => onEdit(p)}
                          className="flex items-center gap-1 px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg text-xs font-medium transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={13} />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(p)}
                          className="flex items-center gap-1 px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors"
                          title="Xóa dự án"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-slate-300" />
              </div>
              <p className="text-base font-medium text-slate-500">Không tìm thấy dự án nào</p>
              <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setFilterStatus(''); setFilterPriority(''); setFilterDept(''); setSearch(''); }}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-400">
            <span>Tổng <span className="font-semibold text-slate-600">{filtered.length}</span> dự án{filtered.length < projects.length ? ` (đang lọc từ ${projects.length})` : ''}</span>
            <button onClick={onAdd} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
              <Plus size={12} /> Thêm dự án mới
            </button>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <DeleteConfirm
          projectName={confirmDelete.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
