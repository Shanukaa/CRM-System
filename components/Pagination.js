export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center gap-1 justify-end flex-wrap">
      <button disabled={page === 1} onClick={() => onChange(1)} className="px-2.5 py-1.5 text-sm rounded-xl border border-slate-200 disabled:opacity-40">«</button>
      <button disabled={page === 1} onClick={() => onChange(page - 1)} className="px-3 py-1.5 text-sm rounded-xl border border-slate-200 disabled:opacity-40">Prev</button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1.5 text-sm rounded-xl border ${p === page ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          {p}
        </button>
      ))}
      <button disabled={page === totalPages} onClick={() => onChange(page + 1)} className="px-3 py-1.5 text-sm rounded-xl border border-slate-200 disabled:opacity-40">Next</button>
      <button disabled={page === totalPages} onClick={() => onChange(totalPages)} className="px-2.5 py-1.5 text-sm rounded-xl border border-slate-200 disabled:opacity-40">»</button>
    </div>
  );
}
