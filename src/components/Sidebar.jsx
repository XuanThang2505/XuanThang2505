import { LayoutDashboard, FolderKanban, Users, Network, BarChart3, AlertTriangle, Settings, ChevronLeft } from 'lucide-react';

const NAV = [
  { id: 'dashboard',    label: 'Tổng quan',        icon: LayoutDashboard },
  { id: 'projects',     label: 'Danh sách dự án',  icon: FolderKanban },
  { id: 'gantt',        label: 'Timeline / Gantt',  icon: BarChart3 },
  { id: 'dependencies', label: 'Sơ đồ phụ thuộc',  icon: Network },
  { id: 'resources',    label: 'Nhân sự & Nguồn lực', icon: Users },
  { id: 'risks',        label: 'Rủi ro',            icon: AlertTriangle },
];

export default function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  return (
    <aside
      className={`flex flex-col bg-slate-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} min-h-screen shrink-0`}
    >
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-700 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0 text-sm font-bold">P</div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold text-sm text-white leading-tight">Portfolio Manager</div>
            <div className="text-xs text-slate-400 truncate">25 Dự án trọng điểm</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white shrink-0"
        >
          <ChevronLeft size={16} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            title={collapsed ? label : ''}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${active === id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      <div className="px-2 pb-4">
        <button
          onClick={() => setActive('settings')}
          title={collapsed ? 'Cài đặt' : ''}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span>Cài đặt</span>}
        </button>
      </div>
    </aside>
  );
}
