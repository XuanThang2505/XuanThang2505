export function formatCurrency(value) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} triệu`;
  return value.toLocaleString('vi-VN') + ' đ';
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function daysLeft(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff;
}

export function daysLeftLabel(endDate) {
  const d = daysLeft(endDate);
  if (d < 0) return `Quá hạn ${Math.abs(d)} ngày`;
  if (d === 0) return 'Hết hạn hôm nay';
  return `Còn ${d} ngày`;
}

export function calcBudgetPct(budget, spent) {
  if (!budget) return 0;
  return Math.round((spent / budget) * 100);
}

export function genId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function avatarColors(initials) {
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
  ];
  let h = 0;
  for (const c of initials) h += c.charCodeAt(0);
  return colors[h % colors.length];
}
