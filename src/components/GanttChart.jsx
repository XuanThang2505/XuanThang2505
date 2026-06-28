import { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { STATUS_CONFIG } from '../data/initialData';
import { formatDate } from '../utils/format';

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const MONTH_NAMES = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

const STATUS_BAR_COLORS = {
  'Đúng tiến độ': '#10b981',
  'Chậm tiến độ': '#f59e0b',
  'Nguy hiểm':    '#ef4444',
  'Hoàn thành':   '#3b82f6',
  'Tạm dừng':     '#94a3b8',
};

export default function GanttChart({ projects, onView }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonths, setViewMonths] = useState(6);
  const [startMonth, setStartMonth] = useState(Math.max(0, today.getMonth() - 1));
  const [filterStatus, setFilterStatus] = useState('');

  const visibleMonths = useMemo(() => {
    const months = [];
    for (let i = 0; i < viewMonths; i++) {
      let m = startMonth + i;
      let y = viewYear;
      if (m >= 12) { m -= 12; y++; }
      months.push({ m, y });
    }
    return months;
  }, [startMonth, viewYear, viewMonths]);

  const rangeStart = new Date(visibleMonths[0].y, visibleMonths[0].m, 1);
  const lastM = visibleMonths[visibleMonths.length - 1];
  const rangeEnd = new Date(lastM.y, lastM.m + 1, 0);
  const rangeDays = (rangeEnd - rangeStart) / 86400000 + 1;

  const filtered = filterStatus ? projects.filter(p => p.status === filterStatus) : projects;

  function getBar(project) {
    const s = new Date(project.startDate);
    const e = new Date(project.endDate);
    if (e < rangeStart || s > rangeEnd) return null;
    const clampedS = s < rangeStart ? rangeStart : s;
    const clampedE = e > rangeEnd ? rangeEnd : e;
    const left = ((clampedS - rangeStart) / 86400000) / rangeDays * 100;
    const width = ((clampedE - clampedS) / 86400000 + 1) / rangeDays * 100;
    return { left: `${Math.max(0, left)}%`, width: `${Math.max(0.5, width)}%` };
  }

  function getMilestones(project) {
    return project.milestones
      .map(m => {
        const d = new Date(m.date);
        if (d < rangeStart || d > rangeEnd) return null;
        const left = ((d - rangeStart) / 86400000) / rangeDays * 100;
        return { ...m, left: `${left}%` };
      })
      .filter(Boolean);
  }

  const todayLeft = ((today - rangeStart) / 86400000) / rangeDays * 100;
  const showToday = todayLeft >= 0 && todayLeft <= 100;

  function monthWidth(m, y) {
    const days = new Date(y, m + 1, 0).getDate();
    return `${days / rangeDays * 100}%`;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Timeline / Gantt</h1>
          <p className="text-sm text-slate-500 mt-1">Tiến độ theo thời gian</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={viewMonths}
            onChange={e => setViewMonths(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 focus:outline-none"
          >
            <option value={3}>3 tháng</option>
            <option value={6}>6 tháng</option>
            <option value={12}>12 tháng</option>
          </select>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { let m = startMonth - 1; let y = viewYear; if (m < 0) { m = 11; y--; } setStartMonth(m); setViewYear(y); }}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-slate-600 w-32 text-center">
              {MONTH_NAMES[visibleMonths[0].m]} {visibleMonths[0].y}
            </span>
            <button
              onClick={() => { let m = startMonth + 1; let y = viewYear; if (m >= 12) { m = 0; y++; } setStartMonth(m); setViewYear(y); }}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: '800px' }}>
            {/* Month header */}
            <div className="flex border-b border-slate-200">
              <div className="w-72 shrink-0 px-4 py-2 text-xs font-semibold text-slate-500 uppercase border-r border-slate-200 bg-slate-50">
                Dự án
              </div>
              <div className="flex-1 relative">
                <div className="flex">
                  {visibleMonths.map(({ m, y }) => (
                    <div
                      key={`${y}-${m}`}
                      className="text-center text-xs font-semibold text-slate-500 py-2 border-r border-slate-100 bg-slate-50"
                      style={{ width: monthWidth(m, y) }}
                    >
                      {MONTHS[m]} {y !== viewYear ? `'${String(y).slice(2)}` : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rows */}
            {filtered.map((p, idx) => {
              const bar = getBar(p);
              const milestones = getMilestones(p);
              const color = STATUS_BAR_COLORS[p.status] || '#94a3b8';
              return (
                <div
                  key={p.id}
                  className={`flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                  style={{ minHeight: '44px' }}
                >
                  <div className="w-72 shrink-0 flex items-center gap-2 px-4 py-2 border-r border-slate-100">
                    <button onClick={() => onView(p)} className="text-left min-w-0">
                      <span className="text-xs font-mono text-slate-400 block">{p.code}</span>
                      <span className="text-xs font-semibold text-slate-700 hover:text-blue-600 leading-tight line-clamp-2">{p.name}</span>
                    </button>
                  </div>
                  <div className="flex-1 relative py-2">
                    {/* Month grid lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {visibleMonths.map(({ m, y }) => (
                        <div key={`${y}-${m}`} className="border-r border-slate-100 h-full" style={{ width: monthWidth(m, y) }} />
                      ))}
                    </div>
                    {/* Today line */}
                    {showToday && (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-red-400 z-10 pointer-events-none"
                        style={{ left: `${todayLeft}%` }}
                      />
                    )}
                    {/* Bar */}
                    {bar && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-5 rounded-full opacity-90 cursor-pointer hover:opacity-100 transition-opacity"
                        style={{ left: bar.left, width: bar.width, background: color }}
                        onClick={() => onView(p)}
                        title={`${p.name}: ${formatDate(p.startDate)} → ${formatDate(p.endDate)}`}
                      >
                        {/* Progress fill */}
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${p.progress}%`, background: 'rgba(255,255,255,0.35)' }}
                        />
                      </div>
                    )}
                    {/* Milestones diamonds */}
                    {milestones.map(m => (
                      <div
                        key={m.id}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 cursor-pointer"
                        style={{ left: m.left }}
                        title={`${m.name}: ${formatDate(m.date)}`}
                      >
                        <div
                          className={`w-3 h-3 rotate-45 border-2 ${m.done ? 'bg-emerald-500 border-emerald-600' : 'bg-white border-slate-400'}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center gap-6 flex-wrap text-xs text-slate-500">
          <div className="flex items-center gap-2 font-medium text-slate-600">Chú thích:</div>
          {Object.entries(STATUS_BAR_COLORS).map(([s, c]) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-8 h-3 rounded-full" style={{ background: c }} />
              <span>{s}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rotate-45 border-2 bg-white border-slate-400" />
            <span>Milestone chưa xong</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rotate-45 border-2 bg-emerald-500 border-emerald-600" />
            <span>Milestone hoàn thành</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-px h-4 bg-red-400" />
            <span>Hôm nay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
