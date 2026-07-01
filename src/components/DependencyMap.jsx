import { useMemo, useRef, useEffect, useState } from 'react';
import { STATUS_CONFIG } from '../data/initialData';

const STATUS_COLORS = {
  'Đúng tiến độ': '#10b981',
  'Chậm tiến độ': '#f59e0b',
  'Nguy hiểm':    '#ef4444',
  'Hoàn thành':   '#3b82f6',
  'Tạm dừng':     '#94a3b8',
};

const NODE_W = 160;
const NODE_H = 56;
const H_GAP = 60;
const V_GAP = 30;

function buildLevels(projects) {
  const depMap = Object.fromEntries(projects.map(p => [p.id, p.dependencies?.projects || []]));
  const levels = {};
  const visited = new Set();

  function getLevel(id) {
    if (levels[id] !== undefined) return levels[id];
    if (visited.has(id)) return 0;
    visited.add(id);
    const deps = depMap[id] || [];
    if (deps.length === 0) { levels[id] = 0; return 0; }
    const l = Math.max(...deps.map(d => getLevel(d))) + 1;
    levels[id] = l;
    return l;
  }

  projects.forEach(p => getLevel(p.id));
  return levels;
}

export default function DependencyMap({ projects, onView }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const svgRef = useRef();

  const { nodes, edges, svgW, svgH } = useMemo(() => {
    const levels = buildLevels(projects);
    const maxLevel = Math.max(...Object.values(levels), 0);

    const byLevel = {};
    projects.forEach(p => {
      const l = levels[p.id] ?? 0;
      if (!byLevel[l]) byLevel[l] = [];
      byLevel[l].push(p);
    });

    const nodes = {};
    let totalH = 0;
    Object.entries(byLevel).forEach(([lStr, ps]) => {
      const l = Number(lStr);
      const colH = ps.length * (NODE_H + V_GAP) - V_GAP;
      if (colH > totalH) totalH = colH;
      ps.forEach((p, i) => {
        nodes[p.id] = {
          x: l * (NODE_W + H_GAP),
          y: i * (NODE_H + V_GAP),
          ...p,
        };
      });
    });

    const edges = [];
    projects.forEach(p => {
      (p.dependencies?.projects || []).forEach(depId => {
        if (nodes[depId] && nodes[p.id]) {
          edges.push({ from: depId, to: p.id });
        }
      });
    });

    const svgW = (maxLevel + 1) * (NODE_W + H_GAP) + 40;
    const svgH = totalH + 80;
    return { nodes, edges, svgW, svgH };
  }, [projects]);

  function isRelated(id) {
    if (!selected && !hovered) return true;
    const focus = selected || hovered;
    if (id === focus) return true;
    const p = projects.find(x => x.id === focus);
    if (!p) return false;
    if ((p.dependencies?.projects || []).includes(id)) return true;
    if ((projects.find(x => x.id === id)?.dependencies?.projects || []).includes(focus)) return true;
    return false;
  }

  function getEdgeColor(edge) {
    const focus = selected || hovered;
    if (!focus) return '#cbd5e1';
    if (edge.from === focus || edge.to === focus) return '#3b82f6';
    return '#e2e8f0';
  }

  function handleMouseDown(e) {
    if (e.button !== 0) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }
  function handleMouseMove(e) {
    if (!dragging || !dragStart) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }
  function handleMouseUp() { setDragging(false); }

  const active = selected || hovered;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sơ đồ phụ thuộc</h1>
          <p className="text-sm text-slate-500 mt-1">Click vào node để xem, kéo để di chuyển bản đồ</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-1.5"><div className="w-8 h-1.5 bg-blue-500 rounded" /> Phụ thuộc</div>
          <button onClick={() => { setSelected(null); setPan({ x: 40, y: 40 }); }} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs">Reset</button>
        </div>
      </div>

      {active && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
          Đang xem: <strong>{projects.find(p => p.id === active)?.name}</strong> — Nhấn vào vùng trống để bỏ chọn
        </div>
      )}

      <div
        className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
        style={{ height: '600px', cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => { if (e.target === e.currentTarget || e.target.tagName === 'svg') setSelected(null); }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ display: 'block' }}
        >
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
            </marker>
            <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#3b82f6" />
            </marker>
          </defs>
          <g transform={`translate(${pan.x}, ${pan.y})`}>
            {/* Edges */}
            {edges.map((edge, i) => {
              const from = nodes[edge.from];
              const to = nodes[edge.to];
              if (!from || !to) return null;
              const x1 = from.x + NODE_W;
              const y1 = from.y + NODE_H / 2;
              const x2 = to.x;
              const y2 = to.y + NODE_H / 2;
              const mx = (x1 + x2) / 2;
              const color = getEdgeColor(edge);
              const isHighlit = color === '#3b82f6';
              return (
                <path
                  key={i}
                  d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={isHighlit ? 2.5 : 1.5}
                  strokeDasharray={isHighlit ? '' : ''}
                  opacity={active && !isHighlit ? 0.2 : 1}
                  markerEnd={isHighlit ? 'url(#arrow-blue)' : 'url(#arrow)'}
                />
              );
            })}

            {/* Nodes */}
            {Object.values(nodes).map(node => {
              const related = isRelated(node.id);
              const isActive = node.id === active;
              const color = STATUS_COLORS[node.status] || '#94a3b8';
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{ cursor: 'pointer', opacity: active && !related ? 0.2 : 1 }}
                  onClick={(e) => { e.stopPropagation(); setSelected(node.id === selected ? null : node.id); }}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                  onDoubleClick={(e) => { e.stopPropagation(); onView(projects.find(p => p.id === node.id)); }}
                >
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={8}
                    fill="white"
                    stroke={isActive ? '#3b82f6' : color}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    filter={isActive ? 'drop-shadow(0 4px 12px rgba(59,130,246,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))'}
                  />
                  <rect width={4} height={NODE_H} rx={2} fill={color} />
                  <text x={14} y={18} fontSize={9} fill="#94a3b8" fontFamily="monospace">{node.code}</text>
                  <foreignObject x={12} y={20} width={NODE_W - 20} height={28}>
                    <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {node.name}
                    </div>
                  </foreignObject>
                  {/* Progress bar */}
                  <rect x={12} y={NODE_H - 8} width={NODE_W - 24} height={3} rx={1.5} fill="#f1f5f9" />
                  <rect x={12} y={NODE_H - 8} width={(NODE_W - 24) * node.progress / 100} height={3} rx={1.5} fill={color} />
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
            {s}
          </div>
        ))}
        <span className="text-slate-400 ml-2">• Double-click để xem chi tiết dự án</span>
      </div>
    </div>
  );
}
