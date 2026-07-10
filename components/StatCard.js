const ACCENTS = {
  indigo: { badge: 'bg-brand-50 text-brand-600', pill: 'bg-brand-50 text-brand-600' },
  green: { badge: 'bg-emerald-50 text-emerald-600', pill: 'bg-emerald-50 text-emerald-600' },
  red: { badge: 'bg-rose-50 text-rose-600', pill: 'bg-rose-50 text-rose-600' },
  amber: { badge: 'bg-amber-50 text-amber-600', pill: 'bg-amber-50 text-amber-600' },
};

export default function StatCard({ label, value, sub, accent = 'indigo', icon: Icon }) {
  const colors = ACCENTS[accent] || ACCENTS.indigo;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 transition-all hover:shadow-card hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1 tracking-tight">{value}</p>
        </div>
        {Icon && (
          <span className={`flex items-center justify-center w-10 h-10 rounded-xl ${colors.badge}`}>
            <Icon size={18} />
          </span>
        )}
      </div>
      {sub && <p className={`text-xs mt-3 inline-block px-2 py-0.5 rounded-full ${colors.pill}`}>{sub}</p>}
    </div>
  );
}
