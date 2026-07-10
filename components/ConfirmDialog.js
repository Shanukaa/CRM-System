'use client';

export default function ConfirmDialog({ title, message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-rose-600 text-white rounded-xl hover:bg-rose-700">Delete</button>
        </div>
      </div>
    </div>
  );
}
